import { ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { OccupyDto } from './dto/occupy.dto';

@Injectable()
export class ParkingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  async occupy(dto: OccupyDto) {
    const slotId = BigInt(dto.slotId);
    const periodId = BigInt(dto.periodId);
    const lockKey = `lock:ev:${dto.slotId}:${dto.periodId}:${dto.bookingDate}`;
    const lockValue = `${dto.employeeCorpId}-${Date.now()}`;
    const redis = this.redisService.getClient();

    const lockOk = await redis.set(lockKey, lockValue, 'PX', 3000, 'NX');
    if (!lockOk) {
      throw new ConflictException('Slot is being occupied by another request, retry later.');
    }

    try {
      const booking = await this.prisma.$transaction(async (tx) => {
        const slot = await tx.evParkingSlots.findUnique({ where: { id: slotId } });
        if (!slot || slot.status !== 'active') {
          throw new ConflictException('Parking slot unavailable.');
        }

        const usedCount = await tx.evBookings.count({
          where: {
            slotId,
            periodId,
            bookingDate: new Date(dto.bookingDate),
            status: { in: ['pending', 'confirmed'] },
          },
        });
        if (usedCount >= slot.quantity) {
          throw new ConflictException('No capacity left for this slot and period.');
        }

        return tx.evBookings.create({
          data: {
            employeeCorpId: dto.employeeCorpId,
            plateNumber: dto.plateNumber,
            slotId,
            periodId,
            bookingDate: new Date(dto.bookingDate),
            status: 'confirmed',
          },
        });
      });

      return { message: 'occupied', booking };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException((error as Error).message);
    } finally {
      const current = await redis.get(lockKey);
      if (current === lockValue) {
        await redis.del(lockKey);
      }
    }
  }
}
