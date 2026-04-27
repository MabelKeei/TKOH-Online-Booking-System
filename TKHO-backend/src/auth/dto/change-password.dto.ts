import { IsString, Matches, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  currentPassword: string;

  @IsString()
  @MinLength(6)
  @Matches(/^\S+$/, { message: 'Password must not contain whitespace' })
  newPassword: string;
}
