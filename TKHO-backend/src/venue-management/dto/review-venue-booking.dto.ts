import { IsOptional, IsString } from 'class-validator';

export class ApproveVenueManageBookingDto {
  @IsOptional()
  @IsString()
  topic?: string;
}

export class RejectVenueManageBookingDto {
  @IsOptional()
  @IsString()
  topic?: string;

  @IsString()
  reason!: string;
}

