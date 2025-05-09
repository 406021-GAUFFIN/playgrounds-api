import { Injectable } from '@nestjs/common';
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
    const { page, pageSize, name } = payload;

    const pageNumber = page ?? 0;
    const take = pageSize ?? 10;
    const skip = Math.max(0, pageNumber) * take;

    const query = this.createQueryBuilder('space');

    if (name)
      query.andWhere('UPPER(space.name) LIKE UPPER(:name)', {
        name: `%${name}%`,
      });
    const [data, total] = await query.take(take).skip(skip).getManyAndCount();

    return new PaginationDto({
      data,
      page: pageNumber,
      pageSize: take,
      total,
    });
  }
}
