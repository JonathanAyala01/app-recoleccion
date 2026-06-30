import React, { useEffect, useState } from 'react';
import { RefreshCw, Truck } from 'lucide-react';
import { Agency, Driver, RouteSheet, Zone } from './types';
import { createSeedAppData } from './lib/appData';
import { DashboardStats } from './components/DashboardStats';
import { AdminPanel } from './components/AdminPanel';
import { DriverPanel } from './components/DriverPanel';
import { RouteDetailsModal } from './components/RouteDetailsModal';

const STORAGE_KEYS = {
  agencies: 'logistics_agencies',
  drivers: 'logistics_drivers',
  routeSheets: 'logistics_routes',
  zones: 'logistics_zones',
} as const;

const canUseLocalStorage = (): boolean =>
  typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const parseCollection = <T,>(key: string): T[] => {
  if (!canUseLocalStorage()) return [];

  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const readStoredState = () => {
  const agencies = parseCollection<Agency>(STORAGE_KEYS.agencies);
  const drivers = parseCollection<Driver>(STORAGE_KEYS.drivers);
  const routeSheets = parseCollection<RouteSheet>(STORAGE_KEYS.routeSheets);
  const zones = parseCollection<Zone>(STORAGE_KEYS.zones);

  if (agencies.length || drivers.length || routeSheets.length || zones.length) {
    return { agencies, drivers, routeSheets, zones };
  }

  return createSeedAppData();
};

const hasStoredData = (): boolean => {
  if (!canUseLocalStorage()) return false;

  return (
    parseCollection<Agency>(STORAGE_KEYS.agencies).length > 0 ||
    parseCollection<Driver>(STORAGE_KEYS.drivers).length > 0 ||
    parseCollection<RouteSheet>(STORAGE_KEYS.routeSheets).length > 0 ||
    parseCollection<Zone>(STORAGE_KEYS.zones).length > 0
  );
};

const writeStateToStorage = (state: {
  agencies: Agency[];
  drivers: Driver[];
  routeSheets: RouteSheet[];
  zones: Zone[];
}) => {
  if (!canUseLocalStorage()) return;

  localStorage.setItem(STORAGE_KEYS.agencies, JSON.stringify(state.agencies));
  localStorage.setItem(STORAGE_KEYS.drivers, JSON.stringify(state.drivers));
  localStorage.setItem(STORAGE_KEYS.routeSheets, JSON.stringify(state.routeSheets));
  localStorage.setItem(STORAGE_KEYS.zones, JSON.stringify(state.zones));
};

export default function App() {
  const [initialState] = useState(() => readStoredState());

  const [agencies, setAgencies] = useState<Agency[]>(initialState.agencies);
  const [drivers, setDrivers] = useState<Driver[]>(initialState.drivers);
  const [routeSheets, setRouteSheets] = useState<RouteSheet[]>(initialState.routeSheets);
  const [zones, setZones] = useState<Zone[]>(initialState.zones);
  const [selectedRouteForModal, setSelectedRouteForModal] = useState<RouteSheet | null>(null);
  const [mobileActiveView, setMobileActiveView] = useState<'admin' | 'driver'>('admin');

  useEffect(() => {
    if (!hasStoredData()) {
      writeStateToStorage(initialState);
    }
  }, [initialState]);

  const persistAgencies = (next: Agency[]) => {
    setAgencies(next);
    if (canUseLocalStorage()) {
      localStorage.setItem(STORAGE_KEYS.agencies, JSON.stringify(next));
    }
  };

  const persistDrivers = (next: Driver[]) => {
    setDrivers(next);
    if (canUseLocalStorage()) {
      localStorage.setItem(STORAGE_KEYS.drivers, JSON.stringify(next));
    }
  };

  const persistZones = (next: Zone[]) => {
    setZones(next);
    if (canUseLocalStorage()) {
      localStorage.setItem(STORAGE_KEYS.zones, JSON.stringify(next));
    }
  };

  const persistRouteSheets = (next: RouteSheet[]) => {
    setRouteSheets(next);
    if (canUseLocalStorage()) {
      localStorage.setItem(STORAGE_KEYS.routeSheets, JSON.stringify(next));
    }

    if (selectedRouteForModal) {
      const fresh = next.find((route) => route.id === selectedRouteForModal.id);
      setSelectedRouteForModal(fresh ?? null);
    }
  };

  const handleAddAgency = (newAgency: Agency) => {
    persistAgencies([...agencies, newAgency]);
  };

  const handleAddDriver = (newDriver: Driver) => {
    persistDrivers([...drivers, newDriver]);
  };

  const handleDeleteDriver = (id: string) => {
    const driver = drivers.find((item) => item.id === id);
    if (!driver) return;

    const hasActiveRoutes = routeSheets.some((route) => route.driverId === id && route.status !== 'completed');
    const message = hasActiveRoutes
      ? `El chofer "${driver.name}" tiene hojas de ruta activas o en tránsito. ¿Desea eliminarlo igualmente?`
      : `¿Está seguro de eliminar al chofer "${driver.name}"?`;

    if (confirm(message)) {
      persistDrivers(drivers.filter((item) => item.id !== id));
    }
  };

  const handleUpdateDriver = (updatedDriver: Driver) => {
    const nextDrivers = drivers.map((item) => (item.id === updatedDriver.id ? updatedDriver : item));
    persistDrivers(nextDrivers);

    const nextRoutes = routeSheets.map((route) => {
      if (route.driverId !== updatedDriver.id || route.status === 'completed') return route;

      return {
        ...route,
        driverName: updatedDriver.name,
        legajo: updatedDriver.legajo,
        internalUnit: updatedDriver.internalUnit,
        licensePlate: updatedDriver.licensePlate,
      };
    });

    persistRouteSheets(nextRoutes);
  };

  const handleAddZone = (newZone: Zone) => {
    persistZones([...zones, newZone]);
  };

  const handleUpdateZone = (updatedZone: Zone) => {
    persistZones(zones.map((zone) => (zone.id === updatedZone.id ? updatedZone : zone)));
  };

  const handleDeleteZone = (id: string) => {
    const zone = zones.find((item) => item.id === id);
    if (!zone) return;

    const agenciesInZone = agencies.filter((agency) => agency.zoneId === id).length;
    let message = `¿Está seguro de eliminar la zona "${zone.name}"?`;
    if (agenciesInZone > 0) {
      message += `\n\nAtención: hay ${agenciesInZone} agencias asignadas. Quedarán sin zona.`;
    }

    if (confirm(message)) {
      persistZones(zones.filter((item) => item.id !== id));
      persistAgencies(agencies.map((agency) => (agency.zoneId === id ? { ...agency, zoneId: '' } : agency)));
    }
  };

  const handleUpdateAgencyZone = (agencyId: string, zoneId: string) => {
    persistAgencies(agencies.map((agency) => (agency.id === agencyId ? { ...agency, zoneId } : agency)));
  };

  const handleCreateRouteSheet = (newRoute: RouteSheet) => {
    persistRouteSheets([newRoute, ...routeSheets]);
  };

  const handleDeleteRouteSheet = (id: string) => {
    if (confirm(`¿Está seguro de eliminar la hoja de ruta ${id}?`)) {
      persistRouteSheets(routeSheets.filter((route) => route.id !== id));
    }
  };

  const handleUpdateRouteSheet = (updatedRoute: RouteSheet) => {
    persistRouteSheets(routeSheets.map((route) => (route.id === updatedRoute.id ? updatedRoute : route)));
  };

  const resetToDefault = () => {
    if (!confirm('¿Desea restaurar los datos iniciales? Se perderán las firmas y hojas de ruta creadas.')) {
      return;
    }

    const seedState = createSeedAppData();
    setAgencies(seedState.agencies);
    setDrivers(seedState.drivers);
    setRouteSheets(seedState.routeSheets);
    setZones(seedState.zones);
    setSelectedRouteForModal(null);
    writeStateToStorage(seedState);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 antialiased pb-12">
      <header className="sticky top-0 z-40 bg-slate-950 text-white shadow-lg">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 shadow">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight md:text-base">LogiSign Pro</h1>
              <p className="text-[10px] text-slate-400 font-mono">Control de reparto y firma digital</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex rounded-lg border border-slate-800 bg-slate-900 p-0.5 sm:hidden">
              <button
                onClick={() => setMobileActiveView('admin')}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                  mobileActiveView === 'admin' ? 'bg-indigo-600 text-white' : 'text-slate-400'
                }`}
              >
                Admin
              </button>
              <button
                onClick={() => setMobileActiveView('driver')}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                  mobileActiveView === 'driver' ? 'bg-indigo-600 text-white' : 'text-slate-400'
                }`}
              >
                Chofer
              </button>
            </div>

            <button
              onClick={resetToDefault}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-800 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 transition-colors hover:bg-slate-900 hover:text-white"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Restablecer demo
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto mt-6 max-w-7xl px-4 md:px-6">
        <section className="mb-6">
          <DashboardStats routeSheets={routeSheets} agencies={agencies} drivers={drivers} />
        </section>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <section
            className={`space-y-6 lg:col-span-8 ${mobileActiveView === 'admin' ? 'block' : 'hidden sm:block'}`}
          >
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
              <div className="mb-4 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-indigo-500" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Mesa de asignación y control operativo
                </h2>
              </div>

              <AdminPanel
                agencies={agencies}
                zones={zones}
                drivers={drivers}
                routeSheets={routeSheets}
                onAddAgency={handleAddAgency}
                onAddDriver={handleAddDriver}
                onDeleteDriver={handleDeleteDriver}
                onUpdateDriver={handleUpdateDriver}
                onAddZone={handleAddZone}
                onUpdateZone={handleUpdateZone}
                onDeleteZone={handleDeleteZone}
                onUpdateAgencyZone={handleUpdateAgencyZone}
                onCreateRouteSheet={handleCreateRouteSheet}
                onViewRouteDetails={(route) => setSelectedRouteForModal(route)}
                onDeleteRouteSheet={handleDeleteRouteSheet}
              />
            </div>
          </section>

          <aside
            className={`flex flex-col items-center justify-start space-y-6 lg:col-span-4 ${
              mobileActiveView === 'driver' ? 'block' : 'hidden sm:block'
            }`}
          >
            <div className="w-full max-w-sm">
              <DriverPanel
                drivers={drivers}
                routeSheets={routeSheets}
                agencies={agencies}
                onUpdateRouteSheet={handleUpdateRouteSheet}
              />
            </div>

            <div className="max-w-sm rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-center">
              <p className="text-[10px] leading-relaxed text-slate-500">
                Portal móvil del chofer para carga, entrega y firma digital.
              </p>
            </div>
          </aside>
        </div>
      </main>

      {selectedRouteForModal && (
        <RouteDetailsModal
          route={selectedRouteForModal}
          agencies={agencies}
          onClose={() => setSelectedRouteForModal(null)}
        />
      )}

      <footer className="mx-auto mt-12 max-w-7xl border-t border-slate-200 px-6 pt-6 text-center text-xs text-slate-400">
        Sistema desarrollado para agencias de reparto y recolección.
      </footer>
    </div>
  );
}
