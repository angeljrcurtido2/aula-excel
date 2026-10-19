// ¿Es práctico para un alumno? Celular, conexión lenta, tamaños táctiles, persistencia, fallas de red.
import { createRequire } from 'node:module';
import fs from 'node:fs';
const require = createRequire('C:/SIS_VENTAS_NEXT/migracion_cliente/package.json');
const { chromium, devices } = require('playwright');
const BASE = process.env.BASE || 'https://aula-excel.netlify.app';
fs.mkdirSync('shots', { recursive: true });
const salida = { rutas: [], toques: [], notas: [] };
const b = await chromium.launch();

// ---------- 1) conexión lenta (4G lenta) en celular ----------
{
  const ctx = await b.newContext({ ...devices['Pixel 7'] });
  const p = await ctx.newPage();
  const cdp = await ctx.newCDPSession(p);
  await cdp.send('Network.enable');
  await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 });
  let bytes = 0; p.on('response', async (r) => { try { const h = r.headers()['content-length']; if (h) bytes += Number(h); } catch { /* */ } });
  const t = Date.now(); await p.goto(BASE, { waitUntil: 'load' }); await p.waitForSelector('text=Ingresa a tu aula');
  salida.carga4G = { ms: Date.now() - t, kb: Math.round(bytes / 1024) };
  await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });
  await ctx.close();
}

// ---------- 2) recorrido móvil ----------
const ctx = await b.newContext({ ...devices['Pixel 7'] });
const p = await ctx.newPage();
const errores = []; p.on('pageerror', (e) => errores.push(e.message));
const u = 'qa.movil' + Date.now().toString(36);
await p.goto(BASE); await p.fill('input[placeholder="por ejemplo: ana.perez"]', u); await p.click('button:has-text("Continuar")'); await p.fill('input[placeholder="Ana Pérez"]', 'Móvil Práctico'); await p.click('button:has-text("Crear mi usuario")'); await p.waitForSelector('text=Tus clases');

const medir = async (ruta, esperar) => {
  await p.goto(BASE + ruta); await p.waitForSelector(esperar, { timeout: 10000 }); await p.waitForTimeout(600);
  const r = await p.evaluate(() => {
    const dw = document.documentElement.scrollWidth - document.documentElement.clientWidth;
    const chicos = [...document.querySelectorAll('button, a, input, select, textarea')].filter((e) => { const r = e.getBoundingClientRect(); const v = r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== 'hidden' && !e.closest('.xl-grid') && !e.closest('#nl-badge-frame'); return v && (r.height < 30 || r.width < 30); }).map((e) => `${e.tagName.toLowerCase()}:${(e.innerText || e.title || e.getAttribute('aria-label') || '').trim().slice(0, 18)} ${Math.round(e.getBoundingClientRect().width)}x${Math.round(e.getBoundingClientRect().height)}`);
    return { desbordeX: dw, chicos: chicos.slice(0, 6), nChicos: chicos.length };
  });
  salida.rutas.push({ ruta, ...r });
};
for (const [r, e] of [['/', 'text=Tus clases'], ['/clase/1/c1-lec-1', 'h1:has-text("¿Qué es Excel?")'], ['/clase/1/c1-act-a', 'text=Banco de palabras'], ['/clase/1/c1-act-d', 'h1:has-text("Une con la tecla")'], ['/clase/1/c1-act-b', 'h1:has-text("Rotula la pantalla")'], ['/clase/3/c3-act-c', 'h1:has-text("Ordena los pasos")'], ['/clase/1/c1-reto-1', '.xl-grid'], ['/clase/2/c2-reto-2', '.xl-grid'], ['/clase/3/c3-reto-4', '.xl-grid'], ['/clase/3/c3-lab', 'text=Misiones del laboratorio']]) await medir(r, e);
await p.screenshot({ path: 'shots/p_movil_lab.png', fullPage: true });

