import type { CeldaDef, ClaseDef } from './tipos';
import { chk, columnaFormula, esFormula, esNum, rango, usa } from './ayudas';
import { alumnos, fiesta, gs, items, promedios, totales } from './datos';

const f = (nombre: string, num: string, pie: string, leyenda: string[]) => ({ fig: { nombre, num, pie, leyenda } });
const ENC: CeldaDef = { b: true, fill: '#1F4E78', color: '#ffffff', al: 'c', borde: true, fijo: true };
const dato = (v: string | number, extra: CeldaDef = {}): CeldaDef => ({ v, borde: true, fijo: true, ...extra });
const nomCol = (i: number) => String.fromCharCode(65 + i);

// ---- planillas de los retos ----
function planillaFactura(opciones: { subtotales: boolean; iva?: 'vacio' }): Record<string, CeldaDef> {
  const c: Record<string, CeldaDef> = { A1: { v: 'IVA', b: true, fijo: true }, B1: { v: '10%', fmt: 'pct', fill: '#fff2cc', borde: true, fijo: true } };
  ['Producto', 'Cantidad', 'Precio unit.', 'Subtotal'].forEach((t, i) => (c[`${nomCol(i)}3`] = { ...ENC, v: t }));
  items.forEach(([n, q, p], i) => {
    const r = i + 4;
    c[`A${r}`] = dato(n); c[`B${r}`] = dato(q); c[`C${r}`] = dato(p, { fmt: 'miles' });
    c[`D${r}`] = opciones.subtotales ? dato(`=B${r}*C${r}`, { fmt: 'miles' }) : { borde: true, fmt: 'miles' };
  });
  c.C9 = { v: 'Suma de subtotales', b: true, al: 'r', fijo: true }; c.C10 = { v: 'IVA', b: true, al: 'r', fijo: true }; c.C11 = { v: 'TOTAL A PAGAR', b: true, al: 'r', fijo: true };
  c.D9 = { fmt: 'miles', borde: true }; c.D10 = { fmt: 'miles', borde: true }; c.D11 = { fmt: 'miles', borde: true, b: true };
  return c;
}

function planillaNotas(): Record<string, CeldaDef> {
  const c: Record<string, CeldaDef> = { A1: { v: 'Planilla de notas - Informática', b: true, fijo: true } };
  ['Alumno', 'Prueba 1', 'Prueba 2', 'Trabajo práctico', 'Total', 'Promedio'].forEach((t, i) => (c[`${nomCol(i)}3`] = { ...ENC, v: t }));
  alumnos.forEach(([n, a, b, t], i) => {
    const r = i + 4;
    c[`A${r}`] = dato(n); c[`B${r}`] = dato(a); c[`C${r}`] = dato(b); c[`D${r}`] = dato(t);
    c[`E${r}`] = { borde: true }; c[`F${r}`] = { borde: true, fmt: 'dec1' };
  });
  ['Promedio del curso', 'Nota más alta', 'Nota más baja', 'Cantidad de alumnos'].forEach((t, i) => { c[`A${13 + i}`] = { v: t, b: true, fijo: true }; c[`F${13 + i}`] = { borde: true, b: true, fmt: i === 3 ? 'general' : 'dec1' }; });
  return c;
}

function planillaCumple(): Record<string, CeldaDef> {
  const c: Record<string, CeldaDef> = { A1: { v: 'Presupuesto de cumpleaños', b: true, fijo: true } };
  ['Artículo', 'Cantidad', 'Precio unitario', 'Subtotal'].forEach((t, i) => (c[`${nomCol(i)}3`] = { ...ENC, v: t }));
  fiesta.forEach(([n, q, p], i) => { const r = i + 4; c[`A${r}`] = dato(n); c[`B${r}`] = dato(q); c[`C${r}`] = dato(p, { fmt: 'miles' }); c[`D${r}`] = { borde: true, fmt: 'miles' }; });
  c.A10 = { v: 'Imprevistos (%)', b: true, fijo: true }; c.B10 = { v: '10%', fmt: 'pct', fill: '#fff2cc', borde: true, fijo: true };
  c.C12 = { v: 'Suma', b: true, al: 'r', fijo: true }; c.C13 = { v: 'Imprevistos', b: true, al: 'r', fijo: true }; c.C14 = { v: 'TOTAL', b: true, al: 'r', fijo: true };
  c.D12 = { fmt: 'miles', borde: true }; c.D13 = { fmt: 'miles', borde: true }; c.D14 = { fmt: 'miles', borde: true, b: true };
  return c;
}

