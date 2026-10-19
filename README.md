# Aula Excel

Plataforma interactiva para las 3 clases de Excel (informática): lecturas con capturas marcadas, actividades para completar,
una **planilla que funciona como Excel** (fórmulas en español, controlador de relleno, formato), laboratorio de datos,
puntos de experiencia, rachas e insignias. El progreso se guarda por **nombre de usuario** en MySQL.

## Partes
- `web/` — Vite + React + TypeScript + Tailwind (la app de los alumnos y el panel del docente).
- `server/` — Node.js + Express + MySQL (ingreso por usuario, progreso, panel docente). Sirve también la web compilada.
- Base de datos: `excel_aula` (tablas `usuarios`, `progreso`, `insignias`) en el MySQL local del equipo. Esquema: `server/scripts/schema.sql`.

## Uso rápido
- **Producción / clase:** doble clic en `iniciar_aula.bat` → http://localhost:3010 (alumnos y docente usan la misma dirección).
- **Desarrollo:** `cd server && npm run dev` y, en otra terminal, `cd web && npm run dev` → http://localhost:5174.
- **Primera vez en otro equipo:** `cd server && npm install && npm run bd` (crea la base y `server/.env`), luego `cd web && npm install && npm run build`.

## Panel del docente
`/docente`. La clave está en `server/.env` (variable `DOCENTE_KEY`). Muestra el avance de cada alumno por clase, puntaje promedio, XP,
racha y el detalle paso a paso.

## Cómo está armado el contenido
Todo el contenido está en `web/src/contenido/` (`clase1.ts`, `clase2.ts`, `clase3.ts`): cada clase es una lista de pasos
(lectura, actividad, reto en la planilla, laboratorio). Los datos de práctica están en `datos.ts`.
Las capturas (`web/public/capturas/*.png` + `.json` con la posición de las marcas) se generan desde `material_excel/` (`pantallas.py` y `render_caps.mjs`).

## Pruebas
- `web/scratch` no se versiona. Pruebas de navegador en `pruebas/` (Playwright): `e2e.mjs`, `visual.mjs`, `movil.mjs`, `docente.mjs`.
- Los retos de la planilla se verificaron automáticamente: cada uno se puede resolver con fórmulas y no se aprueba vacío.

## Seguridad (importante)
- El ingreso es **solo con el nombre de usuario, sin contraseña** (decisión del proyecto). Quien conozca un usuario puede ver y modificar su progreso.
  Si más adelante hace falta, se puede agregar un PIN de 4 dígitos por alumno.
- El token de sesión dura 60 días. El panel del docente se protege con `DOCENTE_KEY`.
- `server/.env` contiene claves: no se sube a ningún repositorio (ya está en `.gitignore`).
