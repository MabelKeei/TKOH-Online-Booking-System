import { IsDateString, IsInt, IsString, Matches } from 'class-validator';

export class OccupyDto {
  @IsString()
  userCorpId: string;

  @IsString()
  @Matches(/^\d+$/, { message: 'licensePlateId must be a numeric id' })
  licensePlateId: string;

  @IsInt()
  slotId: number;

  @IsInt()
  periodId: number;

  @IsDateString()
  bookingDate: string;
}
