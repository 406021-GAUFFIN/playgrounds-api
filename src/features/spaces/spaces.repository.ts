import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Space } from './entities/space.entity';
import { PaginationDto } from 'src/common/dto/Pagination.dto';
import { SpaceQueryDto } from './dto/space.dto';

@Injectable()
export class SpacesRepository extends Repository<Space> {
  constructor(private dataSource: DataSource) {
    super(Space, dataSource.createEntityManager());
  }

  async findSpacesByFiltersPaginated(payload: SpaceQueryDto) {
    const { page, pageSize, name, isActive, minLat, maxLat, minLng, maxLng } =
      payload;

    const pageNumber = page ?? 0;
    const take = pageSize ?? 10;
    const skip = Math.max(0, pageNumber) * take;

    const query = this.createQueryBuilder('space')
      .leftJoinAndSelect('space.sports', 'sport')
      .select([
        'space',
        'sport.id',
        'sport.name',
        'sport.minParticipants',
        'sport.maxParticipants',
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

    const [data, total] = await query.take(take).skip(skip).getManyAndCount();

    return new PaginationDto({
      data,
      page: pageNumber,
      pageSize: take,
      total,
    });
  }

  async findOneWithRelations(id: number): Promise<Space> {
    const space = await this.findOne({
      where: { id, isActive: true },
      relations: ['sports'],
    });
    if (!space) {
      throw new NotFoundException(`Espacio con ID ${id} no encontrado`);
    }
    return space;
  }
}
