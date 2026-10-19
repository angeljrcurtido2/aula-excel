// Recorrido COMPLETO de un alumno en la web publicada: los 57 pasos, con teclado y mouse reales (Playwright).
// Uso: BASE=https://aula-excel.netlify.app node completo.mjs
import { createRequire } from 'node:module';
import fs from 'node:fs';
import { CLASES } from './contenido.mjs';
const require = createRequire('C:/SIS_VENTAS_NEXT/migracion_cliente/package.json');
const { chromium } = require('playwright');
const BASE = process.env.BASE || 'https://aula-excel.netlify.app';
fs.mkdirSync('shots', { recursive: true });

const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1360, height: 900 } });
const p = await ctx.newPage();
const problemas = [], tiempos = [], lentas = [];
p.on('pageerror', (e) => problemas.push('JS: ' + e.message));
p.on('console', (m) => { if (m.type() === 'error' && !/404/.test(m.text())) problemas.push('consola: ' + m.text().slice(0, 150)); });
p.on('requestfailed', (r) => problemas.push('red: ' + r.url().slice(0, 100)));
const apiMs = [];
p.on('response', async (r) => { if (r.url().includes('/api/')) { const t = r.request().timing(); apiMs.push(Math.round(t.responseEnd)); if (r.status() >= 500) problemas.push('API ' + r.status() + ' ' + r.url()); } });

const usuario = 'qa.alumno' + Date.now().toString(36);
const norm = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

// ---------- ingreso ----------
let t0 = Date.now();
await p.goto(BASE); await p.waitForSelector('text=Ingresa a tu aula');
tiempos.push(['carga inicial', Date.now() - t0]);
await p.fill('input[placeholder="por ejemplo: ana.perez"]', usuario);
await p.click('button:has-text("Continuar")'); await p.waitForSelector('text=Crea tu usuario');
await p.fill('input[placeholder="Ana Pérez"]', 'Alumno Recorrido');
t0 = Date.now(); await p.click('button:has-text("Crear mi usuario")'); await p.waitForSelector('text=Tus clases');
tiempos.push(['crear usuario y entrar', Date.now() - t0]);
await p.click('a:has-text("Empezar la Clase 1")'); await p.waitForSelector('h1');

// ---------- ayudas ----------
const seccion = p.locator('section');
const resultado = async () => { await p.waitForSelector('text=/Perfecto|Bien!|Reto superado|Gracias por compartir|Laboratorio completado/', { timeout: 6000 }); };

async function resolverActividad(paso) {
  const a = paso.act;
  if (a.k === 'cloze') {
    const huecos = a.items.flatMap((it) => [...it.matchAll(/\{\{(.+?)\}\}/g)].map((m) => m[1].split('|')));
    const sels = seccion.locator('select');
    const n = await sels.count();
    if (n) for (let i = 0; i < n; i++) { const opts = await sels.nth(i).locator('option').allTextContents(); const ok = huecos[i].find((x) => opts.some((o) => norm(o) === norm(x))); await sels.nth(i).selectOption({ label: opts.find((o) => norm(o) === norm(ok)) }); }
    else { const ins = seccion.locator('input'); for (let i = 0; i < huecos.length; i++) await ins.nth(i).fill(huecos[i][0]); }
  } else if (a.k === 'une') {
    const L = seccion.locator('ul').nth(0).locator('> li > button'), R = seccion.locator('ul').nth(1).locator('> li > button');
    for (let i = 0; i < a.izq.length; i++) { await L.nth(i).click(); await R.nth(a.correcta[i]).click(); }
  } else if (a.k === 'clasifica') {
    const lis = seccion.locator('ul > li');
    for (let i = 0; i < a.items.length; i++) await lis.nth(i).locator('button').nth(a.items[i].r).click();
  } else if (a.k === 'vf') {
    const lis = seccion.locator('ul > li');
    for (let i = 0; i < a.items.length; i++) await lis.nth(i).locator('button', { hasText: a.items[i].r ? 'Verdadero' : 'Falso' }).click();
  } else if (a.k === 'ordena') {
    for (let destino = 0; destino < a.items.length; destino++) {
      const textos = await seccion.locator('ol > li').allInnerTexts();
      let pos = textos.findIndex((t) => t.replace(/\s+/g, ' ').includes(a.items[destino].replace(/\*\*/g, '').slice(0, 25)));
      while (pos > destino) { await seccion.locator('ol > li').nth(pos).locator('button').nth(0).click(); pos--; }
    }
  } else if (a.k === 'rotula') {
    const sels = seccion.locator('select');
    for (let i = 0; i < a.nombres.length; i++) await sels.nth(i).selectOption({ label: a.nombres[i] });
  } else if (a.k === 'predice') {
    const ins = seccion.locator('input[placeholder="Escribe tu respuesta…"]');
    for (let i = 0; i < a.items.length; i++) await ins.nth(i).fill(a.items[i].r[0]);
  } else if (a.k === 'reflexion') {
    await seccion.locator('textarea').fill('Aprendí a usar fórmulas y a dar formato a una tabla; me va a servir para llevar mis gastos.');
  }
  await p.click(a.k === 'reflexion' ? 'button:has-text("Guardar mi reflexión")' : 'button:has-text("Comprobar")');
  await resultado();
  const txt = await seccion.innerText();
  if (a.k !== 'reflexion' && !/Perfecto/.test(txt)) problemas.push(`${paso.id}: no dio 100% (${(txt.match(/(\d+)%/g) || []).slice(-1)})`);
}

