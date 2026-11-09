import type { ClaseDef } from './tipos';

// Curso de PowerPoint: misma arquitectura que el de Excel (lecturas con capturas marcadas + actividades por clase).
const f = (nombre: string, num: string, pie: string, leyenda: string[]) => ({ fig: { nombre, num, pie, leyenda } });
const COLOR = '#c43e1c';

export const clase5: ClaseDef = {
  n: 5, etiqueta: 'PowerPoint 1', curso: 'powerpoint',
  titulo: 'Conociendo PowerPoint y armando diapositivas',
  resumen: 'La pantalla de PowerPoint, diapositivas, diseños y cómo escribir un buen texto.',
  objetivos: ['Reconocer las partes de la pantalla', 'Crear diapositivas y elegir su diseño', 'Escribir texto claro y con pocas palabras'],
  color: COLOR,
  pasos: [
    {
      id: 'c5-lec-1', tipo: 'lectura', titulo: 'La pantalla de PowerPoint',
      bloques: [
        { md: '**PowerPoint** sirve para armar **presentaciones**: un conjunto de **diapositivas** que se muestran una tras otra para explicar una idea, un trabajo o un producto.\n\nLa pantalla tiene seis zonas que conviene conocer desde el principio.' },
        f('c5_pantalla', '5.1', 'Pantalla principal de PowerPoint con la primera diapositiva abierta.', ['**Cinta de opciones:** botones agrupados por pestañas (Inicio, Insertar, Diseño…).', '**Panel de miniaturas:** la lista de diapositivas; sirve para moverse y ordenarlas.', '**Diapositiva:** la hoja que estás editando.', '**Marcador de posición:** el cuadro de texto «Haz clic para agregar título».', '**Panel de notas:** lo que dirás al presentar; el público no lo ve.', '**Barra de estado:** número de diapositiva, vistas y zoom.', '**Barra de título:** nombre del archivo y botones de la ventana.']),
        { recordar: 'Todo lo que escribes va dentro de **cuadros** (marcadores de posición). Si no ves un cuadro, la diapositiva no tiene lugar para ese contenido.' },
      ],
    },
    {
      id: 'c5-act-a', tipo: 'actividad', titulo: 'Rotula la pantalla', sub: 'Actividad 5.A',
      act: { k: 'rotula', intro: 'Sin mirar la leyenda, elige el nombre de cada parte marcada en la figura.', figura: 'c5_pantalla', nombres: ['Cinta de opciones', 'Panel de miniaturas', 'Diapositiva', 'Marcador de posición del título', 'Panel de notas', 'Barra de estado', 'Barra de título'] },
    },
    {
      id: 'c5-lec-2', tipo: 'lectura', titulo: 'Nueva diapositiva y diseños',
      bloques: [
        { md: 'Para agregar una diapositiva: **Inicio → Nueva diapositiva**. La flechita ▾ del botón te deja elegir su **diseño**, es decir, qué cuadros trae.\n\nSi ya la creaste y quieres cambiarla, usa **Inicio → Diseño**.' },
        f('c5_disenos', '5.2', 'Galería de diseños disponibles en el tema de Office.', ['**Nueva diapositiva** (con la flecha eliges el diseño).', '**Galería de diseños:** título, título y contenido, dos objetos, comparación…', '**Botón Diseño:** cambia la distribución de una diapositiva ya creada.', '**Barra de estado.**']),
        { md: '| Necesito… | Diseño |\n|---|---|\n| Abrir la presentación | Diapositiva de título |\n| Explicar con una lista | Título y objetos |\n| Comparar dos cosas | Comparación o Dos objetos |\n| Mostrar solo una imagen grande | Solo el título / En blanco |' },
      ],
    },
    {
      id: 'c5-act-b', tipo: 'actividad', titulo: 'Une cada necesidad con su diseño', sub: 'Actividad 5.B',
      act: { k: 'une', intro: 'Une cada situación con el diseño que conviene usar.', izq: ['Portada de la presentación', 'Lista de puntos para explicar', 'Comparar el plan A con el plan B', 'Pegar una foto a pantalla completa'], der: ['Diapositiva de título', 'Título y objetos', 'Comparación', 'En blanco'], correcta: [0, 1, 2, 3] },
    },
    {
      id: 'c5-lec-3', tipo: 'lectura', titulo: 'Escribir bien en una diapositiva',
      bloques: [
        { md: 'Una diapositiva **no es un documento**: acompaña lo que tú dices. Reglas simples:\n\n1. **Una idea por diapositiva.**\n2. **Pocas palabras:** máximo 5 o 6 líneas, y frases cortas.\n3. **Letra grande:** el título desde 32 pt y el texto desde 20 pt.\n4. **Buen contraste:** letra oscura sobre fondo claro, o al revés. Nunca amarillo sobre blanco.\n5. **Máximo 2 tipos de letra** en toda la presentación.' },
        { recordar: 'Si tienes que explicar un texto largo, ponlo en el **panel de notas** y deja en la diapositiva solo las palabras clave.' },
      ],
    },
    {
      id: 'c5-act-c', tipo: 'actividad', titulo: '¿Buena o mala práctica?', sub: 'Actividad 5.C',
      act: {
        k: 'clasifica', intro: 'Clasifica cada hábito.', categorias: ['Buena práctica', 'Mala práctica'],
        items: [
          { t: 'Una sola idea por diapositiva', r: 0 }, { t: 'Copiar un párrafo entero de internet', r: 1 }, { t: 'Letra de 24 pt o más', r: 0 },
          { t: 'Usar cinco tipos de letra distintos', r: 1 }, { t: 'Texto claro sobre fondo oscuro', r: 0 }, { t: 'Texto amarillo sobre fondo blanco', r: 1 },
        ],
      },
    },
    {
      id: 'c5-act-d', tipo: 'actividad', titulo: 'Verdadero o falso', sub: 'Actividad 5.D',
      act: {
        k: 'vf', intro: 'Marca si cada afirmación es verdadera o falsa.',
        items: [
          { t: 'El panel de notas se ve cuando se proyecta la presentación al público.', r: false, why: 'Las notas son solo para quien presenta.' },
          { t: 'Con la flecha del botón Nueva diapositiva se elige su diseño.', r: true },
          { t: 'Es mejor escribir párrafos largos para que el público lea todo.', r: false, why: 'Mejor frases cortas; el detalle lo explicas hablando.' },
          { t: 'Puedes cambiar el diseño de una diapositiva que ya creaste.', r: true, why: 'Inicio → Diseño.' },
        ],
      },
    },
    {
      id: 'c5-act-e', tipo: 'actividad', titulo: 'Completa la ruta', sub: 'Actividad 5.E',
      act: { k: 'cloze', intro: 'Completa las oraciones.', banco: ['Nueva diapositiva', 'Panel de miniaturas', 'Panel de notas', 'Diseño', 'cinta de opciones'], items: ['Para agregar una diapositiva uso Inicio → {{Nueva diapositiva}}.', 'Para moverme entre diapositivas y ordenarlas uso el {{Panel de miniaturas}}.', 'Lo que diré al presentar lo escribo en el {{Panel de notas}}.', 'Para cambiar la distribución de una diapositiva creada uso el botón {{Diseño}}.'] },
    },
    { id: 'c5-reflex', tipo: 'actividad', titulo: 'Reflexión', sub: 'Cierre de la clase', act: { k: 'reflexion', pregunta: 'Piensa en un tema que quieras presentar (un trabajo, un negocio, un viaje). ¿Cuántas diapositivas necesitarías y cuál sería el título de la primera?' } },
  ],
};

