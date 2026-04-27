import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { OccupyDto } from './dto/occupy.dto';
import { ParkingService } from './parking.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('parking')
@Controller('api/parking')
export class ParkingController {
  constructor(private readonly parkingService: ParkingService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('occupy')
  occupy(@Body() dto: OccupyDto) {
    return this.parkingService.occupy(dto);
  }
}
