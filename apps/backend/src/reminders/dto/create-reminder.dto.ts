import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateIf,
} from 'class-validator';

export const REMINDER_TYPES = ['VACCINATION', 'MEDICATION'] as const;
export const FREQUENCY_UNITS = ['DAY', 'WEEK', 'MONTH', 'YEAR'] as const;
export const END_CONDITIONS = ['NEVER', 'END_DATE', 'OCCURRENCE_COUNT'] as const;

export class CreateReminderDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  petId!: string;

  @ApiProperty({ enum: REMINDER_TYPES })
  @IsEnum(REMINDER_TYPES)
  type!: (typeof REMINDER_TYPES)[number];

  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  title!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;

  @ApiPropertyOptional()
  @ValidateIf((o) => o.type === 'MEDICATION')
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  medicineName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(120)
  dosage?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  instructions?: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  startDate!: string;

  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(365)
  frequencyValue!: number;

  @ApiProperty({ enum: FREQUENCY_UNITS })
  @IsEnum(FREQUENCY_UNITS)
  frequencyUnit!: (typeof FREQUENCY_UNITS)[number];

  @ApiProperty({ enum: END_CONDITIONS })
  @IsEnum(END_CONDITIONS)
  endCondition!: (typeof END_CONDITIONS)[number];

  @ApiPropertyOptional()
  @ValidateIf((o) => o.endCondition === 'END_DATE')
  @IsString()
  @MinLength(8)
  endDate?: string;

  @ApiPropertyOptional()
  @ValidateIf((o) => o.endCondition === 'OCCURRENCE_COUNT')
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(365)
  occurrenceCount?: number;
}
