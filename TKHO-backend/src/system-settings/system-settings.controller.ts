import { Body, Controller, Get, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminRoleGuard } from '../auth/guards/admin-role.guard';
import { UpdateSystemSettingsDto } from './dto/update-system-settings.dto';
import { HkPublicHolidaysService } from './hk-public-holidays.service';
import { SystemSettingsService } from './system-settings.service';

@ApiTags('system-settings')
@ApiBearerAuth()
@UseGuards(AdminRoleGuard)
@Controller('api/system-settings')
export class SystemSettingsController {
  constructor(
    private readonly systemSettingsService: SystemSettingsService,
    private readonly hkPublicHolidaysService: HkPublicHolidaysService,
  ) {}

  @Get()
  async getSettings() {
    const settings = await this.systemSettingsService.getSettings();
    return {
      ...settings,
      hkPublicHolidaysSyncedAt:
        await this.hkPublicHolidaysService.getLatestSyncedAt(),
    };
  }

  @Put()
  async saveSettings(@Body() dto: UpdateSystemSettingsDto) {
    const settings = await this.systemSettingsService.saveSettings(dto);
    if (dto.hkPublicHolidaysUrl != null) {
      await this.hkPublicHolidaysService.syncFromRemote('manual');
    }
    return {
      ...settings,
      hkPublicHolidaysSyncedAt:
        await this.hkPublicHolidaysService.getLatestSyncedAt(),
    };
  }

  @Post('sync-hk-holidays')
  syncHkHolidays() {
    return this.hkPublicHolidaysService.syncFromRemote('manual');
  }
}
