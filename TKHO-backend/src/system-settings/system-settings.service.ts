import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateSystemSettingsDto } from './dto/update-system-settings.dto';
import {
  SYSTEM_SETTING_DEFAULTS,
  SYSTEM_SETTING_DESCRIPTIONS,
  SystemSettingKey,
  SystemSettingKeyName,
} from './system-setting.keys';

const DEFAULT_INACTIVE_AFTER_MONTHS = 6;

type SettingsMap = Map<string, string>;

@Injectable()
export class SystemSettingsService {
  constructor(private readonly prisma: PrismaService) {}

  private resolveInactiveAfterMonthsFromEnv(): number {
    const raw = Number.parseInt(
      String(process.env.USER_INACTIVE_AFTER_MONTHS ?? '').trim(),
      10,
    );
    if (Number.isFinite(raw) && raw > 0) return raw;
    return DEFAULT_INACTIVE_AFTER_MONTHS;
  }

  private async loadSettingsMap(): Promise<SettingsMap> {
    const rows = await this.prisma.system_settings.findMany();
    return new Map(rows.map((r) => [r.setting_key, r.setting_value ?? '']));
  }

  private getSetting(map: SettingsMap, key: SystemSettingKeyName): string {
    const value = map.get(key);
    if (value !== undefined && value !== '') return value;
    return SYSTEM_SETTING_DEFAULTS[key] ?? '';
  }

  private async ensureDefaultSettings(): Promise<SettingsMap> {
    const map = await this.loadSettingsMap();
    const missing = (
      Object.keys(SYSTEM_SETTING_DEFAULTS) as SystemSettingKeyName[]
    ).filter((key) => !map.has(key));
    if (!missing.length) return map;

    const now = new Date();
    await this.prisma.$transaction(
      missing.map((key) =>
        this.prisma.system_settings.upsert({
          where: { setting_key: key },
          create: {
            setting_key: key,
            setting_value: SYSTEM_SETTING_DEFAULTS[key],
            description: SYSTEM_SETTING_DESCRIPTIONS[key],
            updated_at: now,
          },
          update: {},
        }),
      ),
    );
    return this.loadSettingsMap();
  }

  private parseInactiveAfterMonths(raw: string): number | null {
    const months = Number.parseInt(String(raw ?? '').trim(), 10);
    if (Number.isFinite(months) && months > 0) return months;
    return null;
  }

  async getUserInactiveAfterMonths(): Promise<number> {
    const map = await this.ensureDefaultSettings();
    const fromDb = this.parseInactiveAfterMonths(
      this.getSetting(map, SystemSettingKey.userInactiveAfterMonths),
    );
    if (fromDb != null) return fromDb;
    return this.resolveInactiveAfterMonthsFromEnv();
  }

  async getHkPublicHolidaysUrl(): Promise<string> {
    const map = await this.ensureDefaultSettings();
    return this.getSetting(map, SystemSettingKey.hkPublicHolidaysUrl);
  }

  async getSettings() {
    const map = await this.ensureDefaultSettings();
    const userInactiveAfterMonths =
      this.parseInactiveAfterMonths(
        this.getSetting(map, SystemSettingKey.userInactiveAfterMonths),
      ) ?? this.resolveInactiveAfterMonthsFromEnv();
    const hkPublicHolidaysUrl = this.getSetting(
      map,
      SystemSettingKey.hkPublicHolidaysUrl,
    );

    const rows = await this.prisma.system_settings.findMany({
      where: {
        setting_key: {
          in: [
            SystemSettingKey.userInactiveAfterMonths,
            SystemSettingKey.hkPublicHolidaysUrl,
          ],
        },
      },
      select: { updated_at: true },
      orderBy: { updated_at: 'desc' },
    });
    const latestUpdatedAt = rows[0]?.updated_at?.toISOString() ?? null;

    return {
      userInactiveAfterMonths,
      hkPublicHolidaysUrl,
      updatedAt: latestUpdatedAt,
    };
  }

  async saveSettings(dto: UpdateSystemSettingsDto) {
    const now = new Date();
    if (dto.userInactiveAfterMonths != null) {
      await this.prisma.system_settings.upsert({
        where: { setting_key: SystemSettingKey.userInactiveAfterMonths },
        create: {
          setting_key: SystemSettingKey.userInactiveAfterMonths,
          setting_value: String(dto.userInactiveAfterMonths),
          description:
            SYSTEM_SETTING_DESCRIPTIONS[
              SystemSettingKey.userInactiveAfterMonths
            ],
          updated_at: now,
        },
        update: {
          setting_value: String(dto.userInactiveAfterMonths),
          updated_at: now,
        },
      });
    }

    if (dto.hkPublicHolidaysUrl != null) {
      const url = String(dto.hkPublicHolidaysUrl).trim();
      await this.prisma.system_settings.upsert({
        where: { setting_key: SystemSettingKey.hkPublicHolidaysUrl },
        create: {
          setting_key: SystemSettingKey.hkPublicHolidaysUrl,
          setting_value: url,
          description:
            SYSTEM_SETTING_DESCRIPTIONS[SystemSettingKey.hkPublicHolidaysUrl],
          updated_at: now,
        },
        update: {
          setting_value: url,
          updated_at: now,
        },
      });
    }

    return this.getSettings();
  }
}
