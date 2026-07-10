import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { OccupyDto } from './dto/occupy.dto';
import { CreateEvBookingDto } from './dto/create-ev-booking.dto';
import { CalendarAvailabilityQueryDto } from './dto/calendar-availability-query.dto';
import { AssignmentPreviewQueryDto } from './dto/assignment-preview-query.dto';
import { SlotOptionsQueryDto } from './dto/slot-options-query.dto';
import { EvBookingRateLimitGuard } from './guards/ev-booking-rate-limit.guard';
import { ParkingService } from './parking.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('parking')
@Controller('api/parking')
export class ParkingController {
  constructor(private readonly parkingService: ParkingService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('calendar-availability')
  getCalendarAvailability(@Query() query: CalendarAvailabilityQueryDto) {
    return this.parkingService.getCalendarAvailability(query.startDate, query.endDate);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('assignment-preview')
  getAssignmentPreview(@Query() query: AssignmentPreviewQueryDto) {
    return this.parkingService.getAssignmentPreview(
      query.bookingDate,
      query.periodId,
      query.slotId,
    );
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('slot-options')
  getSlotOptions(@Query() query: SlotOptionsQueryDto) {
    return this.parkingService.getSlotOptions(
      query.bookingDate,
      query.periodId,
      query.excludeBookingId,
    );
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, EvBookingRateLimitGuard)
  @Post('bookings')
  createBooking(
    @Req() req: { user: { corpId?: string; sub?: string } },
    @Body() dto: CreateEvBookingDto,
  ) {
    return this.parkingService.createBooking(req.user, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('occupy')
  occupy(@Body() dto: OccupyDto) {
    return this.parkingService.occupy(dto);
  }
}
