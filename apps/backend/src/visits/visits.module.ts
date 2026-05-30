import { Module } from '@nestjs/common';
import { OwnersModule } from '../owners/owners.module';
import { PetsModule } from '../pets/pets.module';
import { VisitsController } from './visits.controller';
import { VisitsRepository } from './visits.repository';
import { VisitsService } from './visits.service';

@Module({
  imports: [PetsModule, OwnersModule],
  controllers: [VisitsController],
  providers: [VisitsRepository, VisitsService],
  exports: [VisitsRepository, VisitsService],
})
export class VisitsModule {}
