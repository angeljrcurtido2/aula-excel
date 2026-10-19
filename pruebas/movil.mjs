import { createRequire } from 'node:module';
const require = createRequire('C:/SIS_VENTAS_NEXT/migracion_cliente/package.json');
const { chromium, devices } = require('playwright');
const B = process.env.BASE || 'http://127.0.0.1:5174';
const b = await chromium.launch();
const ctx = await b.newContext({ ...devices['Pixel 7'] });
const p = await ctx.newPage();
const u = 'qa.mov' + Date.now().toString(36);
await p.goto(B); await p.screenshot({ path: 'shots/m_login.png' });
await p.fill('input[placeholder="por ejemplo: ana.perez"]', u); await p.click('button:has-text("Continuar")'); await p.fill('input[placeholder="Ana Pérez"]', 'Móvil Qa'); await p.click('button:has-text("Crear mi usuario")'); await p.waitForSelector('text=Tus clases');
await p.screenshot({ path: 'shots/m_inicio.png' });
for (const [r, n, w] of [['/clase/1/c1-lec-1', 'lectura', 'text=La pantalla de Excel'], ['/clase/2/c2-reto-2', 'reto', '.xl-grid'], ['/clase/1/c1-act-b', 'rotula', 'text=Rotula la pantalla']]) { await p.goto(B + r); await p.waitForSelector(w); await p.waitForTimeout(500); await p.screenshot({ path: `shots/m_${n}.png`, fullPage: true }); }
const ancho = await p.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
console.log(JSON.stringify(ancho));
await b.close();
