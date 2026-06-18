import { Module } from '@nestjs/common';
import { SystemSettingsModule } from '../system-settings/system-settings.module';
import { VenueCalendarController } from './venue-calendar.controller';
import { VenueCalendarService } from './venue-calendar.service';

@Module({
  imports: [SystemSettingsModule],
  controllers: [VenueCalendarController],
  providers: [VenueCalendarService],
})
export class VenueCalendarModule {}
