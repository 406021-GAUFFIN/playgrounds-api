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

@Injectable()
export class EventsService {
  constructor(
    private eventRepository: EventRepository,
    private spacesService: SpacesService,
    private sportsService: SportsService,
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

    return this.eventRepository.createEvent(
      {
        ...eventData,
        space,
        sport,
      },
      creator,
    );
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
      return await this.eventRepository.updateEvent(id, updateEventDto);
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
}
