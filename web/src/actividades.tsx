import { useMemo, useRef, useState } from 'react';
import { ArrowDown, ArrowUp, Check, GripVertical, RotateCcw, X } from 'lucide-react';
import type { Actividad } from './contenido/tipos';
import { normResp } from './contenido/ayudas';
import { Inline } from './texto';
import { Boton } from './ui';
import { Marcador, useMarcas } from './Figura';

/** Resultado de comprobar una actividad: puntaje 0-100 y, por ítem, si está bien. */
export interface Evaluacion { puntaje: number; items: boolean[] }

const barajar = <T,>(a: T[], semilla: string): T[] => {
  let h = 2166136261; for (const ch of semilla) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  const r = () => { h = Math.imul(h ^ (h >>> 15), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); h ^= h >>> 16; return (h >>> 0) / 4294967296; };
  const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; }
  return b;
};
const pct = (ok: boolean[]) => (ok.length ? Math.round((ok.filter(Boolean).length / ok.length) * 100) : 100);

// ------------------------------------------------------------------ cloze
type Trozo = { t: string } | { hueco: number; alt: string[] };
function trocear(items: string[]): { lineas: Trozo[][]; total: number } {
  let n = 0;
  const lineas = items.map((it) => it.split(/(\{\{.+?\}\})/g).filter((s) => s !== '').map((s): Trozo => (s.startsWith('{{') ? { hueco: n++, alt: s.slice(2, -2).split('|') } : { t: s })));
  return { lineas, total: n };
}

function Cloze({ act, estado, setEstado, ev }: { act: Extract<Actividad, { k: 'cloze' }>; estado: any; setEstado: (e: any) => void; ev: Evaluacion | null }) {
  const { lineas, total } = useMemo(() => trocear(act.items), [act]);
  const resp: string[] = estado.resp ?? Array(total).fill('');
  const poner = (i: number, v: string) => { const r = [...resp]; r[i] = v; setEstado({ resp: r }); };
  const banco = useMemo(() => (act.banco ? [...act.banco].sort((a, b) => a.localeCompare(b, 'es')) : null), [act]);
  return (
    <div>
      {act.banco && <div className="mb-3 flex flex-wrap gap-1.5 rounded-xl bg-slate-50 p-2.5 ring-1 ring-dashed ring-slate-300"><span className="text-xs font-bold uppercase tracking-wide text-slate-500">Banco de palabras</span>{banco!.map((b) => <span key={b} className="rounded-full bg-white px-2.5 py-0.5 text-sm ring-1 ring-slate-300">{b}</span>)}</div>}
      <ol className="space-y-3">
        {lineas.map((ln, i) => (
          <li key={i} className="flex flex-wrap items-center gap-y-2 leading-8"><span className="mr-2 font-bold text-slate-400">{i + 1}.</span>
            {ln.map((p, j) => {
              if ('t' in p) return <span key={j}><Inline t={p.t} /></span>;
              const bien = ev ? ev.items[p.hueco] : undefined;
              const cls = `mx-1 min-w-[7rem] rounded-lg border-2 bg-white px-2 py-1 text-base outline-none transition ${bien === undefined ? 'border-slate-300 focus:border-excel' : bien ? 'border-emerald-500 bg-emerald-50' : 'border-rose-400 bg-rose-50 anim-sacudir'}`;
              return banco
                ? <select key={j} value={resp[p.hueco]} disabled={!!ev} onChange={(e) => poner(p.hueco, e.target.value)} className={cls}><option value="">elige…</option>{banco.map((b) => <option key={b} value={b}>{b}</option>)}</select>
                : <input key={j} value={resp[p.hueco]} disabled={!!ev} onChange={(e) => poner(p.hueco, e.target.value)} className={cls} style={{ width: `${Math.max(7, p.alt[0].length + 2)}ch` }} placeholder="…" />;
            })}
          </li>
        ))}
      </ol>
      {ev && ev.items.some((x) => !x) && <p className="mt-3 text-sm text-rose-700">Revisa las casillas en rojo. Vuelve a leer la lectura de arriba si lo necesitas.</p>}
    </div>
  );
}
const evaluarCloze = (act: Extract<Actividad, { k: 'cloze' }>, e: any): Evaluacion => {
  const { lineas, total } = trocear(act.items);
  const resp: string[] = e.resp ?? Array(total).fill('');
  const alts = lineas.flat().filter((p): p is Extract<Trozo, { hueco: number }> => 'hueco' in p);
  const items = alts.map((p) => p.alt.some((a) => normResp(a) === normResp(resp[p.hueco] ?? '')));
  return { puntaje: pct(items), items };
};

