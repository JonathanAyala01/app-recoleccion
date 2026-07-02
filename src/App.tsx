import React, { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { Agency, Driver, InternalUnit, InternalUnitHistoryEntry, RouteSheet, Zone } from './types';
import { createSeedAppData, normalizeAppData } from './lib/appData';
import { DashboardStats } from './components/DashboardStats';
import { OperationsDashboard } from './components/OperationsDashboard';
import { AdminPanel } from './components/AdminPanel';
import { AdminAccessGate } from './components/AdminAccessGate';
import { AdminReadOnlyPanel } from './components/AdminReadOnlyPanel';
import { DriverPanel } from './components/DriverPanel';
import { RouteDetailsModal } from './components/RouteDetailsModal';
import { apiBasePath, publicAssetPath } from './lib/paths';

const STORAGE_KEYS = {
  agencies: 'logistics_agencies',
  drivers: 'logistics_drivers',
  internals: 'logistics_internals',
  routeSheets: 'logistics_routes',
  zones: 'logistics_zones',
} as const;

const canUseLocalStorage = (): boolean =>
  typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

type PortalView = 'both' | 'admin' | 'chofer';
type AdminRole = 'admin' | 'viewer';

const ADMIN_ROLE_STORAGE_KEY = 'logistics_admin_role';
const ADMIN_AUTH_ENDPOINT = `${apiBasePath().replace(/\/$/, '')}/auth.php`;

const readPortalView = (): PortalView => {
  if (typeof window === 'undefined') return 'both';

  const view = new URLSearchParams(window.location.search).get('view');
  if (view === 'admin' || view === 'chofer' || view === 'driver') {
    return view === 'driver' ? 'chofer' : view;
  }

  const legacy = new URLSearchParams(window.location.search).get('portal');
  if (legacy === 'admin' || legacy === 'chofer' || legacy === 'driver') {
    return legacy === 'driver' ? 'chofer' : legacy;
  }

  return 'both';
};

const buildPortalLink = (view: Exclude<PortalView, 'both'>): string => {
  if (typeof window === 'undefined') return `?view=${view}`;

  const url = new URL(window.location.href);
  url.searchParams.set('view', view);
  return url.toString();
};

const readStoredAdminRole = (): AdminRole | null => {
  if (typeof window === 'undefined' || typeof window.sessionStorage === 'undefined') {
    return null;
  }

  const stored = window.sessionStorage.getItem(ADMIN_ROLE_STORAGE_KEY);
  return stored === 'admin' || stored === 'viewer' ? stored : null;
};

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
  const internals = parseCollection<InternalUnit>(STORAGE_KEYS.internals);
  const routeSheets = parseCollection<RouteSheet>(STORAGE_KEYS.routeSheets);
  const zones = parseCollection<Zone>(STORAGE_KEYS.zones);

  if (agencies.length || drivers.length || internals.length || routeSheets.length || zones.length) {
    return normalizeAppData({
      agencies,
      drivers,
      internals: internals.length > 0 ? internals : createSeedAppData().internals,
      routeSheets,
      zones,
    });
  }

  return createSeedAppData();
};

const hasStoredData = (): boolean => {
  if (!canUseLocalStorage()) return false;

  return (
    parseCollection<Agency>(STORAGE_KEYS.agencies).length > 0 ||
    parseCollection<Driver>(STORAGE_KEYS.drivers).length > 0 ||
    parseCollection<InternalUnit>(STORAGE_KEYS.internals).length > 0 ||
    parseCollection<RouteSheet>(STORAGE_KEYS.routeSheets).length > 0 ||
    parseCollection<Zone>(STORAGE_KEYS.zones).length > 0
  );
};

const writeStateToStorage = (state: {
  agencies: Agency[];
  drivers: Driver[];
  internals: InternalUnit[];
  routeSheets: RouteSheet[];
  zones: Zone[];
}) => {
  if (!canUseLocalStorage()) return;

  localStorage.setItem(STORAGE_KEYS.agencies, JSON.stringify(state.agencies));
  localStorage.setItem(STORAGE_KEYS.drivers, JSON.stringify(state.drivers));
  localStorage.setItem(STORAGE_KEYS.internals, JSON.stringify(state.internals));
  localStorage.setItem(STORAGE_KEYS.routeSheets, JSON.stringify(state.routeSheets));
  localStorage.setItem(STORAGE_KEYS.zones, JSON.stringify(state.zones));
};

