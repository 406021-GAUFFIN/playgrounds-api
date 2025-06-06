import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
  Query,
  Put,
  Request,
} from '@nestjs/common';
import { SpacesService } from './spaces.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { Space } from './entities/space.entity';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import {
  CreateSpaceDto,
  SpacePaginationDto,
  SpaceQueryDto,
} from './dto/space.dto';
import { UpdateSpaceDto } from './dto/update-space.dto';
import { CreateSpaceRatingDto } from './dto/create-space-rating.dto';
import { SpaceRating } from './entities/space-rating.entity';
import { CanRateResponseDto } from './dto/can-rate-response.dto';

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

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a space' })
  @ApiBody({ type: UpdateSpaceDto })
  @ApiResponse({
    status: 200,
    description: 'Space updated successfully',
    type: Space,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Only admins can update spaces',
  })
  @ApiResponse({ status: 404, description: 'Space not found' })
  async update(
    @Param('id') id: string,
    @Body() updateSpaceDto: UpdateSpaceDto,
    @Req() req,
  ) {
    return this.spacesService.update(+id, updateSpaceDto, req.user);
  }

  @Post(':id/ratings')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Calificar un espacio' })
  @ApiResponse({
    status: 201,
    description: 'Calificación creada exitosamente',
    type: SpaceRating,
  })
  @ApiResponse({ status: 400, description: 'Solicitud inválida' })
  @ApiResponse({ status: 404, description: 'Espacio no encontrado' })
  createRating(
    @Param('id') id: string,
    @Body() createSpaceRatingDto: CreateSpaceRatingDto,
    @Request() req,
  ): Promise<SpaceRating> {
    return this.spacesService.createRating(
      +id,
      req.user.id,
      createSpaceRatingDto,
    );
  }

  @Get(':id/ratings')
  @ApiOperation({ summary: 'Obtener calificaciones de un espacio' })
  @ApiResponse({
    status: 200,
    description: 'Lista de calificaciones',
    type: [SpaceRating],
  })
  @ApiResponse({ status: 404, description: 'Espacio no encontrado' })
  getRatings(@Param('id') id: string): Promise<SpaceRating[]> {
    return this.spacesService.getRatings(+id);
  }

  @Get(':id/can-rate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Verificar si el usuario puede calificar un espacio',
  })
  @ApiResponse({
    status: 200,
    description: 'Información sobre si el usuario puede calificar',
    type: CanRateResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Espacio no encontrado' })
  canRateSpace(
    @Param('id') id: string,
    @Request() req,
  ): Promise<CanRateResponseDto> {
    return this.spacesService.canUserRateSpace(+id, req.user.id);
  }
}
