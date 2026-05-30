export type AppRole = 'ADMIN' | 'OWNER';

export interface PawMateUser {
  uid: string;
  email: string | null;
  role: AppRole;
  ownerId: string | null;
}

export interface OwnerProfile {
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

export interface PetProfile {
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

export interface VeterinarianProfile {
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

export interface AppointmentRecord {
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

export interface VisitRecord {
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

export interface EnrichedReminder {
  id: string;
  petId: string;
  ownerId: string;
  type: 'VACCINATION' | 'MEDICATION';
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
  nextOccurrence: string | null;
  status: 'UPCOMING' | 'DUE' | 'OVERDUE' | 'COMPLETED';
  upcomingOccurrences: string[];
  createdAt: string;
  updatedAt: string;
}

export interface DashboardSummary {
  role: AppRole;
  totals: {
    owners: number;
    pets: number;
    veterinarians: number;
    upcomingAppointments: number;
    upcomingVaccinations: number;
    upcomingMedications: number;
  };
  upcomingAppointments: Array<{
    id: string;
    scheduledAt: string;
    reason: string;
    petId: string;
  }>;
  upcomingReminders: Array<{
    id: string;
    type: 'VACCINATION' | 'MEDICATION';
    title: string;
    petId: string;
    nextOccurrence: string;
    status: string;
  }>;
}
