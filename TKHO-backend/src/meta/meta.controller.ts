import { Controller, Get, Query, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { HkPublicHolidaysService } from '../system-settings/hk-public-holidays.service';
import { HkPublicHolidaysQueryDto } from './dto/hk-public-holidays-query.dto';
import { MetaService } from './meta.service';

@ApiTags('meta')
@Controller('api/meta')
export class MetaController {
  constructor(
    private readonly metaService: MetaService,
    private readonly hkPublicHolidaysService: HkPublicHolidaysService,
  ) {}

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

  @Get('hk-public-holidays')
  hkPublicHolidays(@Query() query: HkPublicHolidaysQueryDto) {
    return this.hkPublicHolidaysService.listHolidays(query.from, query.to);
  }
}
