import type { CeldaDef, ClaseDef } from './tipos';
import { chk, columnaFormula, columnaTexto, esFormula, esNum, usa } from './ayudas';
import { alumnos, gs, precios, promedios, ventasCalc } from './datos';

const f = (nombre: string, num: string, pie: string, leyenda: string[]) => ({ fig: { nombre, num, pie, leyenda } });
const ENC: CeldaDef = { b: true, fill: '#1F4E78', color: '#ffffff', al: 'c', borde: true, fijo: true };
const dato = (v: string | number, extra: CeldaDef = {}): CeldaDef => ({ v, borde: true, fijo: true, ...extra });
const L = 'ABCDEFGHIJKL';
const sit = promedios.map((p) => (p >= 60 ? 'Aprobado' : 'Reprobado'));

function planillaSituacion(conSituacion: boolean): Record<string, CeldaDef> {
  const c: Record<string, CeldaDef> = {};
  ['Alumno', 'Promedio', 'Situación'].forEach((t, i) => (c[`${L[i]}1`] = { ...ENC, v: t }));
  alumnos.forEach(([n], i) => {
    const r = i + 2;
    c[`A${r}`] = dato(n); c[`B${r}`] = dato(promedios[i], { fmt: 'dec1' });
    c[`C${r}`] = conSituacion ? dato(sit[i]) : { borde: true };
  });
  if (conSituacion) {
    c.E2 = { v: 'Aprobados', b: true, fijo: true }; c.F2 = { borde: true, b: true };
    c.E3 = { v: 'Reprobados', b: true, fijo: true }; c.F3 = { borde: true, b: true };
  }
  return c;
}

function planillaVentas(modo: 'comision' | 'resumen'): Record<string, CeldaDef> {
  const c: Record<string, CeldaDef> = {};
  ['Fecha', 'Vendedor', 'Producto', 'Cantidad', 'Categoría', 'Precio', 'Total', 'Comisión'].forEach((t, i) => (c[`${L[i]}1`] = { ...ENC, v: t }));
  ventasCalc.forEach((v, i) => {
    const r = i + 2;
    c[`A${r}`] = dato(v.fecha); c[`B${r}`] = dato(v.vendedor); c[`C${r}`] = dato(v.producto); c[`D${r}`] = dato(v.cantidad); c[`E${r}`] = dato(v.categoria); c[`F${r}`] = dato(v.precio, { fmt: 'miles' });
    c[`G${r}`] = modo === 'comision' ? { borde: true, fmt: 'miles' } : dato(`=D${r}*F${r}`, { fmt: 'miles' });
    c[`H${r}`] = modo === 'comision' ? { borde: true, fmt: 'miles' } : { borde: true, fmt: 'miles' };
  });
  if (modo === 'resumen') {
    ['Vendedor', 'Cantidad de ventas', 'Total vendido'].forEach((t, i) => (c[`${L[9 + i]}1`] = { ...ENC, v: t }));
    ['Ana', 'Luis', 'María'].forEach((n, i) => { const r = i + 2; c[`J${r}`] = dato(n); c[`K${r}`] = { borde: true }; c[`L${r}`] = { borde: true, fmt: 'miles' }; });
  }
  return c;
}

function planillaBuscarv(): Record<string, CeldaDef> {
  const c: Record<string, CeldaDef> = {};
  ['Producto', 'Cantidad', 'Precio', 'Total'].forEach((t, i) => (c[`${L[i]}1`] = { ...ENC, v: t }));
  [['Mouse', 5], ['Notebook', 1], ['Teclado', 3], ['Monitor', 2], ['Pendrive', 10]].forEach(([p, q], i) => { const r = i + 2; c[`A${r}`] = dato(p); c[`B${r}`] = dato(q); c[`C${r}`] = { borde: true, fmt: 'miles' }; c[`D${r}`] = { borde: true, fmt: 'miles' }; });
  ['Producto', 'Categoría', 'Precio'].forEach((t, i) => (c[`${L[5 + i]}1`] = { ...ENC, v: t }));
  precios.forEach(([p, cat, pr], i) => { const r = i + 2; c[`F${r}`] = dato(p, { fill: '#e2efda' }); c[`G${r}`] = dato(cat, { fill: '#e2efda' }); c[`H${r}`] = dato(pr, { fill: '#e2efda', fmt: 'miles' }); });
  return c;
}

