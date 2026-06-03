import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateVenueManageBookingDto {
  @IsOptional()
  @IsString()
  room?: string;

  @IsOptional()
  @IsString()
  topic?: string;

  @IsOptional()
  @IsString()
  myNote?: string;

  @IsOptional()
  @IsString()
  date?: string;

  @IsOptional()
  @IsString()
  startTime?: string;

  @IsOptional()
  @IsString()
  endTime?: string;

  @IsOptional()
  @IsBoolean()
  teaServiceRequired?: boolean;

  @IsOptional()
  @IsString()
  teaOrWater?: string;

  @IsOptional()
  @IsString()
  serviceType?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  teaServiceParticipants?: number;

  @IsOptional()
  @IsString()
  teaServiceSpecialRequest?: string;
}

