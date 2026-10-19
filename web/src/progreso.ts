import type { Progreso } from './api';
import { CLASES } from './contenido';

export const resumenClase = (n: number, progreso: Record<string, Progreso>) => {
  const c = CLASES.find((x) => x.n === n)!;
  const hechas = c.pasos.filter((p) => progreso[p.id]?.completada).length;
  return { hechas, total: c.pasos.length, pct: Math.round((hechas / c.pasos.length) * 100) };
};

/** Primer paso sin completar (para el botón «Continuar»). */
export const siguientePaso = (progreso: Record<string, Progreso>) => {
  for (const c of CLASES) for (const p of c.pasos) if (!progreso[p.id]?.completada) return { clase: c, paso: p };
  return null;
};
