import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './Layout';
import { Clase } from './paginas/Clase';
import { Docente } from './paginas/Docente';
import { Inicio } from './paginas/Inicio';
import { Login } from './paginas/Login';
import { useSesion } from './sesion';

export default function App() {
  const { perfil, cargando } = useSesion();
  if (cargando) return <div className="flex min-h-screen items-center justify-center text-slate-500">Cargando…</div>;
  return (
    <Routes>
      <Route path="/ingresar" element={perfil ? <Navigate to="/" replace /> : <Login />} />
      <Route element={perfil ? <Layout /> : <Navigate to="/ingresar" replace />}>
        <Route path="/" element={<Inicio />} />
        <Route path="/clase/:n/:pasoId?" element={<Clase />} />
        <Route path="/docente" element={<Docente />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
