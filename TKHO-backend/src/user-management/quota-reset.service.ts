import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { Prisma } from '@prisma/client';
import { APP_TIMEZONE, getAppCalendarYear } from '../common/app-timezone';
import { PrismaService } from '../prisma/prisma.service';

/** 持久化于 display_config_settings，记录最近一次全员配额重置的自然年 */
export const QUOTA_LAST_RESET_YEAR_KEY = 'system.quota_last_reset_year';

type QuotaResetTrigger = 'startup' | 'cron';

@Injectable()
export class QuotaResetService implements OnModuleInit {
  private readonly logger = new Logger(QuotaResetService.name);
  private resetInProgress = false;

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.ensureAnnualQuotaReset('startup');
  }

  /** 每年 1 月 1 日 00:00（APP_TIMEZONE，默认香港） */
  @Cron('0 0 1 1 *', { timeZone: APP_TIMEZONE })
  async handleAnnualQuotaResetCron() {
    await this.ensureAnnualQuotaReset('cron');
  }

  private async ensureAnnualQuotaReset(trigger: QuotaResetTrigger) {
    if (this.resetInProgress) return;

    this.resetInProgress = true;
    try {
      const currentYear = getAppCalendarYear();
      const outcome = await this.prisma.$transaction(async (tx) => {
        const lastResetYear = await this.readLastResetYear(tx);
        if (currentYear <= lastResetYear) {
          return { skipped: true as const, lastResetYear, usersUpdated: 0 };
        }

        const result = await tx.user.updateMany({
          data: { usedQuotaEv: 0, usedQuotaVenue: 0 },
        });

        await tx.display_config_settings.upsert({
          where: { config_key: QUOTA_LAST_RESET_YEAR_KEY },
          create: {
            config_key: QUOTA_LAST_RESET_YEAR_KEY,
            config_value: String(currentYear),
            updated_at: new Date(),
          },
          update: {
            config_value: String(currentYear),
            updated_at: new Date(),
          },
        });

        return {
          skipped: false as const,
          lastResetYear,
          usersUpdated: result.count,
        };
      });

      if (outcome.skipped) {
        this.logger.log(
          `Annual quota reset skipped (${trigger}): already reset for ${outcome.lastResetYear}`,
        );
        return;
      }

      this.logger.log(
        `Annual quota reset completed (${trigger}): year=${currentYear}, usersUpdated=${outcome.usersUpdated}`,
      );
    } catch (err) {
      this.logger.error(`Annual quota reset failed (${trigger})`, err);
    } finally {
      this.resetInProgress = false;
    }
  }

  private async readLastResetYear(
    tx: Prisma.TransactionClient,
  ): Promise<number> {
    const row = await tx.display_config_settings.findUnique({
      where: { config_key: QUOTA_LAST_RESET_YEAR_KEY },
    });
    const parsed = Number.parseInt(String(row?.config_value ?? ''), 10);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;

    // 首次部署：视为「尚未为今年重置」，启动时若已进入新自然年则补跑一次
    return getAppCalendarYear() - 1;
  }
}
