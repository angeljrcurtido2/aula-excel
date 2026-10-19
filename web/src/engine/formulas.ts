// Motor de fórmulas del simulador: se escribe en español (SUMA, SI, CONTAR.SI…) con ; como separador, como en Excel en español.
import { Parser } from 'hot-formula-parser';

export type Valor = number | string | boolean | null;
export type Err = { error: string };
export type Resultado = Valor | Err;
export const esError = (v: Resultado | undefined): v is Err => typeof v === 'object' && v !== null && 'error' in v;

const ERR_ES: Record<string, string> = { '#NAME?': '#¿NOMBRE?', '#DIV/0!': '#¡DIV/0!', '#VALUE!': '#¡VALOR!', '#REF!': '#¡REF!', '#N/A': '#N/A', '#NUM!': '#¡NUM!', '#ERROR!': '#¡VALOR!' };
const FUNCIONES: Record<string, string> = {
  SUMA: 'SUM', PROMEDIO: 'AVERAGE', MAX: 'MAX', MIN: 'MIN', CONTAR: 'COUNT', CONTARA: 'COUNTA', SI: 'IF', Y: 'AND', O: 'OR',
  'CONTAR.SI': 'COUNTIF', 'SUMAR.SI': 'SUMIF', BUSCARV: 'VLOOKUP', REDONDEAR: 'ROUND', ABS: 'ABS', ENTERO: 'INT', RAIZ: 'SQRT',
};

export const colLetra = (i: number) => { let s = ''; i += 1; while (i > 0) { const m = (i - 1) % 26; s = String.fromCharCode(65 + m) + s; i = Math.floor((i - 1) / 26); } return s; };
export const colIdx = (l: string) => l.toUpperCase().split('').reduce((a, ch) => a * 26 + ch.charCodeAt(0) - 64, 0) - 1;
export const refDe = (r: number, c: number) => `${colLetra(c)}${r + 1}`;
export const parseRef = (ref: string) => { const m = /^\$?([A-Za-z]{1,2})\$?(\d+)$/.exec(ref.trim()); return m ? { r: Number(m[2]) - 1, c: colIdx(m[1]) } : null; };
export const parseRango = (rg: string) => {
  const [a, b] = rg.split(':'); const p = parseRef(a); const q = parseRef(b ?? a);
  return p && q ? { r1: Math.min(p.r, q.r), c1: Math.min(p.c, q.c), r2: Math.max(p.r, q.r), c2: Math.max(p.c, q.c) } : null;
};
export const celdasDe = (rg: string): string[] => { const x = parseRango(rg); if (!x) return []; const o: string[] = []; for (let r = x.r1; r <= x.r2; r++) for (let c = x.c1; c <= x.c2; c++) o.push(refDe(r, c)); return o; };

/** Texto escrito por el alumno → número o texto, como lo interpretaría Excel en español. */
export function parseEntrada(raw: string): number | string | null {
  const t = raw.trim();
  if (t === '') return null;
  if (/^-?\d+(,\d+)?$/.test(t)) return Number(t.replace(',', '.'));
  if (/^-?\d{1,3}(\.\d{3})+(,\d+)?$/.test(t)) return Number(t.replace(/\./g, '').replace(',', '.'));
  const p = /^(-?\d+(?:,\d+)?)\s*%$/.exec(t);
  if (p) return Number(p[1].replace(',', '.')) / 100;
  return raw;
}

