// Aula Excel · servidor. Node + Express + MySQL. Ingreso solo con nombre de usuario (sin clave), progreso guardado por usuario.
import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';
import mysql from 'mysql2/promise';

const { PORT = 3010, JWT_SECRET, DOCENTE_KEY, CORS_ORIGINS = '' } = process.env;
if (!JWT_SECRET || !DOCENTE_KEY) { console.error('Falta JWT_SECRET o DOCENTE_KEY en server/.env (ejecuta: npm run bd)'); process.exit(1); }

const pool = mysql.createPool({
  host: process.env.DB_HOST, user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_NAME,
  waitForConnections: true, connectionLimit: 8, charset: 'utf8mb4', dateStrings: true,
});

const TIPOS = new Set(['lectura', 'actividad', 'reto', 'quiz']);
const XP_BASE = { lectura: 5, actividad: 10, reto: 20, quiz: 15 };
const XP_PERFECTO = { lectura: 0, actividad: 5, reto: 10, quiz: 8 };
const nivelDe = (xp) => Math.floor(xp / 100) + 1;
const USERNAME = /^[a-z0-9._-]{3,30}$/;

const app = express();
app.set('trust proxy', 1);
app.use(helmet({ contentSecurityPolicy: { useDefaults: true, directives: { 'worker-src': ["'self'", 'blob:'], 'img-src': ["'self'", 'data:'] } } }));
app.use(cors({ origin: CORS_ORIGINS.split(',').map((s) => s.trim()).filter(Boolean) }));
app.use(express.json({ limit: '100kb' }));

const wrap = (fn) => (req, res) => fn(req, res).catch((e) => { console.error('❌', req.method, req.path, e.message); res.status(500).json({ error: 'Error interno. Intenta de nuevo.' }); });
const hoy = () => new Date().toISOString().slice(0, 10);
const ayer = () => new Date(Date.now() - 864e5).toISOString().slice(0, 10);

async function perfil(uid, cn = pool) {
  const [[u]] = await cn.query('SELECT id, username, nombre, xp, racha_actual, mejor_racha, ultimo_dia, creado_en FROM usuarios WHERE id = ?', [uid]);
  const [prog] = await cn.query('SELECT actividad, clase, tipo, completada, mejor_puntaje, intentos, estado, xp_ganado, actualizado_en FROM progreso WHERE usuario_id = ?', [uid]);
  const [ins] = await cn.query('SELECT codigo, ganada_en FROM insignias WHERE usuario_id = ? ORDER BY ganada_en', [uid]);
  return {
    usuario: { username: u.username, nombre: u.nombre, xp: u.xp, nivel: nivelDe(u.xp), xpNivel: u.xp % 100, racha: u.racha_actual, mejorRacha: u.mejor_racha, desde: u.creado_en },
    progreso: prog.map((p) => ({ actividad: p.actividad, clase: p.clase, tipo: p.tipo, completada: !!p.completada, mejorPuntaje: p.mejor_puntaje, intentos: p.intentos, estado: typeof p.estado === 'string' ? JSON.parse(p.estado) : p.estado, xpGanado: p.xp_ganado, actualizado: p.actualizado_en })),
    insignias: ins.map((i) => i.codigo),
  };
}

const firmar = (u) => jwt.sign({ uid: u.id, username: u.username }, JWT_SECRET, { expiresIn: '60d' });
const auth = (req, res, next) => {
  const t = (req.headers.authorization || '').replace(/^Bearer /, '');
  try { req.user = jwt.verify(t, JWT_SECRET); next(); } catch { res.status(401).json({ error: 'Sesión vencida. Ingresa de nuevo.' }); }
};
const iguales = (a, b) => { const x = Buffer.from(String(a)), y = Buffer.from(String(b)); return x.length === y.length && crypto.timingSafeEqual(x, y); };
const docente = (req, res, next) => (iguales(req.headers['x-docente-key'] || '', DOCENTE_KEY) ? next() : res.status(403).json({ error: 'Clave de docente incorrecta.' }));

app.get('/api/salud', (req, res) => res.json({ ok: true }));

