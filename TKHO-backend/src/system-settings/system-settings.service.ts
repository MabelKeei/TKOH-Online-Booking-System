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

  private parseEvDateUpdateTime(raw: string): string | null {
    const value = String(raw ?? '').trim();
    if (/^([01]\d|2[0-3]):[0-5]\d$/.test(value)) return value;
    return null;
  }

  private parseEvWeeklyBookingLimit(raw: string): number | null {
    const value = Number.parseInt(String(raw ?? '').trim(), 10);
    if (Number.isFinite(value) && value >= 1 && value <= 7) return value;
    return null;
  }

  async getEvDateUpdateTime(): Promise<string> {
    const map = await this.ensureDefaultSettings();
    return (
      this.parseEvDateUpdateTime(
        this.getSetting(map, SystemSettingKey.evDateUpdateTime),
      ) ?? SYSTEM_SETTING_DEFAULTS[SystemSettingKey.evDateUpdateTime]
    );
  }

  async getEvWeeklyBookingLimit(): Promise<number> {
    const map = await this.ensureDefaultSettings();
    return (
      this.parseEvWeeklyBookingLimit(
        this.getSetting(map, SystemSettingKey.evWeeklyBookingLimit),
      ) ?? Number.parseInt(SYSTEM_SETTING_DEFAULTS[SystemSettingKey.evWeeklyBookingLimit], 10)
    );
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
    const evDateUpdateTime =
      this.parseEvDateUpdateTime(
        this.getSetting(map, SystemSettingKey.evDateUpdateTime),
      ) ?? SYSTEM_SETTING_DEFAULTS[SystemSettingKey.evDateUpdateTime];
    const evWeeklyBookingLimit =
      this.parseEvWeeklyBookingLimit(
        this.getSetting(map, SystemSettingKey.evWeeklyBookingLimit),
      ) ??
      Number.parseInt(SYSTEM_SETTING_DEFAULTS[SystemSettingKey.evWeeklyBookingLimit], 10);

    const rows = await this.prisma.system_settings.findMany({
      where: {
        setting_key: {
          in: [
            SystemSettingKey.userInactiveAfterMonths,
            SystemSettingKey.hkPublicHolidaysUrl,
            SystemSettingKey.evDateUpdateTime,
            SystemSettingKey.evWeeklyBookingLimit,
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
      evDateUpdateTime,
      evWeeklyBookingLimit,
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

    if (dto.evDateUpdateTime != null) {
      const time = String(dto.evDateUpdateTime).trim();
      await this.prisma.system_settings.upsert({
        where: { setting_key: SystemSettingKey.evDateUpdateTime },
        create: {
          setting_key: SystemSettingKey.evDateUpdateTime,
          setting_value: time,
          description:
            SYSTEM_SETTING_DESCRIPTIONS[SystemSettingKey.evDateUpdateTime],
          updated_at: now,
        },
        update: {
          setting_value: time,
          updated_at: now,
        },
      });
    }

    if (dto.evWeeklyBookingLimit != null) {
      const limit = String(dto.evWeeklyBookingLimit);
      await this.prisma.system_settings.upsert({
        where: { setting_key: SystemSettingKey.evWeeklyBookingLimit },
        create: {
          setting_key: SystemSettingKey.evWeeklyBookingLimit,
          setting_value: limit,
          description:
            SYSTEM_SETTING_DESCRIPTIONS[SystemSettingKey.evWeeklyBookingLimit],
          updated_at: now,
        },
        update: {
          setting_value: limit,
          updated_at: now,
        },
      });
    }

    return this.getSettings();
  }
}
