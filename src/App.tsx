import React, { useState, useEffect } from 'react';
import { 
  ClipboardList, Smartphone, Layers, User, Truck, ShieldAlert, Sparkles, 
  RefreshCw, Info, CheckCircle2, MapPin
} from 'lucide-react';
import { Agency, Zone, Driver, RouteSheet } from './types';
import { INITIAL_AGENCIES, INITIAL_DRIVERS, INITIAL_ZONES } from './seedData';
import { createSeedAppData } from './lib/appData';
import { DashboardStats } from './components/DashboardStats';
import { AdminPanel } from './components/AdminPanel';
import { DriverPanel } from './components/DriverPanel';
import { RouteDetailsModal } from './components/RouteDetailsModal';

export default function App() {
  // Core Database States
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [routeSheets, setRouteSheets] = useState<RouteSheet[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);

  // UI Selection States
  const [selectedRouteForModal, setSelectedRouteForModal] = useState<RouteSheet | null>(null);
  const [mobileActiveView, setMobileActiveView] = useState<'admin' | 'driver'>('admin');

  // Load and Seed Data on Mount
  useEffect(() => {
    const savedAgencies = localStorage.getItem('logistics_agencies');
    const savedDrivers = localStorage.getItem('logistics_drivers');
    const savedRoutes = localStorage.getItem('logistics_routes');
    const savedZones = localStorage.getItem('logistics_zones');

    if (savedAgencies) setAgencies(JSON.parse(savedAgencies));
    else {
      setAgencies(INITIAL_AGENCIES);
      localStorage.setItem('logistics_agencies', JSON.stringify(INITIAL_AGENCIES));
    }

    if (savedDrivers) setDrivers(JSON.parse(savedDrivers));
    else {
      setDrivers(INITIAL_DRIVERS);
      localStorage.setItem('logistics_drivers', JSON.stringify(INITIAL_DRIVERS));
    }

    if (savedZones) setZones(JSON.parse(savedZones));
    else {
      setZones(INITIAL_ZONES);
      localStorage.setItem('logistics_zones', JSON.stringify(INITIAL_ZONES));
    }

    if (savedRoutes) {
      setRouteSheets(JSON.parse(savedRoutes));
    } else {
      // Seed initial mock routes to demonstrate the application state
      const seedRoutes: RouteSheet[] = [
        {
          id: 'HR-4089',
          date: new Date().toISOString().split('T')[0],
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
          createdAt: new Date().toLocaleDateString('es-AR'),
          driverLoadSignature: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="50"><path d="M10 25 C 20 10, 30 40, 40 25 C 50 10, 60 40, 70 25 C 80 10, 90 40, 100 25" fill="none" stroke="black" stroke-width="2"/></svg>',
          driverReturnSignature: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="50"><path d="M10 25 C 25 5, 35 45, 45 25 C 55 5, 65 45, 75 25 C 85 5, 95 45, 105 25" fill="none" stroke="blue" stroke-width="2"/></svg>',
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
              recipientSignature: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="50"><path d="M5 40 Q 50 5 95 40" fill="none" stroke="green" stroke-width="2"/></svg>',
              observations: 'Recibido conforme.'
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
              recipientSignature: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="50"><path d="M5 25 L 95 25" fill="none" stroke="red" stroke-width="2"/></svg>',
              observations: 'Todo bien.'
            }
          ]
        },
        {
          id: 'HR-9102',
          date: new Date().toISOString().split('T')[0],
          driverId: 'drv-2',
          driverName: 'Juan Manuel Rodríguez',
          legajo: 'L-2918',
          internalUnit: 'U-214',
          licensePlate: 'AE-892-LL',
          initialKm: 34105,
          status: 'assigned',
          createdAt: new Date().toLocaleDateString('es-AR'),
          stops: [
            {
              id: 'stp-3',
              agencyId: 'age-6',
              sequence: 1,
              scheduledTime: '08:00',
              packagesToDeliver: 5,
              packagesToCollect: 12,
              status: 'pending'
            },
            {
              id: 'stp-4',
              agencyId: 'age-7',
              sequence: 2,
              scheduledTime: '09:00',
              packagesToDeliver: 15,
              packagesToCollect: 0,
              status: 'pending'
            },
            {
              id: 'stp-5',
              agencyId: 'age-11',
              sequence: 3,
              scheduledTime: '10:15',
              packagesToDeliver: 0,
              packagesToCollect: 6,
              status: 'pending'
            }
          ]
        }
      ];
      setRouteSheets(seedRoutes);
      localStorage.setItem('logistics_routes', JSON.stringify(seedRoutes));
    }
  }, []);

  // Save states helper
  const saveAgencies = (updated: Agency[]) => {
    setAgencies(updated);
    localStorage.setItem('logistics_agencies', JSON.stringify(updated));
  };

  const saveDrivers = (updated: Driver[]) => {
    setDrivers(updated);
    localStorage.setItem('logistics_drivers', JSON.stringify(updated));
  };

  const saveRouteSheets = (updated: RouteSheet[]) => {
    setRouteSheets(updated);
    localStorage.setItem('logistics_routes', JSON.stringify(updated));
    
    // Auto sync modal if open
    if (selectedRouteForModal) {
      const fresh = updated.find(r => r.id === selectedRouteForModal.id);
      if (fresh) setSelectedRouteForModal(fresh);
    }
  };

  // Handlers
  const handleAddAgency = (newAgency: Agency) => {
    saveAgencies([...agencies, newAgency]);
  };

  const handleAddDriver = (newDriver: Driver) => {
    saveDrivers([...drivers, newDriver]);
  };

  const handleDeleteDriver = (id: string) => {
    const driver = drivers.find(d => d.id === id);
    if (!driver) return;
    
    const hasActiveRoutes = routeSheets.some(r => r.driverId === id && r.status !== 'completed');
    const msg = hasActiveRoutes 
      ? `El chofer "${driver.name}" tiene Hojas de Ruta activas o en tránsito. ¿Está seguro de que desea eliminarlo del sistema?`
      : `¿Está seguro de eliminar al chofer "${driver.name}"?`;
      
    if (confirm(msg)) {
      saveDrivers(drivers.filter(d => d.id !== id));
    }
  };

  const handleUpdateDriver = (updatedDriver: Driver) => {
    const updated = drivers.map(d => d.id === updatedDriver.id ? updatedDriver : d);
    saveDrivers(updated);
    
    // Auto sync updated driver details to non-completed route sheets
    const updatedRoutes = routeSheets.map(r => {
      if (r.driverId === updatedDriver.id && r.status !== 'completed') {
        return {
          ...r,
          driverName: updatedDriver.name,
          legajo: updatedDriver.legajo,
          internalUnit: updatedDriver.internalUnit,
          licensePlate: updatedDriver.licensePlate
        };
      }
      return r;
    });
    saveRouteSheets(updatedRoutes);
  };

  const saveZones = (updated: Zone[]) => {
    setZones(updated);
    localStorage.setItem('logistics_zones', JSON.stringify(updated));
  };

  const handleAddZone = (newZone: Zone) => {
    saveZones([...zones, newZone]);
  };

  const handleUpdateZone = (updatedZone: Zone) => {
    const updated = zones.map(z => z.id === updatedZone.id ? updatedZone : z);
    saveZones(updated);
  };

  const handleDeleteZone = (id: string) => {
    const zone = zones.find(z => z.id === id);
    if (!zone) return;

    const countAgencies = agencies.filter(a => a.zoneId === id).length;
    let confirmMsg = `¿Está seguro de que desea eliminar la zona "${zone.name}"?`;
    if (countAgencies > 0) {
      confirmMsg += `\n\nAtención: Hay ${countAgencies} agencias asignadas a esta zona. Al eliminarla, estas agencias quedarán sin zona asignada.`;
    }

    if (confirm(confirmMsg)) {
      saveZones(zones.filter(z => z.id !== id));
      const updatedAgencies = agencies.map(a => a.zoneId === id ? { ...a, zoneId: '' } : a);
      saveAgencies(updatedAgencies);
    }
  };

  const handleUpdateAgencyZone = (agencyId: string, zoneId: string) => {
    const updated = agencies.map(a => a.id === agencyId ? { ...a, zoneId } : a);
    saveAgencies(updated);
  };

  const handleCreateRouteSheet = (newRoute: RouteSheet) => {
    saveRouteSheets([newRoute, ...routeSheets]);
  };

  const handleDeleteRouteSheet = (id: string) => {
    if (confirm(`¿Está seguro de eliminar la Hoja de Ruta ${id}?`)) {
      saveRouteSheets(routeSheets.filter(r => r.id !== id));
    }
  };

  const handleUpdateRouteSheet = (updatedRoute: RouteSheet) => {
    const updated = routeSheets.map(r => r.id === updatedRoute.id ? updatedRoute : r);
    saveRouteSheets(updated);
  };

  const resetToDefault = () => {
    if (confirm("¿Desea restaurar los datos iniciales de fábrica? Se perderán las firmas y hojas de ruta creadas.")) {
      const seedState = createSeedAppData();

      setAgencies(seedState.agencies);
      setDrivers(seedState.drivers);
      setRouteSheets(seedState.routeSheets);
      setZones(seedState.zones);
      setSelectedRouteForModal(null);

      localStorage.setItem('logistics_agencies', JSON.stringify(seedState.agencies));
      localStorage.setItem('logistics_drivers', JSON.stringify(seedState.drivers));
      localStorage.setItem('logistics_routes', JSON.stringify(seedState.routeSheets));
      localStorage.setItem('logistics_zones', JSON.stringify(seedState.zones));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased pb-12">
      
      {/* GLOBAL HEADER HEADER */}
      <header className="bg-slate-900 text-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow">
              <Truck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-md font-bold tracking-tight">LogiSign Pro</h1>
              <p className="text-[10px] text-slate-400 font-mono">Control de Reparto & Firma Digital</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            {/* View Switcher for responsive layout */}
            <div className="flex sm:hidden bg-slate-800 p-0.5 rounded-lg border border-slate-700">
              <button
                onClick={() => setMobileActiveView('admin')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  mobileActiveView === 'admin' ? 'bg-indigo-600 text-white' : 'text-slate-400'
                }`}
              >
                Panel Admin
              </button>
              <button
                onClick={() => setMobileActiveView('driver')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  mobileActiveView === 'driver' ? 'bg-indigo-600 text-white' : 'text-slate-400'
                }`}
              >
                App Chofer
              </button>
            </div>

            <button
              onClick={resetToDefault}
              className="text-[10px] uppercase font-bold tracking-wider text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-700 px-3 py-2 rounded-lg transition-all cursor-pointer"
            >
              Restablecer Demo
            </button>
          </div>
        </div>
      </header>

      {/* CORE WORKSPACE */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 mt-6">
        
        {/* TOP LIVE TRACKING STATS */}
        <section className="mb-6">
          <DashboardStats 
            routeSheets={routeSheets}
            agencies={agencies}
            drivers={drivers}
          />
        </section>

        {/* WORKSPACE SIDE-BY-SIDE PANELS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT CONTAINER: ADMIN PANEL (VISTA ESCRITORIO / CONTROLES GENERALES) */}
          <div className={`lg:col-span-8 space-y-6 ${
            mobileActiveView === 'admin' ? 'block' : 'hidden sm:block'
          }`}>
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <div className="flex items-center gap-2 mb-4">
                <span className="h-2 w-2 rounded-full bg-indigo-500"></span>
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mesa de Asignación y Control Operativo</h2>
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
          </div>

          {/* RIGHT CONTAINER: SIMULATED MOBILE SMARTPHONE PORTAL (APP CHOFER) */}
          <div className={`lg:col-span-4 space-y-6 flex flex-col items-center justify-center ${
            mobileActiveView === 'driver' ? 'block' : 'hidden sm:block'
          }`}>
            
            {/* Visual Phone Frame Wrapper */}
            <div className="relative w-full max-w-[340px] md:max-w-sm">
              
              {/* Phone Speaker & Camera Notch */}
              <div className="absolute top-3.5 left-1/2 -translate-x-1/2 w-28 h-4 bg-slate-950 rounded-full z-20 flex items-center justify-center gap-1.5 px-3">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-800"></span>
                <span className="h-1 w-8 bg-slate-800 rounded-full"></span>
              </div>

              {/* Status Bar Indicator */}
              <div className="absolute top-1.5 left-8 right-8 flex justify-between items-center z-20 text-[9px] font-mono text-slate-400 font-semibold select-none">
                <span>10:45 AM</span>
                <div className="flex items-center gap-1">
                  <span>5G</span>
                  <span className="h-2 w-3.5 border border-slate-400 rounded-xs bg-slate-300 relative">
                    <span className="absolute top-0.5 right-0.5 bottom-0.5 left-0.5 bg-slate-600 rounded-3xs"></span>
                  </span>
                </div>
              </div>

              {/* Outer chassis bezel */}
              <div className="bg-slate-950 p-3 pb-4 rounded-[42px] border-4 border-slate-800 shadow-2xl relative">
                
                {/* Inner Device Content */}
                <div className="bg-slate-900 rounded-[32px] overflow-hidden pt-6">
                  <DriverPanel
                    drivers={drivers}
                    routeSheets={routeSheets}
                    agencies={agencies}
                    onUpdateRouteSheet={handleUpdateRouteSheet}
                  />
                </div>

                {/* Bottom Home Indicator Bar */}
                <div className="h-1 w-24 bg-slate-700 mx-auto mt-3 rounded-full"></div>
              </div>

              {/* Simulated Device Caption / Floating Hint */}
              <div className="mt-3.5 text-center bg-slate-100 border border-slate-200 rounded-xl py-2 px-4 max-w-xs mx-auto">
                <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                  📱 <strong>Simulador Móvil del Chofer:</strong> Seleccione un chofer arriba, asigne una ruta y simule la carga, entrega y firma digital táctil directamente en tiempo real.
                </p>
              </div>
            </div>

          </div>

        </div>
      </main>

      {/* FULL RECORD SHEET MODAL (FOR DETAILED REVIEW & PRINTING) */}
      {selectedRouteForModal && (
        <RouteDetailsModal
          route={selectedRouteForModal}
          agencies={agencies}
          onClose={() => setSelectedRouteForModal(null)}
        />
      )}

      {/* FLOATING CONTEXT ADVICE PANEL */}
      <footer className="max-w-7xl mx-auto px-6 mt-12 text-center text-slate-400 text-xs space-y-2 border-t border-slate-200 pt-6">
        <p>Sistema desarrollado bajo requerimientos de logística de agencias de reparto y recolección.</p>
        <p className="text-[10px] font-mono text-slate-300">LogiSign Pro — Google AI Studio Build</p>
      </footer>

    </div>
  );
}
