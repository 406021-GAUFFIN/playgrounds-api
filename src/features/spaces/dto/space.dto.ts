import { ApiProperty, OmitType } from '@nestjs/swagger';
import { Space } from '../entities/space.entity';
import {
  PaginationDto,
  RequestPaginationDto,
} from 'src/common/dto/Pagination.dto';
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class SpacePaginationDto extends PaginationDto<Space> {
  @ApiProperty({ type: Space, isArray: true })
  data: Space[];
}

export class SpaceQueryDto extends RequestPaginationDto {
  @ApiProperty({ description: 'Name filter', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ description: 'Filter by active status', required: false })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  isActive?: boolean;

  @ApiProperty({ description: 'Minimum latitude', required: false })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  minLat?: number;

  @ApiProperty({ description: 'Maximum latitude', required: false })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  maxLat?: number;

  @ApiProperty({ description: 'Minimum longitude', required: false })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  minLng?: number;

  @ApiProperty({ description: 'Maximum longitude', required: false })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  maxLng?: number;
}

export class CreateSpaceDto extends OmitType(Space, [
  'id',
  'createdAt',
  'deletedAt',
  'updatedAt',
  'sports',
] as const) {
  @ApiProperty({
    description: 'Deportes disponibles en el espacio',
    type: [Number],
    required: false,
  })
  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  sportIds: number[];
}
