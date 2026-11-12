# Briefing común del proyecto

Web publicitaria interactiva para una marca ficticia de crema de cacahuete con frutas exóticas.
Asignatura Diseño Digital y Publicidad (UGR). Todo el texto visible de la web va en español.
Se publicará en Vercel como sitio estático, sin base de datos.

El usuario pide algo **profesional, muy interactivo y nada simple**. Referencia a superar:
https://german-arroyo.neocities.org (ejemplo sencillo de clase: hierba SVG, juego de puertas, slideshow).

**Listón de calidad:** debe poder presentarse al CEO de una gran empresa como un lanzamiento real. Nada de detalles a medias: acabado, ritmo de animación, tipografía y funcionamiento impecables en ordenador y móvil.

Q1 de la guía: la web es **un anuncio interactivo** cuya finalidad es **publicitar el producto**. No es tienda ni entrada a una tienda.

## Fuentes de verdad

- `../storyboard_pantallas/` bocetos de cada pantalla y `0-storyboard-completo.png`.
- `../web/` versión estática ya funcional en HTML/CSS/JS. Es el prototipo: su lógica (`web/js/main.js`) se porta a React.
- Documento del storyboard en Claude Docs: https://claude.ai/artifact/MSy6aYxrkLj7yrkLJyPmad
- `../Talleres practica 1.pptx` presentación del producto.

## Reglas que no se pueden romper

- Nombre de la marca: **Cuchavia** (ficticio). Correo: cuchavia@hotmail.com (ficticio). Lo decidió el usuario.
- Concepto: «Un viaje en cada cucharada». Eslogan: «Atrévete. El mundo cabe en una cucharada».
- Solo tres productos y destinos:
  - Crema de Cacahuete Tradicional. Destino Casa. 100 % cacahuete natural. «Todo empieza con el sabor de siempre».
  - Remolino de Pitaya Rosa. Destino Ubud, Bali. Cacahuete y pitaya rosa (fruta del dragón). Descanso y reconexión. «Te detienes, respiras y vuelves a conectar».
  - Remolino de Flor de Cactus. Destino Desierto de Atacama, Chile. Cacahuete y flor de cactus/nopal. Calma y noches estrelladas. «Hasta en el desierto florece algo inesperado».
- Cierre: «Vuelves distinto, con el mundo dentro». Tamaños: 300 g y 150 g.
- No es tienda: sin carrito, pagos ni precios. No inventar descuentos, porcentajes, datos de contacto, cifras ni afirmaciones nutricionales.
- Cuatro pilares visuales: paisajes reales, luz y texturas naturales (madera, lino, cerámica), ilustración botánica de cuaderno de viaje, y el remolino como firma visual recurrente.
- Las tres páginas deben diferenciarse sin parecer marcas distintas.
- Regla de los 2/3: dos tercios visual, un tercio texto y controles.

## Mapa de rutas (React Router)

| Ruta | Pantalla |
| --- | --- |
| `/` y `/index.html` | **Página principal: es `index.html`, regla de la guía.** Carrusel de tres frascos, controles ◀ ▶, A (más lento) y B (más rápido), descripción, contacto lateral G y H |
| `/casa` | Web 1, Modo Origen |
| `/ubud` | Web 2, Modo Selva (día) |
| `/atacama` | Web 3, Modo Noche, fogata interactiva |
| `/remolino-perfecto` | Sección oculta VIP: minijuego y pasaporte |
| `/de-vuelta-a-casa` | Pantalla final |
| `/documentation` | Documentación del proyecto. También `/documentacion` y `/documentacion.html` |

**La documentación, la identidad visual (`/colors`) y el storyboard (`/storyboard`) solo se enlazan, de forma discreta, desde el panel de Contacto.** Lo decidió el usuario para cumplir el enunciado de la práctica 4. No aparece en ningún otro sitio. Los bocetos del storyboard viven dentro de la documentación, no en el menú.

La Web F es una capa que se abre al pulsar el eslogan en cualquier pantalla, se cierra con botón y Esc.

## Interacciones exigidas

- Carrusel: desplazamiento automático, flechas, velocidad A/B, pausa con cursor, deslizar en móvil, selección con animación de frasco.
- Transición de remolino entre páginas, omitible con un clic.
- Barra de ruta común: Inicio, Casa, Ubud, Atacama, De vuelta a casa, sello `?` (pista VIP) y «Reducir movimiento». Marca visitados.
- Casa: parallax y puntos interactivos.
- Ubud: pétalos, hojas y semillas que reaccionan al ratón, remolino rosa, nota de la fruta.
- Atacama: cursor sube la intensidad, clic lanza llamas y chispas, la luz alcanza al frasco, estrellas animadas, a la segunda avivada aparece el sello que da la pista.
- Web F: cacahuetes, pétalos, estrellas que esquivan el cursor; algunos dan frases; el cacahuete dorado da la pista VIP.
- VIP: arrastrar ingredientes (o elegir y pulsar, para teclado y móvil), elementos incorrectos rebotan con pista, sin derrota, remolino animado, pasaporte desbloqueado.
- Final: tres frascos llegan uno a uno, sellos, botón «Volver a explorar los sabores».
- Todo funciona con teclado y táctil. `prefers-reduced-motion` y el botón «Reducir movimiento» detienen el movimiento. El estado se guarda en localStorage con try/catch.

## Cualquier dispositivo (requisito del usuario)

La web debe funcionar perfectamente en **cualquier aparelho**: móvil pequeño (320 px), móvil grande, móvil en horizontal, tableta en ambas orientaciones, portátil, monitor grande y ultrapanorámico. Sin scroll horizontal, sin texto cortado, con objetivos táctiles de al menos 44 px, zonas seguras (`env(safe-area-inset-*)`) y altura de viewport dinámica (`dvh`). Todo efecto de cursor tiene equivalente táctil. Probar también iOS Safari: nada de APIs sin soporte y `prefers-reduced-motion` respetado.

## Tecnología

React 18, Vite 5, react-router-dom 6, framer-motion 11, fuentes autoalojadas con `@fontsource-variable/fraunces` y `@fontsource-variable/instrument-sans`. JavaScript, sin TypeScript. Ya instalado en `sitio/`. Imágenes optimizadas en `sitio/src/assets/`.

## Requisitos de la práctica 4 que debe cumplir la entrega

ZIP con la web y todos los multimedia; animación por interpoladores; varias páginas; interacción con JavaScript; documentación que explique el proceso, **qué hizo cada miembro**, decisiones técnicas (formatos, resolución de imágenes) y **cambios respecto al storyboard y a la guía de diseño**.
