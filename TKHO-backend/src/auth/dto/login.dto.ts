import { IsIn, IsString } from 'class-validator';

export class LoginDto {
  @IsString()
  account: string;

  @IsString()
  password: string;

  @IsString()
  @IsIn(['parking', 'room', 'admin'])
  system: 'parking' | 'room' | 'admin';
}
