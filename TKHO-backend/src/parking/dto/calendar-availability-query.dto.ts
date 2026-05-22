import { IsDateString } from 'class-validator';

export class CalendarAvailabilityQueryDto {
  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;
}
