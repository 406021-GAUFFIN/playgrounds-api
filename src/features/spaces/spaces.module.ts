import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SpacesService } from './spaces.service';
import { SpacesController } from './spaces.controller';
import { Space } from './entities/space.entity';
import { SportsModule } from '../sports/sports.module';
import { SpaceRepository } from './spaces.repository';
@Module({
  imports: [TypeOrmModule.forFeature([Space]), SportsModule],
  controllers: [SpacesController],
  providers: [SpacesService, SpaceRepository],
  exports: [SpacesService],
})
export class SpacesModule {}
