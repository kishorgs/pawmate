import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../common/firebase/firebase.service';
import { CreateOwnerDto } from './dto/create-owner.dto';
import { UpdateOwnerDto } from './dto/update-owner.dto';

export const OWNERS_COLLECTION = 'owners';

export interface OwnerDocument {
  id: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  userUid: string | null;
  createdAt: string;
  updatedAt: string;
}

@Injectable()
export class OwnersRepository {
  constructor(private readonly firebaseService: FirebaseService) {}

  private collection() {
    return this.firebaseService.firestore.collection(OWNERS_COLLECTION);
  }

  async createOwner(input: CreateOwnerDto & { userUid?: string | null }): Promise<OwnerDocument> {
    const now = new Date().toISOString();
    const ref = await this.collection().add({
      ...input,
      userUid: input.userUid ?? null,
      createdAt: now,
      updatedAt: now,
    });
    const snapshot = await ref.get();
    return { id: ref.id, ...(snapshot.data() as Omit<OwnerDocument, 'id'>) };
  }

  async findOwnerById(id: string): Promise<OwnerDocument | null> {
    const snapshot = await this.collection().doc(id).get();
    if (!snapshot.exists) return null;
    return { id: snapshot.id, ...(snapshot.data() as Omit<OwnerDocument, 'id'>) };
  }

  async findOwnerByUserUid(uid: string): Promise<OwnerDocument | null> {
    const snapshot = await this.collection().where('userUid', '==', uid).limit(1).get();
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return { id: doc.id, ...(doc.data() as Omit<OwnerDocument, 'id'>) };
  }

  async listOwners(): Promise<OwnerDocument[]> {
    const snapshot = await this.collection().orderBy('lastName').limit(500).get();
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<OwnerDocument, 'id'>),
    }));
  }

  async updateOwner(id: string, patch: UpdateOwnerDto): Promise<void> {
    await this.collection()
      .doc(id)
      .update({ ...patch, updatedAt: new Date().toISOString() });
  }

  async deleteOwner(id: string): Promise<void> {
    await this.collection().doc(id).delete();
  }
}
