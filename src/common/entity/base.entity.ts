import {
  CreateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export class EntityBase {
  @ApiProperty({
    description: 'Id',
    type: Number,
  })
  @PrimaryGeneratedColumn()
  id?: number;

  @DeleteDateColumn({ select: false, nullable: true })
  deletedAt?: Date;

  @ApiProperty({
    description: 'Creation Date',
    type: Date,
  })
  @CreateDateColumn()
  createdAt?: Date;

  @ApiProperty({
    description: 'Updated Date',
    type: Date,
  })
  @UpdateDateColumn()
  updatedAt?: Date;
}
