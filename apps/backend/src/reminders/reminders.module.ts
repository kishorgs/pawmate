import { Module } from '@nestjs/common';
import { OwnersModule } from '../owners/owners.module';
import { PetsModule } from '../pets/pets.module';
import { RemindersController } from './reminders.controller';
import { RemindersRepository } from './reminders.repository';
import { RemindersService } from './reminders.service';

@Module({
  imports: [PetsModule, OwnersModule],
  controllers: [RemindersController],
  providers: [RemindersRepository, RemindersService],
  exports: [RemindersRepository, RemindersService],
})
export class RemindersModule {}
