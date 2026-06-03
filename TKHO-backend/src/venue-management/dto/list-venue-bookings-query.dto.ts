import { IsIn, IsOptional } from 'class-validator';

export class ListVenueBookingsQueryDto {
  @IsOptional()
  @IsIn(['my', 'all'])
  scope?: 'my' | 'all' = 'my';
}

