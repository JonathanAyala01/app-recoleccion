import React, { useState } from 'react';
import { 
  Plus, Search, MapPin, Truck, Calendar, User, ArrowUp, ArrowDown, Trash2, 
  Layers, Check, ClipboardList, Info, Sparkles, Filter, Pencil, X
} from 'lucide-react';
import { Agency, Zone, Driver, RouteSheet, RouteStop } from '../types';

interface AdminPanelProps {
  agencies: Agency[];
  zones: Zone[];
  drivers: Driver[];
  routeSheets: RouteSheet[];
  onAddAgency: (agency: Agency) => void;
  onAddDriver: (driver: Driver) => void;
  onDeleteDriver: (driverId: string) => void;
  onUpdateDriver: (driver: Driver) => void;
  onAddZone: (zone: Zone) => void;
  onUpdateZone: (zone: Zone) => void;
  onDeleteZone: (zoneId: string) => void;
  onUpdateAgencyZone: (agencyId: string, zoneId: string) => void;
  onCreateRouteSheet: (routeSheet: RouteSheet) => void;
  onViewRouteDetails: (route: RouteSheet) => void;
  onDeleteRouteSheet: (routeId: string) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  agencies,
  zones,
  drivers,
  routeSheets,
  onAddAgency,
  onAddDriver,
  onDeleteDriver,
  onUpdateDriver,
  onAddZone,
  onUpdateZone,
  onDeleteZone,
  onUpdateAgencyZone,
  onCreateRouteSheet,
  onViewRouteDetails,
  onDeleteRouteSheet
}) => {
  // Navigation tabs within Admin Panel
  const [activeTab, setActiveTab] = useState<'routes' | 'agencies' | 'drivers' | 'zones'>('routes');
  
  // Search / Filters
  const [searchAgencyQuery, setSearchAgencyQuery] = useState('');
  const [filterAgencyZone, setFilterAgencyZone] = useState('all');
  const [searchDriverQuery, setSearchDriverQuery] = useState('');

  // Route Sheet Builder Form States
  const [isCreatingRoute, setIsCreatingRoute] = useState(false);
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [routeDate, setRouteDate] = useState(new Date().toISOString().split('T')[0]);
  const [initialKm, setInitialKm] = useState(10000);
  
  // Current stops inside the route currently being built
  const [builderStops, setBuilderStops] = useState<Omit<RouteStop, 'id'>[]>([]);
  
  // Form state for adding a single stop to the route builder
  const [newStopAgencyId, setNewStopAgencyId] = useState('');
  const [newStopScheduledTime, setNewStopScheduledTime] = useState('08:00');
  const [newStopDeliver, setNewStopDeliver] = useState(0);
  const [newStopCollect, setNewStopCollect] = useState(0);

  // Quick form for adding a new agency
  const [isAddingAgency, setIsAddingAgency] = useState(false);
  const [newAgencyCode, setNewAgencyCode] = useState('');
  const [newAgencyName, setNewAgencyName] = useState('');
  const [newAgencyAddress, setNewAgencyAddress] = useState('');
  const [newAgencyZoneId, setNewAgencyZoneId] = useState(zones[0]?.id || '');

  // Quick form for adding a new driver
  const [isAddingDriver, setIsAddingDriver] = useState(false);
  const [newDriverName, setNewDriverName] = useState('');
  const [newDriverLegajo, setNewDriverLegajo] = useState('');
  const [newDriverUnit, setNewDriverUnit] = useState('');
  const [newDriverPlate, setNewDriverPlate] = useState('');

  // Quick form for editing an existing driver
  const [editingDriverId, setEditingDriverId] = useState<string | null>(null);
  const [editDriverName, setEditDriverName] = useState('');
  const [editDriverLegajo, setEditDriverLegajo] = useState('');
  const [editDriverUnit, setEditDriverUnit] = useState('');
  const [editDriverPlate, setEditDriverPlate] = useState('');

  // Handle editing click pre-fill
  const handleStartEditDriver = (driver: Driver) => {
    setEditingDriverId(driver.id);
    setEditDriverName(driver.name);
    setEditDriverLegajo(driver.legajo);
    setEditDriverUnit(driver.internalUnit);
    setEditDriverPlate(driver.licensePlate);
    // Also close the add form if open
    setIsAddingDriver(false);
  };

  // Submit edited driver
  const handleSaveEditDriver = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDriverId || !editDriverName || !editDriverLegajo || !editDriverUnit || !editDriverPlate) return;

    const updatedDriver: Driver = {
      id: editingDriverId,
      name: editDriverName,
      legajo: editDriverLegajo,
      internalUnit: editDriverUnit,
      licensePlate: editDriverPlate
    };

    onUpdateDriver(updatedDriver);

    // Reset editing state
    setEditingDriverId(null);
    setEditDriverName('');
    setEditDriverLegajo('');
    setEditDriverUnit('');
    setEditDriverPlate('');
  };

  // Quick form for adding/editing zones
  const [isAddingZone, setIsAddingZone] = useState(false);
  const [newZoneName, setNewZoneName] = useState('');
  const [newZoneColor, setNewZoneColor] = useState('indigo');
  const [searchZoneQuery, setSearchZoneQuery] = useState('');

  const [editingZoneId, setEditingZoneId] = useState<string | null>(null);
  const [editZoneName, setEditZoneName] = useState('');
  const [editZoneColor, setEditZoneColor] = useState('indigo');

  const COLOR_PRESETS = [
    { value: 'indigo', label: 'Indigo / Azul', bg: 'bg-indigo-500', text: 'text-indigo-600' },
    { value: 'emerald', label: 'Esmeralda / Verde', bg: 'bg-emerald-500', text: 'text-emerald-600' },
    { value: 'amber', label: 'Ámbar / Naranja', bg: 'bg-amber-500', text: 'text-amber-600' },
    { value: 'rose', label: 'Rosa / Rojo', bg: 'bg-rose-500', text: 'text-rose-600' },
    { value: 'sky', label: 'Cielo / Celeste', bg: 'bg-sky-500', text: 'text-sky-600' },
    { value: 'violet', label: 'Violeta / Púrpura', bg: 'bg-violet-500', text: 'text-violet-600' },
    { value: 'orange', label: 'Naranja Vivo', bg: 'bg-orange-500', text: 'text-orange-600' },
    { value: 'slate', label: 'Pizarra / Gris', bg: 'bg-slate-500', text: 'text-slate-600' },
  ];

  const handleCreateZone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newZoneName) return;

    const newZone: Zone = {
      id: `zona-${Date.now()}`,
      name: newZoneName,
      color: newZoneColor
    };

    onAddZone(newZone);

    // Reset
    setNewZoneName('');
    setNewZoneColor('indigo');
    setIsAddingZone(false);
  };

  const handleStartEditZone = (zone: Zone) => {
    setEditingZoneId(zone.id);
    setEditZoneName(zone.name);
    setEditZoneColor(zone.color);
    setIsAddingZone(false);
  };

  const handleSaveEditZone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingZoneId || !editZoneName) return;

    const updatedZone: Zone = {
      id: editingZoneId,
      name: editZoneName,
      color: editZoneColor
    };

    onUpdateZone(updatedZone);

    // Reset
    setEditingZoneId(null);
    setEditZoneName('');
    setEditZoneColor('indigo');
  };

  // Helper to get Zone info
  const getZone = (zoneId: string) => zones.find(z => z.id === zoneId);

  const getZoneColorClasses = (color: string) => {
    switch (color) {
      case 'indigo': return { bg: 'bg-indigo-500', text: 'text-indigo-600', border: 'border-indigo-200', bgLight: 'bg-indigo-50/40', textLight: 'text-indigo-950' };
      case 'emerald': return { bg: 'bg-emerald-500', text: 'text-emerald-600', border: 'border-emerald-200', bgLight: 'bg-emerald-50/40', textLight: 'text-emerald-950' };
      case 'amber': return { bg: 'bg-amber-500', text: 'text-amber-600', border: 'border-amber-200', bgLight: 'bg-amber-50/40', textLight: 'text-amber-950' };
      case 'rose': return { bg: 'bg-rose-500', text: 'text-rose-600', border: 'border-rose-200', bgLight: 'bg-rose-50/40', textLight: 'text-rose-950' };
      case 'sky': return { bg: 'bg-sky-500', text: 'text-sky-600', border: 'border-sky-200', bgLight: 'bg-sky-50/40', textLight: 'text-sky-950' };
      case 'violet': return { bg: 'bg-violet-500', text: 'text-violet-600', border: 'border-violet-200', bgLight: 'bg-violet-50/40', textLight: 'text-violet-950' };
      case 'orange': return { bg: 'bg-orange-500', text: 'text-orange-600', border: 'border-orange-200', bgLight: 'bg-orange-50/40', textLight: 'text-orange-950' };
      case 'slate': return { bg: 'bg-slate-500', text: 'text-slate-600', border: 'border-slate-200', bgLight: 'bg-slate-50/40', textLight: 'text-slate-950' };
      default: return { bg: 'bg-slate-500', text: 'text-slate-600', border: 'border-slate-200', bgLight: 'bg-slate-50/40', textLight: 'text-slate-950' };
    }
  };

  // Handle adding a stop to our builder list
  const handleAddStopToBuilder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStopAgencyId) return;

    // Check if agency is already in current stops
    if (builderStops.some(s => s.agencyId === newStopAgencyId)) {
      alert("Esta agencia ya está agregada en el itinerario de esta hoja de ruta.");
      return;
    }

    const newStop: Omit<RouteStop, 'id'> = {
      agencyId: newStopAgencyId,
      sequence: builderStops.length + 1,
      scheduledTime: newStopScheduledTime,
      packagesToDeliver: Number(newStopDeliver),
      packagesToCollect: Number(newStopCollect),
      status: 'pending'
    };

    setBuilderStops([...builderStops, newStop]);
    
    // Reset individual stop inputs
    setNewStopAgencyId('');
    setNewStopDeliver(0);
    setNewStopCollect(0);
    
    // Auto increment hour by 30 mins for convenience
    const [h, m] = newStopScheduledTime.split(':').map(Number);
    let newM = m + 45;
    let newH = h;
    if (newM >= 60) {
      newH = (h + 1) % 24;
      newM = newM - 60;
    }
    setNewStopScheduledTime(`${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`);
  };

  const moveStop = (index: number, direction: 'up' | 'down') => {
    const newList = [...builderStops];
    if (direction === 'up' && index > 0) {
      const temp = newList[index];
      newList[index] = newList[index - 1];
      newList[index - 1] = temp;
    } else if (direction === 'down' && index < newList.length - 1) {
      const temp = newList[index];
      newList[index] = newList[index + 1];
      newList[index + 1] = temp;
    }
    // Re-calculate sequence numbers
    newList.forEach((stop, i) => {
      stop.sequence = i + 1;
    });
    setBuilderStops(newList);
  };

  const removeStop = (index: number) => {
    const newList = builderStops.filter((_, i) => i !== index);
    newList.forEach((stop, i) => {
      stop.sequence = i + 1;
    });
    setBuilderStops(newList);
  };

  // Submit complete Route Sheet
  const handleSaveRouteSheet = () => {
    if (!selectedDriverId) {
      alert("Por favor seleccione un chofer.");
      return;
    }
    if (builderStops.length === 0) {
      alert("Debe agregar al menos una parada a la hoja de ruta.");
      return;
    }

    const driver = drivers.find(d => d.id === selectedDriverId);
    if (!driver) return;

    // Map builder stops with unique IDs
    const finalStops: RouteStop[] = builderStops.map((stop, index) => ({
      ...stop,
      id: `stp-${Date.now()}-${index}`
    }));

    const newRouteSheet: RouteSheet = {
      id: `HR-${Math.floor(1000 + Math.random() * 9000)}`,
      date: routeDate,
      driverId: driver.id,
      driverName: driver.name,
      legajo: driver.legajo,
      internalUnit: driver.internalUnit,
      licensePlate: driver.licensePlate,
      initialKm: Number(initialKm),
      stops: finalStops,
      status: 'assigned',
      createdAt: new Date().toLocaleDateString('es-AR')
    };

    onCreateRouteSheet(newRouteSheet);
    
    // Clear Builder States
    setIsCreatingRoute(false);
    setSelectedDriverId('');
    setBuilderStops([]);
  };

  // Create new Agency
  const handleCreateAgency = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAgencyCode || !newAgencyName || !newAgencyAddress || !newAgencyZoneId) return;

    const newAgency: Agency = {
      id: `age-${Date.now()}`,
      code: newAgencyCode,
      name: newAgencyName,
      address: newAgencyAddress,
      zoneId: newAgencyZoneId
    };

    onAddAgency(newAgency);
    
    // Reset
    setNewAgencyCode('');
    setNewAgencyName('');
    setNewAgencyAddress('');
    setIsAddingAgency(false);
  };

  // Create new Driver
  const handleCreateDriver = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDriverName || !newDriverLegajo || !newDriverUnit || !newDriverPlate) return;

    const newDriver: Driver = {
      id: `drv-${Date.now()}`,
      name: newDriverName,
      legajo: newDriverLegajo,
      internalUnit: newDriverUnit,
      licensePlate: newDriverPlate
    };

    onAddDriver(newDriver);

    // Reset
    setNewDriverName('');
    setNewDriverLegajo('');
    setNewDriverUnit('');
    setNewDriverPlate('');
    setIsAddingDriver(false);
  };

  // Filter lists
  const filteredAgencies = agencies.filter(agency => {
    const matchesSearch = agency.name.toLowerCase().includes(searchAgencyQuery.toLowerCase()) || 
                          agency.code.includes(searchAgencyQuery) ||
                          agency.address.toLowerCase().includes(searchAgencyQuery.toLowerCase());
    const matchesZone = filterAgencyZone === 'all' || agency.zoneId === filterAgencyZone;
    return matchesSearch && matchesZone;
  });

  const filteredDrivers = drivers.filter(driver => 
    driver.name.toLowerCase().includes(searchDriverQuery.toLowerCase()) || 
    driver.legajo.toLowerCase().includes(searchDriverQuery.toLowerCase()) ||
    driver.internalUnit.toLowerCase().includes(searchDriverQuery.toLowerCase())
  );

  const filteredZones = zones.filter(zone =>
    zone.name.toLowerCase().includes(searchZoneQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Navigation and Actions Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-slate-200">
        <div className="flex flex-wrap bg-slate-100 p-1 rounded-lg gap-0.5">
          <button
            onClick={() => { setActiveTab('routes'); setIsCreatingRoute(false); }}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'routes' 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ClipboardList className="w-3.5 h-3.5" />
            Hojas de Ruta
          </button>
          <button
            onClick={() => setActiveTab('agencies')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'agencies' 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Base de Agencias
          </button>
          <button
            onClick={() => setActiveTab('drivers')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'drivers' 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            Choferes
          </button>
          <button
            onClick={() => setActiveTab('zones')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'zones' 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            Zonas de Reparto
          </button>
        </div>

        {activeTab === 'routes' && !isCreatingRoute && (
          <button
            onClick={() => setIsCreatingRoute(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2.5 rounded-lg shadow-sm hover:shadow transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Crear Hoja de Ruta
          </button>
        )}
        
        {activeTab === 'agencies' && (
          <button
            onClick={() => setIsAddingAgency(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2.5 rounded-lg shadow-sm hover:shadow transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Cargar Agencia
          </button>
        )}

        {activeTab === 'drivers' && (
          <button
            onClick={() => setIsAddingDriver(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2.5 rounded-lg shadow-sm hover:shadow transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Registrar Chofer
          </button>
        )}

        {activeTab === 'zones' && (
          <button
            onClick={() => setIsAddingZone(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2.5 rounded-lg shadow-sm hover:shadow transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Nueva Zona
          </button>
        )}
      </div>

      {/* ======================= TAB 1: ROUTES MANAGEMENT ======================= */}
      {activeTab === 'routes' && (
        <div className="space-y-6">
          
          {/* HOJA DE RUTA CREATION FORM */}
          {isCreatingRoute ? (
            <div className="bg-white border border-indigo-100 rounded-2xl shadow-sm overflow-hidden animate-in fade-in duration-200">
              <div className="bg-indigo-50 border-b border-indigo-100 px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-sm font-bold text-slate-950">Planificador de Hoja de Ruta Logística</h3>
                </div>
                <button
                  onClick={() => setIsCreatingRoute(false)}
                  className="text-xs text-slate-500 hover:text-slate-800 font-medium px-2 py-1 rounded hover:bg-indigo-100/50"
                >
                  Cancelar
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Driver, Date & KM */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="flex flex-col">
                    <label className="text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-400" /> Chofer Asignado
                    </label>
                    <select
                      value={selectedDriverId}
                      onChange={(e) => setSelectedDriverId(e.target.value)}
                      className="text-xs border border-slate-200 rounded-lg p-2.5 bg-slate-50 focus:bg-white focus:outline-indigo-500 text-slate-800"
                    >
                      <option value="">-- Seleccionar Chofer --</option>
                      {drivers.map(d => (
                        <option key={d.id} value={d.id}>
                          {d.name} ({d.legajo} | {d.internalUnit})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col">
                    <label className="text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" /> Fecha del Reparto
                    </label>
                    <input
                      type="date"
                      value={routeDate}
                      onChange={(e) => setRouteDate(e.target.value)}
                      className="text-xs border border-slate-200 rounded-lg p-2.5 bg-slate-50 focus:bg-white focus:outline-indigo-500 text-slate-800 font-mono"
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5 text-slate-400" /> Km Inicial (Odómetro)
                    </label>
                    <input
                      type="number"
                      value={initialKm}
                      onChange={(e) => setInitialKm(Number(e.target.value))}
                      className="text-xs border border-slate-200 rounded-lg p-2.5 bg-slate-50 focus:bg-white focus:outline-indigo-500 text-slate-800 font-mono"
                    />
                  </div>
                </div>

                {/* ⚡ Carga Masiva por Zona */}
                <div className="border border-indigo-100 bg-indigo-50/40 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <span className="text-xs font-bold text-indigo-950 flex items-center gap-1.5 uppercase tracking-wide">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> Carga Rápida Completa por Zona
                    </span>
                    <p className="text-[10px] text-indigo-700 mt-0.5 leading-relaxed">
                      Seleccione una zona para agregar de forma automática todas sus agencias asociadas como paradas de esta hoja de ruta.
                    </p>
                  </div>
                  <div>
                    <select
                      onChange={(e) => {
                        const zoneId = e.target.value;
                        if (!zoneId) return;

                        const zoneAgencies = agencies.filter(a => a.zoneId === zoneId);
                        if (zoneAgencies.length === 0) {
                          alert("No hay agencias asignadas a esta zona.");
                          e.target.value = '';
                          return;
                        }

                        const existingAgencyIds = new Set(builderStops.map(s => s.agencyId));
                        const agenciesToAdd = zoneAgencies.filter(a => !existingAgencyIds.has(a.id));

                        if (agenciesToAdd.length === 0) {
                          alert("Todas las agencias de esta zona ya están en la hoja de ruta.");
                          e.target.value = '';
                          return;
                        }

                        // Start sequential time estimation
                        let lastTime = newStopScheduledTime;
                        if (builderStops.length > 0) {
                          lastTime = builderStops[builderStops.length - 1].scheduledTime;
                        }

                        const newStops = agenciesToAdd.map((agency, idx) => {
                          const [h, m] = lastTime.split(':').map(Number);
                          let totalMins = h * 60 + m + (idx + 1) * 30;
                          let finalH = Math.floor(totalMins / 60) % 24;
                          let finalM = totalMins % 60;
                          const scheduledTime = `${String(finalH).padStart(2, '0')}:${String(finalM).padStart(2, '0')}`;

                          return {
                            agencyId: agency.id,
                            sequence: builderStops.length + idx + 1,
                            scheduledTime: scheduledTime,
                            packagesToDeliver: 0,
                            packagesToCollect: 0,
                            status: 'pending' as const
                          };
                        });

                        setBuilderStops([...builderStops, ...newStops]);
                        e.target.value = '';
                      }}
                      className="text-xs border border-indigo-200 rounded-lg p-2 bg-white text-slate-800 focus:outline-indigo-500 font-semibold cursor-pointer min-w-[200px]"
                    >
                      <option value="">-- Seleccionar Zona --</option>
                      {zones.map(z => {
                        const count = agencies.filter(a => a.zoneId === z.id).length;
                        return (
                          <option key={z.id} value={z.id}>
                            {z.name} ({count} agencias)
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>

                {/* Sub-form: Add Stops to the route */}
                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/70">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                    Agregar Paradas / Agencias al Itinerario
                  </h4>
                  
                  <form onSubmit={handleAddStopToBuilder} className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 items-end">
                    <div className="sm:col-span-5 flex flex-col">
                      <label className="text-[11px] font-semibold text-slate-600 mb-1">Agencia (Destino/Retiro)</label>
                      <select
                        value={newStopAgencyId}
                        onChange={(e) => setNewStopAgencyId(e.target.value)}
                        className="text-xs border border-slate-200 rounded-lg p-2 bg-white focus:outline-indigo-500 text-slate-800"
                        required
                      >
                        <option value="">-- Buscar / Elegir Agencia --</option>
                        {agencies.map(a => {
                          const zone = getZone(a.zoneId);
                          return (
                            <option key={a.id} value={a.id}>
                              ({a.code}) {a.name} — {zone?.name || 'Sin Zona'}
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    <div className="sm:col-span-2 flex flex-col">
                      <label className="text-[11px] font-semibold text-slate-600 mb-1">Hora Estimada</label>
                      <input
                        type="time"
                        value={newStopScheduledTime}
                        onChange={(e) => setNewStopScheduledTime(e.target.value)}
                        className="text-xs border border-slate-200 rounded-lg p-2 bg-white focus:outline-indigo-500 text-slate-800 font-mono"
                        required
                      />
                    </div>

                    <div className="sm:col-span-2 flex flex-col">
                      <label className="text-[11px] font-semibold text-slate-600 mb-1">Bultos a Entregar</label>
                      <input
                        type="number"
                        min="0"
                        value={newStopDeliver}
                        onChange={(e) => setNewStopDeliver(Number(e.target.value))}
                        className="text-xs border border-slate-200 rounded-lg p-2 bg-white focus:outline-indigo-500 text-slate-800 font-mono"
                      />
                    </div>

                    <div className="sm:col-span-2 flex flex-col">
                      <label className="text-[11px] font-semibold text-slate-600 mb-1">Bultos a Recolectar</label>
                      <input
                        type="number"
                        min="0"
                        value={newStopCollect}
                        onChange={(e) => setNewStopCollect(Number(e.target.value))}
                        className="text-xs border border-slate-200 rounded-lg p-2 bg-white focus:outline-indigo-500 text-slate-800 font-mono"
                      />
                    </div>

                    <div className="sm:col-span-1">
                      <button
                        type="submit"
                        className="w-full bg-slate-900 hover:bg-slate-850 text-white font-bold p-2 rounded-lg text-xs transition-colors flex items-center justify-center cursor-pointer"
                        title="Agregar parada"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </form>
                </div>

                {/* Live Sequence Stops Preview */}
                <div>
                  <h4 className="text-xs font-semibold text-slate-700 mb-2.5 flex items-center gap-1">
                    Itinerario de Paradas Planificadas ({builderStops.length})
                  </h4>

                  {builderStops.length === 0 ? (
                    <div className="border border-dashed border-slate-200 rounded-xl p-8 text-center text-slate-400 text-xs">
                      Ninguna agencia agregada a la hoja de ruta todavía. Use el panel de arriba para armar el recorrido.
                    </div>
                  ) : (
                    <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs bg-white">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[11px] font-semibold">
                            <th className="p-3 w-12 text-center">Orden</th>
                            <th className="p-3">Agencia</th>
                            <th className="p-3">Dirección</th>
                            <th className="p-3 text-center w-24">Hora Est.</th>
                            <th className="p-3 text-center w-28">Bultos p/Entrega</th>
                            <th className="p-3 text-center w-28">Bultos Recol.</th>
                            <th className="p-3 text-center w-28">Acciones</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs">
                          {builderStops.map((stop, idx) => {
                            const agency = agencies.find(a => a.id === stop.agencyId);
                            return (
                              <tr key={stop.agencyId} className="hover:bg-slate-50/50">
                                <td className="p-3 text-center font-bold text-indigo-600 font-mono">
                                  {idx + 1}
                                </td>
                                <td className="p-3 font-medium text-slate-900">
                                  <span className="text-[10px] bg-slate-100 text-slate-600 font-mono px-1 py-0.5 rounded mr-1">
                                    {agency?.code}
                                  </span>
                                  {agency?.name}
                                </td>
                                <td className="p-3 text-slate-500 truncate max-w-xs">{agency?.address}</td>
                                <td className="p-3 text-center">
                                  <input
                                    type="time"
                                    value={stop.scheduledTime}
                                    onChange={(e) => {
                                      const updated = [...builderStops];
                                      updated[idx].scheduledTime = e.target.value;
                                      setBuilderStops(updated);
                                    }}
                                    className="text-xs border border-slate-200 rounded p-1 bg-white focus:outline-indigo-500 text-slate-800 font-mono w-20 text-center"
                                  />
                                </td>
                                <td className="p-3 text-center">
                                  <input
                                    type="number"
                                    min="0"
                                    value={stop.packagesToDeliver}
                                    onChange={(e) => {
                                      const updated = [...builderStops];
                                      updated[idx].packagesToDeliver = Number(e.target.value);
                                      setBuilderStops(updated);
                                    }}
                                    className="text-xs border border-slate-200 rounded p-1 bg-white focus:outline-indigo-500 text-slate-800 font-mono w-16 text-center"
                                  />
                                </td>
                                <td className="p-3 text-center">
                                  <input
                                    type="number"
                                    min="0"
                                    value={stop.packagesToCollect}
                                    onChange={(e) => {
                                      const updated = [...builderStops];
                                      updated[idx].packagesToCollect = Number(e.target.value);
                                      setBuilderStops(updated);
                                    }}
                                    className="text-xs border border-slate-200 rounded p-1 bg-white focus:outline-indigo-500 text-slate-800 font-mono w-16 text-center"
                                  />
                                </td>
                                <td className="p-3">
                                  <div className="flex items-center justify-center gap-1.5">
                                    <button
                                      type="button"
                                      disabled={idx === 0}
                                      onClick={() => moveStop(idx, 'up')}
                                      className="p-1 hover:bg-slate-100 text-slate-500 hover:text-slate-900 disabled:opacity-30 rounded transition-colors"
                                    >
                                      <ArrowUp className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      disabled={idx === builderStops.length - 1}
                                      onClick={() => moveStop(idx, 'down')}
                                      className="p-1 hover:bg-slate-100 text-slate-500 hover:text-slate-900 disabled:opacity-30 rounded transition-colors"
                                    >
                                      <ArrowDown className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => removeStop(idx)}
                                      className="p-1 hover:bg-rose-50 text-slate-500 hover:text-rose-600 rounded transition-colors"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Submit row */}
                <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
                  <button
                    onClick={() => setIsCreatingRoute(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
                  >
                    Volver a la lista
                  </button>
                  <button
                    onClick={handleSaveRouteSheet}
                    disabled={!selectedDriverId || builderStops.length === 0}
                    className={`px-5 py-2 text-xs font-bold rounded-lg shadow-sm transition-all ${
                      selectedDriverId && builderStops.length > 0
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    Asignar Hoja de Ruta
                  </button>
                </div>
              </div>
            </div>
          ) : (
            
            // ROUTE SHEETS LIST
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Planificaciones Activas e Historial</h3>
                <span className="text-xs text-slate-500 font-mono">Hojas de Ruta Totales: {routeSheets.length}</span>
              </div>

              {routeSheets.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400 text-sm shadow-xs">
                  <ClipboardList className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                  No hay hojas de ruta cargadas todavía. Haga clic en <strong className="text-slate-700">"Crear Hoja de Ruta"</strong> para iniciar.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {routeSheets.map(route => {
                    const totalDeliver = route.stops.reduce((sum, s) => sum + s.packagesToDeliver, 0);
                    const totalCollect = route.stops.reduce((sum, s) => sum + s.packagesToCollect, 0);
                    const completedStops = route.stops.filter(s => s.status !== 'pending').length;
                    
                    return (
                      <div 
                        key={route.id}
                        className="bg-white border border-slate-250 hover:border-slate-300 rounded-2xl p-5 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <span className="text-xs font-semibold text-slate-500 font-mono">{route.id}</span>
                              <h4 className="text-sm font-bold text-slate-900 mt-0.5">{route.driverName}</h4>
                            </div>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              route.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                              route.status === 'en_route' ? 'bg-indigo-150 text-indigo-900' :
                              route.status === 'loading' ? 'bg-amber-100 text-amber-800' :
                              'bg-slate-100 text-slate-700'
                            }`}>
                              {route.status === 'completed' ? 'Completado' :
                               route.status === 'en_route' ? 'En viaje' :
                               route.status === 'loading' ? 'Cargando' :
                               'Asignado'}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs font-mono border-t border-b border-slate-100 py-3 mb-4 bg-slate-50/55 rounded-lg px-3">
                            <div className="text-slate-500 flex items-center gap-1">
                              Fecha: <strong className="text-slate-700">{route.date}</strong>
                            </div>
                            <div className="text-slate-500 flex items-center gap-1">
                              Interno: <strong className="text-slate-700">{route.internalUnit}</strong>
                            </div>
                            <div className="text-slate-500 flex items-center gap-1">
                              Km Inicial: <strong className="text-slate-700">{route.initialKm}</strong>
                            </div>
                            <div className="text-slate-500 flex items-center gap-1">
                              Km Final: <strong className="text-slate-700">{route.finalKm || '—'}</strong>
                            </div>
                          </div>

                          <div className="text-xs space-y-1.5 mb-4">
                            <div className="flex justify-between">
                              <span className="text-slate-500">Paradas/Agencias:</span>
                              <span className="font-semibold text-slate-800">{completedStops} / {route.stops.length} completadas</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Total Bultos Previstos:</span>
                              <span className="font-semibold text-slate-800">
                                {totalDeliver} Entrega | {totalCollect} Recolección
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-between items-center gap-2 border-t border-slate-100 pt-3.5 mt-auto">
                          <button
                            onClick={() => onDeleteRouteSheet(route.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-100"
                            title="Eliminar hoja de ruta"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => onViewRouteDetails(route)}
                            className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-4 py-2 rounded-lg transition-colors cursor-pointer"
                          >
                            Ver Hoja Digital (Firmas)
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>
      )}

      {/* ======================= TAB 2: AGENCIES BASE ======================= */}
      {activeTab === 'agencies' && (
        <div className="space-y-4">
          
          {/* SEARCH & FILTER CONTROLS */}
          <div className="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-xl border border-slate-200">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar agencia por código, nombre o dirección..."
                value={searchAgencyQuery}
                onChange={(e) => setSearchAgencyQuery(e.target.value)}
                className="pl-9 pr-4 py-2 w-full text-xs border border-slate-200 rounded-lg focus:outline-indigo-500 text-slate-800"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="h-3.5 w-3.5 text-slate-400" />
              <select
                value={filterAgencyZone}
                onChange={(e) => setFilterAgencyZone(e.target.value)}
                className="text-xs border border-slate-200 rounded-lg p-2 bg-white focus:outline-indigo-500 text-slate-700 font-medium"
              >
                <option value="all">Todas las Zonas</option>
                {zones.map(z => (
                  <option key={z.id} value={z.id}>{z.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* ADD AGENCY DIALOG (MODAL-LIKE INLINE) */}
          {isAddingAgency && (
            <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-5 animate-in slide-in-from-top duration-150">
              <h3 className="text-xs font-bold text-indigo-950 uppercase tracking-wider mb-4 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> Cargar Nueva Agencia en Base
              </h3>
              <form onSubmit={handleCreateAgency} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
                <div className="flex flex-col">
                  <label className="text-[10px] font-semibold text-slate-600 mb-1">Código Único (e.g. 2593)</label>
                  <input
                    type="text"
                    required
                    value={newAgencyCode}
                    onChange={(e) => setNewAgencyCode(e.target.value)}
                    placeholder="2593"
                    className="text-xs border border-slate-200 rounded-lg p-2 bg-white focus:outline-indigo-500 text-slate-800 font-mono"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-[10px] font-semibold text-slate-600 mb-1">Nombre / Identificación</label>
                  <input
                    type="text"
                    required
                    value={newAgencyName}
                    onChange={(e) => setNewAgencyName(e.target.value)}
                    placeholder="Pque. Chacabuco - Roma Cargas"
                    className="text-xs border border-slate-200 rounded-lg p-2 bg-white focus:outline-indigo-500 text-slate-800"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-[10px] font-semibold text-slate-600 mb-1">Dirección Completa</label>
                  <input
                    type="text"
                    required
                    value={newAgencyAddress}
                    onChange={(e) => setNewAgencyAddress(e.target.value)}
                    placeholder="Pumacahua 1690"
                    className="text-xs border border-slate-200 rounded-lg p-2 bg-white focus:outline-indigo-500 text-slate-800"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-[10px] font-semibold text-slate-600 mb-1">Zona Correspondiente</label>
                  <select
                    value={newAgencyZoneId}
                    onChange={(e) => setNewAgencyZoneId(e.target.value)}
                    className="text-xs border border-slate-200 rounded-lg p-2 bg-white focus:outline-indigo-500 text-slate-800"
                  >
                    {zones.map(z => (
                      <option key={z.id} value={z.id}>{z.name}</option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-4 flex justify-end gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingAgency(false)}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-white rounded-lg transition-colors border border-transparent"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-1.5 rounded-lg shadow transition-colors cursor-pointer"
                  >
                    Guardar Agencia
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* AGENCIES LIST TABLE */}
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs bg-white">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs font-semibold">
                  <th className="py-3 px-4 w-20 font-mono">Código</th>
                  <th className="py-3 px-4">Nombre de la Agencia</th>
                  <th className="py-3 px-4">Dirección</th>
                  <th className="py-3 px-4 w-52">Zona Asignada</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredAgencies.map(agency => {
                  const currentZone = getZone(agency.zoneId);
                  return (
                    <tr key={agency.id} className="hover:bg-slate-50/45 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                        {agency.code}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        {agency.name}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {agency.address}
                      </td>
                      <td className="py-3.5 px-4">
                        <select
                          value={agency.zoneId}
                          onChange={(e) => onUpdateAgencyZone(agency.id, e.target.value)}
                          className="text-xs border border-slate-200 rounded-md p-1.5 bg-slate-50 focus:bg-white focus:outline-indigo-500 text-slate-800 font-medium"
                        >
                          {zones.map(z => (
                            <option key={z.id} value={z.id}>
                              {z.name}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredAgencies.length === 0 && (
              <div className="p-8 text-center text-slate-400 text-xs">
                No se encontraron agencias que coincidan con la búsqueda.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================= TAB 3: DRIVERS BASE ======================= */}
      {activeTab === 'drivers' && (
        <div className="space-y-4">
          
          {/* SEARCH CONTROLS */}
          <div className="flex bg-white p-4 rounded-xl border border-slate-200">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar chofer por nombre, legajo o interno..."
                value={searchDriverQuery}
                onChange={(e) => setSearchDriverQuery(e.target.value)}
                className="pl-9 pr-4 py-2 w-full text-xs border border-slate-200 rounded-lg focus:outline-indigo-500 text-slate-800"
              />
            </div>
          </div>

          {/* ADD DRIVER DIALOG (MODAL-LIKE INLINE) */}
          {isAddingDriver && (
            <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-5 animate-in slide-in-from-top duration-150">
              <h3 className="text-xs font-bold text-indigo-950 uppercase tracking-wider mb-4 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> Registrar Chofer en Sistema
              </h3>
              <form onSubmit={handleCreateDriver} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
                <div className="flex flex-col">
                  <label className="text-[10px] font-semibold text-slate-600 mb-1">Nombre Completo</label>
                  <input
                    type="text"
                    required
                    value={newDriverName}
                    onChange={(e) => setNewDriverName(e.target.value)}
                    placeholder="Esteban González"
                    className="text-xs border border-slate-200 rounded-lg p-2 bg-white focus:outline-indigo-500 text-slate-800"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-[10px] font-semibold text-slate-600 mb-1">Legajo (ID de Empleado)</label>
                  <input
                    type="text"
                    required
                    value={newDriverLegajo}
                    onChange={(e) => setNewDriverLegajo(e.target.value)}
                    placeholder="L-1250"
                    className="text-xs border border-slate-200 rounded-lg p-2 bg-white focus:outline-indigo-500 text-slate-800 font-mono"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-[10px] font-semibold text-slate-600 mb-1">N° de Interno (Camión/Vehículo)</label>
                  <input
                    type="text"
                    required
                    value={newDriverUnit}
                    onChange={(e) => setNewDriverUnit(e.target.value)}
                    placeholder="U-205"
                    className="text-xs border border-slate-200 rounded-lg p-2 bg-white focus:outline-indigo-500 text-slate-800 font-mono"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-[10px] font-semibold text-slate-600 mb-1">Patente / Matrícula</label>
                  <input
                    type="text"
                    required
                    value={newDriverPlate}
                    onChange={(e) => setNewDriverPlate(e.target.value)}
                    placeholder="AF-120-PO"
                    className="text-xs border border-slate-200 rounded-lg p-2 bg-white focus:outline-indigo-500 text-slate-800 font-mono"
                  />
                </div>
                <div className="sm:col-span-4 flex justify-end gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingDriver(false)}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-white rounded-lg transition-colors border border-transparent"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-1.5 rounded-lg shadow transition-colors cursor-pointer"
                  >
                    Guardar Chofer
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* EDIT DRIVER DIALOG (MODAL-LIKE INLINE) */}
          {editingDriverId && (
            <div className="bg-amber-50/50 border border-amber-200 rounded-xl p-5 animate-in slide-in-from-top duration-150">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xs font-bold text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                  <Pencil className="w-3.5 h-3.5 text-amber-600" /> Modificar Datos del Chofer
                </h3>
                <button
                  type="button"
                  onClick={() => setEditingDriverId(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <form onSubmit={handleSaveEditDriver} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
                <div className="flex flex-col">
                  <label className="text-[10px] font-semibold text-slate-600 mb-1">Nombre Completo</label>
                  <input
                    type="text"
                    required
                    value={editDriverName}
                    onChange={(e) => setEditDriverName(e.target.value)}
                    placeholder="Esteban González"
                    className="text-xs border border-slate-200 rounded-lg p-2 bg-white focus:outline-amber-500 text-slate-800"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-[10px] font-semibold text-slate-600 mb-1">Legajo (ID de Empleado)</label>
                  <input
                    type="text"
                    required
                    value={editDriverLegajo}
                    onChange={(e) => setEditDriverLegajo(e.target.value)}
                    placeholder="L-1250"
                    className="text-xs border border-slate-200 rounded-lg p-2 bg-white focus:outline-amber-500 text-slate-800 font-mono"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-[10px] font-semibold text-slate-600 mb-1">N° de Interno (Camión/Vehículo)</label>
                  <input
                    type="text"
                    required
                    value={editDriverUnit}
                    onChange={(e) => setEditDriverUnit(e.target.value)}
                    placeholder="U-205"
                    className="text-xs border border-slate-200 rounded-lg p-2 bg-white focus:outline-amber-500 text-slate-800 font-mono"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-[10px] font-semibold text-slate-600 mb-1">Patente / Matrícula</label>
                  <input
                    type="text"
                    required
                    value={editDriverPlate}
                    onChange={(e) => setEditDriverPlate(e.target.value)}
                    placeholder="AF-120-PO"
                    className="text-xs border border-slate-200 rounded-lg p-2 bg-white focus:outline-amber-500 text-slate-800 font-mono"
                  />
                </div>
                <div className="sm:col-span-4 flex justify-end gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setEditingDriverId(null)}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-white rounded-lg transition-colors border border-transparent"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-4 py-1.5 rounded-lg shadow transition-colors cursor-pointer"
                  >
                    Guardar Cambios
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* DRIVERS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredDrivers.map(driver => (
              <div 
                key={driver.id} 
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:shadow-sm transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-indigo-50 text-indigo-600 flex items-center justify-center rounded-xl">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{driver.name}</h4>
                    <div className="text-xs text-slate-500 font-mono mt-0.5">
                      Legajo: <strong className="text-slate-700">{driver.legajo}</strong>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right text-xs font-mono bg-slate-50 border border-slate-100 rounded-xl px-4 py-2">
                    <div className="text-slate-500">
                      Interno: <strong className="text-slate-800">{driver.internalUnit}</strong>
                    </div>
                    <div className="text-slate-400 text-[10px] mt-0.5">
                      Patente: <strong className="text-slate-700">{driver.licensePlate}</strong>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <button
                      onClick={() => handleStartEditDriver(driver)}
                      className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors border border-transparent hover:border-amber-100"
                      title="Modificar Chofer"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteDriver(driver.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-100"
                      title="Dar de Baja"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {filteredDrivers.length === 0 && (
              <div className="col-span-2 p-8 text-center text-slate-400 text-xs">
                No se encontraron choferes registrados con esa descripción.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================= TAB 4: ZONES MANAGEMENT ======================= */}
      {activeTab === 'zones' && (
        <div className="space-y-4">
          
          {/* SEARCH CONTROLS */}
          <div className="flex bg-white p-4 rounded-xl border border-slate-200">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar zona por nombre..."
                value={searchZoneQuery}
                onChange={(e) => setSearchZoneQuery(e.target.value)}
                className="pl-9 pr-4 py-2 w-full text-xs border border-slate-200 rounded-lg focus:outline-indigo-500 text-slate-800"
              />
            </div>
          </div>

          {/* ADD ZONE FORM (INLINE BOX) */}
          {isAddingZone && (
            <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-5 animate-in slide-in-from-top duration-150">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xs font-bold text-indigo-950 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> Crear Nueva Zona de Reparto
                </h3>
                <button
                  type="button"
                  onClick={() => setIsAddingZone(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <form onSubmit={handleCreateZone} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                <div className="flex flex-col">
                  <label className="text-[10px] font-semibold text-slate-600 mb-1">Nombre de la Zona</label>
                  <input
                    type="text"
                    required
                    value={newZoneName}
                    onChange={(e) => setNewZoneName(e.target.value)}
                    placeholder="Zona Oeste - San Justo"
                    className="text-xs border border-slate-200 rounded-lg p-2 bg-white focus:outline-indigo-500 text-slate-800"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-[10px] font-semibold text-slate-600 mb-1">Color Identificador</label>
                  <select
                    value={newZoneColor}
                    onChange={(e) => setNewZoneColor(e.target.value)}
                    className="text-xs border border-slate-200 rounded-lg p-2 bg-white focus:outline-indigo-500 text-slate-800 font-medium"
                  >
                    {COLOR_PRESETS.map(preset => (
                      <option key={preset.value} value={preset.value}>
                        {preset.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingZone(false)}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-white rounded-lg transition-colors border border-transparent"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-1.5 rounded-lg shadow transition-colors cursor-pointer"
                  >
                    Guardar Zona
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* EDIT ZONE FORM (INLINE BOX) */}
          {editingZoneId && (
            <div className="bg-amber-50/50 border border-amber-200 rounded-xl p-5 animate-in slide-in-from-top duration-150">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xs font-bold text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                  <Pencil className="w-3.5 h-3.5 text-amber-600" /> Modificar Datos de la Zona
                </h3>
                <button
                  type="button"
                  onClick={() => setEditingZoneId(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <form onSubmit={handleSaveEditZone} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                <div className="flex flex-col">
                  <label className="text-[10px] font-semibold text-slate-600 mb-1">Nombre de la Zona</label>
                  <input
                    type="text"
                    required
                    value={editZoneName}
                    onChange={(e) => setEditZoneName(e.target.value)}
                    className="text-xs border border-slate-200 rounded-lg p-2 bg-white focus:outline-amber-500 text-slate-800"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-[10px] font-semibold text-slate-600 mb-1">Color Identificador</label>
                  <select
                    value={editZoneColor}
                    onChange={(e) => setEditZoneColor(e.target.value)}
                    className="text-xs border border-slate-200 rounded-lg p-2 bg-white focus:outline-amber-500 text-slate-800 font-medium"
                  >
                    {COLOR_PRESETS.map(preset => (
                      <option key={preset.value} value={preset.value}>
                        {preset.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingZoneId(null)}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-white rounded-lg transition-colors border border-transparent"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-4 py-1.5 rounded-lg shadow transition-colors cursor-pointer"
                  >
                    Guardar Cambios
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ZONES GRID LIST */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredZones.map(zone => {
              const zoneAgencies = agencies.filter(a => a.zoneId === zone.id);
              const agencyCount = zoneAgencies.length;
              const colorInfo = getZoneColorClasses(zone.color);

              return (
                <div 
                  key={zone.id} 
                  className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-sm transition-all flex flex-col"
                >
                  {/* Color accent bar on top */}
                  <div className={`h-2 ${colorInfo.bg} w-full`}></div>
                  
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                          <span className={`h-2 w-2 rounded-full ${colorInfo.bg}`}></span>
                          {zone.name}
                        </h4>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mt-1">
                          {agencyCount} {agencyCount === 1 ? 'Agencia agrupada' : 'Agencias agrupadas'}
                        </span>
                      </div>
                      
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleStartEditZone(zone)}
                          className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors border border-transparent hover:border-amber-100"
                          title="Modificar Zona"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteZone(zone.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-100"
                          title="Eliminar Zona"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Agencies preview list */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-100">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Agencias agrupadas en esta zona:</span>
                      {agencyCount === 0 ? (
                        <span className="text-[11px] text-slate-400 italic block">Ninguna agencia asignada</span>
                      ) : (
                        <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                          {zoneAgencies.map(a => (
                            <span 
                              key={a.id} 
                              className="text-[10px] bg-slate-50 border border-slate-150 text-slate-700 rounded-md px-2 py-0.5 font-semibold font-mono"
                            >
                              ({a.code}) {a.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            {filteredZones.length === 0 && (
              <div className="col-span-2 p-8 text-center text-slate-400 text-xs">
                No se encontraron zonas de reparto registradas.
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
