import { Injectable } from '@nestjs/common';
import {
  calculateNextOccurrence,
  deriveReminderStatus,
  ReminderSchedule,
} from '../common/reminder-engine/reminder-engine';
import { AppointmentsRepository } from '../appointments/appointments.repository';
import { OwnersRepository } from '../owners/owners.repository';
import { PetsRepository } from '../pets/pets.repository';
import { RemindersRepository } from '../reminders/reminders.repository';
import { AuthenticatedUser } from '../common/types/app-role';
import { VeterinariansRepository } from '../veterinarians/veterinarians.repository';

export interface DashboardSummary {
  role: 'ADMIN' | 'OWNER';
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

@Injectable()
export class DashboardService {
  constructor(
    private readonly ownersRepository: OwnersRepository,
    private readonly petsRepository: PetsRepository,
    private readonly veterinariansRepository: VeterinariansRepository,
    private readonly appointmentsRepository: AppointmentsRepository,
    private readonly remindersRepository: RemindersRepository,
  ) {}

  async getSummary(user: AuthenticatedUser): Promise<DashboardSummary> {
    const isAdmin = user.role === 'ADMIN';
    const owner = isAdmin
      ? null
      : await this.ownersRepository.findOwnerByUserUid(user.uid);

    const [owners, pets, vets, appointments, reminders] = await Promise.all([
      isAdmin ? this.ownersRepository.listOwners() : Promise.resolve([]),
      isAdmin
        ? this.petsRepository.listAllPets()
        : owner
          ? this.petsRepository.listPetsByOwner(owner.id)
          : Promise.resolve([]),
      isAdmin
        ? this.veterinariansRepository.listVeterinarians()
        : Promise.resolve([]),
      isAdmin
        ? this.appointmentsRepository.listAppointments()
        : owner
          ? this.appointmentsRepository.listAppointmentsByOwner(owner.id)
          : Promise.resolve([]),
      isAdmin
        ? this.remindersRepository.listAllReminders()
        : owner
          ? this.remindersRepository.listRemindersByOwner(owner.id)
          : Promise.resolve([]),
    ]);

    const now = new Date();
    const enrichedReminders = reminders
      .map((reminder) => {
        const next = calculateNextOccurrence(reminder as ReminderSchedule);
        return {
          id: reminder.id,
          type: reminder.type as 'VACCINATION' | 'MEDICATION',
          title: reminder.title,
          petId: reminder.petId,
          nextOccurrence: next?.toISOString() ?? null,
          status: deriveReminderStatus(next),
        };
      })
      .filter(
        (reminder): reminder is typeof reminder & { nextOccurrence: string } =>
          !!reminder.nextOccurrence,
      )
      .sort((a, b) => a.nextOccurrence.localeCompare(b.nextOccurrence));

    const upcomingAppointments = appointments
      .filter(
        (appointment) =>
          new Date(appointment.scheduledAt) >= now &&
          appointment.status !== 'CANCELLED',
      )
      .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));

    return {
      role: user.role,
      totals: {
        owners: owners.length,
        pets: pets.length,
        veterinarians: vets.length,
        upcomingAppointments: upcomingAppointments.length,
        upcomingVaccinations: enrichedReminders.filter(
          (reminder) => reminder.type === 'VACCINATION',
        ).length,
        upcomingMedications: enrichedReminders.filter(
          (reminder) => reminder.type === 'MEDICATION',
        ).length,
      },
      upcomingAppointments: upcomingAppointments
        .slice(0, 5)
        .map((appointment) => ({
          id: appointment.id,
          scheduledAt: appointment.scheduledAt,
          reason: appointment.reason,
          petId: appointment.petId,
        })),
      upcomingReminders: enrichedReminders.slice(0, 8),
    };
  }
}
