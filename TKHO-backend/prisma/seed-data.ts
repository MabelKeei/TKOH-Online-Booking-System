export type SeedEmployee = {
  id: number;
  corpId: string;
  name: string;
  department?: string;
  role?: string;
  position?: string;
  email?: string;
  contact?: string;
  annualQuotaEV?: number;
  usedQuotaEV?: number;
  annualQuotaVenue?: number;
  usedQuotaVenue?: number;
};

export type SeedVenue = {
  id: number;
  name: string;
  nameZh?: string;
  tab?: string;
  type?: string;
  roomCapacity?: number;
  capacity?: number;
  color?: string;
  location?: string;
  locationZh?: string;
  displayType?: string;
  image?: string | null;
  status?: string;
};

export type SeedEvSlot = {
  id: number;
  evSpace: string;
  location?: string;
  status?: string;
};

export type SeedEvPeriod = {
  id: number;
  period: string;
  startTime: string;
  endTime: string;
  status?: string;
};

export type SeedLicensePlate = {
  id: number;
  employeeId?: number | null;
  plateNumber: string;
  isDefault?: boolean;
  status?: string;
};

const departments = ['ADM', 'CNS', 'D&T', 'HCE', 'ENT', 'GO', 'PMMD', 'SOPD', 'NSD', 'SS'];
const positions = ['User', 'User_EV', 'User_Venue', 'Admin'];

const employees: SeedEmployee[] = Array.from({ length: 25 }, (_, index) => {
  const i = index + 1;
  const isAdmin = i === 1 || i === 16;
  return {
    id: i,
    corpId: `E${String(i).padStart(3, '0')}`,
    name: `Employee ${i}`,
    department: departments[index % departments.length],
    role: isAdmin ? 'Admin' : 'User',
    position: isAdmin ? 'Admin' : positions[index % positions.length],
    email: `employee${i}@tkho.local`,
    contact: `91${String(i).padStart(6, '0')}`,
    annualQuotaEV: isAdmin ? -1 : 30,
    usedQuotaEV: (index * 3) % 20,
    annualQuotaVenue: isAdmin ? -1 : 30,
    usedQuotaVenue: (index * 2) % 10,
  };
});

const venues: SeedVenue[] = [
  { id: 1, name: 'CR1', nameZh: 'Conference Room 1', tab: 'meeting', type: 'meeting', roomCapacity: 8, color: '#409EFF', location: '1/F', locationZh: '1F', displayType: 'single', image: null, status: 'active' },
  { id: 2, name: 'CR2', nameZh: 'Conference Room 2', tab: 'meeting', type: 'meeting', roomCapacity: 10, color: '#67C23A', location: '1/F', locationZh: '1F', displayType: 'single', image: null, status: 'active' },
  { id: 3, name: 'CR3', nameZh: 'Conference Room 3', tab: 'meeting', type: 'meeting', roomCapacity: 12, color: '#E6A23C', location: '2/F', locationZh: '2F', displayType: 'single', image: null, status: 'active' },
  { id: 4, name: 'CR4', nameZh: 'Conference Room 4', tab: 'meeting', type: 'meeting', roomCapacity: 14, color: '#F56C6C', location: '2/F', locationZh: '2F', displayType: 'single', image: null, status: 'active' },
  { id: 5, name: 'MPR', nameZh: 'Multi Purpose Room', tab: 'meeting', type: 'meeting', roomCapacity: 20, color: '#909399', location: '3/F', locationZh: '3F', displayType: 'single', image: null, status: 'active' },
  { id: 6, name: 'Training Room', nameZh: 'Training Room', tab: 'meeting', type: 'meeting', roomCapacity: 16, color: '#8E44AD', location: '3/F', locationZh: '3F', displayType: 'single', image: null, status: 'active' },
  { id: 7, name: 'Board Room', nameZh: 'Board Room', tab: 'meeting', type: 'meeting', roomCapacity: 18, color: '#16A085', location: '4/F', locationZh: '4F', displayType: 'single', image: null, status: 'active' },
];

const evSlots: SeedEvSlot[] = [
  { id: 1, evSpace: 'EV-01', location: 'B1', status: 'active' },
  { id: 2, evSpace: 'EV-02', location: 'B1', status: 'active' },
  { id: 3, evSpace: 'EV-03', location: 'B1', status: 'active' },
];

const evPeriods: SeedEvPeriod[] = [
  { id: 1, period: '08:00-12:00', startTime: '08:00', endTime: '12:00', status: 'active' },
  { id: 2, period: '12:00-16:00', startTime: '12:00', endTime: '16:00', status: 'active' },
  { id: 3, period: '16:00-20:00', startTime: '16:00', endTime: '20:00', status: 'active' },
];

const licensePlates: SeedLicensePlate[] = [
  { id: 1, employeeId: 1, plateNumber: 'SGA1001A', isDefault: true, status: 'active' },
  { id: 2, employeeId: 2, plateNumber: 'SGB2002B', isDefault: true, status: 'active' },
  { id: 3, employeeId: 3, plateNumber: 'SGC3003C', isDefault: true, status: 'active' },
  { id: 4, employeeId: 4, plateNumber: 'SGD4004D', isDefault: true, status: 'active' },
];

export const seedData = {
  employees,
  venues,
  evSlots,
  evPeriods,
  licensePlates,
};
