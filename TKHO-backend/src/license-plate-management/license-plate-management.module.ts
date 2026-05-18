import { Module } from '@nestjs/common';
import { LicensePlateManagementController } from './license-plate-management.controller';
import { LicensePlateManagementService } from './license-plate-management.service';

@Module({
  controllers: [LicensePlateManagementController],
  providers: [LicensePlateManagementService],
})
export class LicensePlateManagementModule {}
