import { IsString, MinLength } from 'class-validator';

export class UpdateStatusDto {
  @IsString()
  @MinLength(1)
  status!: string;
}
