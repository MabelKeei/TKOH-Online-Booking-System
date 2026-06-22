import { BadRequestException, ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { isAdminRole } from '../auth/admin-role.util';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAccountVehicleDto } from './dto/create-account-vehicle.dto';
import { UpdateAccountVehicleDto } from './dto/update-account-vehicle.dto';

const MAX_LICENSE_PLATE_ID_ATTEMPTS = 8;

@Injectable()
export class AccountVehiclesService {
  constructor(private readonly prisma: PrismaService) {}

  private isUniqueViolation(error: unknown): boolean {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002'
    );
  }

  private parseAuthSub(auth: any): bigint {
    const sub = String(auth?.sub ?? '').trim();
    if (!/^\d+$/.test(sub)) {
      throw new UnauthorizedException('Invalid token');
    }
    return BigInt(sub);
  }

  private normalizeVehicle(vehicle: any) {
    return {
      id: vehicle.id.toString(),
      userId: vehicle.user_id ? vehicle.user_id.toString() : null,
      plateNumber: vehicle.plate_number,
      isDefault: Boolean(vehicle.is_default),
      status: vehicle.status,
      createdAt: vehicle.created_at,
    };
  }

  async list(auth: any, userIdParam?: string) {
    const me = this.parseAuthSub(auth);
    let userId = me;
    const requested = String(userIdParam ?? '').trim();
    if (requested) {
      if (!/^\d+$/.test(requested)) {
        throw new BadRequestException('Invalid userId');
      }
      const requestedId = BigInt(requested);
      if (requestedId !== me) {
        if (!isAdminRole(auth)) {
          throw new ForbiddenException('Only administrators can list another user\'s vehicles.');
        }
        userId = requestedId;
      }
    }

    const orderBy: any = [{ is_default: 'desc' }, { id: 'asc' }];
    const rows = await this.prisma.license_plates.findMany({
      where: { user_id: userId },
      orderBy,
    });
    return {
      vehicles: rows.map((row) => this.normalizeVehicle(row)),
    };
  }

  async create(auth: any, dto: CreateAccountVehicleDto) {
    const userId = this.parseAuthSub(auth);
    const plateNumber = dto.plateNumber.trim().toUpperCase();
    const existing = await this.prisma.license_plates.findFirst({
      where: { plate_number: plateNumber },
    });
    if (existing) {
      throw new BadRequestException('License plate already exists');
    }

    const shouldDefault = dto.isDefault === true;

    let lastError: unknown;
    for (let attempt = 0; attempt < MAX_LICENSE_PLATE_ID_ATTEMPTS; attempt++) {
      try {
        const created = await this.prisma.$transaction(async (tx) => {
          if (shouldDefault) {
            await tx.license_plates.updateMany({
              where: { user_id: userId, is_default: true },
              data: { is_default: false },
            });
          }
          return tx.license_plates.create({
            data: {
              id: await this.nextLicensePlateId(tx),
              user_id: userId,
              plate_number: plateNumber,
              status: 'active',
              is_default: shouldDefault,
            },
          });
        });

        return {
          message: 'Vehicle added',
          vehicle: this.normalizeVehicle(created),
        };
      } catch (error) {
        if (this.isUniqueViolation(error)) {
          lastError = error;
          continue;
        }
        throw error;
      }
    }

    throw lastError instanceof Error
      ? lastError
      : new BadRequestException('Unable to create license plate');
  }

  async update(auth: any, id: string, dto: UpdateAccountVehicleDto) {
    const userId = this.parseAuthSub(auth);
    const vehicleId = this.toBigIntId(id);
    const current = await this.findOwnedOrThrow(userId, vehicleId);

    const nextPlate = dto.plateNumber?.trim().toUpperCase();
    if (nextPlate && nextPlate !== current.plate_number) {
      const duplicate = await this.prisma.license_plates.findFirst({
        where: { plate_number: nextPlate },
      });
      if (duplicate) {
        throw new BadRequestException('License plate already exists');
      }
    }

    const shouldDefault = dto.isDefault === true;
    const updated = await this.prisma.$transaction(async (tx) => {
      if (shouldDefault) {
        const clearDefaultWhere: any = { user_id: userId, is_default: true };
        const clearDefaultData: any = { is_default: false };
        await tx.license_plates.updateMany({
          where: clearDefaultWhere,
          data: clearDefaultData,
        });
      }
      const updateData: any = {
        plate_number: nextPlate ?? undefined,
        is_default: shouldDefault ? true : undefined,
      };
      return tx.license_plates.update({
        where: { id: vehicleId },
        data: updateData,
      });
    });

    return {
      message: 'Vehicle updated',
      vehicle: this.normalizeVehicle(updated),
    };
  }

  async remove(auth: any, id: string) {
    const userId = this.parseAuthSub(auth);
    const vehicleId = this.toBigIntId(id);
    const current = await this.findOwnedOrThrow(userId, vehicleId);

    await this.prisma.$transaction(async (tx) => {
      await tx.license_plates.delete({ where: { id: vehicleId } });
      if (!(current as any).is_default) {
        return;
      }
      const next = await tx.license_plates.findFirst({
        where: { user_id: userId },
        orderBy: { id: 'asc' },
      });
      if (next) {
        const makeDefaultData: any = { is_default: true };
        await tx.license_plates.update({
          where: { id: next.id },
          data: makeDefaultData,
        });
      }
    });

    return { message: 'Vehicle removed' };
  }

  async setDefault(auth: any, id: string) {
    const userId = this.parseAuthSub(auth);
    const vehicleId = this.toBigIntId(id);
    await this.findOwnedOrThrow(userId, vehicleId);

    await this.prisma.$transaction(async (tx) => {
      const clearDefaultWhere: any = { user_id: userId, is_default: true };
      const clearDefaultData: any = { is_default: false };
      await tx.license_plates.updateMany({
        where: clearDefaultWhere,
        data: clearDefaultData,
      });
      const makeDefaultData: any = { is_default: true };
      await tx.license_plates.update({
        where: { id: vehicleId },
        data: makeDefaultData,
      });
    });

    return { message: 'Default vehicle updated' };
  }

  private toBigIntId(id: string): bigint {
    const raw = String(id || '').trim();
    if (!/^\d+$/.test(raw)) {
      throw new BadRequestException('Invalid id');
    }
    return BigInt(raw);
  }

  private async findOwnedOrThrow(userId: bigint, id: bigint) {
    const row = await this.prisma.license_plates.findUnique({ where: { id } });
    if (!row || row.user_id !== userId) {
      throw new NotFoundException('Vehicle not found');
    }
    return row;
  }

  private async nextLicensePlateId(tx: PrismaService | any): Promise<bigint> {
    const latest = await tx.license_plates.findFirst({
      orderBy: { id: 'desc' },
      select: { id: true },
    });
    return latest ? latest.id + 1n : 1n;
  }
}
