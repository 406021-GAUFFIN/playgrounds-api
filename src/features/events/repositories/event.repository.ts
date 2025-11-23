import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Event, EventStatus } from '../entities/event.entity';
import { User } from '../../users/entities/user.entity';
import { PaginationDto } from '../../../common/dto/Pagination.dto';
import { EventQueryDto } from '../dto/event-query.dto';
import {
  DailyEventStatsDto,
  SportEventCountDto,
  SportParticipantStatsDto,
  SportTimeSlotStatsDto,
  TimeSlotDto,
} from '../dto/event-stats-response.dto';

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

  async getWeeklyEventStats(weekStart: Date): Promise<DailyEventStatsDto[]> {
    const daysOfWeek = [
      'Domingo',
      'Lunes',
      'Martes',
      'Miércoles',
      'Jueves',
      'Viernes',
      'Sábado',
    ];
    const dailyStats: DailyEventStatsDto[] = [];

    // Generar estadísticas para cada día de la semana
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(weekStart);
      currentDate.setDate(weekStart.getDate() + i);

      const dayStart = new Date(currentDate);
      dayStart.setHours(0, 0, 0, 0);

      const dayEnd = new Date(currentDate);
      dayEnd.setHours(23, 59, 59, 999);

      // Obtener eventos del día con información del deporte
      const eventsBySport = await this.createQueryBuilder('event')
        .leftJoinAndSelect('event.sport', 'sport')
        .select([
          'sport.id as sportId',
          'sport.name as sportName',
          'COUNT(event.id) as eventCount',
        ])
        .where('event.dateTime >= :dayStart', { dayStart })
        .andWhere('event.dateTime <= :dayEnd', { dayEnd })
        .groupBy('sport.id, sport.name')
        .getRawMany();

      // Calcular total de eventos del día
      const totalEvents = eventsBySport.reduce(
        (sum, sport) => sum + parseInt(sport.eventcount),
        0,
      );

      // Convertir a formato DTO
      const eventsBySportDto: SportEventCountDto[] = eventsBySport.map(
        (sport) => ({
          sportId: parseInt(sport.sportid),
          sportName: sport.sportname,
          eventCount: parseInt(sport.eventcount),
        }),
      );

      dailyStats.push({
        date: currentDate.toISOString().split('T')[0],
        dayOfWeek: daysOfWeek[currentDate.getDay()],
        totalEvents,
        eventsBySport: eventsBySportDto,
      });
    }

    return dailyStats;
  }

  async getTopSportsByWeek(
    weekStart: Date,
    weekEnd: Date,
  ): Promise<SportEventCountDto[]> {
    const topSports = await this.createQueryBuilder('event')
      .leftJoinAndSelect('event.sport', 'sport')
      .select([
        'sport.id as sportId',
        'sport.name as sportName',
        'COUNT(event.id) as eventCount',
      ])
      .where('event.dateTime >= :weekStart', { weekStart })
      .andWhere('event.dateTime <= :weekEnd', { weekEnd })
      .groupBy('sport.id, sport.name')
      .orderBy('eventCount', 'DESC')
      .limit(4)
      .getRawMany();

    return topSports.map((sport) => ({
      sportId: parseInt(sport.sportid),
      sportName: sport.sportname,
      eventCount: parseInt(sport.eventcount),
    }));
  }

  async getParticipantStatsBySport(
    startDate: Date,
    endDate: Date,
  ): Promise<SportParticipantStatsDto[]> {
    // Obtener estadísticas básicas por deporte
    const stats = await this.createQueryBuilder('event')
      .leftJoinAndSelect('event.sport', 'sport')
      .select([
        'sport.id as sportId',
        'sport.name as sportName',
        'COUNT(DISTINCT event.id) as totalEvents',
      ])
      .where('event.dateTime >= :startDate', { startDate })
      .andWhere('event.dateTime <= :endDate', { endDate })
      .groupBy('sport.id, sport.name')
      .getRawMany();

    // Para cada deporte, obtener estadísticas de participantes
    const result: SportParticipantStatsDto[] = [];

    for (const stat of stats) {
      const sportId = parseInt(stat.sportid);
      const totalEvents = parseInt(stat.totalevents);

      // Obtener eventos de este deporte con participantes
      const eventsWithParticipants = await this.createQueryBuilder('event')
        .leftJoinAndSelect('event.participants', 'participants')
        .where('event.sport.id = :sportId', { sportId })
        .andWhere('event.dateTime >= :startDate', { startDate })
        .andWhere('event.dateTime <= :endDate', { endDate })
        .getMany();

      const participantCounts = eventsWithParticipants.map(
        (event) => event.participants.length,
      );
      const totalParticipants = participantCounts.reduce(
        (sum, count) => sum + count,
        0,
      );
      const averageParticipants =
        totalEvents > 0 ? totalParticipants / totalEvents : 0;
      const minParticipants =
        participantCounts.length > 0 ? Math.min(...participantCounts) : 0;
      const maxParticipants =
        participantCounts.length > 0 ? Math.max(...participantCounts) : 0;

      result.push({
        sportId,
        sportName: stat.sportname,
        totalEvents,
        totalParticipants,
        averageParticipants: Math.round(averageParticipants * 100) / 100, // Redondear a 2 decimales
        minParticipants,
        maxParticipants,
      });
    }

    return result;
  }

  async getTimeSlotStatsBySport(
    startDate: Date,
    endDate: Date,
  ): Promise<{
    timeSlots: TimeSlotDto[];
    sportStats: SportTimeSlotStatsDto[];
  }> {
    // Definir franjas horarias
    const timeSlots: TimeSlotDto[] = [
      { timeSlot: '06:00-12:00', startHour: 6, endHour: 12 },
      { timeSlot: '12:00-18:00', startHour: 12, endHour: 18 },
      { timeSlot: '18:00-24:00', startHour: 18, endHour: 24 },
      { timeSlot: '00:00-06:00', startHour: 0, endHour: 6 },
    ];

    // Obtener estadísticas por deporte y franja horaria
    const sportStats = await this.createQueryBuilder('event')
      .leftJoinAndSelect('event.sport', 'sport')
      .select([
        'sport.id as sportId',
        'sport.name as sportName',
        'EXTRACT(HOUR FROM event.dateTime) as hour',
        'COUNT(event.id) as eventCount',
      ])
      .where('event.dateTime >= :startDate', { startDate })
      .andWhere('event.dateTime <= :endDate', { endDate })
      .groupBy('sport.id, sport.name, EXTRACT(HOUR FROM event.dateTime)')
      .getRawMany();

    // Procesar los resultados por deporte
    const sportStatsMap = new Map<number, SportTimeSlotStatsDto>();

    sportStats.forEach((stat) => {
      const sportId = parseInt(stat.sportid);
      const hour = parseInt(stat.hour);
      const eventCount = parseInt(stat.eventcount);

      if (!sportStatsMap.has(sportId)) {
        sportStatsMap.set(sportId, {
          sportId,
          sportName: stat.sportname,
          timeSlotFrequency: timeSlots.map((slot) => ({
            timeSlot: slot.timeSlot,
            eventCount: 0,
            percentage: 0,
          })),
        });
      }

      const sportStat = sportStatsMap.get(sportId);
      const timeSlotIndex = timeSlots.findIndex(
        (slot) => hour >= slot.startHour && hour < slot.endHour,
      );

      if (timeSlotIndex !== -1) {
        sportStat.timeSlotFrequency[timeSlotIndex].eventCount = eventCount;
      }
    });

    // Calcular porcentajes para cada deporte
    sportStatsMap.forEach((sportStat) => {
      const totalEvents = sportStat.timeSlotFrequency.reduce(
        (sum, slot) => sum + slot.eventCount,
        0,
      );

      sportStat.timeSlotFrequency.forEach((slot) => {
        slot.percentage =
          totalEvents > 0 ? (slot.eventCount / totalEvents) * 100 : 0;
      });
    });

    return {
      timeSlots,
      sportStats: Array.from(sportStatsMap.values()),
    };
  }
}
