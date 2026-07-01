import React, { useState } from 'react';
import { Calendar, Filter, MapPin, PackageOpen, PieChart, RefreshCw, SlidersHorizontal, TrendingUp, Truck, Users } from 'lucide-react';
import { Agency, Driver, RouteSheet, Zone } from '../types';

interface OperationsDashboardProps {
  routeSheets: RouteSheet[];
  agencies: Agency[];
  drivers: Driver[];
  zones: Zone[];
}

type AgencyStats = {
  agencyId: string;
  code: string;
  name: string;
  zoneName: string;
  deliveries: number;
  collections: number;
  stops: number;
};

type DriverStats = {
  driverId: string;
  name: string;
  username: string;
  deliveries: number;
  collections: number;
  stops: number;
};

type ZoneStats = {
  zoneId: string;
  name: string;
  deliveries: number;
  collections: number;
  stops: number;
  agencies: number;
};

type ChartMode = 'barras' | 'torta';

type ChartItem = {
  label: string;
  secondaryLabel?: string;
  value: number;
  color: string;
};

const todayValue = new Date().toISOString().split('T')[0];

const COLORS = [
  '#4f46e5',
  '#0f766e',
  '#ea580c',
  '#db2777',
  '#0369a1',
  '#7c3aed',
  '#16a34a',
  '#ca8a04',
];

const formatPct = (value: number): string => `${Math.round(value * 10) / 10}%`;

const makeChartItems = (
  rows: Array<{ label: string; secondaryLabel?: string; value: number }>,
  limit: number,
): ChartItem[] => rows.slice(0, limit).map((row, index) => ({
  ...row,
  color: COLORS[index % COLORS.length],
}));

const buildPieSegments = (
  rows: Array<{ label: string; secondaryLabel?: string; value: number }>,
  limit: number,
): ChartItem[] => {
  const top = rows.slice(0, limit);
  const rest = rows.slice(limit).reduce((sum, row) => sum + row.value, 0);
  const base = top.map((row, index) => ({
    ...row,
    color: COLORS[index % COLORS.length],
  }));

  if (rest > 0) {
    base.push({
      label: 'Otros',
      secondaryLabel: 'Resto de registros',
      value: rest,
      color: '#cbd5e1',
    });
  }

  return base;
};

const buildConicGradient = (segments: ChartItem[]): string => {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0) || 1;
  let cursor = 0;

  return segments.map((segment) => {
    const start = cursor;
    const size = (segment.value / total) * 100;
    cursor += size;
    return `${segment.color} ${start}% ${cursor}%`;
  }).join(', ');
};

const MetricCard: React.FC<{
  title: string;
  value: number;
  description: string;
  icon: React.ReactNode;
  accent: string;
}> = ({ title, value, description, icon, accent }) => (
  <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
    <div className="flex items-center justify-between gap-3">
      <div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{title}</span>
        <div className={`mt-2 text-2xl font-bold ${accent}`}>{value}</div>
        <div className="mt-1 text-[11px] text-slate-500">{description}</div>
      </div>
      <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3 text-slate-600">
        {icon}
      </div>
    </div>
  </div>
);

