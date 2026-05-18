import { Module } from '@nestjs/common';
import { DisplayManagementController } from './display-management.controller';
import { DisplayManagementService } from './display-management.service';

@Module({
  controllers: [DisplayManagementController],
  providers: [DisplayManagementService],
  exports: [DisplayManagementService],
})
export class DisplayManagementModule {}
