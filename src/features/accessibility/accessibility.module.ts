import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccessibilityController } from './accessibility.controller';
import { AccessibilityService } from './accessibility.service';
import { AccessibilityRepository } from './accessibility.repository';
import { Accessibility } from './entities/accessibility.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Accessibility])],
  controllers: [AccessibilityController],
  providers: [AccessibilityService, AccessibilityRepository],
  exports: [AccessibilityService, AccessibilityRepository],
})
export class AccessibilityModule {}
