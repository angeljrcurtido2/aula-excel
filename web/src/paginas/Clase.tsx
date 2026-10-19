import { useEffect, useMemo } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, BookOpen, Check, ChevronLeft, FlaskConical, Pencil, Table2 } from 'lucide-react';
import { ActividadView } from '../actividades';
import { CLASES, tipoDePaso } from '../contenido';
import type { Bloque, Paso } from '../contenido/tipos';
import { Figura } from '../Figura';
import { Laboratorio } from '../Laboratorio';
import { RetoView } from '../planilla/RetoView';
import { resumenClase } from '../progreso';
import { useSesion } from '../sesion';
import { Md, Inline } from '../texto';
import { Anillo, Boton, Chip, Tarjeta } from '../ui';

const icono = (p: Paso) => (p.tipo === 'lectura' ? <BookOpen size={16} /> : p.tipo === 'reto' ? <Table2 size={16} /> : p.tipo === 'lab' ? <FlaskConical size={16} /> : <Pencil size={16} />);
const etiqueta = (p: Paso) => (p.tipo === 'lectura' ? 'Lectura' : p.tipo === 'reto' ? 'Reto en la planilla' : p.tipo === 'lab' ? 'Laboratorio' : 'Actividad');

function Bloques({ bloques }: { bloques: Bloque[] }) {
  return (
    <div>
      {bloques.map((b, i) => {
        if ('md' in b) return <Md key={i} texto={b.md} />;
        if ('fig' in b) return <Figura key={i} def={b.fig} />;
        return <div key={i} className="my-4 rounded-xl border-2 border-amber-300 bg-amber-50 p-4"><div className="mb-1 font-bold text-amber-800">★ Para recordar</div><div className="text-[15px]"><Inline t={b.recordar} /></div></div>;
      })}
    </div>
  );
}

