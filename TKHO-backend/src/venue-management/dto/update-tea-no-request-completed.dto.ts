import { IsBoolean, IsString, Matches, MinLength } from 'class-validator';

export class UpdateTeaNoRequestCompletedDto {
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  date: string;

  @IsString()
  @MinLength(1)
  venueName: string;

  @IsBoolean()
  completed: boolean;
}
