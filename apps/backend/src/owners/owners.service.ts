import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { AuthenticatedUser } from '../common/types/app-role';
import { CreateOwnerDto } from './dto/create-owner.dto';
import { UpdateOwnerDto } from './dto/update-owner.dto';
import { OwnerDocument, OwnersRepository } from './owners.repository';

@Injectable()
export class OwnersService {
  constructor(private readonly ownersRepository: OwnersRepository) {}

  listAllOwners(): Promise<OwnerDocument[]> {
    return this.ownersRepository.listOwners();
  }

  async getOwnerById(id: string, user: AuthenticatedUser): Promise<OwnerDocument> {
    const owner = await this.ownersRepository.findOwnerById(id);
    if (!owner) throw new NotFoundException('Owner not found');
    if (user.role !== 'ADMIN' && owner.userUid !== user.uid) {
      throw new ForbiddenException();
    }
    return owner;
  }

  createOwner(input: CreateOwnerDto): Promise<OwnerDocument> {
    return this.ownersRepository.createOwner(input);
  }

  async updateOwner(id: string, patch: UpdateOwnerDto): Promise<void> {
    const owner = await this.ownersRepository.findOwnerById(id);
    if (!owner) throw new NotFoundException('Owner not found');
    await this.ownersRepository.updateOwner(id, patch);
  }

  async deleteOwner(id: string): Promise<void> {
    const owner = await this.ownersRepository.findOwnerById(id);
    if (!owner) throw new NotFoundException('Owner not found');
    await this.ownersRepository.deleteOwner(id);
  }

  async searchOwners(query: string): Promise<OwnerDocument[]> {
    const owners = await this.ownersRepository.listOwners();
    const normalized = query.trim().toLowerCase();
    if (!normalized) return owners;
    return owners.filter(
      (owner) =>
        owner.firstName.toLowerCase().includes(normalized) ||
        owner.lastName.toLowerCase().includes(normalized) ||
        owner.email.toLowerCase().includes(normalized) ||
        owner.phone.includes(normalized),
    );
  }
}
