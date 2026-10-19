import { useEffect, useState } from 'react';
import { Maximize2, X } from 'lucide-react';
import { Inline } from './texto';
import type { FiguraDef } from './contenido/tipos';

interface Datos { w: number; h: number; marcas: { n: number; x: number; y: number }[] }
const cache: Record<string, Promise<Datos>> = {};
export const cargarMarcas = (nombre: string) => (cache[nombre] ??= fetch(`/capturas/${nombre}.json`).then((r) => r.json()));
export const useMarcas = (nombre: string) => {
  const [d, setD] = useState<Datos | null>(null);
  useEffect(() => { let vivo = true; cargarMarcas(nombre).then((x) => vivo && setD(x)).catch(() => {}); return () => { vivo = false; }; }, [nombre]);
  return d;
};

/** Captura de Excel con marcadores numerados que se pueden tocar. */
export function Marcador({ n, x, y, activo, onClick, estado }: { n: number | string; x: number; y: number; activo?: boolean; onClick?: () => void; estado?: 'ok' | 'mal' | 'pend' }) {
  const fondo = estado === 'ok' ? 'bg-emerald-600' : estado === 'mal' ? 'bg-rose-600' : 'bg-red-600';
  return (
    <button
      type="button" onClick={onClick} aria-label={`Marca ${n}`}
      className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white text-[11px] font-extrabold text-white shadow-md transition ${fondo} ${activo ? 'z-20 scale-125 ring-4 ring-amber-300' : 'z-10 hover:scale-110'}`}
      style={{ left: `${x}%`, top: `${y}%`, width: 24, height: 24 }}
    >{n}</button>
  );
}

export function Figura({ def }: { def: FiguraDef }) {
  const d = useMarcas(def.nombre);
  const [activa, setActiva] = useState<number | null>(null);
  const [zoom, setZoom] = useState(false);
  return (
    <figure className="my-4">
      <div className="relative overflow-hidden rounded-xl ring-1 ring-slate-300 shadow-sm">
        <img src={`/capturas/${def.nombre}.png`} alt={def.pie.replace(/\*/g, '')} className="block w-full" />
        {d && d.marcas.map((m) => <Marcador key={m.n} n={m.n} x={(m.x / d.w) * 100} y={(m.y / d.h) * 100} activo={activa === m.n} onClick={() => setActiva(activa === m.n ? null : m.n)} />)}
        <button type="button" onClick={() => setZoom(true)} className="absolute right-2 top-2 z-30 rounded-lg bg-white/90 p-1.5 text-slate-700 shadow hover:bg-white" title="Ampliar"><Maximize2 size={16} /></button>
      </div>
      <figcaption className="mt-1.5 text-sm text-slate-600"><b>Figura {def.num}.</b> <Inline t={def.pie} /></figcaption>
      <ol className="mt-2 grid gap-1.5 sm:grid-cols-2">
        {def.leyenda.map((l, i) => (
          <li key={i}>
            <button type="button" onClick={() => setActiva(activa === i + 1 ? null : i + 1)} className={`flex w-full items-start gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition ${activa === i + 1 ? 'bg-amber-100 ring-1 ring-amber-300' : 'hover:bg-slate-100'}`}>
              <span className="mt-0.5 inline-flex h-5 w-5 flex-none items-center justify-center rounded-full bg-red-600 text-[11px] font-bold text-white">{i + 1}</span>
              <span><Inline t={l} /></span>
            </button>
          </li>
        ))}
      </ol>
      {zoom && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-auto bg-black/70 p-4" onClick={() => setZoom(false)}>
          <button className="fixed right-4 top-4 rounded-full bg-white p-2 shadow" onClick={() => setZoom(false)}><X size={20} /></button>
          <img src={`/capturas/${def.nombre}.png`} alt="" className="max-w-none rounded-lg shadow-2xl" style={{ width: 'min(1800px, 190vw)' }} onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </figure>
  );
}
