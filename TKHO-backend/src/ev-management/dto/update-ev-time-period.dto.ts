import { IsIn, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateEvTimePeriodDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  period?: string;

  @IsOptional()
  @IsString()
  @MinLength(4)
  startTime?: string;

  @IsOptional()
  @IsString()
  @MinLength(4)
  endTime?: string;

  @IsOptional()
  @IsIn(['active', 'inactive'])
  status?: 'active' | 'inactive';
}
