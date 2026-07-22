import { IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class CreateLicensePlateDto {
  @IsString()
  @MinLength(1)
  @MaxLength(8)
  @Matches(/^[A-Za-z0-9]{1,8}$/, {
    message: 'plateNumber can only contain letters and numbers (max 8)',
  })
  plateNumber!: string;

  /** Owner corp ID (preferred). */
  @IsOptional()
  @IsString()
  corpId?: string;

  /** Owner display name when corpId omitted (matched against active users). */
  @IsOptional()
  @IsString()
  ownerName?: string;
}
