import { Entity, Column, ManyToMany, JoinTable } from 'typeorm';
import { EntityBase } from '../../../common/entity/base.entity';
import { Sport } from '../../sports/entities/sport.entity';

@Entity('spaces')
export class Space extends EntityBase {
  @Column({ length: 100 })
  name: string;

  @Column({ length: 200 })
  address: string;

  @Column({ type: 'text', nullable: true })
  schedule: string;

  @Column({ type: 'text' })
  conditions: string;

  @Column({ default: false })
  isAccessible: boolean;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'float' })
  latitude: number;

  @Column({ type: 'float' })
  longitude: number;

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
}
