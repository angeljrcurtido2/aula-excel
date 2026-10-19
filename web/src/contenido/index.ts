import { clase1 } from './clase1';
import { clase2 } from './clase2';
import { clase3 } from './clase3';
import type { ClaseDef } from './tipos';
export const CLASES: ClaseDef[] = [clase1, clase2, clase3];
export const tipoDePaso = (t: string): 'lectura' | 'actividad' | 'reto' | 'quiz' => (t === 'lectura' ? 'lectura' : t === 'reto' ? 'reto' : t === 'lab' ? 'reto' : 'actividad');
