import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsArray,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { EventStatus } from '../entities/event.entity';
import { RequestPaginationDto } from 'src/common/dto/Pagination.dto';

export class EventQueryDto extends RequestPaginationDto {
  @ApiProperty({
    description: 'Estados del evento',
    enum: EventStatus,
    isArray: true,
    required: false,
  })
  @IsArray()
  @IsEnum(EventStatus, { each: true })
  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  status?: EventStatus[];

  @ApiProperty({
    description: 'Solo eventos futuros',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  futureOnly?: boolean;

  @ApiProperty({
    description: 'IDs de deportes',
    type: [Number],
    required: false,
  })
  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  @Type(() => Number)
  sportIds?: number[];

  @ApiProperty({
    description: 'ID del espacio',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  spaceId?: number;

  @ApiProperty({
    description: 'Latitud mínima del espacio',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  minLat?: number;

  @ApiProperty({
    description: 'Latitud máxima del espacio',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  maxLat?: number;

  @ApiProperty({
    description: 'Longitud mínima del espacio',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  minLng?: number;

  @ApiProperty({
    description: 'Longitud máxima del espacio',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  maxLng?: number;

  @ApiProperty({
    description: 'ID del participante',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  participantId?: number;

  @ApiProperty({
    description: 'ID del participante',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  participantToExcludeId?: number;

  @ApiProperty({
    description: 'Latitud para ordenar por cercanía',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  latitude?: number;

  @ApiProperty({
    description: 'Longitud para ordenar por cercanía',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  longitude?: number;

  @ApiProperty({
    description: 'Ordenar por distancia (ASC o DESC)',
    enum: ['ASC', 'DESC'],
    required: false,
  })
  @IsEnum(['ASC', 'DESC'])
  @IsOptional()
  sortByDistance?: 'ASC' | 'DESC';

  @ApiProperty({
    description: 'Minimo de participantes',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  minParticipants?: number;
}
