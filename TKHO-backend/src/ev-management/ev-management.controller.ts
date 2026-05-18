import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { EvManagementService } from './ev-management.service';
import { CreateEvParkingDto } from './dto/create-ev-parking.dto';
import { UpdateEvParkingDto } from './dto/update-ev-parking.dto';
import { CreateEvTimePeriodDto } from './dto/create-ev-time-period.dto';
import { UpdateEvTimePeriodDto } from './dto/update-ev-time-period.dto';
import { PublishEvWindowDto } from './dto/publish-ev-window.dto';

@ApiTags('ev-management')
@ApiBearerAuth()
@Controller('api/ev-management')
export class EvManagementController {
  constructor(private readonly evManagementService: EvManagementService) {}

  @Get('parking')
  listParking() {
    return this.evManagementService.listParkingSlots();
  }

  @Post('parking')
  createParking(@Body() dto: CreateEvParkingDto) {
    return this.evManagementService.createParkingSlot(dto);
  }

  @Patch('parking/:id')
  updateParking(@Param('id') id: string, @Body() dto: UpdateEvParkingDto) {
    return this.evManagementService.updateParkingSlot(id, dto);
  }

  @Delete('parking/:id')
  deleteParking(@Param('id') id: string) {
    return this.evManagementService.deleteParkingSlot(id);
  }

  @Get('time-periods')
  listTimePeriods() {
    return this.evManagementService.listTimePeriods();
  }

  @Post('time-periods')
  createTimePeriod(@Body() dto: CreateEvTimePeriodDto) {
    return this.evManagementService.createTimePeriod(dto);
  }

  @Patch('time-periods/:id')
  updateTimePeriod(@Param('id') id: string, @Body() dto: UpdateEvTimePeriodDto) {
    return this.evManagementService.updateTimePeriod(id, dto);
  }

  @Delete('time-periods/:id')
  deleteTimePeriod(@Param('id') id: string) {
    return this.evManagementService.deleteTimePeriod(id);
  }

  @Get('booking-window')
  getBookingWindow() {
    return this.evManagementService.getEvBookingWindow();
  }

  @Patch('booking-window')
  publishBookingWindow(@Body() dto: PublishEvWindowDto) {
    return this.evManagementService.publishEvBookingWindow(dto);
  }
}
