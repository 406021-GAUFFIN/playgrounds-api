import { Injectable } from '@nestjs/common';
import { AccessibilityRepository } from './accessibility.repository';
import { Accessibility } from './entities/accessibility.entity';

@Injectable()
export class AccessibilityService {
  constructor(
    private readonly accessibilityRepository: AccessibilityRepository,
  ) {}

  async findAll(): Promise<Accessibility[]> {
    return this.accessibilityRepository.findAllAccessibilities();
  }
}
