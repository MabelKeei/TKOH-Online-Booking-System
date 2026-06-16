import { Module } from '@nestjs/common';
import { DisplayManagementModule } from '../display-management/display-management.module';
import { PrismaModule } from '../prisma/prisma.module';
import { EvManagementController } from './ev-management.controller';
import { EvManagementService } from './ev-management.service';

@Module({
  imports: [PrismaModule, DisplayManagementModule],
  controllers: [EvManagementController],
  providers: [EvManagementService],
})
export class EvManagementModule {}
