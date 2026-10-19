import { evaluar, parseEntrada, type Formato, type Resultado } from '../engine/formulas';
import type { CeldaDef, Ctx } from '../contenido/tipos';

export interface EstadoCelda { raw: string; fmt?: Formato; b?: boolean; fill?: string; al?: 'l' | 'c' | 'r'; borde?: boolean }
export type Hoja = Record<string, EstadoCelda>;

/** Valor inicial de una celda de la definición → texto "como lo escribiría el alumno". */
export const rawInicial = (v: string | number | undefined): string => {
  if (v === undefined) return '';
  if (typeof v === 'number') return String(Math.round(v * 1e9) / 1e9).replace('.', ',');
  return v;
};

export function hojaInicial(celdas: Record<string, CeldaDef>): Hoja {
  const h: Hoja = {};
  for (const [ref, c] of Object.entries(celdas)) {
    const raw = rawInicial(c.v);
    const fmt = c.fmt ?? (/^-?\d+(,\d+)?%$/.test(raw) ? 'pct' : undefined);
    h[ref] = { raw, fmt, b: c.b, fill: c.fill, al: c.al, borde: c.borde };
  }
  return h;
}

/** Contexto para comprobar un reto: valores calculados, texto escrito y estilos de las celdas. */
export function crearCtx(hoja: Hoja, cambios: Record<string, string> = {}): Ctx {
  const raws: Record<string, string> = {};
  for (const [r, c] of Object.entries(hoja)) raws[r] = c.raw;
  for (const [r, v] of Object.entries(cambios)) raws[r] = v;
  const val = evaluar(raws);
  return {
    valor: (ref): Resultado => val[ref] ?? (raws[ref] !== undefined ? parseEntrada(raws[ref]) : null),
    raw: (ref) => raws[ref] ?? '',
    est: (ref) => { const c = hoja[ref]; return c ? { v: c.raw, fmt: c.fmt, b: c.b, fill: c.fill, al: c.al, borde: c.borde } : {}; },
    con: (cb) => crearCtx(hoja, { ...cambios, ...cb }),
  };
}
