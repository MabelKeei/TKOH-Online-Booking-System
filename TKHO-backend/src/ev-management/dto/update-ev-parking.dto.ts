import { IsIn, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateEvParkingDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  evSpace?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsIn(['active', 'inactive'])
  status?: 'active' | 'inactive';
}