export const OperationsDashboard: React.FC<OperationsDashboardProps> = ({
  routeSheets,
  agencies,
  drivers,
  zones,
}) => {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [driverId, setDriverId] = useState('all');
  const [zoneId, setZoneId] = useState('all');
  const [chartMode, setChartMode] = useState<ChartMode>('barras');

  const agencyById = new Map(agencies.map((agency) => [agency.id, agency]));
  const driverById = new Map(drivers.map((driver) => [driver.id, driver]));
  const zoneById = new Map(zones.map((zone) => [zone.id, zone]));

  const filteredRoutes = routeSheets.filter((route) => {
    const matchesDateFrom = !dateFrom || route.date >= dateFrom;
    const matchesDateTo = !dateTo || route.date <= dateTo;
    const matchesDriver = driverId === 'all' || route.driverId === driverId;
    return matchesDateFrom && matchesDateTo && matchesDriver;
  });

  const agencyStats = new Map<string, AgencyStats>();
  const driverStats = new Map<string, DriverStats>();
  const zoneStats = new Map<string, ZoneStats>();
  const zoneAgencySets = new Map<string, Set<string>>();

  let totalStops = 0;
  let totalDeliveries = 0;
  let totalCollections = 0;
  let completedStops = 0;

  filteredRoutes.forEach((route) => {
    route.stops.forEach((stop) => {
      totalStops += 1;
      const agency = agencyById.get(stop.agencyId);
      if (!agency) return;

      if (zoneId !== 'all' && agency.zoneId !== zoneId) {
        return;
      }

      if (stop.status !== 'completed') {
        return;
      }

      completedStops += 1;
      const deliveries = stop.actualPackagesDelivered ?? 0;
      const collections = stop.actualPackagesCollected ?? 0;
      totalDeliveries += deliveries;
      totalCollections += collections;

      const agencyCurrent = agencyStats.get(agency.id) ?? {
        agencyId: agency.id,
        code: agency.code,
        name: agency.name,
        zoneName: zoneById.get(agency.zoneId)?.name || 'Sin zona',
        deliveries: 0,
        collections: 0,
        stops: 0,
      };
      agencyCurrent.deliveries += deliveries;
      agencyCurrent.collections += collections;
      agencyCurrent.stops += 1;
      agencyStats.set(agency.id, agencyCurrent);

      const driverCurrent = driverById.get(route.driverId);
      if (driverCurrent) {
        const stats = driverStats.get(driverCurrent.id) ?? {
          driverId: driverCurrent.id,
          name: driverCurrent.name,
          username: driverCurrent.username,
          deliveries: 0,
          collections: 0,
          stops: 0,
        };
        stats.deliveries += deliveries;
        stats.collections += collections;
        stats.stops += 1;
        driverStats.set(driverCurrent.id, stats);
      }

      if (agency.zoneId) {
        const zone = zoneById.get(agency.zoneId);
        const agencySet = zoneAgencySets.get(agency.zoneId) ?? new Set<string>();
        agencySet.add(agency.id);
        zoneAgencySets.set(agency.zoneId, agencySet);

        const zoneCurrent = zoneStats.get(agency.zoneId) ?? {
          zoneId: agency.zoneId,
          name: zone?.name || 'Sin zona',
          deliveries: 0,
          collections: 0,
          stops: 0,
          agencies: 0,
        };
        zoneCurrent.deliveries += deliveries;
        zoneCurrent.collections += collections;
        zoneCurrent.stops += 1;
        zoneCurrent.agencies = agencySet.size;
        zoneStats.set(agency.zoneId, zoneCurrent);
      }
    });
  });

  const topAgenciesByCollections = [...agencyStats.values()]
    .sort((a, b) => b.collections - a.collections || b.deliveries - a.deliveries)
    .slice(0, 5);

  const topAgenciesByDeliveries = [...agencyStats.values()]
    .sort((a, b) => b.deliveries - a.deliveries || b.collections - a.collections)
    .slice(0, 5);

  const topDrivers = [...driverStats.values()]
    .sort((a, b) => (b.deliveries + b.collections) - (a.deliveries + a.collections))
    .slice(0, 5);

  const topZones = [...zoneStats.values()]
    .sort((a, b) => (b.deliveries + b.collections) - (a.deliveries + a.collections))
    .slice(0, 5);

  const resetFilters = () => {
    setDateFrom('');
    setDateTo('');
    setDriverId('all');
    setZoneId('all');
  };

  const renderBarPanel = (title: string, subtitle: string, icon: React.ReactNode, items: ChartItem[]) => {
    const maxValue = Math.max(...items.map((item) => item.value), 1);

    return (
      <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-start gap-3">
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3 text-slate-700">
            {icon}
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-950">{title}</h4>
            <p className="text-[11px] text-slate-500">{subtitle}</p>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center text-xs text-slate-400">
            No hay datos para estos filtros.
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => {
              const width = `${Math.max((item.value / maxValue) * 100, item.value > 0 ? 8 : 0)}%`;

              return (
                <div key={`${item.label}-${item.value}`} className="space-y-1.5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold text-slate-900">{item.label}</div>
                      {item.secondaryLabel && <div className="text-[10px] text-slate-500">{item.secondaryLabel}</div>}
                    </div>
                    <div className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-bold text-slate-700">
                      {item.value}
                    </div>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width,
                        background: `linear-gradient(90deg, ${item.color}, rgba(15, 23, 42, 0.15))`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const renderPiePanel = (title: string, subtitle: string, icon: React.ReactNode, rows: Array<{ label: string; secondaryLabel?: string; value: number }>) => {
    const segments = buildPieSegments(rows, 5);
    const total = segments.reduce((sum, item) => sum + item.value, 0);
    const gradient = buildConicGradient(segments);

    return (
      <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-start gap-3">
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3 text-slate-700">
            {icon}
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-950">{title}</h4>
            <p className="text-[11px] text-slate-500">{subtitle}</p>
          </div>
        </div>

        {segments.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center text-xs text-slate-400">
            No hay datos para estos filtros.
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-[200px_minmax(0,1fr)]">
            <div className="flex items-center justify-center">
              <div className="relative h-44 w-44">
                <div
                  className="absolute inset-0 rounded-full shadow-[0_18px_45px_rgba(15,23,42,0.14)]"
                  style={{ background: `conic-gradient(${gradient})` }}
                />
                <div className="absolute inset-5 rounded-full border border-slate-100 bg-white shadow-inner" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <div className="text-[10px] font-bold uppercase tracking-[0.26em] text-slate-400">Total</div>
                  <div className="mt-1 text-3xl font-black text-slate-950">{total}</div>
                  <div className="mt-1 text-[11px] text-slate-500">movimientos</div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {segments.map((segment) => {
                const pct = total > 0 ? (segment.value / total) * 100 : 0;
                return (
                  <div key={segment.label} className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-semibold text-slate-900">{segment.label}</div>
                        {segment.secondaryLabel && <div className="text-[10px] text-slate-500">{segment.secondaryLabel}</div>}
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-sm font-bold text-slate-900">{segment.value}</div>
                        <div className="text-[10px] text-slate-500">{formatPct(pct)}</div>
                      </div>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, backgroundColor: segment.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  const agencyCollectionBars = makeChartItems(
    topAgenciesByCollections.map((item) => ({
      label: `${item.code} · ${item.name}`,
      secondaryLabel: item.zoneName,
      value: item.collections,
    })),
    5,
  );

  const agencyDeliveryBars = makeChartItems(
    topAgenciesByDeliveries.map((item) => ({
      label: `${item.code} · ${item.name}`,
      secondaryLabel: item.zoneName,
      value: item.deliveries,
    })),
    5,
  );

  const driverBars = makeChartItems(
    topDrivers.map((item) => ({
      label: item.name,
      secondaryLabel: `@${item.username}`,
      value: item.deliveries + item.collections,
    })),
    5,
  );

  const zoneBars = makeChartItems(
    topZones.map((item) => ({
      label: item.name,
      secondaryLabel: `${item.agencies} agencias impactadas`,
      value: item.deliveries + item.collections,
    })),
    5,
  );

  const agencyCollectionPie = topAgenciesByCollections.map((item) => ({
    label: `${item.code} · ${item.name}`,
    secondaryLabel: item.zoneName,
    value: item.collections,
  }));

  const agencyDeliveryPie = topAgenciesByDeliveries.map((item) => ({
    label: `${item.code} · ${item.name}`,
    secondaryLabel: item.zoneName,
    value: item.deliveries,
  }));

  const driverPie = topDrivers.map((item) => ({
    label: item.name,
    secondaryLabel: `@${item.username}`,
    value: item.deliveries + item.collections,
  }));

  const zonePie = topZones.map((item) => ({
    label: item.name,
    secondaryLabel: `${item.agencies} agencias impactadas`,
    value: item.deliveries + item.collections,
  }));

  return (
    <section className="space-y-4">
      <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(79,70,229,0.10),_transparent_32%),radial-gradient(circle_at_bottom_left,_rgba(14,165,233,0.08),_transparent_28%)]" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.28em] text-slate-500 backdrop-blur">
              <TrendingUp className="h-3.5 w-3.5 text-indigo-500" />
              Dashboard Operativo
            </div>
            <h3 className="mt-3 text-2xl font-black tracking-tight text-slate-950 md:text-3xl">
              Agencias, choferes y zonas con mas movimiento real
            </h3>
            <p className="mt-2 max-w-xl text-sm text-slate-500">
              Cruza entregas y recolecciones registradas por chofer con filtros por fecha, chofer y zona. Cambia entre barras y tortas para leer el negocio de forma rapida.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setChartMode('barras')}
              className={`inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-2 text-xs font-semibold transition-colors ${
                chartMode === 'barras'
                  ? 'border-indigo-500 bg-indigo-600 text-white shadow-sm'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Barras
            </button>
            <button
              onClick={() => setChartMode('torta')}
              className={`inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-2 text-xs font-semibold transition-colors ${
                chartMode === 'torta'
                  ? 'border-indigo-500 bg-indigo-600 text-white shadow-sm'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <PieChart className="h-3.5 w-3.5" />
              Torta
            </button>
            <button
              onClick={resetFilters}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-100"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Limpiar filtros
            </button>
          </div>
        </div>

        <div className="relative mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Desde</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              max={dateTo || todayValue}
              className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-800 focus:outline-indigo-500"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Hasta</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              min={dateFrom || undefined}
              className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-800 focus:outline-indigo-500"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Chofer</label>
            <select
              value={driverId}
              onChange={(e) => setDriverId(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-800 focus:outline-indigo-500"
            >
              <option value="all">Todos los choferes</option>
              {drivers.map((driver) => (
                <option key={driver.id} value={driver.id}>
                  {driver.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Zona</label>
            <select
              value={zoneId}
              onChange={(e) => setZoneId(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-800 focus:outline-indigo-500"
            >
              <option value="all">Todas las zonas</option>
              {zones.map((zone) => (
                <option key={zone.id} value={zone.id}>
                  {zone.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Paradas filtradas"
          value={completedStops}
          description={`${filteredRoutes.length} hojas de ruta visibles`}
          icon={<Calendar className="h-5 w-5 text-slate-600" />}
          accent="text-slate-950"
        />
        <MetricCard
          title="Bultos dejados"
          value={totalDeliveries}
          description="Entregas reales en agencias"
          icon={<PackageOpen className="h-5 w-5 text-emerald-600" />}
          accent="text-emerald-700"
        />
        <MetricCard
          title="Bultos recolectados"
          value={totalCollections}
          description="Cargas retiradas por choferes"
          icon={<Truck className="h-5 w-5 text-indigo-600" />}
          accent="text-indigo-700"
        />
        <MetricCard
          title="Agencias activas"
          value={agencyStats.size}
          description="Con movimiento real en el rango"
          icon={<MapPin className="h-5 w-5 text-amber-600" />}
          accent="text-slate-950"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {chartMode === 'barras'
          ? renderBarPanel(
            'Agencias con mas recolecciones',
            'Ordenadas por bultos retirados por chofer en destino',
            <MapPin className="h-4 w-4 text-rose-500" />,
            agencyCollectionBars,
          )
          : renderPiePanel(
            'Agencias con mas recolecciones',
            'Participacion de las agencias segun bultos retirados',
            <MapPin className="h-4 w-4 text-rose-500" />,
            agencyCollectionPie,
          )}

        {chartMode === 'barras'
          ? renderBarPanel(
            'Agencias con mas bultos entregados',
            'Ordenadas por bultos entregados efectivamente',
            <Truck className="h-4 w-4 text-emerald-500" />,
            agencyDeliveryBars,
          )
          : renderPiePanel(
            'Agencias con mas bultos entregados',
            'Participacion de las agencias segun entregas reales',
            <Truck className="h-4 w-4 text-emerald-500" />,
            agencyDeliveryPie,
          )}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {chartMode === 'barras'
          ? renderBarPanel(
            'Choferes con mas movimientos',
            'Entregas + recolecciones registradas',
            <Users className="h-4 w-4 text-sky-500" />,
            driverBars,
          )
          : renderPiePanel(
            'Choferes con mas movimientos',
            'Participacion por chofer dentro del rango',
            <Users className="h-4 w-4 text-sky-500" />,
            driverPie,
          )}

        {chartMode === 'barras'
          ? renderBarPanel(
            'Zonas con mas movimiento',
            'Suma total por zona dentro del rango filtrado',
            <Filter className="h-4 w-4 text-amber-500" />,
            zoneBars,
          )
          : renderPiePanel(
            'Zonas con mas movimiento',
            'Participacion de cada zona dentro del rango',
            <Filter className="h-4 w-4 text-amber-500" />,
            zonePie,
          )}
      </div>
    </section>
  );
};
