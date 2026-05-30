import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../common/firebase/firebase.service';
import { CreateVeterinarianDto } from './dto/create-veterinarian.dto';
import { UpdateVeterinarianDto } from './dto/update-veterinarian.dto';

export const VETS_COLLECTION = 'veterinarians';

export interface VeterinarianDocument {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialties: string[];
  availability: Array<{ weekday: number; startTime: string; endTime: string }>;
  createdAt: string;
  updatedAt: string;
}

@Injectable()
export class VeterinariansRepository {
  constructor(private readonly firebaseService: FirebaseService) {}

  private collection() {
    return this.firebaseService.firestore.collection(VETS_COLLECTION);
  }

  async createVeterinarian(
    input: CreateVeterinarianDto,
  ): Promise<VeterinarianDocument> {
    const now = new Date().toISOString();
    const payload = {
      ...input,
      specialties: input.specialties ?? [],
      availability: input.availability ?? [],
      createdAt: now,
      updatedAt: now,
    };
    const ref = await this.collection().add(payload);
    const snapshot = await ref.get();
    return {
      id: ref.id,
      ...(snapshot.data() as Omit<VeterinarianDocument, 'id'>),
    };
  }

  async findVeterinarianById(id: string): Promise<VeterinarianDocument | null> {
    const snapshot = await this.collection().doc(id).get();
    if (!snapshot.exists) return null;
    return {
      id: snapshot.id,
      ...(snapshot.data() as Omit<VeterinarianDocument, 'id'>),
    };
  }

  async listVeterinarians(): Promise<VeterinarianDocument[]> {
    const snapshot = await this.collection()
      .orderBy('lastName')
      .limit(500)
      .get();
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<VeterinarianDocument, 'id'>),
    }));
  }

  async updateVeterinarian(
    id: string,
    patch: UpdateVeterinarianDto,
  ): Promise<void> {
    await this.collection()
      .doc(id)
      .update({ ...patch, updatedAt: new Date().toISOString() });
  }

  async deleteVeterinarian(id: string): Promise<void> {
    await this.collection().doc(id).delete();
  }
}
