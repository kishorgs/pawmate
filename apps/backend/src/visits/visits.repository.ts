import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../common/firebase/firebase.service';
import { CreateVisitDto } from './dto/create-visit.dto';
import { UpdateVisitDto } from './dto/update-visit.dto';

export const VISITS_COLLECTION = 'visits';

export interface VisitDocument {
  id: string;
  petId: string;
  ownerId: string;
  veterinarianId: string;
  visitDate: string;
  description: string;
  diagnosis: string;
  notes: string;
  prescriptionNotes: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable()
export class VisitsRepository {
  constructor(private readonly firebaseService: FirebaseService) {}

  private collection() {
    return this.firebaseService.firestore.collection(VISITS_COLLECTION);
  }

  async createVisit(input: CreateVisitDto & { ownerId: string }): Promise<VisitDocument> {
    const now = new Date().toISOString();
    const ref = await this.collection().add({
      ...input,
      diagnosis: input.diagnosis ?? '',
      notes: input.notes ?? '',
      prescriptionNotes: input.prescriptionNotes ?? '',
      createdAt: now,
      updatedAt: now,
    });
    const snapshot = await ref.get();
    return { id: ref.id, ...(snapshot.data() as Omit<VisitDocument, 'id'>) };
  }

  async findVisitById(id: string): Promise<VisitDocument | null> {
    const snapshot = await this.collection().doc(id).get();
    if (!snapshot.exists) return null;
    return { id: snapshot.id, ...(snapshot.data() as Omit<VisitDocument, 'id'>) };
  }

  async listVisitsByPet(petId: string): Promise<VisitDocument[]> {
    const snapshot = await this.collection().where('petId', '==', petId).limit(500).get();
    return snapshot.docs
      .map((doc) => ({ id: doc.id, ...(doc.data() as Omit<VisitDocument, 'id'>) }))
      .sort((a, b) => b.visitDate.localeCompare(a.visitDate));
  }

  async listAllVisits(): Promise<VisitDocument[]> {
    const snapshot = await this.collection().limit(1000).get();
    return snapshot.docs
      .map((doc) => ({ id: doc.id, ...(doc.data() as Omit<VisitDocument, 'id'>) }))
      .sort((a, b) => b.visitDate.localeCompare(a.visitDate));
  }

  async updateVisit(id: string, patch: UpdateVisitDto): Promise<void> {
    await this.collection()
      .doc(id)
      .update({ ...patch, updatedAt: new Date().toISOString() });
  }

  async deleteVisit(id: string): Promise<void> {
    await this.collection().doc(id).delete();
  }
}
