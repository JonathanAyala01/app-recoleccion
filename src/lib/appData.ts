import { Agency, Driver, RouteSheet, Zone } from '../types';
import { INITIAL_AGENCIES, INITIAL_DRIVERS, INITIAL_ZONES } from '../seedData';

export interface AppData {
  agencies: Agency[];
  drivers: Driver[];
  routeSheets: RouteSheet[];
  zones: Zone[];
}

const loadDate = new Date().toISOString().split('T')[0];
const loadCreatedAt = new Date().toLocaleDateString('es-AR');

export const createEmptyAppData = (): AppData => ({
  agencies: [],
  drivers: [],
  routeSheets: [],
  zones: [],
});

export const slugifyUsername = (value: string): string =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '.')
    .replace(/^\.+|\.+$/g, '')
    .replace(/\.{2,}/g, '.');

export const createDriverUsername = (name: string, legajo?: string): string => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0] ?? 'chofer';
  const last = parts.length > 1 ? parts[parts.length - 1] : (legajo || 'usuario');
  return slugifyUsername(`${first}.${last}`);
};

export const generateDriverPassword = (): string =>
  Math.random().toString(36).slice(2, 10);

export const ensureUniqueDriverUsername = (
  name: string,
  existingUsernames: string[],
  legajo?: string,
  currentUsername?: string
): string => {
  const base = createDriverUsername(name, legajo);
  const normalizedCurrent = currentUsername?.toLowerCase();
  const taken = new Set(existingUsernames.map((item) => item.toLowerCase()));

  if (normalizedCurrent && normalizedCurrent === base) {
    return base;
  }

  if (!taken.has(base)) {
    return base;
  }

  let suffix = 2;
  let candidate = `${base}.${suffix}`;
  while (taken.has(candidate)) {
    suffix += 1;
    candidate = `${base}.${suffix}`;
  }

  return candidate;
};

const normalizeDriver = (driver: Partial<Driver>, existingUsernames: string[] = []): Driver => ({
  id: driver.id || `drv-${Date.now()}`,
  name: driver.name || 'Sin nombre',
  username: driver.username && driver.username.trim().length > 0
    ? ensureUniqueDriverUsername(driver.name || 'Sin nombre', existingUsernames, driver.legajo, driver.username)
    : ensureUniqueDriverUsername(driver.name || 'Sin nombre', existingUsernames, driver.legajo),
  password: driver.password && driver.password.trim().length > 0 ? driver.password : generateDriverPassword(),
  legajo: driver.legajo || '',
  internalUnit: driver.internalUnit || '',
  licensePlate: driver.licensePlate || '',
});

export const createSeedRouteSheets = (): RouteSheet[] => [
  {
    id: 'HR-4089',
    date: loadDate,
    driverId: 'drv-1',
    driverName: 'Carlos Gómez',
    legajo: 'L-5421',
    internalUnit: 'U-108',
    licensePlate: 'AF-321-JK',
    initialKm: 12540,
    finalKm: 12615,
    departureTime: '08:15',
    returnTime: '11:40',
    status: 'completed',
    createdAt: loadCreatedAt,
    driverLoadSignature:
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="50"><path d="M10 25 C 20 10, 30 40, 40 25 C 50 10, 60 40, 70 25 C 80 10, 90 40, 100 25" fill="none" stroke="black" stroke-width="2"/></svg>',
    driverReturnSignature:
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="50"><path d="M10 25 C 25 5, 35 45, 45 25 C 55 5, 65 45, 75 25 C 85 5, 95 45, 105 25" fill="none" stroke="blue" stroke-width="2"/></svg>',
    observations: 'Se completó la ruta en tiempo y forma. Tránsito normal.',
    stops: [
      {
        id: 'stp-1',
        agencyId: 'age-1',
        sequence: 1,
        scheduledTime: '08:30',
        packagesToDeliver: 12,
        packagesToCollect: 4,
        actualPackagesDelivered: 12,
        actualPackagesCollected: 4,
        status: 'completed',
        stopTime: '08:35',
        recipientName: 'Roberto Piazza',
        recipientSignature:
          'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="50"><path d="M5 40 Q 50 5 95 40" fill="none" stroke="green" stroke-width="2"/></svg>',
        observations: 'Recibido conforme.',
      },
      {
        id: 'stp-2',
        agencyId: 'age-2',
        sequence: 2,
        scheduledTime: '09:15',
        packagesToDeliver: 8,
        packagesToCollect: 0,
        actualPackagesDelivered: 8,
        actualPackagesCollected: 0,
        status: 'completed',
        stopTime: '09:22',
        recipientName: 'Marisa Albornoz',
        recipientSignature:
          'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="50"><path d="M5 25 L 95 25" fill="none" stroke="red" stroke-width="2"/></svg>',
        observations: 'Todo bien.',
      },
    ],
  },
  {
    id: 'HR-9102',
    date: loadDate,
    driverId: 'drv-2',
    driverName: 'Juan Manuel Rodríguez',
    legajo: 'L-2918',
    internalUnit: 'U-214',
    licensePlate: 'AE-892-LL',
    initialKm: 34105,
    status: 'assigned',
    createdAt: loadCreatedAt,
    stops: [
      {
        id: 'stp-3',
        agencyId: 'age-6',
        sequence: 1,
        scheduledTime: '08:00',
        packagesToDeliver: 5,
        packagesToCollect: 12,
        status: 'pending',
      },
      {
        id: 'stp-4',
        agencyId: 'age-7',
        sequence: 2,
        scheduledTime: '09:00',
        packagesToDeliver: 15,
        packagesToCollect: 0,
        status: 'pending',
      },
      {
        id: 'stp-5',
        agencyId: 'age-11',
        sequence: 3,
        scheduledTime: '10:15',
        packagesToDeliver: 0,
        packagesToCollect: 6,
        status: 'pending',
      },
    ],
  },
];

export const createSeedAppData = (): AppData => {
  const drivers = INITIAL_DRIVERS.map((driver, index) =>
    normalizeDriver(
      driver,
      INITIAL_DRIVERS.slice(0, index).map((item) => item.username)
    )
  );

  return {
    agencies: INITIAL_AGENCIES,
    drivers,
    routeSheets: createSeedRouteSheets(),
    zones: INITIAL_ZONES,
  };
};

export const normalizeDrivers = (drivers: Partial<Driver>[]): Driver[] =>
  drivers.map((driver, index) =>
    normalizeDriver(
      driver,
      drivers.slice(0, index).map((item) => item.username || createDriverUsername(item.name || '', item.legajo))
    )
  );

export const hasAnyAppData = (data: AppData): boolean =>
  data.agencies.length > 0 ||
  data.drivers.length > 0 ||
  data.routeSheets.length > 0 ||
  data.zones.length > 0;

export const normalizeAppData = (input: Partial<AppData> | null | undefined): AppData => {
  const agencies = Array.isArray(input?.agencies) ? input.agencies : [];
  const zones = Array.isArray(input?.zones) ? input.zones : [];
  const routeSheets = Array.isArray(input?.routeSheets) ? input.routeSheets : [];
  const drivers = Array.isArray(input?.drivers) ? normalizeDrivers(input.drivers) : [];

  return {
    agencies,
    drivers,
    routeSheets,
    zones,
  };
};
