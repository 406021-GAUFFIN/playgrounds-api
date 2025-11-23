import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { EventRepository } from './repositories/event.repository';
import { CreateEventDto } from './dto/create-event.dto';
import { User } from '../users/entities/user.entity';
import { Event, EventStatus } from './entities/event.entity';
import { SpacesService } from '../spaces/spaces.service';
import { SportsService } from '../sports/sports.service';
import { EventQueryDto } from './dto/event-query.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EmailService } from '../email/email.service';
import { UsersService } from '../users/users.service';
import {
  EventStatsQueryDto,
  ParticipantStatsQueryDto,
  TimeSlotStatsQueryDto,
} from './dto/event-stats.dto';
import {
  WeeklyEventStatsDto,
  ParticipantStatsResponseDto,
  TimeSlotStatsResponseDto,
} from './dto/event-stats-response.dto';

@Injectable()
export class EventsService {
  constructor(
    private eventRepository: EventRepository,
    private spacesService: SpacesService,
    private sportsService: SportsService,
    private usersService: UsersService,
    private emailService: EmailService,
  ) {}

  async create(createEventDto: CreateEventDto, creator: User): Promise<Event> {
    const space = await this.spacesService.findOne(createEventDto.spaceId);
    const sport = await this.sportsService.findOne(createEventDto.sportId);

    if (!space.sports.some((s) => s.id === sport.id)) {
      throw new Error('Sport is not available in this space');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { spaceId, sportId, ...eventData } = createEventDto;

    const event = await this.eventRepository.createEvent(
      {
        ...eventData,
        space,
        sport,
      },
      creator,
    );

    const usersToNotify = await this.usersService.findUsersForEventNotification(
      space.latitude,
      space.longitude,
      sport.id,
    );

    const filteredUsersToNotify = usersToNotify.filter(
      (user) => user.id !== creator.id,
    );

    if (filteredUsersToNotify.length > 0) {
      await this.emailService.sendNewEventNotification(
        event,
        filteredUsersToNotify,
      );
    }

    return event;
  }

  async joinEvent(eventId: number, user: User): Promise<Event> {
    const event = await this.eventRepository.joinEvent(eventId, user);

    // Si el evento está en estado AVAILABLE y alcanzó el mínimo de participantes
    if (
      event.status === EventStatus.AVAILABLE &&
      event.participants.length >= event.minParticipants
    ) {
      // Actualizar el estado a CONFIRMED
      event.status = EventStatus.CONFIRMED;
      const updatedEvent = await this.eventRepository.save(event);

      // Enviar correo a todos los participantes
      await this.emailService.sendEventConfirmationEmail(
        updatedEvent,
        updatedEvent.participants,
      );

      return updatedEvent;
    }

    return event;
  }

  async findOne(id: number): Promise<Event> {
    const event = await this.eventRepository.findEventWithDetails(id);
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    return event;
  }

  async findEventsByFiltersPaginated(query: EventQueryDto) {
    return this.eventRepository.findEventsByFiltersPaginated(query);
  }

  async update(
    id: number,
    updateEventDto: UpdateEventDto,
    user: User,
  ): Promise<Event> {
    const event = await this.findOne(id);

    if (event.creator.id !== user.id) {
      throw new ForbiddenException('Solo el creador puede editar el evento');
    }

    try {
      const updatedEvent = await this.eventRepository.updateEvent(
        id,
        updateEventDto,
      );

      // Enviar correo a todos los participantes excepto el creador
      const participantsToNotify = updatedEvent.participants.filter(
        (participant) => participant.id !== user.id,
      );

      if (participantsToNotify.length > 0) {
        await this.emailService.sendEventUpdatedEmail(
          updatedEvent,
          participantsToNotify,
        );
      }

      return updatedEvent;
    } catch (error) {
      if (error.message === 'Event not found') {
        throw new NotFoundException('Evento no encontrado');
      }
      throw error;
    }
  }

  async cancel(id: number, user: User): Promise<Event> {
    const event = await this.eventRepository.findOne({
      where: { id },
      relations: ['creator'],
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    if (event.creator.id !== user.id) {
      throw new ForbiddenException(
        'Only the event creator can cancel the event',
      );
    }

    if (event.status !== EventStatus.AVAILABLE) {
      throw new BadRequestException('Only available events can be cancelled');
    }

    event.status = EventStatus.CANCELLED;

    await this.eventRepository.save(event);
    await this.emailService.sendEventCancelledEmail(event, event.participants);
    return event;
  }

  async leaveEvent(id: number, user: User): Promise<Event> {
    try {
      const event = await this.eventRepository.leaveEvent(id, user);
      return event;
    } catch (error) {
      if (error.message === 'Event not found') {
        throw new NotFoundException(`Event with ID ${id} not found`);
      }
      throw new BadRequestException(error.message);
    }
  }

  async getWeeklyEventStats(
    query: EventStatsQueryDto,
  ): Promise<WeeklyEventStatsDto> {
    const weekStart = new Date(query.weekStart);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    // Obtener estadísticas de eventos por día y deporte
    const dailyStats =
      await this.eventRepository.getWeeklyEventStats(weekStart);

    // Obtener top 4 deportes con más eventos en la semana
    const topSports = await this.eventRepository.getTopSportsByWeek(
      weekStart,
      weekEnd,
    );

    // Calcular total de eventos en la semana
    const totalEvents = dailyStats.reduce(
      (sum, day) => sum + day.totalEvents,
      0,
    );

    return {
      weekStart: weekStart.toISOString().split('T')[0],
      weekEnd: weekEnd.toISOString().split('T')[0],
      totalEvents,
      dailyStats,
      topSports,
    };
  }

  async getParticipantStats(
    query: ParticipantStatsQueryDto,
  ): Promise<ParticipantStatsResponseDto> {
    const startDate = new Date(query.startDate);
    const endDate = new Date(query.endDate);
    endDate.setHours(23, 59, 59, 999);

    const sportStats = await this.eventRepository.getParticipantStatsBySport(
      startDate,
      endDate,
    );

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      sportStats,
    };
  }

  async getTimeSlotStats(
    query: TimeSlotStatsQueryDto,
  ): Promise<TimeSlotStatsResponseDto> {
    const startDate = new Date(query.startDate);
    const endDate = new Date(query.endDate);
    endDate.setHours(23, 59, 59, 999);

    const { timeSlots, sportStats } =
      await this.eventRepository.getTimeSlotStatsBySport(startDate, endDate);

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      timeSlots,
      sportStats,
    };
  }
}