export default function App() {
  const [initialState] = useState(() => readStoredState());
  const portalView = readPortalView();
  const [installPromptEvent, setInstallPromptEvent] = useState<Event | null>(null);
  const [adminRole, setAdminRole] = useState<AdminRole | null>(() => readStoredAdminRole());
  const [adminLoginError, setAdminLoginError] = useState('');
  const [adminLoginLoading, setAdminLoginLoading] = useState(false);

  const [agencies, setAgencies] = useState<Agency[]>(initialState.agencies);
  const [drivers, setDrivers] = useState<Driver[]>(initialState.drivers);
  const [internals, setInternals] = useState<InternalUnit[]>(initialState.internals);
  const [routeSheets, setRouteSheets] = useState<RouteSheet[]>(initialState.routeSheets);
  const [zones, setZones] = useState<Zone[]>(initialState.zones);
  const [selectedRouteForModal, setSelectedRouteForModal] = useState<RouteSheet | null>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPromptEvent(event);
    };

    const handleAppInstalled = () => {
      setInstallPromptEvent(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

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

  const persistInternals = (next: InternalUnit[]) => {
    setInternals(next);
    if (canUseLocalStorage()) {
      localStorage.setItem(STORAGE_KEYS.internals, JSON.stringify(next));
    }
  };

  const appendInternalHistory = (route: RouteSheet) => {
    const internalCode = route.internalUnit?.trim();
    if (!internalCode) return;

    const statusLabel: InternalUnitHistoryEntry['statusLabel'] =
      route.returnConditionStatus === 'observations'
        ? 'Llegó con observaciones'
        : route.returnConditionStatus === 'mechanical_failure'
          ? 'Unidad con falla mecánica'
          : 'Llegó OK';

    const historyEntry: InternalUnitHistoryEntry = {
      id: `hist-${route.id}`,
      routeId: route.id,
      routeDate: route.date,
      driverName: route.driverName,
      legajo: route.legajo,
      statusLabel,
      notes: route.returnConditionNotes || route.returnMechanicalCondition || route.observations || '',
      kmFinal: route.finalKm,
      recordedAt: new Date().toLocaleString('es-AR'),
    };

    const nextInternals = internals.map((unit) => {
      if (unit.code !== internalCode) return unit;
      const currentHistory = Array.isArray(unit.history) ? unit.history : [];
      const dedupedHistory = currentHistory.filter((entry) => entry.routeId !== route.id);
      return {
        ...unit,
        history: [historyEntry, ...dedupedHistory].slice(0, 20),
      };
    });

    persistInternals(nextInternals);
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

  const handleAddInternal = (newInternal: InternalUnit) => {
    persistInternals([...internals, newInternal]);
  };

  const handleUpdateInternal = (updatedInternal: InternalUnit) => {
    persistInternals(internals.map((item) => (item.id === updatedInternal.id ? updatedInternal : item)));
  };

  const handleDeleteInternal = (id: string) => {
    const unit = internals.find((item) => item.id === id);
    if (!unit) return;

    const usedInRoutes = routeSheets.some((route) => route.internalUnit === unit.code);
    const message = usedInRoutes
      ? `El interno "${unit.code}" ya está usado en una hoja de ruta. ¿Desea eliminarlo igualmente?`
      : `¿Está seguro de eliminar el interno "${unit.code}"?`;

    if (confirm(message)) {
      persistInternals(internals.filter((item) => item.id !== id));
    }
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

  const handleInstallApp = async () => {
    const promptEvent = installPromptEvent as BeforeInstallPromptEvent | null;
    if (!promptEvent) {
      alert('Usá el menú del navegador para agregar la app a inicio.');
      return;
    }

    promptEvent.prompt();
    await promptEvent.userChoice;
    setInstallPromptEvent(null);
  };

  const handleAdminLogin = async (password: string) => {
    const cleanPassword = password.trim();
    if (!cleanPassword) {
      setAdminLoginError('Ingresá una contraseña.');
      return;
    }

    setAdminLoginError('');
    setAdminLoginLoading(true);

    try {
      const response = await fetch(ADMIN_AUTH_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: cleanPassword }),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(typeof payload?.error === 'string' ? payload.error : 'No se pudo validar el acceso.');
      }

      const role = payload?.role;
      if (role !== 'admin' && role !== 'viewer') {
        throw new Error('Respuesta inválida del servidor.');
      }

      setAdminRole(role);
      if (typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined') {
        window.sessionStorage.setItem(ADMIN_ROLE_STORAGE_KEY, role);
      }
    } catch (error) {
      setAdminLoginError(error instanceof Error ? error.message : 'No se pudo validar el acceso.');
    } finally {
      setAdminLoginLoading(false);
    }
  };

  const handleAdminLogout = () => {
    setAdminRole(null);
    setAdminLoginError('');
    if (typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined') {
      window.sessionStorage.removeItem(ADMIN_ROLE_STORAGE_KEY);
    }
  };

  const handleUpdateRouteSheet = (updatedRoute: RouteSheet) => {
    const previousRoute = routeSheets.find((route) => route.id === updatedRoute.id);
    const nextRoutes = routeSheets.map((route) => (route.id === updatedRoute.id ? updatedRoute : route));
    persistRouteSheets(nextRoutes);

    if (previousRoute?.status !== 'completed' && updatedRoute.status === 'completed') {
      appendInternalHistory(updatedRoute);
    }
  };

  const resetToDefault = () => {
    if (!confirm('¿Desea restaurar los datos iniciales? Se perderán las firmas y hojas de ruta creadas.')) {
      return;
    }

    const seedState = createSeedAppData();
    setAgencies(seedState.agencies);
    setDrivers(seedState.drivers);
    setInternals(seedState.internals);
    setRouteSheets(seedState.routeSheets);
    setZones(seedState.zones);
    setSelectedRouteForModal(null);
    writeStateToStorage(seedState);
  };

  if (portalView === 'chofer') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-900">
        <div className="min-h-screen w-full p-4 md:p-6">
          <DriverPanel
            drivers={drivers}
            routeSheets={routeSheets}
            agencies={agencies}
            onUpdateRouteSheet={handleUpdateRouteSheet}
            canInstallApp={Boolean(installPromptEvent)}
            onInstallApp={handleInstallApp}
          />
        </div>
      </div>
    );
  }

  if (!adminRole) {
    return (
      <AdminAccessGate
        isLoading={adminLoginLoading}
        error={adminLoginError}
        onSubmit={handleAdminLogin}
        onGoToDriver={() => {
          window.location.href = buildPortalLink('chofer');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 antialiased pb-12">
      <header className="sticky top-0 z-40 bg-slate-950 text-white shadow-lg">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-6">
          <div className="flex items-center gap-3">
            <img src={publicAssetPath('logo.png')} alt="Logo" className="h-16 w-16 md:h-18 md:w-18 object-contain drop-shadow-[0_10px_18px_rgba(15,23,42,0.25)]" />
            <div>
              <h1 className="text-sm font-bold tracking-tight md:text-base">CRUCERO EXPRESS-RECOLECCIÓN</h1>
              <p className="text-[10px] text-slate-400 font-mono">Control de reparto y firma digital</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-200 md:inline-flex">
              {adminRole === 'admin' ? 'Administrador' : 'Vista informativa'}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <a
                href={buildPortalLink('admin')}
                className="inline-flex items-center rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
              >
                Link Admin
              </a>
              <a
                href={buildPortalLink('chofer')}
                className="inline-flex items-center rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
              >
                Link Chofer
              </a>
            </div>

            <button
              onClick={resetToDefault}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-800 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 transition-colors hover:bg-slate-900 hover:text-white"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Restablecer demo
            </button>

            <button
              onClick={handleAdminLogout}
              className="inline-flex items-center rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-rose-200 transition-colors hover:bg-rose-500/20"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto mt-6 max-w-7xl px-4 md:px-6">
        <section className="mb-6">
          <DashboardStats routeSheets={routeSheets} agencies={agencies} drivers={drivers} />
        </section>

        <section className="mb-6">
          <OperationsDashboard
            routeSheets={routeSheets}
            agencies={agencies}
            drivers={drivers}
            zones={zones}
          />
        </section>

        <div className="grid grid-cols-1 gap-6">
          <section className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
              <div className="mb-4 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-indigo-500" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Mesa de asignación y control operativo
                </h2>
              </div>

              {adminRole === 'admin' ? (
                <AdminPanel
                  agencies={agencies}
                  zones={zones}
                  drivers={drivers}
                  internals={internals}
                  routeSheets={routeSheets}
                  onAddAgency={handleAddAgency}
                  onAddDriver={handleAddDriver}
                  onAddInternal={handleAddInternal}
                  onDeleteDriver={handleDeleteDriver}
                  onUpdateDriver={handleUpdateDriver}
                  onUpdateInternal={handleUpdateInternal}
                  onDeleteInternal={handleDeleteInternal}
                  onAddZone={handleAddZone}
                  onUpdateZone={handleUpdateZone}
                  onDeleteZone={handleDeleteZone}
                  onUpdateAgencyZone={handleUpdateAgencyZone}
                  onCreateRouteSheet={handleCreateRouteSheet}
                  onViewRouteDetails={(route) => setSelectedRouteForModal(route)}
                  onDeleteRouteSheet={handleDeleteRouteSheet}
                />
              ) : (
                <AdminReadOnlyPanel
                  agencies={agencies}
                  zones={zones}
                  drivers={drivers}
                  internals={internals}
                  routeSheets={routeSheets}
                  onViewRouteDetails={(route) => setSelectedRouteForModal(route)}
                />
              )}
            </div>
          </section>
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
