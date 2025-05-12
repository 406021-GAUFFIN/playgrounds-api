import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, Min, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateEventDto {
  @ApiProperty({
    description: 'Título del evento',
    required: false,
  })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({
    description: 'Descripción del evento',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Fecha y hora del evento',
    required: false,
  })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  dateTime?: Date;

  @ApiProperty({
    description: 'Cantidad mínima de participantes',
    required: false,
  })
  @IsNumber()
  @Min(2)
  @IsOptional()
  minParticipants?: number;

  @ApiProperty({
    description: 'Cantidad máxima de participantes',
    required: false,
  })
  @IsNumber()
  @Min(2)
  @IsOptional()
  maxParticipants?: number;
}
