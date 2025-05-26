import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
  Put,
  Query,
  Delete,
  ParseIntPipe,
  Request,
} from '@nestjs/common';
import { EventsService } from './events.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { Event } from './entities/event.entity';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { CreateEventDto } from './dto/create-event.dto';
import { RequestWithUser } from '../auth/types/request.user.type';
import { EventQueryDto } from './dto/event-query.dto';
import { PaginationDto } from '../../common/dto/Pagination.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@ApiTags('Events')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener eventos con filtros' })
  @ApiResponse({
    status: 200,
    description: 'Lista de eventos paginada',
    type: PaginationDto<Event>,
  })
  async findAll(@Query() query: EventQueryDto) {
    return this.eventsService.findEventsByFiltersPaginated(query);
  }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new event' })
  @ApiBody({ type: CreateEventDto })
  @ApiResponse({
    status: 201,
    description: 'Event created successfully',
    type: Event,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Space or Sport not found' })
  create(@Body() createEventDto: CreateEventDto, @Req() req: RequestWithUser) {
    return this.eventsService.create(createEventDto, req.user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an event by id' })
  @ApiResponse({ status: 200, description: 'Return the event', type: Event })
  @ApiResponse({ status: 404, description: 'Event not found' })
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(+id);
  }

  @Put(':id/join')
  @ApiOperation({ summary: 'Join an event' })
  @ApiResponse({
    status: 200,
    description: 'Successfully joined the event',
    type: Event,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  @ApiResponse({ status: 400, description: 'Cannot join event' })
  joinEvent(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.eventsService.joinEvent(+id, req.user);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar un evento' })
  @ApiBody({ type: UpdateEventDto })
  @ApiResponse({
    status: 200,
    description: 'Evento actualizado exitosamente',
    type: Event,
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({
    status: 403,
    description: 'Solo el creador puede editar el evento',
  })
  @ApiResponse({ status: 404, description: 'Evento no encontrado' })
  @ApiResponse({
    status: 400,
    description: 'No se puede editar el evento en su estado actual',
  })
  update(
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventDto,
    @Req() req: RequestWithUser,
  ) {
    return this.eventsService.update(+id, updateEventDto, req.user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Cancel an event' })
  @ApiResponse({
    status: 200,
    description: 'The event has been successfully cancelled',
  })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async cancel(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
  ): Promise<Event> {
    return this.eventsService.cancel(id, req.user);
  }

  @Put(':id/leave')
  @ApiOperation({ summary: 'Salir de un evento' })
  @ApiResponse({
    status: 200,
    description: 'Se ha salido del evento exitosamente',
    type: Event,
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Evento no encontrado' })
  @ApiResponse({ status: 400, description: 'No se puede salir del evento' })
  leaveEvent(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.eventsService.leaveEvent(+id, req.user);
  }
}
