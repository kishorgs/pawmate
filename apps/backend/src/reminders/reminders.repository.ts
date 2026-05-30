import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../common/firebase/firebase.service';
import { CreateReminderDto } from './dto/create-reminder.dto';
import { UpdateReminderDto } from './dto/update-reminder.dto';

export const REMINDERS_COLLECTION = 'reminders';

function sanitizeDocument<T extends object>(doc: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(doc).filter(([, value]) => value !== undefined),
  ) as Partial<T>;
}

export interface ReminderDocument {
  id: string;
  petId: string;
  ownerId: string;
  type: string;
  title: string;
  notes?: string;
  medicineName?: string;
  dosage?: string;
  instructions?: string;
  startDate: string;
  frequencyValue: number;
  frequencyUnit: string;
  endCondition: string;
  endDate?: string;
  occurrenceCount?: number;
  createdAt: string;
  updatedAt: string;
}

@Injectable()
export class RemindersRepository {
  constructor(private readonly firebaseService: FirebaseService) {}

  private collection() {
    return this.firebaseService.firestore.collection(REMINDERS_COLLECTION);
  }

  async createReminder(
    input: CreateReminderDto & { ownerId: string },
  ): Promise<ReminderDocument> {
    const now = new Date().toISOString();
    const payload = sanitizeDocument({
      ...input,
      notes: input.notes ?? '',
      createdAt: now,
      updatedAt: now,
    });
    const ref = await this.collection().add(payload);
    const snapshot = await ref.get();
    return { id: ref.id, ...(snapshot.data() as Omit<ReminderDocument, 'id'>) };
  }

  async findReminderById(id: string): Promise<ReminderDocument | null> {
    const snapshot = await this.collection().doc(id).get();
    if (!snapshot.exists) return null;
    return {
      id: snapshot.id,
      ...(snapshot.data() as Omit<ReminderDocument, 'id'>),
    };
  }

  async listRemindersByOwner(ownerId: string): Promise<ReminderDocument[]> {
    const snapshot = await this.collection()
      .where('ownerId', '==', ownerId)
      .limit(500)
      .get();
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<ReminderDocument, 'id'>),
    }));
  }

  async listRemindersByPet(petId: string): Promise<ReminderDocument[]> {
    const snapshot = await this.collection()
      .where('petId', '==', petId)
      .limit(500)
      .get();
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<ReminderDocument, 'id'>),
    }));
  }

  async listAllReminders(): Promise<ReminderDocument[]> {
    const snapshot = await this.collection().limit(1000).get();
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<ReminderDocument, 'id'>),
    }));
  }

  async updateReminder(id: string, patch: UpdateReminderDto): Promise<void> {
    const payload = sanitizeDocument(patch);
    await this.collection()
      .doc(id)
      .update({ ...payload, updatedAt: new Date().toISOString() });
  }

  async deleteReminder(id: string): Promise<void> {
    await this.collection().doc(id).delete();
  }
}
