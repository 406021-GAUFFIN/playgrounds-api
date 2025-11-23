import { ApiProperty } from '@nestjs/swagger';

export class DailyEventStatsDto {
  @ApiProperty({ description: 'Fecha del día' })
  date: string;

  @ApiProperty({ description: 'Día de la semana' })
  dayOfWeek: string;

  @ApiProperty({ description: 'Cantidad total de eventos del día' })
  totalEvents: number;

  @ApiProperty({ description: 'Eventos por deporte' })
  eventsBySport: SportEventCountDto[];
}

export class SportEventCountDto {
  @ApiProperty({ description: 'ID del deporte' })
  sportId: number;

  @ApiProperty({ description: 'Nombre del deporte' })
  sportName: string;

  @ApiProperty({ description: 'Cantidad de eventos para este deporte' })
  eventCount: number;
}

export class WeeklyEventStatsDto {
  @ApiProperty({ description: 'Fecha de inicio de la semana' })
  weekStart: string;

  @ApiProperty({ description: 'Fecha de fin de la semana' })
  weekEnd: string;

  @ApiProperty({ description: 'Total de eventos en la semana' })
  totalEvents: number;

  @ApiProperty({ description: 'Estadísticas por día' })
  dailyStats: DailyEventStatsDto[];

  @ApiProperty({ description: 'Top 4 deportes con más eventos en la semana' })
  topSports: SportEventCountDto[];
}

export class SportParticipantStatsDto {
  @ApiProperty({ description: 'ID del deporte' })
  sportId: number;

  @ApiProperty({ description: 'Nombre del deporte' })
  sportName: string;

  @ApiProperty({ description: 'Promedio de participantes por evento' })
  averageParticipants: number;

  @ApiProperty({ description: 'Total de eventos analizados' })
  totalEvents: number;

  @ApiProperty({ description: 'Total de participantes en todos los eventos' })
  totalParticipants: number;

  @ApiProperty({ description: 'Mínimo de participantes en un evento' })
  minParticipants: number;

  @ApiProperty({ description: 'Máximo de participantes en un evento' })
  maxParticipants: number;
}

export class ParticipantStatsResponseDto {
  @ApiProperty({ description: 'Fecha de inicio del período' })
  startDate: string;

  @ApiProperty({ description: 'Fecha de fin del período' })
  endDate: string;

  @ApiProperty({ description: 'Estadísticas de participantes por deporte' })
  sportStats: SportParticipantStatsDto[];
}

export class TimeSlotDto {
  @ApiProperty({ description: 'Rango horario' })
  timeSlot: string;

  @ApiProperty({ description: 'Hora de inicio' })
  startHour: number;

  @ApiProperty({ description: 'Hora de fin' })
  endHour: number;
}

export class SportTimeSlotStatsDto {
  @ApiProperty({ description: 'ID del deporte' })
  sportId: number;

  @ApiProperty({ description: 'Nombre del deporte' })
  sportName: string;

  @ApiProperty({ description: 'Frecuencia por franja horaria' })
  timeSlotFrequency: TimeSlotFrequencyDto[];
}

export class TimeSlotFrequencyDto {
  @ApiProperty({ description: 'Franja horaria' })
  timeSlot: string;

  @ApiProperty({ description: 'Cantidad de eventos en esta franja' })
  eventCount: number;

  @ApiProperty({ description: 'Porcentaje del total de eventos' })
  percentage: number;
}

export class TimeSlotStatsResponseDto {
  @ApiProperty({ description: 'Fecha de inicio del período' })
  startDate: string;

  @ApiProperty({ description: 'Fecha de fin del período' })
  endDate: string;

  @ApiProperty({ description: 'Franjas horarias disponibles' })
  timeSlots: TimeSlotDto[];

  @ApiProperty({ description: 'Estadísticas por deporte y franja horaria' })
  sportStats: SportTimeSlotStatsDto[];
}
