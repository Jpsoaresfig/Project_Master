/* Textos de la página /storyboard. Los cambios salen de content/documentacion.md §13:
   si cambias uno allí, cámbialo aquí. */
import lamina from '../assets/bocetos/0-storyboard-completo.webp';
import bocetoInicio from '../assets/bocetos/1-index.webp';
import bocetoCasa from '../assets/bocetos/2-web1.webp';
import bocetoUbud from '../assets/bocetos/3-web2.webp';
import bocetoAtacama from '../assets/bocetos/4-web3.webp';
import bocetoVip from '../assets/bocetos/5-vip.webp';
import bocetoWebF from '../assets/bocetos/6-webf.webp';
import bocetoFinal from '../assets/bocetos/7-final.webp';

export const LAMINA = {
  src: lamina,
  ancho: 2000,
  alto: 1365,
  alt: 'Lámina completa del storyboard: siete pantallas unidas por flechas que indican el flujo del usuario',
};

/* `zona`: posición de la pantalla en la lámina, en % (izquierda, arriba, ancho, alto). */
export const PANTALLAS = [
  {
    id: 'inicio',
    marca: 'Inicio',
    nombre: 'Página principal',
    ruta: '/',
    boceto: bocetoInicio,
    zona: [27.3, 14.5, 21, 19.3],
    papel: 'La elección',
    pie: 'Regla de los 2/3, controles A y B y contacto G y H.',
    muestra:
      'Los tres frascos en un carrusel sobre una balda. A la derecha, el folio con el sabor que está de frente, los controles de velocidad A (más lento) y B (más rápido) y los accesos G y H al panel de contacto.',
    interaccion: [
      'El carrusel avanza solo y se puede mover con las flechas.',
      'A y B cambian la velocidad; el cursor encima lo pausa.',
      'Al pulsar un frasco, una animación lleva a su destino.',
    ],
    cambios: [
      'El texto pasa de debajo de la balda al folio lateral, como en el resto de la web.',
      'Cinco velocidades en lugar de dos, también con A y B.',
      'Se añade un botón de pausa: en táctil no hay cursor.',
      'La cabecera pasa a tres pestañas de cuaderno: marca, Contacto y eslogan.',
    ],
  },
  {
    id: 'casa',
    marca: '1',
    nombre: 'Web 1 · Casa',
    ruta: '/casa',
    boceto: bocetoCasa,
    zona: [2.9, 46.3, 21, 19.3],
    papel: 'El origen',
    pie: 'Modo Origen. Parallax y puntos interactivos.',
    muestra:
      'La Crema de Cacahuete Tradicional sobre la mesa del desayuno. El folio presenta el sabor de siempre: 100 % cacahuete natural, con los tamaños de 300 g y 150 g.',
    interaccion: [
      'La escena se mueve en capas con el cursor (parallax).',
      'Tres puntos interactivos: cuchara, cuenco y taza.',
      '«Siguiente destino» lleva a Ubud.',
    ],
    cambios: [
      'En móvil el parallax sigue al dedo, pero se retira del scroll: desde JavaScript temblaba.',
      'El folio añade unas coordenadas en clave de humor: «las de tu mesa».',
    ],
  },
  {
    id: 'ubud',
    marca: '2',
    nombre: 'Web 2 · Ubud',
    ruta: '/ubud',
    boceto: bocetoUbud,
    zona: [27.3, 46.3, 21, 19.3],
    papel: 'La pausa',
    pie: 'Modo Selva. Pétalos y hojas reaccionan al ratón.',
    muestra:
      'El Remolino de Pitaya Rosa junto a una persona en una ventana sobre las terrazas de arroz de Bali. El mensaje es descanso y reconexión: «Te detienes, respiras y vuelves a conectar».',
    interaccion: [
      'Pétalos, hojas y semillas esquivan el cursor o el dedo.',
      'Un remolino rosa y una nota sobre la fruta del dragón.',
      '«Siguiente destino» lleva a Atacama.',
    ],
    cambios: [
      'La pantalla se invierte, con el folio a la izquierda: la persona de la foto mira hacia el texto.',
      'El folio muestra las coordenadas reales de Ubud: 8°30′S 115°16′E.',
    ],
  },
  {
    id: 'atacama',
    marca: '3',
    nombre: 'Web 3 · Atacama',
    ruta: '/atacama',
    boceto: bocetoAtacama,
    zona: [51.7, 46.3, 21, 19.3],
    papel: 'La noche',
    pie: 'Modo Noche. La fogata ilumina el frasco.',
    muestra:
      'El Remolino de Flor de Cactus junto a una fogata, bajo el cielo estrellado del desierto de Atacama. Es la pantalla de la calma: «Hasta en el desierto florece algo inesperado».',
    interaccion: [
      'El cursor aviva la fogata; el clic lanza llamas y chispas.',
      'La luz del fuego alcanza el suelo, el frasco y el texto.',
      'A la segunda avivada aparece el sello con la pista de la sección oculta.',
    ],
    cambios: [
      'La ilustración provisional del fondo se sustituye por capas fotográficas tratadas, con cielo y fogata en Canvas 2D.',
      'El folio muestra las coordenadas reales: 22°55′S 68°12′O.',
    ],
  },
  {
    id: 'final',
    marca: 'Fin',
    nombre: 'De vuelta a casa',
    ruta: '/de-vuelta-a-casa',
    boceto: bocetoFinal,
    zona: [76.1, 46.3, 21, 19.3],
    papel: 'El cierre',
    pie: 'Los tres frascos reunidos y el cierre.',
    muestra:
      'Los tres frascos vuelven a la balda de Inicio, con los sellos de los destinos visitados. El cierre del viaje: «Vuelves distinto, con el mundo dentro».',
    interaccion: [
      'Los frascos llegan uno a uno y caen los sellos.',
      '«Volver a explorar los sabores» devuelve a Inicio y cierra el círculo.',
    ],
    cambios: [
      'El titular sale del folio y va a la pared, en el sitio del de Inicio: el viaje vuelve visualmente al punto de partida.',
    ],
  },
  {
    id: 'vip',
    marca: 'VIP',
    nombre: 'Sección oculta',
    ruta: '/remolino-perfecto',
    boceto: bocetoVip,
    zona: [51.7, 78.1, 21, 19.3],
    papel: 'La recompensa',
    pie: 'Minijuego y pasaporte VIP.',
    muestra:
      'El minijuego «Crea el remolino perfecto», sobre una página de cuaderno. A la izquierda los ingredientes, en el centro el frasco y a la derecha los pasos y el pasaporte VIP bloqueado.',
    interaccion: [
      'Se arrastran cacahuete, pitaya y flor de cactus al frasco; con teclado o en móvil, se elige y se pulsa.',
      'Los elementos incorrectos, como la brújula, rebotan con una pista. No hay derrota.',
      'Al completar, se forma el remolino y se desbloquea el pasaporte.',
    ],
    cambios: [
      'El remolino dibujado sobre un relleno plano pasa a ser crema animada en tiempo real con WebGL, que se vierte y gira.',
      'Se añade un sello de viaje como segundo elemento incorrecto.',
      '«Salir del juego» se ve siempre; en móvil queda fijo sobre la ruta.',
      'El pasaporte es un coleccionable, sin prometer beneficios que el grupo no ha decidido.',
    ],
  },
  {
    id: 'web-f',
    marca: 'F',
    nombre: 'Web F · Capa flotante',
    ruta: null,
    boceto: bocetoWebF,
    zona: [2.9, 14.5, 21, 19.3],
    papel: 'El descubrimiento',
    pie: 'Se abre al pulsar el eslogan. Elementos de los tres sabores.',
    muestra:
      'Una capa que se abre sobre cualquier pantalla al pulsar el eslogan. La página se atenúa y flotan cacahuetes, pétalos, hojas y estrellas: los elementos de los tres sabores.',
    interaccion: [
      'Los elementos esquivan el cursor; algunos dan frases de la marca.',
      'El cacahuete dorado da la pista de la sección oculta.',
      'Se cierra con el botón «Cerrar» o con Esc.',
    ],
    cambios: [
      'Se añade la instrucción «Prueba a tocar lo que flota» y un remolino diminuto en la pestaña del eslogan, para que se sepa que se puede pulsar.',
    ],
  },
];

