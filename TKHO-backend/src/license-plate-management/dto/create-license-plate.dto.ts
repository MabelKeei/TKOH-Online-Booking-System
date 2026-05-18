import { IsOptional, IsString, Matches, MinLength } from 'class-validator';

export class CreateLicensePlateDto {
  @IsString()
  @MinLength(1)
  @Matches(/^[A-Za-z0-9]+$/, {
    message: 'plateNumber can only contain letters and numbers',
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
