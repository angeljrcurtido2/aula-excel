import { Link, Outlet, useNavigate } from 'react-router-dom';
import { Flame, LogOut, Sparkles } from 'lucide-react';
import { useSesion } from './sesion';
import { BarraXP } from './ui';

export function Layout() {
  const { perfil, salir, avisos } = useSesion();
  const ir = useNavigate();
  const u = perfil!.usuario;
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 bg-gradient-to-r from-excel to-excel-dark text-white shadow-md">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-2.5">
          <Link to="/" className="flex items-center gap-2.5 text-lg font-extrabold"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-lg font-black text-excel">X</span><span className="hidden sm:inline">Aula Excel</span></Link>
          <div className="ml-auto flex items-center gap-4">
            <span className="flex items-center gap-1 text-sm font-bold" title={`Racha: ${u.racha} día(s) seguidos`}><Flame size={18} className={u.racha > 0 ? 'text-amber-300' : 'text-white/40'} /> {u.racha}</span>
            <span className="hidden items-center gap-1 text-sm font-bold sm:flex" title="Puntos de experiencia"><Sparkles size={16} className="text-amber-300" /> {u.xp} XP</span>
            <BarraXP xpNivel={u.xpNivel} nivel={u.nivel} />
            <div className="hidden text-right leading-tight md:block"><div className="text-sm font-semibold">{u.nombre}</div><div className="text-xs text-white/70">@{u.username}</div></div>
            <button onClick={() => { salir(); ir('/ingresar'); }} className="rounded-lg p-2 text-white/80 hover:bg-white/15 hover:text-white" title="Salir"><LogOut size={18} /></button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 pb-32 pt-6"><Outlet /></main>
      <div className="pointer-events-none fixed right-4 top-16 z-50 flex flex-col items-end gap-2">
        {avisos.map((a) => (
          <div key={a.id} className={`anim-pop rounded-2xl px-4 py-2.5 text-sm font-bold shadow-lg ${a.tipo === 'xp' ? 'bg-amber-400 text-amber-950' : a.tipo === 'insignia' ? 'bg-navy text-white' : a.tipo === 'error' ? 'bg-rose-600 text-white' : 'bg-slate-800 text-white'}`}>{a.tipo === 'xp' ? '✨ ' : ''}{a.texto}</div>
        ))}
      </div>
    </div>
  );
}
