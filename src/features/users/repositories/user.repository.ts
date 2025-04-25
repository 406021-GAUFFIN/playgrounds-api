import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import * as bcrypt from 'bcryptjs';
import { PaginationDto } from 'src/common/dto/Pagination.dto';
import { UserQueryDto } from '../dto/user.dto';

@Injectable()
export class UserRepository extends Repository<User> {
  constructor(private dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }

  async createUser(userData: Partial<User>): Promise<User> {
    userData.emailValidatedAt = new Date();
    const user = this.create(userData);
    return this.save(user);
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10);
    }
    await this.update(id, userData);
    return this.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User> {
    return this.findOne({ where: { email } });
  }

  async findUsersByFiltersPaginated(payload: UserQueryDto) {
    const { page, pageSize, name, role } = payload;

    const pageNumber = page ?? 0;
    const take = pageSize ?? 10;
    const skip = Math.max(0, pageNumber) * take;

    const query = this.createQueryBuilder('user');

    if (name)
      query.andWhere('UPPER(user.name) LIKE UPPER(:name)', {
        name: `%${name}%`,
      });

    if (role) query.andWhere('user.role = :role', { role });

    const [data, total] = await query.take(take).skip(skip).getManyAndCount();

    return new PaginationDto({
      data,
      page: pageNumber,
      pageSize: take,
      total,
    });
  }
}
