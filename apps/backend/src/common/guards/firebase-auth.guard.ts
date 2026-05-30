import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { FirebaseService } from '../firebase/firebase.service';
import { UsersRepository } from '../../users/users.repository';
import { AuthenticatedUser } from '../types/app-role';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly usersRepository: UsersRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request & { user?: AuthenticatedUser }>();
    const header = request.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing bearer token');
    }
    const idToken = header.slice('Bearer '.length).trim();
    let decoded;
    try {
      decoded = await this.firebaseService.verifyIdToken(idToken);
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
    const userDocument = await this.usersRepository.ensureUserDocument({
      uid: decoded.uid,
      email: decoded.email ?? null,
    });
    request.user = {
      uid: decoded.uid,
      email: decoded.email ?? null,
      role: userDocument.role,
      ownerId: userDocument.ownerId ?? null,
    };
    return true;
  }
}
