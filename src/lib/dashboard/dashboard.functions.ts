import { createServerFn } from "@tanstack/react-start";

import { requireFirebaseAuth } from "../auth/auth-middleware";
import { findOwnerByUserUid } from "../owners/owners.repository.server";
import { listOwners } from "../owners/owners.repository.server";
import { listAllPets, listPetsByOwner } from "../pets/pets.repository.server";
import { listVets } from "../veterinarians/veterinarians.repository.server";
import {
  listAppointments,
  listAppointmentsByOwner,
} from "../appointments/appointments.repository.server";
import {
  listAllReminders,
  listRemindersByOwner,
} from "../reminders/reminders.repository.server";
import {
  calculateNextOccurrence,
  deriveReminderStatus,
} from "../reminders/reminder-engine";

export interface DashboardSummary {
  role: "ADMIN" | "OWNER";
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
    type: "VACCINATION" | "MEDICATION";
    title: string;
    petId: string;
    nextOccurrence: string;
    status: string;
  }>;
}

export const fetchDashboardSummary = createServerFn({ method: "GET" })
  .middleware([requireFirebaseAuth])
  .handler(async ({ context }): Promise<DashboardSummary> => {
    const isAdmin = context.role === "ADMIN";
    const owner = isAdmin ? null : await findOwnerByUserUid(context.uid);

    const [owners, pets, vets, appointments, reminders] = await Promise.all([
      isAdmin ? listOwners() : Promise.resolve([]),
      isAdmin ? listAllPets() : owner ? listPetsByOwner(owner.id) : Promise.resolve([]),
      isAdmin ? listVets() : Promise.resolve([]),
      isAdmin
        ? listAppointments()
        : owner
          ? listAppointmentsByOwner(owner.id)
          : Promise.resolve([]),
      isAdmin
        ? listAllReminders()
        : owner
          ? listRemindersByOwner(owner.id)
          : Promise.resolve([]),
    ]);

    const now = new Date();
    const enrichedReminders = reminders
      .map((r) => {
        const next = calculateNextOccurrence(r);
        return {
          id: r.id,
          type: r.type,
          title: r.title,
          petId: r.petId,
          nextOccurrence: next?.toISOString() ?? null,
          status: deriveReminderStatus(next),
        };
      })
      .filter((r): r is typeof r & { nextOccurrence: string } => !!r.nextOccurrence)
      .sort((a, b) => a.nextOccurrence.localeCompare(b.nextOccurrence));

    const upcomingAppointments = appointments
      .filter((a) => new Date(a.scheduledAt) >= now && a.status !== "CANCELLED")
      .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));

    return {
      role: context.role,
      totals: {
        owners: owners.length,
        pets: pets.length,
        veterinarians: vets.length,
        upcomingAppointments: upcomingAppointments.length,
        upcomingVaccinations: enrichedReminders.filter((r) => r.type === "VACCINATION").length,
        upcomingMedications: enrichedReminders.filter((r) => r.type === "MEDICATION").length,
      },
      upcomingAppointments: upcomingAppointments.slice(0, 5).map((a) => ({
        id: a.id,
        scheduledAt: a.scheduledAt,
        reason: a.reason,
        petId: a.petId,
      })),
      upcomingReminders: enrichedReminders.slice(0, 8),
    };
  });
