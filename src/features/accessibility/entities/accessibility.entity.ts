import { Entity, Column, ManyToMany } from 'typeorm';
import { EntityBase } from '../../../common/entity/base.entity';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { Space } from '../../spaces/entities/space.entity';

@Entity('accessibilities')
export class Accessibility extends EntityBase {
  @ApiProperty({
    description: 'Nombre de la característica de accesibilidad',
    example: 'Rampa de acceso',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @Column({ unique: true })
  name: string;

  @ApiProperty({
    description: 'Descripción de la característica',
    example: 'Rampa para sillas de ruedas en la entrada principal',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Column({ type: 'text', nullable: true })
  description: string;

  @ManyToMany(() => Space, (space) => space.accessibilities)
  spaces: Space[];
}
