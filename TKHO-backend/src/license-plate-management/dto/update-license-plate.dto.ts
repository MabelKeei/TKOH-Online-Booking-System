import { IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class UpdateLicensePlateDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(8)
  @Matches(/^[A-Za-z0-9]{1,8}$/, {
    message: 'plateNumber can only contain letters and numbers (max 8)',
  })
  plateNumber?: string;

  @IsOptional()
  @IsString()
  corpId?: string;

  @IsOptional()
  @IsString()
  ownerName?: string;
}
