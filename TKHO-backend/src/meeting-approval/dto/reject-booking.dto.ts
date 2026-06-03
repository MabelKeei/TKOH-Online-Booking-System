import { IsOptional, IsString } from 'class-validator';

export class RejectBookingDto {
  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsString()
  rejectReason?: string;

  @IsOptional()
  @IsString()
  meetingTitle?: string;
}
