import { useEffect, useMemo, useState } from 'react';
import { ArrowDownAZ, BarChart3, Check, Filter, PieChart, Paintbrush } from 'lucide-react';
import { gs, ventasCalc } from './contenido/datos';
import { Boton } from './ui';

type Col = 'fecha' | 'vendedor' | 'producto' | 'cantidad' | 'categoria' | 'precio' | 'total';
const COLS: { k: Col; t: string; num?: boolean }[] = [{ k: 'fecha', t: 'Fecha' }, { k: 'vendedor', t: 'Vendedor' }, { k: 'producto', t: 'Producto' }, { k: 'cantidad', t: 'Cantidad', num: true }, { k: 'categoria', t: 'Categoría' }, { k: 'precio', t: 'Precio', num: true }, { k: 'total', t: 'Total', num: true }];
const VENDEDORES = ['Ana', 'Luis', 'María'];

interface Estado { orden: { col: Col; desc: boolean } | null; filtro: string[] | null; regla: { op: 'gte' | 'gt' | 'lt'; valor: number } | null; grafico: 'col' | 'circ' | null }

export function Laboratorio({ inicial, completadaAntes, mejor, onResultado }: { inicial: any; completadaAntes: boolean; mejor: number; onResultado: (r: { puntaje: number; completada: boolean; estado: any }) => void }) {
  const [e, setE] = useState<Estado>({ orden: null, filtro: null, regla: null, grafico: null, ...(inicial ?? {}) });
  const [menu, setMenu] = useState<null | 'ordenar' | 'filtro' | 'regla'>(null);
  const [colOrden, setColOrden] = useState<Col>('total');
  const [desc, setDesc] = useState(true);
  const [marcados, setMarcados] = useState<string[]>(VENDEDORES);
  const [op, setOp] = useState<'gte' | 'gt' | 'lt'>('gte');
  const [valor, setValor] = useState('1000000');

  const filas = useMemo(() => {
    let f = [...ventasCalc];
    if (e.filtro) f = f.filter((x) => e.filtro!.includes(x.vendedor));
    if (e.orden) { const { col, desc: d } = e.orden; f.sort((a: any, b: any) => (a[col] < b[col] ? -1 : a[col] > b[col] ? 1 : 0) * (d ? -1 : 1)); }
    return f;
  }, [e]);

  const misiones = [
    { t: 'Ordena la tabla por Total, de mayor a menor', ok: e.orden?.col === 'total' && e.orden.desc },
    { t: 'Filtra solo las ventas de Ana', ok: !!e.filtro && e.filtro.length === 1 && e.filtro[0] === 'Ana' },
    { t: 'Resalta en verde las ventas de 1.000.000 o más (Es mayor o igual que 1000000)', ok: e.regla?.op === 'gte' && e.regla.valor === 1000000 },
    { t: 'Inserta un gráfico de columnas con el total por vendedor', ok: e.grafico === 'col' },
  ];
  const hechas = misiones.filter((m) => m.ok).length;
  const todas = hechas === misiones.length;
  const cumple = (t: number) => !!e.regla && (e.regla.op === 'gte' ? t >= e.regla.valor : e.regla.op === 'gt' ? t > e.regla.valor : t < e.regla.valor);

  // guarda el avance cada vez que cambia una misión
  useEffect(() => {
    if (hechas > 0 || e.orden || e.filtro || e.regla || e.grafico) onResultado({ puntaje: Math.round((hechas / misiones.length) * 100), completada: todas, estado: e });
  }, [hechas]); // eslint-disable-line react-hooks/exhaustive-deps

  const totales = VENDEDORES.map((v) => ({ v, t: ventasCalc.filter((x) => x.vendedor === v).reduce((s, x) => s + x.total, 0) }));
  const max = Math.max(...totales.map((x) => x.t));
  const suma = totales.reduce((s, x) => s + x.t, 0);
  const COLORES = ['#4472c4', '#ed7d31', '#a5a5a5'];

  return (
    <div className="anim-subir space-y-4">
      <div className="rounded-xl bg-navy-soft p-4 ring-1 ring-navy/15">
        <p className="mb-2 font-bold text-navy">🧪 Misiones del laboratorio</p>
        <ul className="space-y-1.5">
          {misiones.map((m, i) => (
            <li key={i} className={`flex items-start gap-2 rounded-lg px-2 py-1 text-sm ${m.ok ? 'bg-emerald-100 text-emerald-900' : 'bg-white'}`}>
              <span className={`mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full text-xs font-bold ${m.ok ? 'bg-emerald-600 text-white' : 'bg-slate-200'}`}>{m.ok ? <Check size={13} /> : i + 1}</span>{m.t}
            </li>
          ))}
        </ul>
        {todas && <p className="anim-pop mt-3 rounded-lg bg-emerald-600 px-3 py-2 text-center font-bold text-white">🎉 ¡Laboratorio completado!</p>}
        {!todas && completadaAntes && <p className="mt-2 text-sm font-semibold text-emerald-700">✔ Ya lo completaste antes (mejor puntaje: {mejor}%)</p>}
      </div>

      <div className="xl">
        <div className="xl-titulo"><span>💾</span><b className="font-semibold">Clase3_ventas - Excel</b></div>
        <div className="xl-tabs"><span style={{ background: '#185c37', fontWeight: 600 }}>Archivo</span><span>Inicio</span><span>Insertar</span><span>Fórmulas</span><span className="act">Datos</span><span>Vista</span></div>
        <div className="xl-cinta relative">
          <div className="xl-grupo">
            <button className={`xl-btn ${menu === 'ordenar' ? 'on' : ''}`} onClick={() => setMenu(menu === 'ordenar' ? null : 'ordenar')}><ArrowDownAZ size={16} /> Ordenar</button>
            <button className={`xl-btn ${e.filtro || menu === 'filtro' ? 'on' : ''}`} onClick={() => setMenu(menu === 'filtro' ? null : 'filtro')}><Filter size={16} /> Filtro</button>
            <button className="xl-btn" disabled={!e.orden && !e.filtro} onClick={() => setE({ ...e, orden: null, filtro: null })}>✕ Borrar</button>
          </div>
          <div className="xl-grupo">
            <button className={`xl-btn ${e.regla || menu === 'regla' ? 'on' : ''}`} onClick={() => setMenu(menu === 'regla' ? null : 'regla')}><Paintbrush size={16} /> Formato condicional</button>
          </div>
          <div className="xl-grupo">
            <button className={`xl-btn ${e.grafico === 'col' ? 'on' : ''}`} onClick={() => setE({ ...e, grafico: e.grafico === 'col' ? null : 'col' })}><BarChart3 size={16} /> Gráfico de columnas</button>
            <button className={`xl-btn ${e.grafico === 'circ' ? 'on' : ''}`} onClick={() => setE({ ...e, grafico: e.grafico === 'circ' ? null : 'circ' })}><PieChart size={16} /> Circular</button>
          </div>
          {menu && (
            <div className="absolute left-3 top-12 z-30 w-80 rounded-xl border bg-white p-4 text-sm shadow-xl">
              {menu === 'ordenar' && <>
                <p className="mb-2 font-bold">Ordenar</p>
                <label className="mb-2 block">Ordenar por<select value={colOrden} onChange={(x) => setColOrden(x.target.value as Col)} className="mt-1 w-full rounded border p-1.5">{COLS.map((c) => <option key={c.k} value={c.k}>{c.t}</option>)}</select></label>
                <label className="mb-3 block">Criterio<select value={desc ? 'd' : 'a'} onChange={(x) => setDesc(x.target.value === 'd')} className="mt-1 w-full rounded border p-1.5"><option value="a">De menor a mayor (A→Z)</option><option value="d">De mayor a menor (Z→A)</option></select></label>
                <Boton onClick={() => { setE({ ...e, orden: { col: colOrden, desc } }); setMenu(null); }}>Aceptar</Boton>
              </>}
              {menu === 'filtro' && <>
                <p className="mb-2 font-bold">Filtrar por Vendedor</p>
                {VENDEDORES.map((v) => <label key={v} className="flex items-center gap-2 py-0.5"><input type="checkbox" checked={marcados.includes(v)} onChange={() => setMarcados(marcados.includes(v) ? marcados.filter((x) => x !== v) : [...marcados, v])} /> {v}</label>)}
                <div className="mt-3 flex gap-2"><Boton onClick={() => { setE({ ...e, filtro: marcados.length === VENDEDORES.length || marcados.length === 0 ? null : marcados }); setMenu(null); }}>Aceptar</Boton><Boton variante="fantasma" onClick={() => setMenu(null)}>Cancelar</Boton></div>
              </>}
              {menu === 'regla' && <>
                <p className="mb-2 font-bold">Formato condicional (columna Total)</p>
                <label className="mb-2 block">Dar formato a las celdas que sean<select value={op} onChange={(x) => setOp(x.target.value as any)} className="mt-1 w-full rounded border p-1.5"><option value="gte">Mayores o iguales que</option><option value="gt">Mayores que</option><option value="lt">Menores que</option></select></label>
                <label className="mb-3 block">Valor<input value={valor} onChange={(x) => setValor(x.target.value.replace(/\D/g, ''))} className="mt-1 w-full rounded border p-1.5" inputMode="numeric" /></label>
                <p className="mb-3 text-xs text-slate-500">Relleno verde claro con texto verde oscuro.</p>
                <div className="flex gap-2"><Boton onClick={() => { setE({ ...e, regla: { op, valor: Number(valor) || 0 } }); setMenu(null); }}>Aceptar</Boton>{e.regla && <Boton variante="fantasma" onClick={() => { setE({ ...e, regla: null }); setMenu(null); }}>Borrar regla</Boton>}</div>
              </>}
            </div>
          )}
        </div>
        <div className="xl-scroll">
          <table className="w-full border-collapse text-[15px]" style={{ fontFamily: 'Calibri, Segoe UI, sans-serif' }}>
            <thead><tr>{COLS.map((c) => <th key={c.k} className="sticky top-0 border border-slate-400 bg-navy px-3 py-1 text-left text-white">{c.t}{(e.filtro && c.k === 'vendedor') ? ' ▼' : ''}{e.orden?.col === c.k ? (e.orden.desc ? ' ↓' : ' ↑') : ''}</th>)}</tr></thead>
            <tbody>
              {filas.map((f, i) => (
                <tr key={`${f.fecha}-${f.producto}-${f.vendedor}-${i}`}>{COLS.map((c) => {
                  const v = (f as any)[c.k]; const verde = c.k === 'total' && cumple(f.total);
                  return <td key={c.k} className={`border border-slate-300 px-3 py-0.5 ${c.num ? 'text-right' : ''}`} style={verde ? { background: '#c6efce', color: '#006100' } : undefined}>{c.k === 'precio' || c.k === 'total' ? gs(v) : v}</td>;
                })}</tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="xl-pie"><span>{filas.length} de {ventasCalc.length} registros{e.filtro ? ' · filtro activo' : ''}</span><span>100%</span></div>
      </div>

      {e.grafico && (
        <div className="anim-pop rounded-2xl bg-white p-4 ring-1 ring-slate-300">
          <p className="mb-2 text-center text-lg font-semibold">Total vendido por vendedor</p>
          {e.grafico === 'col' ? (
            <svg viewBox="0 0 440 260" className="mx-auto w-full max-w-lg">
              {[0, 1, 2, 3, 4].map((i) => <g key={i}><line x1="70" x2="420" y1={210 - i * 42} y2={210 - i * 42} stroke="#d9d9d9" /><text x="64" y={214 - i * 42} textAnchor="end" fontSize="11" fill="#555">{gs((max * 1.2 * i) / 4)}</text></g>)}
              {totales.map((x, i) => { const h = (170 * x.t) / (max * 1.2); return <g key={x.v}><rect x={95 + i * 110} y={210 - h} width="64" height={h} fill="#4472c4" /><text x={127 + i * 110} y={230} textAnchor="middle" fontSize="13">{x.v}</text><text x={127 + i * 110} y={204 - h} textAnchor="middle" fontSize="11" fill="#333">{gs(x.t)}</text></g>; })}
            </svg>
          ) : (
            <div className="flex flex-wrap items-center justify-center gap-6">
              <svg viewBox="-110 -110 220 220" className="w-48">{(() => { let a = -Math.PI / 2; return totales.map((x, i) => { const ang = (x.t / suma) * Math.PI * 2; const [x1, y1, x2, y2] = [100 * Math.cos(a), 100 * Math.sin(a), 100 * Math.cos(a + ang), 100 * Math.sin(a + ang)]; const d = `M0 0 L${x1} ${y1} A100 100 0 ${ang > Math.PI ? 1 : 0} 1 ${x2} ${y2}Z`; a += ang; return <path key={x.v} d={d} fill={COLORES[i]} stroke="#fff" strokeWidth="2" />; }); })()}</svg>
              <ul className="space-y-1 text-sm">{totales.map((x, i) => <li key={x.v}><span className="mr-2 inline-block h-3 w-3 rounded-sm" style={{ background: COLORES[i] }} />{x.v}: {Math.round((x.t / suma) * 100)}%</li>)}</ul>
            </div>
          )}
          {e.grafico === 'circ' && <p className="mt-2 text-center text-sm text-amber-700">El circular muestra partes de un total. Para esta misión necesitas el de <b>columnas</b>.</p>}
        </div>
      )}
    </div>
  );
}
