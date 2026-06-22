import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { HkPublicHolidaysService } from '../system-settings/hk-public-holidays.service';
import { CreateVenueCalendarBookingDto } from './dto/create-venue-calendar-booking.dto';
import { UpdateVenueCalendarBookingDto } from './dto/update-venue-calendar-booking.dto';
import { isSuperAdminAuth } from '../auth/super-admin.util';
import { isAdminRole } from '../auth/admin-role.util';
import { consumeVenueQuota, releaseVenueQuota } from '../common/user-quota';

const bookingInclude = {
  venue: { select: { id: true, name: true, color: true, tab: true, venueType: true } },
  reservedBy: {
    select: { id: true, name: true, contact: true, email: true },
  },
  venueTeaService: { select: { teaService: true } },
} satisfies Prisma.VenueBookingsInclude;

type BookingRow = Prisma.VenueBookingsGetPayload<{ include: typeof bookingInclude }>;

@Injectable()
export class VenueCalendarService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly hkPublicHolidaysService: HkPublicHolidaysService,
  ) {}

  private parseUserId(authSub: unknown): bigint {
    const raw = String(authSub ?? '').trim();
    if (!/^\d+$/.test(raw)) {
      throw new BadRequestException('Invalid user id');
    }
    return BigInt(raw);
  }

  private assertNotSuperAdmin(auth: { role?: string; isSuperAdmin?: boolean } | null | undefined) {
    if (isSuperAdminAuth(auth)) {
      throw new ForbiddenException('Super admin is not allowed to book resources');
    }
  }

  private async resolveReservedByUserId(
    auth: { sub?: string; role?: string; system?: string } | null | undefined,
    reservedByUserIdRaw: string | undefined,
    actorUserId: bigint,
  ): Promise<bigint> {
    const raw = String(reservedByUserIdRaw ?? '').trim();
    if (!raw) return actorUserId;
    if (!/^\d+$/.test(raw)) {
      throw new BadRequestException('Invalid reservedByUserId');
    }
    const reservedByUserId = BigInt(raw);
    if (reservedByUserId === actorUserId) return actorUserId;
    if (!isAdminRole(auth)) {
      throw new ForbiddenException('Only administrators can book on behalf of another user.');
    }
    const user = await this.prisma.user.findUnique({
      where: { id: reservedByUserId },
      select: { id: true, status: true },
    });
    if (!user) {
      throw new BadRequestException('Reserved-by user not found');
    }
    if (String(user.status || '').toLowerCase() !== 'active') {
      throw new BadRequestException('Reserved-by user is not active');
    }
    return reservedByUserId;
  }

  private parseDateOnly(ymd: string): Date {
    const text = String(ymd || '').trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) {
      throw new BadRequestException('Invalid date format, expected YYYY-MM-DD');
    }
    return new Date(`${text}T00:00:00.000Z`);
  }

  private combineDateAndTime(bookingDate: Date, time: Date): Date {
    const y = bookingDate.getUTCFullYear();
    const mo = bookingDate.getUTCMonth();
    const d = bookingDate.getUTCDate();
    return new Date(
      Date.UTC(y, mo, d, time.getUTCHours(), time.getUTCMinutes(), 0),
    );
  }

  private parseTimeHm(hm: string): Date {
    const text = String(hm || '').trim();
    const match = /^(\d{1,2}):(\d{2})$/.exec(text);
    if (!match) {
      throw new BadRequestException('Invalid time format, expected HH:mm');
    }
    const h = Number(match[1]);
    const m = Number(match[2]);
    if (h < 0 || h > 23 || m < 0 || m > 59) {
      throw new BadRequestException('Invalid time');
    }
    return new Date(Date.UTC(1970, 0, 1, h, m, 0));
  }

  private timeToMinutes(value: Date | null | undefined): number {
    if (!value) return 0;
    return value.getUTCHours() * 60 + value.getUTCMinutes();
  }

  private timesOverlap(
    startA: Date,
    endA: Date,
    startB: Date,
    endB: Date,
  ): boolean {
    const a0 = this.timeToMinutes(startA);
    const a1 = this.timeToMinutes(endA);
    const b0 = this.timeToMinutes(startB);
    const b1 = this.timeToMinutes(endB);
    return a0 < b1 && a1 > b0;
  }

  /** venue_bookings.notes 仅存备注纯文本；茶歇等写入 venue_tea_service */
  private buildNotesPayload(dto: CreateVenueCalendarBookingDto | UpdateVenueCalendarBookingDto) {
    const text = dto.remark?.trim();
    return text || null;
  }

  /** @db.Date 按 UTC 日历日输出 YYYY-MM-DD，避免前端用 ISO 解析时跨时区错位 */
  private formatCalendarDateOnly(value: Date | null | undefined): string {
    if (!value) return this.formatDateOnlyUtc(new Date());
    const d = new Date(value);
    return this.formatDateOnlyUtc(d);
  }

  private mapCalendarBooking(row: BookingRow) {
    return {
      id: row.id.toString(),
      venueId: row.venueId != null ? Number(row.venueId) : null,
      roomName: row.venue?.name ?? '',
      date: this.formatCalendarDateOnly(row.bookingDate),
      startTime: this.formatTimeValue(row.startTime),
      endTime: this.formatTimeValue(row.endTime),
      attendees: row.attendees ?? null,
      topic: row.meetingTitle ?? '',
      notes: row.notes?.trim() ?? '',
      reservedBy: row.reservedBy?.name ?? '',
      contact: row.reservedBy?.contact ?? '',
      email: row.reservedBy?.email ?? '',
      color: row.venue?.color ?? '#3b82f6',
      status: row.status ?? 'upcoming',
      approvalStatus: String(row.approvalStatus ?? '').toLowerCase() || null,
      teaServiceRequired: row.teaServiceRequired,
      isBlocked: false,
    };
  }

  private formatTimeValue(value: Date | null | undefined): string {
    if (!value) return '';
    const h = String(value.getUTCHours()).padStart(2, '0');
    const m = String(value.getUTCMinutes()).padStart(2, '0');
    return `${h}:${m}`;
  }

  private venueTabFilter(roomType?: string): Prisma.VenuesWhereInput | undefined {
    const t = String(roomType ?? '').trim().toLowerCase();
    if (t === 'conference') {
      return { tab: 'conference_discussion' };
    }
    if (t === 'other') {
      return { tab: 'other_venues' };
    }
    return undefined;
  }

  /** 日历仅展示/查询 active 场地 */
  private calendarVenueWhere(roomType?: string): Prisma.VenuesWhereInput {
    const tabFilter = this.venueTabFilter(roomType);
    return {
      status: 'active',
      ...(tabFilter ?? {}),
    };
  }

  private calendarBookingWhere(
    start: Date,
    end: Date,
    roomType?: string,
  ): Prisma.VenueBookingsWhereInput {
    const where: Prisma.VenueBookingsWhereInput = {
      AND: [
        {
          OR: [
            { bookingType: null },
            { bookingType: 'venue' },
          ],
        },
        {
          OR: [
            { status: null },
            { status: { not: 'cancelled', mode: 'insensitive' } },
          ],
        },
        {
          OR: [
            { approvalStatus: null },
            {
              approvalStatus: {
                in: ['pending', 'approved'],
                mode: 'insensitive',
              },
            },
          ],
        },
      ],
      bookingDate: { gte: start, lte: end },
      venue: this.calendarVenueWhere(roomType),
    };
    return where;
  }

  private formatDateOnlyUtc(date: Date): string {
    const y = date.getUTCFullYear();
    const m = String(date.getUTCMonth() + 1).padStart(2, '0');
    const d = String(date.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  /** 与前端 VenueCalendarMonth 网格一致：含上月尾、下月初的可见格 */
  private getMonthGridDateRange(year: number, month: number) {
    const firstOfMonth = new Date(Date.UTC(year, month - 1, 1));
    const firstDow = firstOfMonth.getUTCDay();
    const start = new Date(firstOfMonth);
    start.setUTCDate(start.getUTCDate() - firstDow);

    const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
    const cellsBefore = firstDow;
    const totalCells = cellsBefore + daysInMonth;
    const targetCells = totalCells <= 35 ? 35 : 42;

    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + targetCells - 1);

    return { start, end };
  }

  /** 周日为一周起始（与周视图一致） */
  private getWeekDateRange(weekStartYmd: string) {
    const start = this.parseDateOnly(weekStartYmd);
    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + 6);
    return { start, end };
  }

  private wrapCalendarList(
    view: 'day' | 'week' | 'month' | 'range',
    start: Date,
    end: Date,
    bookings: Record<string, unknown>[],
  ) {
    return {
      view,
      range: {
        start: this.formatDateOnlyUtc(start),
        end: this.formatDateOnlyUtc(end),
      },
      bookings,
    };
  }

  async listByRange(start: string, end: string, roomType?: string) {
    const startDate = this.parseDateOnly(start);
    const endDate = this.parseDateOnly(end);
    const rows = await this.prisma.venueBookings.findMany({
      where: this.calendarBookingWhere(startDate, endDate, roomType),
      orderBy: [{ bookingDate: 'asc' }, { startTime: 'asc' }],
      include: bookingInclude,
    });
    const bookings = rows.map((r) => this.mapCalendarBooking(r));
    return this.wrapCalendarList('range', startDate, endDate, bookings);
  }

  async listByDate(date: string, roomType?: string) {
    const start = this.parseDateOnly(date);
    const rows = await this.prisma.venueBookings.findMany({
      where: this.calendarBookingWhere(start, start, roomType),
      orderBy: [{ bookingDate: 'asc' }, { startTime: 'asc' }],
      include: bookingInclude,
    });
    const bookings = rows.map((r) => this.mapCalendarBooking(r));
    return this.wrapCalendarList('day', start, start, bookings);
  }

  async listByWeek(weekStart: string, roomType?: string) {
    const { start, end } = this.getWeekDateRange(weekStart);
    const rows = await this.prisma.venueBookings.findMany({
      where: this.calendarBookingWhere(start, end, roomType),
      orderBy: [{ bookingDate: 'asc' }, { startTime: 'asc' }],
      include: bookingInclude,
    });
    const bookings = rows.map((r) => this.mapCalendarBooking(r));
    return this.wrapCalendarList('week', start, end, bookings);
  }

  async listByMonth(year: number, month: number, roomType?: string) {
    const { start, end } = this.getMonthGridDateRange(year, month);
    const rows = await this.prisma.venueBookings.findMany({
      where: this.calendarBookingWhere(start, end, roomType),
      orderBy: [{ bookingDate: 'asc' }, { startTime: 'asc' }],
      include: bookingInclude,
    });
    const bookings = rows.map((r) => this.mapCalendarBooking(r));
    return this.wrapCalendarList('month', start, end, bookings);
  }

  private async findVenueByName(roomName: string) {
    const name = roomName.trim();
    const venue = await this.prisma.venues.findFirst({
      where: { name, status: 'active' },
    });
    if (!venue) {
      throw new NotFoundException(`Venue not found: ${name}`);
    }
    return venue;
  }

  private async assertSlotAvailable(
    venueId: bigint,
    bookingDate: Date,
    startTime: Date,
    endTime: Date,
    excludeBookingId?: bigint,
  ) {
    if (this.timeToMinutes(startTime) >= this.timeToMinutes(endTime)) {
      throw new BadRequestException('End time must be after start time');
    }

    const bookingStartAt = this.combineDateAndTime(bookingDate, startTime);
    const bookingEndAt = this.combineDateAndTime(bookingDate, endTime);

    const blocks = await this.prisma.venue_blocks.findMany({
      where: { venue_id: venueId, start_at: { lt: bookingEndAt }, end_at: { gt: bookingStartAt } },
    });

    if (blocks.length > 0) {
      throw new BadRequestException('Selected time conflicts with a blocked period');
    }

    const conflicts = await this.prisma.venueBookings.findMany({
      where: {
        venueId,
        bookingDate,
        bookingType: 'venue',
        AND: [
          {
            OR: [
              { status: null },
              { status: { not: 'cancelled', mode: 'insensitive' } },
            ],
          },
          {
            OR: [
              { approvalStatus: null },
              {
                approvalStatus: {
                  in: ['pending', 'approved'],
                  mode: 'insensitive',
                },
              },
            ],
          },
        ],
        ...(excludeBookingId ? { id: { not: excludeBookingId } } : {}),
      },
      select: { id: true, startTime: true, endTime: true },
    });

    for (const row of conflicts) {
      if (
        row.startTime &&
        row.endTime &&
        this.timesOverlap(startTime, endTime, row.startTime, row.endTime)
      ) {
        throw new BadRequestException('Selected time slot is not available');
      }
    }
  }

  async checkRoomAvailability(
    roomId: string,
    date: string,
    startTime: string,
    endTime: string,
    excludeBookingId?: string,
  ) {
    const venueId = BigInt(roomId);
    const venue = await this.prisma.venues.findUnique({ where: { id: venueId } });
    if (!venue) throw new NotFoundException('Venue not found');

    try {
      await this.assertSlotAvailable(
        venueId,
        this.parseDateOnly(date),
        this.parseTimeHm(startTime),
        this.parseTimeHm(endTime),
        excludeBookingId ? BigInt(excludeBookingId) : undefined,
      );
      return { available: true, roomId, date, startTime, endTime };
    } catch (e) {
      if (e instanceof BadRequestException) {
        return { available: false, message: e.message };
      }
      throw e;
    }
  }

  async listRooms(roomType?: string) {
    const venues = await this.prisma.venues.findMany({
      where: { status: 'active', ...this.venueTabFilter(roomType) },
      orderBy: { id: 'asc' },
      select: {
        id: true,
        name: true,
        color: true,
        tab: true,
        venueType: true,
        roomCapacity: true,
      },
    });
    return venues.map((v) => ({
      id: v.id.toString(),
      name: v.name,
      color: v.color || '#3b82f6',
      tab: v.tab,
      type: v.venueType,
      roomCapacity: v.roomCapacity,
    }));
  }

  async createBooking(dto: CreateVenueCalendarBookingDto, auth?: { sub?: string; role?: string; isSuperAdmin?: boolean; system?: string }) {
    this.assertNotSuperAdmin(auth);
    const actorUserId = this.parseUserId(auth?.sub);
    const reservedByUserId = await this.resolveReservedByUserId(
      auth,
      dto.reservedByUserId,
      actorUserId,
    );
    const venue = await this.findVenueByName(dto.roomName);
    const bookingDate = this.parseDateOnly(dto.date);
    const startTime = this.parseTimeHm(dto.startTime);
    const endTime = this.parseTimeHm(dto.endTime);

    await this.hkPublicHolidaysService.assertBookableForUser(bookingDate, auth);
    await this.assertSlotAvailable(venue.id, bookingDate, startTime, endTime);

    const notes = this.buildNotesPayload(dto);
    const attendees = dto.attendeeCount ?? 1;
    const teaRequired = Boolean(dto.teaServiceRequired);

    const created = await this.prisma.$transaction(async (tx) => {
      await consumeVenueQuota(tx, reservedByUserId);

      const row = await tx.venueBookings.create({
        data: {
          venueId: venue.id,
          reservedByUserId,
          meetingTitle: dto.topic.trim(),
          bookingDate,
          startTime,
          endTime,
          attendees,
          notes,
          status: 'confirmed',
          bookingType: 'venue',
          approvalStatus: 'pending',
          teaServiceRequired: teaRequired,
          submittedAt: new Date(),
        },
        include: bookingInclude,
      });

      if (teaRequired) {
        const teaService = {
          attendees,
          beverages: dto.teaOrWater ?? 'tea',
          serveAs: dto.serviceType ?? 'pot',
          quantity: attendees,
          notes: dto.teaServiceSpecialRequest ?? '',
        };
        await tx.venueTeaService.create({
          data: {
            venueBookingId: row.id,
            teaService,
          },
        });
      }

      return tx.venueBookings.findUniqueOrThrow({
        where: { id: row.id },
        include: bookingInclude,
      });
    });

    return this.mapCalendarBooking(created);
  }

  async updateBooking(
    id: string,
    dto: UpdateVenueCalendarBookingDto,
    auth?: { sub?: string; role?: string; isSuperAdmin?: boolean; system?: string },
  ) {
    this.assertNotSuperAdmin(auth);
    const bookingId = BigInt(id);
    const existing = await this.prisma.venueBookings.findUnique({
      where: { id: bookingId },
      include: bookingInclude,
    });
    if (!existing) throw new NotFoundException('Booking not found');

    const roomName = dto.roomName ?? existing.venue?.name;
    if (!roomName) throw new BadRequestException('Room is required');

    const venue = await this.findVenueByName(roomName);
    const bookingDate = dto.date
      ? this.parseDateOnly(dto.date)
      : existing.bookingDate!;
    const startTime = dto.startTime
      ? this.parseTimeHm(dto.startTime)
      : existing.startTime!;
    const endTime = dto.endTime
      ? this.parseTimeHm(dto.endTime)
      : existing.endTime!;

    await this.hkPublicHolidaysService.assertBookableForUser(bookingDate, auth);
    await this.assertSlotAvailable(
      venue.id,
      bookingDate,
      startTime,
      endTime,
      bookingId,
    );

    const notes =
      dto.remark !== undefined
        ? this.buildNotesPayload(dto)
        : existing.notes;

    const updated = await this.prisma.venueBookings.update({
      where: { id: bookingId },
      data: {
        venueId: venue.id,
        meetingTitle: dto.topic?.trim() ?? existing.meetingTitle,
        bookingDate,
        startTime,
        endTime,
        attendees: dto.attendeeCount ?? existing.attendees,
        notes,
        teaServiceRequired:
          dto.teaServiceRequired ?? existing.teaServiceRequired,
      },
      include: bookingInclude,
    });

    return this.mapCalendarBooking(updated);
  }

  async deleteBooking(id: string) {
    const bookingId = BigInt(id);
    const existing = await this.prisma.venueBookings.findUnique({
      where: { id: bookingId },
    });
    if (!existing) throw new NotFoundException('Booking not found');

    const wasActive = !String(existing.status ?? '').toLowerCase().includes('cancel');

    await this.prisma.$transaction(async (tx) => {
      if (wasActive && existing.reservedByUserId != null) {
        await releaseVenueQuota(tx, existing.reservedByUserId);
      }

      await tx.venueBookings.update({
        where: { id: bookingId },
        data: { status: 'cancelled' },
      });
    });

    return { ok: true };
  }
}
