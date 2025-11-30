import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Accessibility } from './entities/accessibility.entity';

@Injectable()
export class AccessibilityRepository extends Repository<Accessibility> {
  constructor(private dataSource: DataSource) {
    super(Accessibility, dataSource.createEntityManager());
  }

  async findAllAccessibilities(): Promise<Accessibility[]> {
    return this.find();
  }
}