// ------------------------------------------------------------------ une
function Une({ act, estado, setEstado, ev }: { act: Extract<Actividad, { k: 'une' }>; estado: any; setEstado: (e: any) => void; ev: Evaluacion | null }) {
  const pares: (number | null)[] = estado.pares ?? Array(act.izq.length).fill(null);
  const [izq, setIzq] = useState<number | null>(null);
  const colores = ['bg-sky-500', 'bg-violet-500', 'bg-amber-500', 'bg-pink-500', 'bg-teal-500', 'bg-orange-500', 'bg-lime-600', 'bg-indigo-500'];
  const elegirDer = (d: number) => {
    if (ev || izq === null) return;
    const p = pares.map((x) => (x === d ? null : x)); p[izq] = d; setEstado({ pares: p }); setIzq(null);
  };
  const quitar = (i: number) => { if (ev) return; const p = [...pares]; p[i] = null; setEstado({ pares: p }); };
  return (
    <div>
      <p className="mb-2 text-sm text-slate-500">Toca un elemento de la izquierda y luego su pareja de la derecha. Para deshacer, toca de nuevo el de la izquierda.</p>
      <div className="grid gap-3 md:grid-cols-2">
        <ul className="space-y-2">
          {act.izq.map((t, i) => {
            const c = pares[i] !== null ? colores[i % colores.length] : '';
            const bien = ev ? ev.items[i] : undefined;
            return (
              <li key={i}>
                <button type="button" onClick={() => (pares[i] !== null && izq !== i ? quitar(i) : setIzq(izq === i ? null : i))} className={`flex w-full items-center gap-2 rounded-xl border-2 bg-white px-3 py-2 text-left text-sm transition ${izq === i ? 'border-excel ring-4 ring-excel/20' : bien === undefined ? 'border-slate-200 hover:border-slate-400' : bien ? 'border-emerald-500 bg-emerald-50' : 'border-rose-400 bg-rose-50'}`}>
                  <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-slate-200 text-xs font-bold">{i + 1}</span>
                  <span className="flex-1"><Inline t={t} /></span>
                  {pares[i] !== null && <span className={`flex h-6 w-6 flex-none items-center justify-center rounded-full text-xs font-bold text-white ${c}`}>{String.fromCharCode(65 + pares[i]!)}</span>}
                </button>
              </li>
            );
          })}
        </ul>
        <ul className="space-y-2">
          {act.der.map((t, d) => {
            const dueño = pares.findIndex((x) => x === d);
            return (
              <li key={d}>
                <button type="button" onClick={() => elegirDer(d)} className={`flex w-full items-center gap-2 rounded-xl border-2 bg-white px-3 py-2 text-left text-sm transition ${izq !== null && !ev ? 'border-dashed border-excel/60 hover:bg-excel-soft' : 'border-slate-200'}`}>
                  <span className={`flex h-6 w-6 flex-none items-center justify-center rounded-full text-xs font-bold ${dueño >= 0 ? `text-white ${colores[dueño % colores.length]}` : 'bg-slate-200'}`}>{String.fromCharCode(65 + d)}</span>
                  <span className="flex-1"><Inline t={t} /></span>
                  {dueño >= 0 && <span className="text-xs font-semibold text-slate-500">↔ {dueño + 1}</span>}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
const evaluarUne = (act: Extract<Actividad, { k: 'une' }>, e: any): Evaluacion => { const p: (number | null)[] = e.pares ?? []; const items = act.izq.map((_, i) => p[i] === act.correcta[i]); return { puntaje: pct(items), items }; };

// ------------------------------------------------------------------ clasifica
function Clasifica({ act, estado, setEstado, ev }: { act: Extract<Actividad, { k: 'clasifica' }>; estado: any; setEstado: (e: any) => void; ev: Evaluacion | null }) {
  const sel: (number | null)[] = estado.sel ?? Array(act.items.length).fill(null);
  return (
    <ul className="space-y-2.5">
      {act.items.map((it, i) => {
        const bien = ev ? ev.items[i] : undefined;
        return (
          <li key={i} className={`flex flex-wrap items-center gap-2 rounded-xl border-2 bg-white px-3 py-2 ${bien === undefined ? 'border-slate-200' : bien ? 'border-emerald-500 bg-emerald-50' : 'border-rose-400 bg-rose-50 anim-sacudir'}`}>
            <span className="min-w-[10rem] flex-1 font-medium"><Inline t={it.t} /></span>
            <div className="flex flex-wrap gap-1.5">
              {act.categorias.map((c, j) => (
                <button key={j} type="button" disabled={!!ev} onClick={() => { const s = [...sel]; s[i] = j; setEstado({ sel: s }); }} className={`rounded-full px-3 py-1 text-sm font-semibold transition ${sel[i] === j ? 'bg-excel text-white shadow' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>{c}</button>
              ))}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
const evaluarClasifica = (act: Extract<Actividad, { k: 'clasifica' }>, e: any): Evaluacion => { const s: (number | null)[] = e.sel ?? []; const items = act.items.map((it, i) => s[i] === it.r); return { puntaje: pct(items), items }; };

// ------------------------------------------------------------------ verdadero / falso
function VF({ act, estado, setEstado, ev }: { act: Extract<Actividad, { k: 'vf' }>; estado: any; setEstado: (e: any) => void; ev: Evaluacion | null }) {
  const sel: (boolean | null)[] = estado.sel ?? Array(act.items.length).fill(null);
  return (
    <ul className="space-y-2.5">
      {act.items.map((it, i) => {
        const bien = ev ? ev.items[i] : undefined;
        return (
          <li key={i} className={`rounded-xl border-2 bg-white px-3 py-2.5 ${bien === undefined ? 'border-slate-200' : bien ? 'border-emerald-500 bg-emerald-50' : 'border-rose-400 bg-rose-50 anim-sacudir'}`}>
            <div className="flex flex-wrap items-center gap-3">
              <span className="min-w-[12rem] flex-1"><Inline t={it.t} /></span>
              <div className="flex gap-1.5">
                {[true, false].map((v) => <button key={String(v)} type="button" disabled={!!ev} onClick={() => { const s = [...sel]; s[i] = v; setEstado({ sel: s }); }} className={`w-24 rounded-full py-1 text-sm font-bold transition ${sel[i] === v ? (v ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white') : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>{v ? 'Verdadero' : 'Falso'}</button>)}
              </div>
            </div>
            {ev && !bien && it.why && <p className="mt-1.5 text-sm text-rose-700">{it.why}</p>}
          </li>
        );
      })}
    </ul>
  );
}
const evaluarVF = (act: Extract<Actividad, { k: 'vf' }>, e: any): Evaluacion => { const s: (boolean | null)[] = e.sel ?? []; const items = act.items.map((it, i) => s[i] === it.r); return { puntaje: pct(items), items }; };

// ------------------------------------------------------------------ ordenar pasos
function Ordena({ act, id, estado, setEstado, ev }: { act: Extract<Actividad, { k: 'ordena' }>; id: string; estado: any; setEstado: (e: any) => void; ev: Evaluacion | null }) {
  const inicial = useMemo(() => barajar(act.items.map((_, i) => i), id), [act, id]);
  const orden: number[] = estado.orden ?? inicial;
  const arrastrando = useRef<number | null>(null);
  const mover = (de: number, a: number) => { if (ev || a < 0 || a >= orden.length) return; const o = [...orden]; const [x] = o.splice(de, 1); o.splice(a, 0, x); setEstado({ orden: o }); };
  return (
    <div>
      <p className="mb-2 text-sm text-slate-500">Arrastra los pasos (o usa las flechas) hasta dejarlos en el orden correcto.</p>
      <ol className="space-y-2">
        {orden.map((idx, pos) => {
          const bien = ev ? ev.items[pos] : undefined;
          return (
            <li key={idx} draggable={!ev} onDragStart={() => (arrastrando.current = pos)} onDragOver={(e) => e.preventDefault()} onDrop={() => { if (arrastrando.current !== null) mover(arrastrando.current, pos); arrastrando.current = null; }}
              className={`flex items-center gap-2 rounded-xl border-2 bg-white px-2 py-2 transition ${bien === undefined ? 'border-slate-200' : bien ? 'border-emerald-500 bg-emerald-50' : 'border-rose-400 bg-rose-50'}`}>
              <GripVertical size={18} className="flex-none cursor-grab text-slate-400" />
              <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-excel text-xs font-bold text-white">{pos + 1}</span>
              <span className="flex-1 text-sm"><Inline t={act.items[idx]} /></span>
              <button type="button" disabled={!!ev || pos === 0} onClick={() => mover(pos, pos - 1)} className="rounded-md p-1 text-slate-500 hover:bg-slate-100 disabled:opacity-30"><ArrowUp size={16} /></button>
              <button type="button" disabled={!!ev || pos === orden.length - 1} onClick={() => mover(pos, pos + 1)} className="rounded-md p-1 text-slate-500 hover:bg-slate-100 disabled:opacity-30"><ArrowDown size={16} /></button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
const evaluarOrdena = (act: Extract<Actividad, { k: 'ordena' }>, e: any, id: string): Evaluacion => { const o: number[] = e.orden ?? barajar(act.items.map((_, i) => i), id); const items = o.map((v, i) => v === i); return { puntaje: pct(items), items }; };

// ------------------------------------------------------------------ rotular figura
function Rotula({ act, estado, setEstado, ev }: { act: Extract<Actividad, { k: 'rotula' }>; estado: any; setEstado: (e: any) => void; ev: Evaluacion | null }) {
  const d = useMarcas(act.figura);
  const sel: string[] = estado.sel ?? Array(act.nombres.length).fill('');
  const [foco, setFoco] = useState<number | null>(null);
  const opciones = useMemo(() => [...act.nombres].sort((a, b) => a.localeCompare(b, 'es')), [act]);
  return (
    <div>
      <div className="relative overflow-hidden rounded-xl ring-1 ring-slate-300">
        <img src={`/capturas/${act.figura}.png`} alt="" className="block w-full" />
        {d && d.marcas.map((m) => <Marcador key={m.n} n={m.n} x={(m.x / d.w) * 100} y={(m.y / d.h) * 100} activo={foco === m.n} estado={ev ? (ev.items[m.n - 1] ? 'ok' : 'mal') : undefined} onClick={() => setFoco(m.n)} />)}
      </div>
      <ol className="mt-3 grid gap-2 sm:grid-cols-2">
        {act.nombres.map((_, i) => {
          const bien = ev ? ev.items[i] : undefined;
          return (
            <li key={i} className="flex items-center gap-2">
              <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">{i + 1}</span>
              <select value={sel[i]} disabled={!!ev} onFocus={() => setFoco(i + 1)} onChange={(e) => { const s = [...sel]; s[i] = e.target.value; setEstado({ sel: s }); }}
                className={`w-full rounded-lg border-2 bg-white px-2 py-1.5 text-sm ${bien === undefined ? 'border-slate-300' : bien ? 'border-emerald-500 bg-emerald-50' : 'border-rose-400 bg-rose-50'}`}>
                <option value="">¿Qué es?</option>{opciones.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
              {ev && !bien && <span className="hidden text-xs text-rose-700 sm:inline">→ {act.nombres[i]}</span>}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
const evaluarRotula = (act: Extract<Actividad, { k: 'rotula' }>, e: any): Evaluacion => { const s: string[] = e.sel ?? []; const items = act.nombres.map((n, i) => s[i] === n); return { puntaje: pct(items), items }; };

// ------------------------------------------------------------------ respuestas escritas
function Predice({ act, estado, setEstado, ev, intentos }: { act: Extract<Actividad, { k: 'predice' }>; estado: any; setEstado: (e: any) => void; ev: Evaluacion | null; intentos: number }) {
  const resp: string[] = estado.resp ?? Array(act.items.length).fill('');
  return (
    <ul className="space-y-3">
      {act.items.map((it, i) => {
        const bien = ev ? ev.items[i] : undefined;
        return (
          <li key={i} className="rounded-xl bg-white">
            <label className="mb-1 block text-sm font-medium"><span className="mr-1.5 font-bold text-slate-400">{i + 1}.</span><Inline t={it.q} /></label>
            <input value={resp[i]} disabled={!!ev} onChange={(e) => { const r = [...resp]; r[i] = e.target.value; setEstado({ resp: r }); }} spellCheck={false} autoComplete="off"
              className={`w-full rounded-lg border-2 px-3 py-2 font-mono text-[15px] outline-none transition ${bien === undefined ? 'border-slate-300 focus:border-excel' : bien ? 'border-emerald-500 bg-emerald-50' : 'border-rose-400 bg-rose-50 anim-sacudir'}`} placeholder="Escribe tu respuesta…" />
            {ev && !bien && <p className="mt-1 text-sm text-rose-700">{intentos >= 2 ? <>La respuesta es: <b className="font-mono">{it.r[0]}</b></> : it.pista ?? 'Revisa tu respuesta e inténtalo de nuevo.'}</p>}
          </li>
        );
      })}
    </ul>
  );
}
const evaluarPredice = (act: Extract<Actividad, { k: 'predice' }>, e: any): Evaluacion => { const r: string[] = e.resp ?? []; const items = act.items.map((it, i) => it.r.some((x) => normResp(x) === normResp(r[i] ?? ''))); return { puntaje: pct(items), items }; };

function Reflexion({ act, estado, setEstado, bloqueada }: { act: Extract<Actividad, { k: 'reflexion' }>; estado: any; setEstado: (e: any) => void; bloqueada: boolean }) {
  return (
    <div>
      <p className="mb-2 font-medium"><Inline t={act.pregunta} /></p>
      <textarea value={estado.texto ?? ''} disabled={bloqueada} onChange={(e) => setEstado({ texto: e.target.value })} rows={4} maxLength={800} className="w-full rounded-xl border-2 border-slate-300 p-3 outline-none focus:border-excel" placeholder="Escribe aquí con tus palabras…" />
      <p className="text-right text-xs text-slate-400">{(estado.texto ?? '').length}/800</p>
    </div>
  );
}

// ------------------------------------------------------------------ envoltorio
export function ActividadView({ id, act, inicial, completadaAntes, mejor, onResultado }: { id: string; act: Actividad; inicial: any; completadaAntes: boolean; mejor: number; onResultado: (r: { puntaje: number; completada: boolean; estado: any }) => void }) {
  const [estado, setEstadoLocal] = useState<any>(inicial ?? {});
  const [ev, setEv] = useState<Evaluacion | null>(null);
  const [intentos, setIntentos] = useState(0);
  const setEstado = (e: any) => setEstadoLocal(e);

  const evaluar = (): Evaluacion => {
    switch (act.k) {
      case 'cloze': return evaluarCloze(act, estado);
      case 'une': return evaluarUne(act, estado);
      case 'clasifica': return evaluarClasifica(act, estado);
      case 'vf': return evaluarVF(act, estado);
      case 'ordena': return evaluarOrdena(act, estado, id);
      case 'rotula': return evaluarRotula(act, estado);
      case 'predice': return evaluarPredice(act, estado);
      default: return { puntaje: 100, items: [] };
    }
  };
  const comprobar = () => {
    if (act.k === 'reflexion') { if ((estado.texto ?? '').trim().length < 15) return; setEv({ puntaje: 100, items: [] }); onResultado({ puntaje: 100, completada: true, estado }); return; }
    const r = evaluar(); setEv(r); setIntentos((n) => n + 1);
    onResultado({ puntaje: r.puntaje, completada: r.puntaje >= 70, estado });
  };
  const reintentar = () => { setEv(null); if (act.k === 'cloze') setEstadoLocal({ resp: (estado.resp ?? []).map((v: string, i: number) => (evaluarCloze(act, estado).items[i] ? v : '')) }); };

  const listo = (() => {
    switch (act.k) {
      case 'cloze': return (estado.resp ?? []).some((x: string) => x?.trim());
      case 'une': return (estado.pares ?? []).some((x: number | null) => x !== null);
      case 'clasifica': case 'vf': return (estado.sel ?? []).some((x: unknown) => x !== null && x !== undefined && x !== '');
      case 'rotula': return (estado.sel ?? []).some((x: string) => x);
      case 'predice': return (estado.resp ?? []).some((x: string) => x?.trim());
      case 'ordena': return true;
      case 'reflexion': return (estado.texto ?? '').trim().length >= 15;
    }
  })();

  return (
    <div className="anim-subir">
      {'intro' in act && act.intro && <p className="mb-3 text-[15px] text-slate-600"><Inline t={act.intro} /></p>}
      {act.k === 'cloze' && <Cloze act={act} estado={estado} setEstado={setEstado} ev={ev} />}
      {act.k === 'une' && <Une act={act} estado={estado} setEstado={setEstado} ev={ev} />}
      {act.k === 'clasifica' && <Clasifica act={act} estado={estado} setEstado={setEstado} ev={ev} />}
      {act.k === 'vf' && <VF act={act} estado={estado} setEstado={setEstado} ev={ev} />}
      {act.k === 'ordena' && <Ordena act={act} id={id} estado={estado} setEstado={setEstado} ev={ev} />}
      {act.k === 'rotula' && <Rotula act={act} estado={estado} setEstado={setEstado} ev={ev} />}
      {act.k === 'predice' && <Predice act={act} estado={estado} setEstado={setEstado} ev={ev} intentos={intentos} />}
      {act.k === 'reflexion' && <Reflexion act={act} estado={estado} setEstado={setEstado} bloqueada={!!ev} />}

      <div className="mt-5 flex flex-wrap items-center gap-3">
        {!ev ? <Boton onClick={comprobar} disabled={!listo}><Check size={18} /> {act.k === 'reflexion' ? 'Guardar mi reflexión' : 'Comprobar'}</Boton>
          : <>
            <Resultado ev={ev} reflexion={act.k === 'reflexion'} />
            {act.k !== 'reflexion' && ev.puntaje < 100 && <Boton variante="suave" onClick={reintentar}><RotateCcw size={16} /> Intentar de nuevo</Boton>}
          </>}
        {!ev && completadaAntes && <span className="text-sm font-semibold text-emerald-700">✔ Ya la completaste (mejor puntaje: {mejor}%)</span>}
      </div>
    </div>
  );
}

function Resultado({ ev, reflexion }: { ev: Evaluacion; reflexion: boolean }) {
  const mal = ev.items.filter((x) => !x).length;
  const [txt, tono] = reflexion ? ['¡Gracias por compartir tu reflexión!', 'ok'] : ev.puntaje === 100 ? ['¡Perfecto! Todo correcto.', 'ok'] : ev.puntaje >= 70 ? [`¡Bien! ${mal} por corregir.`, 'ok'] : [`Puedes mejorarlo: ${mal} por corregir.`, 'mal'];
  return (
    <div className={`anim-pop flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold ${tono === 'ok' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'}`}>
      {tono === 'ok' ? <Check size={18} /> : <X size={18} />} {txt} {!reflexion && <span className="rounded-full bg-white/70 px-2 py-0.5">{ev.puntaje}%</span>}
    </div>
  );
}
