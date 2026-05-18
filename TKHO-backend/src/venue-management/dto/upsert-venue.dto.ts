import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class UpsertVenueDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  nameZh?: string;

  @IsOptional()
  @IsString()
  tab?: string;

  @IsOptional()
  @IsIn(['conference', 'discussion', 'other'])
  type?: 'conference' | 'discussion' | 'other';

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  locationZh?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(99999)
  roomCapacity?: number;

  @IsOptional()
  @IsIn(['single', 'merge'])
  displayType?: 'single' | 'merge';

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsIn(['active', 'inactive'])
  status?: 'active' | 'inactive';
}

