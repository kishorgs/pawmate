import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { OwnersRepository } from '../owners/owners.repository';
import { PetsRepository } from '../pets/pets.repository';
import { AuthenticatedUser } from '../common/types/app-role';
import { CreateVisitDto } from './dto/create-visit.dto';
import { UpdateVisitDto } from './dto/update-visit.dto';
import { VisitDocument, VisitsRepository } from './visits.repository';

@Injectable()
export class VisitsService {
  constructor(
    private readonly visitsRepository: VisitsRepository,
    private readonly petsRepository: PetsRepository,
    private readonly ownersRepository: OwnersRepository,
  ) {}

  async listVisitsForUser(user: AuthenticatedUser): Promise<VisitDocument[]> {
    if (user.role === 'ADMIN') return this.visitsRepository.listAllVisits();
    const owner = await this.ownersRepository.findOwnerByUserUid(user.uid);
    if (!owner) return [];
    const pets = await this.petsRepository.listPetsByOwner(owner.id);
    const visits = await Promise.all(
      pets.map((pet) => this.visitsRepository.listVisitsByPet(pet.id)),
    );
    return visits.flat().sort((a, b) => b.visitDate.localeCompare(a.visitDate));
  }

  async listVisitsByPet(petId: string, user: AuthenticatedUser): Promise<VisitDocument[]> {
    const pet = await this.petsRepository.findPetById(petId);
    if (!pet) throw new NotFoundException('Pet not found');
    if (user.role !== 'ADMIN') {
      const owner = await this.ownersRepository.findOwnerByUserUid(user.uid);
      if (!owner || owner.id !== pet.ownerId) throw new ForbiddenException();
    }
    return this.visitsRepository.listVisitsByPet(petId);
  }

  async getVisitById(id: string, user: AuthenticatedUser): Promise<VisitDocument> {
    const visit = await this.visitsRepository.findVisitById(id);
    if (!visit) throw new NotFoundException('Visit not found');
    if (user.role !== 'ADMIN') {
      const owner = await this.ownersRepository.findOwnerByUserUid(user.uid);
      if (!owner || owner.id !== visit.ownerId) throw new ForbiddenException();
    }
    return visit;
  }

  async createVisit(input: CreateVisitDto): Promise<VisitDocument> {
    const pet = await this.petsRepository.findPetById(input.petId);
    if (!pet) throw new NotFoundException('Pet not found');
    return this.visitsRepository.createVisit({ ...input, ownerId: pet.ownerId });
  }

  async updateVisit(id: string, patch: UpdateVisitDto): Promise<void> {
    const visit = await this.visitsRepository.findVisitById(id);
    if (!visit) throw new NotFoundException('Visit not found');
    await this.visitsRepository.updateVisit(id, patch);
  }

  async deleteVisit(id: string): Promise<void> {
    const visit = await this.visitsRepository.findVisitById(id);
    if (!visit) throw new NotFoundException('Visit not found');
    await this.visitsRepository.deleteVisit(id);
  }
}