// ---- ingreso: solo con nombre de usuario ----
app.post('/api/login', rateLimit({ windowMs: 15 * 60 * 1000, limit: 60, standardHeaders: true, legacyHeaders: false }), wrap(async (req, res) => {
  const username = String(req.body?.username || '').trim().toLowerCase();
  const nombre = String(req.body?.nombre || '').trim().replace(/\s+/g, ' ');
  if (!USERNAME.test(username)) return res.status(400).json({ error: 'El usuario debe tener de 3 a 30 caracteres: letras minúsculas, números, punto, guion o guion bajo.' });
  let [[u]] = await pool.query('SELECT id, username, nombre FROM usuarios WHERE username = ?', [username]);
  let nuevo = false;
  if (!u) {
    if (nombre.length < 2 || nombre.length > 80) return res.status(404).json({ error: 'Ese usuario todavía no existe. Escribe tu nombre para crearlo.', crear: true });
    const [r] = await pool.query('INSERT INTO usuarios (username, nombre) VALUES (?, ?)', [username, nombre]);
    u = { id: r.insertId, username, nombre };
    nuevo = true;
  }
  await pool.query('UPDATE usuarios SET ultimo_acceso = NOW() WHERE id = ?', [u.id]);
  res.json({ token: firmar(u), nuevo, ...(await perfil(u.id)) });
}));

app.get('/api/yo', auth, wrap(async (req, res) => res.json(await perfil(req.user.uid))));

// ---- guardar progreso de una actividad ----
app.post('/api/progreso', auth, wrap(async (req, res) => {
  const b = req.body || {};
  const actividad = String(b.actividad || '');
  const clase = Number(b.clase), tipo = String(b.tipo || '');
  const puntaje = Math.max(0, Math.min(100, Math.round(Number(b.puntaje) || 0)));
  const completada = !!b.completada, intento = b.intento !== false;
  const totalClase = Math.min(60, Math.max(0, Number(b.totalClase) || 0));
  if (!/^[a-z0-9-]{3,60}$/.test(actividad) || ![1, 2, 3].includes(clase) || !TIPOS.has(tipo)) return res.status(400).json({ error: 'Datos de actividad inválidos.' });
  const estado = b.estado && typeof b.estado === 'object' ? JSON.stringify(b.estado) : null;
  if (estado && estado.length > 20000) return res.status(413).json({ error: 'Respuesta demasiado grande.' });

  const cn = await pool.getConnection();
  try {
    await cn.beginTransaction();
    const [[prev]] = await cn.query('SELECT id, completada, mejor_puntaje, xp_ganado FROM progreso WHERE usuario_id = ? AND actividad = ? FOR UPDATE', [req.user.uid, actividad]);
    let xp = 0;
    if (completada && !(prev && prev.completada)) xp += XP_BASE[tipo];
    if (completada && puntaje === 100 && !(prev && prev.mejor_puntaje === 100)) xp += XP_PERFECTO[tipo];
    if (!prev) {
      await cn.query('INSERT INTO progreso (usuario_id, actividad, clase, tipo, completada, mejor_puntaje, intentos, estado, xp_ganado) VALUES (?,?,?,?,?,?,?,?,?)',
        [req.user.uid, actividad, clase, tipo, completada ? 1 : 0, puntaje, intento ? 1 : 0, estado, xp]);
    } else {
      await cn.query('UPDATE progreso SET completada = ?, mejor_puntaje = ?, intentos = intentos + ?, estado = ?, xp_ganado = xp_ganado + ? WHERE id = ?',
        [(prev.completada || completada) ? 1 : 0, Math.max(prev.mejor_puntaje, puntaje), intento ? 1 : 0, estado, xp, prev.id]);
    }
    // XP y racha de días
    const [[u]] = await cn.query('SELECT xp, racha_actual, mejor_racha, ultimo_dia FROM usuarios WHERE id = ? FOR UPDATE', [req.user.uid]);
    let racha = u.racha_actual;
    if (completada || intento) {
      if (u.ultimo_dia === hoy()) racha = Math.max(1, racha);
      else if (u.ultimo_dia === ayer()) racha += 1;
      else racha = 1;
    }
    await cn.query('UPDATE usuarios SET xp = xp + ?, racha_actual = ?, mejor_racha = GREATEST(mejor_racha, ?), ultimo_dia = ? WHERE id = ?', [xp, racha, racha, hoy(), req.user.uid]);

    // insignias
    const [[c]] = await cn.query(`SELECT SUM(completada) AS hechas, SUM(completada AND mejor_puntaje = 100) AS perfectas, SUM(completada AND tipo = 'reto') AS retos FROM progreso WHERE usuario_id = ?`, [req.user.uid]);
    const [[cc]] = await cn.query('SELECT SUM(completada) AS hechas FROM progreso WHERE usuario_id = ? AND clase = ?', [req.user.uid, clase]);
    const ganadas = [];
    if (c.hechas >= 1) ganadas.push('primer_paso');
    if (c.hechas >= 10) ganadas.push('constante');
    if (c.perfectas >= 5) ganadas.push('perfeccionista');
    if (c.retos >= 3) ganadas.push('formulista');
    if (racha >= 3) ganadas.push('racha3');
    if (racha >= 7) ganadas.push('racha7');
    if (totalClase >= 5 && cc.hechas >= totalClase) ganadas.push(`clase${clase}`);
    const [ya] = await cn.query('SELECT codigo FROM insignias WHERE usuario_id = ?', [req.user.uid]);
    const tiene = new Set(ya.map((i) => i.codigo));
    const nuevas = ganadas.filter((g) => !tiene.has(g));
    for (const g of nuevas) await cn.query('INSERT IGNORE INTO insignias (usuario_id, codigo) VALUES (?, ?)', [req.user.uid, g]);
    await cn.commit();
    res.json({ xpGanado: xp, insigniasNuevas: nuevas, ...(await perfil(req.user.uid)) });
  } catch (e) { await cn.rollback(); throw e; } finally { cn.release(); }
}));

