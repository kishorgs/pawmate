import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export const PET_TYPES = [
  'DOG',
  'CAT',
  'BIRD',
  'RABBIT',
  'REPTILE',
  'OTHER',
] as const;
export const PET_GENDERS = ['MALE', 'FEMALE', 'UNKNOWN'] as const;

export class CreatePetDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(60)
  name!: string;

  @ApiProperty({ example: '2020-05-15' })
  @IsString()
  @MinLength(8)
  birthDate!: string;

  @ApiProperty({ enum: PET_TYPES })
  @IsEnum(PET_TYPES)
  petType!: (typeof PET_TYPES)[number];

  @ApiProperty({ enum: PET_GENDERS })
  @IsEnum(PET_GENDERS)
  gender!: (typeof PET_GENDERS)[number];

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(500)
  weightKg?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  @MaxLength(2000)
  photoUrl?: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  ownerId!: string;
}
