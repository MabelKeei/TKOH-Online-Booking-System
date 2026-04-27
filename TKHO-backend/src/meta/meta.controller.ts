import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MetaService } from './meta.service';

@ApiTags('meta')
@Controller('api/meta')
export class MetaController {
  constructor(private readonly metaService: MetaService) {}

  @Get('users')
  users() {
    return this.metaService.users();
  }

  @Get('employees')
  employees() {
    return this.metaService.users();
  }

  @Get('venues')
  venues() {
    return this.metaService.venues();
  }
}
