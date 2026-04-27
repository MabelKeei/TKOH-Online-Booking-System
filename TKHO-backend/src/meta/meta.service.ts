import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MetaService {
  constructor(private readonly prisma: PrismaService) {}

  async users() {
    const users = await this.prisma.user.findMany({
      orderBy: { id: 'asc' },
      select: {
        id: true,
        corpId: true,
        account: true,
        name: true,
        department: true,
        role: true,
        position: true,
        email: true,
        contact: true,
        annualQuotaEv: true,
        usedQuotaEv: true,
        annualQuotaVenue: true,
        usedQuotaVenue: true,
        status: true,
        lastLoginTime: true,
        createdAt: true,
      },
    });

    return users.map((user) => ({
      ...user,
      id: user.id.toString(),
    }));
  }

  async venues() {
    const venues = await this.prisma.venues.findMany({ orderBy: { id: 'asc' } });
    return venues.map((venue) => ({
      ...venue,
      id: venue.id.toString(),
    }));
  }
}
