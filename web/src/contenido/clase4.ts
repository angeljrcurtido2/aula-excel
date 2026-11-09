import type { CeldaDef, ClaseDef, Paso, PlanillaDef } from './tipos';
import { chk, columnaFormula, esFormula, esNum, usa } from './ayudas';
import { norm } from './ayudas';

// Clase 4: prácticas inspiradas en las del Profe Beto (https://profebeto.com/practicas-excel/).
// Los datos son propios (en el sitio original las tablas son imágenes); los enunciados siguen cada práctica.
const ENC: CeldaDef = { b: true, fill: '#1F4E78', color: '#ffffff', al: 'c', borde: true, fijo: true };
const dato = (v: string | number, extra: CeldaDef = {}): CeldaDef => ({ v, borde: true, fijo: true, ...extra });
const vacia = (extra: CeldaDef = {}): CeldaDef => ({ borde: true, ...extra });
const L = 'ABCDEFGHIJKL';
const pct = (v: number): CeldaDef => dato(v, { fmt: 'pct', fill: '#fff2cc', b: true });

function encabezados(c: Record<string, CeldaDef>, textos: string[], fila = 1, col0 = 0) {
  textos.forEach((t, i) => (c[`${L[col0 + i]}${fila}`] = { ...ENC, v: t }));
}
const hoja = (titulo: string, nombre: string, cols: number, filas: number, anchos: number[], celdas: Record<string, CeldaDef>): PlanillaDef =>
  ({ titulo, hoja: nombre, cols, filas, anchos, celdas, cinta: true });
const txt = (c: any, ref: string) => String(c.valor(ref));

// ---------- Práctica 2: IVA ----------
const iva = { tasa: 0.1, prods: [['Cuaderno', 12000], ['Lapicera', 3500], ['Mochila', 150000], ['Calculadora', 45000], ['Regla', 2500], ['Carpeta', 18000]] as [string, number][] };
function pIva(): Record<string, CeldaDef> {
  const c: Record<string, CeldaDef> = {};
  encabezados(c, ['Producto', 'Precio', 'IVA', 'Total']);
  iva.prods.forEach(([n, p], i) => { const r = i + 2; c[`A${r}`] = dato(n); c[`B${r}`] = dato(p, { fmt: 'miles' }); c[`C${r}`] = vacia({ fmt: 'miles' }); c[`D${r}`] = vacia({ fmt: 'miles' }); });
  c.F1 = { ...ENC, v: 'Tasa de IVA' }; c.F2 = pct(iva.tasa);
  return c;
}

// ---------- Práctica 3: sumar y restar porcentajes ----------
const porc = [[823, 0.41], [1500, 0.25], [640, 0.1], [2300, 0.5], [95, 0.07]];
function pPorc(): Record<string, CeldaDef> {
  const c: Record<string, CeldaDef> = {};
  encabezados(c, ['Valor', 'Porcentaje', 'Valor + %', 'Valor − %']);
  porc.forEach(([v, p], i) => { const r = i + 2; c[`A${r}`] = dato(v); c[`B${r}`] = dato(p, { fmt: 'pct' }); c[`C${r}`] = vacia({ fmt: 'dec2' }); c[`D${r}`] = vacia({ fmt: 'dec2' }); });
  return c;
}

// ---------- Práctica 6: referencias mixtas ----------
const mix = { tasas: [0.05, 0.06, 0.07], vend: [['Ana', 4000000], ['Luis', 2500000], ['María', 3200000], ['Pedro', 1800000]] as [string, number][] };
function pMix(): Record<string, CeldaDef> {
  const c: Record<string, CeldaDef> = {};
  c.B3 = { ...ENC, v: '% comisión' }; mix.tasas.forEach((t, i) => (c[`${L[2 + i]}3`] = pct(t)));
  encabezados(c, ['Vendedor', 'Ventas', 'Enero', 'Febrero', 'Marzo'], 5);
  mix.vend.forEach(([n, v], i) => { const r = i + 6; c[`A${r}`] = dato(n); c[`B${r}`] = dato(v, { fmt: 'miles' }); for (let k = 2; k < 5; k++) c[`${L[k]}${r}`] = vacia({ fmt: 'miles' }); });
  return c;
}

