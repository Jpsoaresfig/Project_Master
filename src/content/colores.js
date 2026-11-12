/* Textos y datos de la página /colors. Los hex son los de styles/tokens.css: si cambias uno allí, cámbialo aquí. */

export const PRINCIPALES = [
  {
    id: 'crema',
    nombre: 'Crema',
    hex: '#F7F3EA',
    token: '--c-crema',
    grupo: 'Base',
    uso: 'Fondo, papel de las fichas y texto sobre colores oscuros.',
    porque:
      'Recuerda a la propia crema de cacahuete y al papel de un cuaderno de viaje. Es más acogedor que el blanco puro y deja que las fotos respiren.',
  },
  {
    id: 'tinta',
    nombre: 'Tinta',
    hex: '#2E2A1F',
    token: '--c-tinta',
    grupo: 'Base',
    uso: 'Texto principal y barra de ruta.',
    porque:
      'Un negro cálido, como la tinta de imprenta. Sobre crema da un contraste de 12,9:1 sin la dureza del negro puro, que chocaría con la base.',
  },
  {
    id: 'oliva-osc',
    nombre: 'Oliva oscuro',
    hex: '#3F4322',
    token: '--c-oliva-osc',
    grupo: 'Base',
    uso: 'Fichas de Inicio, VIP y Final; títulos.',
    porque:
      'Naturaleza y elegancia a la vez. Da peso a las fichas sin enfriar la página, y sobre él la crema se lee perfectamente.',
  },
  {
    id: 'oliva',
    nombre: 'Oliva',
    hex: '#A3A56A',
    token: '--c-oliva',
    grupo: 'Base',
    uso: 'Filetes, detalles y segunda hebra del remolino.',
    porque: 'Hace de puente entre la crema y el oliva oscuro: une la familia de tonos tierra.',
  },
  {
    id: 'cacahuete',
    nombre: 'Cacahuete',
    hex: '#B07A3E',
    token: '--c-cacahuete',
    grupo: 'Casa',
    uso: 'Destino Casa y sabor Tradicional.',
    porque:
      'Es el color del producto. Calor, desayuno y «el sabor de siempre»: el origen del viaje tenía que oler a cacahuete tostado.',
  },
  {
    id: 'pitaya',
    nombre: 'Pitaya',
    hex: '#C2185B',
    token: '--c-pitaya',
    grupo: 'Ubud',
    uso: 'Ficha de Ubud, sellos y foco.',
    porque:
      'El magenta de la pulpa de la fruta del dragón. Es el acento más intenso de la marca: energía tropical y la primera sorpresa del viaje.',
  },
  {
    id: 'rosa',
    nombre: 'Rosa',
    hex: '#F06A9E',
    token: '--c-rosa',
    grupo: 'Ubud',
    uso: 'Pétalos, remolinos y detalles.',
    porque:
      'Una pitaya más ligera, para la calma de Ubud: descanso y reconexión. Suaviza el magenta sin salir de la familia.',
  },
  {
    id: 'verde',
    nombre: 'Verde',
    hex: '#6E8C4A',
    token: '--c-verde',
    grupo: 'Ubud y Atacama',
    uso: 'Hojas, frondas y cactus.',
    porque:
      'El verde de las terrazas de arroz y del cactus del desierto. Une los dos destinos exóticos con la naturaleza.',
  },
  {
    id: 'flor',
    nombre: 'Flor',
    hex: '#8E5FA6',
    token: '--c-flor',
    grupo: 'Atacama',
    uso: 'Destino Atacama y remolino de la noche.',
    porque:
      'El lila de la flor del nopal: «hasta en el desierto florece algo inesperado». Brilla sobre el cielo nocturno sin competir con el fuego.',
  },
];

