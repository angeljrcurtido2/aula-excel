import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import confetti from 'canvas-confetti';
import { api, getToken, setToken, type Perfil, type Progreso } from './api';
import { INSIGNIAS } from './insignias';
import { CLASES } from './contenido';

export interface Aviso { id: number; texto: string; tipo: 'xp' | 'insignia' | 'info' | 'error' }
interface Ctx {
  cargando: boolean;
  perfil: Perfil | null;
  progreso: Record<string, Progreso>;
  ingresar: (username: string, nombre?: string) => Promise<{ nuevo: boolean }>;
  salir: () => void;
  /** Guarda el resultado de una actividad en el servidor y muestra XP e insignias nuevas. */
  guardar: (p: { actividad: string; clase: 1 | 2 | 3; tipo: 'lectura' | 'actividad' | 'reto' | 'quiz'; puntaje: number; completada: boolean; estado?: any; intento?: boolean }) => Promise<void>;
  avisos: Aviso[];
  avisar: (texto: string, tipo?: Aviso['tipo']) => void;
}
const S = createContext<Ctx>(null as any);
export const useSesion = () => useContext(S);

// Avances que no se pudieron enviar por falta de internet: se guardan en el navegador y se reenvían solos.
const COLA = 'aula-excel-pendientes';
const leerCola = (): any[] => { try { return JSON.parse(localStorage.getItem(COLA) || '[]'); } catch { return []; } };
const escribirCola = (c: any[]) => { try { localStorage.setItem(COLA, JSON.stringify(c.slice(-60))); } catch { /* sin almacenamiento */ } };
const encolar = (p: any) => escribirCola([...leerCola().filter((x) => x.actividad !== p.actividad), p]);
async function vaciarPendientes() {
  const cola = leerCola(); if (!cola.length) return;
  const resto: any[] = [];
  for (const p of cola) { try { await api.guardar(p); } catch (e: any) { if (e?.status === 0 || e?.status >= 500) resto.push(p); } }
  escribirCola(resto);
}

export function SesionProvider({ children }: { children: ReactNode }) {
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [cargando, setCargando] = useState(!!getToken());
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const n = useRef(0);

  const avisar = useCallback((texto: string, tipo: Aviso['tipo'] = 'info') => {
    const id = ++n.current;
    setAvisos((a) => [...a, { id, texto, tipo }]);
    setTimeout(() => setAvisos((a) => a.filter((x) => x.id !== id)), tipo === 'insignia' ? 5200 : 3200);
  }, []);

  useEffect(() => {
    if (!getToken()) return;
    api.yo().then((p) => { setPerfil(p); void vaciarPendientes().then(() => api.yo().then(setPerfil).catch(() => {})); }).catch((e) => { if (e?.status !== 0) setToken(null); }).finally(() => setCargando(false));
    const volvio = () => { void vaciarPendientes().then(() => api.yo().then(setPerfil).catch(() => {})); };
    window.addEventListener('online', volvio);
    return () => window.removeEventListener('online', volvio);
  }, []);

  const ingresar = useCallback(async (username: string, nombre?: string) => {
    const r = await api.login(username, nombre);
    setToken(r.token);
    setPerfil({ usuario: r.usuario, progreso: r.progreso, insignias: r.insignias });
    return { nuevo: r.nuevo };
  }, []);
  const salir = useCallback(() => { setToken(null); setPerfil(null); }, []);

  const guardar: Ctx['guardar'] = useCallback(async (p) => {
    const total = CLASES.find((c) => c.n === p.clase)!.pasos.length;
    try {
      const r = await api.guardar({ ...p, totalClase: total, intento: p.intento ?? true });
      setPerfil({ usuario: r.usuario, progreso: r.progreso, insignias: r.insignias });
      void vaciarPendientes();
      if (r.xpGanado > 0) { avisar(`+${r.xpGanado} XP`, 'xp'); if (p.puntaje === 100) confetti({ particleCount: 70, spread: 70, origin: { y: 0.75 } }); }
      for (const i of r.insigniasNuevas) { avisar(`Nueva insignia: ${INSIGNIAS[i]?.emoji ?? '🏅'} ${INSIGNIAS[i]?.nombre ?? i}`, 'insignia'); confetti({ particleCount: 160, spread: 100, origin: { y: 0.5 } }); }
    } catch (e: any) {
      if (e?.status === 0) { encolar({ ...p, totalClase: total, intento: p.intento ?? true }); avisar('Sin conexión: guardaremos tu avance cuando vuelva internet.', 'error'); }
      else avisar(e?.message || 'No se pudo guardar tu progreso.', 'error');
    }
  }, [avisar]);

  const progreso = useMemo(() => Object.fromEntries((perfil?.progreso ?? []).map((p) => [p.actividad, p])), [perfil]);
  return <S.Provider value={{ cargando, perfil, progreso, ingresar, salir, guardar, avisos, avisar }}>{children}</S.Provider>;
}
