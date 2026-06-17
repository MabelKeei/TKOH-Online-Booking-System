import { Controller, Get, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MetaService } from './meta.service';

@ApiTags('meta')
@Controller('api/meta')
export class MetaController {
  constructor(private readonly metaService: MetaService) {}

  @Get('users')
  users(@Req() req: any) {
    return this.metaService.users(req?.user);
  }

  @Get('employees')
  employees(@Req() req: any) {
    return this.metaService.users(req?.user);
  }

  @Get('venues')
  venues() {
    return this.metaService.venues();
  }
}
