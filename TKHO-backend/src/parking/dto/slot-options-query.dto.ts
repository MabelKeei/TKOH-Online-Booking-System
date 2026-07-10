import { IsDateString, IsOptional, IsString, Matches } from 'class-validator';

export class SlotOptionsQueryDto {
  @IsDateString()
  bookingDate!: string;

  @IsString()
  @Matches(/^\d+$/, { message: 'periodId must be a numeric id' })
  periodId!: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d+$/, { message: 'excludeBookingId must be a numeric id' })
  excludeBookingId?: string;
}
