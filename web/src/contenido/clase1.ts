import type { CeldaDef, ClaseDef } from './tipos';
import { chk, esNum, esTexto, rango } from './ayudas';
import { gastos } from './datos';

const f = (nombre: string, num: string, pie: string, leyenda: string[]) => ({ fig: { nombre, num, pie, leyenda } });

const celdasReto1: Record<string, CeldaDef> = {};

export const clase1: ClaseDef = {
  n: 1,
  titulo: 'Conociendo Excel y armando una tabla',
  resumen: 'Partes de la pantalla, celdas y rangos, tipos de datos y formato.',
  objetivos: ['Nombrar las partes de la pantalla de Excel', 'Moverte, seleccionar y escribir datos en las celdas', 'Darle formato a una tabla y guardarla'],
  color: '#217346',
  pasos: [
    {
      id: 'c1-lec-1', tipo: 'lectura', titulo: '¿Qué es Excel?',
      bloques: [
        { md: '**Excel** es una **hoja de cálculo**: un programa que organiza datos en **filas** y **columnas** y permite hacer cálculos con ellos. Se usa para llevar gastos, notas, inventarios, ventas y presupuestos. Lo bueno de Excel es que, si un dato cambia, los resultados se actualizan solos.\n\n| Término | ¿Qué es? | Ejemplo |\n|---|---|---|\n| **Libro** | El archivo de Excel completo (extensión .xlsx) | Clase1_gastos.xlsx |\n| **Hoja** | Cada página del libro; se ven como pestañas abajo | Gastos, Hoja2 |\n| **Columna** | Línea vertical identificada con una letra | A, B, C… |\n| **Fila** | Línea horizontal identificada con un número | 1, 2, 3… |\n| **Celda** | Cruce de una columna con una fila; ahí se escribe | B3 |\n| **Rango** | Grupo de celdas seguidas | A1:C5 |' },
        { md: '### La pantalla de Excel\nToca cada número rojo para ver qué parte de la pantalla señala. Las vas a usar siempre.' },
        f('c1_anatomia', '1.1', 'Pantalla principal de Excel con sus partes numeradas.', [
          '**Cinta de opciones:** botones agrupados en pestañas (Inicio, Insertar, Fórmulas…).',
          '**Cuadro de nombres:** indica qué celda está seleccionada (aquí, B3).',
          '**Barra de fórmulas:** muestra lo que contiene la celda seleccionada.',
          '**Encabezado de columna:** las letras (A, B, C…).',
          '**Encabezado de fila:** los números (1, 2, 3…).',
          '**Celda activa:** la que tiene el borde grueso; es donde escribes.',
          '**Pestañas de hoja:** permiten cambiar de hoja o agregar otra con el botón +.',
          '**Barra de estado:** muestra el estado de Excel («Listo») y el zoom.']),
      ],
    },
    {
      id: 'c1-act-a', tipo: 'actividad', titulo: 'Completa con lo leído', sub: 'Actividad 1.A',
      act: {
        k: 'cloze', intro: 'Con lo leído más arriba, completa cada oración. Elige la palabra correcta del banco.', banco: ['libro', 'hoja', 'celda', 'rango', 'columnas', 'filas', 'letras', 'números', 'abajo', 'cálculo'],
        items: [
          'Excel es una hoja de {{cálculo}} que organiza los datos en {{filas}} y {{columnas}}.',
          'El archivo completo de Excel se llama {{libro}}.',
          'Cada página del libro es una {{hoja}}; sus nombres aparecen como pestañas en la parte de {{abajo}}.',
          'Las columnas se identifican con {{letras}} y las filas con {{números}}.',
          'El cruce de una columna con una fila se llama {{celda}}.',
          'Un grupo de celdas seguidas, como [[A1:C5]], se llama {{rango}}.',
        ],
      },
    },
    {
      id: 'c1-act-b', tipo: 'actividad', titulo: 'Rotula la pantalla', sub: 'Actividad 1.B',
      act: { k: 'rotula', intro: 'Sin mirar la leyenda, elige el nombre de cada parte marcada en la figura.', figura: 'c1_anatomia', nombres: ['Cinta de opciones', 'Cuadro de nombres', 'Barra de fórmulas', 'Encabezado de columna', 'Encabezado de fila', 'Celda activa', 'Pestañas de hoja', 'Barra de estado'] },
    },
    {
      id: 'c1-lec-2', tipo: 'lectura', titulo: 'Moverte y seleccionar',
      bloques: [
        { md: 'Para trabajar en una celda primero hay que **seleccionarla**: haz clic sobre ella. Excel la rodea con un borde grueso y escribe su nombre (por ejemplo **B3**) en el **cuadro de nombres**. Para seleccionar varias celdas a la vez, arrastra el mouse: queda un **rango**, que se nombra con la primera y la última celda separadas por dos puntos (**A3:C6**).' },
        f('c1_celda', '1.2', 'La celda **B3** está seleccionada. Su columna y su fila se resaltan.', ['**Cuadro de nombres:** B3', '**Celda activa** con borde grueso', '**Columna B** resaltada', '**Fila 3** resaltada']),
        f('c1_rango', '1.3', 'El rango **A3:C6** está seleccionado (arrastrando desde A3 hasta C6).', ['**Cuadro de nombres:** muestra el rango', '**Borde** alrededor de todo el rango', '**Celda activa** (la primera, sin sombrear)']),
        { md: '| Acción | Cómo se hace |\n|---|---|\n| Pasar a la celda de la derecha | [[Tab]] |\n| Confirmar lo escrito y bajar | [[Enter]] |\n| Seleccionar un rango | Arrastrar con el mouse, o [[Mayús]] + flechas |\n| Seleccionar toda la hoja | [[Ctrl]] + [[E]] |\n| Editar una celda sin doble clic | [[F2]] |\n| Borrar el contenido | [[Supr]] |\n| Deshacer | [[Ctrl]] + [[Z]] |\n\nLos atajos con letras son los de Excel en español. En Excel en inglés, seleccionar todo es [[Ctrl]]+[[A]].' },
      ],
    },
    {
      id: 'c1-act-c', tipo: 'actividad', titulo: 'Observa y responde', sub: 'Actividad 1.C',
      act: {
        k: 'predice', intro: 'Observa las Figuras 1.2 y 1.3 y escribe tus respuestas.',
        items: [
          { q: 'En la Figura 1.2, ¿qué celda está seleccionada?', r: ['B3'] },
          { q: '¿En qué columna está esa celda? (solo la letra)', r: ['B'] },
          { q: '¿En qué fila está? (solo el número)', r: ['3'] },
          { q: 'En la Figura 1.3, ¿qué rango está seleccionado?', r: ['A3:C6'], pista: 'Es la primera y la última celda, separadas por dos puntos.' },
          { q: '¿Cuántas celdas tiene el rango A3:C6?', r: ['12'], pista: 'Son 3 columnas por 4 filas.' },
          { q: '¿Qué escribirías en el cuadro de nombres para ir a la celda D10?', r: ['D10'] },
        ],
      },
    },
    {
      id: 'c1-act-d', tipo: 'actividad', titulo: 'Une con la tecla correcta', sub: 'Actividad 1.D',
      act: {
        k: 'une', intro: 'Une cada acción con la tecla o combinación que la hace.',
        izq: ['Pasar a la celda de la derecha', 'Confirmar y bajar una celda', 'Editar el contenido de una celda', 'Borrar el contenido seleccionado', 'Deshacer la última acción', 'Seleccionar toda la hoja'],
        der: ['Ctrl + Z', 'F2', 'Enter', 'Supr', 'Ctrl + E', 'Tab'], correcta: [5, 2, 1, 3, 0, 4],
      },
    },
    {
      id: 'c1-lec-3', tipo: 'lectura', titulo: 'Tipos de datos',
      bloques: [
        { md: '- **Texto:** palabras o letras (Alquiler, Ana). Se alinean a la **izquierda** de la celda.\n- **Números:** cantidades con las que se puede calcular (1500000). Se alinean a la **derecha**.\n- **Fechas:** 15/03/2026. Excel las trata como números especiales y también se alinean a la derecha.' },
        f('c1_tipos', '1.4', 'Ejemplos de texto, número y fecha. Observa hacia qué lado se alinea cada uno.', ['**Texto** alineado a la izquierda', '**Números** alineados a la derecha', '**Fechas** alineadas a la derecha', 'Un número que quedó a la **izquierda**: Excel lo está leyendo como texto']),
        { recordar: 'Si un número aparece pegado a la izquierda de la celda, Excel lo entendió como **texto** y no podrás sumarlo. Revisa que no tenga letras, espacios ni símbolos de más.' },
      ],
    },
    {
      id: 'c1-act-e', tipo: 'actividad', titulo: 'Completa y clasifica', sub: 'Actividad 1.E',
      act: { k: 'cloze', intro: 'Completa con lo leído.', banco: ['izquierda', 'derecha', 'texto', 'número', 'fecha'], items: ['Los textos se alinean a la {{izquierda}} y los números a la {{derecha}}.', 'Si un número queda a la {{izquierda}}, Excel lo está leyendo como {{texto}}.'] },
    },
    {
      id: 'c1-act-e2', tipo: 'actividad', titulo: 'Clasifica cada dato', sub: 'Actividad 1.E (parte 2)',
      act: { k: 'clasifica', intro: '¿Excel lo entendería como texto, número o fecha? Pista: «Gs. 150.000» incluye letras y un punto.', categorias: ['Texto', 'Número', 'Fecha'], items: [{ t: 'Alquiler', r: 0 }, { t: '150000', r: 1 }, { t: '25/12/2026', r: 2 }, { t: 'Gs. 150.000', r: 0 }, { t: '3,5', r: 1 }, { t: 'cinco mil', r: 0 }] },
    },
    {
      id: 'c1-lec-4', tipo: 'lectura', titulo: 'Dar formato',
      bloques: [
        { md: 'El **formato** cambia cómo se ve una tabla sin cambiar sus datos. Casi todo está en la pestaña **Inicio**. Primero se **selecciona** lo que se quiere cambiar y después se pulsa el botón.' },
        f('c1_cinta', '1.5', 'Botones más usados de la pestaña Inicio.', ['**Negrita** (N)', '**Color de relleno** (el bote de pintura)', '**Bordes** de las celdas', '**Combinar y centrar**: une varias celdas en una', '**Estilo millares** (000): agrega puntos de miles', '**Alinear** a la izquierda, centro o derecha', '**Aumentar o disminuir decimales**']),
      ],
    },
    {
      id: 'c1-act-f', tipo: 'actividad', titulo: '¿Qué botón uso?', sub: 'Actividad 1.F',
      act: {
        k: 'clasifica', intro: 'Mira la Figura 1.5. Elige el botón que usarías en cada caso.', categorias: ['1 · Negrita', '2 · Relleno', '3 · Bordes', '4 · Combinar y centrar', '5 · Estilo millares'],
        items: [{ t: 'Poner un título en negrita', r: 0 }, { t: 'Pintar el fondo de los encabezados', r: 1 }, { t: 'Dibujar líneas alrededor de las celdas', r: 2 }, { t: 'Unir A1:C1 en una sola celda y centrar el título', r: 3 }, { t: 'Mostrar 1500000 como 1.500.000', r: 4 }],
      },
    },
    {
      id: 'c1-reto-1', tipo: 'reto', titulo: 'Reto: tu primera tabla',
      reto: {
        md: 'Arma la tabla **«Mis gastos del mes»** igual que la Figura 1.8. Hazlo en la planilla de abajo, como en Excel:\n\n1. En **A1** escribe el título.\n2. En **A3:C3** escribe los encabezados.\n3. Desde la fila 4 escribe los 4 gastos de «Datos para copiar». Los montos **sin puntos**.\n4. Selecciona **A3:C3** y ponle **negrita** y **color de relleno**.\n5. Selecciona **C4:C7** y pulsa **Estilo millares** (000).\n6. Selecciona **A3:C7** y aplica **bordes**.\n\nCuando termines, pulsa **Comprobar**.',
        datos: { titulo: 'Datos para copiar', filas: [['Concepto', 'Categoría', 'Monto (Gs.)'], ...gastos.slice(0, 4).map(([a, b, c]) => [a, b, String(c)])] },
        planilla: { titulo: 'Clase1_gastos', hoja: 'Gastos', cols: 5, filas: 11, anchos: [150, 110, 130, 90, 90], celdas: celdasReto1, cinta: true },
        checks: [
          chk('titulo', 'Título «Mis gastos del mes» en A1', (c) => esTexto(c, 'A1', 'Mis gastos del mes')),
          chk('enc', 'Encabezados Concepto, Categoría y Monto en A3:C3', (c) => esTexto(c, 'A3', 'Concepto') && esTexto(c, 'B3', 'Categoría') && (esTexto(c, 'C3', 'Monto (Gs.)', 'Monto', 'Monto Gs.'))),
          chk('conceptos', 'Los 4 conceptos y categorías escritos (A4:B7)', (c) => gastos.slice(0, 4).every(([a, b], i) => esTexto(c, `A${i + 4}`, a) && esTexto(c, `B${i + 4}`, b))),
          chk('montos', 'Los 4 montos escritos como números (C4:C7)', (c) => gastos.slice(0, 4).every(([, , m], i) => esNum(c, `C${i + 4}`, m)), 'Si el número queda a la izquierda, Excel lo leyó como texto: escríbelo sin puntos ni letras.'),
          chk('negrita', 'Encabezados en negrita', (c) => rango('A3:C3').every((r) => c.est(r).b)),
          chk('relleno', 'Encabezados con color de relleno', (c) => rango('A3:C3').every((r) => !!c.est(r).fill)),
          chk('millares', 'Montos con estilo millares (C4:C7)', (c) => rango('C4:C7').every((r) => c.est(r).fmt === 'miles'), 'Selecciona C4:C7 y pulsa el botón 000.'),
          chk('bordes', 'Bordes en toda la tabla (A3:C7)', (c) => rango('A3:C7').every((r) => c.est(r).borde), 'Selecciona A3:C7 y pulsa el botón de bordes.'),
        ],
        pistas: ['Para escribir en una celda, haz clic y empieza a teclear. Enter confirma y baja; Tab confirma y pasa a la derecha.', 'Para seleccionar un rango, arrastra desde la primera celda hasta la última.'],
      },
    },
    {
      id: 'c1-act-g', tipo: 'actividad', titulo: 'Verdadero o falso', sub: 'Actividad 1.G',
      act: {
        k: 'vf', intro: 'Marca si cada afirmación es verdadera o falsa.',
        items: [
          { t: 'Una celda se nombra con su letra de columna y su número de fila, por ejemplo C7.', r: true },
          { t: 'Los números se alinean siempre a la izquierda.', r: false, why: 'Los números se alinean a la derecha; los textos, a la izquierda.' },
          { t: 'El formato cambia los datos de la tabla.', r: false, why: 'El formato solo cambia cómo se ven; los datos siguen siendo los mismos.' },
          { t: 'El cuadro de nombres muestra la celda o el rango seleccionado.', r: true },
        ],
      },
    },
    {
      id: 'c1-act-h', tipo: 'actividad', titulo: 'Mi glosario', sub: 'Actividad 1.H',
      act: {
        k: 'une', intro: 'Une cada término con su definición.', izq: ['Celda', 'Rango', 'Libro', 'Hoja', 'Formato'],
        der: ['Archivo completo de Excel', 'Cambia cómo se ven los datos, no los datos', 'Cruce de una columna con una fila', 'Cada página del libro', 'Grupo de celdas seguidas'], correcta: [2, 4, 0, 3, 1],
      },
    },
    { id: 'c1-reflex', tipo: 'actividad', titulo: 'Lo que aprendí hoy', sub: 'Cierre', act: { k: 'reflexion', pregunta: 'Con tus palabras: ¿qué fue lo más útil que aprendiste en esta clase?' } },
  ],
};
