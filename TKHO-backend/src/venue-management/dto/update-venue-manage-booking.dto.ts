import { IsBoolean, IsInt, IsOptional, IsString, Matches, Min } from 'class-validator';

export class UpdateVenueManageBookingDto {
  @IsOptional()
  @IsString()
  room?: string;

  @IsOptional()
  @IsString()
  topic?: string;

  @IsOptional()
  @IsString()
  myNote?: string;

  @IsOptional()
  @IsString()
  date?: string;

  @IsOptional()
  @IsString()
  startTime?: string;

  @IsOptional()
  @IsString()
  endTime?: string;

  @IsOptional()
  @IsBoolean()
  teaServiceRequired?: boolean;

  /** 是否允许会议标题在 display 大屏公开显示 */
  @IsOptional()
  @IsBoolean()
  displayTitlePublic?: boolean;

  @IsOptional()
  @IsString()
  teaServiceOption?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  teaServiceRatioFrom?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  teaServiceRatioTo?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  teaServiceTeaPots?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  teaServiceWaterPots?: number;

  /** @deprecated legacy */
  @IsOptional()
  @IsString()
  teaOrWater?: string;

  /** @deprecated legacy */
  @IsOptional()
  @IsString()
  serviceType?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  teaServiceParticipants?: number;

  @IsOptional()
  @IsString()
  teaServiceSpecialRequest?: string;

  /** 管理员编辑时可更换预订人 */
  @IsOptional()
  @IsString()
  @Matches(/^\d+$/, { message: 'reservedByUserId must be a numeric id' })
  reservedByUserId?: string;
}

