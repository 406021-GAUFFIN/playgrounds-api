import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { EmailModule } from '../email/email.module';
import { UserRepository } from './repositories/user.repository';
import { SportsModule } from '../sports/sports.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), EmailModule, SportsModule],
  controllers: [UsersController],
  providers: [UsersService, UserRepository],
  exports: [UsersService],
})
export class UsersModule {}
