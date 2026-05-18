import { IsBoolean, IsIn, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdatePromptDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  promptKey?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsIn(['meeting_approval', 'user_application'])
  templateType?: 'meeting_approval' | 'user_application';

  @IsOptional()
  @IsBoolean()
  canAdd?: boolean;
}