export function Clase() {
  const { n, pasoId } = useParams();
  const { progreso, guardar } = useSesion();
  const ir = useNavigate();
  const clase = CLASES.find((c) => String(c.n) === n);
  const idx = useMemo(() => (clase ? Math.max(0, clase.pasos.findIndex((p) => p.id === pasoId)) : 0), [clase, pasoId]);
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [pasoId]);
  if (!clase) return <Navigate to="/" replace />;
  if (!pasoId || clase.pasos.findIndex((p) => p.id === pasoId) < 0) return <Navigate to={`/clase/${clase.n}/${clase.pasos[0].id}`} replace />;

  const paso = clase.pasos[idx];
  const prog = progreso[paso.id];
  const r = resumenClase(clase.n, progreso);
  const claseSig = CLASES.find((c) => c.n === clase.n + 1);
  const irA = (i: number) => ir(`/clase/${clase.n}/${clase.pasos[i].id}`);
  const siguiente = () => (idx < clase.pasos.length - 1 ? irA(idx + 1) : claseSig ? ir(`/clase/${claseSig.n}/${claseSig.pasos[0].id}`) : ir('/'));

  const resultado = (r2: { puntaje: number; completada: boolean; estado: any }) =>
    guardar({ actividad: paso.id, clase: clase.n, tipo: tipoDePaso(paso.tipo), puntaje: r2.puntaje, completada: r2.completada, estado: r2.estado });

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <aside className="lg:sticky lg:top-20 lg:self-start">
        <Link to="/" className="mb-2 inline-flex items-center gap-1 py-2 pr-3 text-sm font-semibold text-slate-500 hover:text-slate-800"><ChevronLeft size={16} /> Inicio</Link>
        <Tarjeta className="p-4">
          <div className="mb-3 flex items-center gap-3">
            <Anillo pct={r.pct} size={56} color={clase.color} />
            <div><div className="text-xs font-bold uppercase tracking-wide" style={{ color: clase.color }}>Clase {clase.n}</div><div className="font-extrabold leading-tight">{clase.titulo}</div></div>
          </div>
          <details className="lg:hidden">
            <summary className="cursor-pointer select-none rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold">Ver los {clase.pasos.length} pasos de la clase</summary>
            <div className="mt-2">          <ol className="max-h-[45vh] space-y-0.5 overflow-y-auto pr-1">
            {clase.pasos.map((p, i) => {
              const hecho = progreso[p.id]?.completada, actual = i === idx;
              return (
                <li key={p.id}>
                  <Link to={`/clase/${clase.n}/${p.id}`} className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition ${actual ? 'bg-slate-100 font-bold' : 'hover:bg-slate-50'}`}>
                    <span className={`flex h-5 w-5 flex-none items-center justify-center rounded-full text-[10px] font-bold ${hecho ? 'bg-emerald-600 text-white' : actual ? 'text-white' : 'bg-slate-200 text-slate-600'}`} style={actual && !hecho ? { background: clase.color } : undefined}>{hecho ? <Check size={12} /> : i + 1}</span>
                    <span className="flex-1 truncate">{p.titulo}</span><span className="text-slate-400">{icono(p)}</span>
                  </Link>
                </li>
              );
            })}
          </ol></div>
          </details>
          <div className="hidden lg:block">          <ol className="max-h-[50vh] space-y-0.5 overflow-y-auto pr-1">
            {clase.pasos.map((p, i) => {
              const hecho = progreso[p.id]?.completada, actual = i === idx;
              return (
                <li key={p.id}>
                  <Link to={`/clase/${clase.n}/${p.id}`} className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition ${actual ? 'bg-slate-100 font-bold' : 'hover:bg-slate-50'}`}>
                    <span className={`flex h-5 w-5 flex-none items-center justify-center rounded-full text-[10px] font-bold ${hecho ? 'bg-emerald-600 text-white' : actual ? 'text-white' : 'bg-slate-200 text-slate-600'}`} style={actual && !hecho ? { background: clase.color } : undefined}>{hecho ? <Check size={12} /> : i + 1}</span>
                    <span className="flex-1 truncate">{p.titulo}</span><span className="text-slate-400">{icono(p)}</span>
                  </Link>
                </li>
              );
            })}
          </ol></div>
        </Tarjeta>
      </aside>

      <section key={paso.id} className="min-w-0">
        <div className="mb-1 flex flex-wrap items-center gap-2"><Chip tono={paso.tipo === 'lectura' ? 'azul' : paso.tipo === 'reto' || paso.tipo === 'lab' ? 'ambar' : 'verde'}>{icono(paso)} {etiqueta(paso)}</Chip>{'sub' in paso && paso.sub && <Chip>{paso.sub}</Chip>}{prog?.completada && <Chip tono="verde"><Check size={12} /> Completado</Chip>}<span className="ml-auto text-sm text-slate-500">Paso {idx + 1} de {clase.pasos.length}</span></div>
        <h1 className="mb-4 text-2xl font-extrabold md:text-3xl">{paso.titulo}</h1>
        <div className="mb-5 h-1.5 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full transition-all duration-500" style={{ width: `${((idx + 1) / clase.pasos.length) * 100}%`, background: clase.color }} /></div>

        <Tarjeta className="p-5 md:p-7">
          {paso.tipo === 'lectura' && (
            <>
              <Bloques bloques={paso.bloques} />
              <div className="mt-6 flex flex-wrap items-center gap-3 border-t pt-4">
                {!prog?.completada
                  ? <Boton onClick={() => { void resultado({ puntaje: 100, completada: true, estado: null }); }}><Check size={18} /> Entendido</Boton>
                  : <span className="text-sm font-semibold text-emerald-700">✔ Lectura completada</span>}
              </div>
            </>
          )}
          {paso.tipo === 'actividad' && <ActividadView id={paso.id} act={paso.act} inicial={prog?.estado} completadaAntes={!!prog?.completada} mejor={prog?.mejorPuntaje ?? 0} onResultado={resultado} />}
          {paso.tipo === 'reto' && <RetoView id={paso.id} reto={paso.reto} inicial={prog?.estado} completadaAntes={!!prog?.completada} mejor={prog?.mejorPuntaje ?? 0} onResultado={resultado} />}
          {paso.tipo === 'lab' && <Laboratorio inicial={prog?.estado} completadaAntes={!!prog?.completada} mejor={prog?.mejorPuntaje ?? 0} onResultado={resultado} />}
        </Tarjeta>

        <div className="mt-5 flex items-center justify-between">
          <Boton variante="fantasma" disabled={idx === 0} onClick={() => irA(idx - 1)}><ArrowLeft size={16} /> Anterior</Boton>
          <Boton onClick={siguiente}>{idx < clase.pasos.length - 1 ? 'Siguiente' : claseSig ? `Ir a la Clase ${claseSig.n}` : 'Terminar'} <ArrowRight size={16} /></Boton>
        </div>
      </section>
    </div>
  );
}
