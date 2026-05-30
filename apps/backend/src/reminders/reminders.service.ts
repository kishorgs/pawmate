import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  calculateNextOccurrence,
  deriveReminderStatus,
  generateOccurrences,
  ReminderSchedule,
  ReminderStatus,
} from '../common/reminder-engine/reminder-engine';
import { OwnersRepository } from '../owners/owners.repository';
import { PetsRepository } from '../pets/pets.repository';
import { AuthenticatedUser } from '../common/types/app-role';
import { CreateReminderDto } from './dto/create-reminder.dto';
import { UpdateReminderDto } from './dto/update-reminder.dto';
import { ReminderDocument, RemindersRepository } from './reminders.repository';

export interface EnrichedReminder extends ReminderDocument {
  nextOccurrence: string | null;
  status: ReminderStatus;
  upcomingOccurrences: string[];
}

@Injectable()
export class RemindersService {
  private readonly logger = new Logger(RemindersService.name);

  constructor(
    private readonly remindersRepository: RemindersRepository,
    private readonly petsRepository: PetsRepository,
    private readonly ownersRepository: OwnersRepository,
  ) {}

  private enrich(reminder: ReminderDocument): EnrichedReminder {
    const schedule = reminder as ReminderSchedule;
    const next = calculateNextOccurrence(schedule);
    const upcoming = generateOccurrences(schedule, { maxOccurrences: 10 })
      .filter((date) => date >= new Date())
      .map((date) => date.toISOString());
    return {
      ...reminder,
      nextOccurrence: next?.toISOString() ?? null,
      status: deriveReminderStatus(next),
      upcomingOccurrences: upcoming,
    };
  }

  async listRemindersForUser(
    user: AuthenticatedUser,
  ): Promise<EnrichedReminder[]> {
    let reminders: ReminderDocument[];
    if (user.role === 'ADMIN') {
      reminders = await this.remindersRepository.listAllReminders();
    } else {
      const owner = await this.ownersRepository.findOwnerByUserUid(user.uid);
      reminders = owner
        ? await this.remindersRepository.listRemindersByOwner(owner.id)
        : [];
    }
    return reminders
      .map((reminder) => this.enrich(reminder))
      .sort((a, b) =>
        (a.nextOccurrence ?? '9999').localeCompare(b.nextOccurrence ?? '9999'),
      );
  }

  async listRemindersByPet(
    petId: string,
    user: AuthenticatedUser,
  ): Promise<EnrichedReminder[]> {
    const pet = await this.petsRepository.findPetById(petId);
    if (!pet) return [];
    if (user.role !== 'ADMIN') {
      const owner = await this.ownersRepository.findOwnerByUserUid(user.uid);
      if (!owner || owner.id !== pet.ownerId) throw new ForbiddenException();
    }
    const reminders = await this.remindersRepository.listRemindersByPet(petId);
    return reminders.map((reminder) => this.enrich(reminder));
  }

  async getReminderById(
    id: string,
    user: AuthenticatedUser,
  ): Promise<EnrichedReminder> {
    const reminder = await this.remindersRepository.findReminderById(id);
    if (!reminder) throw new NotFoundException('Reminder not found');
    if (user.role !== 'ADMIN') {
      const owner = await this.ownersRepository.findOwnerByUserUid(user.uid);
      if (!owner || owner.id !== reminder.ownerId)
        throw new ForbiddenException();
    }
    return this.enrich(reminder);
  }

  async createReminder(input: CreateReminderDto): Promise<EnrichedReminder> {
    if (input.type === 'MEDICATION' && !input.medicineName) {
      throw new ForbiddenException(
        'medicineName required for medication reminders',
      );
    }
    const pet = await this.petsRepository.findPetById(input.petId);
    if (!pet) throw new NotFoundException('Pet not found');

    try {
      const reminder = await this.remindersRepository.createReminder({
        ...input,
        ownerId: pet.ownerId,
      });
      return this.enrich(reminder);
    } catch (error) {
      const message =
        error instanceof Error ? (error.stack ?? error.message) : String(error);
      this.logger.error(`Failed to create reminder: ${message}`);
      throw new InternalServerErrorException(
        'Unable to create reminder. Please verify the reminder data and try again.',
      );
    }
  }

  async updateReminder(id: string, patch: UpdateReminderDto): Promise<void> {
    const reminder = await this.remindersRepository.findReminderById(id);
    if (!reminder) throw new NotFoundException('Reminder not found');
    await this.remindersRepository.updateReminder(id, patch);
  }

  async deleteReminder(id: string): Promise<void> {
    const reminder = await this.remindersRepository.findReminderById(id);
    if (!reminder) throw new NotFoundException('Reminder not found');
    await this.remindersRepository.deleteReminder(id);
  }
}
