import { Module } from '@nestjs/common';
import { AppointmentsModule } from '../appointments/appointments.module';
import { OwnersModule } from '../owners/owners.module';
import { PetsModule } from '../pets/pets.module';
import { RemindersModule } from '../reminders/reminders.module';
import { VeterinariansModule } from '../veterinarians/veterinarians.module';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [
    OwnersModule,
    PetsModule,
    VeterinariansModule,
    AppointmentsModule,
    RemindersModule,
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
