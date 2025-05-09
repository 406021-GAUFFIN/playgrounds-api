import { ApiProperty } from '@nestjs/swagger';
import { Space } from '../entities/space.entity';
import {
  PaginationDto,
  RequestPaginationDto,
} from '../../../common/dto/pagination.dto';
import { IsString } from 'class-validator';
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
