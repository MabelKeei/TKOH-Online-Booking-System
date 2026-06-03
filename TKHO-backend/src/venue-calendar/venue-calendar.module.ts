import { Module } from '@nestjs/common';
import { VenueCalendarController } from './venue-calendar.controller';
import { VenueCalendarService } from './venue-calendar.service';

@Module({
  controllers: [VenueCalendarController],
  providers: [VenueCalendarService],
})
export class VenueCalendarModule {}
