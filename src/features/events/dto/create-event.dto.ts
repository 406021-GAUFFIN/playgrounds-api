import { ApiProperty, OmitType } from '@nestjs/swagger';
import { Event } from '../entities/event.entity';
import { IsDate, IsNumber, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateEventDto extends OmitType(Event, [
  'id',
  'createdAt',
  'deletedAt',
  'updatedAt',
  'creator',
  'participants',
  'status',
  'space',
  'sport',
] as const) {
  @ApiProperty({ description: 'Título del evento' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Descripción del evento' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Fecha y hora del evento' })
  @IsDate()
  @Type(() => Date)
  dateTime: Date;

  @ApiProperty({ description: 'Cantidad mínima de participantes' })
  @IsNumber()
  @Min(2)
  minParticipants: number;

  @ApiProperty({ description: 'Cantidad máxima de participantes' })
  @IsNumber()
  @Min(2)
  maxParticipants: number;

  @ApiProperty({ description: 'ID del espacio' })
  @IsNumber()
  spaceId: number;

  @ApiProperty({ description: 'ID del deporte' })
  @IsNumber()
  sportId: number;
}
