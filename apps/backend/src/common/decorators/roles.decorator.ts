import { SetMetadata } from '@nestjs/common';
import { AppRole } from '../types/app-role';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: AppRole[]) => SetMetadata(ROLES_KEY, roles);
