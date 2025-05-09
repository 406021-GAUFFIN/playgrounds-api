import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { SpacesService } from './spaces.service';
import { CreateSpaceDto } from './dto/create-space.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Space } from './entities/space.entity';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { SpacePaginationDto, SpaceQueryDto } from './dto/space.dto';

@ApiTags('Spaces')
@Controller('spaces')
export class SpacesController {
  constructor(private readonly spacesService: SpacesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new space' })
  @ApiResponse({
    status: 201,
    description: 'Space created successfully',
    type: Space,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 409, description: 'Space already exists' })
  create(@Body() createSpaceDto: CreateSpaceDto, @Req() req) {
    return this.spacesService.create(createSpaceDto, req.user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all active spaces' })
  @ApiResponse({
    status: 200,
    description: 'Return all active spaces',
    type: SpacePaginationDto,
  })
  async findAll(@Query() query: SpaceQueryDto) {
    return this.spacesService.findSpacesByFiltersPaginated(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a space by id' })
  @ApiResponse({ status: 200, description: 'Return the space', type: Space })
  findOne(@Param('id') id: string) {
    return this.spacesService.findOne(+id);
  }
}
