import { IsIn, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateEvParkingDto {
  @IsString()
  @MinLength(1)
  evSpace!: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsIn(['active', 'inactive'])
  status?: 'active' | 'inactive';
}