// ---- panel del docente ----
app.get('/api/docente/resumen', docente, wrap(async (req, res) => {
  const [filas] = await pool.query(`
    SELECT u.username, u.nombre, u.xp, u.racha_actual AS racha, u.ultimo_acceso AS ultimoAcceso, u.creado_en AS desde,
      COALESCE(SUM(CASE WHEN p.clase = 1 AND p.completada THEN 1 END), 0) AS c1,
      COALESCE(SUM(CASE WHEN p.clase = 2 AND p.completada THEN 1 END), 0) AS c2,
      COALESCE(SUM(CASE WHEN p.clase = 3 AND p.completada THEN 1 END), 0) AS c3,
      COALESCE(ROUND(AVG(CASE WHEN p.completada THEN p.mejor_puntaje END)), 0) AS promedio
    FROM usuarios u LEFT JOIN progreso p ON p.usuario_id = u.id GROUP BY u.id ORDER BY u.xp DESC, u.username`);
  res.json({ alumnos: filas.map((f) => ({ ...f, c1: Number(f.c1), c2: Number(f.c2), c3: Number(f.c3), promedio: Number(f.promedio), nivel: nivelDe(f.xp) })) });
}));
app.get('/api/docente/usuario/:username', docente, wrap(async (req, res) => {
  const [[u]] = await pool.query('SELECT id FROM usuarios WHERE username = ?', [String(req.params.username).toLowerCase()]);
  if (!u) return res.status(404).json({ error: 'No existe ese usuario.' });
  res.json(await perfil(u.id));
}));

// ---- web compilada (producción): una sola dirección para alumnos y docente ----
const dist = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'web', 'dist');
if (fs.existsSync(path.join(dist, 'index.html'))) {
  app.use(express.static(dist, { maxAge: '1h', index: false }));
  app.get(/^(?!\/api\/).*/, (req, res) => res.sendFile(path.join(dist, 'index.html')));
}

app.listen(PORT, () => console.log(`✅ Aula Excel (servidor) en http://localhost:${PORT}`));
