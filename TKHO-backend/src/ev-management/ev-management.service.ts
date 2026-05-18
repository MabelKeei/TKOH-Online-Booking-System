import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEvParkingDto } from './dto/create-ev-parking.dto';
import { UpdateEvParkingDto } from './dto/update-ev-parking.dto';
import { CreateEvTimePeriodDto } from './dto/create-ev-time-period.dto';
import { UpdateEvTimePeriodDto } from './dto/update-ev-time-period.dto';
import { PublishEvWindowDto } from './dto/publish-ev-window.dto';

const EV_RESOURCE = 'ev';

@Injectable()
export class EvManagementService {
  constructor(private readonly prisma: PrismaService) {}

  private toDateOnly(date: Date) {
    return date.toISOString().slice(0, 10);
  }

  private parseHHmm(s: string): Date {
    const m = /^(\d{1,2}):(\d{2})$/.exec(String(s).trim());
    if (!m) throw new BadRequestException('Invalid time format, use HH:mm');
    const h = parseInt(m[1], 10);
    const min = parseInt(m[2], 10);
    if (h < 0 || h > 23 || min < 0 || min > 59) {
      throw new BadRequestException('Invalid time');
    }
    return new Date(Date.UTC(1970, 0, 1, h, min, 0, 0));
  }

  private formatHHmm(d: Date): string {
    const h = d.getUTCHours();
    const min = d.getUTCMinutes();
    return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
  }

  private mapParking(row: { id: bigint; evSpace: string; location: string | null; status: string }) {
    return {
      id: row.id.toString(),
      evSpace: row.evSpace,
      location: row.location ?? '',
      status: String(row.status || 'active').toLowerCase(),
    };
  }

  private mapTimePeriod(row: {
    id: bigint;
    period: string;
    startTime: Date;
    endTime: Date;
    status: string;
  }) {
    return {
      id: row.id.toString(),
      period: row.period,
      startTime: this.formatHHmm(row.startTime),
      endTime: this.formatHHmm(row.endTime),
      status: String(row.status || 'active').toLowerCase(),
    };
  }

  async listParkingSlots() {
    const rows = await this.prisma.evParkingSlots.findMany({ orderBy: { id: 'asc' } });
    return rows.map((r) => this.mapParking(r));
  }

  async createParkingSlot(dto: CreateEvParkingDto) {
    const evSpace = dto.evSpace.trim();
    const dup = await this.prisma.evParkingSlots.findFirst({
      where: { evSpace },
    });
    if (dup) throw new ConflictException('EV space code already exists');

    const max = await this.prisma.evParkingSlots.aggregate({ _max: { id: true } });
    const nextId = (max._max.id ?? BigInt(0)) + BigInt(1);
    const created = await this.prisma.evParkingSlots.create({
      data: {
        id: nextId,
        evSpace,
        location: dto.location?.trim() || null,
        status: dto.status || 'active',
      },
    });
    return this.mapParking(created);
  }

  async updateParkingSlot(id: string, dto: UpdateEvParkingDto) {
    const slotId = BigInt(id);
    const exists = await this.prisma.evParkingSlots.findUnique({ where: { id: slotId } });
    if (!exists) throw new NotFoundException('EV space not found');

    const nextSpace = dto.evSpace !== undefined ? dto.evSpace.trim() : exists.evSpace;
    if (nextSpace !== exists.evSpace) {
      const dup = await this.prisma.evParkingSlots.findFirst({
        where: { evSpace: nextSpace, NOT: { id: slotId } },
      });
      if (dup) throw new ConflictException('EV space code already exists');
    }

    const data: Prisma.EvParkingSlotsUpdateInput = {};
    if (dto.evSpace !== undefined) data.evSpace = nextSpace;
    if (dto.location !== undefined) data.location = dto.location.trim() || null;
    if (dto.status !== undefined) data.status = dto.status;

    if (Object.keys(data).length === 0) {
      return this.mapParking(exists);
    }

    const updated = await this.prisma.evParkingSlots.update({
      where: { id: slotId },
      data,
    });
    return this.mapParking(updated);
  }

  async deleteParkingSlot(id: string) {
    const slotId = BigInt(id);
    const exists = await this.prisma.evParkingSlots.findUnique({ where: { id: slotId } });
    if (!exists) throw new NotFoundException('EV space not found');
    const cnt = await this.prisma.evBookings.count({ where: { slotId } });
    if (cnt > 0) {
      throw new BadRequestException('Cannot delete EV space with existing bookings');
    }
    await this.prisma.evParkingSlots.delete({ where: { id: slotId } });
    return { ok: true };
  }

  async listTimePeriods() {
    const rows = await this.prisma.evTimePeriods.findMany({ orderBy: { id: 'asc' } });
    return rows.map((r) => this.mapTimePeriod(r));
  }