/* Flechas de la lámina, en el orden en que se leen. */
export const FLECHAS = [
  { desde: 'Inicio', hasta: 'Casa, Ubud o Atacama', como: 'Seleccionar frasco', nota: 'Cada frasco lleva a su destino.' },
  { desde: 'Casa', hasta: 'Ubud', como: 'Siguiente destino', nota: 'El recorrido sugerido sigue el orden de la presentación.' },
  { desde: 'Ubud', hasta: 'Atacama', como: 'Siguiente destino', nota: '' },
  { desde: 'Atacama', hasta: 'De vuelta a casa', como: 'Siguiente destino', nota: 'El viaje se cierra.' },
  { desde: 'De vuelta a casa', hasta: 'Inicio', como: 'Volver a explorar los sabores', nota: 'El recorrido es un círculo.' },
  { desde: 'Cualquier pantalla', hasta: 'Web F', como: 'Eslogan', nota: 'Ida y vuelta: la capa se cierra y deja al usuario donde estaba.' },
  { desde: 'Atacama o Web F', hasta: 'Sección oculta', como: 'Pista de la fogata o del cacahuete dorado', nota: 'Nunca es obligatoria: premia la curiosidad.' },
];

export const COMUNES = [
  {
    titulo: 'Barra de ruta',
    texto: 'Inicio, los tres destinos, el cierre y «Reducir movimiento». Marca dónde está el usuario y qué ha visitado, y lleva a cualquier pantalla.',
  },
  {
    titulo: 'Transición de remolino',
    texto: 'Cada cambio de página pasa por el remolino, la firma visual de la marca. Se puede omitir con un clic.',
  },
  {
    titulo: 'Regla de los 2/3',
    texto: 'Dos tercios de la pantalla para la imagen y un tercio para el texto y los controles, en el folio.',
  },
  {
    titulo: 'Ninguna pantalla sin salida',
    texto: 'Siempre hay un siguiente paso, una vuelta a Inicio o un botón para cerrar.',
  },
];

