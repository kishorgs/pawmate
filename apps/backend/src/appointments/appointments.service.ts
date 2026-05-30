import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { OwnersRepository } from '../owners/owners.repository';
import { PetsRepository } from '../pets/pets.repository';
import { AuthenticatedUser } from '../common/types/app-role';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { AppointmentDocument, AppointmentsRepository } from './appointments.repository';

@Injectable()
export class AppointmentsService {
  constructor(
    private readonly appointmentsRepository: AppointmentsRepository,
    private readonly petsRepository: PetsRepository,
    private readonly ownersRepository: OwnersRepository,
  ) {}

  async listAppointmentsForUser(user: AuthenticatedUser): Promise<AppointmentDocument[]> {
    if (user.role === 'ADMIN') return this.appointmentsRepository.listAppointments();
    const owner = await this.ownersRepository.findOwnerByUserUid(user.uid);
    if (!owner) return [];
    return this.appointmentsRepository.listAppointmentsByOwner(owner.id);
  }

  async getAppointmentById(id: string, user: AuthenticatedUser): Promise<AppointmentDocument> {
    const appointment = await this.appointmentsRepository.findAppointmentById(id);
    if (!appointment) throw new NotFoundException('Appointment not found');
    await this.assertOwnerAccess(appointment.ownerId, user);
    return appointment;
  }

  async createAppointment(input: CreateAppointmentDto): Promise<AppointmentDocument> {
    const pet = await this.petsRepository.findPetById(input.petId);
    if (!pet) throw new NotFoundException('Pet not found');
    return this.appointmentsRepository.createAppointment({
      ...input,
      ownerId: pet.ownerId,
    });
  }

  async updateAppointment(id: string, patch: UpdateAppointmentDto): Promise<void> {
    const appointment = await this.appointmentsRepository.findAppointmentById(id);
    if (!appointment) throw new NotFoundException('Appointment not found');
    await this.appointmentsRepository.updateAppointment(id, patch);
  }

  async deleteAppointment(id: string): Promise<void> {
    const appointment = await this.appointmentsRepository.findAppointmentById(id);
    if (!appointment) throw new NotFoundException('Appointment not found');
    await this.appointmentsRepository.deleteAppointment(id);
  }

  private async assertOwnerAccess(ownerId: string, user: AuthenticatedUser): Promise<void> {
    if (user.role === 'ADMIN') return;
    const owner = await this.ownersRepository.findOwnerByUserUid(user.uid);
    if (!owner || owner.id !== ownerId) throw new ForbiddenException();
  }
}
