import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export const APPOINTMENT_STATUS = [
  'SCHEDULED',
  'CONFIRMED',
  'COMPLETED',
  'CANCELLED',
] as const;

export class CreateAppointmentDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  petId!: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  veterinarianId!: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  scheduledAt!: string;

  @ApiPropertyOptional({ default: 30 })
  @IsInt()
  @Min(5)
  @Max(480)
  durationMinutes?: number;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  reason!: string;

  @ApiPropertyOptional({ enum: APPOINTMENT_STATUS })
  @IsEnum(APPOINTMENT_STATUS)
  status?: (typeof APPOINTMENT_STATUS)[number];
}
