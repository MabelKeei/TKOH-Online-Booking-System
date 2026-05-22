import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { RedisService } from '../../redis/redis.service';

@Injectable()
export class EvBookingRateLimitGuard implements CanActivate {
  constructor(private readonly redis: RedisService) {}

  private limitPerMinute(): number {
    const n = Number(process.env.EV_BOOKING_RATE_LIMIT_PER_MIN ?? 30);
    return Number.isFinite(n) && n > 0 ? Math.floor(n) : 30;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (!this.redis.isReady()) {
      return true;
    }

    const req = context.switchToHttp().getRequest<{ user?: { sub?: string; corpId?: string } }>();
    const subject = String(req.user?.sub ?? req.user?.corpId ?? '').trim();
    if (!subject) {
      return true;
    }

    const key = `rl:ev:book:${subject}`;
    const client = this.redis.getClient();
    const count = await client.incr(key);
    if (count === 1) {
      await client.expire(key, 60);
    }

    const limit = this.limitPerMinute();
    if (count > limit) {
      throw new HttpException(
        'Too many booking attempts. Please try again shortly.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }
}