// ---------- retos: se escribe con teclado y se arrastra el controlador, como lo haría un alumno ----------
const planDe = (paso) => paso.reto.planilla;
async function grilla(paso) {
  const g = p.locator('.xl-grid'); await g.scrollIntoViewIfNeeded(); await p.waitForTimeout(300);
  const bb = await g.boundingBox(); const an = planDe(paso).anchos || []; const ancho = (i) => an[i] ?? 90;
  const colIdx = (l) => l.charCodeAt(0) - 65;
  const xy = (ref) => { const c = colIdx(ref[0]), r = Number(ref.slice(1)) - 1; return [bb.x + 40 + Array.from({ length: c }, (_, i) => ancho(i)).reduce((a, x) => a + x, 0) + 8, bb.y + 22 + r * 24 + 12]; };
  return { xy, bb };
}
async function escribir(paso, entradas) {
  const { xy } = await grilla(paso);
  for (const [ref, txt] of entradas) { const [x, y] = xy(ref); await p.mouse.click(x, y); await p.keyboard.type(txt); await p.keyboard.press('Enter'); }
}
async function rellenar(paso, desde, hasta, filaFin) {
  const { xy } = await grilla(paso);
  const [x1, y1] = xy(desde), [x2, y2] = xy(hasta);
  await p.mouse.move(x1, y1); await p.mouse.down(); await p.mouse.move(x2, y2, { steps: 4 }); await p.mouse.up();
  const asa = await p.locator('.xl-asa').boundingBox();
  const { xy: xy2 } = await grilla(paso); const [, yf] = xy2(`A${filaFin}`);
  await p.mouse.move(asa.x + 4, asa.y + 4); await p.mouse.down(); await p.mouse.move(asa.x + 4, yf, { steps: 8 }); await p.mouse.up();
}
const RETOS = {
  'c2-reto-1': async (s) => { await escribir(s, [['D4', '=B4*C4']]); await rellenar(s, 'D4', 'D4', 7); },
  'c2-reto-2': async (s) => { await escribir(s, [['E4', '=SUMA(B4:D4)'], ['F4', '=PROMEDIO(B4:D4)']]); await rellenar(s, 'E4', 'F4', 11); await escribir(s, [['F13', '=PROMEDIO(F4:F11)'], ['F14', '=MAX(F4:F11)'], ['F15', '=MIN(F4:F11)'], ['F16', '=CONTARA(A4:A11)']]); },
  'c2-reto-3': async (s) => escribir(s, [['D9', '=SUMA(D4:D7)'], ['D10', '=D9*$B$1'], ['D11', '=D9+D10']]),
  'c2-reto-4': async (s) => escribir(s, [['B8', '=SUMA(B2:B6)'], ['B9', '=SUMA(B2:B6)'], ['B10', '=PROMEDIO(B2:B6)'], ['B12', '5']]),
  'c2-reto-5': async (s) => { await escribir(s, [['D4', '=B4*C4']]); await rellenar(s, 'D4', 'D4', 8); await escribir(s, [['D12', '=SUMA(D4:D8)'], ['D13', '=D12*$B$10'], ['D14', '=D12+D13']]); },
  'c3-reto-1': async (s) => { await escribir(s, [['C2', '=SI(B2>=60;"Aprobado";"Reprobado")']]); await rellenar(s, 'C2', 'C2', 9); },
  'c3-reto-2': async (s) => escribir(s, [['F2', '=CONTAR.SI(C2:C9;"Aprobado")'], ['F3', '=CONTAR.SI(C2:C9;"Reprobado")']]),
  'c3-reto-3': async (s) => { await escribir(s, [['G2', '=D2*F2']]); await rellenar(s, 'G2', 'G2', 17); await escribir(s, [['H2', '=SI(G2>=1000000;G2*5%;G2*2%)']]); await rellenar(s, 'H2', 'H2', 17); },
  'c3-reto-4': async (s) => { await escribir(s, [['K2', '=CONTAR.SI($B$2:$B$17;J2)'], ['L2', '=SUMAR.SI($B$2:$B$17;J2;$G$2:$G$17)']]); await rellenar(s, 'K2', 'L2', 4); },
  'c3-reto-5': async (s) => { await escribir(s, [['C2', '=BUSCARV(A2;$F$2:$H$7;3;FALSO)']]); await rellenar(s, 'C2', 'C2', 6); await escribir(s, [['D2', '=B2*C2']]); await rellenar(s, 'D2', 'D2', 6); },
  'c1-reto-1': async (s) => {
    const { xy, bb } = await grilla(s);
    const clic = async (ref) => { const [x, y] = xy(ref); await p.mouse.click(x, y); };
    await clic('A1'); await p.keyboard.type('Mis gastos del mes'); await p.keyboard.press('Enter');
    await clic('A3'); for (const t of ['Concepto', 'Categoría', 'Monto (Gs.)']) { await p.keyboard.type(t); await p.keyboard.press('Tab'); }
    const datos = [['Alquiler', 'Vivienda', '1500000'], ['Luz (ANDE)', 'Servicios', '180000'], ['Agua', 'Servicios', '60000'], ['Internet', 'Servicios', '150000']];
    for (let i = 0; i < 4; i++) { await clic(`A${4 + i}`); for (const t of datos[i]) { await p.keyboard.type(t); await p.keyboard.press('Tab'); } }
    const arr = async (a, z) => { const [x1, y1] = xy(a), [x2, y2] = xy(z); await p.mouse.move(x1, y1); await p.mouse.down(); await p.mouse.move(x2, y2, { steps: 6 }); await p.mouse.up(); };
    await arr('A3', 'C3'); await p.click('button[title="Negrita"]'); await p.click('button[title="Color de relleno"]'); await p.click('button[title="#ffd966"]');
    await arr('C4', 'C7'); await p.click('button[title="Estilo millares"]');
    await arr('A3', 'C7'); await p.click('button[title^="Bordes"]');
    void bb;
  },
};

