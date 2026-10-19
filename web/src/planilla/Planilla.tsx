import { useEffect, useMemo, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { AlignCenter, AlignLeft, AlignRight, Bold, Grid3x3, PaintBucket, Percent, Redo2, Undo2 } from 'lucide-react';
import { colLetra, esError, evaluar, mostrar, moverFormula, parseEntrada, parseRango, refDe, refsEnFormula, type Formato } from '../engine/formulas';
import type { PlanillaDef } from '../contenido/tipos';
import { hojaInicial, type EstadoCelda, type Hoja } from './ctx';

const ALTO = 24, ENC_ALTO = 22, ENC_ANCHO = 40;
const COLORES_REF = ['#4472c4', '#e0a030', '#70ad47', '#9e480e', '#7030a0', '#c00000'];
const PALETA = ['#ffd966', '#c6efce', '#ffc7ce', '#bdd7ee', '#f8cbad', '#d9d2e9', '#1F4E78', '#d9d9d9'];

interface Rect { r1: number; c1: number; r2: number; c2: number }
const norm = (a: { r: number; c: number }, b: { r: number; c: number }): Rect => ({ r1: Math.min(a.r, b.r), c1: Math.min(a.c, b.c), r2: Math.max(a.r, b.r), c2: Math.max(a.c, b.c) });
const puedeSenalar = (t: string) => t.startsWith('=') && /[=(+\-*/;,^&<>:]$/.test(t);

export function Planilla({ def, inicial, onCambio, titulo }: { def: PlanillaDef; inicial?: Hoja; onCambio?: (h: Hoja) => void; titulo?: string }) {
  const [hoja, setHoja] = useState<Hoja>(() => inicial ?? hojaInicial(def.celdas));
  const historial = useRef<Hoja[]>([]);
  const rehacer = useRef<Hoja[]>([]);
  const fijas = useMemo(() => new Set(Object.entries(def.celdas).filter(([, c]) => c.fijo).map(([r]) => r)), [def]);

  const anchos = useMemo(() => Array.from({ length: def.cols }, (_, i) => def.anchos?.[i] ?? 90), [def]);
  const xs = useMemo(() => { const a = [ENC_ANCHO]; anchos.forEach((w) => a.push(a[a.length - 1] + w)); return a; }, [anchos]);
  const W = xs[xs.length - 1], H = ENC_ALTO + def.filas * ALTO;

  const [activo, setActivo] = useState({ r: 0, c: 0 });
  const [ancla, setAncla] = useState({ r: 0, c: 0 });
  const [edit, setEdit] = useState<{ texto: string; desde: 'celda' | 'barra' } | null>(null);
  const [arrastre, setArrastre] = useState<null | 'sel' | 'ref' | 'relleno'>(null);
  const [destinoRelleno, setDestinoRelleno] = useState<{ r: number; c: number } | null>(null);
  const [colorAbierto, setColorAbierto] = useState(false);
  const [sacudir, setSacudir] = useState(0);
  const grid = useRef<HTMLDivElement>(null);
  const contenedor = useRef<HTMLDivElement>(null);
  const inputCelda = useRef<HTMLInputElement>(null);
  const inputBarra = useRef<HTMLInputElement>(null);
  const previa = useRef<{ r: number; c: number } | null>(null);

  const rect = norm(ancla, activo);
  const refActivo = refDe(activo.r, activo.c);
  const raws = useMemo(() => Object.fromEntries(Object.entries(hoja).map(([r, c]) => [r, c.raw])), [hoja]);
  const valores = useMemo(() => evaluar(raws), [raws]);

  useEffect(() => { onCambio?.(hoja); }, [hoja]); // eslint-disable-line react-hooks/exhaustive-deps

  const aplicar = (cambia: (h: Hoja) => Hoja, guardarHistorial = true) => {
    setHoja((h) => { if (guardarHistorial) { historial.current = [...historial.current.slice(-49), h]; rehacer.current = []; } return cambia(h); });
  };
  const deshacer = () => { const p = historial.current.pop(); if (!p) return; setHoja((h) => { rehacer.current.push(h); return p; }); };
  const rehacerAccion = () => { const p = rehacer.current.pop(); if (!p) return; setHoja((h) => { historial.current.push(h); return p; }); };

  const mover = (dr: number, dc: number, extender = false) => {
    const n = { r: Math.max(0, Math.min(def.filas - 1, activo.r + dr)), c: Math.max(0, Math.min(def.cols - 1, activo.c + dc)) };
    setActivo(n); if (!extender) setAncla(n);
    // mantener visible
    const sc = contenedor.current; if (sc) { const y = ENC_ALTO + n.r * ALTO; if (y < sc.scrollTop + ENC_ALTO) sc.scrollTop = y - ENC_ALTO; else if (y + ALTO > sc.scrollTop + sc.clientHeight) sc.scrollTop = y + ALTO - sc.clientHeight; }
  };

  const escribir = (ref: string, texto: string) => {
    if (fijas.has(ref)) { setSacudir((n) => n + 1); return; }
    aplicar((h) => {
      const prev = h[ref] ?? { raw: '' };
      const t = texto;
      const fmt = /^-?\d+(,\d+)?\s*%$/.test(t.trim()) ? 'pct' : prev.fmt === 'pct' && !/%/.test(t) && parseEntrada(t) !== null && typeof parseEntrada(t) === 'number' && !t.startsWith('=') ? undefined : prev.fmt;
      if (t === '' && !prev.b && !prev.fill && !prev.borde && !prev.fmt && !prev.al) { const { [ref]: _x, ...resto } = h; return resto; }
      return { ...h, [ref]: { ...prev, raw: t, fmt } };
    });
  };

  const iniciarEdicion = (texto: string, desde: 'celda' | 'barra' = 'celda') => {
    if (fijas.has(refActivo)) { setSacudir((n) => n + 1); return; }
    // flushSync: el cuadro de edición existe y tiene el foco ANTES de la siguiente tecla (si no, se pierden letras al escribir rápido)
    flushSync(() => setEdit({ texto, desde }));
    const inp = desde === 'celda' ? inputCelda.current : inputBarra.current;
    if (inp) { inp.focus(); inp.setSelectionRange(texto.length, texto.length); }
  };
  const confirmar = (dr: number, dc: number) => {
    if (!edit) return;
    escribir(refActivo, edit.texto);
    flushSync(() => setEdit(null));
    mover(dr, dc);
    grid.current?.focus();
  };
  const cancelar = () => { flushSync(() => setEdit(null)); grid.current?.focus(); };

  // ---- teclado (celda seleccionada, sin editar) ----
  const onKeyGrid = (e: React.KeyboardEvent) => {
    if (edit) return;
    const k = e.key;
    if (e.ctrlKey && k.toLowerCase() === 'z') { e.preventDefault(); deshacer(); return; }
    if (e.ctrlKey && k.toLowerCase() === 'y') { e.preventDefault(); rehacerAccion(); return; }
    if (k === 'ArrowDown') { e.preventDefault(); mover(1, 0, e.shiftKey); }
    else if (k === 'ArrowUp') { e.preventDefault(); mover(-1, 0, e.shiftKey); }
    else if (k === 'ArrowLeft') { e.preventDefault(); mover(0, -1, e.shiftKey); }
    else if (k === 'ArrowRight') { e.preventDefault(); mover(0, 1, e.shiftKey); }
    else if (k === 'Tab') { e.preventDefault(); mover(0, e.shiftKey ? -1 : 1); }
    else if (k === 'Enter') { e.preventDefault(); mover(1, 0); }
    else if (k === 'F2') { e.preventDefault(); iniciarEdicion(hoja[refActivo]?.raw ?? ''); }
    else if (k === 'Delete' || k === 'Backspace') { e.preventDefault(); for (let r = rect.r1; r <= rect.r2; r++) for (let c = rect.c1; c <= rect.c2; c++) escribir(refDe(r, c), ''); }
    else if (k.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) { e.preventDefault(); iniciarEdicion(k); }
  };

  // ---- ratón ----
  const celdaEn = (clientX: number, clientY: number) => {
    const b = grid.current!.getBoundingClientRect();
    const x = clientX - b.left, y = clientY - b.top - ENC_ALTO;
    let c = xs.findIndex((v, i) => i < xs.length - 1 && x >= v && x < xs[i + 1]);
    if (c < 0) c = x < ENC_ANCHO ? 0 : def.cols - 1;
    return { r: Math.max(0, Math.min(def.filas - 1, Math.floor(y / ALTO))), c };
  };
  const bajarCelda = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    const t = e.target as HTMLElement; if (t.closest('.xl-asa') || t.closest('.xl-edit')) return;
    const p = celdaEn(e.clientX, e.clientY);
    if (edit && puedeSenalar(edit.texto)) {
      e.preventDefault();
      setEdit({ texto: edit.texto + refDe(p.r, p.c), desde: edit.desde });
      setAncla(p); setActivo(activo); setArrastre('ref');
      setPuntoRef({ ini: p, base: edit.texto });
      return;
    }
    previa.current = !edit && !e.shiftKey && activo.r === p.r && activo.c === p.c && rect.r1 === rect.r2 && rect.c1 === rect.c2 ? p : null;
    if (edit) { escribir(refActivo, edit.texto); flushSync(() => setEdit(null)); }
    setActivo(p); if (!e.shiftKey) setAncla(p);
    setArrastre('sel');
    grid.current?.focus();
  };
  const [puntoRef, setPuntoRef] = useState<{ ini: { r: number; c: number }; base: string } | null>(null);
  useEffect(() => {
    if (!arrastre) return;
    const mueve = (e: MouseEvent) => {
      const p = celdaEn(e.clientX, e.clientY);
      if (arrastre === 'sel') setActivo(p);
      else if (arrastre === 'ref' && puntoRef) { const a = refDe(puntoRef.ini.r, puntoRef.ini.c), b = refDe(p.r, p.c); setEdit((ed) => ed && { ...ed, texto: puntoRef.base + (a === b ? a : `${a}:${b}`) }); }
      else if (arrastre === 'relleno') setDestinoRelleno(p);
    };
    const suelta = () => {
      if (arrastre === 'relleno' && destinoRelleno) rellenar(destinoRelleno);
      if (arrastre === 'ref') setTimeout(() => inputCelda.current?.focus() ?? inputBarra.current?.focus(), 0);
      setArrastre(null); setDestinoRelleno(null); setPuntoRef(null);
    };
    window.addEventListener('mousemove', mueve); window.addEventListener('mouseup', suelta);
    return () => { window.removeEventListener('mousemove', mueve); window.removeEventListener('mouseup', suelta); };
  }); // eslint-disable-line react-hooks/exhaustive-deps

  // ---- controlador de relleno ----
  const rellenar = (dest: { r: number; c: number }) => {
    const abajo = dest.r > rect.r2 && dest.r - rect.r2 >= Math.abs(dest.c - rect.c2) - 0;
    const derecha = !abajo && dest.c > rect.c2;
    if (!abajo && !derecha) return;
    aplicar((h) => {
      const n = { ...h };
      if (abajo) {
        const alto = rect.r2 - rect.r1 + 1;
        for (let c = rect.c1; c <= rect.c2; c++) for (let r = rect.r2 + 1; r <= dest.r; r++) {
          const origen = rect.r1 + ((r - rect.r2 - 1) % alto), src = h[refDe(origen, c)]; const ref = refDe(r, c);
          if (fijas.has(ref)) continue;
          if (src) n[ref] = { ...src, raw: moverFormula(src.raw, r - origen, 0) }; else delete n[ref];
        }
      } else {
        const ancho = rect.c2 - rect.c1 + 1;
        for (let r = rect.r1; r <= rect.r2; r++) for (let c = rect.c2 + 1; c <= dest.c; c++) {
          const origen = rect.c1 + ((c - rect.c2 - 1) % ancho), src = h[refDe(r, origen)]; const ref = refDe(r, c);
          if (fijas.has(ref)) continue;
          if (src) n[ref] = { ...src, raw: moverFormula(src.raw, 0, c - origen) }; else delete n[ref];
        }
      }
      return n;
    });
    setActivo(abajo ? { r: dest.r, c: rect.c2 } : { r: rect.r2, c: dest.c }); setAncla({ r: rect.r1, c: rect.c1 });
  };

  // ---- formato ----
  const celdasSel = () => { const o: string[] = []; for (let r = rect.r1; r <= rect.r2; r++) for (let c = rect.c1; c <= rect.c2; c++) o.push(refDe(r, c)); return o; };
  const formatear = (f: (c: EstadoCelda) => EstadoCelda) => aplicar((h) => { const n = { ...h }; for (const ref of celdasSel()) n[ref] = f(n[ref] ?? { raw: '' }); return n; });
  const todasSel = (p: (c: EstadoCelda) => boolean) => celdasSel().every((r) => p(hoja[r] ?? { raw: '' }));
  const alternarNegrita = () => { const on = todasSel((c) => !!c.b); formatear((c) => ({ ...c, b: !on })); };
  const alternarBorde = () => { const on = todasSel((c) => !!c.borde); formatear((c) => ({ ...c, borde: !on })); };
  const poner = (fmt: Formato) => formatear((c) => ({ ...c, fmt: c.fmt === fmt ? undefined : fmt }));
  const decimales = (mas: boolean) => formatear((c) => { const lista: Formato[] = ['miles', 'general', 'dec1', 'dec2']; const act = c.fmt ?? 'general'; if (act === 'pct') return c; const i = Math.max(1, lista.indexOf(act)); const n = Math.max(1, Math.min(3, i + (mas ? 1 : -1))); return { ...c, fmt: lista[n] === 'general' ? undefined : lista[n] }; });
  const autosuma = () => {
    if (fijas.has(refActivo)) { setSacudir((n) => n + 1); return; }
    const esNum = (r: number, c: number) => typeof valores[refDe(r, c)] === 'number' && !esError(valores[refDe(r, c)]);
    let r = activo.r - 1; while (r >= 0 && esNum(r, activo.c)) r--;
    if (r < activo.r - 1) { escribir(refActivo, `=SUMA(${refDe(r + 1, activo.c)}:${refDe(activo.r - 1, activo.c)})`); return; }
    let c = activo.c - 1; while (c >= 0 && esNum(activo.r, c)) c--;
    if (c < activo.c - 1) escribir(refActivo, `=SUMA(${refDe(activo.r, c + 1)}:${refDe(activo.r, activo.c - 1)})`);
  };

  // ---- dibujo ----
  const refsEdit = edit ? refsEnFormula(edit.texto) : [];
  const celdaRect = (r1: number, c1: number, r2: number, c2: number) => ({ left: xs[c1], top: ENC_ALTO + r1 * ALTO, width: xs[c2 + 1] - xs[c1], height: (r2 - r1 + 1) * ALTO });
  const sRect = celdaRect(rect.r1, rect.c1, rect.r2, rect.c2);
  const enEdicion = edit !== null;
  const rawActivo = hoja[refActivo]?.raw ?? '';

  const celdas: React.ReactNode[] = [];
  for (let r = 0; r < def.filas; r++) for (let c = 0; c < def.cols; c++) {
    const ref = refDe(r, c); const cd = hoja[ref];
    const v = valores[ref]; const fmt = cd?.fmt ?? 'general';
    let txt = cd ? (cd.raw.startsWith('=') ? mostrar(v ?? null, fmt) : typeof v === 'number' ? mostrar(v, fmt) : cd.raw) : '';
    const esNumero = typeof v === 'number';
    if (esNumero && txt.length * 7.6 + 10 > anchos[c]) txt = '#'.repeat(Math.max(3, Math.floor(anchos[c] / 8)));
    const al = cd?.al ?? (esError(v) ? 'c' : typeof v === 'boolean' ? 'c' : esNumero ? 'r' : 'l');
    celdas.push(
      <div key={ref} className={`xl-c ${cd?.borde ? 'borde' : ''}`}
        style={{ left: xs[c], top: ENC_ALTO + r * ALTO, width: anchos[c], height: ALTO, textAlign: al === 'r' ? 'right' : al === 'c' ? 'center' : 'left', fontWeight: cd?.b ? 700 : 400, background: cd?.fill ?? undefined, color: cd?.fill && /^#1f/i.test(cd.fill) ? '#fff' : esError(v) ? '#b00020' : undefined, lineHeight: `${ALTO - 3}px` }}>
        {txt}
      </div>,
    );
  }

  return (
    <div className="xl">
      <div className="xl-titulo"><span>💾</span><span style={{ opacity: 0.8 }}>↶ ↷</span><b className="font-semibold">{titulo ?? def.titulo} - Excel</b></div>
      <div className="xl-tabs"><span style={{ background: '#185c37', fontWeight: 600 }}>Archivo</span><span className="act">Inicio</span><span>Insertar</span><span>Fórmulas</span><span>Datos</span><span>Vista</span></div>
      {def.cinta !== false && (
        <div className="xl-cinta">
          <div className="xl-grupo">
            <button className="xl-btn" title="Deshacer (Ctrl+Z)" onClick={deshacer}><Undo2 size={15} /></button>
            <button className="xl-btn" title="Rehacer (Ctrl+Y)" onClick={rehacerAccion}><Redo2 size={15} /></button>
          </div>
          <div className="xl-grupo">
            <button className={`xl-btn ${todasSel((c) => !!c.b) ? 'on' : ''}`} title="Negrita" onClick={alternarNegrita}><Bold size={15} /></button>
            <div className="relative">
              <button className="xl-btn" title="Color de relleno" onClick={() => setColorAbierto((x) => !x)}><PaintBucket size={15} /></button>
              {colorAbierto && (
                <div className="absolute left-0 top-8 z-30 grid w-40 grid-cols-4 gap-1.5 rounded-lg border bg-white p-2 shadow-lg">
                  {PALETA.map((col) => <button key={col} title={col} onClick={() => { formatear((c) => ({ ...c, fill: col })); setColorAbierto(false); }} className="h-6 w-6 rounded border border-slate-300" style={{ background: col }} />)}
                  <button className="col-span-4 rounded border px-2 py-0.5 text-xs" onClick={() => { formatear((c) => ({ ...c, fill: undefined })); setColorAbierto(false); }}>Sin relleno</button>
                </div>
              )}
            </div>
            <button className={`xl-btn ${todasSel((c) => !!c.borde) ? 'on' : ''}`} title="Bordes: todos los bordes" onClick={alternarBorde}><Grid3x3 size={15} /></button>
          </div>
          <div className="xl-grupo">
            <button className={`xl-btn ${todasSel((c) => c.al === 'l') ? 'on' : ''}`} title="Alinear a la izquierda" onClick={() => formatear((c) => ({ ...c, al: c.al === 'l' ? undefined : 'l' }))}><AlignLeft size={15} /></button>
            <button className={`xl-btn ${todasSel((c) => c.al === 'c') ? 'on' : ''}`} title="Centrar" onClick={() => formatear((c) => ({ ...c, al: c.al === 'c' ? undefined : 'c' }))}><AlignCenter size={15} /></button>
            <button className={`xl-btn ${todasSel((c) => c.al === 'r') ? 'on' : ''}`} title="Alinear a la derecha" onClick={() => formatear((c) => ({ ...c, al: c.al === 'r' ? undefined : 'r' }))}><AlignRight size={15} /></button>
          </div>
          <div className="xl-grupo">
            <button className={`xl-btn ${todasSel((c) => c.fmt === 'pct') ? 'on' : ''}`} title="Estilo porcentual" onClick={() => poner('pct')}><Percent size={14} /></button>
            <button className={`xl-btn font-bold ${todasSel((c) => c.fmt === 'miles') ? 'on' : ''}`} title="Estilo millares" onClick={() => poner('miles')}>000</button>
            <button className="xl-btn" title="Disminuir decimales" onClick={() => decimales(false)}>←,0</button>
            <button className="xl-btn" title="Aumentar decimales" onClick={() => decimales(true)}>,0→</button>
          </div>
          <div className="xl-grupo">
            <button className="xl-btn font-semibold" title="Autosuma: escribe =SUMA(...) con los números de arriba o de la izquierda" onClick={autosuma}><span className="text-base leading-none">Σ</span> Autosuma</button>
          </div>
        </div>
      )}
      <div className="xl-barra">
        <div className="xl-nombre">{rect.r1 === rect.r2 && rect.c1 === rect.c2 ? refActivo : `${refDe(rect.r1, rect.c1)}:${refDe(rect.r2, rect.c2)}`}</div>
        <span className="px-2 text-xs text-slate-400">{enEdicion ? '✕ ✓' : ''}</span>
        <div className="xl-fx">fx</div>
        <input ref={inputBarra} className="xl-formula" value={enEdicion ? edit!.texto : rawActivo} readOnly={fijas.has(refActivo)} spellCheck={false}
          onFocus={() => { if (!enEdicion) iniciarEdicion(rawActivo, 'barra'); }}
          onChange={(e) => setEdit({ texto: e.target.value, desde: 'barra' })}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); confirmar(1, 0); } else if (e.key === 'Tab') { e.preventDefault(); confirmar(0, 1); } else if (e.key === 'Escape') cancelar(); }}
          placeholder={fijas.has(refActivo) ? '(celda protegida)' : ''} />
      </div>
      <div className="xl-scroll" ref={contenedor}>
        <div ref={grid} tabIndex={0} className={`xl-grid outline-none ${sacudir ? 'anim-sacudir' : ''}`} key={sacudir} style={{ width: W, height: H }} onKeyDown={onKeyGrid} onMouseDown={bajarCelda} onClick={(e) => { const p = previa.current; previa.current = null; if (p && !edit && !fijas.has(refDe(p.r, p.c)) && !(e.target as HTMLElement).closest('.xl-asa')) iniciarEdicion(hoja[refDe(p.r, p.c)]?.raw ?? ''); }}>
          <div className="xl-ch" style={{ left: 0, width: ENC_ANCHO, background: '#e6e6e6' }} />
          {anchos.map((w, i) => <div key={i} className={`xl-ch ${i >= rect.c1 && i <= rect.c2 ? 'sel' : ''}`} style={{ left: xs[i], width: w }}>{colLetra(i)}</div>)}
          {Array.from({ length: def.filas }, (_, r) => <div key={r} className={`xl-rh ${r >= rect.r1 && r <= rect.r2 ? 'sel' : ''}`} style={{ top: ENC_ALTO + r * ALTO, height: ALTO, lineHeight: `${ALTO}px` }}>{r + 1}</div>)}
          {celdas}
          {(rect.r1 !== rect.r2 || rect.c1 !== rect.c2) && <div className="xl-selfill" style={sRect} />}
          <div className="xl-sel" style={{ left: sRect.left - 1, top: sRect.top - 1, width: sRect.width + 1, height: sRect.height + 1 }} />
          {!enEdicion && !def.soloLectura && <div className="xl-asa" style={{ left: sRect.left + sRect.width - 6, top: sRect.top + sRect.height - 6 }} onMouseDown={(e) => { e.stopPropagation(); e.preventDefault(); setArrastre('relleno'); setDestinoRelleno(null); }} title="Controlador de relleno: arrástralo para copiar la fórmula" />}
          {arrastre === 'relleno' && destinoRelleno && (() => { const abajo = destinoRelleno.r > rect.r2; const rr = abajo ? celdaRect(rect.r1, rect.c1, destinoRelleno.r, rect.c2) : celdaRect(rect.r1, rect.c1, rect.r2, Math.max(destinoRelleno.c, rect.c2)); return <div className="xl-sel" style={{ ...rr, borderStyle: 'dashed', borderColor: '#555' }} />; })()}
          {refsEdit.map((rf, i) => { const p = parseRango(rf); if (!p || p.r2 >= def.filas || p.c2 >= def.cols) return null; const q = celdaRect(p.r1, p.c1, p.r2, p.c2); return <div key={i} className="xl-ref" style={{ ...q, borderColor: COLORES_REF[i % COLORES_REF.length] }} />; })}
          {enEdicion && edit!.desde === 'celda' && <input ref={inputCelda} className="xl-edit" spellCheck={false} value={edit!.texto} style={{ left: xs[activo.c] - 1, top: ENC_ALTO + activo.r * ALTO - 1, width: Math.max(anchos[activo.c] + 2, 150), height: ALTO + 2 }}
            onChange={(e) => setEdit({ texto: e.target.value, desde: 'celda' })} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); confirmar(1, 0); } else if (e.key === 'Tab') { e.preventDefault(); confirmar(0, e.shiftKey ? -1 : 1); } else if (e.key === 'Escape') cancelar(); }} />}
        </div>
      </div>
      <div className="xl-hojas"><span className="act">{def.hoja}</span></div>
      <div className="xl-pie"><span>{enEdicion ? (edit!.texto.startsWith('=') ? 'Introducir' : 'Modificar') : 'Listo'}</span><span>100%</span></div>
    </div>
  );
}
