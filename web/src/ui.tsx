import type { ReactNode } from 'react';

export function Tarjeta({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 ${className}`}>{children}</div>;
}

export function Boton({ children, onClick, variante = 'primario', disabled, className = '', type = 'button' }: { children: ReactNode; onClick?: () => void; variante?: 'primario' | 'suave' | 'fantasma' | 'peligro'; disabled?: boolean; className?: string; type?: 'button' | 'submit' }) {
  const base = 'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition active:scale-[.98] disabled:opacity-50 disabled:active:scale-100';
  const v = { primario: 'bg-excel text-white shadow hover:bg-excel-dark', suave: 'bg-excel-soft text-excel-dark hover:bg-[#d6ebde]', fantasma: 'bg-white text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50', peligro: 'bg-rose-600 text-white hover:bg-rose-700' }[variante];
  return <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${v} ${className}`}>{children}</button>;
}

export function BarraXP({ xpNivel, nivel }: { xpNivel: number; nivel: number }) {
  return (
    <div className="flex items-center gap-2" title={`Nivel ${nivel}: ${xpNivel}/100 XP`}>
      <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-amber-400 px-1.5 text-xs font-extrabold text-amber-950 shadow">{nivel}</span>
      <div className="h-2.5 w-24 overflow-hidden rounded-full bg-white/30 sm:w-36"><div className="h-full rounded-full bg-amber-300 transition-all duration-700" style={{ width: `${xpNivel}%` }} /></div>
    </div>
  );
}

export function Anillo({ pct, size = 64, color = '#217346', children }: { pct: number; size?: number; color?: string; children?: ReactNode }) {
  const r = (size - 10) / 2, c = 2 * Math.PI * r;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90"><circle cx={size / 2} cy={size / 2} r={r} stroke="#e5e9ee" strokeWidth="8" fill="none" /><circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth="8" fill="none" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - pct / 100)} style={{ transition: 'stroke-dashoffset .8s ease' }} /></svg>
      <div className="absolute text-sm font-bold">{children ?? `${Math.round(pct)}%`}</div>
    </div>
  );
}

export const Chip = ({ children, tono = 'gris' }: { children: ReactNode; tono?: 'gris' | 'verde' | 'ambar' | 'rojo' | 'azul' }) => {
  const t = { gris: 'bg-slate-100 text-slate-700', verde: 'bg-emerald-100 text-emerald-800', ambar: 'bg-amber-100 text-amber-800', rojo: 'bg-rose-100 text-rose-800', azul: 'bg-sky-100 text-sky-800' }[tono];
  return <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${t}`}>{children}</span>;
};
