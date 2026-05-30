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
import { CreateOwnerDto } from './dto/create-owner.dto';
import { UpdateOwnerDto } from './dto/update-owner.dto';
import { OwnersService } from './owners.service';

@ApiTags('owners')
@ApiBearerAuth()
@Controller('owners')
@UseGuards(FirebaseAuthGuard, RolesGuard)
export class OwnersController {
  constructor(private readonly ownersService: OwnersService) {}

  @Get()
  @Roles('ADMIN')
  listOwners(@Query('search') search?: string) {
    return search
      ? this.ownersService.searchOwners(search)
      : this.ownersService.listAllOwners();
  }

  @Get(':id')
  getOwner(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.ownersService.getOwnerById(id, user);
  }

  @Post()
  @Roles('ADMIN')
  createOwner(@Body() body: CreateOwnerDto) {
    return this.ownersService.createOwner(body);
  }

  @Patch(':id')
  @Roles('ADMIN')
  updateOwner(@Param('id') id: string, @Body() body: UpdateOwnerDto) {
    return this.ownersService.updateOwner(id, body);
  }

  @Delete(':id')
  @Roles('ADMIN')
  deleteOwner(@Param('id') id: string) {
    return this.ownersService.deleteOwner(id);
  }
}
