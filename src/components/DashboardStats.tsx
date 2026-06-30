import React from 'react';
import { 
  TrendingUp, Users, MapPin, Truck, CheckSquare, PackageOpen, AlertTriangle, RefreshCw
} from 'lucide-react';
import { RouteSheet, Driver, Agency } from '../types';

interface DashboardStatsProps {
  routeSheets: RouteSheet[];
  agencies: Agency[];
  drivers: Driver[];
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  routeSheets,
  agencies,
  drivers
}) => {
  // Calculations
  const totalRoutes = routeSheets.length;
  const activeRoutes = routeSheets.filter(r => r.status === 'en_route' || r.status === 'loading').length;
  const completedRoutes = routeSheets.filter(r => r.status === 'completed').length;
  
  // Total packages counters
  let totalScheduledDeliveries = 0;
  let totalActualDeliveries = 0;
  let totalScheduledCollections = 0;
  let totalActualCollections = 0;
  let totalStopsCount = 0;
  let completedStopsCount = 0;

  routeSheets.forEach(r => {
    r.stops.forEach(s => {
      totalStopsCount++;
      totalScheduledDeliveries += s.packagesToDeliver;
      totalScheduledCollections += s.packagesToCollect;
      
      if (s.status === 'completed') {
        completedStopsCount++;
        totalActualDeliveries += s.actualPackagesDelivered ?? 0;
        totalActualCollections += s.actualPackagesCollected ?? 0;
      } else if (s.status === 'skipped') {
        completedStopsCount++;
      }
    });
  });

  const stopCompletionRate = totalStopsCount > 0 
    ? Math.round((completedStopsCount / totalStopsCount) * 100) 
    : 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      
      {/* CARD 1: ACTIVE ROUTES */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4.5 shadow-xs flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Hojas de Ruta</span>
          <h3 className="text-xl font-bold text-slate-900 mt-1.5 font-mono">{completedRoutes} <span className="text-xs font-normal text-slate-400">/ {totalRoutes}</span></h3>
          <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1 font-semibold">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
            {activeRoutes} en tránsito hoy
          </div>
        </div>
        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
          <Truck className="w-5 h-5" />
        </div>
      </div>

      {/* CARD 2: BULTOS ENTREGADOS */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4.5 shadow-xs flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Bultos Entregados</span>
          <h3 className="text-xl font-bold text-slate-900 mt-1.5 font-mono">{totalActualDeliveries} <span className="text-xs font-normal text-slate-400">/ {totalScheduledDeliveries}</span></h3>
          <div className="text-[10px] text-emerald-600 mt-1 flex items-center gap-1 font-semibold">
            <CheckSquare className="w-3 h-3" />
            {totalScheduledDeliveries - totalActualDeliveries} pendientes
          </div>
        </div>
        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
          <PackageOpen className="w-5 h-5" />
        </div>
      </div>

      {/* CARD 3: BULTOS RECOLECTADOS */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4.5 shadow-xs flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Bultos Recolectados</span>
          <h3 className="text-xl font-bold text-slate-900 mt-1.5 font-mono">{totalActualCollections} <span className="text-xs font-normal text-slate-400">bultos</span></h3>
          <div className="text-[10px] text-indigo-600 mt-1 flex items-center gap-1 font-semibold">
            <RefreshCw className="w-3 h-3 animate-spin duration-[3s]" />
            Registrado por choferes en agencias
          </div>
        </div>
        <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
          <TrendingUp className="w-5 h-5" />
        </div>
      </div>

      {/* CARD 4: COMPLETION RATE */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4.5 shadow-xs flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Efectividad de Paradas</span>
          <h3 className="text-xl font-bold text-slate-900 mt-1.5 font-mono">{stopCompletionRate}%</h3>
          <div className="w-24 bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
            <div 
              className="bg-indigo-600 h-full rounded-full transition-all duration-500" 
              style={{ width: `${stopCompletionRate}%` }}
            />
          </div>
        </div>
        <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
          <MapPin className="w-5 h-5" />
        </div>
      </div>

    </div>
  );
};
