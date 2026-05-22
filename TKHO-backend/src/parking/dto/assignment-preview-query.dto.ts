import { IsDateString, IsOptional, IsString, Matches } from 'class-validator';

export class AssignmentPreviewQueryDto {
  @IsDateString()
  bookingDate: string;

  @IsString()
  @Matches(/^\d+$/, { message: 'periodId must be a numeric id' })
  periodId: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d+$/, { message: 'slotId must be a numeric id' })
  slotId?: string;
}
