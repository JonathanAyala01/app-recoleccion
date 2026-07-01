import React from 'react';
import { X, Calendar, Truck, Landmark, ClipboardList, CheckCircle2, AlertCircle } from 'lucide-react';
import { RouteSheet, Agency } from '../types';

interface RouteDetailsModalProps {
  route: RouteSheet;
  agencies: Agency[];
  onClose: () => void;
  id?: string;
}

export const RouteDetailsModal: React.FC<RouteDetailsModalProps> = ({
  route,
  agencies,
  onClose,
  id = "route-details-modal"
}) => {
  const getAgencyDetails = (agencyId: string) => {
    return agencies.find(a => a.id === agencyId);
  };

  const totalActualDelivered = route.stops.reduce((sum, s) => sum + (s.actualPackagesDelivered ?? 0), 0);
  const totalActualCollected = route.stops.reduce((sum, s) => sum + (s.actualPackagesCollected ?? 0), 0);

  return (
    <div id={id} className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-150 animate-in fade-in zoom-in duration-150">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold tracking-tight">Hoja de Ruta Digital</h3>
              <p className="text-xs text-slate-400 font-mono">Ref: {route.id}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
              route.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
              route.status === 'en_route' ? 'bg-indigo-500/20 text-indigo-400 font-medium' :
              route.status === 'loading' ? 'bg-amber-500/20 text-amber-400' :
              'bg-slate-500/20 text-slate-400'
            }`}>
              {route.status === 'completed' ? 'Completado' :
               route.status === 'en_route' ? 'En Viaje' :
               route.status === 'loading' ? 'Cargando bultos' :
               'Asignado'}
            </span>
            <button 
              onClick={onClose}
              className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* Paper Style Header Block (Mirrors the user's image layout) */}
          <div className="border border-slate-300 rounded-lg overflow-hidden text-sm bg-slate-50 shadow-xs">
            <div className="grid grid-cols-4 border-b border-slate-350">
              <div className="p-3 border-r border-slate-300">
                <span className="block text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Fecha</span>
                <span className="font-semibold text-slate-800 font-mono flex items-center gap-1.5 mt-0.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {route.date}
                </span>
              </div>
              <div className="p-3 border-r border-slate-300">
                <span className="block text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Unidad (Interno)</span>
                <span className="font-semibold text-slate-800 font-mono flex items-center gap-1.5 mt-0.5">
                  <Truck className="w-3.5 h-3.5 text-slate-400" />
                  {route.internalUnit} <span className="text-slate-400 text-xs font-normal">({route.licensePlate})</span>
                </span>
              </div>
              <div className="p-3 border-r border-slate-300">
                <span className="block text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Legajo</span>
                <span className="font-semibold text-slate-800 font-mono mt-0.5 block">{route.legajo}</span>
              </div>
              <div className="p-3">
                <span className="block text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Chofer (Cond.)</span>
                <span className="font-semibold text-slate-900 mt-0.5 block truncate">{route.driverName}</span>
              </div>
            </div>

            <div className="grid grid-cols-4 bg-white">
              <div className="p-3 border-r border-slate-300">
                <span className="block text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Km Inicial</span>
                <span className="font-semibold text-slate-800 font-mono mt-0.5 block">{route.initialKm} Km</span>
              </div>
              <div className="p-3 border-r border-slate-300">
                <span className="block text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Km Final</span>
                <span className="font-semibold text-slate-800 font-mono mt-0.5 block">
                  {route.finalKm ? `${route.finalKm} Km` : '—'}
                </span>
              </div>
              <div className="p-3 border-r border-slate-300">
                <span className="block text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Hora Salida</span>
                <span className="font-semibold text-slate-800 font-mono mt-0.5 block text-indigo-600">
                  {route.departureTime ? `${route.departureTime} hs` : '—'}
                </span>
              </div>
              <div className="p-3">
                <span className="block text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Hora Regreso</span>
                <span className="font-semibold text-slate-800 font-mono mt-0.5 block text-indigo-600">
                  {route.returnTime ? `${route.returnTime} hs` : '—'}
                </span>
              </div>
            </div>
          </div>

          {/* Stops Table */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
              <Landmark className="w-3.5 h-3.5" />
              Detalle de Paradas en Agencias
            </h4>
            
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 text-xs font-semibold border-b border-slate-200">
                    <th className="py-3 px-4 w-12 text-center">N°</th>
                    <th className="py-3 px-4">Agencia / Dirección</th>
                    <th className="py-3 px-3 text-center w-24">Hora Est.</th>
                    <th className="py-3 px-3 text-center w-24 bg-slate-150/40">Bultos Entregados</th>
                    <th className="py-3 px-3 text-center w-24 bg-slate-150/40">Bultos Recolectados</th>
                    <th className="py-3 px-4">Estado / Firma Receptor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {route.stops.map((stop, index) => {
                    const agency = getAgencyDetails(stop.agencyId);
                    return (
                      <tr key={stop.id} className="hover:bg-slate-50/55 transition-colors">
                        <td className="py-3 px-4 text-center font-semibold text-slate-500 font-mono">
                          {index + 1}
                        </td>
                        <td className="py-3 px-4">
                          {agency ? (
                            <div>
                              <div className="font-medium text-slate-900">
                                <span className="text-xs text-indigo-600 font-mono bg-indigo-50 px-1.5 py-0.5 rounded mr-1.5">
                                  ({agency.code})
                                </span>
                                {agency.name}
                              </div>
                              <div className="text-xs text-slate-500 mt-0.5">{agency.address}</div>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-xs italic">Agencia no encontrada</span>
                          )}
                          {stop.observations && (
                            <div className="mt-1 text-xs bg-amber-50 text-amber-800 px-2 py-0.5 rounded-md inline-block max-w-xs truncate">
                              Obs: {stop.observations}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center font-mono text-slate-600">
                          {stop.scheduledTime} hs
                        </td>
                        <td className="py-3 px-3 text-center font-mono bg-slate-50/50">
                          <span className={`font-semibold ${
                            stop.actualPackagesDelivered !== undefined ? 'text-emerald-600' : 'text-slate-300'
                          }`}>
                            {stop.actualPackagesDelivered !== undefined ? stop.actualPackagesDelivered : '—'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center font-mono bg-slate-50/50">
                          <span className={`font-semibold ${
                            stop.actualPackagesCollected !== undefined ? 'text-indigo-600' : 'text-slate-300'
                          }`}>
                            {stop.actualPackagesCollected !== undefined ? stop.actualPackagesCollected : '—'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div>
                              {stop.status === 'completed' ? (
                                <div className="flex items-center gap-1.5 text-emerald-600 font-medium text-xs bg-emerald-50 px-2 py-1 rounded-full">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  Recibido
                                </div>
                              ) : stop.status === 'skipped' ? (
                                <div className="flex items-center gap-1.5 text-rose-600 font-medium text-xs bg-rose-50 px-2 py-1 rounded-full">
                                  <AlertCircle className="w-3.5 h-3.5" />
                                  Omitido
                                </div>
                              ) : (
                                <div className="flex items-center gap-1.5 text-slate-400 font-medium text-xs bg-slate-100 px-2 py-1 rounded-full">
                                  Pendiente
                                </div>
                              )}
                              
                              {stop.recipientName && (
                                <span className="text-[10px] text-slate-400 block mt-1">
                                  Por: {stop.recipientName}
                                </span>
                              )}
                            </div>

                            {/* Recipient signature */}
                            {stop.recipientSignature ? (
                              <div className="border border-slate-200 rounded p-0.5 bg-slate-50 h-9 w-16 flex items-center justify-center overflow-hidden">
                                <img 
                                  src={stop.recipientSignature} 
                                  alt="Firma receptor" 
                                  className="max-h-full max-w-full object-contain"
                                  referrerPolicy="no-referrer"
                                />
                              </div>
                            ) : (
                              stop.status === 'completed' && <span className="text-xs text-slate-400 italic">Sin firma</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Total summary row */}
            <div className="mt-3 bg-slate-50 border border-slate-200 rounded-xl p-3 flex justify-between items-center text-xs text-slate-600">
              <span className="font-semibold text-slate-700">Resumen de Totales:</span>
              <div className="flex gap-6 font-mono">
                <div>
                  <span className="text-slate-500">Entregados:</span> <strong className="text-emerald-700">{totalActualDelivered}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Recolectados:</span> <strong className="text-indigo-700">{totalActualCollected}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Digital Signatures Segment */}
          {(route.driverLoadSignature || route.driverReturnSignature) && (
            <div className="border-t border-slate-150 pt-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
                Validaciones de Seguridad y Firma de Chofer
              </h4>
              <div className="grid grid-cols-2 gap-6">
                
                {/* Load signature */}
                {route.driverLoadSignature ? (
                  <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 flex flex-col items-center">
                    <span className="text-xs font-semibold text-slate-500 mb-2">Firma Digital de Salida (Carga Inicial)</span>
                    <div className="bg-white border border-slate-200 rounded-lg h-24 w-full max-w-xs flex items-center justify-center p-2 shadow-inner">
                      <img 
                        src={route.driverLoadSignature} 
                        alt="Firma Carga Chofer" 
                        className="max-h-full max-w-full object-contain"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="text-[11px] text-slate-400 mt-2 font-mono">
                      Firma autorizada a las {route.departureTime || '—'} hs
                    </div>
                  </div>
                ) : (
                  <div className="border border-dashed border-slate-200 rounded-xl p-4 bg-slate-50 flex flex-col items-center justify-center text-center text-slate-400 text-xs">
                    No se registró firma de salida aún.
                  </div>
                )}

                {/* Return signature */}
                {route.driverReturnSignature ? (
                  <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 flex flex-col items-center">
                    <span className="text-xs font-semibold text-slate-500 mb-2">Firma Digital de Retorno (Cierre de Ruta)</span>
                    <div className="bg-white border border-slate-200 rounded-lg h-24 w-full max-w-xs flex items-center justify-center p-2 shadow-inner">
                      <img 
                        src={route.driverReturnSignature} 
                        alt="Firma Retorno Chofer" 
                        className="max-h-full max-w-full object-contain"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="text-[11px] text-slate-400 mt-2 font-mono">
                      Firma registrada a las {route.returnTime || '—'} hs
                    </div>
                  </div>
                ) : (
                  <div className="border border-dashed border-slate-200 rounded-xl p-4 bg-slate-50 flex flex-col items-center justify-center text-center text-slate-400 text-xs">
                    No se registró firma de retorno aún.
                  </div>
                )}

              </div>
            </div>
          )}

          {route.observations && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <h5 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-1">Observaciones Generales de la Ruta:</h5>
              <p className="text-sm text-amber-950">{route.observations}</p>
            </div>
          )}

        </div>

        {/* Footer actions */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex justify-between items-center">
          <span className="text-xs text-slate-400 font-mono">Generado el {route.createdAt}</span>
          <button
            onClick={() => {
              window.print();
            }}
            className="bg-slate-800 hover:bg-slate-900 text-white font-medium text-xs px-4 py-2 rounded-lg transition-colors cursor-pointer"
          >
            Imprimir Hoja de Ruta
          </button>
        </div>

      </div>
    </div>
  );
};
