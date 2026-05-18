import { IsBoolean, IsIn, IsOptional, IsString, MinLength } from 'class-validator';

export class CreatePromptDto {
  @IsString()
  @MinLength(1)
  promptKey!: string;

  @IsString()
  @MinLength(1)
  name!: string;

  @IsString()
  @MinLength(1)
  content!: string;

  @IsIn(['reject_template'])
  category!: 'reject_template';

  @IsIn(['meeting_approval', 'user_application'])
  templateType!: 'meeting_approval' | 'user_application';

  @IsOptional()
  @IsBoolean()
  canAdd?: boolean;
}
