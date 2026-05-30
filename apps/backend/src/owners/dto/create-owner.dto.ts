import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateOwnerDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  firstName!: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  lastName!: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  address!: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  city!: string;

  @ApiProperty()
  @IsString()
  @MinLength(5)
  @MaxLength(30)
  @Matches(/^[+0-9 ()-]+$/)
  phone!: string;

  @ApiProperty()
  @IsEmail()
  @MaxLength(200)
  email!: string;
}
