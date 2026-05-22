import { Injectable } from '@nestjs/common';
import { RedisService } from './redis.service';

const CALENDAR_VER_KEY = 'ev:calendar:ver';
const BOOKING_WINDOW_KEY = 'ev:booking-window';

export type CachedCalendarAvailability = {
  totalSpaces: number;
  availability: Record<string, { available: number; total: number; booked: number }>;
};

export type CachedEvBookingWindow = {
  resourceType: string;
  currentStartDate: string;
  currentEndDate: string;
  updatedBy: string;
  updatedAt: Date | string | null;
};

/** 不含 suggestedSlot（每次请求在空闲列表上随机/首选，避免缓存固定同一车位） */
export type CachedAssignmentPreview = {
  total: number;
  booked: number;
  remaining: number;
  isFull: boolean;
  freeSlots: Array<{ id: string; evSpace: string; location?: string }>;
};

@Injectable()
export class EvRedisCacheService {
  constructor(private readonly redis: RedisService) {}

  private calendarTtlSec(): number {
    const n = Number(process.env.EV_CALENDAR_CACHE_TTL_SEC ?? 10);
    return Number.isFinite(n) && n > 0 ? Math.floor(n) : 10;
  }

  private bookingWindowTtlSec(): number {
    const n = Number(process.env.EV_BOOKING_WINDOW_CACHE_TTL_SEC ?? 60);
    return Number.isFinite(n) && n > 0 ? Math.floor(n) : 60;
  }

  private assignmentPreviewTtlSec(): number {
    const n = Number(process.env.EV_ASSIGNMENT_PREVIEW_CACHE_TTL_SEC ?? 8);
    return Number.isFinite(n) && n > 0 ? Math.floor(n) : 8;
  }

  private calendarKey(ver: string, startDate: string, endDate: string): string {
    return `ev:calendar:${ver}:${startDate}:${endDate}`;
  }

  private assignmentPreviewKey(ver: string, dateKey: string, periodId: string): string {
    return `ev:preview:${ver}:${dateKey}:${periodId}`;
  }

  private async calendarVersion(): Promise<string> {
    if (!this.redis.isReady()) return '0';
    return (await this.redis.get(CALENDAR_VER_KEY)) ?? '0';
  }

  async getCalendar(
    startDate: string,
    endDate: string,
  ): Promise<CachedCalendarAvailability | null> {
    if (!this.redis.isReady()) return null;
    const ver = await this.calendarVersion();
    const raw = await this.redis.get(this.calendarKey(ver, startDate, endDate));
    if (!raw) return null;
    try {
      return JSON.parse(raw) as CachedCalendarAvailability;
    } catch {
      return null;
    }
  }

  async setCalendar(
    startDate: string,
    endDate: string,
    payload: CachedCalendarAvailability,
  ): Promise<void> {
    if (!this.redis.isReady()) return;
    const ver = await this.calendarVersion();
    await this.redis.set(
      this.calendarKey(ver, startDate, endDate),
      JSON.stringify(payload),
      this.calendarTtlSec(),
    );
  }

  async getAssignmentPreview(
    dateKey: string,
    periodId: string,
  ): Promise<CachedAssignmentPreview | null> {
    if (!this.redis.isReady()) return null;
    const ver = await this.calendarVersion();
    const raw = await this.redis.get(this.assignmentPreviewKey(ver, dateKey, periodId));
    if (!raw) return null;
    try {
      return JSON.parse(raw) as CachedAssignmentPreview;
    } catch {
      return null;
    }
  }

  async setAssignmentPreview(
    dateKey: string,
    periodId: string,
    payload: CachedAssignmentPreview,
  ): Promise<void> {
    if (!this.redis.isReady()) return;
    const ver = await this.calendarVersion();
    await this.redis.set(
      this.assignmentPreviewKey(ver, dateKey, periodId),
      JSON.stringify(payload),
      this.assignmentPreviewTtlSec(),
    );
  }

  /** 预订/占用车位后调用，使旧日历与 preview 缓存失效 */
  async bumpCalendarVersion(): Promise<void> {
    if (!this.redis.isReady()) return;
    await this.redis.incr(CALENDAR_VER_KEY);
  }

  async getBookingWindow(): Promise<CachedEvBookingWindow | null> {
    if (!this.redis.isReady()) return null;
    const raw = await this.redis.get(BOOKING_WINDOW_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as CachedEvBookingWindow;
    } catch {
      return null;
    }
  }

  async setBookingWindow(payload: CachedEvBookingWindow): Promise<void> {
    if (!this.redis.isReady()) return;
    await this.redis.set(
      BOOKING_WINDOW_KEY,
      JSON.stringify(payload),
      this.bookingWindowTtlSec(),
    );
  }

  async invalidateBookingWindow(): Promise<void> {
    if (!this.redis.isReady()) return;
    await this.redis.del(BOOKING_WINDOW_KEY);
    await this.bumpCalendarVersion();
  }
}
