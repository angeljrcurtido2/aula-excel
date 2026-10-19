// Crea la base "excel_aula" y su esquema. No imprime ninguna clave.
// Usa las credenciales del MySQL local que ya usa el sistema (server-desa/.env) solamente para esta creación inicial.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

const aqui = path.dirname(fileURLToPath(import.meta.url));
const destino = path.join(aqui, '..', '.env');
if (fs.existsSync(destino)) { console.log('Ya existe server/.env: no se vuelve a crear (borra el archivo si quieres regenerarlo).'); process.exit(0); }
const raiz = dotenv.parse(fs.readFileSync(path.join(aqui, '..', '..', '..', 'server-desa', '.env')));
const cn = await mysql.createConnection({ host: raiz.DB_HOST || 'localhost', user: raiz.DB_USER, password: raiz.DB_PASSWORD, multipleStatements: true });
await cn.query('CREATE DATABASE IF NOT EXISTS excel_aula CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
// Nota: no se crea un usuario de MySQL dedicado porque la tabla de permisos mysql.db de este servidor está dañada
// ("Index for table 'db' is corrupt") y cualquier GRANT falla. Se usa el mismo usuario local que el resto del sistema.
await cn.query('USE excel_aula');
await cn.query(fs.readFileSync(path.join(aqui, 'schema.sql'), 'utf8'));
await cn.end();
const env = [
  'PORT=3010', `DB_HOST=${raiz.DB_HOST || 'localhost'}`, `DB_USER=${raiz.DB_USER}`, `DB_PASSWORD=${raiz.DB_PASSWORD}`, 'DB_NAME=excel_aula',
  `JWT_SECRET=${crypto.randomBytes(32).toString('hex')}`, `DOCENTE_KEY=${crypto.randomBytes(9).toString('base64url')}`,
  'CORS_ORIGINS=http://localhost:5174,http://127.0.0.1:5174', '',
].join('\n');
fs.writeFileSync(destino, env, { mode: 0o600 });
console.log('Base "excel_aula" lista y server/.env creado (contiene la clave del docente: DOCENTE_KEY).');
