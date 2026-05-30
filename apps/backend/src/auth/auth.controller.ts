import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { FirebaseAuthGuard } from '../common/guards/firebase-auth.guard';
import type { AuthenticatedUser } from '../common/types/app-role';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  @Get('me')
  @ApiBearerAuth()
  @UseGuards(FirebaseAuthGuard)
  getCurrentUser(@CurrentUser() user: AuthenticatedUser) {
    return user;
  }
}
