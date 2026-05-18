import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PromptManagementService } from './prompt-management.service';
import { CreatePromptDto } from './dto/create-prompt.dto';
import { UpdatePromptDto } from './dto/update-prompt.dto';

@ApiTags('prompt-management')
@ApiBearerAuth()
@Controller('api/prompt-management')
export class PromptManagementController {
  constructor(private readonly promptManagementService: PromptManagementService) {}

  @Get('prompts')
  listPrompts(@Query('category') category?: string) {
    return this.promptManagementService.listPrompts(category);
  }

  @Post('prompts')
  createPrompt(@Body() dto: CreatePromptDto) {
    return this.promptManagementService.createPrompt(dto);
  }

  @Patch('prompts/:id')
  updatePrompt(@Param('id') id: string, @Body() dto: UpdatePromptDto) {
    return this.promptManagementService.updatePrompt(id, dto);
  }

  @Delete('prompts/:id')
  deletePrompt(@Param('id') id: string) {
    return this.promptManagementService.deletePrompt(id);
  }
}
