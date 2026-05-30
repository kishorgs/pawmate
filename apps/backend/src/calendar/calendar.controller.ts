import { Body, Controller, Post } from '@nestjs/common';
import { ApiProperty, ApiTags } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';
import { buildGoogleCalendarUrl } from '../common/calendar/google-calendar';

class CalendarUrlDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  title!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  startsAt!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  durationMinutes?: number;
}

@ApiTags('calendar')
@Controller('calendar')
export class CalendarController {
  @Post('google-url')
  buildGoogleUrl(@Body() body: CalendarUrlDto) {
    return {
      url: buildGoogleCalendarUrl(body),
    };
  }
}
