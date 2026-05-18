import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AccessRightController } from './access-right.controller';
import { AccessRightService } from './access-right.service';

@Module({
  imports: [PrismaModule],
  controllers: [AccessRightController],
  providers: [AccessRightService],
})
export class AccessRightModule {}
