import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Space } from './entities/space.entity';
import { PaginationDto } from 'src/common/dto/Pagination.dto';
import { SpaceQueryDto } from './dto/space.dto';
import { EventStatus } from '../events/entities/event.entity';

@Injectable()
export class SpacesRepository extends Repository<Space> {
  constructor(private dataSource: DataSource) {
    super(Space, dataSource.createEntityManager());
  }

  async findSpacesByFiltersPaginated(payload: SpaceQueryDto) {
    const {
      page,
      pageSize,
      name,
      isActive,
      minLat,
      maxLat,
      minLng,
      maxLng,
      sportIds,
      accessibilityIds,
      minRating,
      hasFutureEvents,
    } = payload;

    const pageNumber = page ?? 0;
    const take = pageSize ?? 10;
    const skip = Math.max(0, pageNumber) * take;

    const query = this.createQueryBuilder('space')
      .leftJoinAndSelect('space.sports', 'sport')
      .leftJoinAndSelect('space.accessibilities', 'accessibility')
      .select([
        'space',
        'sport.id',
        'sport.name',
        'sport.minParticipants',
        'sport.maxParticipants',
        'accessibility.id',
        'accessibility.name',
      ]);

    if (name)
      query.andWhere('UPPER(space.name) LIKE UPPER(:name)', {
        name: `%${name}%`,
      });

    if (isActive !== undefined)
      query.andWhere('space.isActive = :isActive', { isActive });

    if (minLat !== undefined)
      query.andWhere('space.latitude >= :minLat', { minLat });

    if (maxLat !== undefined)
      query.andWhere('space.latitude <= :maxLat', { maxLat });

    if (minLng !== undefined)
      query.andWhere('space.longitude >= :minLng', { minLng });

    if (maxLng !== undefined)
      query.andWhere('space.longitude <= :maxLng', { maxLng });

    if (sportIds && sportIds.length > 0) {
      query.andWhere('sport.id IN (:...sportIds)', { sportIds });
    }

    if (accessibilityIds && accessibilityIds.length > 0) {
      query.andWhere('accessibility.id IN (:...accessibilityIds)', {
        accessibilityIds,
      });
    }
    if (minRating !== undefined) {
      query.andWhere('space.averageRating >= :minRating', { minRating });
    }

    if (hasFutureEvents) {
      query.andWhere(
        `EXISTS (
      SELECT 1 FROM event e 
      WHERE e."spaceId" = space.id 
      AND e."dateTime" >= :now
      AND e.status IN (:...status)
    )`,
      );

      query.setParameter('now', new Date());
      query.setParameter('status', [
        EventStatus.AVAILABLE,
        EventStatus.CONFIRMED,
      ]);
    }

    const [data, total] = await query.take(take).skip(skip).getManyAndCount();

    return new PaginationDto({
      data,
      page: pageNumber,
      pageSize: take,
      total,
    });
  }

  async findOneWithRelations(id: number): Promise<Space> {
    const space = await this.createQueryBuilder('space')
      .leftJoinAndSelect('space.sports', 'sports')
      .leftJoinAndSelect('space.ratings', 'ratings')
      .leftJoinAndSelect('space.accessibilities', 'accessibilities')
      .leftJoinAndSelect('ratings.user', 'user', 'user.id = ratings.user_id')
      .select([
        'space',
        'sports',
        'ratings',
        'accessibilities',
        'user.id',
        'user.name',
        'user.email',
      ])
      .where('space.id = :id', { id })
      .andWhere('space.isActive = :isActive', { isActive: true })
      .getOne();

    if (!space) {
      throw new NotFoundException(`Espacio con ID ${id} no encontrado`);
    }
    return space;
  }
}
