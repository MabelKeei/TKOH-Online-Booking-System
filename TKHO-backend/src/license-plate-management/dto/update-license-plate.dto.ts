import { IsOptional, IsString, Matches, MinLength } from 'class-validator';

export class UpdateLicensePlateDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @Matches(/^[A-Za-z0-9]+$/, {
    message: 'plateNumber can only contain letters and numbers',
  })
  plateNumber?: string;

  @IsOptional()
  @IsString()
  corpId?: string;

  @IsOptional()
  @IsString()
  ownerName?: string;
}
