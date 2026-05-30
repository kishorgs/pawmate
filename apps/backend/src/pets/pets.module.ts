import { Module } from '@nestjs/common';
import { OwnersModule } from '../owners/owners.module';
import { PetsController } from './pets.controller';
import { PetsRepository } from './pets.repository';
import { PetsService } from './pets.service';

@Module({
  imports: [OwnersModule],
  controllers: [PetsController],
  providers: [PetsRepository, PetsService],
  exports: [PetsRepository, PetsService],
})
export class PetsModule {}
