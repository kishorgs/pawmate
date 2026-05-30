import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { OwnersRepository } from '../owners/owners.repository';
import { AuthenticatedUser } from '../common/types/app-role';
import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';
import { PetDocument, PetsRepository } from './pets.repository';

@Injectable()
export class PetsService {
  constructor(
    private readonly petsRepository: PetsRepository,
    private readonly ownersRepository: OwnersRepository,
  ) {}

  async listPetsForUser(user: AuthenticatedUser): Promise<PetDocument[]> {
    if (user.role === 'ADMIN') return this.petsRepository.listAllPets();
    const owner = await this.ownersRepository.findOwnerByUserUid(user.uid);
    if (!owner) return [];
    return this.petsRepository.listPetsByOwner(owner.id);
  }

  async listPetsForOwner(ownerId: string, user: AuthenticatedUser): Promise<PetDocument[]> {
    await this.assertOwnerAccess(ownerId, user);
    return this.petsRepository.listPetsByOwner(ownerId);
  }

  async getPetById(id: string, user: AuthenticatedUser): Promise<PetDocument> {
    const pet = await this.petsRepository.findPetById(id);
    if (!pet) throw new NotFoundException('Pet not found');
    await this.assertPetAccess(pet.ownerId, user);
    return pet;
  }

  createPet(input: CreatePetDto): Promise<PetDocument> {
    return this.petsRepository.createPet(input);
  }

  async updatePet(id: string, patch: UpdatePetDto): Promise<void> {
    const pet = await this.petsRepository.findPetById(id);
    if (!pet) throw new NotFoundException('Pet not found');
    await this.petsRepository.updatePet(id, patch);
  }

  async deletePet(id: string): Promise<void> {
    const pet = await this.petsRepository.findPetById(id);
    if (!pet) throw new NotFoundException('Pet not found');
    await this.petsRepository.deletePet(id);
  }

  private async assertPetAccess(ownerId: string, user: AuthenticatedUser): Promise<void> {
    if (user.role === 'ADMIN') return;
    const owner = await this.ownersRepository.findOwnerByUserUid(user.uid);
    if (!owner || owner.id !== ownerId) throw new ForbiddenException();
  }

  private async assertOwnerAccess(ownerId: string, user: AuthenticatedUser): Promise<void> {
    if (user.role === 'ADMIN') return;
    const owner = await this.ownersRepository.findOwnerByUserUid(user.uid);
    if (!owner || owner.id !== ownerId) throw new ForbiddenException();
  }
}
