import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsEnum, IsNumber, IsString, Min } from 'class-validator';
import { EntityBase } from '../../../common/entity/base.entity';
import { User } from '../../users/entities/user.entity';
import { Space } from '../../spaces/entities/space.entity';
import { Sport } from '../../sports/entities/sport.entity';

export enum EventStatus {
  AVAILABLE = 'available',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  FINISHED = 'finished',
  SUSPENDED = 'suspended',
}

@Entity()
export class Event extends EntityBase {
  @ApiProperty({ description: 'Título del evento' })
  @IsString()
  @Column()
  title: string;

  @ApiProperty({ description: 'Descripción del evento' })
  @IsString()
  @Column()
  description: string;

  @ApiProperty({ description: 'Fecha y hora del evento' })
  @IsDate()
  @Column()
  dateTime: Date;

  @ApiProperty({ description: 'Estado del evento', enum: EventStatus })
  @IsEnum(EventStatus)
  @Column({
    type: 'enum',
    enum: EventStatus,
    default: EventStatus.AVAILABLE,
  })
  status: EventStatus;

  @ApiProperty({ description: 'Cantidad mínima de participantes' })
  @IsNumber()
  @Min(2)
  @Column()
  minParticipants: number;

  @ApiProperty({ description: 'Cantidad máxima de participantes' })
  @IsNumber()
  @Min(2)
  @Column()
  maxParticipants: number;

  @ApiProperty({ description: 'Creador del evento', type: () => User })
  @ManyToOne(() => User, { eager: true })
  @JoinColumn()
  creator: User;

  @ApiProperty({
    description: 'Espacio donde se realiza el evento',
    type: () => Space,
  })
  @ManyToOne(() => Space, { eager: true })
  @JoinColumn()
  space: Space;

  @ApiProperty({ description: 'Deporte del evento', type: () => Sport })
  @ManyToOne(() => Sport, { eager: true })
  @JoinColumn()
  sport: Sport;

  @ApiProperty({ description: 'Participantes del evento', type: () => [User] })
  @ManyToMany(() => User, { eager: true })
  @JoinTable()
  participants: User[];
}
