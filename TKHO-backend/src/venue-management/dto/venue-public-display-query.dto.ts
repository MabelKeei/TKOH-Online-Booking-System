import { IsOptional, Matches } from 'class-validator';

export class VenuePublicDisplayQueryDto {
  /** 场地 ID（venues.id） */
  @Matches(/^\d+$/)
  venueId!: string;

  /** 展示日期 YYYY-MM-DD（香港业务日历日）；省略时取当日 */
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  date?: string;
}