const ana = ventasCalc.filter((v) => v.vendedor === 'Ana');
void ana;
const resumenV = (n: string) => ({ cant: ventasCalc.filter((v) => v.vendedor === n).length, total: ventasCalc.filter((v) => v.vendedor === n).reduce((t, v) => t + v.total, 0) });

export const clase3: ClaseDef = {
  n: 3,
  titulo: 'Decisiones y análisis de datos',
  resumen: 'La función SI, contar y sumar con condición, ordenar, filtrar, formato condicional, gráficos y BUSCARV.',
  objetivos: ['Usar la función SI para tomar decisiones', 'Contar y sumar con condición (CONTAR.SI y SUMAR.SI)', 'Ordenar, filtrar, resaltar y graficar datos', '(Desafío) Usar BUSCARV'],
  color: '#7a3e9d',
  pasos: [
    {
      id: 'c3-lec-1', tipo: 'lectura', titulo: 'La función SI',
      bloques: [
        { md: 'La función **SI** hace una pregunta y responde una cosa si la respuesta es verdadera y otra si es falsa. Tiene tres partes:\n\n> [[=SI(prueba_lógica; valor_si_verdadero; valor_si_falso)]]\n\n**Ejemplo:** [[=SI(B2>=60;"Aprobado";"Reprobado")]] escribe *Aprobado* si el promedio de B2 es 60 o más, y *Reprobado* si es menor.\n\n| Operador | Significa | Operador | Significa |\n|---|---|---|---|\n| [[=]] | igual a | [[<>]] | distinto de |\n| [[>]] | mayor que | [[<]] | menor que |\n| [[>=]] | mayor o igual que | [[<=]] | menor o igual que |' },
        { recordar: 'Los **textos** van **entre comillas** ("Aprobado"). Los números y las referencias de celda, no.' },
        f('c3_si', '3.1', 'La función SI en la columna «Situación». Está en la pestaña Fórmulas → Lógicas.', ['**Barra de fórmulas:** =SI(B2>=60;"Aprobado";"Reprobado")', '**Resultados** de la función (verde = aprobado, rojo = reprobado).', '**Botón Lógicas**, donde está la función SI.']),
      ],
    },
    {
      id: 'c3-act-a', tipo: 'actividad', titulo: 'Completa con lo leído', sub: 'Actividad 3.A',
      act: {
        k: 'cloze', intro: 'Completa.', banco: ['prueba lógica', 'verdadero', 'falso', 'comillas', 'paréntesis'],
        items: ['La función SI tiene tres partes: la {{prueba lógica}}, el valor si es {{verdadero}} y el valor si es {{falso}}.', 'Los textos se escriben entre {{comillas}}.'],
      },
    },
    {
      id: 'c3-act-a2', tipo: 'actividad', titulo: '¿Qué resultado da la función SI?', sub: 'Actividad 3.A (parte 2)',
      act: { k: 'clasifica', intro: 'Con la fórmula [[=SI(B2>=60;"Aprobado";"Reprobado")]], ¿qué resultado da según el valor de B2?', categorias: ['Aprobado', 'Reprobado'], items: [{ t: 'B2 = 72', r: 0 }, { t: 'B2 = 55', r: 1 }, { t: 'B2 = 60', r: 0 }, { t: 'B2 = 59', r: 1 }] },
    },
    {
      id: 'c3-act-a3', tipo: 'actividad', titulo: 'Completa la fórmula', sub: 'Actividad 3.A (parte 3)',
      act: { k: 'predice', intro: 'Debe mostrar «Bonificado» si la venta (G2) supera 500.000 y «Normal» en caso contrario. Escribe la fórmula completa.', items: [{ q: 'Fórmula en H2', r: ['=SI(G2>500000;"Bonificado";"Normal")'], pista: 'Prueba lógica: G2>500000. Los textos van entre comillas.' }] },
    },
    {
      id: 'c3-reto-1', tipo: 'reto', titulo: 'Reto: ¿aprobó o reprobó?',
      reto: {
        md: 'En la columna **Situación** escribe, con la función **SI**, «Aprobado» si el promedio es **60 o más** y «Reprobado» si es menor.\n\n1. En **C2**: [[=SI(B2>=60;"Aprobado";"Reprobado")]].\n2. Arrastra el controlador de relleno hasta **C9**.',
        planilla: { titulo: 'Clase3_notas', hoja: 'Notas', cols: 7, filas: 11, anchos: [150, 90, 110, 30, 110, 80, 40], celdas: planillaSituacion(false), cinta: true },
        checks: [columnaTexto('si', 'Situación de los 8 alumnos con la función SI', 'C', 2, sit, 'Recuerda: ">=" y los textos entre comillas.', /SI\s*\(/i)],
        pistas: ['Si te sale #¿NOMBRE?, revisa que escribiste SI con mayúscula o minúscula, pero sin espacios raros.'],
      },
    },
    {
      id: 'c3-reto-2', tipo: 'reto', titulo: 'Reto: contar aprobados y reprobados',
      reto: {
        md: 'Ya tenemos la situación de cada alumno. Cuenta cuántos aprobaron y cuántos reprobaron con **CONTAR.SI**.\n\n- **F2:** [[=CONTAR.SI(C2:C9;"Aprobado")]]\n- **F3:** lo mismo para «Reprobado».',
        planilla: { titulo: 'Clase3_notas', hoja: 'Notas', cols: 7, filas: 11, anchos: [150, 90, 110, 30, 110, 80, 40], celdas: planillaSituacion(true), cinta: true },
        checks: [
          chk('ap', `Aprobados en F2 = ${sit.filter((s) => s === 'Aprobado').length}`, (c) => esFormula(c, 'F2') && esNum(c, 'F2', sit.filter((s) => s === 'Aprobado').length) && usa(c, 'F2', /CONTAR\.SI/i)),
          chk('re', `Reprobados en F3 = ${sit.filter((s) => s === 'Reprobado').length}`, (c) => esFormula(c, 'F3') && esNum(c, 'F3', sit.filter((s) => s === 'Reprobado').length) && usa(c, 'F3', /CONTAR\.SI/i)),
        ],
      },
    },
    {
      id: 'c3-lec-2', tipo: 'lectura', titulo: 'Contar y sumar con condición',
      bloques: [
        { md: '| Función | Qué hace | Ejemplo |\n|---|---|---|\n| [[CONTAR.SI]] | Cuenta cuántas celdas cumplen una condición | [[=CONTAR.SI(B2:B17;"Ana")]] |\n| [[SUMAR.SI]] | Suma los valores de las filas que cumplen una condición | [[=SUMAR.SI(B2:B17;"Ana";G2:G17)]] |\n\n**SUMAR.SI** tiene tres partes: *dónde busco* (rango de vendedores), *qué busco* («Ana») y *qué sumo* (rango de totales).' },
        f('c3_sumarsi', '3.2', 'Hoja «Resumen» de la tienda: cuántas ventas hizo cada vendedor y cuánto vendió.', ['**Barra de fórmulas** de C2 con SUMAR.SI.', '**Nombres** de los vendedores (lo que se busca).', '**Cantidad de ventas** con CONTAR.SI.', '**Total vendido** con SUMAR.SI.']),
      ],
    },
    {
      id: 'c3-act-b', tipo: 'actividad', titulo: 'Observa y responde', sub: 'Actividad 3.B',
      act: {
        k: 'predice', intro: 'Mira la Figura 3.2 y responde.',
        items: [
          { q: '¿Cuántas ventas hizo Luis?', r: [String(resumenV('Luis').cant)] },
          { q: '¿Cuánto vendió María? (escribe solo el número, con o sin puntos)', r: [gs(resumenV('María').total), String(resumenV('María').total)] },
          { q: '¿Qué función cuenta según una condición?', r: ['CONTAR.SI', 'contarsi'] },
          { q: '¿Qué función suma según una condición?', r: ['SUMAR.SI', 'sumarsi'] },
          { q: 'Fórmula para contar las ventas de María en B2:B17', r: ['=CONTAR.SI(B2:B17;"María")', '=CONTAR.SI(B2:B17;"Maria")'], pista: 'CONTAR.SI(rango; "criterio")' },
        ],
      },
    },
    {
      id: 'c3-reto-3', tipo: 'reto', titulo: 'Reto: total y comisión de cada venta',
      reto: {
        md: 'Calcula, para cada una de las 16 ventas:\n\n1. **Total (G):** cantidad × precio. En **G2**: [[=D2*F2]] y arrastra hasta G17.\n2. **Comisión (H):** **5 %** del total si la venta es de **1.000.000 o más**, **2 %** si es menor. En **H2**: [[=SI(G2>=1000000;G2*5%;G2*2%)]] y arrastra hasta H17.',
        planilla: { titulo: 'Clase3_ventas', hoja: 'Ventas', cols: 8, filas: 17, anchos: [100, 80, 100, 80, 100, 100, 110, 100], celdas: planillaVentas('comision'), cinta: true },
        checks: [
          columnaFormula('tot', 'Total de las 16 ventas (G2:G17)', 'G', 2, ventasCalc.map((v) => v.total), 'G2: =D2*F2 y arrastra hasta G17.', /\*/),
          columnaFormula('com', 'Comisión de las 16 ventas (H2:H17) con SI', 'H', 2, ventasCalc.map((v) => v.comision), 'H2: =SI(G2>=1000000;G2*5%;G2*2%) y arrastra hasta H17.', /SI\s*\(/i),
        ],
      },
    },
    {
      id: 'c3-reto-4', tipo: 'reto', titulo: 'Reto: resumen por vendedor',
      reto: {
        md: 'Con la tabla de ventas ya calculada, arma el resumen de la derecha (columnas J a L).\n\n- **K2:** ventas de Ana con [[=CONTAR.SI(B2:B17;J2)]].\n- **L2:** total vendido por Ana con [[=SUMAR.SI(B2:B17;J2;G2:G17)]].\n- Arrastra las dos fórmulas hasta la fila 4.\n\nOjo: las fórmulas deben copiarse bien, así que los rangos B2:B17 y G2:G17 conviene fijarlos con **$**.

> ↔ El resumen está a la derecha de la tabla. La planilla se abre mostrando las columnas J a L; **desliza hacia la izquierda** para ver los datos.',
        planilla: { titulo: 'Clase3_ventas', hoja: 'Ventas', cols: 12, filas: 17, anchos: [100, 80, 100, 80, 100, 100, 110, 100, 30, 90, 140, 120], celdas: planillaVentas('resumen'), cinta: true, desplazarA: 'J1' },
        checks: [
          chk('k', 'Cantidad de ventas por vendedor (K2:K4) con CONTAR.SI', (c) => ['Ana', 'Luis', 'María'].every((n, i) => esFormula(c, `K${i + 2}`) && esNum(c, `K${i + 2}`, resumenV(n).cant) && usa(c, `K${i + 2}`, /CONTAR\.SI/i)), 'Fija el rango con $: $B$2:$B$17.'),
          chk('l', 'Total vendido por vendedor (L2:L4) con SUMAR.SI', (c) => ['Ana', 'Luis', 'María'].every((n, i) => esFormula(c, `L${i + 2}`) && esNum(c, `L${i + 2}`, resumenV(n).total) && usa(c, `L${i + 2}`, /SUMAR\.SI/i)), 'SUMAR.SI(dónde busco; qué busco; qué sumo)'),
        ],
      },
    },
    {
      id: 'c3-lec-3', tipo: 'lectura', titulo: 'Ordenar y filtrar',
      bloques: [
        { md: '- **Ordenar:** haz clic dentro de la tabla → **Datos → Ordenar**. Elige la columna y si va de menor a mayor o al revés. Siempre se ordena **toda la tabla**, para que las filas no se desarmen.\n- **Filtrar:** **Datos → Filtro**. Aparecen flechitas en los encabezados; con ellas muestras solo las filas que te interesan. El filtro **no borra** datos: los oculta.' },
        f('c3_filtro', '3.3', 'Pestaña Datos con el filtro activado y la lista desplegable de «Vendedor».', ['**Ordenar** (Datos → Ordenar).', '**Filtro** (Datos → Filtro).', '**Flechita** del encabezado.', '**Lista de valores:** se marcan los que se quieren ver.']),
      ],
    },
    {
      id: 'c3-act-c', tipo: 'actividad', titulo: 'Ordena los pasos', sub: 'Actividad 3.C',
      act: { k: 'ordena', intro: 'Ordena los pasos para mostrar **solo las ventas de Ana**.', items: ['Hacer clic en cualquier celda de la tabla', 'Ir a la pestaña Datos y pulsar Filtro', 'Pulsar la flechita del encabezado «Vendedor»', 'Marcar solo «Ana» en la lista y pulsar Aceptar', 'Comprobar que se ven solo las filas de Ana'] },
    },
    {
      id: 'c3-lec-4', tipo: 'lectura', titulo: 'Formato condicional',
      bloques: [
        { md: 'El **formato condicional** cambia el color de las celdas **automáticamente** según su valor. Se aplica a un rango seleccionado: **Inicio → Formato condicional → Resaltar reglas de celdas → Es mayor que…**' },
        f('c3_fcond', '3.4a', 'Con el rango G2:G10 seleccionado, se abre el menú Formato condicional.', ['**Rango** seleccionado (G2:G10).', '**Botón Formato condicional**.', '**Resaltar reglas de celdas**.', '**Es mayor que…** (se escribe el valor, por ejemplo 1000000, y se elige el color).']),
        f('c3_fcond_res', '3.4b', 'Resultado: se pintan solas las ventas de 1.000.000 o más.', ['**Venta de 3.500.000:** cumple la regla, se pinta de verde.', '**Venta de 1.800.000:** también.', '**Venta de 300.000:** no cumple, queda sin color.']),
      ],
    },
    {
      id: 'c3-act-d', tipo: 'actividad', titulo: 'Completa la ruta', sub: 'Actividad 3.D',
      act: { k: 'cloze', intro: 'Completa la ruta para resaltar las ventas mayores a un valor.', banco: ['Formato condicional', 'Resaltar reglas de celdas', 'Es mayor que…', 'Cambia solo, automáticamente', 'No cambia'], items: ['Inicio → {{Formato condicional}} → {{Resaltar reglas de celdas}} → {{Es mayor que…}}', 'Si cambias un dato y ahora supera el valor, el color de la celda: {{Cambia solo, automáticamente}}'] },
    },
    {
      id: 'c3-lec-5', tipo: 'lectura', titulo: 'Gráficos',
      bloques: [
        { md: '1. Selecciona los datos (con sus encabezados).\n2. **Insertar** → elige el tipo de gráfico (**Columnas**, **Circular**, **Líneas**).\n3. Ponle un **título** y revisa que los ejes se entiendan.' },
        f('c3_grafico', '3.5', 'Gráfico de columnas del total vendido por vendedor.', ['**Botón Columnas** (pestaña Insertar).', '**Datos** que alimentan el gráfico.', '**Título** del gráfico.', '**Área del gráfico**.']),
      ],
    },
    {
      id: 'c3-act-e', tipo: 'actividad', titulo: '¿Qué gráfico uso?', sub: 'Actividad 3.E',
      act: { k: 'une', izq: ['Columnas', 'Circular', 'Líneas'], der: ['Mostrar la evolución en el tiempo', 'Comparar categorías (ventas por vendedor)', 'Mostrar las partes de un total (porcentajes)'], correcta: [1, 2, 0] },
    },
    { id: 'c3-lab', tipo: 'lab', titulo: 'Laboratorio: ordena, filtra, resalta y grafica' },
    {
      id: 'c3-lec-6', tipo: 'lectura', titulo: 'Desafío: BUSCARV',
      bloques: [
        { md: 'La función **BUSCARV** busca un dato en la primera columna de una tabla y devuelve otro dato de la misma fila.\n\n> [[=BUSCARV(valor_buscado; tabla; número_de_columna; FALSO)]]' },
        f('c3_buscarv', '3.6', 'Se busca el producto de A2 en la tabla verde y se trae su precio.', ['**Barra de fórmulas** con BUSCARV.', '**Valor buscado:** el producto (A2).', '**Tabla** donde se busca (F2:H5).']),
      ],
    },
    {
      id: 'c3-act-f', tipo: 'actividad', titulo: 'Partes de BUSCARV', sub: 'Actividad 3.F',
      act: { k: 'cloze', intro: 'En [[=BUSCARV(A2;F2:H5;3;FALSO)]], completa.', banco: ['buscado', 'tabla', 'columna', 'exacta', 'aproximada'], items: ['A2 es el valor {{buscado}}.', 'F2:H5 es la {{tabla}} donde se busca.', 'El número 3 indica la {{columna}} de la tabla que se devuelve (aquí, el precio).', 'FALSO pide una coincidencia {{exacta}}.'] },
    },
    {
      id: 'c3-reto-5', tipo: 'reto', titulo: 'Reto final: precios con BUSCARV',
      reto: {
        md: 'La tabla verde (F:H) es la lista de precios. Trae el precio de cada producto con **BUSCARV** y calcula el total.\n\n1. **C2:** [[=BUSCARV(A2;$F$2:$H$7;3;FALSO)]]. Arrastra hasta C6.\n2. **D2:** [[=B2*C2]]. Arrastra hasta D6.',
        planilla: { titulo: 'Clase3_buscarv', hoja: 'Hoja1', cols: 9, filas: 9, anchos: [100, 80, 110, 120, 30, 100, 100, 100, 30], celdas: planillaBuscarv(), cinta: true },
        checks: [
          columnaFormula('pre', 'Precios de los 5 productos con BUSCARV', 'C', 2, [60000, 3500000, 120000, 900000, 50000], 'Fija la tabla con $: $F$2:$H$7, y usa FALSO al final.', /BUSCARV/i),
          columnaFormula('tot', 'Total de cada fila', 'D', 2, [300000, 3500000, 360000, 1800000, 500000], 'D2: =B2*C2'),
        ],
      },
    },
    {
      id: 'c3-act-g', tipo: 'actividad', titulo: 'Ejercicio integrador', sub: 'Actividad 3.G',
      act: {
        k: 'predice', intro: 'Con la hoja de notas de la clase 2, escribe lo que usarías.',
        items: [
          { q: 'Fórmula para mostrar la situación del alumno en la fila 4 (promedio en F4)', r: ['=SI(F4>=60;"Aprobado";"Reprobado")'] },
          { q: 'Fórmula para contar los aprobados (situación en G4:G11)', r: ['=CONTAR.SI(G4:G11;"Aprobado")'] },
          { q: '¿Qué tipo de gráfico muestra la proporción de aprobados y reprobados?', r: ['circular', 'grafico circular', 'gráfico circular'] },
        ],
      },
    },
    { id: 'c3-reflex', tipo: 'actividad', titulo: 'Reflexión final', sub: 'Cierre del curso', act: { k: 'reflexion', pregunta: '¿Para qué podrías usar Excel en tu casa o en un trabajo? Cuéntanos tu idea.' } },
  ],
};
