import { useMemo, useRef, useState } from 'react';
import { Check, CircleDashed, Lightbulb, RotateCcw, X } from 'lucide-react';
import type { RetoDef } from '../contenido/tipos';
import { Md } from '../texto';
import { Boton } from '../ui';
import { Planilla } from './Planilla';
import { crearCtx, hojaInicial, type Hoja } from './ctx';

/** Solo las celdas que el alumno cambió respecto de la planilla inicial (para guardar poco en el servidor). */
const diferencias = (h: Hoja, ini: Hoja): Hoja => {
  const d: Hoja = {};
  for (const k of new Set([...Object.keys(h), ...Object.keys(ini)])) {
    if (JSON.stringify(h[k] ?? null) !== JSON.stringify(ini[k] ?? null)) d[k] = h[k] ?? { raw: '' };
  }
  return d;
};

export function RetoView({ id, reto, inicial, completadaAntes, mejor, onResultado }: { id: string; reto: RetoDef; inicial: any; completadaAntes: boolean; mejor: number; onResultado: (r: { puntaje: number; completada: boolean; estado: any }) => void }) {
  const base = useMemo(() => hojaInicial(reto.planilla.celdas), [reto]);
  const inicio = useMemo<Hoja>(() => ({ ...base, ...(inicial?.hoja ?? {}) }), []); // eslint-disable-line react-hooks/exhaustive-deps
  const [reinicio, setReinicio] = useState(0);
  const actual = useRef<Hoja>(inicio);
  const [resultados, setResultados] = useState<boolean[] | null>(null);
  const [pistas, setPistas] = useState(false);
  const [intentos, setIntentos] = useState(0);

  const comprobar = () => {
    const ctx = crearCtx(actual.current);
    const r = reto.checks.map((c) => { try { return !!c.ok(ctx); } catch { return false; } });
    setResultados(r); setIntentos((n) => n + 1);
    const ok = r.filter(Boolean).length;
    onResultado({ puntaje: Math.round((ok / r.length) * 100), completada: ok === r.length, estado: { hoja: diferencias(actual.current, base) } });
  };
  const empezar = () => { actual.current = base; setResultados(null); setReinicio((n) => n + 1); };

  const todos = resultados?.every(Boolean);
  return (
    <div className="anim-subir space-y-4">
      <div className="rounded-xl bg-navy-soft p-4 ring-1 ring-navy/15"><Md texto={reto.md} /></div>

      {reto.datos && (
        <details className="rounded-xl bg-white ring-1 ring-slate-200" open>
          <summary className="cursor-pointer select-none px-4 py-2.5 text-sm font-bold text-navy">📋 {reto.datos.titulo}</summary>
          <div className="overflow-x-auto px-4 pb-3">
            <table className="text-sm">
              <tbody>{reto.datos.filas.map((f, i) => <tr key={i}>{f.map((c, j) => <td key={j} className={`border border-slate-300 px-3 py-1 ${i === 0 ? 'bg-slate-100 font-bold' : ''}`}>{c}</td>)}</tr>)}</tbody>
            </table>
          </div>
        </details>
      )}

      <Planilla key={`${id}-${reinicio}`} def={reto.planilla} inicial={reinicio ? base : inicio} onCambio={(h) => { actual.current = h; }} />

      <div className="flex flex-wrap items-center gap-3">
        <Boton onClick={comprobar}><Check size={18} /> Comprobar</Boton>
        <Boton variante="fantasma" onClick={empezar}><RotateCcw size={16} /> Empezar de nuevo</Boton>
        {reto.pistas && <Boton variante="suave" onClick={() => setPistas((p) => !p)}><Lightbulb size={16} /> {pistas ? 'Ocultar pistas' : 'Necesito una pista'}</Boton>}
        {!resultados && completadaAntes && <span className="text-sm font-semibold text-emerald-700">✔ Ya lo completaste (mejor puntaje: {mejor}%)</span>}
      </div>
      {pistas && reto.pistas && <ul className="space-y-1 rounded-xl bg-amber-50 p-3 text-sm text-amber-900 ring-1 ring-amber-200">{reto.pistas.map((p, i) => <li key={i}>💡 {p}</li>)}</ul>}

      {resultados && (
        <div className={`anim-pop rounded-2xl p-4 ring-1 ${todos ? 'bg-emerald-50 ring-emerald-300' : 'bg-white ring-slate-200'}`}>
          <p className={`mb-2 font-bold ${todos ? 'text-emerald-800' : 'text-slate-800'}`}>{todos ? '🎉 ¡Reto superado! Todo está correcto.' : `Vas bien: ${resultados.filter(Boolean).length} de ${resultados.length} puntos.`}</p>
          <ul className="space-y-1.5">
            {reto.checks.map((c, i) => (
              <li key={c.id} className="flex items-start gap-2 text-sm">
                {resultados[i] ? <Check size={18} className="mt-0.5 flex-none text-emerald-600" /> : intentos > 0 ? <X size={18} className="mt-0.5 flex-none text-rose-600" /> : <CircleDashed size={18} />}
                <span><span className={resultados[i] ? 'text-slate-700' : 'font-semibold text-slate-900'}>{c.texto}</span>{!resultados[i] && c.pista && <span className="block text-rose-700">💡 {c.pista}</span>}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
