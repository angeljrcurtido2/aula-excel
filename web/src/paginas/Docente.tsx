import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, ChevronLeft, KeyRound, RefreshCw, X } from 'lucide-react';
import { api, type Perfil } from '../api';
import { CLASES } from '../contenido';
import { INSIGNIAS } from '../insignias';
import { Boton, Chip, Tarjeta } from '../ui';

interface Fila { username: string; nombre: string; xp: number; nivel: number; racha: number; ultimoAcceso: string | null; c1: number; c2: number; c3: number; promedio: number }
const KEY = 'aula-docente-clave';
const leer = () => { try { return sessionStorage.getItem(KEY) ?? ''; } catch { return ''; } };

export function Docente() {
  const [clave, setClave] = useState(leer());
  const [entrada, setEntrada] = useState('');
  const [alumnos, setAlumnos] = useState<Fila[] | null>(null);
  const [error, setError] = useState('');
  const [detalle, setDetalle] = useState<Perfil | null>(null);
  const [cargando, setCargando] = useState(false);

  const cargar = async (k = clave) => {
    if (!k) return;
    setCargando(true); setError('');
    try { const r = await api.docenteResumen(k); setAlumnos(r.alumnos); try { sessionStorage.setItem(KEY, k); } catch { /* sin almacenamiento */ } setClave(k); }
    catch (e: any) { setError(e.message); setAlumnos(null); setClave(''); try { sessionStorage.removeItem(KEY); } catch { /* */ } }
    finally { setCargando(false); }
  };
  useEffect(() => { if (clave) void cargar(clave); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const ver = async (u: string) => { try { setDetalle(await api.docenteUsuario(clave, u)); } catch (e: any) { setError(e.message); } };
  const tot = CLASES.map((c) => c.pasos.length);
  const barra = (n: number, t: number, color: string) => <div className="flex items-center gap-2"><div className="h-2 w-24 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full" style={{ width: `${(n / t) * 100}%`, background: color }} /></div><span className="text-xs tabular-nums text-slate-600">{n}/{t}</span></div>;

  if (!alumnos) {
    return (
      <div className="mx-auto max-w-md">
        <Link to="/" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-slate-500"><ChevronLeft size={16} /> Volver</Link>
        <Tarjeta className="p-7">
          <h1 className="mb-1 flex items-center gap-2 text-2xl font-extrabold"><KeyRound className="text-excel" /> Panel del docente</h1>
          <p className="mb-5 text-slate-500">Ingresa la clave del docente (está en el archivo <code className="tec">server/.env</code>, variable DOCENTE_KEY).</p>
          <input type="password" value={entrada} onChange={(e) => setEntrada(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && cargar(entrada)} className="mb-3 w-full rounded-xl border-2 border-slate-200 px-4 py-3 outline-none focus:border-excel" placeholder="Clave del docente" autoFocus />
          {error && <p className="mb-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
          <Boton onClick={() => cargar(entrada)} disabled={!entrada || cargando} className="w-full">Entrar</Boton>
        </Tarjeta>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <Link to="/" className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500"><ChevronLeft size={16} /> Volver</Link>
        <h1 className="text-2xl font-extrabold">Panel del docente</h1><Chip tono="azul">{alumnos.length} alumno{alumnos.length === 1 ? '' : 's'}</Chip>
        <Boton variante="fantasma" className="ml-auto" onClick={() => cargar()}><RefreshCw size={16} className={cargando ? 'animate-spin' : ''} /> Actualizar</Boton>
      </div>
      {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
      <Tarjeta className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500"><th className="px-4 py-3">Alumno</th>{CLASES.map((c) => <th key={c.n} className="px-3 py-3">Clase {c.n}</th>)}<th className="px-3 py-3">Puntaje prom.</th><th className="px-3 py-3">XP</th><th className="px-3 py-3">Racha</th><th className="px-3 py-3">Último ingreso</th></tr></thead>
          <tbody>
            {alumnos.length === 0 && <tr><td colSpan={8} className="px-4 py-8 text-center text-slate-500">Todavía no hay alumnos. Cuando se registren, aparecerán aquí.</td></tr>}
            {alumnos.map((a) => (
              <tr key={a.username} onClick={() => ver(a.username)} className="cursor-pointer border-b last:border-0 hover:bg-excel-soft">
                <td className="px-4 py-3"><div className="font-semibold">{a.nombre}</div><div className="text-xs text-slate-500">@{a.username}</div></td>
                <td className="px-3 py-3">{barra(a.c1, tot[0], CLASES[0].color)}</td><td className="px-3 py-3">{barra(a.c2, tot[1], CLASES[1].color)}</td><td className="px-3 py-3">{barra(a.c3, tot[2], CLASES[2].color)}</td>
                <td className="px-3 py-3 font-semibold">{a.promedio}%</td><td className="px-3 py-3">{a.xp} <span className="text-xs text-slate-500">(nivel {a.nivel})</span></td><td className="px-3 py-3">🔥 {a.racha}</td>
                <td className="px-3 py-3 text-slate-500">{a.ultimoAcceso ? a.ultimoAcceso.slice(0, 16).replace('T', ' ') : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Tarjeta>

      {detalle && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-auto bg-black/50 p-4" onClick={() => setDetalle(null)}>
          <Tarjeta className="my-8 w-full max-w-3xl p-6" >
            <div onClick={(e) => e.stopPropagation()}>
              <div className="mb-4 flex items-start justify-between gap-3">
                <div><h2 className="text-xl font-extrabold">{detalle.usuario.nombre}</h2><p className="text-sm text-slate-500">@{detalle.usuario.username} · nivel {detalle.usuario.nivel} · {detalle.usuario.xp} XP · racha {detalle.usuario.racha} · mejor racha {detalle.usuario.mejorRacha}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">{detalle.insignias.map((i) => <Chip key={i} tono="ambar">{INSIGNIAS[i]?.emoji} {INSIGNIAS[i]?.nombre}</Chip>)}</div></div>
                <button onClick={() => setDetalle(null)} className="rounded-full p-1.5 hover:bg-slate-100"><X /></button>
              </div>
              {CLASES.map((c) => (
                <div key={c.n} className="mb-4">
                  <h3 className="mb-1.5 font-bold" style={{ color: c.color }}>Clase {c.n} · {c.titulo}</h3>
                  <ul className="grid gap-1 sm:grid-cols-2">
                    {c.pasos.map((p) => { const x = detalle.progreso.find((q) => q.actividad === p.id); return (
                      <li key={p.id} className="flex items-center gap-2 rounded-lg bg-slate-50 px-2.5 py-1 text-sm">
                        {x?.completada ? <Check size={15} className="flex-none text-emerald-600" /> : <span className="h-3.5 w-3.5 flex-none rounded-full border-2 border-slate-300" />}
                        <span className="flex-1 truncate">{p.titulo}</span>{x ? <span className="text-xs font-semibold text-slate-500">{x.mejorPuntaje}% · {x.intentos} int.</span> : null}
                      </li>); })}
                  </ul>
                </div>
              ))}
            </div>
          </Tarjeta>
        </div>
      )}
    </div>
  );
}
