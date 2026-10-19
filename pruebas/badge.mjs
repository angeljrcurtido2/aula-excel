import { createRequire } from 'node:module';
const require = createRequire('C:/SIS_VENTAS_NEXT/migracion_cliente/package.json');
const { chromium } = require('playwright');
const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 1360, height: 900 } })).newPage();
await p.goto('https://aula-excel.netlify.app/'); await p.waitForTimeout(2500);
const info = await p.evaluate(() => { const f = document.getElementById('nl-badge-frame'); if (!f) return 'sin iframe'; const r = f.getBoundingClientRect(); const cs = getComputedStyle(f); return { rect: [r.x, r.y, r.width, r.height], pos: cs.position, pe: cs.pointerEvents, z: cs.zIndex, src: (f.getAttribute('srcdoc') || '').slice(0, 1800) }; });
console.log(JSON.stringify(info, null, 1));
await p.screenshot({ path: 'shots/badge.png' });
await b.close();
