import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { VenueManagementController } from './venue-management.controller';
import { VenueManagementService } from './venue-management.service';

@Module({
  imports: [PrismaModule],
  controllers: [VenueManagementController],
  providers: [VenueManagementService],
})
export class VenueManagementModule {}

