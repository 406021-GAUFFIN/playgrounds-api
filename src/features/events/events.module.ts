import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { Event } from './entities/event.entity';
import { SpacesModule } from '../spaces/spaces.module';
import { SportsModule } from '../sports/sports.module';
import { EmailModule } from '../email/email.module';
import { EventRepository } from './repositories/event.repository';
import { EventsCronService } from './events-cron.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Event]),
    SpacesModule,
    SportsModule,
    EmailModule,
    UsersModule,
  ],
  controllers: [EventsController],
  providers: [EventsService, EventRepository, EventsCronService],
  exports: [EventsService],
})
export class EventsModule {}
