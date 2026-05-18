import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min, MinLength } from 'class-validator';

export class UpdateAccessRoleDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  roleName?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(-1)
  @Max(999999)
  annualVenueQuota?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(-1)
  @Max(999999)
  annualEvQuota?: number;
}
