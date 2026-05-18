import { IsNumber, IsOptional, IsString, MinLength } from 'class-validator';

export class ApprovePendingDto {
  @IsString()
  @MinLength(1)
  password!: string;

  @IsOptional()
  @IsNumber()
  annualQuotaEV?: number;

  @IsOptional()
  @IsNumber()
  annualQuotaVenue?: number;
}
