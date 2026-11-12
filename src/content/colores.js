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

export const REGLAS = [
  'Rosa, verde, flor y cacahuete nunca van como texto pequeño sobre claro: para eso existen sus versiones oscuras o claras.',
  'Nunca texto directo sobre foto ni sobre las estrellas: siempre hay una ficha o un velo debajo.',
  'Todos los pares de texto y fondo cumplen AA (4,5:1).',
  'Paleta cerrada: sin degradados morados genéricos, sin terracota, sin colores sueltos fuera de los tokens.',
];
