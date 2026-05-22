import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly redis: Redis;

  constructor() {
    this.redis = new Redis(process.env.REDIS_URL || 'redis://127.0.0.1:6379', {
      maxRetriesPerRequest: 1,
      enableReadyCheck: true,
      lazyConnect: false,
    });
    this.redis.on('error', () => {
      /* 连接失败时 isReady() 为 false，业务降级直查 DB */
    });
  }

  isReady(): boolean {
    return this.redis.status === 'ready';
  }

  getClient(): Redis {
    return this.redis;
  }

  async get(key: string): Promise<string | null> {
    if (!this.isReady()) return null;
    return this.redis.get(key);
  }

  async set(key: string, value: string, ttlSec: number): Promise<void> {
    if (!this.isReady()) return;
    await this.redis.set(key, value, 'EX', ttlSec);
  }

  async del(...keys: string[]): Promise<void> {
    if (!this.isReady() || keys.length === 0) return;
    await this.redis.del(...keys);
  }

  async incr(key: string): Promise<number> {
    if (!this.isReady()) return 0;
    return this.redis.incr(key);
  }

  async onModuleDestroy() {
    if (this.redis.status !== 'end') {
      await this.redis.quit();
    }
  }
}
