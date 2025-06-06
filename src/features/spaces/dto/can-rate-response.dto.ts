import { ApiProperty } from '@nestjs/swagger';

export class CanRateResponseDto {
  @ApiProperty({
    description: 'Indica si el usuario puede calificar el espacio',
    example: true,
  })
  canRate: boolean;

  @ApiProperty({
    description: 'Razón por la que el usuario no puede calificar (si aplica)',
    example: 'Ya has calificado este espacio',
    required: false,
  })
  reason?: string;
}