async function resolverLab() {
  await p.click('button:has-text("Ordenar")'); await p.click('button:has-text("Aceptar")');
  await p.click('button:has-text("Filtro")'); await p.locator('label:has-text("Luis") input').uncheck(); await p.locator('label:has-text("María") input').uncheck(); await p.click('button:has-text("Aceptar")');
  await p.click('button:has-text("Formato condicional")'); await p.click('button:has-text("Aceptar")');
  await p.click('button:has-text("Gráfico de columnas")');
  await p.waitForSelector('text=Laboratorio completado');
}

// ---------- recorrido lineal con «Siguiente» ----------
let n = 0;
for (const c of CLASES) for (const paso of c.pasos) {
  n++;
  await p.waitForSelector(`h1:has-text("${paso.titulo.slice(0, 30)}")`, { timeout: 8000 });
  const t = Date.now();
  try {
    if (paso.tipo === 'lectura') { await p.click('button:has-text("Entendido")'); await p.waitForSelector('text=Lectura completada'); }
    else if (paso.tipo === 'actividad') await resolverActividad(paso);
    else if (paso.tipo === 'lab') await resolverLab();
    else if (paso.tipo === 'reto') {
      await RETOS[paso.id](paso);
      await p.click('button:has-text("Comprobar")');
      const ok = await p.waitForSelector('text=Reto superado', { timeout: 5000 }).then(() => true).catch(() => false);
      if (!ok) { problemas.push(`${paso.id}: reto no superado`); await p.screenshot({ path: `shots/falla_${paso.id}.png`, fullPage: true }); }
    }
  } catch (e) { problemas.push(`${paso.id}: ${e.message.split('\n')[0].slice(0, 120)}`); await p.screenshot({ path: `shots/falla_${paso.id}.png`, fullPage: true }).catch(() => {}); }
  const dur = Date.now() - t; tiempos.push([paso.id, dur]); if (dur > 3500) lentas.push(`${paso.id} ${dur}ms`);
  // siguiente paso: botón «Siguiente» / «Ir a la Clase 2…» / «Terminar»
  const sig = p.locator('button:has-text("Siguiente"), button:has-text("Ir a la Clase"), button:has-text("Terminar")').last();
  await sig.evaluate((el) => el.scrollIntoView({ block: 'center' })); await sig.click();
}
await p.waitForSelector('text=Tus clases');
await p.waitForTimeout(500);

// ---------- resultado final ----------
const txt = await p.locator('main').innerText();
const completados = (txt.match(/COMPLETADOS\s*(\d+)\/(\d+)/i) || []).slice(1).join('/');
const insignias = (txt.match(/Tus insignias\s*\((\d+)\/(\d+)\)/) || []).slice(1).join('/');
await p.screenshot({ path: 'shots/final_inicio.png', fullPage: true });
const xp = (await p.locator('header').innerText()).replace(/\s+/g, ' ').slice(0, 80);
const lento = tiempos.slice().sort((a, b) => b[1] - a[1]).slice(0, 4).map(([k, v]) => `${k}:${v}ms`);
apiMs.sort((a, b) => a - b);
console.log(JSON.stringify({ usuario, pasosRecorridos: n, completados, insignias, header: xp, apiMediana: apiMs[Math.floor(apiMs.length / 2)], apiMax: apiMs[apiMs.length - 1], masLentos: lento, lentas, problemas }, null, 1));
fs.writeFileSync('usuario_recorrido.txt', usuario);
await b.close();