  private assertTimeOrder(start: Date, end: Date) {
    if (end.getTime() <= start.getTime()) {
      throw new BadRequestException('End time must be later than start time');
    }
  }

  async createTimePeriod(dto: CreateEvTimePeriodDto) {
    const start = this.parseHHmm(dto.startTime);
    const end = this.parseHHmm(dto.endTime);
    this.assertTimeOrder(start, end);

    const max = await this.prisma.evTimePeriods.aggregate({ _max: { id: true } });
    const nextId = (max._max.id ?? BigInt(0)) + BigInt(1);
    try {
      const created = await this.prisma.evTimePeriods.create({
        data: {
          id: nextId,
          period: dto.period.trim(),
          startTime: start,
          endTime: end,
          status: dto.status || 'active',
        },
      });
      return this.mapTimePeriod(created);
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new ConflictException('Time period label already exists');
      }
      throw e;
    }
  }

  async updateTimePeriod(id: string, dto: UpdateEvTimePeriodDto) {
    const periodId = BigInt(id);
    const exists = await this.prisma.evTimePeriods.findUnique({ where: { id: periodId } });
    if (!exists) throw new NotFoundException('Time period not found');

    const start =
      dto.startTime !== undefined ? this.parseHHmm(dto.startTime) : exists.startTime;
    const end = dto.endTime !== undefined ? this.parseHHmm(dto.endTime) : exists.endTime;
    if (dto.startTime !== undefined || dto.endTime !== undefined) {
      this.assertTimeOrder(start, end);
    }

    const data: Prisma.EvTimePeriodsUpdateInput = {};
    if (dto.period !== undefined) data.period = dto.period.trim();
    if (dto.startTime !== undefined) data.startTime = start;
    if (dto.endTime !== undefined) data.endTime = end;
    if (dto.status !== undefined) data.status = dto.status;

    if (Object.keys(data).length === 0) {
      return this.mapTimePeriod(exists);
    }

    try {
      const updated = await this.prisma.evTimePeriods.update({
        where: { id: periodId },
        data,
      });
      return this.mapTimePeriod(updated);
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new ConflictException('Time period label already exists');
      }
      throw e;
    }
  }

  async deleteTimePeriod(id: string) {
    const periodId = BigInt(id);
    const exists = await this.prisma.evTimePeriods.findUnique({ where: { id: periodId } });
    if (!exists) throw new NotFoundException('Time period not found');
    const cnt = await this.prisma.evBookings.count({ where: { periodId } });
    if (cnt > 0) {
      throw new BadRequestException('Cannot delete time period with existing bookings');
    }
    await this.prisma.evTimePeriods.delete({ where: { id: periodId } });
    return { ok: true };
  }

  async getEvBookingWindow() {
    const current = await this.prisma.booking_windows.findUnique({
      where: { resource_type: EV_RESOURCE },
    });

    if (!current) {
      const today = new Date();
      const start = new Date(today);
      const end = new Date(today);
      end.setDate(end.getDate() + 13);
      return {
        resourceType: EV_RESOURCE,
        currentStartDate: this.toDateOnly(start),
        currentEndDate: this.toDateOnly(end),
        updatedBy: 'System',
        updatedAt: null,
      };
    }

    return {
      resourceType: EV_RESOURCE,
      currentStartDate: this.toDateOnly(current.current_start_date),
      currentEndDate: this.toDateOnly(current.current_end_date),
      updatedBy: current.updated_by || 'System',
      updatedAt: current.updated_at,
    };
  }

  async publishEvBookingWindow(dto: PublishEvWindowDto) {
    const start = new Date(dto.startDate);
    const end = new Date(dto.endDate);
    if (end < start) {
      throw new BadRequestException('End date must be later than start date');
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const row = await tx.booking_windows.upsert({
        where: { resource_type: EV_RESOURCE },
        update: {
          current_start_date: start,
          current_end_date: end,
          updated_by: 'EV Admin',
          updated_at: new Date(),
        },
        create: {
          resource_type: EV_RESOURCE,
          current_start_date: start,
          current_end_date: end,
          updated_by: 'EV Admin',
          updated_at: new Date(),
        },
      });

      const max = await tx.booking_window_history.aggregate({ _max: { id: true } });
      await tx.booking_window_history.create({
        data: {
          id: (max._max.id ?? BigInt(0)) + BigInt(1),
          resource_type: EV_RESOURCE,
          start_date: start,
          end_date: end,
          published_at: new Date(),
          published_by: 'EV Admin',
        },
      });

      return row;
    });

    return {
      resourceType: EV_RESOURCE,
      currentStartDate: this.toDateOnly(updated.current_start_date),
      currentEndDate: this.toDateOnly(updated.current_end_date),
      updatedBy: updated.updated_by || 'EV Admin',
      updatedAt: updated.updated_at,
    };
  }
}
