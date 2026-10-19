import type { Formato, Resultado } from '../engine/formulas';

export type FiguraDef = { nombre: string; num: string; pie: string; leyenda: string[] };
export type Bloque = { md: string } | { fig: FiguraDef } | { recordar: string };

export type Actividad =
  /** Completar oraciones. Los huecos se escriben {{respuesta|otra respuesta}}. Con `banco` se elige de una lista. */
  | { k: 'cloze'; intro?: string; banco?: string[]; items: string[] }
  /** Unir: cada elemento de la izquierda con uno de la derecha (correcta[i] = posición en `der`). */
  | { k: 'une'; intro?: string; izq: string[]; der: string[]; correcta: number[] }
  /** Clasificar: cada elemento va a una categoría (r = posición en `categorias`). */
  | { k: 'clasifica'; intro?: string; categorias: string[]; items: { t: string; r: number }[] }
  | { k: 'vf'; intro?: string; items: { t: string; r: boolean; why?: string }[] }
  /** Ordenar pasos: `items` está en el orden correcto; la pantalla los mezcla. */
  | { k: 'ordena'; intro?: string; items: string[] }
  /** Rotular una figura: el marcador n corresponde a nombres[n-1]. */
  | { k: 'rotula'; intro?: string; figura: string; nombres: string[] }
  /** Respuesta escrita (acepta varias respuestas válidas por pregunta). */
  | { k: 'predice'; intro?: string; items: { q: string; r: string[]; pista?: string }[] }
  | { k: 'reflexion'; intro?: string; pregunta: string };

// ---- Planilla / retos ----
export type CeldaDef = { v?: string | number; fmt?: Formato; b?: boolean; fill?: string; color?: string; al?: 'l' | 'c' | 'r'; borde?: boolean; fijo?: boolean };
export type PlanillaDef = { titulo: string; hoja: string; cols: number; filas: number; anchos?: number[]; celdas: Record<string, CeldaDef>; cinta?: boolean; soloLectura?: boolean };

export interface Ctx {
  valor: (ref: string) => Resultado;
  raw: (ref: string) => string;
  est: (ref: string) => CeldaDef;
  /** Misma planilla con otros valores en algunas celdas (para comprobar que la fórmula "se actualiza sola"). */
  con: (cambios: Record<string, string>) => Ctx;
}
export type Check = { id: string; texto: string; ok: (c: Ctx) => boolean; pista?: string };
export type RetoDef = { planilla: PlanillaDef; md: string; checks: Check[]; pistas?: string[]; datos?: { titulo: string; filas: string[][] } };

export type Paso =
  | { id: string; tipo: 'lectura'; titulo: string; bloques: Bloque[] }
  | { id: string; tipo: 'actividad'; titulo: string; sub?: string; act: Actividad }
  | { id: string; tipo: 'reto'; titulo: string; reto: RetoDef }
  | { id: string; tipo: 'lab'; titulo: string };

export interface ClaseDef { n: 1 | 2 | 3; titulo: string; resumen: string; objetivos: string[]; color: string; pasos: Paso[] }
