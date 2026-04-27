import { Module } from '@nestjs/common';
import { AccountVehiclesController } from './account-vehicles.controller';
import { AccountVehiclesService } from './account-vehicles.service';

@Module({
  controllers: [AccountVehiclesController],
  providers: [AccountVehiclesService],
})
export class AccountVehiclesModule {}