/** Fórmula en español → fórmula para el motor. */
export function traducir(f: string): string {
  const cuerpo = f.replace(/^=/, '');
  // con ';' como separador, la coma es decimal; sin funciones (p. ej. =B1*0,1) también lo es
  const comaDecimal = cuerpo.includes(';') || !/[A-Za-zÁÉÍÓÚÑáéíóúñ][A-Za-zÁÉÍÓÚÑáéíóúñ._]*\s*\(/.test(cuerpo);
  return cuerpo.split(/("[^"]*")/).map((seg, i) => {
    if (i % 2 === 1) return seg;
    let s = seg.replace(/([A-Za-zÁÉÍÓÚÑáéíóúñ][A-Za-zÁÉÍÓÚÑáéíóúñ._]*)(\s*)\(/g, (_, n: string, sp: string) => `${FUNCIONES[n.toUpperCase()] ?? n.toUpperCase()}${sp}(`);
    if (comaDecimal) s = s.replace(/(\d),(\d)/g, '$1.$2');
    s = s.replace(/;/g, ',');
    s = s.replace(/\bVERDADERO\b/gi, 'TRUE').replace(/\bFALSO\b/gi, 'FALSE');
    s = s.replace(/(^|[^A-Za-z0-9_.$])(\$?)([a-z]{1,2})(\$?)(\d+)(?![A-Za-z0-9_(])/g, (_, pre: string, d1: string, l: string, d2: string, n: string) => `${pre}${d1}${l.toUpperCase()}${d2}${n}`);
    return s;
  }).join('');
}

const norm = (v: unknown) => (typeof v === 'string' ? v.trim().toLowerCase() : v);
const aplanar = (x: any): any[] => (Array.isArray(x) ? x.flatMap(aplanar) : [x]);
function cumple(valor: any, criterio: any): boolean {
  if (typeof criterio === 'string') {
    const m = /^(>=|<=|<>|>|<|=)?(.*)$/.exec(criterio.trim());
    const op = m?.[1] || '='; const rhs = (m?.[2] ?? '').trim();
    const num = rhs !== '' && !isNaN(Number(rhs.replace(',', '.'))) ? Number(rhs.replace(',', '.')) : null;
    if (num !== null && typeof valor === 'number') {
      return op === '=' ? valor === num : op === '<>' ? valor !== num : op === '>' ? valor > num : op === '<' ? valor < num : op === '>=' ? valor >= num : valor <= num;
    }
    if (op === '=') return norm(valor) === norm(rhs);
    if (op === '<>') return norm(valor) !== norm(rhs);
    return false;
  }
  return norm(valor) === norm(criterio);
}

/** Evalúa todas las celdas de una hoja: raws = { A1: "texto o =fórmula" }. */
export function evaluar(raws: Record<string, string>): Record<string, Resultado> {
  const memo: Record<string, Resultado> = {};
  const visitando = new Set<string>();

  const valorDe = (ref: string): Resultado => {
    if (ref in memo) return memo[ref];
    const raw = raws[ref];
    if (raw === undefined || raw.trim() === '') return (memo[ref] = null);
    if (!raw.startsWith('=')) return (memo[ref] = parseEntrada(raw));
    if (visitando.has(ref)) return { error: '#¡REF!' };
    visitando.add(ref);
    const r = calcular(raw);
    visitando.delete(ref);
    return (memo[ref] = r);
  };

  const calcular = (raw: string): Resultado => {
    const p = new Parser();
    let heredado: Err | null = null;
    p.on('callCellValue', (c: any, done: (v: any) => void) => {
      const v = valorDe(String(c.label).replace(/\$/g, ''));
      if (esError(v)) heredado = heredado ?? v;
      done(esError(v) ? new Error(v.error) : v === null ? 0 : v);
    });
    p.on('callRangeValue', (a: any, b: any, done: (v: any) => void) => {
      const out: any[][] = [];
      for (let r = a.row.index; r <= b.row.index; r++) {
        const fila: any[] = [];
        for (let c = a.column.index; c <= b.column.index; c++) { const v = valorDe(refDe(r, c)); if (esError(v)) heredado = heredado ?? v; fila.push(esError(v) ? new Error(v.error) : v); }
        out.push(fila);
      }
      done(out);
    });
    p.setFunction('COUNTIF', ([rango, crit]: any[]) => aplanar(rango).filter((v) => v !== null && cumple(v, crit)).length);
    p.setFunction('SUMIF', ([rango, crit, suma]: any[]) => {
      const a = aplanar(rango), s = suma === undefined ? a : aplanar(suma);
      return a.reduce((t: number, v: any, i: number) => (cumple(v, crit) && typeof s[i] === 'number' ? t + s[i] : t), 0);
    });
    p.setFunction('VLOOKUP', ([buscado, tabla, col, exacto]: any[]) => {
      const filas: any[][] = tabla;
      const ex = exacto === false || exacto === 0;
      if (!Array.isArray(filas) || typeof col !== 'number' || col < 1 || col > (filas[0]?.length ?? 0)) return new Error('#REF!');
      const fila = filas.find((f) => (ex ? norm(f[0]) === norm(buscado) : f[0] === buscado));
      return fila ? fila[col - 1] : new Error('#N/A');
    });
    const out = p.parse(traducir(raw));
    if (heredado && (out.error || out.result instanceof Error)) return heredado;
    if (out.error) return { error: ERR_ES[out.error] ?? '#¡VALOR!' };
    if (out.result instanceof Error) return { error: ERR_ES[out.result.message] ?? out.result.message };
    return out.result ?? 0;
  };

  const res: Record<string, Resultado> = {};
  for (const ref of Object.keys(raws)) res[ref] = valorDe(ref);
  return res;
}

/** Copia una fórmula a otra celda: las referencias relativas se mueven, las absolutas ($) no. */
export function moverFormula(f: string, dr: number, dc: number): string {
  if (!f.startsWith('=')) return f;
  return f.split(/("[^"]*")/).map((seg, i) => (i % 2 === 1 ? seg : seg.replace(/(^|[^A-Za-z0-9_.$])(\$?)([A-Za-z]{1,2})(\$?)(\d+)(?![A-Za-z0-9_(])/g, (_, pre: string, ac: string, l: string, ar: string, n: string) => {
    const col = ac ? l.toUpperCase() : colLetra(Math.max(0, colIdx(l) + dc));
    const fila = ar ? Number(n) : Math.max(1, Number(n) + dr);
    return `${pre}${ac}${col}${ar}${fila}`;
  }))).join('');
}

