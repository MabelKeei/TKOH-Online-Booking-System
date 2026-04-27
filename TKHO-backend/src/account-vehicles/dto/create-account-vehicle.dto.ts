import { IsBoolean, IsOptional, Matches } from 'class-validator';

export class CreateAccountVehicleDto {
  @Matches(/^[A-Za-z0-9]+$/, {
    message: 'plateNumber can only contain letters and numbers',
  })
  plateNumber!: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