export const APOYO = [
  { nombre: 'Mantequilla', hex: '#EFDCB4', token: '--c-mantequilla', porque: 'Papel de Casa: cacahuete muy aclarado, más cálido que la crema.' },
  { nombre: 'Tostado', hex: '#70451A', token: '--c-tostado', porque: 'Cacahuete oscurecido para poder usarlo como texto sobre mantequilla y crema.' },
  { nombre: 'Oliva claro', hex: '#D8DAB0', token: '--c-oliva-clara', porque: 'Texto secundario legible sobre oliva oscuro.' },
  { nombre: 'Pitaya oscura', hex: '#8A0F40', token: '--c-pitaya-osc', porque: 'Pitaya sobre crema en los botones invertidos.' },
  { nombre: 'Rosa pálido', hex: '#FCE3EC', token: '--c-rosa-pale', porque: 'Texto secundario sobre la ficha de pitaya.' },
  { nombre: 'Noche', hex: '#0D0F1E', token: '--c-noche', porque: 'Cielo de Atacama, tomado de las capas fotográficas.' },
  { nombre: 'Flor clara', hex: '#D2BBE3', token: '--c-flor-clara', porque: 'El lila convertido en texto legible sobre la noche.' },
  { nombre: 'Ascua', hex: '#F2A23A', token: '--c-ascua', porque: 'Fuego. Solo como luz o partícula, nunca como texto pequeño.' },
  { nombre: 'Llama', hex: '#FFD27A', token: '--c-llama', porque: 'El corazón de la fogata.' },
  { nombre: 'Oro', hex: '#F2C94C', token: '--c-oro', porque: 'Exclusivo del cacahuete dorado de la Web F: se reconoce como premio.' },
  { nombre: 'Pared', hex: '#A59C64', token: '--c-pared', porque: 'La pared de las fotos de producto, para que el carrusel parezca el mismo lugar.' },
  { nombre: 'Madera', hex: '#6B4E37', token: '--c-madera', porque: 'La balda, tomada de la mesa de las fotos.' },
];

export const TEMAS = [
  {
    tema: 'inicio',
    nombre: 'Inicio',
    clima: 'Neutro y elegante',
    porque: 'La pared de las fotos de producto y una ficha oliva. Un toque de rosa adelanta lo exótico del viaje.',
  },
  {
    tema: 'casa',
    nombre: 'Casa',
    clima: 'Cálido',
    porque: 'Todo en tonos de cacahuete, como la luz de una mañana en casa. Familiaridad y origen.',
  },
  {
    tema: 'ubud',
    nombre: 'Ubud',
    clima: 'Luminoso y rosa',
    porque: 'La ficha entera en pitaya, sin blanco: la exuberancia tropical de la selva de Bali.',
  },
  {
    tema: 'atacama',
    nombre: 'Atacama',
    clima: 'Oscuro',
    porque: 'Cielo de noche y luz cálida de la fogata. La flor lila es la sorpresa bajo las estrellas.',
  },
  {
    tema: 'vip',
    nombre: 'Remolino perfecto',
    clima: 'Cuaderno abierto',
    porque: 'Página crema con ficha oliva y los acentos de pitaya y verde: los ingredientes del juego.',
  },
  {
    tema: 'final',
    nombre: 'De vuelta a casa',
    clima: 'Reencuentro',
    porque: 'Vuelve a la pared de Inicio con los acentos de los tres destinos: «vuelves distinto, con el mundo dentro».',
  },
];


/* Tipografía. Valores de styles/tokens.css y DESIGN.md §3: si cambian allí, cámbialos aquí. */
export const FAMILIAS = [
  {
    id: 'fraunces',
    nombre: 'Fraunces',
    clase: 'col-fam--fraunces',
    tipo: 'Serifa variable · ejes de peso, tamaño óptico, SOFT y WONK',
    uso: 'Títulos, citas de cada destino, coordenadas, gramos y notas a mano.',
    porque: [
      'Es una serifa de estilo antiguo, cálida y con carácter: recuerda a los rótulos impresos de un cuaderno de viaje y a las etiquetas de los frascos.',
      'Su eje SOFT redondea los remates hasta hacerlos «cremosos», como el producto. El eje WONK inclina algunas letras y les da un aire hecho a mano.',
      'Al ser variable, cada destino le cambia el peso, la suavidad y la inclinación sin cargar otra fuente: las letras también viajan.',
    ],
  },
  {
    id: 'instrument',
    nombre: 'Instrument Sans',
    clase: 'col-fam--instrument',
    tipo: 'Sans serif variable · ejes de peso y anchura',
    uso: 'Texto corrido, botones, etiquetas de la ruta y controles.',
    porque: [
      'Una sans serif neutra y muy legible: hace de contrapunto tranquilo a Fraunces, que es la que tiene la personalidad.',
      'Su eje de anchura permite estrecharla al 78 % en las etiquetas en mayúsculas, como el texto de un sello o de un billete de tren.',
      'Funciona bien en tamaños pequeños de móvil, donde va casi toda la información práctica.',
    ],
  },
];

