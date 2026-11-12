# Cuchavia · Un viaje en cada cucharada

> Atrévete. El mundo cabe en una cucharada.

Anuncio web interactivo de **Cuchavia**, una marca ficticia de crema de cacahuete con frutas exóticas. Proyecto de la asignatura **Diseño Digital y Publicidad** de la Universidad de Granada (UGR).

La web publicita el producto mediante un recorrido por tres destinos. Cada sabor es un lugar con su propia atmósfera. No es una tienda: no tiene carrito, pagos ni precios.

## Los tres sabores

| Producto | Destino | Experiencia |
| --- | --- | --- |
| Crema de Cacahuete Tradicional | Casa | Mesa de desayuno con parallax y puntos interactivos |
| Remolino de Pitaya Rosa | Ubud, Bali | Pétalos y hojas que reaccionan al cursor y remolino rosa |
| Remolino de Flor de Cactus | Desierto de Atacama, Chile | Noche estrellada con una fogata interactiva que ilumina el frasco |

Disponibles conceptualmente en 300 g y 150 g.

## Pantallas

| Ruta | Pantalla |
| --- | --- |
| `/` y `/index.html` | Página principal: carrusel con controles de velocidad A y B |
| `/casa` | Web 1, Modo Origen |
| `/ubud` | Web 2, Modo Selva |
| `/atacama` | Web 3, Modo Noche |
| `/remolino-perfecto` | Sección oculta: minijuego y pasaporte VIP |
| `/de-vuelta-a-casa` | Cierre del viaje |
| `/documentation` | Documentación del proyecto, enlazada desde el panel de Contacto |
| `/colors` | Identidad visual: colores, tipografía, ilustración, texturas, formas, composición y movimiento, con el porqué de cada decisión. También `/colores`. Sin enlace en la web |
| `/storyboard` | El storyboard explicado pantalla a pantalla, con los cambios de la versión final. Sin enlace en la web |

La **Web F** es una capa de elementos flotantes que se abre al pulsar el eslogan en cualquier pantalla. La pista de la sección oculta aparece al avivar dos veces la fogata o al encontrar el cacahuete dorado de la Web F.

La web funciona con ratón, táctil y teclado, se adapta de 320 px a ultrapanorámico y respeta la preferencia de reducir movimiento.

## Tecnología

- React 18 y Vite 5
- React Router
- Framer Motion
- Canvas 2D y WebGL
- Marked, para la página de documentación
- Fuentes autoalojadas: Fraunces e Instrument Sans
- Imágenes WebP y SVG

No necesita base de datos: el progreso del viaje se guarda en `localStorage`.

## Ejecutarlo en local

Requiere Node.js 18 o superior.

```bash
npm install
npm run dev
```

## Compilar

```bash
npm run build       # Versión para Vercel, en dist/
npm run build:zip   # Versión para el ZIP de entrega, en dist-zip/
```

La carpeta `dist-zip` necesita un servidor: dentro de ella, ejecuta `npx serve`. No funciona abriendo `index.html` con doble clic.

## Publicar en Vercel

Importa este repositorio en Vercel. El preajuste es Vite, la orden de compilación es `npm run build` y la salida es `dist`. El archivo `vercel.json` ya contiene la reescritura de rutas.

## Estructura

```text
public/            Iconos e imagen para compartir
scripts/           Preparación de la versión ZIP
src/
  assets/          Imágenes, ilustraciones y bocetos
  components/      Cabecera, barra de ruta, transición, Web F y piezas comunes
  content/         Texto de la documentación
  pages/           Pantallas y motores de animación
  styles/          Tokens y estilos
docs/              PDF con el proceso de creación
```

Más detalle en [`src/DESIGN.md`](src/DESIGN.md), [`src/ARQUITECTURA.md`](src/ARQUITECTURA.md) y [`docs/Documentacion_proceso_creacion.pdf`](docs/Documentacion_proceso_creacion.pdf).

## Aviso

Cuchavia, su correo de contacto y sus productos son ficticios y tienen fines académicos. Las fotografías de producto se generaron con IA; el origen de las fotografías de la presentación está por confirmar.
