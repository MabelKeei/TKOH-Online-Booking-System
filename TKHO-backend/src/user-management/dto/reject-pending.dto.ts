import { IsOptional, IsString } from 'class-validator';

export class RejectPendingDto {
  @IsOptional()
  @IsString()
  rejectReason?: string;
}
