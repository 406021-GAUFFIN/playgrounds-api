import { Entity, Column, ManyToMany, JoinTable, OneToMany } from 'typeorm';
import { EntityBase } from '../../../common/entity/base.entity';
import { Sport } from '../../sports/entities/sport.entity';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsArray,
  Length,
  IsNotEmpty,
} from 'class-validator';
import { Event } from '../../events/entities/event.entity';

@Entity('spaces')
export class Space extends EntityBase {
  @ApiProperty({
    description: 'Nombre del espacio',
    example: 'Plaza Independencia',
    required: true,
  })
  @IsString()
  @Length(1, 100)
  @IsNotEmpty()
  @Column({ length: 100 })
  name: string;

  @ApiProperty({
    description: 'Dirección del espacio',
    example: 'Av. Siempreviva 742',
    required: true,
  })
  @IsString()
  @Length(1, 200)
  @IsNotEmpty()
  @Column({ length: 200 })
  address: string;

  @ApiProperty({
    description: 'Horario del espacio',
    example: 'Lunes a Viernes de 9:00 a 22:00',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Column({ type: 'text', nullable: true })
  schedule: string;

  @ApiProperty({
    description: 'Condiciones del espacio',
    example: 'Piso de cemento, iluminación nocturna',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @Column({ type: 'text' })
  conditions: string;

  @ApiProperty({
    description:
      'Indica si el espacio es accesible para personas con discapacidad',
    example: true,
    required: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  @Column({ default: false })
  isAccessible: boolean;

  @ApiProperty({
    description: 'Descripción detallada del espacio',
    example: 'Plaza frente a la Iglesia',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty({
    description: 'Indica si el espacio está activo',
    example: true,
    required: false,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty({
    description: 'Latitud del espacio',
    example: -31.4167,
    required: true,
  })
  @IsNumber()
  @IsNotEmpty()
  @Column({ type: 'float' })
  latitude: number;

  @ApiProperty({
    description: 'Longitud del espacio',
    example: -64.1833,
    required: true,
  })
  @IsNumber()
  @IsNotEmpty()
  @Column({ type: 'float' })
  longitude: number;

  @ApiProperty({
    description: 'Deportes disponibles en el espacio',
    type: () => [Sport],
  })
  @IsArray()
  @IsOptional()
  @ManyToMany(() => Sport)
  @JoinTable({
    name: 'space_sports',
    joinColumn: {
      name: 'space_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'sport_id',
      referencedColumnName: 'id',
    },
  })
  sports: Sport[];

  @ApiProperty({
    description: 'Eventos realizados en el espacio',
    type: () => [Event],
  })
  @OneToMany(() => Event, (event) => event.space)
  events: Event[];
}
