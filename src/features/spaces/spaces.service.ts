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

@Injectable()
export class SpacesService {
  constructor(
    private readonly spaceRepository: SpacesRepository,
    private readonly sportsService: SportsService,
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

    // Verificar que todos los deportes existan
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
    const space = await this.spaceRepository.findOne({
      where: { id, isActive: true },
      relations: ['sports'],
    });
    if (!space) {
      throw new NotFoundException(`Espacio con ID ${id} no encontrado`);
    }
    return space;
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
      // Verificar que todos los deportes existan
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
}
