import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateVisitDto {
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
  visitDate!: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(1000)
  description!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  diagnosis?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  prescriptionNotes?: string;
}
