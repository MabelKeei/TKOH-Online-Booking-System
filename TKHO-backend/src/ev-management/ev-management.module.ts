import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { EvManagementController } from './ev-management.controller';
import { EvManagementService } from './ev-management.service';

@Module({
  imports: [PrismaModule],
  controllers: [EvManagementController],
  providers: [EvManagementService],
})
export class EvManagementModule {}
