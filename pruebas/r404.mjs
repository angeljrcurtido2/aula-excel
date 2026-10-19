import { createRequire } from 'node:module';
const require = createRequire('C:/SIS_VENTAS_NEXT/migracion_cliente/package.json');
const { chromium } = require('playwright');
const b = await chromium.launch(); const p = await (await b.newContext()).newPage();
p.on('response', (r) => { if (r.status() >= 400) console.log(r.status(), r.url()); });
p.on('console', (m) => { if (m.type() === 'error') console.log('CONSOLE', m.text().slice(0, 200)); });
await p.goto('http://127.0.0.1:3010/'); await p.waitForTimeout(800);
await p.goto('http://127.0.0.1:3010/clase/1/c1-lec-1'); await p.waitForTimeout(800);
await b.close();