// ---------- Práctica 8: incremento de precio ----------
const inc = { tasa: 0.1, prods: [['Arroz', 20, 6000], ['Aceite', 12, 14000], ['Fideos', 40, 3500], ['Azúcar', 25, 5000], ['Yerba', 15, 17000]] as [string, number, number][] };
function pInc(): Record<string, CeldaDef> {
  const c: Record<string, CeldaDef> = {};
  encabezados(c, ['Producto', 'Cantidad', 'Precio compra', 'Incremento', 'Precio venta', 'Total ventas', 'Total compras', 'Total pesos']);
  inc.prods.forEach(([n, q, p], i) => { const r = i + 2; c[`A${r}`] = dato(n); c[`B${r}`] = dato(q); c[`C${r}`] = dato(p, { fmt: 'miles' }); for (let k = 3; k < 8; k++) c[`${L[k]}${r}`] = vacia({ fmt: 'miles' }); });
  c.A7 = { v: 'TOTALES', b: true, fijo: true, borde: true };
  c.F7 = vacia({ fmt: 'miles', b: true, fill: '#d9d9d9' }); c.G7 = vacia({ fmt: 'miles', b: true, fill: '#d9d9d9' }); c.H7 = vacia({ fmt: 'miles', b: true, fill: '#d9d9d9' });
  c.J1 = { ...ENC, v: 'Incremento' }; c.J2 = pct(inc.tasa);
  return c;
}
const incCalc = inc.prods.map(([, q, p]) => { const pv = p + p * inc.tasa; return { inc: p * inc.tasa, pv, tv: pv * q, tc: p * q, tp: pv * q - p * q }; });
const suma = (a: number[]) => a.reduce((t, x) => t + x, 0);

// ---------- Práctica 10: comisiones ----------
const com = { pc: 0.15, pa: 0.03, v: [['Rosa', 1500000, 8000000], ['Tomás', 1500000, 5200000], ['Inés', 1800000, 9500000], ['Marcos', 1200000, 3100000], ['Lía', 1800000, 6400000]] as [string, number, number][] };
function pCom(): Record<string, CeldaDef> {
  const c: Record<string, CeldaDef> = {};
  encabezados(c, ['Vendedor', 'Fijo', 'Ventas', 'Comisión', 'Anticipo', 'Ganancia']);
  com.v.forEach(([n, f, v], i) => { const r = i + 2; c[`A${r}`] = dato(n); c[`B${r}`] = dato(f, { fmt: 'miles' }); c[`C${r}`] = dato(v, { fmt: 'miles' }); for (let k = 3; k < 6; k++) c[`${L[k]}${r}`] = vacia({ fmt: 'miles' }); });
  c.E7 = { v: 'Total', b: true, fijo: true, borde: true }; c.F7 = vacia({ fmt: 'miles', b: true, fill: '#d9ead3' });
  c.E8 = { v: 'Promedio', b: true, fijo: true, borde: true }; c.F8 = vacia({ fmt: 'miles', b: true, fill: '#d9ead3' });
  c.H1 = { ...ENC, v: '% Comisión' }; c.H2 = pct(com.pc); c.I1 = { ...ENC, v: '% Anticipo' }; c.I2 = pct(com.pa);
  return c;
}
const comCalc = com.v.map(([, f, v]) => { const co = v * com.pc, an = f * com.pa; return { co, an, ga: f + co - an }; });

// ---------- Práctica 11: SUMAR.SI y CONCATENAR ----------
const emp: [number, string, string, number][] = [[101, 'Julia', 'Sosa', 2400000], [102, 'Mario', 'Báez', 1800000], [101, 'Carmen', 'Rojas', 2100000], [103, 'Luis', 'Vera', 1500000], [102, 'Elsa', 'Páez', 2900000], [101, 'Raúl', 'Díaz', 1900000]];
function pEmp(): Record<string, CeldaDef> {
  const c: Record<string, CeldaDef> = {};
  encabezados(c, ['Código', 'Nombre', 'Apellido', 'Salario', 'Nombre completo']);
  emp.forEach(([k, n, a, s], i) => { const r = i + 2; c[`A${r}`] = dato(k, { color: '#c00000' }); c[`B${r}`] = dato(n); c[`C${r}`] = dato(a); c[`D${r}`] = dato(s, { fmt: 'miles' }); c[`E${r}`] = vacia(); });
  c.G1 = { ...ENC, v: 'Resultado' };
  ['Salarios mayores a 2.000.000', 'Salarios menores a 2.000.000', 'Total del código 101'].forEach((t, i) => { c[`F${i + 2}`] = { v: t, fijo: true, b: true }; c[`G${i + 2}`] = vacia({ fmt: 'miles' }); });
  return c;
}

