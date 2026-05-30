import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { AppointmentsModule } from './appointments/appointments.module';
import { AuthModule } from './auth/auth.module';
import { CalendarModule } from './calendar/calendar.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { FirebaseModule } from './common/firebase/firebase.module';
import { HealthModule } from './health/health.module';
import { OwnersModule } from './owners/owners.module';
import { PetsModule } from './pets/pets.module';
import { RemindersModule } from './reminders/reminders.module';
import { UsersModule } from './users/users.module';
import { VeterinariansModule } from './veterinarians/veterinarians.module';
import { VisitsModule } from './visits/visits.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    LoggerModule.forRoot({
      pinoHttp: {
        transport:
          process.env.NODE_ENV !== 'production'
            ? { target: 'pino-pretty', options: { singleLine: true } }
            : undefined,
        redact: ['req.headers.authorization'],
      },
    }),
    FirebaseModule,
    UsersModule,
    HealthModule,
    AuthModule,
    OwnersModule,
    PetsModule,
    VeterinariansModule,
    AppointmentsModule,
    VisitsModule,
    RemindersModule,
    DashboardModule,
    CalendarModule,
  ],
})
export class AppModule {}
