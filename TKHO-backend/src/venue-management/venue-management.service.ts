import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { promises as fs } from 'fs';
import { join } from 'path';
import { PrismaService } from '../prisma/prisma.service';
import { UpsertVenueDto } from './dto/upsert-venue.dto';
import { PublishVenueWindowDto } from './dto/publish-venue-window.dto';
import { CreateVenueBlockDto } from './dto/create-venue-block.dto';

@Injectable()
export class VenueManagementService {
  constructor(private readonly prisma: PrismaService) {}
  private readonly uploadsBasePath = '/api/uploads/venues/';

  /** 若 imageUrl 指向本地上传目录，则删除磁盘文件（忽略不存在等错误） */
  private async unlinkVenueUploadFile(imageUrl: string | null | undefined) {
    const path = imageUrl || '';
    if (!path.startsWith(this.uploadsBasePath)) return;
    const filename = path.replace(this.uploadsBasePath, '');
    if (!filename || filename.includes('..') || filename.includes('/') || filename.includes('\\')) return;
    const abs = join(process.cwd(), 'uploads', 'venues', filename);
    await fs.unlink(abs).catch(() => null);
  }

  private toDateOnly(date: Date) {
    return date.toISOString().slice(0, 10);
  }

  private toVenueTab(venueType?: string | null, tab?: string | null) {
    if (tab === 'conference_discussion' || tab === 'other_venues') return tab;
    return venueType === 'conference' || venueType === 'discussion'
      ? 'conference_discussion'
      : 'other_venues';
  }

  private toVenueType(type?: string | null) {
    if (type === 'conference' || type === 'discussion') return type;
    return 'other';
  }

  private mapVenue(venue: any, blocks: any[] = []) {
    const type = this.toVenueType(venue.venueType);
    return {
      id: venue.id.toString(),
      name: venue.name,
      nameZh: venue.nameZh || '',
      tab: this.toVenueTab(type, venue.tab),
      type,
      color: venue.color || '',
      location: venue.location || '',
      locationZh: venue.locationZh || '',
      roomCapacity: venue.roomCapacity ?? null,
      displayType: venue.displayType || 'single',
      image: venue.imageUrl || '',
      status: String(venue.status || 'active').toLowerCase(),
      blocks: blocks.map((block) => ({
        id: block.id.toString(),
        startAt: block.startAt,
        endAt: block.endAt,
        reason: block.reason || '',
        createdAt: block.createdAt || null,
      })),
    };
  }

  async listVenues() {
    const venues = await this.prisma.venues.findMany({
      orderBy: { id: 'asc' },
      include: {
        venue_blocks: {
          orderBy: { created_at: 'desc' },
        },
      },
    });

    return venues.map((venue) =>
      this.mapVenue(
        venue,
        venue.venue_blocks.map((b) => ({
          id: b.id,
          startAt: b.start_at.toISOString(),
          endAt: b.end_at.toISOString(),
          reason: b.reason,
          createdAt: b.created_at.toISOString(),
        })),
      ),
    );
  }

  async createVenue(dto: UpsertVenueDto) {
    const max = await this.prisma.venues.aggregate({ _max: { id: true } });
    const nextId = (max._max.id ?? BigInt(0)) + BigInt(1);

    const created = await this.prisma.venues.create({
      data: {
        id: nextId,
        name: dto.name,
        nameZh: dto.nameZh || null,
        tab: dto.tab || this.toVenueTab(dto.type),
        venueType: dto.type || 'other',
        color: dto.color || null,
        location: dto.location || null,
        locationZh: dto.locationZh || null,
        roomCapacity: dto.roomCapacity ?? null,
        displayType: dto.displayType || 'single',
        imageUrl: dto.image || null,
        status: dto.status || 'active',
      },
    });

    return this.mapVenue(created, []);
  }

  async updateVenue(id: string, dto: UpsertVenueDto) {
    const venueId = BigInt(id);
    const exists = await this.prisma.venues.findUnique({ where: { id: venueId } });
    if (!exists) throw new NotFoundException('Venue not found');

    const prevImage = exists.imageUrl ?? '';
    let nextImageUrl: string | null = exists.imageUrl;
    if (dto.image !== undefined) {
      const trimmed = String(dto.image).trim();
      nextImageUrl = trimmed === '' ? null : trimmed;
    }
    if (prevImage !== (nextImageUrl ?? '')) {
      await this.unlinkVenueUploadFile(prevImage);
    }

    const updated = await this.prisma.venues.update({
      where: { id: venueId },
      data: {
        name: dto.name ?? exists.name,
        nameZh: dto.nameZh ?? exists.nameZh,
        tab: dto.tab ?? exists.tab,
        venueType: dto.type ?? exists.venueType,
        color: dto.color ?? exists.color,
        location: dto.location ?? exists.location,
        locationZh: dto.locationZh ?? exists.locationZh,
        roomCapacity: dto.roomCapacity ?? exists.roomCapacity,
        displayType: dto.displayType ?? exists.displayType,
        imageUrl: nextImageUrl,
        status: dto.status ?? exists.status,
      },
    });

    const blocks = await this.prisma.venue_blocks.findMany({
      where: { venue_id: venueId },
      orderBy: { created_at: 'desc' },
    });

    return this.mapVenue(
      updated,
      blocks.map((b) => ({
        id: b.id,
        startAt: b.start_at.toISOString(),
        endAt: b.end_at.toISOString(),
        reason: b.reason,
        createdAt: b.created_at.toISOString(),
      })),
    );
  }

