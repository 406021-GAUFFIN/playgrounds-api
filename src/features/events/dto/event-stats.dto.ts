import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsDateString } from 'class-validator';
import { Transform } from 'class-transformer';

export class EventStatsQueryDto {
  @ApiProperty({
    description: 'Fecha de inicio de la semana (formato ISO)',
    example: '2024-01-01',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => {
    if (!value) {
      // Si no se proporciona fecha, usar la semana actual
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      return startOfWeek.toISOString().split('T')[0];
    }
    return value;
  })
  weekStart?: string;
}

export class ParticipantStatsQueryDto {
  @ApiProperty({
    description: 'Fecha de inicio del período (formato ISO)',
    example: '2024-01-01',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => {
    if (!value) {
      // Si no se proporciona fecha, usar el último mes
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      return startOfMonth.toISOString().split('T')[0];
    }
    return value;
  })
  startDate?: string;

  @ApiProperty({
    description: 'Fecha de fin del período (formato ISO)',
    example: '2024-01-31',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => {
    if (!value) {
      // Si no se proporciona fecha, usar hoy
      return new Date().toISOString().split('T')[0];
    }
    return value;
  })
  endDate?: string;
}

export class TimeSlotStatsQueryDto {
  @ApiProperty({
    description: 'Fecha de inicio del período (formato ISO)',
    example: '2024-01-01',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => {
    if (!value) {
      // Si no se proporciona fecha, usar el último mes
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      return startOfMonth.toISOString().split('T')[0];
    }
    return value;
  })
  startDate?: string;

  @ApiProperty({
    description: 'Fecha de fin del período (formato ISO)',
    example: '2024-01-31',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => {
    if (!value) {
      // Si no se proporciona fecha, usar hoy
      return new Date().toISOString().split('T')[0];
    }
    return value;
  })
  endDate?: string;
}
