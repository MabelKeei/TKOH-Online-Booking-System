import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

type QuotaKind = 'ev' | 'venue';

const QUOTA_EXCEEDED: Record<QuotaKind, string> = {
  ev: 'EV booking quota exceeded.',
  venue: 'Venue booking quota exceeded.',
};

function isQuotaLimited(annual: number | null | undefined): boolean {
  return (annual ?? 0) >= 0;
}

async function loadUserQuota(
  tx: Prisma.TransactionClient,
  userId: bigint,
  kind: QuotaKind,
) {
  const user = await tx.user.findUnique({
    where: { id: userId },
    select: {
      annualQuotaEv: true,
      usedQuotaEv: true,
      annualQuotaVenue: true,
      usedQuotaVenue: true,
    },
  });
  if (!user) {
    throw new NotFoundException('User not found');
  }

  if (kind === 'ev') {
    return {
      annual: user.annualQuotaEv,
      used: user.usedQuotaEv,
    };
  }

  return {
    annual: user.annualQuotaVenue,
    used: user.usedQuotaVenue,
  };
}

async function consumeQuota(
  tx: Prisma.TransactionClient,
  userId: bigint,
  kind: QuotaKind,
): Promise<void> {
  const { annual, used } = await loadUserQuota(tx, userId, kind);
  const usedCount = used ?? 0;

  if (isQuotaLimited(annual)) {
    const annualLimit = annual ?? 0;
    if (usedCount >= annualLimit) {
      throw new ForbiddenException(QUOTA_EXCEEDED[kind]);
    }
  }

  if (kind === 'ev') {
    await tx.user.update({
      where: { id: userId },
      data: { usedQuotaEv: usedCount + 1 },
    });
    return;
  }

  await tx.user.update({
    where: { id: userId },
    data: { usedQuotaVenue: usedCount + 1 },
  });
}

async function releaseQuota(
  tx: Prisma.TransactionClient,
  userId: bigint,
  kind: QuotaKind,
): Promise<void> {
  const { used } = await loadUserQuota(tx, userId, kind);
  const usedCount = used ?? 0;
  if (usedCount <= 0) {
    return;
  }

  if (kind === 'ev') {
    await tx.user.update({
      where: { id: userId },
      data: { usedQuotaEv: usedCount - 1 },
    });
    return;
  }

  await tx.user.update({
    where: { id: userId },
    data: { usedQuotaVenue: usedCount - 1 },
  });
}

export function consumeEvQuota(
  tx: Prisma.TransactionClient,
  userId: bigint,
): Promise<void> {
  return consumeQuota(tx, userId, 'ev');
}

export function releaseEvQuota(
  tx: Prisma.TransactionClient,
  userId: bigint,
): Promise<void> {
  return releaseQuota(tx, userId, 'ev');
}

export function consumeVenueQuota(
  tx: Prisma.TransactionClient,
  userId: bigint,
): Promise<void> {
  return consumeQuota(tx, userId, 'venue');
}

export function releaseVenueQuota(
  tx: Prisma.TransactionClient,
  userId: bigint,
): Promise<void> {
  return releaseQuota(tx, userId, 'venue');
}
