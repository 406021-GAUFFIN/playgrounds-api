import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AccessibilityService } from './accessibility.service';
import { Accessibility } from './entities/accessibility.entity';

@ApiTags('Accessibility')
@Controller('accessibility')
export class AccessibilityController {
  constructor(private readonly accessibilityService: AccessibilityService) {}

  @Get()
  @ApiOperation({
    summary: 'Obtener todas las características de accesibilidad',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de características de accesibilidad',
    type: [Accessibility],
  })
  async findAll(): Promise<Accessibility[]> {
    return this.accessibilityService.findAll();
  }
}
