import { IsIn, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateEvTimePeriodDto {
  @IsString()
  @MinLength(1)
  period!: string;

  @IsString()
  @MinLength(4)
  startTime!: string;

  @IsString()
  @MinLength(4)
  endTime!: string;

  @IsOptional()
  @IsIn(['active', 'inactive'])
  status?: 'active' | 'inactive';
}
