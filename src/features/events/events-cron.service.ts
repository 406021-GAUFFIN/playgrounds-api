import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { EventRepository } from './repositories/event.repository';
import { EventStatus } from './entities/event.entity';
import { EmailService } from '../email/email.service';

@Injectable()
export class EventsCronService {
  constructor(
    private eventRepository: EventRepository,
    private emailService: EmailService,
  ) {}

  @Cron('1,16,31,46 * * * *') // Se ejecuta al minuto 1, 16, 31 y 46 de cada hora
  async handleEventStatusUpdates() {
    await this.suspendAvailableEvents();
    await this.finishPastEvents();
  }

  private async suspendAvailableEvents() {
    const now = new Date();
    const oneHourFromNow = new Date();
    oneHourFromNow.setHours(oneHourFromNow.getHours() + 1);

    const events = await this.eventRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.participants', 'participants')
      .leftJoinAndSelect('event.space', 'space')
      .leftJoinAndSelect('event.sport', 'sport')
      .where('event.status = :status', { status: EventStatus.AVAILABLE })
      .andWhere('event.dateTime > :now', { now })
      .andWhere('event.dateTime <= :oneHourFromNow', { oneHourFromNow })
      .getMany();

    for (const event of events) {
      // Solo suspender si no tiene suficientes participantes
      if (event.participants.length < event.minParticipants) {
        event.status = EventStatus.SUSPENDED;
        await this.eventRepository.save(event);

        await this.emailService.sendEventSuspendedEmail(
          event,
          event.participants,
        );
      }
    }
  }

  private async finishPastEvents() {
    const now = new Date();

    const events = await this.eventRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.participants', 'participants')
      .leftJoinAndSelect('event.space', 'space')
      .leftJoinAndSelect('event.sport', 'sport')
      .where('event.dateTime < :now', { now })
      .andWhere('event.status IN (:...statuses)', {
        statuses: [EventStatus.CONFIRMED, EventStatus.AVAILABLE],
      })
      .getMany();

    for (const event of events) {
      event.status = EventStatus.FINISHED;
      await this.eventRepository.save(event);
    }
  }
}