export const ROLES_TIPO = [
  { rol: 'Títulos (H1 y portada)', letra: 'Fraunces, con el clima del destino', clase: 'col-rol--titulo', muestra: 'Un viaje en cada cucharada' },
  { rol: 'Cita del destino', letra: 'Fraunces cursiva, blanda y torcida', clase: 'col-rol--cita', muestra: '«Te detienes, respiras y vuelves a conectar»' },
  { rol: 'Texto corrido', letra: 'Instrument Sans 400', clase: 'col-rol--cuerpo', muestra: 'Crema de cacahuete y pitaya rosa, la fruta del dragón.' },
  { rol: 'Etiquetas y ruta', letra: 'Instrument Sans 600, estrecha y en mayúsculas', clase: 'col-rol--etiqueta', muestra: 'Etapa 02 · Modo Selva' },
  { rol: 'Coordenadas y gramos', letra: 'Fraunces, ejes de dato', clase: 'col-rol--dato', muestra: '8°30′S 115°16′E · 300 g' },
];

/* Lo que cada tema le hace a Fraunces (--f-peso, --f-soft, --f-wonk, --f-estilo). */
export const CLIMAS_TIPO = [
  { tema: 'inicio', nombre: 'Inicio', ejes: 'Peso 380 · SOFT 60 · WONK 1', porque: 'Ligera y algo torcida: una bienvenida amable antes de elegir.' },
  { tema: 'casa', nombre: 'Casa', ejes: 'Peso 640 · SOFT 100', porque: 'Cremosa, llena y redonda, como una cucharada de crema de cacahuete.' },
  { tema: 'ubud', nombre: 'Ubud', ejes: 'Peso 330 · SOFT 70 · WONK 1 · cursiva', porque: 'Húmeda, inclinada y ligera: el ritmo lento de la selva.' },
  { tema: 'atacama', nombre: 'Atacama', ejes: 'Peso 210 → 440 · SOFT 0 → 100 · WONK 1', porque: 'Seca, afilada y finísima con la fogata apagada. El fuego la engorda y la ablanda.', fogata: true },
  { tema: 'vip', nombre: 'Remolino perfecto', ejes: 'Peso 500 · SOFT 100 · WONK 1 · cursiva', porque: 'La letra de un cuaderno abierto, escrita a mano.' },
  { tema: 'final', nombre: 'De vuelta a casa', ejes: 'Peso 300 · SOFT 100 · WONK 1', porque: 'Fina y suave: la calma de volver, con el mundo dentro.' },
];

export const DETALLES_TIPO = [
  'Las dos fuentes van autoalojadas (@fontsource-variable) y solo con el subconjunto latino: es todo lo que usa la web en español y ahorra unos 460 KB.',
  'Las coordenadas van siempre en Fraunces, porque Instrument Sans no tiene el signo de minuto ′.',
  'Al cambiar de destino, los ejes de Fraunces se interpolan durante la transición de remolino: el título se transforma en lugar de saltar.',
  'Con un peso inferior a 300, el tamaño mínimo es de 48 px, para que los trazos finos se sigan leyendo.',
];

/* ---------- Identidad: idea, pilares y rasgos (BRIEF.md y DESIGN.md §1) ---------- */
export const IDEA =
  'Una libreta teñida por cada destino. No hay un fondo crema con adornos: cada pantalla es un pliego de papel distinto, y la crema de cacahuete, la pitaya y la noche son el papel.';

export const PILARES = [
  { titulo: 'Paisajes reales', texto: 'El frasco vive en su destino: una mesa de desayuno, las terrazas de Ubud, el desierto de noche. Vende el viaje, no solo el producto.' },
  { titulo: 'Luz y texturas naturales', texto: 'Madera, lino, cerámica y fruta cortada. Texturas de grano, veta y revoco que dan tacto al papel y a la pared.' },
  { titulo: 'Ilustración botánica', texto: 'Grabados de cuaderno de viaje: cacahuete, pitaya, hoja y flor del nopal, con trazo fino de tinta.' },
  { titulo: 'El remolino', texto: 'La firma visual de la marca. Está en el logotipo, en las transiciones, en el minijuego y en los sellos.' },
];

