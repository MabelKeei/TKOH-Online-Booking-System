import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class HealthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  async check() {
    const db = await this.prisma.$queryRaw<Array<{ now: Date }>>`SELECT NOW() AS now`;
    return {
      status: 'ok',
      postgres: db[0]?.now || null,
      redis: this.redisService.getClient().status === 'ready' ? 'connected' : 'disconnected',
    };
  }
}
