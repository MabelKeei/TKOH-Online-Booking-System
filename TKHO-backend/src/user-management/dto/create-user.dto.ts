import { IsEmail, IsNumber, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MinLength(1)
  corpId!: string;

  @IsString()
  @MinLength(1)
  name!: string;

  /** Department display name; created in `departments` when not found. */
  @IsOptional()
  @IsString()
  department?: string;

  /** Access role name; must match `access_roles.role_name`. */
  @IsOptional()
  @IsString()
  role?: string;

  /** Defaults to `corpId` when omitted. */
  @IsOptional()
  @IsString()
  account?: string;

  @IsString()
  @MinLength(1)
  password!: string;

  @IsOptional()
  @IsString()
  contact?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsNumber()
  annualQuotaEV?: number;

  @IsOptional()
  @IsNumber()
  annualQuotaVenue?: number;

  /** Frontend: `active` | `inactive` | `expired` */
  @IsOptional()
  @IsString()
  status?: string;
}
