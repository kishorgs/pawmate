import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateVeterinarianDto } from './dto/create-veterinarian.dto';
import { UpdateVeterinarianDto } from './dto/update-veterinarian.dto';
import {
  VeterinarianDocument,
  VeterinariansRepository,
} from './veterinarians.repository';

@Injectable()
export class VeterinariansService {
  constructor(private readonly veterinariansRepository: VeterinariansRepository) {}

  listVeterinarians(): Promise<VeterinarianDocument[]> {
    return this.veterinariansRepository.listVeterinarians();
  }

  async getVeterinarianById(id: string): Promise<VeterinarianDocument> {
    const vet = await this.veterinariansRepository.findVeterinarianById(id);
    if (!vet) throw new NotFoundException('Veterinarian not found');
    return vet;
  }

  createVeterinarian(input: CreateVeterinarianDto): Promise<VeterinarianDocument> {
    return this.veterinariansRepository.createVeterinarian(input);
  }

  async updateVeterinarian(id: string, patch: UpdateVeterinarianDto): Promise<void> {
    await this.getVeterinarianById(id);
    await this.veterinariansRepository.updateVeterinarian(id, patch);
  }

  async deleteVeterinarian(id: string): Promise<void> {
    await this.getVeterinarianById(id);
    await this.veterinariansRepository.deleteVeterinarian(id);
  }
}
