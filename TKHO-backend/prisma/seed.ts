import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as path from 'path';
import { pathToFileURL } from 'url';

const prisma = new PrismaClient();

/** Parse HH:mm for @db.Time fields (time-only, UTC base date). */
function parseTimeHm(value: string): Date {
  return new Date(`1970-01-01T${value}:00.000Z`);
}

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
  const evSlots = mocks?.getMockEVParkingList?.() ?? [];
  const evPeriods = mocks?.getMockEVTimePeriods?.() ?? [];
  const licensePlates = mocks?.getMockLicensePlateList?.() ?? [];

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

  if (evSlots.length > 0) {
    for (const row of evSlots) {
      const id = BigInt(row.id);
      await prisma.evParkingSlots.upsert({
        where: { id },
        update: {
          evSpace: row.evSpace,
          location: row.location ?? null,
          status: row.status ?? 'active',
        },
        create: {
          id,
          evSpace: row.evSpace,
          location: row.location ?? null,
          status: row.status ?? 'active',
        },
      });
    }
  }

  if (evPeriods.length > 0) {
    for (const row of evPeriods) {
      const id = BigInt(row.id);
      await prisma.evTimePeriods.upsert({
        where: { id },
        update: {
          period: row.period,
          startTime: parseTimeHm(row.startTime),
          endTime: parseTimeHm(row.endTime),
          status: row.status ?? 'active',
        },
        create: {
          id,
          period: row.period,
          startTime: parseTimeHm(row.startTime),
          endTime: parseTimeHm(row.endTime),
          status: row.status ?? 'active',
        },
      });
    }
  }

  if (licensePlates.length > 0) {
    for (const row of licensePlates) {
      const id = BigInt(row.id);
      const employeeId = row.employeeId != null ? BigInt(row.employeeId) : null;
      await prisma.license_plates.upsert({
        where: { id },
        update: {
          employee_id: employeeId,
          plate_number: row.plateNumber,
          is_default: row.isDefault === true,
          status: row.status ?? 'active',
        },
        create: {
          id,
          employee_id: employeeId,
          plate_number: row.plateNumber,
          is_default: row.isDefault === true,
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
