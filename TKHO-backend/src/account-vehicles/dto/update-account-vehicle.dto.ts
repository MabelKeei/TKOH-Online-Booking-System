import { IsBoolean, IsOptional, Matches } from 'class-validator';

export class UpdateAccountVehicleDto {
  @IsOptional()
  @Matches(/^[A-Za-z0-9]+$/, {
    message: 'plateNumber can only contain letters and numbers',
  })
  plateNumber?: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
