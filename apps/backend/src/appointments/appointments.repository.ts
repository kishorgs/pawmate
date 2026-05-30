import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../common/firebase/firebase.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

export const APPOINTMENTS_COLLECTION = 'appointments';

export interface AppointmentDocument {
  id: string;
  petId: string;
  ownerId: string;
  veterinarianId: string;
  scheduledAt: string;
  durationMinutes: number;
  reason: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable()
export class AppointmentsRepository {
  constructor(private readonly firebaseService: FirebaseService) {}

  private collection() {
    return this.firebaseService.firestore.collection(APPOINTMENTS_COLLECTION);
  }

  async createAppointment(
    input: CreateAppointmentDto & { ownerId: string },
  ): Promise<AppointmentDocument> {
    const now = new Date().toISOString();
    const ref = await this.collection().add({
      ...input,
      durationMinutes: input.durationMinutes ?? 30,
      status: input.status ?? 'SCHEDULED',
      createdAt: now,
      updatedAt: now,
    });
    const snapshot = await ref.get();
    return { id: ref.id, ...(snapshot.data() as Omit<AppointmentDocument, 'id'>) };
  }

  async findAppointmentById(id: string): Promise<AppointmentDocument | null> {
    const snapshot = await this.collection().doc(id).get();
    if (!snapshot.exists) return null;
    return { id: snapshot.id, ...(snapshot.data() as Omit<AppointmentDocument, 'id'>) };
  }

  async listAppointments(): Promise<AppointmentDocument[]> {
    const snapshot = await this.collection().orderBy('scheduledAt').limit(500).get();
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<AppointmentDocument, 'id'>),
    }));
  }

  async listAppointmentsByOwner(ownerId: string): Promise<AppointmentDocument[]> {
    const snapshot = await this.collection().where('ownerId', '==', ownerId).limit(500).get();
    return snapshot.docs
      .map((doc) => ({ id: doc.id, ...(doc.data() as Omit<AppointmentDocument, 'id'>) }))
      .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));
  }

  async listAppointmentsByPet(petId: string): Promise<AppointmentDocument[]> {
    const snapshot = await this.collection().where('petId', '==', petId).limit(500).get();
    return snapshot.docs
      .map((doc) => ({ id: doc.id, ...(doc.data() as Omit<AppointmentDocument, 'id'>) }))
      .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));
  }

  async updateAppointment(id: string, patch: UpdateAppointmentDto): Promise<void> {
    await this.collection()
      .doc(id)
      .update({ ...patch, updatedAt: new Date().toISOString() });
  }

  async deleteAppointment(id: string): Promise<void> {
    await this.collection().doc(id).delete();
  }
}
