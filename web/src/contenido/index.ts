import { clase1 } from './clase1';
import { clase2 } from './clase2';
import { clase3 } from './clase3';
import { clase4 } from './clase4';
import { clase5, clase6, clase7 } from './ppt';
import type { ClaseDef } from './tipos';
export const CLASES: ClaseDef[] = [clase1, clase2, clase3, clase4, clase5, clase6, clase7];
export const CURSOS = [
  { id: 'excel' as const, nombre: 'Excel', clases: CLASES.filter((c) => (c.curso ?? 'excel') === 'excel') },
  { id: 'powerpoint' as const, nombre: 'PowerPoint', clases: CLASES.filter((c) => c.curso === 'powerpoint') },
];
export const tipoDePaso = (t: string): 'lectura' | 'actividad' | 'reto' | 'quiz' => (t === 'lectura' ? 'lectura' : t === 'reto' ? 'reto' : t === 'lab' ? 'reto' : 'actividad');
