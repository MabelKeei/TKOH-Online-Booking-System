import { PartialType } from '@nestjs/swagger';
import { CreateVenueCalendarBookingDto } from './create-venue-calendar-booking.dto';

export class UpdateVenueCalendarBookingDto extends PartialType(
  CreateVenueCalendarBookingDto,
) {}