// ---------- Práctica 12: EXTRAE y ENCONTRAR ----------
const mat: [string, string][] = [['MAD-4821-37', 'ana@gmail.com'], ['LIM-1250-08', 'beto@outlook.es'], ['QUI-9033-71', 'carla@empresa.com.py'], ['BOG-0765-22', 'dario@hotmail.com']];
function pMat(): Record<string, CeldaDef> {
  const c: Record<string, CeldaDef> = {};
  encabezados(c, ['Matrícula', 'Correo', 'Letras', 'Número 1', 'Número 2', 'Posición de @', 'Dominio']);
  mat.forEach(([m, e], i) => { const r = i + 2; c[`A${r}`] = dato(m); c[`B${r}`] = dato(e); for (let k = 2; k < 7; k++) c[`${L[k]}${r}`] = vacia(); });
  return c;
}

// ---------- Práctica 16: edad ----------
const HOY = { y: 2026, m: 11, d: 9 };
const pers: [string, number, number, number, number][] = [['Ana', 12, 5, 1990, 2012], ['Beto', 3, 11, 2000, 2019], ['Carla', 28, 2, 1985, 2005], ['Dario', 9, 11, 1998, 2020]];
function edadDe(d: number, m: number, y: number) {
  let meses = (HOY.y - y) * 12 + HOY.m - m; if (HOY.d < d) meses--;
  const dias = HOY.d >= d ? HOY.d - d : Math.round((Date.UTC(HOY.y, HOY.m - 1, HOY.d) - Date.UTC(HOY.y, HOY.m - 2, d)) / 86400000);
  return { a: Math.floor(meses / 12), m: meses % 12, d: dias };
}
function pEdad(): Record<string, CeldaDef> {
  const c: Record<string, CeldaDef> = {};
  encabezados(c, ['Nombre', 'Día', 'Mes', 'Año nac.', 'Año ingreso', 'Edad', 'Edad exacta', 'Antigüedad']);
  pers.forEach(([n, d, m, y, ing], i) => { const r = i + 2; c[`A${r}`] = dato(n); c[`B${r}`] = dato(d); c[`C${r}`] = dato(m); c[`D${r}`] = dato(y); c[`E${r}`] = dato(ing); c[`F${r}`] = vacia({ fill: '#e2efda' }); c[`G${r}`] = vacia({ fill: '#e2efda' }); c[`H${r}`] = vacia({ fill: '#fce4d6' }); });
  return c;
}

// ---------- Práctica 18: SUMAR.SI ----------
const vts: [string, number, number][] = [['Mouse', 5, 0], ['Camiseta', 3, 1], ['Mouse', 4, 0], ['Remera', 2, 2], ['Camiseta', 6, 0], ['Mouse', 1, 1], ['Remera', 7, 0]];
function pVts(): Record<string, CeldaDef> {
  const c: Record<string, CeldaDef> = {};
  encabezados(c, ['Producto', 'Vendidos', 'Mermas']);
  vts.forEach(([p, v, m], i) => { const r = i + 2; c[`A${r}`] = dato(p, { fill: '#ddebf7' }); c[`B${r}`] = dato(v, { fill: '#e2efda' }); c[`C${r}`] = dato(m, { fill: '#fce4d6' }); });
  c.E1 = { ...ENC, v: 'Resultado' };
  ['Mouse vendidos', 'Camiseta vendidas', 'Total de mermas', 'Mermas de Mouse'].forEach((t, i) => { c[`E${i + 2}`] = { v: t, fijo: true, b: true }; c[`F${i + 2}`] = vacia(); });
  return c;
}