// ---------- 3) escribir en la planilla desde el celular: tocar, tocar otra vez, teclear ----------
await p.goto(BASE + '/clase/2/c2-reto-3'); await p.waitForSelector('.xl-grid'); await p.locator('.xl-grid').scrollIntoViewIfNeeded(); await p.waitForTimeout(500);
{
  await p.locator('.xl-scroll').evaluate((el) => { el.scrollLeft = 260; }); await p.waitForTimeout(250);
  const g = await p.locator('.xl-grid').boundingBox();
  const xyD = (fila) => [g.x + 40 + 150 + 90 + 140 + 10, g.y + 22 + (fila - 1) * 24 + 12];
  const [x, y] = xyD(9);
  await p.touchscreen.tap(x, y); await p.waitForTimeout(250);         // 1.º toque: selecciona
  await p.touchscreen.tap(x, y); await p.waitForTimeout(350);         // 2.º toque: abre la edición (teclado)
  const editando = await p.locator('.xl-edit').count();
  await p.keyboard.type('=SUMA(D4:D7)'); await p.keyboard.press('Enter'); await p.waitForTimeout(300);
  const [x2, y2] = xyD(9);
  const visible = await p.evaluate(([xx, yy]) => document.elementFromPoint(xx, yy)?.textContent?.trim(), [x2, y2]);
  salida.planillaEnCelular = { segundoToqueAbreEdicion: editando === 1, valorEnD9: visible };
  await p.screenshot({ path: 'shots/p_movil_planilla.png' });
}

// ---------- 4) persistencia: completar, recargar, seguir ----------
await p.goto(BASE + '/clase/1/c1-act-a'); await p.waitForSelector('text=Banco de palabras');
const resp = ['cálculo', 'filas', 'columnas', 'libro', 'hoja', 'abajo', 'letras', 'números', 'celda', 'rango'];
const sels = p.locator('section select'); for (let i = 0; i < 10; i++) await sels.nth(i).selectOption({ label: resp[i] });
await p.click('button:has-text("Comprobar")'); await p.waitForSelector('text=Perfecto');
await p.reload(); await p.waitForSelector('text=Banco de palabras'); await p.waitForTimeout(500);
salida.persistencia = { recuerdaCompletada: (await p.locator('text=Ya la completaste').count()) > 0 || (await p.locator('text=Completado').count()) > 0, sesionVigente: (await p.locator('header').innerText()).includes('Móvil Práctico') };

// ---------- 5) si el servidor falla: no se rompe y avisa ----------
await ctx.route('**/api/progreso', (r) => r.abort());
await p.goto(BASE + '/clase/1/c1-act-c'); await p.waitForSelector('h1:has-text("Observa y responde")');
const ins = p.locator('input[placeholder="Escribe tu respuesta…"]'); const resp2 = ['B3', 'B', '3', 'A3:C6', '12', 'D10']; for (let i = 0; i < 6; i++) await ins.nth(i).fill(resp2[i]);
await p.click('button:has-text("Comprobar")'); await p.waitForTimeout(1500);
salida.servidorCaido = { muestraResultado: (await p.locator('text=Perfecto').count()) > 0, avisaError: (await p.locator('text=/Sin conexión/').count()) > 0, paginaViva: (await p.locator('h1').count()) > 0 };
await ctx.unroute('**/api/progreso');
// vuelve internet: el avance pendiente se reenvía solo (al abrir la app o con el evento «online»)
await p.evaluate(() => window.dispatchEvent(new Event('online'))); await p.waitForTimeout(2500);
const guardado = await p.evaluate(async () => { const t = localStorage.getItem('aula-excel-token'); const r = await fetch('/api/yo', { headers: { Authorization: 'Bearer ' + t } }).catch(() => null); return null; });
void guardado;
await p.goto(BASE + '/'); await p.waitForSelector('text=Tus clases'); await p.waitForTimeout(1500);
salida.servidorCaido.avanceRecuperado = (await p.locator('main').innerText()).match(/COMPLETADOS\s*(\d+)\/57/i)?.[1];

// ---------- 6) navegación: atrás / adelante ----------
await p.goto(BASE + '/clase/1/c1-lec-1'); await p.waitForSelector('h1:has-text("¿Qué es Excel?")');
await p.click('button:has-text("Siguiente")'); await p.waitForSelector('h1:has-text("Completa con lo leído")');
await p.goBack(); await p.waitForSelector('h1:has-text("¿Qué es Excel?")');
salida.atras = true;
salida.errores = errores;
console.log(JSON.stringify(salida, null, 1));
await b.close();
