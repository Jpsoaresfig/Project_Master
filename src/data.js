/* Contenido único de la web. Ningún texto de marca se escribe fuera de aquí.
   Reglas: BRIEF.md. No inventar nombre, cifras, contactos ni afirmaciones nutricionales. */
import frascoTradicional from './assets/frasco-tradicional.webp';
import frascoPitaya from './assets/frasco-pitaya.webp';
import frascoCactus from './assets/frasco-cactus.webp';

export const MARCA = 'Cuchavia';
export const CONCEPTO = 'Un viaje en cada cucharada';
export const ESLOGAN = 'Atrévete. El mundo cabe en una cucharada';
export const ESLOGAN_A = 'Atrévete.';
export const ESLOGAN_B = 'El mundo cabe en una cucharada';
export const CIERRE = 'Vuelves distinto, con el mundo dentro';
export const TAMANOS = [300, 150];

/* Contacto: marcadores, sin datos inventados. */
export const CONTACTO = [
  { id: 'escribenos', letra: 'G', titulo: 'Escríbenos', valor: 'cuchavia@hotmail.com' },
  { id: 'redes', letra: 'H', titulo: 'Redes sociales', valor: 'Próximamente' },
];

/* Geometría de los recortes: el lienzo incluye fruta, así que nunca se centra por lienzo.
   Se pinta siempre con el componente <Frasco>, que alinea por el eje del frasco.
   - aspecto: ancho / alto del lienzo.
   - eje: centro del frasco, en fracción del ancho del lienzo.
   - altura: alto del frasco, en fracción del alto del lienzo.
   - base: lo que sobra bajo el frasco, en fracción del alto del lienzo.
   - proporcion: ancho / alto del propio frasco. */
export const GEOMETRIA_FRASCO = {
  casa: { aspecto: 540 / 946, eje: 0.496, altura: 0.998, base: 0, proporcion: 0.566 },
  ubud: { aspecto: 1151 / 1314, eje: 0.697, altura: 0.935, base: 0.063, proporcion: 0.566 },
  atacama: { aspecto: 714 / 1028, eje: 0.632, altura: 0.926, base: 0.073, proporcion: 0.544 },
};

/* Los tres sabores, en orden de viaje. */
export const SABORES = [
  {
    id: 'casa',
    ruta: '/casa',
    tema: 'casa',
    etapa: '01',
    modo: 'Modo Origen',
    nombre: 'Crema de Cacahuete Tradicional',
    nombreFolio: 'Tradicional',
    destino: 'Casa',
    destinoLargo: 'Casa',
    etiqueta: 'Destino: Casa',
    coordenadas: null,
    dato: 'Coordenadas: las de tu mesa',
    ingredientes: '100 % cacahuete natural',
    resumen: '100 % cacahuete natural.',
    cita: 'Todo empieza con el sabor de siempre',
    descripcion:
      'Crema de cacahuete elaborada con 100 % cacahuete natural. El origen del viaje: lo conocido y los pequeños momentos.',
    frasco: frascoTradicional,
    frascoAlt: 'Frasco de Crema de Cacahuete Tradicional',
    siguiente: { ruta: '/ubud', etiqueta: 'Siguiente destino' },
    accion: 'Viajar a Casa',
    /* Puntos de la foto, en % de la imagen (DESIGN §5). */
    puntos: [
      { id: 'cuchara', x: 55, y: 51, etiqueta: 'La cuchara', nota: 'La primera cucharada del viaje.' },
      { id: 'cuenco', x: 66, y: 66, etiqueta: 'El cuenco', nota: 'Un desayuno como los de siempre.' },
      { id: 'taza', x: 5, y: 40, etiqueta: 'La taza', nota: 'Los pequeños momentos también son un destino.' },
    ],
  },
  {
    id: 'ubud',
    ruta: '/ubud',
    tema: 'ubud',
    etapa: '02',
    modo: 'Modo Selva',
    nombre: 'Remolino de Pitaya Rosa',
    nombreFolio: 'Remolino de Pitaya Rosa',
    destino: 'Ubud',
    destinoLargo: 'Ubud, Bali',
    etiqueta: 'Destino: Ubud, Bali',
    coordenadas: '8°30′S 115°16′E',
    dato: '8°30′S 115°16′E · Ubud, Bali',
    ingredientes: 'Cacahuete y pitaya rosa (fruta del dragón)',
    resumen: 'Cacahuete y pitaya rosa (fruta del dragón).',
    cita: 'Te detienes, respiras y vuelves a conectar',
    descripcion:
      'Crema de cacahuete y pitaya rosa, la fruta del dragón. Descanso, frescura y reconexión.',
    frasco: frascoPitaya,
    frascoAlt: 'Frasco de Remolino de Pitaya Rosa',
    siguiente: { ruta: '/atacama', etiqueta: 'Siguiente destino' },
    accion: 'Viajar a Ubud',
    notas: {
      frasco: 'Cacahuete y pitaya rosa, en un mismo remolino.',
      fruta: 'Cuaderno de viaje: la pulpa de la pitaya rosa colorea el remolino.',
    },
  },
  {
    id: 'atacama',
    ruta: '/atacama',
    tema: 'atacama',
    etapa: '03',
    modo: 'Modo Noche',
    nombre: 'Remolino de Flor de Cactus',
    nombreFolio: 'Remolino de Flor de Cactus',
    destino: 'Atacama',
    destinoLargo: 'Desierto de Atacama, Chile',
    etiqueta: 'Destino: Desierto de Atacama, Chile',
    coordenadas: '22°55′S 68°12′O',
    dato: '22°55′S 68°12′O · Desierto de Atacama, Chile',
    ingredientes: 'Cacahuete y flor de cactus/nopal',
    resumen: 'Cacahuete y flor de cactus/nopal.',
    cita: 'Hasta en el desierto florece algo inesperado',
    descripcion:
      'Crema de cacahuete y flor de cactus/nopal. Calma, naturaleza y noches estrelladas.',
    frasco: frascoCactus,
    frascoAlt: 'Frasco de Remolino de Flor de Cactus',
    siguiente: { ruta: '/de-vuelta-a-casa', etiqueta: 'De vuelta a casa' },
    accion: 'Viajar a Atacama',
    notas: {
      chispas: 'Entre las chispas ha aparecido un sello.',
      pista: 'Sigue la pista',
      fogata: 'Pulsa la fogata para avivarla',
    },
  },
];

