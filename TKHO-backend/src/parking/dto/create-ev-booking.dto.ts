import { IsDateString, IsOptional, IsString, Matches } from 'class-validator';

export class CreateEvBookingDto {
  @IsString()
  @Matches(/^\d+$/, { message: 'licensePlateId must be a numeric id' })
  licensePlateId: string;

  @IsString()
  @Matches(/^\d+$/, { message: 'periodId must be a numeric id' })
  periodId: string;

  @IsDateString()
  bookingDate: string;

  /** 预览分配的车位；若已被占用则服务端改分配其它空闲车位 */
  @IsOptional()
  @IsString()
  @Matches(/^\d+$/, { message: 'slotId must be a numeric id' })
  slotId?: string;

  /** 管理员代订时指定预订人用户 ID；默认本人 */
  @IsOptional()
  @IsString()
  @Matches(/^\d+$/, { message: 'reservedByUserId must be a numeric id' })
  reservedByUserId?: string;
}
