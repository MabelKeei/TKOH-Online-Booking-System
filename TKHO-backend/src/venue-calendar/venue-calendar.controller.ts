import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { VenueCalendarService } from './venue-calendar.service';
import { CreateVenueCalendarBookingDto } from './dto/create-venue-calendar-booking.dto';
import { UpdateVenueCalendarBookingDto } from './dto/update-venue-calendar-booking.dto';
import {
  CalendarBookingsDateQueryDto,
  CalendarBookingsMonthQueryDto,
  CalendarBookingsRangeQueryDto,
  CalendarBookingsWeekQueryDto,
  RoomAvailabilityQueryDto,
} from './dto/calendar-bookings-query.dto';

@ApiTags('venue-calendar')
@ApiBearerAuth()
@Controller('api/venue-calendar')
export class VenueCalendarController {
  constructor(private readonly venueCalendarService: VenueCalendarService) {}

  @Get('bookings/range')
  listByRange(@Query() query: CalendarBookingsRangeQueryDto) {
    return this.venueCalendarService.listByRange(
      query.start,
      query.end,
      query.roomType,
    );
  }

  @Get('bookings/date')
  listByDate(@Query() query: CalendarBookingsDateQueryDto) {
    return this.venueCalendarService.listByDate(query.date, query.roomType);
  }

  @Get('bookings/week')
  listByWeek(@Query() query: CalendarBookingsWeekQueryDto) {
    return this.venueCalendarService.listByWeek(query.weekStart, query.roomType);
  }

  @Get('bookings/month')
  listByMonth(@Query() query: CalendarBookingsMonthQueryDto) {
    return this.venueCalendarService.listByMonth(
      query.year,
      query.month,
      query.roomType,
    );
  }

  @Post('bookings')
  create(
    @Body() dto: CreateVenueCalendarBookingDto,
    @Req() req: { user?: { sub?: string; role?: string; isSuperAdmin?: boolean } },
  ) {
    return this.venueCalendarService.createBooking(dto, req?.user);
  }

  @Put('bookings/:id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateVenueCalendarBookingDto,
    @Req() req: { user?: { sub?: string; role?: string; isSuperAdmin?: boolean } },
  ) {
    return this.venueCalendarService.updateBooking(id, dto, req?.user);
  }

  @Delete('bookings/:id')
  remove(@Param('id') id: string) {
    return this.venueCalendarService.deleteBooking(id);
  }

  @Get('rooms')
  listRooms(@Query('roomType') roomType?: string) {
    return this.venueCalendarService.listRooms(roomType);
  }

  @Get('rooms/availability')
  checkAvailability(
    @Query() query: RoomAvailabilityQueryDto,
    @Req() req: { user?: { sub?: string; role?: string; isSuperAdmin?: boolean } },
  ) {
    return this.venueCalendarService.checkRoomAvailability(
      query.roomId,
      query.date,
      query.startTime,
      query.endTime,
      query.excludeBookingId,
      req?.user,
    );
  }
}