  async deleteVenue(id: string) {
    const venueId = BigInt(id);
    const existing = await this.prisma.venues.findUnique({
      where: { id: venueId },
      select: { imageUrl: true },
    });
    if (!existing) throw new NotFoundException('Venue not found');
    await this.unlinkVenueUploadFile(existing.imageUrl);
    await this.prisma.venues.delete({ where: { id: venueId } });
    return { ok: true };
  }

  async getVenueWindow() {
    const current = await this.prisma.booking_windows.findUnique({
      where: { resource_type: 'venue' },
    });

    if (!current) {
      const today = new Date();
      const start = new Date(today);
      start.setDate(start.getDate() + 1);
      const end = new Date(today);
      end.setDate(end.getDate() + 14);
      return {
        resourceType: 'venue',
        currentStartDate: this.toDateOnly(start),
        currentEndDate: this.toDateOnly(end),
        updatedBy: 'System',
        updatedAt: null,
      };
    }

    return {
      resourceType: 'venue',
      currentStartDate: this.toDateOnly(current.current_start_date),
      currentEndDate: this.toDateOnly(current.current_end_date),
      updatedBy: current.updated_by || 'System',
      updatedAt: current.updated_at,
    };
  }

  async publishVenueWindow(dto: PublishVenueWindowDto) {
    const start = new Date(dto.startDate);
    const end = new Date(dto.endDate);
    if (end < start) {
      throw new BadRequestException('End date must be later than start date');
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const row = await tx.booking_windows.upsert({
        where: { resource_type: 'venue' },
        update: {
          current_start_date: start,
          current_end_date: end,
          updated_by: 'Venue Admin',
          updated_at: new Date(),
        },
        create: {
          resource_type: 'venue',
          current_start_date: start,
          current_end_date: end,
          updated_by: 'Venue Admin',
          updated_at: new Date(),
        },
      });

      const max = await tx.booking_window_history.aggregate({ _max: { id: true } });
      await tx.booking_window_history.create({
        data: {
          id: (max._max.id ?? BigInt(0)) + BigInt(1),
          resource_type: 'venue',
          start_date: start,
          end_date: end,
          published_at: new Date(),
          published_by: 'Venue Admin',
        },
      });

      return row;
    });

    return {
      resourceType: 'venue',
      currentStartDate: this.toDateOnly(updated.current_start_date),
      currentEndDate: this.toDateOnly(updated.current_end_date),
      updatedBy: updated.updated_by || 'Venue Admin',
      updatedAt: updated.updated_at,
    };
  }

  async addBlock(venueId: string, dto: CreateVenueBlockDto) {
    const id = BigInt(venueId);
    const startAt = new Date(dto.startAt);
    const endAt = new Date(dto.endAt);
    if (endAt <= startAt) {
      throw new BadRequestException('End datetime must be later than start datetime');
    }

    const max = await this.prisma.venue_blocks.aggregate({ _max: { id: true } });
    const created = await this.prisma.venue_blocks.create({
      data: {
        id: (max._max.id ?? BigInt(0)) + BigInt(1),
        venue_id: id,
        start_at: startAt,
        end_at: endAt,
        reason: dto.reason || null,
      },
    });

    return {
      id: created.id.toString(),
      startAt: created.start_at.toISOString(),
      endAt: created.end_at.toISOString(),
      reason: created.reason || '',
      createdAt: created.created_at.toISOString(),
    };
  }

  async removeBlock(venueId: string, blockId: string) {
    const id = BigInt(blockId);
    const venue = BigInt(venueId);
    const exists = await this.prisma.venue_blocks.findFirst({
      where: { id, venue_id: venue },
      select: { id: true },
    });
    if (!exists) throw new NotFoundException('Blocked period not found');
    await this.prisma.venue_blocks.delete({ where: { id } });
    return { ok: true };
  }

  async saveVenueImage(id: string, filename: string) {
    const venueId = BigInt(id);
    const venue = await this.prisma.venues.findUnique({ where: { id: venueId } });
    if (!venue) throw new NotFoundException('Venue not found');

    const newPath = `${this.uploadsBasePath}${filename}`;
    const updated = await this.prisma.venues.update({
      where: { id: venueId },
      data: { imageUrl: newPath },
    });

    await this.unlinkVenueUploadFile(venue.imageUrl);

    return {
      id: updated.id.toString(),
      image: updated.imageUrl || '',
    };
  }
}

