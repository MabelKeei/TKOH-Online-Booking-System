import { IsDateString, IsInt, IsString } from 'class-validator';

export class OccupyDto {
  @IsString()
  employeeCorpId: string;

  @IsString()
  plateNumber: string;

  @IsInt()
  slotId: number;

  @IsInt()
  periodId: number;

  @IsDateString()
  bookingDate: string;
}
