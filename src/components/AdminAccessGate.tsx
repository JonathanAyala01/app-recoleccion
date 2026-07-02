import React, { useState } from 'react';
import { ArrowRight, Eye, Lock, ShieldCheck } from 'lucide-react';
import { publicAssetPath } from '../lib/paths';

interface AdminAccessGateProps {
  isLoading?: boolean;
  error?: string;
  onSubmit: (password: string) => void | Promise<void>;
  onGoToDriver?: () => void;
}

export const AdminAccessGate: React.FC<AdminAccessGateProps> = ({
  isLoading = false,
  error = '',
  onSubmit,
  onGoToDriver,
}) => {
  const [password, setPassword] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await onSubmit(password);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#111827,_#020617_55%,_#000_100%)] px-4 py-6 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-5xl items-center justify-center">
        <div className="grid w-full gap-6 overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-[0_30px_90px_rgba(2,6,23,0.45)] backdrop-blur md:grid-cols-[1.05fr_0.95fr]">
          <div className="relative overflow-hidden p-6 md:p-8">
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(59,130,246,0.18),transparent_42%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.16),transparent_28%)]" />
            <div className="relative">
              <div className="flex items-center gap-4">
                <img
                  src={publicAssetPath('logo.png')}
                  alt="CRUCERO EXPRESS"
                  className="h-20 w-20 object-contain drop-shadow-[0_12px_24px_rgba(15,23,42,0.45)]"
                />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-cyan-200/80">
                    Acceso seguro
                  </p>
                  <h1 className="mt-2 text-3xl font-black tracking-tight text-white md:text-4xl">
                    CRUCERO EXPRESS-RECOLECCIÓN
                  </h1>
                </div>
              </div>

              <p className="mt-6 max-w-xl text-sm leading-6 text-slate-200">
                Ingresá con la clave de administrador para editar, o con la clave de vista informativa para
                consultar sin modificar datos.
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                  <div className="flex items-center gap-2 text-cyan-200">
                    <ShieldCheck className="h-4 w-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Modo admin</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-300">
                    Acceso completo para crear, editar y eliminar.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                  <div className="flex items-center gap-2 text-emerald-200">
                    <Eye className="h-4 w-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Solo lectura</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-300">
                    Vista informativa sin botones de alta o edición.
                  </p>
                </div>
              </div>

              {onGoToDriver && (
                <button
                  type="button"
                  onClick={onGoToDriver}
                  className="mt-8 inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/15"
                >
                  Ir a app chofer
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          <div className="bg-white p-6 text-slate-900 md:p-8">
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.28em] text-slate-500">
                <Lock className="h-3.5 w-3.5 text-indigo-500" />
                Ingreso
              </div>
              <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-950">
                Ingresar al panel
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                La contraseña define automáticamente si entrás como administrador o en modo informativo.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Contraseña
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Ingresar clave"
                  autoComplete="current-password"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white"
                />
              </div>

              {error && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? 'Validando...' : 'Entrar'}
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Recomendación
              </p>
              <p className="mt-2 text-sm text-slate-600">
                Cambiá las claves en `api/config.php` para dejar este acceso cerrado con tus propias
                contraseñas.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