export const clase6: ClaseDef = {
  n: 6, etiqueta: 'PowerPoint 2', curso: 'powerpoint',
  titulo: 'Imágenes, formas, tablas y gráficos',
  resumen: 'Cómo enriquecer las diapositivas con contenido visual sin recargarlas.',
  objetivos: ['Usar la pestaña Insertar', 'Elegir entre imagen, forma, SmartArt, tabla y gráfico', 'Mantener un diseño consistente'],
  color: '#d9480f',
  pasos: [
    {
      id: 'c6-lec-1', tipo: 'lectura', titulo: 'La pestaña Insertar',
      bloques: [
        { md: 'Casi todo lo que no es texto se agrega desde **Insertar**. Las opciones están en grupos según lo que quieres meter en la diapositiva.' },
        f('c6_insertar', '6.1', 'Pestaña Insertar de PowerPoint.', ['**Tabla:** ordena datos en filas y columnas.', '**Imágenes:** fotos de tu equipo o de internet.', '**Ilustraciones:** formas, SmartArt y gráficos.', '**Texto:** cuadros de texto, número de diapositiva…', '**Multimedia:** video y audio.']),
        { md: '**Cuándo usar cada cosa**\n\n- **Imagen:** para emocionar o mostrar algo real.\n- **Forma:** flechas, cuadros y círculos para señalar o agrupar.\n- **SmartArt:** procesos, jerarquías y listas con diseño (por ejemplo «paso 1 → paso 2 → paso 3»).\n- **Tabla:** datos exactos que se comparan.\n- **Gráfico:** tendencias y proporciones (columnas, líneas, circular).' },
      ],
    },
    {
      id: 'c6-act-a', tipo: 'actividad', titulo: 'Rotula la pestaña Insertar', sub: 'Actividad 6.A',
      act: { k: 'rotula', intro: 'Elige el grupo de cada parte marcada.', figura: 'c6_insertar', nombres: ['Tablas', 'Imágenes', 'Ilustraciones', 'Texto', 'Multimedia'] },
    },
    {
      id: 'c6-act-b', tipo: 'actividad', titulo: '¿Qué inserto?', sub: 'Actividad 6.B',
      act: { k: 'une', intro: 'Une cada necesidad con lo que conviene insertar.', izq: ['Mostrar cómo crecieron las ventas mes a mes', 'Explicar los 4 pasos de un proceso', 'Comparar precios exactos de tres planes', 'Señalar una parte importante de una foto'], der: ['Gráfico de líneas', 'SmartArt de proceso', 'Tabla', 'Forma (flecha)'], correcta: [0, 1, 2, 3] },
    },
    {
      id: 'c6-lec-2', tipo: 'lectura', titulo: 'Trabajar con imágenes y formas',
      bloques: [
        { md: '1. **Insertar → Imágenes** y elige la foto.\n2. Arrastra las **esquinas** para cambiar el tamaño; así **no se deforma**. Si arrastras los lados, se estira.\n3. Con la imagen seleccionada aparece **Formato de imagen** (recortar, bordes, efectos).\n4. Alinea los objetos con **Formato → Alinear** para que se vean prolijos.\n\nLas **formas** se rellenan y se bordean desde **Formato de forma**. Puedes escribir texto dentro de ellas.' },
        { recordar: 'Para cambiar el tamaño sin deformar: arrastra desde una **esquina**. Mantener **Shift** también conserva la proporción.' },
      ],
    },
    {
      id: 'c6-act-c', tipo: 'actividad', titulo: 'Ordena los pasos', sub: 'Actividad 6.C',
      act: { k: 'ordena', intro: 'Ordena los pasos para agregar una imagen y achicarla sin deformarla.', items: ['Ir a la pestaña Insertar', 'Elegir Imágenes y seleccionar la foto', 'Hacer clic en la imagen para seleccionarla', 'Arrastrar una esquina hacia adentro', 'Soltar cuando tenga el tamaño deseado'] },
    },
    {
      id: 'c6-lec-3', tipo: 'lectura', titulo: 'Un diseño consistente',
      bloques: [
        { md: 'Una presentación profesional se ve **ordenada y repetida**. Para lograrlo:\n\n- Elige un **tema** en la pestaña **Diseño**: aplica colores y tipos de letra a toda la presentación a la vez.\n- Usa los **mismos colores** (máximo 3 o 4) y las **mismas fuentes** en todas las diapositivas.\n- Pon el logo o el número de página en el **Patrón de diapositivas** (**Vista → Patrón de diapositivas**): lo que pones ahí aparece en todas.\n- **Alinea** y deja **márgenes** iguales.' },
      ],
    },
    {
      id: 'c6-act-d', tipo: 'actividad', titulo: 'Verdadero o falso', sub: 'Actividad 6.D',
      act: {
        k: 'vf', intro: 'Marca si cada afirmación es verdadera o falsa.',
        items: [
          { t: 'Arrastrar el lado de una imagen la estira y la deforma.', r: true },
          { t: 'Lo que pones en el Patrón de diapositivas se repite en todas.', r: true },
          { t: 'Conviene usar muchos colores distintos para que sea llamativa.', r: false, why: 'Mejor 3 o 4 colores, siempre los mismos.' },
          { t: 'Un gráfico circular sirve para ver cómo cambia algo a lo largo del tiempo.', r: false, why: 'Para el tiempo se usan líneas o columnas; el circular muestra proporciones.' },
        ],
      },
    },
    {
      id: 'c6-act-e', tipo: 'actividad', titulo: 'Responde', sub: 'Actividad 6.E',
      act: {
        k: 'predice', intro: 'Escribe la respuesta corta.',
        items: [
          { q: '¿Desde qué pestaña se inserta una imagen?', r: ['insertar', 'la pestaña insertar'] },
          { q: '¿Qué tipo de gráfico muestra la proporción de cada parte sobre el total?', r: ['circular', 'grafico circular', 'gráfico circular', 'torta', 'gráfico de torta'] },
          { q: '¿Desde qué pestaña se elige un tema para toda la presentación?', r: ['diseño', 'diseno', 'la pestaña diseño'] },
        ],
      },
    },
    { id: 'c6-reflex', tipo: 'actividad', titulo: 'Reflexión', sub: 'Cierre de la clase', act: { k: 'reflexion', pregunta: 'Elige una diapositiva de tu presentación imaginaria. ¿Qué contenido visual pondrías (imagen, gráfico, tabla, SmartArt) y por qué?' } },
  ],
};

