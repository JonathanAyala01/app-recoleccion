import React, { useState } from 'react';
import { 
  User, Truck, ArrowRight, Clipboard, CheckCircle, Package, 
  Signature, MapPin, Navigation, Clock, LogOut, CheckSquare, Check
} from 'lucide-react';
import { RouteSheet, Driver, Agency, RouteStop } from '../types';
import { SignaturePad } from './SignaturePad';

interface DriverPanelProps {
  drivers: Driver[];
  routeSheets: RouteSheet[];
  agencies: Agency[];
  onUpdateRouteSheet: (updatedRoute: RouteSheet) => void;
}

export const DriverPanel: React.FC<DriverPanelProps> = ({
  drivers,
  routeSheets,
  agencies,
  onUpdateRouteSheet
}) => {
  // Authentication / Selector State
  const [selectedDriverId, setSelectedDriverId] = useState<string>('');
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  
  // Active workflow state
  const [activeRouteId, setActiveRouteId] = useState<string | null>(null);
  const [selectedStopId, setSelectedStopId] = useState<string | null>(null);
  
  // Sub-workflow overlays or screens
  const [showLoadSignature, setShowLoadSignature] = useState(false);
  const [showReturnSignature, setShowReturnSignature] = useState(false);

  // Form states for stop completion
  const [stopActualDelivered, setStopActualDelivered] = useState<number>(0);
  const [stopActualCollected, setStopActualCollected] = useState<number>(0);
  const [stopDeliveredAll, setStopDeliveredAll] = useState<boolean>(true);
  const [stopRecipientName, setStopRecipientName] = useState('');
  const [stopObservations, setStopObservations] = useState('');
  const [stopSignature, setStopSignature] = useState<string | null>(null);
  const [isSigningRecipient, setIsSigningRecipient] = useState(false);

  // Form states for departure (loading)
  const [departureTime, setDepartureTime] = useState('');
  
  // Form states for return (unloading/closing)
  const [returnTime, setReturnTime] = useState('');
  const [finalKm, setFinalKm] = useState<number>(0);

  // Computed Values
  const activeDriver = drivers.find(d => d.id === selectedDriverId);
  
  // Filter sheets for this driver that are active or recently completed today
  const driverRoutes = routeSheets.filter(r => r.driverId === selectedDriverId);
  const activeRoute = routeSheets.find(r => r.id === activeRouteId);
  const selectedStop = activeRoute?.stops.find(s => s.id === selectedStopId);

  // Helper
  const getAgency = (agencyId: string) => agencies.find(a => a.id === agencyId);

  // Handle Driver login/selection
  const handleSelectDriver = (id: string) => {
    setSelectedDriverId(id);
    setLoginError('');
    // Retomar automáticamente solo rutas ya en curso (carga o viaje).
    // Las rutas 'assigned' deben mostrarse en la lista para poder "Comenzar Carga".
    const inProgress = routeSheets.find(
      r => r.driverId === id && (r.status === 'loading' || r.status === 'en_route')
    );
    if (inProgress) {
      setActiveRouteId(inProgress.id);
    } else {
      setActiveRouteId(null);
    }
  };

  const handleLogin = (e?: React.FormEvent) => {
    e?.preventDefault();
    const normalized = loginUsername.trim().toLowerCase();
    const password = loginPassword.trim();

    if (!normalized) {
      setLoginError('Ingrese su usuario.');
      return;
    }

    if (!password) {
      setLoginError('Ingrese su contraseÃ±a.');
      return;
    }

    const driver = drivers.find(drv =>
      drv.username.toLowerCase() === normalized &&
      drv.password === password
    );

    if (!driver) {
      setLoginError('Usuario no encontrado o contraseña incorrecta.');
      return;
    }

    handleSelectDriver(driver.id);
  };

  const handleLogout = () => {
    setSelectedDriverId('');
    setLoginUsername('');
    setLoginPassword('');
    setLoginError('');
    setActiveRouteId(null);
    setSelectedStopId(null);
  };

  // Start Loading process
  const handleStartLoading = (route: RouteSheet) => {
    // Set default departure time as current local time HH:MM
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    setDepartureTime(timeStr);
    
    // Transition state
    const updated: RouteSheet = {
      ...route,
      status: 'loading'
    };
    onUpdateRouteSheet(updated);
    setActiveRouteId(route.id);
  };

  // Save loading digital signature and confirm salida
  const handleSaveLoadSignature = (signatureDataUrl: string) => {
    if (!activeRoute) return;

    const updated: RouteSheet = {
      ...activeRoute,
      status: 'en_route',
      departureTime: departureTime || new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
      driverLoadSignature: signatureDataUrl
    };

    onUpdateRouteSheet(updated);
    setShowLoadSignature(false);
  };

  // Open single Stop for delivery
  const handleOpenStop = (stop: RouteStop) => {
    setSelectedStopId(stop.id);
    setStopActualDelivered(stop.packagesToDeliver); // Pre-fill with scheduled for quick tap
    setStopActualCollected(0); // La recolección se registra al llegar a la agencia
    setStopDeliveredAll(true); // Por defecto asume entrega completa; el chofer la ajusta si fue parcial
    setStopRecipientName('');
    setStopObservations('');
    setStopSignature(null);
    setIsSigningRecipient(false);
  };

  // Save recipient signature
  const handleSaveRecipientSignature = (signatureDataUrl: string) => {
    setStopSignature(signatureDataUrl);
    setIsSigningRecipient(false);
  };

  // Submit complete Stop Delivery
  const handleSubmitStopDelivery = () => {
    if (!activeRoute || !selectedStopId || !selectedStop) return;

    // El nombre del receptor y la firma son opcionales: el registro principal
    // es la confirmación de entrega y recolección de bultos por parada.

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const updatedStops = activeRoute.stops.map(s => {
      if (s.id === selectedStopId) {
        return {
          ...s,
          status: 'completed' as const,
          actualPackagesDelivered: Number(stopActualDelivered),
          actualPackagesCollected: Number(stopActualCollected),
          allPackagesDelivered: s.packagesToDeliver === 0 ? true : stopDeliveredAll,
          hadCollection: Number(stopActualCollected) > 0,
          recipientName: stopRecipientName.trim() || undefined,
          observations: stopObservations,
          recipientSignature: stopSignature || undefined,
          stopTime: timeStr
        };
      }
      return s;
    });

    const updatedRoute: RouteSheet = {
      ...activeRoute,
      stops: updatedStops
    };

    onUpdateRouteSheet(updatedRoute);
    setSelectedStopId(null); // Return to stops list
  };

  const handleSkipStop = () => {
    if (!activeRoute || !selectedStopId) return;

    const updatedStops = activeRoute.stops.map(s => {
      if (s.id === selectedStopId) {
        return {
          ...s,
          status: 'skipped' as const,
          actualPackagesDelivered: 0,
          actualPackagesCollected: 0,
          observations: stopObservations || 'Omitido por el chofer.'
        };
      }
      return s;
    });

    const updatedRoute: RouteSheet = {
      ...activeRoute,
      stops: updatedStops
    };

    onUpdateRouteSheet(updatedRoute);
    setSelectedStopId(null);
  };

  // Initiate closing the Route Sheet
  const handleInitiateReturn = () => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    setReturnTime(timeStr);
    
    // Default final Km to initial KM + something realistic
    if (activeRoute) {
      setFinalKm(activeRoute.initialKm + 120);
    }
    
    setShowReturnSignature(true);
  };

  // Save final driver signature and close route
  const handleSaveReturnSignature = (signatureDataUrl: string) => {
    if (!activeRoute) return;

    if (finalKm <= activeRoute.initialKm) {
      alert(`El kilometraje final debe ser mayor que el inicial (${activeRoute.initialKm} Km).`);
      return;
    }

    const updated: RouteSheet = {
      ...activeRoute,
      status: 'completed',
      returnTime: returnTime,
      finalKm: Number(finalKm),
      driverReturnSignature: signatureDataUrl
    };

    onUpdateRouteSheet(updated);
    setShowReturnSignature(false);
  };

  // 1. CHOOSE DRIVER SCREEN (SPLASH)
  if (!selectedDriverId) {
    return (
      <div className="min-h-[100dvh] w-full bg-slate-950 text-white flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-sm rounded-[2rem] border border-slate-800 bg-slate-900/95 shadow-2xl shadow-black/30 px-6 py-8">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="h-14 w-14 rounded-2xl bg-indigo-500/15 text-indigo-300 flex items-center justify-center border border-indigo-500/25 mb-4">
              <Truck className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-semibold tracking-tight text-white">Ingreso Chofer</h2>
            <p className="text-xs text-slate-400 mt-2 max-w-[240px]">
              Acceso privado con usuario y contraseña.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block px-1">Usuario</label>
              <input
                type="text"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                placeholder="carlos.gomez"
                autoComplete="username"
                className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block px-1">Contraseña</label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-3 rounded-2xl transition-all shadow-md cursor-pointer"
            >
              Ingresar
            </button>
          </form>

          {loginError && (
            <p className="mt-3 text-[11px] text-slate-400 text-center" aria-live="polite">
              {loginError}
            </p>
          )}
        </div>
      </div>
    );
  }

  // 2. MAIN DRIVER PORTAL & LIST OF ASSIGNMENTS
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl w-full max-w-sm mx-auto text-white flex flex-col min-h-[580px] relative">
      
      {/* Mini App Header */}
      <div className="bg-slate-850 border-b border-slate-800 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 bg-indigo-500 rounded-lg flex items-center justify-center font-bold text-xs">
              {activeDriver?.name[0]}
            </div>
            <div>
              <h3 className="text-xs font-bold truncate max-w-[120px]">{activeDriver?.name}</h3>
            <span className="text-[10px] text-slate-400 font-mono block">@{activeDriver?.username} | Interno {activeDriver?.internalUnit}</span>
            </div>
          </div>
        
        <button
          onClick={handleLogout}
          className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
          title="Salir"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>

      {/* Mini App Body Scrollable */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">

        {/* ACTIVE ROUTE NOT SELECTED SCREEN */}
        {!activeRouteId ? (
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
              <Clipboard className="w-3.5 h-3.5 text-indigo-400" />
              Recorridos Asignados
            </div>

            {driverRoutes.length === 0 ? (
              <div className="bg-slate-850 rounded-2xl p-8 text-center text-slate-400 text-xs border border-slate-800">
                No tienes hojas de ruta asignadas para hoy. ComunÃ­cate con el administrador.
              </div>
            ) : (
              <div className="space-y-3">
                {driverRoutes.map(route => {
                  const isInProgress = route.status === 'loading' || route.status === 'en_route';
                  const isCompleted = route.status === 'completed';
                  const statusLabel =
                    route.status === 'completed' ? 'Completado' :
                    route.status === 'en_route' ? 'En viaje' :
                    route.status === 'loading' ? 'Cargando' :
                    'Asignado';
                  const statusClasses =
                    route.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
                    isInProgress ? 'bg-amber-500/20 text-amber-400' :
                    'bg-indigo-500/25 text-indigo-400';

                  return (
                    <div
                      key={route.id}
                      className="bg-slate-850 border border-slate-800 rounded-2xl p-4 space-y-3 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-mono font-semibold text-slate-400">{route.id}</span>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${statusClasses}`}>
                            {statusLabel}
                          </span>
                        </div>
                        <div className="text-[11px] font-semibold text-slate-300 font-mono">
                          Fecha: {route.date} | KM Inicial: {route.initialKm}
                        </div>
                        <div className="text-xs text-slate-400 mt-2">
                          Paradas: <strong className="text-slate-200">{route.stops.length} agencias</strong> en el recorrido.
                        </div>
                      </div>

                      {isCompleted ? (
                        <div className="w-full mt-2 bg-slate-800 text-slate-400 font-semibold text-xs py-2 rounded-xl flex items-center justify-center gap-1.5 border border-slate-700/50">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                          Ruta finalizada
                        </div>
                      ) : isInProgress ? (
                        <button
                          onClick={() => setActiveRouteId(route.id)}
                          className="w-full mt-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                        >
                          Continuar Ruta
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStartLoading(route)}
                          className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                        >
                          Comenzar Carga
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          
          /* ACTIVE ROUTE WORKFLOW STEP */
          <div className="space-y-4">
            
            {/* STAGE A: LOADING STOPS (REQUIRES DRIVER SIGNATURE) */}
            {activeRoute?.status === 'loading' && (
              <div className="space-y-4">
                <div className="bg-slate-850 rounded-2xl p-4 border border-indigo-950/40 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase">
                    <Package className="w-4 h-4" />
                    Paso 1: Control y Firma de Carga
                  </div>
                  <p className="text-xs text-slate-300">
                    Registre su hora de salida y verifique las cantidades de bultos totales asignados para cargar en la unidad.
                  </p>

                  <div className="space-y-2 pt-1.5">
                    <label className="text-[10px] font-semibold text-slate-400">Hora de Salida Registrada</label>
                    <input
                      type="time"
                      value={departureTime}
                      onChange={(e) => setDepartureTime(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs font-semibold text-slate-100 font-mono focus:outline-indigo-500"
                    />
                  </div>
                </div>

                {/* Loading control list */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase px-1">Control de Bultos a Cargar</span>
                  <div className="bg-slate-850 border border-slate-800 rounded-2xl p-3 space-y-2 divide-y divide-slate-800">
                    {activeRoute.stops.map((stop, i) => {
                      const agency = getAgency(stop.agencyId);
                      return (
                        <div key={stop.id} className={`flex justify-between items-center text-xs ${i > 0 ? 'pt-2' : ''}`}>
                          <div className="truncate max-w-[180px]">
                            <span className="text-[10px] text-indigo-400 font-mono mr-1">({agency?.code})</span>
                            <span className="text-slate-200">{agency?.name}</span>
                          </div>
                          <div className="flex gap-2 text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-1 rounded-md">
                            <span>E: <strong className="text-white">{stop.packagesToDeliver}</strong></span>
                            <span className="text-slate-500">R se carga en agencia</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Load Sign block */}
                {!showLoadSignature ? (
                  <button
                    onClick={() => setShowLoadSignature(true)}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                  >
                    <Signature className="w-4 h-4" />
                    Firmar Carga y Salir
                  </button>
                ) : (
                  <div className="bg-white text-slate-900 rounded-2xl p-4 space-y-3 shadow-lg border border-indigo-100">
                    <span className="text-xs font-bold text-slate-700 block">Firma del Chofer (Salida)</span>
                    <SignaturePad 
                      onSave={handleSaveLoadSignature}
                      onCancel={() => setShowLoadSignature(false)}
                      placeholderText="Firme aquÃ­ para certificar la carga"
                    />
                  </div>
                )}
              </div>
            )}

            {/* STAGE B: EN ROUTE (STOPS LIST TO COMPLETE) */}
            {activeRoute?.status === 'en_route' && (
              <div className="space-y-4">
                
                {/* Active stop detail screen */}
                {selectedStopId && selectedStop ? (
                  <div className="space-y-4 animate-in fade-in duration-250">
                    <div className="bg-slate-850 border border-slate-800 rounded-2xl p-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          Entrega en Destino
                        </span>
                        <button
                          onClick={() => setSelectedStopId(null)}
                          className="text-[10px] text-slate-400 hover:text-white underline font-medium"
                        >
                          AtrÃ¡s
                        </button>
                      </div>

                      <div className="border-b border-slate-800 pb-3">
                        <h4 className="text-sm font-bold text-white">
                          <span className="text-xs text-indigo-400 font-mono bg-indigo-500/10 px-1.5 py-0.5 rounded mr-1.5">
                            {getAgency(selectedStop.agencyId)?.code}
                          </span>
                          {getAgency(selectedStop.agencyId)?.name}
                        </h4>
                        <p className="text-xs text-slate-400 mt-1">{getAgency(selectedStop.agencyId)?.address}</p>
                      </div>

                      {/* ENTREGA DE BULTOS */}
                      {selectedStop.packagesToDeliver > 0 && (
                        <div className="space-y-2 pt-1">
                          <div className="flex items-center justify-between px-0.5">
                            <label className="text-[10px] font-semibold text-slate-400">Bultos a Distribuir</label>
                            <span className="text-[10px] text-slate-500 font-mono">Previsto: {selectedStop.packagesToDeliver}</span>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              const next = !stopDeliveredAll;
                              setStopDeliveredAll(next);
                              if (next) setStopActualDelivered(selectedStop.packagesToDeliver);
                            }}
                            className={`w-full flex items-center justify-between gap-2 rounded-xl border p-3 text-left transition-colors ${
                              stopDeliveredAll
                                ? 'bg-emerald-950/30 border-emerald-800/50'
                                : 'bg-amber-950/20 border-amber-800/50'
                            }`}
                          >
                            <span className="text-xs font-semibold text-slate-100">
                              {stopDeliveredAll ? 'Dejé todos los bultos' : 'Entrega parcial de bultos'}
                            </span>
                            <span
                              className={`flex h-5 w-5 items-center justify-center rounded-md border ${
                                stopDeliveredAll
                                  ? 'bg-emerald-500 border-emerald-500 text-white'
                                  : 'bg-slate-800 border-slate-600 text-transparent'
                              }`}
                            >
                              <Check className="w-3.5 h-3.5" />
                            </span>
                          </button>

                          {!stopDeliveredAll && (
                            <div className="space-y-1.5 rounded-xl border border-amber-800/40 bg-amber-950/10 p-3">
                              <label className="text-[10px] font-semibold text-amber-300 block">Cantidad realmente entregada</label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  min="0"
                                  max={selectedStop.packagesToDeliver}
                                  value={stopActualDelivered}
                                  onChange={(e) => {
                                    const value = Number(e.target.value);
                                    setStopActualDelivered(value);
                                    if (value >= selectedStop.packagesToDeliver) setStopDeliveredAll(true);
                                  }}
                                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs font-mono text-center font-bold text-white focus:outline-indigo-500"
                                />
                                <span className="text-[10px] text-slate-500">/{selectedStop.packagesToDeliver}</span>
                              </div>
                              <p className="text-[10px] text-amber-400/90">
                                Registró {stopActualDelivered} de {selectedStop.packagesToDeliver} bultos. Detalle el motivo en observaciones.
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* RECOLECCIÓN DE CARGA */}
                      <div className="space-y-2">
                        <div className="space-y-1.5 rounded-xl border border-indigo-800/40 bg-indigo-950/20 p-3">
                          <div className="flex items-center justify-between gap-2">
                            <label className="text-[10px] font-semibold text-indigo-300">
                              Bultos recolectados al llegar a la agencia
                            </label>
                            <span className="text-[10px] text-slate-500 font-mono">
                              Se completa en destino
                            </span>
                          </div>
                          <input
                            type="number"
                            min="0"
                            value={stopActualCollected}
                            onChange={(e) => setStopActualCollected(Number(e.target.value))}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs font-mono text-center font-bold text-white focus:outline-indigo-500"
                          />
                          <p className="text-[10px] text-slate-400">
                            Ingrese la cantidad real cuando el chofer llegue a la agencia. Si no hubo retiro, deje 0.
                          </p>
                        </div>
                      </div>

                      {/* Observations */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-semibold text-slate-400 block">Observaciones</label>
                        <input
                          type="text"
                          value={stopObservations}
                          onChange={(e) => setStopObservations(e.target.value)}
                          placeholder="e.g. Recibido sin novedad, bulto mojado, etc."
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-slate-100 focus:outline-indigo-500"
                        />
                      </div>

                      {/* Recipient details */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-semibold text-slate-400 block">Nombre del Receptor (opcional)</label>
                        <input
                          type="text"
                          value={stopRecipientName}
                          onChange={(e) => setStopRecipientName(e.target.value)}
                          placeholder="Nombre y Apellido"
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs font-semibold text-slate-100 focus:outline-indigo-500"
                        />
                      </div>
                    </div>

                    {/* Signature block of recipient */}
                    <div className="bg-white text-slate-950 rounded-2xl p-4 border border-slate-200 shadow-lg">
                      <span className="text-xs font-bold text-slate-700 block mb-2 flex items-center gap-1.5">
                        <Signature className="w-4 h-4 text-indigo-500" />
                        Firma Digital del Receptor (opcional)
                      </span>
                      
                      {!stopSignature ? (
                        <SignaturePad 
                          onSave={handleSaveRecipientSignature}
                          placeholderText="Firma del receptor en destino"
                        />
                      ) : (
                        <div className="flex flex-col items-center">
                          <div className="border border-slate-200 rounded-xl p-2 bg-slate-50 h-24 w-full flex items-center justify-center relative overflow-hidden shadow-inner">
                            <img 
                              src={stopSignature} 
                              alt="Firma Receptor" 
                              className="max-h-full max-w-full object-contain"
                              referrerPolicy="no-referrer"
                            />
                            <button
                              type="button"
                              onClick={() => setStopSignature(null)}
                              className="absolute right-2 top-2 bg-slate-200 hover:bg-slate-300 text-[10px] text-slate-700 px-1.5 py-0.5 rounded-md font-semibold transition-colors"
                            >
                              Volver a firmar
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Submit complete Stop */}
                    <div className="flex gap-2.5 pt-1.5">
                      <button
                        onClick={handleSkipStop}
                        className="flex-1 bg-slate-800 hover:bg-slate-750 text-rose-500 font-semibold text-xs py-3 rounded-xl transition-colors cursor-pointer border border-slate-700/50 hover:border-rose-500/20"
                      >
                        Omitir Parada
                      </button>
                      <button
                        onClick={handleSubmitStopDelivery}
                        className="flex-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                        Confirmar Parada
                      </button>
                    </div>
                  </div>
                ) : (
                  
                  /* INTERACTIVE STOPS ROUTE LIST */
                  <div className="space-y-4">
                    <div className="flex justify-between items-center px-1">
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                        <Navigation className="w-3.5 h-3.5 text-indigo-400" />
                        Hoja de Ruta en Curso
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">Salida: {activeRoute.departureTime} hs</span>
                    </div>

                    {/* List ofstops */}
                    <div className="space-y-2.5">
                      {activeRoute.stops.map((stop, idx) => {
                        const agency = getAgency(stop.agencyId);
                        const isDone = stop.status !== 'pending';
                        
                        return (
                          <button
                            key={stop.id}
                            disabled={isDone}
                            onClick={() => handleOpenStop(stop)}
                            className={`w-full text-left rounded-2xl p-3.5 border transition-all flex items-center justify-between group ${
                              stop.status === 'completed'
                                ? 'bg-emerald-950/20 border-emerald-900/40 text-emerald-300 opacity-75'
                                : stop.status === 'skipped'
                                ? 'bg-rose-950/20 border-rose-900/40 text-rose-300 opacity-75'
                                : 'bg-slate-850 hover:bg-slate-800 border-slate-800 hover:border-indigo-500/55 text-white'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`h-7 w-7 rounded-lg flex items-center justify-center text-xs font-bold font-mono ${
                                stop.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
                                stop.status === 'skipped' ? 'bg-rose-500/20 text-rose-400' :
                                'bg-slate-800 text-slate-400 group-hover:bg-indigo-500 group-hover:text-white transition-colors'
                              }`}>
                                {stop.status === 'completed' ? 'âœ“' :
                                 stop.status === 'skipped' ? 'âœ•' :
                                 idx + 1}
                              </div>

                              <div>
                                <h4 className="text-xs font-bold flex items-center gap-1.5">
                                  <span className="text-[10px] text-indigo-400 font-mono">({agency?.code})</span>
                                  {agency?.name}
                                </h4>
                                <p className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[210px]">{agency?.address}</p>
                              </div>
                            </div>

                            <div className="text-right">
                              <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1 justify-end">
                                <Clock className="w-3 h-3 text-indigo-400" />
                                {stop.scheduledTime}
                              </div>
                              {stop.status === 'completed' ? (
                                <>
                                  <span className="text-[9px] font-semibold text-slate-400 font-mono block mt-1">
                                    {stop.actualPackagesDelivered ?? 0}E | {stop.actualPackagesCollected ?? 0}R
                                  </span>
                                  {stop.packagesToDeliver > 0 && !stop.allPackagesDelivered && (
                                    <span className="text-[8px] font-bold text-amber-400 uppercase tracking-wide block mt-0.5">
                                      Entrega parcial
                                    </span>
                                  )}
                                </>
                              ) : (
                                <span className="text-[9px] font-semibold text-slate-500 font-mono block mt-1">
                                  {stop.packagesToDeliver}E | R en agencia
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Close Route Sheet Trigger (Only available once stops are reviewed, or can do anytime) */}
                    <div className="border-t border-slate-800 pt-4 mt-2">
                      <button
                        onClick={handleInitiateReturn}
                        className="w-full bg-slate-800 hover:bg-slate-750 text-indigo-400 hover:text-white font-bold text-xs py-3 rounded-xl transition-all border border-slate-700/50 flex items-center justify-center gap-1.5 cursor-pointer hover:shadow"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Finalizar Ruta y Regresar
                      </button>
                    </div>

                  </div>
                )}
              </div>
            )}

            {/* STAGE C: RETURN TO DEPOSIT SIGNATURE AND SUBMISSION */}
            {showReturnSignature && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="bg-slate-850 rounded-2xl p-4 border border-indigo-950/40 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase">
                    <CheckSquare className="w-4 h-4" />
                    Paso Final: Cierre de Ruta en DepÃ³sito
                  </div>
                  <p className="text-xs text-slate-300">
                    Registre su hora de regreso y el kilometraje final de la unidad para completar la rendiciÃ³n logicial.
                  </p>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-semibold text-slate-400">Hora de Regreso</label>
                      <input
                        type="time"
                        value={returnTime}
                        onChange={(e) => setReturnTime(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs font-semibold text-slate-100 font-mono focus:outline-indigo-500"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-semibold text-slate-400">Km Final (OdÃ³metro)</label>
                      <input
                        type="number"
                        value={finalKm}
                        onChange={(e) => setFinalKm(Number(e.target.value))}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs font-semibold text-slate-100 font-mono focus:outline-indigo-500"
                      />
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono bg-slate-900 p-2 rounded-lg">
                    Km Inicial del viaje: <strong className="text-white">{activeRoute?.initialKm} Km</strong>
                  </div>
                </div>

                {/* Return Signature pad */}
                <div className="bg-white text-slate-950 rounded-2xl p-4 shadow-xl border border-slate-200">
                  <span className="text-xs font-bold text-slate-700 block mb-2">Firma Digital del Chofer (Retorno)</span>
                  <SignaturePad 
                    onSave={handleSaveReturnSignature}
                    onCancel={() => setShowReturnSignature(false)}
                    placeholderText="Firme aquÃ­ para validar el retorno"
                  />
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};