function planillaErrores(): Record<string, CeldaDef> {
  const c: Record<string, CeldaDef> = { A1: { v: 'Gastos de la semana', b: true, fijo: true } };
  const dias = [['Lunes', 120000], ['Martes', 95000], ['Miércoles', 150000], ['Jueves', 80000], ['Viernes', 110000]] as const;
  dias.forEach(([d, m], i) => { c[`A${i + 2}`] = dato(d); c[`B${i + 2}`] = dato(m, { fmt: 'miles' }); });
  c.A8 = { v: 'Total de la semana', b: true, fijo: true }; c.B8 = { v: '=SUMAA(B2:B6)', fmt: 'miles', borde: true };
  c.A9 = { v: 'Total (otra vez)', b: true, fijo: true }; c.B9 = { v: 'SUMA(B2:B6)', fmt: 'miles', borde: true };
  c.A10 = { v: 'Promedio diario', b: true, fijo: true }; c.B10 = { v: '=PROMEDIO(B2;B6)', fmt: 'miles', borde: true };
  c.A11 = { v: 'Promedio por día hábil', b: true, fijo: true }; c.B11 = { v: '=B8/B12', fmt: 'miles', borde: true };
  c.A12 = { v: 'Días hábiles', b: true, fijo: true }; c.B12 = { borde: true };
  return c;
}

const totalCumple = fiesta.reduce((t, [, q, p]) => t + q * p, 0);

