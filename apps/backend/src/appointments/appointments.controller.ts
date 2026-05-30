import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { FirebaseAuthGuard } from '../common/guards/firebase-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import type { AuthenticatedUser } from '../common/types/app-role';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { AppointmentsService } from './appointments.service';

@ApiTags('appointments')
@ApiBearerAuth()
@Controller('appointments')
@UseGuards(FirebaseAuthGuard, RolesGuard)
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Get()
  listAppointments(@CurrentUser() user: AuthenticatedUser) {
    return this.appointmentsService.listAppointmentsForUser(user);
  }

  @Get(':id')
  getAppointment(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.appointmentsService.getAppointmentById(id, user);
  }

  @Post()
  @Roles('ADMIN')
  createAppointment(@Body() body: CreateAppointmentDto) {
    return this.appointmentsService.createAppointment(body);
  }

  @Patch(':id')
  @Roles('ADMIN')
  updateAppointment(@Param('id') id: string, @Body() body: UpdateAppointmentDto) {
    return this.appointmentsService.updateAppointment(id, body);
  }

  @Delete(':id')
  @Roles('ADMIN')
  deleteAppointment(@Param('id') id: string) {
    return this.appointmentsService.deleteAppointment(id);
  }
}
