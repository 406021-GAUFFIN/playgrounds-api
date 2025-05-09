import { ApiProperty, OmitType } from '@nestjs/swagger';
import { Space } from '../entities/space.entity';
import {
  PaginationDto,
  RequestPaginationDto,
} from 'src/common/dto/Pagination.dto';
import { IsArray, IsNumber, IsString } from 'class-validator';
import { IsOptional } from 'class-validator';

export class SpacePaginationDto extends PaginationDto<Space> {
  @ApiProperty({ type: Space, isArray: true })
  data: Space[];
}

export class SpaceQueryDto extends RequestPaginationDto {
  @ApiProperty({ description: 'Name filter', required: false })
  @IsString()
  @IsOptional()
  name?: string;
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
