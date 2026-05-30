import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { FirebaseAuthGuard } from '../common/guards/firebase-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import type { AuthenticatedUser } from '../common/types/app-role';
import { CreateReminderDto } from './dto/create-reminder.dto';
import { UpdateReminderDto } from './dto/update-reminder.dto';
import { RemindersService } from './reminders.service';

@ApiTags('reminders')
@ApiBearerAuth()
@Controller('reminders')
@UseGuards(FirebaseAuthGuard, RolesGuard)
export class RemindersController {
  constructor(private readonly remindersService: RemindersService) {}

  @Get()
  listReminders(
    @CurrentUser() user: AuthenticatedUser,
    @Query('petId') petId?: string,
    @Query('type') type?: 'VACCINATION' | 'MEDICATION',
  ) {
    const listPromise = petId
      ? this.remindersService.listRemindersByPet(petId, user)
      : this.remindersService.listRemindersForUser(user);
    return listPromise.then((reminders) =>
      type ? reminders.filter((reminder) => reminder.type === type) : reminders,
    );
  }

  @Get(':id')
  getReminder(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.remindersService.getReminderById(id, user);
  }

  @Post()
  @Roles('ADMIN')
  createReminder(@Body() body: CreateReminderDto) {
    return this.remindersService.createReminder(body);
  }

  @Patch(':id')
  @Roles('ADMIN')
  updateReminder(@Param('id') id: string, @Body() body: UpdateReminderDto) {
    return this.remindersService.updateReminder(id, body);
  }

  @Delete(':id')
  @Roles('ADMIN')
  deleteReminder(@Param('id') id: string) {
    return this.remindersService.deleteReminder(id);
  }
}
