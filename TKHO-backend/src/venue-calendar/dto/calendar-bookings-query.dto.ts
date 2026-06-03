import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CalendarBookingsRangeQueryDto {
  @IsString()
  start!: string;

  @IsString()
  end!: string;

  @IsOptional()
  @IsString()
  roomType?: string;
}

export class CalendarBookingsDateQueryDto {
  @IsString()
  date!: string;

  @IsOptional()
  @IsString()
  roomType?: string;
}

export class CalendarBookingsWeekQueryDto {
  @IsString()
  weekStart!: string;

  @IsOptional()
  @IsString()
  roomType?: string;
}

export class CalendarBookingsMonthQueryDto {
  @Type(() => Number)
  @IsInt()
  @Min(2000)
  @Max(2100)
  year!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  month!: number;

  @IsOptional()
  @IsString()
  roomType?: string;
}

export class RoomAvailabilityQueryDto {
  @IsString()
  roomId!: string;

  @IsString()
  date!: string;

  @IsString()
  startTime!: string;

  @IsString()
  endTime!: string;

  @IsOptional()
  @IsString()
  excludeBookingId?: string;
}
