import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateDepartmentDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  departmentName?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
