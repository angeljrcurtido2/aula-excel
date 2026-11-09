// Genera web/public/capturas/c5_*, c6_*, c7_* (png + json de marcas) desde pantallas.html con Playwright.
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const require = createRequire(process.env.PW_DIR + '/package.json');
const { chromium } = require('playwright-core');
const aqui = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(aqui, '..', 'web', 'public', 'capturas');
const b = await chromium.launch(process.env.NAVEGADOR ? { executablePath: process.env.NAVEGADOR } : {});
const p = await b.newPage({ viewport: { width: 1000, height: 900 }, deviceScaleFactor: 2 });
await p.goto(pathToFileURL(path.join(aqui, 'pantallas.html')).href);
for (const id of await p.$$eval('.fig', (l) => l.map((e) => e.id))) {
  const h = await p.$('#' + id);
  const box = await h.boundingBox();
  const marcas = await p.$$eval(`#${id} .m`, (l, f) => {
    const fr = document.getElementById(f).getBoundingClientRect();
    return l.map((e) => { const r = e.getBoundingClientRect(); return { n: Number(e.dataset.n), x: Math.round(r.right - fr.left - 8), y: Math.round(r.top - fr.top + 4) }; }).sort((a, c) => a.n - c.n);
  }, id);
  await h.screenshot({ path: path.join(out, id + '.png') });
  fs.writeFileSync(path.join(out, id + '.json'), JSON.stringify({ w: Math.round(box.width), h: Math.round(box.height), marcas }));
  console.log(id, Math.round(box.width), Math.round(box.height), marcas.length);
}
await b.close();
