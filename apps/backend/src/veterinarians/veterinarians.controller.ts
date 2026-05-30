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
import { Roles } from '../common/decorators/roles.decorator';
import { FirebaseAuthGuard } from '../common/guards/firebase-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CreateVeterinarianDto } from './dto/create-veterinarian.dto';
import { UpdateVeterinarianDto } from './dto/update-veterinarian.dto';
import { VeterinariansService } from './veterinarians.service';

@ApiTags('veterinarians')
@ApiBearerAuth()
@Controller('veterinarians')
@UseGuards(FirebaseAuthGuard, RolesGuard)
export class VeterinariansController {
  constructor(private readonly veterinariansService: VeterinariansService) {}

  @Get()
  listVeterinarians() {
    return this.veterinariansService.listVeterinarians();
  }

  @Get(':id')
  getVeterinarian(@Param('id') id: string) {
    return this.veterinariansService.getVeterinarianById(id);
  }

  @Post()
  @Roles('ADMIN')
  createVeterinarian(@Body() body: CreateVeterinarianDto) {
    return this.veterinariansService.createVeterinarian(body);
  }

  @Patch(':id')
  @Roles('ADMIN')
  updateVeterinarian(@Param('id') id: string, @Body() body: UpdateVeterinarianDto) {
    return this.veterinariansService.updateVeterinarian(id, body);
  }

  @Delete(':id')
  @Roles('ADMIN')
  deleteVeterinarian(@Param('id') id: string) {
    return this.veterinariansService.deleteVeterinarian(id);
  }
}
