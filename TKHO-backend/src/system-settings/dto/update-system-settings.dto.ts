import { IsInt, IsOptional, IsString, IsUrl, Max, Min } from 'class-validator';

export class UpdateSystemSettingsDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(120)
  userInactiveAfterMonths?: number;

  @IsOptional()
  @IsString()
  @IsUrl({ require_protocol: true, protocols: ['http', 'https'] })
  hkPublicHolidaysUrl?: string;
}
