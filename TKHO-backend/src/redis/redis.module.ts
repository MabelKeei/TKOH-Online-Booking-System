import { Global, Module } from '@nestjs/common';
import { EvRedisCacheService } from './ev-redis-cache.service';
import { RedisService } from './redis.service';

@Global()
@Module({
  providers: [RedisService, EvRedisCacheService],
  exports: [RedisService, EvRedisCacheService],
})
export class RedisModule {}
