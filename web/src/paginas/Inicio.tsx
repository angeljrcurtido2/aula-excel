import { Link } from 'react-router-dom';
import { ArrowRight, Award, BookOpen, CheckCircle2, Flame, Lock, Play, Sparkles, Target } from 'lucide-react';
import { CLASES } from '../contenido';
import { INSIGNIAS } from '../insignias';
import { resumenClase, siguientePaso } from '../progreso';
import { useSesion } from '../sesion';
import { Anillo, Tarjeta } from '../ui';

export function Inicio() {
  const { perfil, progreso } = useSesion();
  const u = perfil!.usuario;
  const sig = siguientePaso(progreso);
  const hechas = Object.values(progreso).filter((p) => p.completada).length;
  const total = CLASES.reduce((s, c) => s + c.pasos.length, 0);
  const tiene = new Set(perfil!.insignias);

  return (
    <div className="space-y-8">
      <section className="anim-subir overflow-hidden rounded-3xl bg-gradient-to-br from-navy to-excel p-6 text-white shadow-lg md:p-8">
        <p className="text-white/80">¡Hola, {u.nombre.split(' ')[0]}! 👋</p>
        <h1 className="mt-1 text-3xl font-extrabold md:text-4xl">{hechas === 0 ? 'Empecemos con Excel' : hechas >= total ? '¡Terminaste todo el curso!' : 'Sigue practicando'}</h1>
        <p className="mt-2 max-w-xl text-white/85">{hechas >= total ? 'Repasa cuando quieras: puedes repetir las actividades para mejorar tu puntaje.' : `Llevas ${hechas} de ${total} pasos completados.`}</p>
        {sig && (
          <Link to={`/clase/${sig.clase.n}/${sig.paso.id}`} className="mt-5 inline-flex items-center gap-3 rounded-2xl bg-white px-5 py-3 font-bold text-excel shadow transition hover:scale-[1.02]">
            <Play size={20} fill="currentColor" /> {hechas === 0 ? 'Empezar la Clase 1' : 'Continuar'}: <span className="font-semibold text-slate-700">{sig.paso.titulo}</span> <ArrowRight size={18} />
          </Link>
        )}
      </section>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { icon: <Sparkles className="text-amber-500" />, t: 'Puntos', v: `${u.xp} XP` },
          { icon: <Target className="text-sky-600" />, t: 'Nivel', v: `${u.nivel}` },
          { icon: <Flame className="text-orange-500" />, t: 'Racha', v: `${u.racha} día${u.racha === 1 ? '' : 's'}` },
          { icon: <CheckCircle2 className="text-emerald-600" />, t: 'Completados', v: `${hechas}/${total}` },
        ].map((x) => (
          <Tarjeta key={x.t} className="flex items-center gap-3 p-4"><span className="rounded-xl bg-slate-100 p-2.5">{x.icon}</span><div><div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{x.t}</div><div className="text-xl font-extrabold">{x.v}</div></div></Tarjeta>
        ))}
      </section>

      <section>
        <h2 className="mb-3 text-xl font-extrabold">Tus clases</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {CLASES.map((c, i) => {
            const r = resumenClase(c.n, progreso);
            const siguiente = c.pasos.find((p) => !progreso[p.id]?.completada) ?? c.pasos[0];
            return (
              <Link key={c.n} to={`/clase/${c.n}/${siguiente.id}`} className="anim-subir group block" style={{ animationDelay: `${i * 80}ms` }}>
                <Tarjeta className="h-full overflow-hidden transition group-hover:-translate-y-1 group-hover:shadow-lg">
                  <div className="h-2" style={{ background: c.color }} />
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div><div className="text-xs font-bold uppercase tracking-wide" style={{ color: c.color }}>Clase {c.n}</div><h3 className="mt-0.5 text-lg font-extrabold leading-snug">{c.titulo}</h3></div>
                      <Anillo pct={r.pct} color={c.color} />
                    </div>
                    <p className="mt-2 text-sm text-slate-600">{c.resumen}</p>
                    <ul className="mt-3 space-y-1 text-sm text-slate-600">{c.objetivos.slice(0, 3).map((o) => <li key={o} className="flex gap-2"><BookOpen size={15} className="mt-0.5 flex-none text-slate-400" />{o}</li>)}</ul>
                    <div className="mt-4 flex items-center justify-between text-sm font-bold" style={{ color: c.color }}><span>{r.hechas}/{r.total} pasos</span><span className="flex items-center gap-1">{r.pct === 100 ? 'Repasar' : r.hechas ? 'Continuar' : 'Empezar'} <ArrowRight size={16} /></span></div>
                  </div>
                </Tarjeta>
              </Link>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="mb-3 flex items-center gap-2 text-xl font-extrabold"><Award className="text-amber-500" /> Tus insignias <span className="text-sm font-semibold text-slate-500">({tiene.size}/{Object.keys(INSIGNIAS).length})</span></h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {Object.entries(INSIGNIAS).map(([k, i]) => {
            const ganada = tiene.has(k);
            return (
              <Tarjeta key={k} className={`p-4 text-center transition ${ganada ? 'bg-gradient-to-b from-amber-50 to-white ring-amber-300' : 'opacity-60'}`}>
                <div className={`mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full text-3xl ${ganada ? 'bg-amber-100' : 'bg-slate-100 grayscale'}`}>{ganada ? i.emoji : <Lock size={20} className="text-slate-400" />}</div>
                <div className="text-sm font-bold">{i.nombre}</div><div className="mt-0.5 text-xs text-slate-500">{i.desc}</div>
              </Tarjeta>
            );
          })}
        </div>
      </section>
    </div>
  );
}