/** Rangos y celdas mencionados en una fórmula (para resaltarlos con colores mientras se escribe). */
export function refsEnFormula(f: string): string[] {
  if (!f.startsWith('=')) return [];
  const out: string[] = [];
  f.split(/("[^"]*")/).forEach((seg, i) => { if (i % 2 === 0) for (const m of seg.matchAll(/(^|[^A-Za-z0-9_.])(\$?[A-Za-z]{1,2}\$?\d+(?::\$?[A-Za-z]{1,2}\$?\d+)?)(?![A-Za-z0-9_(])/g)) out.push(m[2].replace(/\$/g, '').toUpperCase()); });
  return out;
}

export type Formato = 'general' | 'miles' | 'dec1' | 'dec2' | 'pct';
export function mostrar(v: Resultado, fmt: Formato = 'general'): string {
  if (v === null || v === undefined) return '';
  if (esError(v)) return v.error;
  if (typeof v === 'boolean') return v ? 'VERDADERO' : 'FALSO';
  if (typeof v === 'string') return v;
  if (fmt === 'miles') return new Intl.NumberFormat('es-PY', { maximumFractionDigits: 0 }).format(Math.round(v));
  if (fmt === 'dec1') return new Intl.NumberFormat('es-PY', { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(v);
  if (fmt === 'dec2') return new Intl.NumberFormat('es-PY', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);
  if (fmt === 'pct') return `${new Intl.NumberFormat('es-PY', { maximumFractionDigits: 1 }).format(v * 100)}%`;
  return new Intl.NumberFormat('es-PY', { useGrouping: false, maximumFractionDigits: 10 }).format(v);
}
