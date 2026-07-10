import { IsDateString, IsOptional, IsString, Matches } from 'class-validator';

export class UpdateEvManageBookingDto {
  @IsString()
  @Matches(/^\d+$/, { message: 'licensePlateId must be a numeric id' })
  licensePlateId!: string;

  @IsString()
  @Matches(/^\d+$/, { message: 'periodId must be a numeric id' })
  periodId!: string;

  @IsDateString()
  bookingDate!: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d+$/, { message: 'slotId must be a numeric id' })
  slotId?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d+$/, { message: 'reservedByUserId must be a numeric id' })
  reservedByUserId?: string;
}
