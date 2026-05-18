import { IsDateString } from 'class-validator';

export class PublishEvWindowDto {
  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;
}
