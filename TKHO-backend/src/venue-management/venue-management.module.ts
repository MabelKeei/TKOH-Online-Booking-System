import { Module } from '@nestjs/common';
import { DisplayManagementModule } from '../display-management/display-management.module';
import { PrismaModule } from '../prisma/prisma.module';
import { VenueManagementController } from './venue-management.controller';
import { VenueManagementService } from './venue-management.service';

@Module({
  imports: [PrismaModule, DisplayManagementModule],
  controllers: [VenueManagementController],
  providers: [VenueManagementService],
})
export class VenueManagementModule {}

