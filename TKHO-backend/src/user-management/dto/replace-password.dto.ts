import { IsString, MinLength } from 'class-validator';

export class ReplacePasswordDto {
  @IsString()
  @MinLength(1)
  password!: string;
}