// ---------- Práctica 20: BUSCARV ----------
const dest: [number, string, number][] = [[1, 'Asunción', 450000], [2, 'Encarnación', 620000], [3, 'Ciudad del Este', 580000], [4, 'Concepción', 700000]];
const trans: [number, string, number][] = [[1, 'Bus', 150000], [2, 'Minivan', 300000], [3, 'Avión', 900000]];
const guia: [number, string, number][] = [[1, 'Sin guía', 0], [2, 'Guía local', 120000], [3, 'Guía bilingüe', 250000]];
function pViaje(): Record<string, CeldaDef> {
  const c: Record<string, CeldaDef> = {};
  encabezados(c, ['Código', 'Destino', 'Precio'], 1, 0); encabezados(c, ['Código', 'Transporte', 'Precio'], 1, 4); encabezados(c, ['Código', 'Guía', 'Precio'], 1, 8);
  dest.forEach(([k, n, p], i) => { const r = i + 2; c[`A${r}`] = dato(k); c[`B${r}`] = dato(n); c[`C${r}`] = dato(p, { fmt: 'miles' }); });
  trans.forEach(([k, n, p], i) => { const r = i + 2; c[`E${r}`] = dato(k); c[`F${r}`] = dato(n); c[`G${r}`] = dato(p, { fmt: 'miles' }); });
  guia.forEach(([k, n, p], i) => { const r = i + 2; c[`I${r}`] = dato(k); c[`J${r}`] = dato(n); c[`K${r}`] = dato(p, { fmt: 'miles' }); });
  // cotización
  c.A8 = { ...ENC, v: 'COTIZACIÓN' }; c.B8 = { ...ENC, v: 'Código' }; c.C8 = { ...ENC, v: 'Precio' };
  c.A9 = { v: 'Destino', fijo: true, b: true, borde: true }; c.B9 = dato(2, { fill: '#fff2cc' }); c.C9 = vacia({ fmt: 'miles' });
  c.A10 = { v: 'Transporte', fijo: true, b: true, borde: true }; c.B10 = dato(3, { fill: '#fff2cc' }); c.C10 = vacia({ fmt: 'miles' });
  c.A11 = { v: 'Guía', fijo: true, b: true, borde: true }; c.B11 = dato(2, { fill: '#fff2cc' }); c.C11 = vacia({ fmt: 'miles' });
  c.A12 = { v: 'Subtotal', fijo: true, b: true, borde: true }; c.B12 = { borde: true, fijo: true }; c.C12 = vacia({ fmt: 'miles', b: true });
  c.A13 = { v: 'Total con 5 % de descuento', fijo: true, b: true, borde: true }; c.B13 = { borde: true, fijo: true }; c.C13 = vacia({ fmt: 'miles', b: true, fill: '#d9ead3' });
  return c;
}
const viaje = (d: number, t: number, g: number) => { const sub = dest[d - 1][2] + trans[t - 1][2] + guia[g - 1][2]; return { sub, tot: sub * 0.95 }; };

const retoPaso = (n: number, titulo: string, md: string, planilla: PlanillaDef, checks: any[], pistas?: string[]): Paso => ({ id: `c4-reto-${n}`, tipo: 'reto', titulo, reto: { md, planilla, checks, pistas } });

