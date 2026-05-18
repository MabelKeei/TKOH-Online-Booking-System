import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { AdminRoleGuard } from '../auth/guards/admin-role.guard';
import { DisplayManagementService } from './display-management.service';
import { UpdateDisplayConfigDto } from './dto/update-display-config.dto';

@ApiTags('display-management')
@ApiBearerAuth()
@UseGuards(AdminRoleGuard)
@Controller('api/display-management')
export class DisplayManagementController {
  constructor(
    private readonly displayManagementService: DisplayManagementService,
  ) {}

  @Get('config')
  getConfig() {
    return this.displayManagementService.getConfig();
  }

  @Put('config')
  saveConfig(@Body() dto: UpdateDisplayConfigDto, @Req() req: any) {
    const updatedBy = String(req.user?.name || req.user?.corpId || 'Admin');
    return this.displayManagementService.saveConfig(dto, updatedBy);
  }

  @Post('merge-qr-image')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: join(process.cwd(), 'uploads', 'display'),
        filename: (_, file, cb) => {
          const ext = extname(file.originalname || '').toLowerCase();
          const safeExt = ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext)
            ? ext
            : '.png';
          cb(
            null,
            `merge-qr-${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`,
          );
        },
      }),
      limits: { fileSize: 2 * 1024 * 1024 },
      fileFilter: (_, file, cb) => {
        const ok = [
          'image/jpeg',
          'image/png',
          'image/webp',
          'image/gif',
        ].includes(file.mimetype);
        cb(ok ? null : new BadRequestException('Only jpg/png/webp/gif allowed'), ok);
      },
    }),
  )
  uploadMergeQrImage(@UploadedFile() file: any) {
    if (!file) throw new BadRequestException('Image file is required');
    return this.displayManagementService.saveMergeQrImage(file.filename);
  }

  @Delete('merge-qr-image')
  clearMergeQrImage(@Req() req: any) {
    const updatedBy = String(req.user?.name || req.user?.corpId || 'Admin');
    return this.displayManagementService.clearMergeQrImage(updatedBy);
  }
}
