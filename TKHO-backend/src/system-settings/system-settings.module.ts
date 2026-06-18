import { Module } from '@nestjs/common';
import { HkPublicHolidaysService } from './hk-public-holidays.service';
import { SystemSettingsController } from './system-settings.controller';
import { SystemSettingsService } from './system-settings.service';

@Module({
  controllers: [SystemSettingsController],
  providers: [SystemSettingsService, HkPublicHolidaysService],
  exports: [SystemSettingsService, HkPublicHolidaysService],
})
export class SystemSettingsModule {}
