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
import { CreateVisitDto } from './dto/create-visit.dto';
import { UpdateVisitDto } from './dto/update-visit.dto';
import { VisitsService } from './visits.service';

@ApiTags('visits')
@ApiBearerAuth()
@Controller('visits')
@UseGuards(FirebaseAuthGuard, RolesGuard)
export class VisitsController {
  constructor(private readonly visitsService: VisitsService) {}

  @Get()
  listVisits(
    @CurrentUser() user: AuthenticatedUser,
    @Query('petId') petId?: string,
  ) {
    return petId
      ? this.visitsService.listVisitsByPet(petId, user)
      : this.visitsService.listVisitsForUser(user);
  }

  @Get(':id')
  getVisit(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.visitsService.getVisitById(id, user);
  }

  @Post()
  @Roles('ADMIN')
  createVisit(@Body() body: CreateVisitDto) {
    return this.visitsService.createVisit(body);
  }

  @Patch(':id')
  @Roles('ADMIN')
  updateVisit(@Param('id') id: string, @Body() body: UpdateVisitDto) {
    return this.visitsService.updateVisit(id, body);
  }

  @Delete(':id')
  @Roles('ADMIN')
  deleteVisit(@Param('id') id: string) {
    return this.visitsService.deleteVisit(id);
  }
}
