import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Flame, Sparkles, Trophy } from 'lucide-react';
import { ErrorApi } from '../api';
import { useSesion } from '../sesion';
import { Boton } from '../ui';

export function Login() {
  const { ingresar } = useSesion();
  const ir = useNavigate();
  const [username, setUsername] = useState('');
  const [nombre, setNombre] = useState('');
  const [pedirNombre, setPedirNombre] = useState(false);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setCargando(true);
    try {
      await ingresar(username.trim().toLowerCase(), pedirNombre ? nombre : undefined);
      ir('/');
    } catch (err) {
      if (err instanceof ErrorApi && err.status === 404 && err.datos?.crear) { setPedirNombre(true); setError(''); }
      else setError(err instanceof Error ? err.message : 'No pudimos ingresar.');
    } finally { setCargando(false); }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-excel via-excel-dark to-navy p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-3 text-2xl font-extrabold"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-2xl font-black text-excel shadow">X</span> Aula Excel</div>
        <div>
          <h1 className="mb-4 text-5xl font-extrabold leading-tight">Aprende Excel<br />practicando de verdad.</h1>
          <p className="max-w-md text-lg text-white/85">Tres clases interactivas con una planilla real donde escribes fórmulas, das formato y resuelves retos. Tu avance se guarda solo.</p>
          <ul className="mt-8 space-y-3 text-white/90">
            <li className="flex items-center gap-3"><Sparkles className="text-amber-300" /> Retos con corrección inmediata y pistas</li>
            <li className="flex items-center gap-3"><Flame className="text-amber-300" /> Rachas diarias y puntos de experiencia</li>
            <li className="flex items-center gap-3"><Trophy className="text-amber-300" /> Insignias al completar cada clase</li>
          </ul>
        </div>
        <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-24 right-10 h-64 w-64 rounded-full bg-amber-300/20" />
        <p className="text-sm text-white/60">Informática · Clases 1, 2 y 3</p>
      </div>

      <div className="flex items-center justify-center p-6">
        <form onSubmit={enviar} className="anim-subir w-full max-w-md rounded-3xl bg-white p-8 shadow-xl ring-1 ring-slate-200">
          <div className="mb-6 flex items-center gap-3 lg:hidden"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-excel text-xl font-black text-white">X</span><span className="text-xl font-extrabold">Aula Excel</span></div>
          <h2 className="text-2xl font-extrabold">{pedirNombre ? '¡Bienvenido! Crea tu usuario' : 'Ingresa a tu aula'}</h2>
          <p className="mb-6 mt-1 text-slate-500">{pedirNombre ? 'Ese usuario todavía no existe. Dinos cómo te llamas para crearlo.' : 'Escribe tu nombre de usuario. Si es tu primera vez, lo creamos en un paso.'}</p>

          <label className="mb-1 block text-sm font-semibold">Nombre de usuario</label>
          <input value={username} onChange={(e) => { setUsername(e.target.value); setPedirNombre(false); }} autoFocus autoCapitalize="none" autoComplete="username" spellCheck={false} placeholder="por ejemplo: ana.perez"
            className="mb-1 w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-lg outline-none transition focus:border-excel" />
          <p className="mb-4 text-xs text-slate-500">De 3 a 30 caracteres: minúsculas, números, punto, guion o guion bajo. Con este usuario volverás a entrar.</p>

          {pedirNombre && <div className="anim-subir">
            <label className="mb-1 block text-sm font-semibold">Tu nombre y apellido</label>
            <input value={nombre} onChange={(e) => setNombre(e.target.value)} autoFocus placeholder="Ana Pérez" maxLength={80} className="mb-4 w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-lg outline-none transition focus:border-excel" />
          </div>}

          {error && <p className="mb-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
          <Boton type="submit" disabled={cargando || username.trim().length < 3 || (pedirNombre && nombre.trim().length < 2)} className="w-full !py-3 text-base">{cargando ? 'Entrando…' : pedirNombre ? 'Crear mi usuario y empezar' : 'Continuar'} <ArrowRight size={18} /></Boton>
          <p className="mt-5 text-center text-xs text-slate-400">No necesitas contraseña. Tu docente puede ver tu progreso.</p>
        </form>
      </div>
    </div>
  );
}
