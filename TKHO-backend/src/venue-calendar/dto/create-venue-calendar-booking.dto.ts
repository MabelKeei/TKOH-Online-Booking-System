import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateVenueCalendarBookingDto {
  @IsString()
  roomName!: string;

  @IsString()
  date!: string;

  @IsString()
  startTime!: string;

  @IsString()
  endTime!: string;

  @IsString()
  topic!: string;

  @IsOptional()
  @IsString()
  remark?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(999)
  attendeeCount?: number;

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
  @IsString()
  teaServiceSpecialRequest?: string;

  @IsOptional()
  @IsString()
  roomType?: string;
}
