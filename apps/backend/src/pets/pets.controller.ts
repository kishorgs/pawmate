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
import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';
import { PetsService } from './pets.service';

@ApiTags('pets')
@ApiBearerAuth()
@Controller('pets')
@UseGuards(FirebaseAuthGuard, RolesGuard)
export class PetsController {
  constructor(private readonly petsService: PetsService) {}

  @Get()
  listPets(
    @CurrentUser() user: AuthenticatedUser,
    @Query('ownerId') ownerId?: string,
  ) {
    return ownerId
      ? this.petsService.listPetsForOwner(ownerId, user)
      : this.petsService.listPetsForUser(user);
  }

  @Get(':id')
  getPet(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.petsService.getPetById(id, user);
  }

  @Post()
  @Roles('ADMIN')
  createPet(@Body() body: CreatePetDto) {
    return this.petsService.createPet(body);
  }

  @Patch(':id')
  @Roles('ADMIN')
  updatePet(@Param('id') id: string, @Body() body: UpdatePetDto) {
    return this.petsService.updatePet(id, body);
  }

  @Delete(':id')
  @Roles('ADMIN')
  deletePet(@Param('id') id: string) {
    return this.petsService.deletePet(id);
  }
}