export const clase7: ClaseDef = {
  n: 7, etiqueta: 'PowerPoint 3', curso: 'powerpoint',
  titulo: 'Animaciones, transiciones y presentación final',
  resumen: 'Dar vida a la presentación con moderación, ensayarla y presentarla con seguridad.',
  objetivos: ['Aplicar transiciones y animaciones con criterio', 'Iniciar y controlar la presentación', 'Compartir el archivo en PDF'],
  color: '#9a3412',
  pasos: [
    {
      id: 'c7-lec-1', tipo: 'lectura', titulo: 'Transiciones y animaciones',
      bloques: [
        { md: 'Son dos cosas distintas:\n\n- **Transición:** el efecto al **pasar de una diapositiva a otra** (pestaña **Transiciones**).\n- **Animación:** el efecto con el que **aparece, se mueve o desaparece un objeto** dentro de una diapositiva (pestaña **Animaciones**).\n\nEl **Panel de animación** muestra el orden en que ocurren y permite cambiarlo.' },
        f('c7_animaciones', '7.1', 'Pestaña Animaciones con el Panel de animación abierto.', ['**Galería de efectos:** Aparecer, Desvanecer, Zoom…', '**Panel de animación:** lista y orden de los efectos.', '**Intervalos:** cuándo empieza (al hacer clic o automático) y cuánto dura.', '**Lista de animaciones** de la diapositiva actual.']),
        { recordar: 'Menos es más: **un solo tipo de transición** para toda la presentación y animaciones solo donde ayuden a entender. Si distraen, quítalas.' },
      ],
    },
    {
      id: 'c7-act-a', tipo: 'actividad', titulo: 'Rotula la pestaña', sub: 'Actividad 7.A',
      act: { k: 'rotula', intro: 'Elige el nombre de cada parte marcada.', figura: 'c7_animaciones', nombres: ['Galería de efectos', 'Botón Panel de animación', 'Intervalos (inicio y duración)', 'Panel de animación'] },
    },
    {
      id: 'c7-act-b', tipo: 'actividad', titulo: '¿Transición o animación?', sub: 'Actividad 7.B',
      act: {
        k: 'clasifica', intro: 'Clasifica cada efecto.', categorias: ['Transición', 'Animación'],
        items: [
          { t: 'Desvanecer al cambiar a la diapositiva siguiente', r: 0 }, { t: 'El título entra volando desde la izquierda', r: 1 },
          { t: 'La diapositiva se «desliza» al pasar a la próxima', r: 0 }, { t: 'Cada punto de la lista aparece al hacer clic', r: 1 },
          { t: 'Se aplica desde la pestaña Transiciones', r: 0 }, { t: 'Se aplica desde la pestaña Animaciones', r: 1 },
        ],
      },
    },
    {
      id: 'c7-lec-2', tipo: 'lectura', titulo: 'Presentar y ensayar',
      bloques: [
        { md: 'Desde la pestaña **Presentación con diapositivas**:\n\n- **Desde el principio** (**F5**): empieza en la primera diapositiva.\n- **Desde la diapositiva actual** (**Mayús + F5**): empieza donde estás.\n- **Ensayar intervalos:** mide cuánto tardas en cada diapositiva.\n- **Vista del moderador:** tú ves tus notas y la siguiente diapositiva; el público ve solo la presentación.' },
        f('c7_presentar', '7.2', 'Pestaña Presentación con diapositivas.', ['**Iniciar presentación** (desde el principio o desde la actual).', '**Configurar:** ensayar intervalos y grabar.', '**Monitores:** vista del moderador.', '**Barra de estado:** botón de presentación (▶) abajo a la derecha.']),
        { md: '**Durante la presentación**\n\n- **Flechas** o **clic:** avanzar y retroceder.\n- **Esc:** salir.\n- **B:** pantalla en negro (para captar atención); **B** otra vez vuelve.\n- Habla al público, **no a la pantalla**.' },
      ],
    },
    {
      id: 'c7-act-c', tipo: 'actividad', titulo: 'Atajos de la presentación', sub: 'Actividad 7.C',
      act: { k: 'une', intro: 'Une cada tecla con lo que hace.', izq: ['F5', 'Mayús + F5', 'Esc', 'B'], der: ['Presentar desde el principio', 'Presentar desde la diapositiva actual', 'Salir de la presentación', 'Pantalla en negro'], correcta: [0, 1, 2, 3] },
    },
    {
      id: 'c7-lec-3', tipo: 'lectura', titulo: 'Guardar y compartir',
      bloques: [
        { md: '- **Guardar:** **Ctrl + G** (o **Ctrl + S**). El formato propio es **.pptx**.\n- **Exportar a PDF:** **Archivo → Exportar → Crear documento PDF/XPS**. El PDF se ve igual en cualquier equipo, pero **sin animaciones**.\n- Si presentas en otra computadora, lleva el **.pptx y también el PDF**, por si algo falla.\n- Antes de compartir: revisa la **ortografía** (**Revisar → Ortografía**) y mira todas las diapositivas una vez.' },
      ],
    },
    {
      id: 'c7-act-d', tipo: 'actividad', titulo: 'Ordena el proceso', sub: 'Actividad 7.D',
      act: { k: 'ordena', intro: 'Ordena los pasos de una buena entrega de la presentación.', items: ['Armar las diapositivas con una idea cada una', 'Aplicar un tema y revisar la ortografía', 'Agregar una transición sencilla y animaciones donde ayuden', 'Ensayar con la Vista del moderador y medir el tiempo', 'Guardar el .pptx y exportar una copia en PDF'] },
    },
    {
      id: 'c7-act-e', tipo: 'actividad', titulo: 'Ejercicio integrador', sub: 'Actividad 7.E',
      act: {
        k: 'predice', intro: 'Escribe lo que usarías.',
        items: [
          { q: '¿Qué tecla inicia la presentación desde el principio?', r: ['f5'] },
          { q: '¿En qué pestaña se aplica el efecto al pasar de una diapositiva a otra?', r: ['transiciones', 'la pestaña transiciones'] },
          { q: '¿Qué panel permite ver y reordenar los efectos de una diapositiva?', r: ['panel de animación', 'panel de animacion'] },
          { q: '¿En qué formato exportas la presentación para que se vea igual en cualquier equipo?', r: ['pdf'] },
        ],
      },
    },
    { id: 'c7-reflex', tipo: 'actividad', titulo: 'Reflexión final', sub: 'Cierre del curso de PowerPoint', act: { k: 'reflexion', pregunta: '¿Qué haría que tu próxima presentación sea mejor que las que has visto? Cuéntanos una cosa que vas a aplicar.' } },
  ],
};
