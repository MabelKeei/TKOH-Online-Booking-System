import { IsBoolean } from 'class-validator';

export class UpdateTeaServiceCompletedDto {
  @IsBoolean()
  completed: boolean;
}
