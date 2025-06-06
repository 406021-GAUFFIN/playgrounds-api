import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { Space } from './entities/space.entity';
import { UpdateSpaceDto } from './dto/update-space.dto';
import { User } from '../users/entities/user.entity';
import { SportsService } from '../sports/sports.service';
import { Role } from '../../common/enum/role.enum';
import { CreateSpaceDto, SpaceQueryDto } from './dto/space.dto';
import { SpacesRepository } from './spaces.repository';
import { SpaceRating } from './entities/space-rating.entity';
import { CreateSpaceRatingDto } from './dto/create-space-rating.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Event, EventStatus } from '../events/entities/event.entity';

@Injectable()
export class SpacesService {
  constructor(
    private readonly spaceRepository: SpacesRepository,
    private readonly sportsService: SportsService,
    @InjectRepository(SpaceRating)
    private spaceRatingRepository: Repository<SpaceRating>,
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
  ) {}

  async create(createSpaceDto: CreateSpaceDto, user: User): Promise<Space> {
    if (user.role !== Role.ADMIN) {
      throw new UnauthorizedException(
        'Solo los administradores pueden crear espacios',
      );
    }

    const existingSpace = await this.spaceRepository.findOne({
      where: { address: createSpaceDto.address },
    });

    if (existingSpace) {
      throw new ConflictException('Ya existe un espacio en esta dirección');
    }

    const sports = await Promise.all(
      createSpaceDto.sportIds.map(async (sportId) => {
        try {
          return await this.sportsService.findOne(sportId);
        } catch (error) {
          throw new NotFoundException(`El deporte con ID ${sportId} no existe`);
        }
      }),
    );

    const space = this.spaceRepository.create({
      ...createSpaceDto,
      sports,
      isActive: true,
    });

    return this.spaceRepository.save(space);
  }

  async findSpacesByFiltersPaginated(query: SpaceQueryDto) {
    return this.spaceRepository.findSpacesByFiltersPaginated(query);
  }

  async findOne(id: number): Promise<Space> {
    return this.spaceRepository.findOneWithRelations(id);
  }

  async update(
    id: number,
    updateSpaceDto: UpdateSpaceDto,
    user: User,
  ): Promise<Space> {
    if (user.role !== Role.ADMIN) {
      throw new UnauthorizedException(
        'Solo los administradores pueden actualizar espacios',
      );
    }

    const space = await this.findOne(id);

    if (updateSpaceDto.sportIds) {
      const sports = await Promise.all(
        updateSpaceDto.sportIds.map(async (sportId) => {
          try {
            return await this.sportsService.findOne(sportId);
          } catch (error) {
            throw new NotFoundException(
              `El deporte con ID ${sportId} no existe`,
            );
          }
        }),
      );
      space.sports = sports;
    }

    Object.assign(space, updateSpaceDto);
    return this.spaceRepository.save(space);
  }

  async remove(id: number, user: User): Promise<void> {
    if (user.role !== Role.ADMIN) {
      throw new UnauthorizedException(
        'Solo los administradores pueden eliminar espacios',
      );
    }

    const space = await this.findOne(id);
    space.isActive = false;
    await this.spaceRepository.save(space);
  }

  async createRating(
    spaceId: number,
    userId: number,
    createSpaceRatingDto: CreateSpaceRatingDto,
  ): Promise<SpaceRating> {
    const space = await this.findOne(spaceId);

    const canUserRateSpace = await this.canUserRateSpace(spaceId, userId);

    if (!canUserRateSpace.canRate) {
      throw new Error(canUserRateSpace.reason);
    }

    const existingRating = await this.spaceRatingRepository.findOne({
      where: {
        space: { id: spaceId },
        user: { id: userId },
      },
    });

    if (existingRating) {
      throw new Error('Ya has calificado este espacio');
    }

    const rating = this.spaceRatingRepository.create({
      ...createSpaceRatingDto,
      space,
      user: { id: userId },
    });

    await this.spaceRatingRepository.save(rating);

    // recalculo el promedio de calificaciones
    const ratings = await this.spaceRatingRepository.find({
      where: { space: { id: spaceId } },
    });

    const averageRating =
      ratings.reduce((acc, curr) => acc + curr.rating, 0) / ratings.length;

    await this.spaceRepository.update(spaceId, { averageRating });

    return rating;
  }

  async getRatings(spaceId: number): Promise<SpaceRating[]> {
    return this.spaceRatingRepository.find({
      where: { space: { id: spaceId } },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async canUserRateSpace(
    spaceId: number,
    userId: number,
  ): Promise<{ canRate: boolean; reason?: string }> {
    const existingRating = await this.spaceRatingRepository.findOne({
      where: {
        space: { id: spaceId },
        user: { id: userId },
      },
    });

    if (existingRating) {
      return {
        canRate: false,
        reason: 'Ya has calificado este espacio',
      };
    }

    const hasParticipated = await this.eventRepository
      .createQueryBuilder('event')
      .innerJoin('event.participants', 'participant')
      .where('event.space.id = :spaceId', { spaceId })
      .andWhere('participant.id = :userId', { userId })
      .andWhere('event.status = :status', { status: EventStatus.FINISHED })
      .getOne();

    if (!hasParticipated) {
      return {
        canRate: false,
        reason:
          'Solo puedes calificar un espacio si has participado en un evento finalizado en él',
      };
    }

    return {
      canRate: true,
    };
  }
}
