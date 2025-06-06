import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { EntityBase } from '../../../common/entity/base.entity';
import { Space } from './space.entity';
import { User } from '../../users/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsOptional, Min, Max } from 'class-validator';

@Entity('space_ratings')
export class SpaceRating extends EntityBase {
  @ApiProperty({
    description: 'Calificación del espacio (1-5)',
    example: 5,
    required: true,
  })
  @IsNumber()
  @Min(1)
  @Max(5)
  @Column({ type: 'int' })
  rating: number;

  @ApiProperty({
    description: 'Comentario sobre el espacio',
    example: 'Excelente espacio, muy bien mantenido',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Column({ type: 'text', nullable: true })
  comment: string;

  @ManyToOne(() => Space, (space) => space.ratings)
  @JoinColumn({ name: 'space_id' })
  space: Space;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
