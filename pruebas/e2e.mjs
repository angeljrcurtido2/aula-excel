import { createRequire } from 'node:module';
import fs from 'node:fs';
const require = createRequire('C:/SIS_VENTAS_NEXT/migracion_cliente/package.json');
const { chromium } = require('playwright');
const B = process.env.BASE || 'http://127.0.0.1:5174';
fs.mkdirSync('shots', { recursive: true });
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1360, height: 900 } });
const p = await ctx.newPage();
const errores = [];
p.on('pageerror', (e) => errores.push('PAGEERROR ' + e.message));
p.on('console', (m) => { if (m.type() === 'error') errores.push('CONSOLE ' + m.text()); });
const foto = (n) => p.screenshot({ path: `shots/${n}.png` });
const usuario = 'qa.' + Date.now().toString(36);

await p.goto(B); await p.waitForSelector('text=Ingresa a tu aula'); await foto('01_login');
await p.fill('input[placeholder="por ejemplo: ana.perez"]', usuario);
await p.click('button:has-text("Continuar")');
await p.waitForSelector('text=Crea tu usuario');
await p.fill('input[placeholder="Ana Pérez"]', 'Prueba Automática');
await p.click('button:has-text("Crear mi usuario")');
await p.waitForSelector('text=Tus clases'); await foto('02_inicio');

// lectura
await p.goto(`${B}/clase/1/c1-lec-1`); await p.waitForSelector('h1:has-text("¿Qué es Excel?")');
await p.click('button:has-text("Entendido")'); await p.waitForSelector('text=Lectura completada'); await foto('03_lectura');

// cloze con banco
await p.goto(`${B}/clase/1/c1-act-a`); await p.waitForSelector('text=Banco de palabras');
const resp = ['cálculo', 'filas', 'columnas', 'libro', 'hoja', 'abajo', 'letras', 'números', 'celda', 'rango'];
const sels = p.locator('select'); const n = await sels.count();
for (let i = 0; i < n; i++) await sels.nth(i).selectOption(resp[i]);
await p.click('button:has-text("Comprobar")'); await p.waitForSelector('text=Perfecto'); await foto('04_cloze');

// reto 1: tabla
await p.goto(`${B}/clase/1/c1-reto-1`); await p.waitForSelector('.xl-grid'); await p.locator('.xl-grid').scrollIntoViewIfNeeded(); await p.waitForTimeout(500);
const celda = async (ref) => { const g = await p.locator('.xl-grid').boundingBox(); return g; };
const col = (c) => 40 + [150, 110, 130, 90, 90].slice(0, c).reduce((a, x) => a + x, 0);
const clic = async (c, r, w = 20) => { const g = await p.locator('.xl-grid').boundingBox(); await p.mouse.click(g.x + col(c) + 10, g.y + 22 + r * 24 + 10); };
await clic(0, 0);
const escribe = async (txt) => { await p.keyboard.type(txt); await p.keyboard.press('Tab'); };
await p.keyboard.type('Mis gastos del mes'); await p.keyboard.press('Enter');
await clic(0, 2); for (const t of ['Concepto', 'Categoría', 'Monto (Gs.)']) { await p.keyboard.type(t); await p.keyboard.press('Tab'); }
const datos = [['Alquiler', 'Vivienda', '1500000'], ['Luz (ANDE)', 'Servicios', '180000'], ['Agua', 'Servicios', '60000'], ['Internet', 'Servicios', '150000']];
for (let i = 0; i < datos.length; i++) { await clic(0, 3 + i); for (const t of datos[i]) { await p.keyboard.type(t); await p.keyboard.press('Tab'); } }
await foto('05_reto1_datos');
// formato: seleccionar A3:C3 arrastrando
const g = await p.locator('.xl-grid').boundingBox();
const arrastrar = async (c1, r1, c2, r2) => { await p.mouse.move(g.x + col(c1) + 10, g.y + 22 + r1 * 24 + 10); await p.mouse.down(); await p.mouse.move(g.x + col(c2) + 10, g.y + 22 + r2 * 24 + 10, { steps: 6 }); await p.mouse.up(); };
await arrastrar(0, 2, 2, 2);
await p.click('button[title="Negrita"]'); await p.click('button[title="Color de relleno"]'); await p.click('button[title="#ffd966"]');
await arrastrar(2, 3, 2, 6); await p.click('button[title="Estilo millares"]');
await arrastrar(0, 2, 2, 6); await p.click('button[title^="Bordes"]');
await foto('06_reto1_formato');
await p.click('button:has-text("Comprobar")'); await p.waitForSelector('text=Reto superado', { timeout: 4000 }).catch(() => {}); await foto('07_reto1_resultado');
const ok1 = await p.locator('text=Reto superado').count();

// reto 2.1 relleno
await p.goto(`${B}/clase/2/c2-reto-1`); await p.waitForSelector('.xl-grid'); await p.locator('.xl-grid').scrollIntoViewIfNeeded(); await p.waitForTimeout(500);
const g2 = await p.locator('.xl-grid').boundingBox();
const col2 = (c) => 40 + [150, 90, 120, 120, 80].slice(0, c).reduce((a, x) => a + x, 0);
await p.mouse.click(g2.x + col2(3) + 10, g2.y + 22 + 3 * 24 + 10);
await p.keyboard.type('=B4*C4'); await p.keyboard.press('Enter');
await p.mouse.click(g2.x + col2(3) + 10, g2.y + 22 + 3 * 24 + 10);
await foto('08_antes_asa'); console.log('asa count', await p.locator('.xl-asa').count(), 'edit', await p.locator('.xl-edit').count(), await p.locator('.xl-formula').inputValue());
const asa = await p.locator('.xl-asa').boundingBox();
await p.mouse.move(asa.x + 4, asa.y + 4); await p.mouse.down(); await p.mouse.move(asa.x + 4, asa.y + 4 + 24 * 3, { steps: 8 }); await foto('08_relleno_arrastrando'); await p.mouse.up();
await foto('09_relleno'); await p.click('button:has-text("Comprobar")'); await p.waitForTimeout(400); await foto('10_reto2_1');
const ok2 = await p.locator('text=Reto superado').count();

// laboratorio y progreso
await p.goto(`${B}/`); await p.waitForSelector('text=Tus clases'); await foto('11_inicio_final');
const xp = await p.locator('header').innerText();
console.log(JSON.stringify({ usuario, ok1, ok2, errores, header: xp.replace(/\s+/g, ' ').slice(0, 120) }));
await b.close();