export const clase4: ClaseDef = {
  n: 4,
  titulo: 'Prácticas del Profe Beto',
  resumen: 'Nueve prácticas para aplicar lo aprendido: IVA, porcentajes, referencias, facturas, comisiones, SUMAR.SI, texto, fechas y BUSCARV.',
  objetivos: ['Usar referencias relativas, absolutas y mixtas', 'Calcular IVA, porcentajes, incrementos y comisiones', 'Usar funciones de texto, fecha, SUMAR.SI y BUSCARV'],
  color: '#0f766e',
  pasos: [
    {
      id: 'c4-lec-1', tipo: 'lectura', titulo: 'Cómo son estas prácticas',
      bloques: [
        { md: 'Esta clase reúne ejercicios del estilo de las **prácticas de Excel del Profe Beto** ([profebeto.com/practicas-excel](https://profebeto.com/practicas-excel/)). Cada reto tiene una tabla ya cargada y tú completas las fórmulas.\n\nRecuerda tres reglas de oro:\n\n- Si un dato puede cambiar (una tasa de IVA, un porcentaje), **ponlo en una celda** y fíjalo con **$** (ejemplo [[=B2*$F$2]]). Así, al cambiar la celda, **todo se recalcula solo**.\n- **Relativa** [[B2]] se mueve al copiar; **absoluta** [[$F$2]] no se mueve; **mixta** [[$B6]] o [[C$3]] fija solo la columna o solo la fila.\n- Para sumar o restar un porcentaje: [[=A2*(1+B2)]] suma y [[=A2*(1-B2)]] resta.' },
        { recordar: 'En el sitio original las tablas se copian a mano. Aquí ya vienen cargadas: te dedicas a las fórmulas.' },
      ],
    },
    retoPaso(1, 'Práctica 2: calcular el IVA',
      'Calcula el IVA de cada producto con la **tasa de la celda F2**.\n\n1. **IVA (C):** precio × tasa. En **C2**: [[=B2*$F$2]] y arrastra hasta C7.\n2. **Total (D):** precio + IVA. En **D2**: [[=B2+C2]] y arrastra hasta D7.\n\nLuego cambia F2 a 5 % y comprueba que todo se actualiza.',
      hoja('Practica2_IVA', 'calcular_IVA', 6, 7, [110, 90, 90, 100, 30, 100], pIva()),
      [
        columnaFormula('iva', 'IVA de los 6 productos (C2:C7)', 'C', 2, iva.prods.map(([, p]) => p * iva.tasa), 'C2: =B2*$F$2 y arrastra hasta C7.', /\$F\$2/),
        columnaFormula('tot', 'Total de los 6 productos (D2:D7)', 'D', 2, iva.prods.map(([, p]) => p * (1 + iva.tasa)), 'D2: =B2+C2 y arrastra hasta D7.'),
        chk('vivo', 'Si F2 cambia a 5 %, los totales se actualizan', (c) => { const x = c.con({ F2: '5%' }); return iva.prods.every(([, p], i) => esNum(x, `D${i + 2}`, p * 1.05)); }, 'Fija la tasa con $F$2.'),
      ]),
    retoPaso(2, 'Práctica 3: sumar y restar porcentajes',
      'Cada fila tiene un valor y un porcentaje.\n\n1. **Valor + %:** en **C2** [[=A2+(A2*B2)]] y arrastra hasta C6.\n2. **Valor − %:** en **D2** [[=A2-(A2*B2)]] y arrastra hasta D6.\n\n> Alternativa más corta: [[=A2*(1+B2)]] y [[=A2*(1-B2)]]. Dan el mismo resultado.',
      hoja('Practica3_porcentajes', 'Suma_Porcentaje', 4, 6, [90, 100, 110, 110], pPorc()),
      [
        columnaFormula('mas', 'Valor + porcentaje (C2:C6)', 'C', 2, porc.map(([v, p]) => v * (1 + p)), 'C2: =A2+(A2*B2)', /A\d+/),
        columnaFormula('menos', 'Valor − porcentaje (D2:D6)', 'D', 2, porc.map(([v, p]) => v * (1 - p)), 'D2: =A2-(A2*B2)', /A\d+/),
      ]),
    retoPaso(3, 'Práctica 6: referencias mixtas',
      'Calcula la comisión de cada vendedor en cada mes **con una sola fórmula** que se arrastra a todo el cuadro.\n\nEn **C6** escribe [[=$B6*C$3]] y arrástrala hasta **E9**.\n\n- **$B** fija la columna de las ventas.\n- **C$3** fija la fila de los porcentajes.',
      hoja('Practica6_mixtas', 'Ref. mixtas', 5, 9, [100, 110, 90, 90, 90], pMix()),
      [
        chk('mixta', 'Comisiones del cuadro C6:E9 con referencias mixtas', (c) => mix.vend.every(([, v], i) => mix.tasas.every((t, k) => { const r = `${L[2 + k]}${i + 6}`; return esFormula(c, r) && esNum(c, r, v * t) && usa(c, r, /\$B\d+/) && usa(c, r, /[A-E]\$3/); })), 'Una fórmula: =$B6*C$3. Arrástrala hacia abajo y hacia la derecha.'),
      ]),
    retoPaso(4, 'Práctica 8: incremento de precio',
      'La tienda vende con un **incremento del 10 %** (celda J2) sobre el precio de compra.\n\n1. **Incremento (D):** [[=C2*$J$2]]\n2. **Precio venta (E):** [[=C2+D2]]\n3. **Total ventas (F):** [[=E2*B2]]\n4. **Total compras (G):** [[=C2*B2]]\n5. **Total pesos (H):** ventas − compras.\n6. Fila 7: totales de F, G y H con [[=SUMA(F2:F6)]].',
      hoja('Practica8_incremento', 'Incremento', 10, 7, [100, 80, 110, 100, 100, 110, 110, 110, 30, 90], pInc()),
      [
        columnaFormula('inc', 'Incremento (D2:D6) con la tasa de J2', 'D', 2, incCalc.map((x) => x.inc), 'D2: =C2*$J$2', /\$J\$2/),
        columnaFormula('pv', 'Precio de venta (E2:E6)', 'E', 2, incCalc.map((x) => x.pv)),
        columnaFormula('tv', 'Total ventas (F2:F6)', 'F', 2, incCalc.map((x) => x.tv)),
        columnaFormula('tc', 'Total compras (G2:G6)', 'G', 2, incCalc.map((x) => x.tc)),
        columnaFormula('tp', 'Total pesos (H2:H6)', 'H', 2, incCalc.map((x) => x.tp)),
        chk('sumas', 'Totales en la fila 7 con SUMA (F7, G7 y H7)', (c) => esNum(c, 'F7', suma(incCalc.map((x) => x.tv))) && esNum(c, 'G7', suma(incCalc.map((x) => x.tc))) && esNum(c, 'H7', suma(incCalc.map((x) => x.tp))) && usa(c, 'F7', /SUMA/i) && usa(c, 'G7', /SUMA/i) && usa(c, 'H7', /SUMA/i), '=SUMA(F2:F6)'),
      ]),
    retoPaso(5, 'Práctica 10: comisiones y anticipos',
      'Las tasas están en **H2** (comisión 15 %) e **I2** (anticipo 3 %).\n\n1. **Comisión (D):** ventas × % comisión → [[=C2*$H$2]]\n2. **Anticipo (E):** 3 % del **fijo** → [[=B2*$I$2]]\n3. **Ganancia (F):** [[=B2+D2-E2]]\n4. **F7:** total con SUMA. **F8:** promedio con PROMEDIO.',
      hoja('Practica10_comisiones', 'Comisiones', 9, 8, [90, 100, 100, 100, 90, 110, 30, 90, 90], pCom()),
      [
        columnaFormula('co', 'Comisión (D2:D6)', 'D', 2, comCalc.map((x) => x.co), 'D2: =C2*$H$2', /\$H\$2/),
        columnaFormula('an', 'Anticipo (E2:E6)', 'E', 2, comCalc.map((x) => x.an), 'E2: =B2*$I$2', /\$I\$2/),
        columnaFormula('ga', 'Ganancia (F2:F6)', 'F', 2, comCalc.map((x) => x.ga), 'F2: =B2+D2-E2'),
        chk('tot', 'Total (F7) y promedio (F8)', (c) => esNum(c, 'F7', suma(comCalc.map((x) => x.ga))) && esNum(c, 'F8', suma(comCalc.map((x) => x.ga)) / comCalc.length) && usa(c, 'F7', /SUMA/i) && usa(c, 'F8', /PROMEDIO/i)),
      ]),
    retoPaso(6, 'Práctica 11: SUMAR.SI y CONCATENAR',
      '1. **Nombre completo (E):** une nombre y apellido con un espacio. En **E2**: [[=CONCATENAR(B2;" ";C2)]] y arrastra hasta E7.\n2. **G2:** suma de salarios **mayores a 2.000.000** → [[=SUMAR.SI(D2:D7;">2000000")]]\n3. **G3:** suma de salarios **menores a 2.000.000**.\n4. **G4:** suma de los salarios del **código 101** → [[=SUMAR.SI(A2:A7;101;D2:D7)]]',
      hoja('Practica11_sumarsi', 'SumarSi', 7, 7, [70, 90, 90, 110, 140, 200, 120], pEmp()),
      [
        chk('nom', 'Nombre completo (E2:E7) con CONCATENAR', (c) => emp.every(([, n, a], i) => esFormula(c, `E${i + 2}`) && norm(txt(c, `E${i + 2}`)) === norm(`${n} ${a}`) && usa(c, `E${i + 2}`, /CONCATENAR|CONCAT|&/i)), 'E2: =CONCATENAR(B2;" ";C2)'),
        chk('may', 'Salarios mayores a 2.000.000 (G2)', (c) => esFormula(c, 'G2') && esNum(c, 'G2', suma(emp.filter((e) => e[3] > 2000000).map((e) => e[3]))) && usa(c, 'G2', /SUMAR\.SI/i), '=SUMAR.SI(D2:D7;">2000000")'),
        chk('men', 'Salarios menores a 2.000.000 (G3)', (c) => esFormula(c, 'G3') && esNum(c, 'G3', suma(emp.filter((e) => e[3] < 2000000).map((e) => e[3]))) && usa(c, 'G3', /SUMAR\.SI/i), '=SUMAR.SI(D2:D7;"<2000000")'),
        chk('cod', 'Total del código 101 (G4)', (c) => esFormula(c, 'G4') && esNum(c, 'G4', suma(emp.filter((e) => e[0] === 101).map((e) => e[3]))) && usa(c, 'G4', /SUMAR\.SI/i), '=SUMAR.SI(A2:A7;101;D2:D7): dónde busco; qué busco; qué sumo.'),
      ]),
    retoPaso(7, 'Práctica 12: EXTRAE y ENCONTRAR',
      'Cada matrícula tiene la forma **LLL-NNNN-NN** y cada correo tiene una **@**.\n\n- **C (Letras):** las 3 primeras letras → [[=EXTRAE(A2;1;3)]]\n- **D (Número 1):** los 4 dígitos después del primer guión → [[=EXTRAE(A2;5;4)]]\n- **E (Número 2):** los 2 dígitos después del segundo guión.\n- **F (Posición de @):** [[=ENCONTRAR("@";B2)]]\n- **G (Dominio):** todo lo que sigue a la @ → [[=EXTRAE(B2;ENCONTRAR("@";B2)+1;100)]]\n\nArrastra cada fórmula hasta la fila 5.',
      hoja('Practica12_extrae', 'Extrae_Encontrar', 7, 5, [110, 170, 70, 80, 80, 110, 160], pMat()),
      [
        chk('let', 'Letras (C2:C5) con EXTRAE', (c) => mat.every(([m], i) => esFormula(c, `C${i + 2}`) && txt(c, `C${i + 2}`) === m.slice(0, 3) && usa(c, `C${i + 2}`, /EXTRAE|IZQUIERDA/i)), '=EXTRAE(A2;1;3)'),
        chk('n1', 'Número 1 (D2:D5) con EXTRAE', (c) => mat.every(([m], i) => esFormula(c, `D${i + 2}`) && txt(c, `D${i + 2}`) === m.slice(4, 8) && usa(c, `D${i + 2}`, /EXTRAE/i)), '=EXTRAE(A2;5;4)'),
        chk('n2', 'Número 2 (E2:E5) con EXTRAE', (c) => mat.every(([m], i) => esFormula(c, `E${i + 2}`) && txt(c, `E${i + 2}`) === m.slice(9, 11) && usa(c, `E${i + 2}`, /EXTRAE|DERECHA/i)), '=EXTRAE(A2;10;2)'),
        chk('pos', 'Posición de la @ (F2:F5) con ENCONTRAR', (c) => mat.every(([, e], i) => esFormula(c, `F${i + 2}`) && esNum(c, `F${i + 2}`, e.indexOf('@') + 1) && usa(c, `F${i + 2}`, /ENCONTRAR|HALLAR/i)), '=ENCONTRAR("@";B2)'),
        chk('dom', 'Dominio (G2:G5) con EXTRAE y ENCONTRAR', (c) => mat.every(([, e], i) => esFormula(c, `G${i + 2}`) && txt(c, `G${i + 2}`) === e.slice(e.indexOf('@') + 1) && usa(c, `G${i + 2}`, /EXTRAE/i) && usa(c, `G${i + 2}`, /ENCONTRAR|HALLAR/i)), '=EXTRAE(B2;ENCONTRAR("@";B2)+1;100)'),
      ]),
    retoPaso(8, 'Práctica 16: calcular la edad',
      'Toma como **fecha de hoy el 9/11/2026**, que se escribe [[FECHA(2026;11;9)]].\n\n1. **Edad (F):** años cumplidos con SIFECHA → [[=SIFECHA(FECHA(D2;C2;B2);FECHA(2026;11;9);"Y")]]\n2. **Edad exacta (G):** años, meses y días: [[=SIFECHA(…;"Y")&" años con "&SIFECHA(…;"YM")&" meses y "&SIFECHA(…;"MD")&" días"]]\n3. **Antigüedad (H):** años desde el año de ingreso hasta el año de hoy → [[=AÑO(FECHA(2026;11;9))-E2]]',
      hoja('Practica16_edad', 'Edad', 8, 5, [80, 50, 50, 80, 100, 60, 260, 100], pEdad()),
      [
        chk('edad', 'Edad en años (F2:F5) con SIFECHA', (c) => pers.every(([, d, m, y], i) => esFormula(c, `F${i + 2}`) && esNum(c, `F${i + 2}`, edadDe(d, m, y).a) && usa(c, `F${i + 2}`, /SIFECHA/i)), 'SIFECHA(inicio; fin; "Y")'),
        chk('exacta', 'Edad exacta (G2:G5): años, meses y días', (c) => pers.every(([, d, m, y], i) => { const e = edadDe(d, m, y); const t = norm(txt(c, `G${i + 2}`)); return esFormula(c, `G${i + 2}`) && t.includes(`${e.a} `) && t.includes(`${e.m} mes`) && t.includes(`${e.d} d`); }), 'Une tres SIFECHA con &: "Y", "YM" y "MD".'),
        columnaFormula('ant', 'Antigüedad en años (H2:H5)', 'H', 2, pers.map((p) => HOY.y - p[4]), '=AÑO(FECHA(2026;11;9))-E2'),
      ]),
    retoPaso(9, 'Práctica 18: SUMAR.SI con productos',
      'Calcula con **SUMAR.SI**:\n\n- **F2:** unidades vendidas de **Mouse** → [[=SUMAR.SI(A2:A8;"Mouse";B2:B8)]]\n- **F3:** unidades vendidas de **Camiseta**.\n- **F4:** total de **mermas** (suma de la columna C).\n- **F5:** mermas de **Mouse**.',
      hoja('Practica18_sumarsi', 'Ventas', 6, 8, [100, 90, 80, 30, 160, 80], pVts()),
      [
        chk('m', 'Mouse vendidos (F2)', (c) => esFormula(c, 'F2') && esNum(c, 'F2', suma(vts.filter((v) => v[0] === 'Mouse').map((v) => v[1]))) && usa(c, 'F2', /SUMAR\.SI/i), '=SUMAR.SI(A2:A8;"Mouse";B2:B8)'),
        chk('c', 'Camisetas vendidas (F3)', (c) => esFormula(c, 'F3') && esNum(c, 'F3', suma(vts.filter((v) => v[0] === 'Camiseta').map((v) => v[1]))) && usa(c, 'F3', /SUMAR\.SI/i)),
        chk('mer', 'Total de mermas (F4)', (c) => esFormula(c, 'F4') && esNum(c, 'F4', suma(vts.map((v) => v[2]))), '=SUMA(C2:C8)'),
        chk('mm', 'Mermas de Mouse (F5)', (c) => esFormula(c, 'F5') && esNum(c, 'F5', suma(vts.filter((v) => v[0] === 'Mouse').map((v) => v[2]))) && usa(c, 'F5', /SUMAR\.SI/i), '=SUMAR.SI(A2:A8;"Mouse";C2:C8)'),
      ]),
    retoPaso(10, 'Práctica 20: cotizar un viaje con BUSCARV',
      'La agencia cotiza con tres tablas de precios (destino, transporte y guía). En las celdas amarillas **B9, B10 y B11** está el código elegido.\n\n1. **C9, C10, C11:** el precio de cada código con BUSCARV. Ejemplo para el destino: [[=BUSCARV(B9;A2:C5;3;0)]]. El transporte está en E2:G4 y la guía en I2:K4.\n2. **C12 (Subtotal):** suma de los tres precios.\n3. **C13 (Total):** subtotal con **5 % de descuento**, [[=C12*0,95]] o [[=C12-C12*5%]].\n\nCambia los códigos amarillos y comprueba que el precio se actualiza.',
      hoja('Practica20_buscarv', 'Viaje', 11, 13, [70, 150, 90, 30, 70, 100, 90, 30, 70, 110, 90], pViaje()),
      [
        chk('d', 'Precio del destino (C9) con BUSCARV', (c) => esFormula(c, 'C9') && esNum(c, 'C9', dest[1][2]) && usa(c, 'C9', /BUSCARV/i), '=BUSCARV(B9;A2:C5;3;0)'),
        chk('t', 'Precio del transporte (C10) con BUSCARV', (c) => esFormula(c, 'C10') && esNum(c, 'C10', trans[2][2]) && usa(c, 'C10', /BUSCARV/i), '=BUSCARV(B10;E2:G4;3;0)'),
        chk('g', 'Precio de la guía (C11) con BUSCARV', (c) => esFormula(c, 'C11') && esNum(c, 'C11', guia[1][2]) && usa(c, 'C11', /BUSCARV/i), '=BUSCARV(B11;I2:K4;3;0)'),
        chk('s', 'Subtotal (C12) y total con 5 % de descuento (C13)', (c) => esFormula(c, 'C12') && esFormula(c, 'C13') && esNum(c, 'C12', viaje(2, 3, 2).sub) && esNum(c, 'C13', viaje(2, 3, 2).tot)),
        chk('vivo', 'Al cambiar los códigos, todo se actualiza', (c) => { const x = c.con({ B9: '4', B10: '1', B11: '3' }); const v = viaje(4, 1, 3); return esNum(x, 'C12', v.sub) && esNum(x, 'C13', v.tot); }, 'Las fórmulas deben usar B9, B10 y B11, no números escritos a mano.'),
      ]),
    { id: 'c4-reflex', tipo: 'actividad', titulo: 'Reflexión final', sub: 'Cierre de las prácticas', act: { k: 'reflexion', pregunta: '¿Cuál de las prácticas te costó más y por qué? ¿Qué función o idea nueva te llevas?' } },
  ],
};
