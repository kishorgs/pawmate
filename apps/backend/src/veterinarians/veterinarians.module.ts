import { Module } from '@nestjs/common';
import { VeterinariansController } from './veterinarians.controller';
import { VeterinariansRepository } from './veterinarians.repository';
import { VeterinariansService } from './veterinarians.service';

@Module({
  controllers: [VeterinariansController],
  providers: [VeterinariansRepository, VeterinariansService],
  exports: [VeterinariansRepository, VeterinariansService],
})
export class VeterinariansModule {}
