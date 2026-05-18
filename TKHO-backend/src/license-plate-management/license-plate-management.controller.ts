import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminRoleGuard } from '../auth/guards/admin-role.guard';
import { CreateLicensePlateDto } from './dto/create-license-plate.dto';
import { UpdateLicensePlateDto } from './dto/update-license-plate.dto';
import { LicensePlateManagementService } from './license-plate-management.service';

@ApiTags('license-plate-management')
@ApiBearerAuth()
@UseGuards(AdminRoleGuard)
@Controller('api/license-plate-management')
export class LicensePlateManagementController {
  constructor(
    private readonly licensePlateManagementService: LicensePlateManagementService,
  ) {}

  @Get('plates')
  listPlates() {
    return this.licensePlateManagementService.list();
  }

  @Get('plates/:id')
  getPlate(@Param('id') id: string) {
    return this.licensePlateManagementService.getOne(id);
  }

  @Post('plates')
  createPlate(@Body() dto: CreateLicensePlateDto) {
    return this.licensePlateManagementService.create(dto);
  }

  @Patch('plates/:id')
  updatePlate(@Param('id') id: string, @Body() dto: UpdateLicensePlateDto) {
    return this.licensePlateManagementService.update(id, dto);
  }

  @Delete('plates/:id')
  deletePlate(@Param('id') id: string) {
    return this.licensePlateManagementService.remove(id);
  }
}