export const RASGOS = [
  { titulo: 'El folio', texto: 'El tercio de texto es la hoja del cuaderno, y cambia de material en cada destino: papel mantequilla en Casa, papel teñido de pitaya en Ubud, solo aire de noche en Atacama.' },
  { titulo: 'El clima tipográfico', texto: 'La misma Fraunces cambia con el lugar: gruesa y blanda en Casa, cursiva en Ubud, un hilo afilado en Atacama.' },
  { titulo: 'La mancha desajustada', texto: 'Cada grabado lleva una mancha plana de color desplazada unos píxeles, como una impresión a dos tintas mal registrada.' },
  { titulo: 'Solo el remolino es curvo', texto: 'Todo lo demás es recto, con filete fino y papel. Así el remolino destaca siempre.' },
];

/* ---------- Ilustraciones ---------- */
export const ILUSTRACIONES = [
  { id: 'cacahuete', nombre: 'Cacahuete', tema: 'casa', uso: 'Casa y Web F' },
  { id: 'pitaya', nombre: 'Pitaya', tema: 'ubud', uso: 'Ubud y Web F' },
  { id: 'hoja', nombre: 'Hoja', tema: 'ubud', uso: 'Ubud y Web F' },
  { id: 'flor-nopal', nombre: 'Flor del nopal', tema: 'atacama', uso: 'Atacama, Web F y minijuego' },
  { id: 'brujula', nombre: 'Brújula', tema: 'vip', uso: 'Minijuego: el ingrediente que no va' },
];

/* ---------- Texturas ---------- */
export const TEXTURAS = [
  { id: 'grano', nombre: 'Grano', token: '--grano', uso: 'Folio de Casa, página del minijuego, Web F y la pared de Inicio.', porque: 'Un ruido fino de papel impreso: quita el aspecto de pantalla plana.' },
  { id: 'veta', nombre: 'Veta', token: '--veta', uso: 'La balda de madera de Inicio y Final.', porque: 'La madera de las fotos de producto, para que los frascos se apoyen en algo real.' },
  { id: 'revoco', nombre: 'Revoco', token: '--revoco', uso: 'La pared de Inicio y Final.', porque: 'La pared encalada de las fotos: los frascos parecen estar en el mismo lugar.' },
];

/* ---------- Movimiento (DESIGN.md §6) ---------- */
export const MOVIMIENTOS = [
  { id: 'salida', nombre: 'Entrar y frenar', curva: '--m-salida', duracion: '280 ms', porque: 'Los elementos llegan rápido y se posan con suavidad.' },
  { id: 'giro', nombre: 'Remolino', curva: '--m-giro', duracion: '700 ms', porque: 'Arranque y frenada lentos, como remover una cuchara.' },
  { id: 'cuchara', nombre: 'Soltar', curva: '--m-cuchara', duracion: '520 ms', porque: 'Un rebote corto al dejar algo, como la cuchara en el cuenco.' },
  { id: 'sello', nombre: 'Sello que cae', curva: '--m-sello', duracion: '180 ms', porque: 'Golpe seco, sin rebote: un matasellos de verdad.' },
  { id: 'marea', nombre: 'Vaivén', curva: '--m-marea', duracion: '2,4 s', porque: 'Pulso continuo y tranquilo para los puntos interactivos.' },
];

/* ---------- Reglas (DESIGN.md §9) ---------- */
export const REGLAS = [
  'Rosa, verde, flor y cacahuete nunca van como texto pequeño sobre claro: para eso existen sus versiones oscuras o claras.',
  'Nunca texto directo sobre foto ni sobre las estrellas: siempre hay una ficha o un velo debajo.',
  'Todos los pares de texto y fondo cumplen AA (4,5:1).',
  'Sin esquinas redondeadas en tarjetas, botones ni fotos: solo los puntos, los círculos de la ruta y el remolino son curvos.',
  'Sin sombras difusas, degradados morados genéricos, emojis ni terracota.',
  'Solo se animan la posición, la opacidad, los trazos y los ejes de la letra, y como mucho una animación continua por zona.',
  'Con «Reducir movimiento», todo se detiene y el estado final se ve igual.',
];
