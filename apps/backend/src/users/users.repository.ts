import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../common/firebase/firebase.service';
import { AppRole } from '../common/types/app-role';

export const USERS_COLLECTION = 'users';

export interface UserDocument {
  uid: string;
  email: string | null;
  role: AppRole;
  ownerId: string | null;
  createdAt: string;
  updatedAt: string;
}

@Injectable()
export class UsersRepository {
  constructor(private readonly firebaseService: FirebaseService) {}

  private collection() {
    return this.firebaseService.firestore.collection(USERS_COLLECTION);
  }

  async getUserDocument(uid: string): Promise<UserDocument | null> {
    const snapshot = await this.collection().doc(uid).get();
    if (!snapshot.exists) return null;
    return { uid, ...(snapshot.data() as Omit<UserDocument, 'uid'>) };
  }

  async ensureUserDocument(input: {
    uid: string;
    email: string | null;
  }): Promise<UserDocument> {
    const existing = await this.getUserDocument(input.uid);
    if (existing) return existing;

    const anyUsers = await this.collection().limit(1).get();
    const initialRole: AppRole = anyUsers.empty ? 'ADMIN' : 'OWNER';
    const now = new Date().toISOString();
    const newDoc: UserDocument = {
      uid: input.uid,
      email: input.email,
      role: initialRole,
      ownerId: null,
      createdAt: now,
      updatedAt: now,
    };
    await this.collection().doc(input.uid).set(newDoc);
    return newDoc;
  }

  async linkOwnerToUser(uid: string, ownerId: string): Promise<void> {
    await this.collection().doc(uid).update({
      ownerId,
      updatedAt: new Date().toISOString(),
    });
  }
}
