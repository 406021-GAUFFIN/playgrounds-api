import { Entity, Column } from 'typeorm';
import { EntityBase } from '../../../common/entity/base.entity';

@Entity('sports')
export class Sport extends EntityBase {
  @Column({ length: 100 })
  name: string;

  @Column({ type: 'text' })
  pictogram: string;

  @Column({ type: 'int', nullable: true })
  minParticipants: number;

  @Column({ type: 'int', nullable: true })
  maxParticipants: number;
}
