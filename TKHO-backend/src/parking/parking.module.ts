import { Module } from '@nestjs/common';
import { EvBookingRateLimitGuard } from './guards/ev-booking-rate-limit.guard';
import { ParkingController } from './parking.controller';
import { ParkingService } from './parking.service';

@Module({
  controllers: [ParkingController],
  providers: [ParkingService, EvBookingRateLimitGuard],
})
export class ParkingModule {}