export const saborPorId = (id) => SABORES.find((s) => s.id === id);

/* Barra de ruta. `id` coincide con la clave de `visitados` en state.jsx. */
export const PARADAS = [
  { id: 'casa', ruta: '/casa', etiqueta: 'Casa', numero: '1' },
  { id: 'ubud', ruta: '/ubud', etiqueta: 'Ubud', numero: '2' },
  { id: 'atacama', ruta: '/atacama', etiqueta: 'Atacama', numero: '3' },
  { id: 'final', ruta: '/de-vuelta-a-casa', etiqueta: 'De vuelta a casa', numero: '4' },
];
export const RUTA_VIP = '/remolino-perfecto';

/* Tema y título de cada ruta. `tema: null` deja :root (documentación). */
const META = {
  '/': {
    tema: 'inicio',
    titulo: CONCEPTO,
    descripcion:
      'Crema de cacahuete con frutas exóticas en tres sabores y tres destinos: Casa, Ubud y el Desierto de Atacama. Un viaje en cada cucharada.',
  },
  '/casa': {
    tema: 'casa',
    titulo: `Casa · ${CONCEPTO}`,
    descripcion:
      'Crema de Cacahuete Tradicional, con 100 % cacahuete natural. El origen del viaje: todo empieza con el sabor de siempre.',
  },
  '/ubud': {
    tema: 'ubud',
    titulo: `Ubud · ${CONCEPTO}`,
    descripcion:
      'Remolino de Pitaya Rosa: cacahuete y pitaya rosa (fruta del dragón). Un viaje a Ubud, Bali, para detenerse, respirar y volver a conectar.',
  },
  '/atacama': {
    tema: 'atacama',
    titulo: `Atacama · ${CONCEPTO}`,
    descripcion:
      'Remolino de Flor de Cactus: cacahuete y flor de cactus/nopal. Un viaje al Desierto de Atacama, Chile: calma, naturaleza y noches estrelladas.',
  },
  '/remolino-perfecto': {
    tema: 'vip',
    titulo: `Remolino perfecto · ${CONCEPTO}`,
    descripcion: 'Sección oculta: reúne los ingredientes, crea el remolino perfecto y desbloquea tu pasaporte.',
  },
  '/de-vuelta-a-casa': {
    tema: 'final',
    titulo: `De vuelta a casa · ${CONCEPTO}`,
    descripcion: `${CIERRE}. Tres sabores y tres destinos, juntos de nuevo en la balda.`,
  },
  '/documentation': {
    tema: null,
    titulo: `Documentación · ${CONCEPTO}`,
    descripcion: 'Memoria del proyecto: proceso, decisiones técnicas y cambios respecto al storyboard.',
  },
  '/colors': {
    tema: null,
    titulo: `Colores · ${CONCEPTO}`,
    descripcion: 'La paleta de Cuchavia: qué color usa cada destino y por qué se eligió.',
  },
  '/storyboard': {
    tema: null,
    titulo: `Storyboard · ${CONCEPTO}`,
    descripcion: 'El storyboard del viaje explicado pantalla a pantalla, con lo que cambió en la versión final.',
  },
};
const ALIAS = {
  '/index.html': '/',
  '/colores': '/colors',
  '/documentacion': '/documentation',
  '/documentacion.html': '/documentation',
};
const NO_ENCONTRADA = {
  tema: 'inicio',
  titulo: `Fuera del mapa · ${CONCEPTO}`,
  descripcion: META['/'].descripcion,
};

export function normalizarRuta(pathname) {
  const minuscula = pathname.toLowerCase();
  const limpio = minuscula.length > 1 ? minuscula.replace(/\/+$/, '') || '/' : minuscula;
  return ALIAS[limpio] || limpio;
}
export const metaDeRuta = (pathname) => META[normalizarRuta(pathname)] || NO_ENCONTRADA;

/* Web F: textos del prototipo. */
export const FRASES_F = {
  casa: 'Todo empieza con el sabor de siempre.',
  ubud: 'Te detienes, respiras y vuelves a conectar.',
  atacama: 'Hasta en el desierto florece algo inesperado.',
  oro: 'Algo brilla en el camino: has encontrado una pista.',
};
export const AVISO_VIP =
  'Aquí se esconde algo. Aviva la fogata de Atacama o busca entre los elementos flotantes.';
