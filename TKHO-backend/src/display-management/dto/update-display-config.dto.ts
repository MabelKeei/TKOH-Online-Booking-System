import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { VenueDisplayRuleDto } from './venue-display-rule.dto';

class MergeDisplaySettingsDto {
  @IsOptional()
  @IsString()
  panelTitleText?: string;

  @IsOptional()
  @IsString()
  footerTickerText?: string;

  @IsOptional()
  @IsString()
  qrCodeImage?: string;
}

class EvDisplaySettingsDto {
  @IsOptional()
  @IsString()
  footerTickerText?: string;
}

export class UpdateDisplayConfigDto {
  @IsOptional()
  @IsIn(['single', 'merge', 'mixed'])
  venueDisplayMode?: string;

  @IsOptional()
  @IsIn(['single', 'merge'])
  evDisplayMode?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => MergeDisplaySettingsDto)
  mergeDisplaySettings?: MergeDisplaySettingsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => EvDisplaySettingsDto)
  evDisplaySettings?: EvDisplaySettingsDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VenueDisplayRuleDto)
  venueRules!: VenueDisplayRuleDto[];
}
