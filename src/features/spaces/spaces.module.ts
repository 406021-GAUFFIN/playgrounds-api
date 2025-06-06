import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SpacesService } from './spaces.service';
import { SpacesController } from './spaces.controller';
import { Space } from './entities/space.entity';
import { SpaceRating } from './entities/space-rating.entity';
import { SportsModule } from '../sports/sports.module';
import { Event } from '../events/entities/event.entity';
import { SpacesRepository } from './spaces.repository';
@Module({
  imports: [
    TypeOrmModule.forFeature([Space, SpaceRating, Event]),
    SportsModule,
  ],
  controllers: [SpacesController],
  providers: [SpacesService, SpacesRepository],
  exports: [SpacesService],
})
export class SpacesModule {}