export const clase2: ClaseDef = {
  n: 2,
  titulo: 'Fórmulas y funciones',
  resumen: 'Operaciones, SUMA, PROMEDIO, MAX, MIN, referencias relativas y absolutas, errores.',
  objetivos: ['Escribir fórmulas respetando el orden de las operaciones', 'Usar SUMA, PROMEDIO, MAX, MIN y CONTAR', 'Copiar fórmulas y usar referencias absolutas', 'Interpretar los mensajes de error'],
  color: '#1F4E78',
  pasos: [
    {
      id: 'c2-lec-1', tipo: 'lectura', titulo: '¿Qué es una fórmula?',
      bloques: [
        { md: 'Una **fórmula** es una instrucción de cálculo. **Siempre empieza con el signo igual (=)**; si no lo pones, Excel piensa que es texto. En lugar de escribir los números, escribimos la **dirección de la celda** (por ejemplo [[B2]]): así, si el dato cambia, el resultado se actualiza solo.\n\n| Operador | Significa | Ejemplo | Resultado |\n|---|---|---|---|\n| [[+]] | Sumar | [[=5+3]] | 8 |\n| [[-]] | Restar | [[=10-4]] | 6 |\n| [[*]] | Multiplicar | [[=6*7]] | 42 |\n| [[/]] | Dividir | [[=20/5]] | 4 |\n| [[^]] | Potencia | [[=3^2]] | 9 |\n| [[%]] | Porcentaje | [[=200*10%]] | 20 |' },
        { recordar: '**Orden de las operaciones:** 1.º lo que está entre paréntesis · 2.º potencias · 3.º multiplicar y dividir · 4.º sumar y restar. Por eso [[=2+3*4]] da 14, pero [[=(2+3)*4]] da 20.' },
        f('c2_formula', '2.1', 'Escribiendo la fórmula **=B2*C2** en la celda D2. Excel colorea las celdas que se usan.', ['**Barra de fórmulas:** muestra lo que se está escribiendo.', '**Celda** donde queda el resultado (D2).', '**B2** (cantidad), resaltada en azul.', '**C2** (precio), resaltada en naranja.', '**Modo «Introducir»:** Excel está esperando que termines la fórmula con Enter.']),
      ],
    },
    {
      id: 'c2-act-a', tipo: 'actividad', titulo: 'Completa con lo leído', sub: 'Actividad 2.A',
      act: { k: 'cloze', intro: 'Completa.', items: ['Toda fórmula empieza con el signo {{igual|=|igual (=)}}.', 'En una fórmula conviene escribir la {{dirección|direccion}} de la celda en lugar del número, porque si el dato cambia, el resultado se {{actualiza|actualiza solo}} solo.'] },
    },
    {
      id: 'c2-act-a2', tipo: 'actividad', titulo: '¿Qué resultado da cada fórmula?', sub: 'Actividad 2.A (parte 2)',
      act: { k: 'predice', intro: 'Calcula mentalmente. Recuerda el orden de las operaciones.', items: [{ q: '=5+3', r: ['8'] }, { q: '=10-4*2', r: ['2'], pista: 'Primero multiplicar, después restar.' }, { q: '=20/4+1', r: ['6'] }, { q: '=(10-4)*2', r: ['12'] }, { q: '=2^3', r: ['8'], pista: '2 elevado a la 3.' }, { q: '=200*10%', r: ['20'] }] },
    },
    {
      id: 'c2-lec-2', tipo: 'lectura', titulo: 'El controlador de relleno',
      bloques: [
        { md: 'Al seleccionar una celda aparece, en su esquina inferior derecha, un cuadradito: el **controlador de relleno**. Si lo **arrastras hacia abajo**, Excel copia la fórmula en las celdas de abajo y **ajusta solo las filas**: [[B2*C2]] pasa a [[B3*C3]], luego [[B4*C4]]… También puedes hacerle **doble clic**.' },
        f('c2_relleno', '2.2', 'D2 ya tiene la fórmula. Se arrastra el controlador hasta D5 para copiarla.', ['**Controlador de relleno** (cuadradito verde).', '**Celdas destino:** D3 a D5 reciben la fórmula copiada.']),
      ],
    },
    {
      id: 'c2-act-b', tipo: 'actividad', titulo: 'Predice la fórmula', sub: 'Actividad 2.B',
      act: {
        k: 'predice', intro: 'Si en D2 está [[=B2*C2]] y la copias hacia abajo con el controlador de relleno, ¿qué fórmula queda en cada celda? Escríbela completa, con el =.',
        items: [{ q: 'D3', r: ['=B3*C3'] }, { q: 'D4', r: ['=B4*C4'] }, { q: 'D5', r: ['=B5*C5'] }],
      },
    },
    {
      id: 'c2-lec-3', tipo: 'lectura', titulo: 'Funciones',
      bloques: [
        { md: 'Una **función** es una fórmula ya preparada. Se escribe con su nombre y, entre paréntesis, los datos que usa. Al escribirla, Excel muestra una **ayuda emergente** con las partes que necesita.\n\n| Función | Qué hace | Ejemplo |\n|---|---|---|\n| [[SUMA]] | Suma un rango | [[=SUMA(B2:B9)]] |\n| [[PROMEDIO]] | Calcula el promedio | [[=PROMEDIO(B2:D2)]] |\n| [[MAX]] | Devuelve el valor más alto | [[=MAX(F4:F11)]] |\n| [[MIN]] | Devuelve el valor más bajo | [[=MIN(F4:F11)]] |\n| [[CONTAR]] | Cuenta celdas con números | [[=CONTAR(B2:B9)]] |\n| [[CONTARA]] | Cuenta celdas con cualquier dato | [[=CONTARA(A4:A11)]] |' },
        f('c2_suma', '2.3', 'Se escribe **=SUMA(B4:D4)** en E4. El rango B4:D4 queda marcado y aparece la ayuda de la función.', ['**Barra de fórmulas** con la función.', '**Rango** que se va a sumar (B4:D4).', '**Ayuda emergente** con los argumentos de SUMA.']),
        f('c2_autosuma', '2.4', 'Atajo: el botón **Autosuma (Σ)** de la pestaña Inicio escribe la función SUMA por ti.', ['**Botón Autosuma**', '**Celda** donde aparecerá el resultado']),
      ],
    },
    {
      id: 'c2-act-c', tipo: 'actividad', titulo: 'Completa la fórmula', sub: 'Actividad 2.C',
      act: {
        k: 'predice', intro: 'Escribe la fórmula correcta para cada pedido (con el =).',
        items: [
          { q: 'Sumar las celdas de B2 a B9', r: ['=SUMA(B2:B9)'] },
          { q: 'Calcular el promedio de D2 a D9', r: ['=PROMEDIO(D2:D9)'] },
          { q: 'Encontrar la nota más alta de F4 a F11', r: ['=MAX(F4:F11)'] },
          { q: 'Encontrar la nota más baja de F4 a F11', r: ['=MIN(F4:F11)'] },
          { q: 'Contar cuántos nombres hay en A4:A11', r: ['=CONTARA(A4:A11)'] },
        ],
      },
    },
    {
      id: 'c2-act-d', tipo: 'actividad', titulo: 'Une cada función con lo que hace', sub: 'Actividad 2.D',
      act: { k: 'une', izq: ['SUMA', 'PROMEDIO', 'MAX', 'MIN', 'CONTARA'], der: ['El valor más bajo', 'Cuenta celdas con cualquier dato', 'Suma un rango', 'El valor más alto', 'Calcula el promedio'], correcta: [2, 4, 3, 0, 1] },
    },
    {
      id: 'c2-reto-1', tipo: 'reto', titulo: 'Reto: subtotales con el controlador de relleno',
      reto: {
        md: 'La factura ya tiene cantidades y precios. Calcula el **subtotal** de cada producto.\n\n1. En **D4** escribe [[=B4*C4]] y presiona Enter.\n2. Vuelve a seleccionar **D4**.\n3. **Arrastra el cuadradito verde** de la esquina hasta **D7**: Excel copia la fórmula ajustando las filas.\n\nPulsa **Comprobar** al terminar.',
        planilla: { titulo: 'Clase2_factura', hoja: 'Factura', cols: 5, filas: 12, anchos: [150, 90, 120, 120, 80], celdas: planillaFactura({ subtotales: false }), cinta: true },
        checks: [
          columnaFormula('sub', 'Subtotales D4:D7 con fórmula (cantidad × precio)', 'D', 4, items.map(([, q, p]) => q * p), 'Escribe =B4*C4 en D4 y arrastra el controlador de relleno hasta D7.', /\*/),
          chk('rel', 'Cada fila usa sus propias celdas (D5 usa B5 y C5…)', (c) => [5, 6, 7].every((r) => usa(c, `D${r}`, new RegExp(`B${r}`)) && usa(c, `D${r}`, new RegExp(`C${r}`)))),
        ],
        pistas: ['El controlador de relleno es el cuadradito verde de la esquina inferior derecha de la celda seleccionada.'],
      },
    },
    {
      id: 'c2-reto-2', tipo: 'reto', titulo: 'Reto: planilla de notas',
      reto: {
        md: 'Calcula el **total** y el **promedio** de cada alumno y los datos del curso.\n\n1. **E4:** [[=SUMA(B4:D4)]]. **F4:** [[=PROMEDIO(B4:D4)]].\n2. Selecciona **E4:F4** y arrastra el controlador hasta la fila 11.\n3. **F13:** promedio del curso con [[PROMEDIO]] sobre F4:F11. **F14:** [[MAX]]. **F15:** [[MIN]]. **F16:** [[CONTARA]] sobre A4:A11.',
        planilla: { titulo: 'Clase2_notas', hoja: 'Notas', cols: 7, filas: 17, anchos: [150, 80, 80, 130, 80, 90, 40], celdas: planillaNotas(), cinta: true },
        checks: [
          columnaFormula('tot', 'Total de cada alumno (E4:E11) con SUMA', 'E', 4, totales, 'En E4: =SUMA(B4:D4) y arrastra hasta E11.', /SUMA/i),
          columnaFormula('prom', 'Promedio de cada alumno (F4:F11) con PROMEDIO', 'F', 4, promedios, 'En F4: =PROMEDIO(B4:D4) y arrastra hasta F11.', /PROMEDIO/i),
          chk('curso', 'Promedio del curso en F13', (c) => esFormula(c, 'F13') && esNum(c, 'F13', promedios.reduce((a, b) => a + b, 0) / 8), '=PROMEDIO(F4:F11)'),
          chk('max', 'Nota más alta en F14 con MAX', (c) => esFormula(c, 'F14') && esNum(c, 'F14', Math.max(...promedios)) && usa(c, 'F14', /MAX/i)),
          chk('min', 'Nota más baja en F15 con MIN', (c) => esFormula(c, 'F15') && esNum(c, 'F15', Math.min(...promedios)) && usa(c, 'F15', /MIN/i)),
          chk('cant', 'Cantidad de alumnos en F16 con CONTARA', (c) => esFormula(c, 'F16') && esNum(c, 'F16', 8) && usa(c, 'F16', /CONTARA/i), '=CONTARA(A4:A11)'),
        ],
        pistas: ['Selecciona dos celdas (E4 y F4) y arrastra el controlador: se copian las dos fórmulas a la vez.', 'También puedes usar el botón Σ Autosuma de la cinta.'],
      },
    },
    {
      id: 'c2-lec-4', tipo: 'lectura', titulo: 'Referencias relativas y absolutas',
      bloques: [
        { md: 'Cuando copias una fórmula, las referencias normales (**relativas**) **se mueven**. A veces necesitas que una celda **no se mueva**, por ejemplo la que tiene el porcentaje del IVA. Para fijarla se escribe el signo [[$]] delante de la letra y del número: [[$B$1]]. Es una **referencia absoluta**. También puedes escribir la referencia y presionar [[F4]].\n\n| Tipo | Cómo se escribe | Al copiar hacia abajo… |\n|---|---|---|\n| Relativa | [[B1]] | pasa a B2, B3… |\n| Absoluta | [[$B$1]] | sigue siendo $B$1 |\n\nPara calcular un porcentaje: el 10 % de un monto es [[=monto*10%]] (o [[*0,1]]). Para sumarle ese 10 %: [[=monto+monto*10%]] o [[=monto*1,1]].' },
        f('c2_absoluta', '2.5', 'En D10 se calcula el IVA con **=D9*$B$1**. La celda B1 (10 %) queda fija.', ['**Celda B1** con el porcentaje del IVA.', '**Barra de fórmulas:** $B$1 es la referencia absoluta.', '**Resultado:** el IVA de la factura.']),
      ],
    },
    {
      id: 'c2-act-e', tipo: 'actividad', titulo: 'Referencias y porcentajes', sub: 'Actividad 2.E',
      act: {
        k: 'cloze', intro: 'Con la Figura 2.5, completa.',
        items: [
          'La fórmula de D10 es {{=D9*$B$1}}. El signo $ sirve para que la referencia {{no cambie|no se mueva}} al copiar.',
          'Si se copiara la fórmula de D10 a la celda de abajo, [[D9]] se convertiría en {{D10}}, pero [[$B$1]] seguiría siendo {{$B$1}}.',
          'Si se hubiera escrito [[=D9*B1]] (sin $) y se copiara una fila hacia abajo, quedaría {{=D10*B2}}, y B2 está vacía: el resultado sería incorrecto.',
          'El 10 % de 354.000 es {{35.400|35400}} y el total con IVA es {{389.400|389400}}.',
        ],
      },
    },
    {
      id: 'c2-reto-3', tipo: 'reto', titulo: 'Reto: factura con IVA',
      reto: {
        md: 'Completa los totales de la factura. El IVA (10 %) está en **B1**: úsalo con referencia absoluta.\n\n1. **D9:** [[=SUMA(D4:D7)]].\n2. **D10:** [[=D9*$B$1]].\n3. **D11:** [[=D9+D10]].\n\nAl comprobar, probamos también que el IVA «se actualiza solo» si B1 cambia.',
        planilla: { titulo: 'Clase2_factura', hoja: 'Factura', cols: 5, filas: 12, anchos: [150, 90, 140, 120, 80], celdas: planillaFactura({ subtotales: true }), cinta: true },
        checks: [
          chk('suma', 'Suma de subtotales en D9 = 354.000', (c) => esFormula(c, 'D9') && esNum(c, 'D9', 354000) && usa(c, 'D9', /SUMA/i), '=SUMA(D4:D7)'),
          chk('iva', 'IVA en D10 = 35.400', (c) => esFormula(c, 'D10') && esNum(c, 'D10', 35400)),
          chk('abs', 'D10 usa la referencia absoluta $B$1', (c) => usa(c, 'D10', /\$B\$1/), 'Escribe $B$1 (o presiona F4 sobre B1) para que no se mueva al copiar.'),
          chk('total', 'Total a pagar en D11 = 389.400', (c) => esFormula(c, 'D11') && esNum(c, 'D11', 389400), '=D9+D10'),
          chk('vivo', 'Si el IVA cambia a 5 %, D10 se actualiza (17.700)', (c) => esNum(c.con({ B1: '5%' }), 'D10', 17700), 'Usa B1 en la fórmula en vez de escribir el 10 % a mano.'),
        ],
      },
    },
    {
      id: 'c2-lec-5', tipo: 'lectura', titulo: 'Errores frecuentes',
      bloques: [
        { md: 'Cuando algo sale mal, Excel muestra un mensaje que empieza con [[#]]. Léelo: casi siempre indica qué corregir.' },
        f('c2_errores', '2.7', 'Los mensajes de error más comunes.', ['**########**: la columna es muy angosta.', '**#¿NOMBRE?**: nombre de función mal escrito.', '**#¡DIV/0!**: división por cero o por una celda vacía.', '**#¡VALOR!**: se intenta calcular con texto.', '**#¡REF!**: la fórmula apunta a una celda que ya no existe.']),
      ],
    },
    {
      id: 'c2-act-f', tipo: 'actividad', titulo: 'Une cada error con su causa', sub: 'Actividad 2.F',
      act: { k: 'une', izq: ['########', '#¿NOMBRE?', '#¡DIV/0!', '#¡VALOR!', '#¡REF!'], der: ['Se borró la celda a la que apuntaba la fórmula', 'Se dividió entre cero', 'Se escribió mal el nombre de la función', 'Se intenta operar con texto', 'La columna es muy angosta para el dato'], correcta: [4, 2, 1, 3, 0] },
    },
    {
      id: 'c2-reto-4', tipo: 'reto', titulo: 'Reto: cazador de errores',
      reto: {
        md: 'Esta planilla tiene **4 problemas**. Encuéntralos y corrígelos (haz clic en la celda, mira la barra de fórmulas y reescribe).\n\n- **B8** muestra un error: ¿qué función está mal escrita?\n- **B9** no calcula nada: ¿qué le falta?\n- **B10** promedia solo dos días: ¿qué separador usó?\n- **B11** divide entre una celda vacía: completa **B12** con los días hábiles (5).',
        planilla: { titulo: 'Gastos_semana', hoja: 'Hoja1', cols: 4, filas: 13, anchos: [180, 130, 90, 90], celdas: planillaErrores() },
        checks: [
          chk('b8', 'B8 suma los 5 días (555.000)', (c) => esNum(c, 'B8', 555000) && usa(c, 'B8', /SUMA/i), 'El nombre correcto es SUMA.'),
          chk('b9', 'B9 es una fórmula que suma (555.000)', (c) => esFormula(c, 'B9') && esNum(c, 'B9', 555000), 'Toda fórmula empieza con =.'),
          chk('b10', 'B10 promedia el rango completo (111.000)', (c) => esNum(c, 'B10', 111000), 'Para un rango se usan dos puntos: B2:B6.'),
          chk('b12', 'B12 tiene 5 días hábiles y B11 da 111.000', (c) => esNum(c, 'B12', 5) && esNum(c, 'B11', 111000), 'Escribe 5 en B12.'),
        ],
      },
    },
    {
      id: 'c2-act-g', tipo: 'actividad', titulo: 'Corrige la fórmula', sub: 'Actividad 2.G',
      act: {
        k: 'predice', intro: 'Estas fórmulas tienen un error. Escribe cómo debería quedar cada una.',
        items: [{ q: '=SUMAA(B2:B5)', r: ['=SUMA(B2:B5)'] }, { q: 'SUMA(B2:B5)', r: ['=SUMA(B2:B5)'], pista: 'Le falta algo al principio.' }, { q: '=B2x C2', r: ['=B2*C2'], pista: 'El producto se escribe con asterisco.' }, { q: '=PROMEDIO(B2;B9)', r: ['=PROMEDIO(B2:B9)'], pista: 'Un rango se escribe con dos puntos.' }],
      },
    },
    {
      id: 'c2-reto-5', tipo: 'reto', titulo: 'Reto: presupuesto de un cumpleaños',
      reto: {
        md: 'Arma el presupuesto completo.\n\n1. **D4:D8:** subtotal de cada artículo (cantidad × precio). Usa el controlador de relleno.\n2. **D12:** suma de los subtotales.\n3. **D13:** imprevistos = la suma por el porcentaje de **B10** (referencia absoluta).\n4. **D14:** total = suma + imprevistos.',
        planilla: { titulo: 'Presupuesto', hoja: 'Cumpleaños', cols: 5, filas: 15, anchos: [150, 90, 130, 120, 70], celdas: planillaCumple(), cinta: true },
        checks: [
          columnaFormula('sub', 'Subtotales D4:D8', 'D', 4, fiesta.map(([, q, p]) => q * p), 'Cantidad por precio, y arrastra el controlador de relleno.'),
          chk('suma', `Suma en D12 = ${gs(totalCumple)}`, (c) => esFormula(c, 'D12') && esNum(c, 'D12', totalCumple) && usa(c, 'D12', /SUMA/i)),
          chk('imp', `Imprevistos en D13 = ${gs(totalCumple * 0.1)} usando $B$10`, (c) => esNum(c, 'D13', totalCumple * 0.1) && usa(c, 'D13', /\$B\$10/), 'Usa $B$10 para que no se mueva.'),
          chk('tot', `Total en D14 = ${gs(totalCumple * 1.1)}`, (c) => esFormula(c, 'D14') && esNum(c, 'D14', totalCumple * 1.1)),
        ],
      },
    },
    {
      id: 'c2-act-h', tipo: 'actividad', titulo: 'Verdadero o falso', sub: 'Actividad 2.H',
      act: {
        k: 'vf', intro: 'Cierre de la clase 2.',
        items: [
          { t: 'Una fórmula puede empezar con cualquier signo.', r: false, why: 'Siempre empieza con el signo igual (=).' },
          { t: '[[=2+3*4]] da 20.', r: false, why: 'Primero se multiplica: 3*4 = 12 y 2+12 = 14.' },
          { t: 'El controlador de relleno copia una fórmula ajustando las referencias.', r: true },
          { t: '[[$B$1]] se mueve al copiar la fórmula.', r: false, why: 'El signo $ la fija: no se mueve.' },
        ],
      },
    },
    { id: 'c2-reflex', tipo: 'actividad', titulo: 'Lo que aprendí hoy', sub: 'Cierre', act: { k: 'reflexion', pregunta: 'Con tus palabras: ¿qué significa que una celda muestre ######## y cómo se arregla?' } },
  ],
};
void rango;
