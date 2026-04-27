import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as path from 'path';
import { pathToFileURL } from 'url';

const prisma = new PrismaClient();

async function readFrontendMocks() {
  const mockPath = path.resolve(__dirname, '../../TKHO-frontend/src/mocks/mockData.js');
  const mockUrl = pathToFileURL(mockPath).href;
  try {
    const mod = await import(mockUrl);
    return mod;
  } catch {
    return null;
  }
}

async function main() {
  const mocks = await readFrontendMocks();
  const employees = mocks?.getMockEmployeeListNormalized?.() ?? [];
  const venues = mocks?.getMockVenueList?.() ?? [];

  if (employees.length > 0) {
    for (const row of employees) {
      const userId = BigInt(row.id);
      await prisma.user.upsert({
        where: { id: userId },
        update: {
          corpId: row.corpId,
          account: row.corpId,
          name: row.name,
          department: row.department,
          role: row.role,
          position: row.position ?? null,
          email: row.email,
          contact: row.contact,
          annualQuotaEv: row.annualQuotaEV ?? 0,
          usedQuotaEv: row.usedQuotaEV ?? 0,
          annualQuotaVenue: row.annualQuotaVenue ?? 0,
          usedQuotaVenue: row.usedQuotaVenue ?? 0,
          status: 'Active',
        },
        create: {
          id: userId,
          corpId: row.corpId,
          account: row.corpId,
          password: bcrypt.hashSync('123456', 10),
          name: row.name,
          department: row.department,
          role: row.role,
          position: row.position ?? null,
          email: row.email,
          contact: row.contact,
          annualQuotaEv: row.annualQuotaEV ?? 0,
          usedQuotaEv: row.usedQuotaEV ?? 0,
          annualQuotaVenue: row.annualQuotaVenue ?? 0,
          usedQuotaVenue: row.usedQuotaVenue ?? 0,
          status: 'Active',
        },
      });
    }
  }

  if (venues.length > 0) {
    for (const row of venues) {
      const venueId = BigInt(row.id);
      await prisma.venues.upsert({
        where: { id: venueId },
        update: {
          name: row.name,
          nameZh: row.nameZh ?? null,
          tab: row.tab ?? null,
          venueType: row.type ?? null,
          roomCapacity: row.roomCapacity ?? row.capacity ?? null,
          color: row.color ?? null,
          location: row.location ?? null,
          locationZh: row.locationZh ?? null,
          displayType: row.displayType ?? null,
          imageUrl: row.image ?? null,
          status: row.status ?? 'active',
        },
        create: {
          id: venueId,
          name: row.name,
          nameZh: row.nameZh ?? null,
          tab: row.tab ?? null,
          venueType: row.type ?? null,
          roomCapacity: row.roomCapacity ?? row.capacity ?? null,
          color: row.color ?? null,
          location: row.location ?? null,
          locationZh: row.locationZh ?? null,
          displayType: row.displayType ?? null,
          imageUrl: row.image ?? null,
          status: row.status ?? 'active',
        },
      });
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
