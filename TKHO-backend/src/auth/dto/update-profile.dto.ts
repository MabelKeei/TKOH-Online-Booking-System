import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateProfileDto {
  @IsString()
  @MaxLength(100)
  fullName: string;

  @IsString()
  @MaxLength(50)
  @IsOptional()
  department?: string;

  @IsString()
  @MaxLength(30)
  phone: string;

  @IsString()
  @MaxLength(50)
  @IsOptional()
  employeeNo?: string;
}
