import { IsOptional, Matches } from 'class-validator';

export class TeaServiceDisplayQueryDto {
  /** 起始日期 YYYY-MM-DD（香港业务日历日）；省略时从当日开始 */
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  fromDate?: string;
}
