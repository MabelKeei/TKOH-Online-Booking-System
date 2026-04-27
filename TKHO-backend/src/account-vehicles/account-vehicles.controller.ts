import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AccountVehiclesService } from './account-vehicles.service';
import { CreateAccountVehicleDto } from './dto/create-account-vehicle.dto';
import { UpdateAccountVehicleDto } from './dto/update-account-vehicle.dto';

@ApiTags('account-vehicles')
@Controller('api/account/vehicles')
export class AccountVehiclesController {
  constructor(private readonly accountVehiclesService: AccountVehiclesService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get()
  list(@Req() req: any) {
    return this.accountVehiclesService.list(req.user);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Req() req: any, @Body() dto: CreateAccountVehicleDto) {
    return this.accountVehiclesService.create(req.user, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateAccountVehicleDto) {
    return this.accountVehiclesService.update(req.user, id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) {
    return this.accountVehiclesService.remove(req.user, id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':id/default')
  setDefault(@Req() req: any, @Param('id') id: string) {
    return this.accountVehiclesService.setDefault(req.user, id);
  }
}
