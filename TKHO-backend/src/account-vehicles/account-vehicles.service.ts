import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAccountVehicleDto } from './dto/create-account-vehicle.dto';
import { UpdateAccountVehicleDto } from './dto/update-account-vehicle.dto';

@Injectable()
export class AccountVehiclesService {
  constructor(private readonly prisma: PrismaService) {}

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
      employeeId: vehicle.employee_id ? vehicle.employee_id.toString() : null,
      plateNumber: vehicle.plate_number,
      isDefault: Boolean(vehicle.is_default),
      status: vehicle.status,
      createdAt: vehicle.created_at,
    };
  }

  async list(auth: any) {
    const employeeId = this.parseAuthSub(auth);
    const orderBy: any = [{ is_default: 'desc' }, { id: 'asc' }];
    const rows = await this.prisma.license_plates.findMany({
      where: { employee_id: employeeId },
      orderBy,
    });
    return {
      vehicles: rows.map((row) => this.normalizeVehicle(row)),
    };
  }

  async create(auth: any, dto: CreateAccountVehicleDto) {
    const employeeId = this.parseAuthSub(auth);
    const plateNumber = dto.plateNumber.trim().toUpperCase();
    const existing = await this.prisma.license_plates.findFirst({
      where: { plate_number: plateNumber },
    });
    if (existing) {
      throw new BadRequestException('License plate already exists');
    }

    const shouldDefault = dto.isDefault === true;

    const created = await this.prisma.$transaction(async (tx) => {
      if (shouldDefault) {
        const clearDefaultWhere: any = { employee_id: employeeId, is_default: true };
        const clearDefaultData: any = { is_default: false };
        await tx.license_plates.updateMany({
          where: clearDefaultWhere,
          data: clearDefaultData,
        });
      }
      const createData: any = {
        id: await this.nextLicensePlateId(tx),
        employee_id: employeeId,
        plate_number: plateNumber,
        status: 'active',
        is_default: shouldDefault,
      };
      return tx.license_plates.create({
        data: createData,
      });
    });

    return {
      message: 'Vehicle added',
      vehicle: this.normalizeVehicle(created),
    };
  }

  async update(auth: any, id: string, dto: UpdateAccountVehicleDto) {
    const employeeId = this.parseAuthSub(auth);
    const vehicleId = this.toBigIntId(id);
    const current = await this.findOwnedOrThrow(employeeId, vehicleId);

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
        const clearDefaultWhere: any = { employee_id: employeeId, is_default: true };
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
    const employeeId = this.parseAuthSub(auth);
    const vehicleId = this.toBigIntId(id);
    const current = await this.findOwnedOrThrow(employeeId, vehicleId);

    await this.prisma.$transaction(async (tx) => {
      await tx.license_plates.delete({ where: { id: vehicleId } });
      if (!(current as any).is_default) {
        return;
      }
      const next = await tx.license_plates.findFirst({
        where: { employee_id: employeeId },
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
    const employeeId = this.parseAuthSub(auth);
    const vehicleId = this.toBigIntId(id);
    await this.findOwnedOrThrow(employeeId, vehicleId);

    await this.prisma.$transaction(async (tx) => {
      const clearDefaultWhere: any = { employee_id: employeeId, is_default: true };
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

  private async findOwnedOrThrow(employeeId: bigint, id: bigint) {
    const row = await this.prisma.license_plates.findUnique({ where: { id } });
    if (!row || row.employee_id !== employeeId) {
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