export const CAMBIOS_GENERALES = [
  { elemento: 'Tecnología', antes: 'Prototipo estático en HTML, CSS y JavaScript', despues: 'Web en React, con Vite y framer-motion', motivo: 'Rutas reales, estado compartido y animación por interpolación.' },
  { elemento: 'Tipografía', antes: 'Una serifa genérica, de maqueta', despues: 'Fraunces en toda la web', motivo: 'Fraunces cambia de grosor y suavidad en cada destino: las letras viajan.' },
  { elemento: 'Cabecera', antes: 'Franja con marca, eslogan y menú', despues: 'Tres pestañas de cuaderno: marca, Contacto y eslogan', motivo: 'La barra de ruta ya cubre los destinos y la imagen gana altura.' },
  { elemento: 'Barra de ruta', antes: 'Píldoras redondeadas', despues: 'Paradas numeradas con matasellos', motivo: 'Solo el remolino es curvo, y el recorrido se lee como un viaje.' },
  { elemento: 'Transición en móvil', antes: 'Espiral que se dibuja a pantalla completa', despues: 'Disco en espiral que gira y crece', motivo: 'Dibujar el trazo repintaba toda la pantalla en cada fotograma.' },
  { elemento: 'Contacto', antes: 'Panel lateral G y H', despues: 'Panel con el correo ficticio, redes «Próximamente» y enlace a la documentación', motivo: 'Datos ficticios facilitados por el grupo.' },
  { elemento: 'Rutas no previstas', antes: 'Sin definir', despues: 'Página 404 de la marca', motivo: 'Una dirección mal escrita no debe romper la experiencia.' },
  { elemento: 'Bocetos', antes: 'Enlace «Storyboard» en la cabecera', despues: 'Solo en la documentación', motivo: 'El menú queda para el viaje.' },
];

export const CRITERIOS = [
  { nombre: 'Claridad', pregunta: '¿Cada pantalla se entiende sin explicación?', respuesta: 'Título, frase y un solo paso principal en cada folio.' },
  { nombre: 'Coherencia del flujo', pregunta: '¿Se puede ir de la entrada al cierre sin bloqueos?', respuesta: 'Recorrido completo probado con ratón, táctil y teclado.' },
  { nombre: 'Efectividad', pregunta: '¿El recorrido transmite el concepto?', respuesta: 'Pendiente de valorar por el grupo: no hay datos de uso reales.' },
];
