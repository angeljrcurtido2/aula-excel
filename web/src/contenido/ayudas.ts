// Ayudas para escribir los retos de la planilla y para comparar respuestas escritas.
import { celdasDe, esError } from '../engine/formulas';
import type { Check, Ctx } from './tipos';

export const sinAcentos = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '');
export const norm = (s: string) => sinAcentos(s).toLowerCase().replace(/\s+/g, ' ').trim();
/** Normaliza una respuesta escrita (las fórmulas se comparan sin espacios, sin mayúsculas y con ; o , indistintos). */
export const normResp = (s: string) => {
  const t = norm(s).replace(/^["“«]|["”»]$/g, '');
  return t.startsWith('=') ? t.replace(/\s+/g, '').replace(/,/g, ';') : t;
};

const cerca = (a: unknown, b: number, tol = 1e-6) => typeof a === 'number' && Math.abs(a - b) <= tol * Math.max(1, Math.abs(b));
export const esNum = (c: Ctx, ref: string, n: number) => cerca(c.valor(ref), n);
export const esFormula = (c: Ctx, ref: string) => c.raw(ref).trim().startsWith('=');
export const esTexto = (c: Ctx, ref: string, ...opciones: string[]) => { const v = c.valor(ref); return typeof v === 'string' && opciones.some((o) => norm(v) === norm(o)); };
export const usa = (c: Ctx, ref: string, re: RegExp) => re.test(c.raw(ref));

/** Cada celda de la lista cumple la condición. */
export const todas = (refs: string[], f: (ref: string) => boolean) => refs.every(f);
export const rango = (rg: string) => celdasDe(rg);

export const chk = (id: string, texto: string, ok: (c: Ctx) => boolean, pista?: string): Check => ({ id, texto, ok, pista });

/** Comprueba una columna de resultados con fórmula: valores esperados fila por fila. */
export const columnaFormula = (id: string, texto: string, col: string, fila1: number, esperados: number[], pista?: string, re?: RegExp): Check =>
  chk(id, texto, (c) => esperados.every((n, i) => { const r = `${col}${fila1 + i}`; return esFormula(c, r) && esNum(c, r, n) && (!re || usa(c, r, re)); }), pista);

export const columnaTexto = (id: string, texto: string, col: string, fila1: number, esperados: string[], pista?: string, re?: RegExp): Check =>
  chk(id, texto, (c) => esperados.every((t, i) => { const r = `${col}${fila1 + i}`; return esFormula(c, r) && esTexto(c, r, t) && (!re || usa(c, r, re)); }), pista);

export const sinErrores = (c: Ctx, refs: string[]) => refs.every((r) => !esError(c.valor(r)));
