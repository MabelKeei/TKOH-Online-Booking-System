import { IsInt, IsOptional, IsString, IsUrl, Matches, Max, Min } from 'class-validator';

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

  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: 'evDateUpdateTime must be HH:mm in 24-hour format',
  })
  evDateUpdateTime?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(7)
  evWeeklyBookingLimit?: number;
}
