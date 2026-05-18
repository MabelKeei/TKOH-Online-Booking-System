import { IsDateString } from 'class-validator';

export class PublishVenueWindowDto {
  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;
}

