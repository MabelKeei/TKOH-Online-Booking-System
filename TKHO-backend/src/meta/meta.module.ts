import { Module } from '@nestjs/common';
import { SystemSettingsModule } from '../system-settings/system-settings.module';
import { MetaController } from './meta.controller';
import { MetaService } from './meta.service';

@Module({
  imports: [SystemSettingsModule],
  controllers: [MetaController],
  providers: [MetaService],
})
export class MetaModule {}
