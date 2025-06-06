import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsOptional, Min, Max } from 'class-validator';

export class CreateSpaceRatingDto {
  @ApiProperty({
    description: 'Calificación del espacio (1-5)',
    example: 5,
    required: true,
  })
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({
    description: 'Comentario sobre el espacio',
    example: 'Excelente espacio, muy bien mantenido',
    required: false,
  })
  @IsString()
  @IsOptional()
  comment?: string;
}
