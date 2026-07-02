import React from 'react';
import { Lock, MapPin, PackageOpen, Truck, Users } from 'lucide-react';
import { Agency, Driver, InternalUnit, RouteSheet, Zone } from '../types';

interface AdminReadOnlyPanelProps {
  agencies: Agency[];
  zones: Zone[];
  drivers: Driver[];
  internals: InternalUnit[];
  routeSheets: RouteSheet[];
  onViewRouteDetails: (route: RouteSheet) => void;
}

const formatCount = (value: number): string => new Intl.NumberFormat('es-AR').format(value);

export const AdminReadOnlyPanel: React.FC<AdminReadOnlyPanelProps> = ({
  agencies,
  zones,
  drivers,
  internals,
  routeSheets,
  onViewRouteDetails,
}) => {
  const sortedRoutes = [...routeSheets].sort((a, b) => {
    const left = `${b.date} ${b.createdAt}`;
    const right = `${a.date} ${a.createdAt}`;
    return left.localeCompare(right);
  });

  const deliveredTotal = routeSheets.reduce((sum, route) => {
    return sum + route.stops.reduce((stopSum, stop) => stopSum + (stop.actualPackagesDelivered ?? 0), 0);
  }, 0);

  const collectedTotal = routeSheets.reduce((sum, route) => {
    return sum + route.stops.reduce((stopSum, stop) => stopSum + (stop.actualPackagesCollected ?? 0), 0);
  }, 0);

  const operationalUnits = internals.filter((unit) => unit.status === 'operativo').length;
  const outOfServiceUnits = internals.filter((unit) => unit.status === 'fuera_servicio').length;

  return (
    <section className="space-y-6">
      <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(14,165,233,0.10),_transparent_28%),radial-gradient(circle_at_bottom_left,_rgba(16,185,129,0.08),_transparent_26%)]" />
        <div className="relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.28em] text-slate-500">
              <Lock className="h-3.5 w-3.5 text-indigo-500" />
              Vista informativa
            </div>
            <h3 className="mt-3 text-2xl font-black tracking-tight text-slate-950 md:text-3xl">
              Resumen operativo sin edición
            </h3>
            <p className="mt-2 max-w-xl text-sm text-slate-500">
              Esta vista muestra indicadores, movimientos y el estado de las hojas de ruta, pero no permite
              crear, modificar ni eliminar registros.
            </p>
            <p className="mt-3 text-xs font-medium text-slate-400">
              Cobertura actual: {zones.length} zonas, {agencies.length} agencias y {internals.length} internos.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Agencias</div>
              <div className="mt-2 text-2xl font-black text-slate-950">{formatCount(agencies.length)}</div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Choferes</div>
              <div className="mt-2 text-2xl font-black text-slate-950">{formatCount(drivers.length)}</div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Internos</div>
              <div className="mt-2 text-2xl font-black text-slate-950">{formatCount(internals.length)}</div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Hojas</div>
              <div className="mt-2 text-2xl font-black text-slate-950">{formatCount(routeSheets.length)}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600">
              <PackageOpen className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Entregados</div>
              <div className="mt-1 text-2xl font-black text-slate-950">{formatCount(deliveredTotal)}</div>
            </div>
          </div>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-indigo-50 p-3 text-indigo-600">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Recolectados</div>
              <div className="mt-1 text-2xl font-black text-slate-950">{formatCount(collectedTotal)}</div>
            </div>
          </div>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-cyan-50 p-3 text-cyan-600">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Operativos</div>
              <div className="mt-1 text-2xl font-black text-slate-950">{formatCount(operationalUnits)}</div>
            </div>
          </div>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-amber-50 p-3 text-amber-600">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Fuera de servicio</div>
              <div className="mt-1 text-2xl font-black text-slate-950">{formatCount(outOfServiceUnits)}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h4 className="text-base font-black text-slate-950">Últimas hojas de ruta</h4>
            <p className="text-xs text-slate-500">Solo lectura, sin acciones de edición.</p>
          </div>
        </div>

        {sortedRoutes.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-400">
            Todavía no hay hojas de ruta cargadas.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {sortedRoutes.slice(0, 8).map((route) => {
              const delivered = route.stops.reduce((sum, stop) => sum + (stop.actualPackagesDelivered ?? 0), 0);
              const collected = route.stops.reduce((sum, stop) => sum + (stop.actualPackagesCollected ?? 0), 0);
              const isCompleted = route.status === 'completed';
              const badgeClass = isCompleted
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : route.status === 'en_route'
                  ? 'border-sky-200 bg-sky-50 text-sky-700'
                  : 'border-slate-200 bg-slate-50 text-slate-600';

              return (
                <div key={route.id} className="rounded-3xl border border-slate-200 bg-slate-50/70 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{route.id}</div>
                      <div className="mt-1 text-lg font-black text-slate-950">{route.driverName}</div>
                      <div className="mt-1 text-xs text-slate-500">
                        {route.date} · Interno {route.internalUnit || 'sin asignar'}
                      </div>
                    </div>
                    <span className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${badgeClass}`}>
                      {route.status}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-2xl border border-white bg-white px-3 py-2">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Entregados</div>
                      <div className="mt-1 font-mono text-base font-black text-emerald-700">{delivered}</div>
                    </div>
                    <div className="rounded-2xl border border-white bg-white px-3 py-2">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Recolectados</div>
                      <div className="mt-1 font-mono text-base font-black text-indigo-700">{collected}</div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <div className="text-xs text-slate-500">
                      Paradas: <span className="font-semibold text-slate-900">{route.stops.length}</span> · Fecha de creación:{' '}
                      <span className="font-semibold text-slate-900">{route.createdAt}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => onViewRouteDetails(route)}
                      className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-100"
                    >
                      Ver detalle
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
