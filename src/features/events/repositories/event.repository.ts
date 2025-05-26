import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Event, EventStatus } from '../entities/event.entity';
import { User } from '../../users/entities/user.entity';
import { PaginationDto } from '../../../common/dto/Pagination.dto';
import { EventQueryDto } from '../dto/event-query.dto';

@Injectable()
export class EventRepository extends Repository<Event> {
  constructor(private dataSource: DataSource) {
    super(Event, dataSource.createEntityManager());
  }

  async createEvent(eventData: Partial<Event>, creator: User): Promise<Event> {
    const event = this.create({
      ...eventData,
      creator,
      participants: [creator],
      status: EventStatus.AVAILABLE,
    });
    return this.save(event);
  }

  async joinEvent(eventId: number, user: User): Promise<Event> {
    const event = await this.findOne({
      where: { id: eventId },
      relations: ['participants'],
    });

    if (!event) {
      throw new Error('Event not found');
    }

    if (
      event.status !== EventStatus.AVAILABLE &&
      event.status !== EventStatus.CONFIRMED
    ) {
      throw new Error('Event is not available for joining');
    }

    if (event.participants.length >= event.maxParticipants) {
      throw new Error('Event is full');
    }

    if (event.participants.some((p) => p.id === user.id)) {
      throw new Error('User is already a participant');
    }

    event.participants.push(user);
    return this.save(event);
  }

  async findEventWithDetails(id: number): Promise<Event> {
    return this.findOne({
      where: { id },
      relations: ['creator', 'space', 'sport', 'participants'],
    });
  }

  async findEventsByFiltersPaginated(payload: EventQueryDto) {
    const {
      page,
      pageSize,
      status,
      futureOnly,
      sportIds,
      spaceId,
      minLat,
      maxLat,
      minLng,
      maxLng,
      participantId,
    } = payload;

    const pageNumber = page ?? 0;
    const take = pageSize ?? 10;
    const skip = Math.max(0, pageNumber) * take;

    const query = this.createQueryBuilder('event')
      .leftJoinAndSelect('event.creator', 'creator')
      .leftJoinAndSelect('event.space', 'space')
      .leftJoinAndSelect('event.sport', 'sport')
      .leftJoinAndSelect('event.participants', 'participants')
      .select([
        'event',
        'creator.id',
        'creator.name',
        'creator.email',
        'space',
        'sport',
        'participants.id',
        'participants.name',
        'participants.email',
      ]);

    if (participantId) {
      query.andWhere(
        `EXISTS (
          SELECT 1 FROM event_participants_user epu 
          WHERE epu."eventId" = event.id 
          AND epu."userId" = :participantId
        )`,
      );
      query.setParameter('participantId', participantId);
    }

    if (status && status.length > 0) {
      query.andWhere('event.status IN (:...status)', { status });
    }

    if (futureOnly) {
      query.andWhere('event.dateTime > :now', { now: new Date() });
    }

    if (sportIds && sportIds.length > 0) {
      query.andWhere('sport.id IN (:...sportIds)', { sportIds });
    }

    if (spaceId) {
      query.andWhere('space.id = :spaceId', { spaceId });
    }

    if (minLat !== undefined) {
      query.andWhere('space.latitude >= :minLat', { minLat });
    }

    if (maxLat !== undefined) {
      query.andWhere('space.latitude <= :maxLat', { maxLat });
    }

    if (minLng !== undefined) {
      query.andWhere('space.longitude >= :minLng', { minLng });
    }

    if (maxLng !== undefined) {
      query.andWhere('space.longitude <= :maxLng', { maxLng });
    }

    query.orderBy('event.dateTime', 'ASC');

    const [data, total] = await query.take(take).skip(skip).getManyAndCount();

    return new PaginationDto({
      data,
      page: pageNumber,
      pageSize: take,
      total,
    });
  }

  async updateEvent(id: number, updateData: Partial<Event>): Promise<Event> {
    const event = await this.findOne({
      where: { id },
      relations: ['creator', 'participants'],
    });

    if (!event) {
      throw new Error('Event not found');
    }

    if (event.status !== EventStatus.AVAILABLE) {
      throw new Error('Event can only be updated when in AVAILABLE status');
    }

    Object.assign(event, updateData);

    if (
      updateData.maxParticipants &&
      event.participants.length > updateData.maxParticipants
    ) {
      throw new Error(
        'Cannot set maxParticipants lower than current participants count',
      );
    }

    return this.save(event);
  }

  async leaveEvent(eventId: number, user: User): Promise<Event> {
    const event = await this.findOne({
      where: { id: eventId },
      relations: ['creator', 'participants'],
    });

    if (!event) {
      throw new Error('Event not found');
    }

    if (event.creator.id === user.id) {
      throw new Error('El creador del evento no puede salir del mismo');
    }

    if (event.status !== EventStatus.AVAILABLE) {
      throw new Error('Solo se puede salir de eventos en estado CONFIRMED');
    }

    if (event.dateTime <= new Date()) {
      throw new Error('No se puede salir de eventos pasados');
    }

    if (event.participants.length >= event.minParticipants) {
      throw new Error(
        'No se puede salir del evento porque se alcanzó el mínimo de participantes',
      );
    }

    if (!event.participants.some((p) => p.id === user.id)) {
      throw new Error('El usuario no es participante del evento');
    }

    event.participants = event.participants.filter((p) => p.id !== user.id);
    return this.save(event);
  }
}
