import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../common/firebase/firebase.service';
import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';

export const PETS_COLLECTION = 'pets';

export interface PetDocument {
  id: string;
  name: string;
  birthDate: string;
  petType: string;
  gender: string;
  weightKg?: number;
  photoUrl?: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable()
export class PetsRepository {
  constructor(private readonly firebaseService: FirebaseService) {}

  private collection() {
    return this.firebaseService.firestore.collection(PETS_COLLECTION);
  }

  async createPet(input: CreatePetDto): Promise<PetDocument> {
    const now = new Date().toISOString();
    const ref = await this.collection().add({ ...input, createdAt: now, updatedAt: now });
    const snapshot = await ref.get();
    return { id: ref.id, ...(snapshot.data() as Omit<PetDocument, 'id'>) };
  }

  async findPetById(id: string): Promise<PetDocument | null> {
    const snapshot = await this.collection().doc(id).get();
    if (!snapshot.exists) return null;
    return { id: snapshot.id, ...(snapshot.data() as Omit<PetDocument, 'id'>) };
  }

  async listPetsByOwner(ownerId: string): Promise<PetDocument[]> {
    const snapshot = await this.collection()
      .where('ownerId', '==', ownerId)
      .orderBy('name')
      .limit(500)
      .get();
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<PetDocument, 'id'>),
    }));
  }

  async listAllPets(): Promise<PetDocument[]> {
    const snapshot = await this.collection().orderBy('name').limit(1000).get();
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<PetDocument, 'id'>),
    }));
  }

  async updatePet(id: string, patch: UpdatePetDto): Promise<void> {
    await this.collection()
      .doc(id)
      .update({ ...patch, updatedAt: new Date().toISOString() });
  }

  async deletePet(id: string): Promise<void> {
    await this.collection().doc(id).delete();
  }
}
