// Cliente del servidor. El token (sesión) se guarda en el navegador.
const KEY = 'aula-excel-token';
/** En Netlify la API vive en otra dirección (VITE_API_URL); en local/producción del servidor es la misma dirección. */
const BASE = ((import.meta.env.VITE_API_URL as string | undefined) ?? '').replace(/\/$/, '');
export const getToken = () => { try { return localStorage.getItem(KEY); } catch { return null; } };
export const setToken = (t: string | null) => { try { if (t) localStorage.setItem(KEY, t); else localStorage.removeItem(KEY); } catch { /* sin almacenamiento */ } };

export class ErrorApi extends Error {
  status: number;
  datos?: any;
  constructor(msg: string, status: number, datos?: any) { super(msg); this.status = status; this.datos = datos; }
}

async function pedir<T>(ruta: string, opts: RequestInit = {}, extra: Record<string, string> = {}): Promise<T> {
  const t = getToken();
  const r = await fetch(`${BASE}/api${ruta}`, { ...opts, headers: { 'Content-Type': 'application/json', ...(t ? { Authorization: `Bearer ${t}` } : {}), ...extra, ...(opts.headers as any) } });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new ErrorApi(j.error || 'No pudimos conectar con el servidor.', r.status, j);
  return j as T;
}

export interface Usuario { username: string; nombre: string; xp: number; nivel: number; xpNivel: number; racha: number; mejorRacha: number; desde: string }
export interface Progreso { actividad: string; clase: number; tipo: string; completada: boolean; mejorPuntaje: number; intentos: number; estado: any; xpGanado: number; actualizado: string }
export interface Perfil { usuario: Usuario; progreso: Progreso[]; insignias: string[] }
export interface Guardado extends Perfil { xpGanado: number; insigniasNuevas: string[] }

export const api = {
  login: (username: string, nombre?: string) => pedir<Perfil & { token: string; nuevo: boolean }>('/login', { method: 'POST', body: JSON.stringify({ username, nombre }) }),
  yo: () => pedir<Perfil>('/yo'),
  guardar: (b: { actividad: string; clase: number; tipo: string; puntaje: number; completada: boolean; estado?: any; intento?: boolean; totalClase: number }) => pedir<Guardado>('/progreso', { method: 'POST', body: JSON.stringify(b) }),
  docenteResumen: (clave: string) => pedir<{ alumnos: any[] }>('/docente/resumen', {}, { 'x-docente-key': clave }),
  docenteUsuario: (clave: string, u: string) => pedir<Perfil>(`/docente/usuario/${encodeURIComponent(u)}`, {}, { 'x-docente-key': clave }),
};
