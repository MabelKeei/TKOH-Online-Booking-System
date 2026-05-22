import { IsIn, IsOptional } from 'class-validator';

export class ListEvBookingsQueryDto {
  @IsOptional()
  @IsIn(['my', 'all'])
  scope?: 'my' | 'all' = 'my';
}
