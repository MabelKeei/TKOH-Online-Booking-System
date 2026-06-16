import { IsOptional, Matches } from 'class-validator';

export class EvPublicDisplayQueryDto {
  /** 展示日期 YYYY-MM-DD（香港业务日历日）；省略时按 APP_TIMEZONE（默认 Asia/Hong_Kong）取当日 */
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  date?: string;
}
