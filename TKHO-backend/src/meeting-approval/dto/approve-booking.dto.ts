import { IsOptional, IsString } from 'class-validator';

export class ApproveBookingDto {
  @IsOptional()
  @IsString()
  meetingTitle?: string;
}
