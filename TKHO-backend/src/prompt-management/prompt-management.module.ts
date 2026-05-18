import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PromptManagementController } from './prompt-management.controller';
import { PromptManagementService } from './prompt-management.service';

@Module({
  imports: [PrismaModule],
  controllers: [PromptManagementController],
  providers: [PromptManagementService],
})
export class PromptManagementModule {}
