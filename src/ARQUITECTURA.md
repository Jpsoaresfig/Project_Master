# Arquitectura del front

Contratos de la base y de la página principal. Reglas de contenido en `../BRIEF.md`, visuales en `DESIGN.md`. Si cambias un contrato, cámbialo también aquí.

## Mapa

| Archivo | Qué hace |
| --- | --- |
| `main.jsx` | Monta `ViajeProvider` y `BrowserRouter`. Importa `fonts.css`, `tokens.css` y `app.css`, en ese orden |
| `App.jsx` | Rutas, `data-theme`, `document.title`. `Documentacion` va con `React.lazy` y fuera del `Layout` |
| `state.jsx` | Estado global persistente y `MotionConfig` |
| `data.js` | Textos de marca, sabores, geometría de frascos, paradas y metadatos de ruta |
| `hooks.js` | `useMedia`, `useDisposicion`, `useTactil`, `useCapaModal` |
| `raiz.js` | Carpeta real de la web (`BASENAME`) y `HREF_DOCUMENTACION` |
| `rutasDiferidas.js` | Cargas `lazy()` de todas las pantallas salvo Inicio, su precarga al arrancar el velo y `precargarEnReposo()` |
| `components/index.js` | **Importa desde aquí** todas las piezas |
| `components/Layout.jsx` | Cabecera, barra, `<main id="contenido">`, aviso, Contacto, Web F, efectos de ruta |
| `pages/Inicio.jsx` | Página principal. Terminada |
| `pages/NoEncontrada.jsx` | 404. Terminada |
| `pages/Casa`, `Ubud`, `Atacama`, `Final` | Destinos y cierre. Terminadas |
| `pages/Vip.jsx`, `pages/vipCrema.js` | Minijuego y motor WebGL de la crema. Ver «Minijuego» |
| `pages/Documentacion.jsx` | Documentación: lee `content/documentacion.md` y añade portada e índice al imprimir |
| `pages/Colores.jsx` | Página `/colors` (alias `/colores`): paleta, temas por destino y comprobador de contraste. Fuera del `Layout`, sin enlace público. Textos en `content/colores.js`; sus hex copian los de `tokens.css` |
| `pages/Storyboard.jsx` | Página `/storyboard`: lámina con zonas pulsables, flechas del flujo, cada pantalla con su boceto y sus cambios. Fuera del `Layout`, sin enlace público. Textos en `content/storyboard.js`; los cambios copian `documentacion.md` §13 |

Los estilos de cada componente van junto a él. Cada página importa su propio CSS (`pages/casa.css`) y limita sus selectores con la clase que pasa a `Pantalla` (`.casa`).

## Qué hace el Layout por ti

No lo repitas en las pantallas:

- `data-theme` en `<html>`, `document.title`, volver arriba.
- Marca la parada como visitada y guarda `origen`.
- **Foco:** al cambiar de ruta enfoca `<main id="contenido">`, que se nombra con el `h1` de la pantalla (`aria-labelledby`): el lector lo anuncia y el siguiente Tab cae en la primera interacción. Cada pantalla debe tener exactamente un `h1`.
- Cierra la Web F y Contacto: una capa no sobrevive a la ruta. Envuelve la pantalla en `Suspense` y `ErrorBoundary`.
- En Atacama añade `data-clima="fijo"` a `<html>` a los 1,2 s, para que `--intensidad` no pase por la transición de clima.

`<main>` ya existe: las pantallas no renderizan otro. El primer elemento de la pantalla es `<Pantalla>`.

## Disposiciones

Tres, mutuamente excluyentes. Las mismas consultas están en `hooks.js` y en `styles/app.css`:

| Nombre | Consulta | Diseño |
| --- | --- | --- |
| `ancho` | Ninguna de las otras | Escenario + folio de `--folio-ancho` |
| `apilado` | `(orientation: portrait) and (max-width: 1099px), (max-width: 699px) and (min-height: 560px)` | Una columna, la página hace scroll. Con 700 px o más, folio a dos columnas |
| `bajo` | `(orientation: landscape) and (max-height: 559px)` | 3/5 + 2/5, ruta de 52 px, folio con scroll propio |

En JS: `useDisposicion()` devuelve `'ancho' | 'apilado' | 'bajo'`. `useTactil()` indica puntero grueso o sin hover.

## Estado: `useViaje()` de `state.jsx`

| Campo | Tipo | Notas |
| --- | --- | --- |
| `visitados` | `{ casa?, ubud?, atacama?, final? }` | Lo escribe el Layout |
| `pista` | boolean | Pista VIP ganada |
| `vip` | boolean | Juego completado |
| `reducido` | boolean | **Úsalo siempre para decidir**: sistema o botón |
| `reducirSistema`, `reducirBoton` | boolean | Origen de `reducido` |
| `origen` | string | Última ruta fuera de VIP: destino de «Salir del juego» |
| `darPista()` | | Atacama y Web F |
| `completarVip()` | | Pone `vip` y `pista` |
| `avisar(mensaje, ms = 3600)` | | Nota global encima de la ruta, con `role="status"` |
| `visitar(id)`, `setOrigen(ruta)`, `alternarMovimiento()` | | Internos del Layout y la barra |

`leer(clave, def)` y `guardar(clave, valor)` persisten otros datos con prefijo `viaje.` y try/catch.

`reducido` hace tres cosas: pone `data-motion="reducido"` en `<html>`, lleva los tokens a casi 0 y activa `MotionConfig reducedMotion="always"`. Tu `requestAnimationFrame` no se detiene solo: compruébalo tú. El estado final debe verse sin él.

## Navegación

**`Go`** es un `<a>` con transición. Admite todas las props de `<a>`.

```jsx
<Go to="/ubud">Ubud</Go>
<Go to="/ubud" origen={refDelFrasco}>…</Go>   // el remolino nace en el centro de ese elemento
```

Con ctrl, cmd o mayúsculas actúa como enlace normal. Sin `origen`, nace en el punto del clic, o en el centro del enlace si se usa teclado. Fuera del Layout navega sin transición.

**`useTransicion()`** devuelve `{ ir(to, { x, y }?), fase, activa, libre(), reservar(bool) }`. `fase` es `'reposo' | 'cubre' | 'revela'`. Para lanzar entradas al abrirse el remolino, espera a `fase !== 'cubre'`. `libre()` dice si no hay velo ni salida reservada; lo consultan las capas antes de abrirse. `reservar(true)` anuncia una salida inminente (el frasco elegido) y bloquea `ir` hasta `reservar(false)`. Devuelve `null` fuera del Layout. `centroDe(el)` da el punto para `ir`.

Si el usuario pulsa Atrás con el velo en marcha, gana él: se anula el destino y el velo se funde.

## Piezas

### `Pantalla`

Rejilla común. Da `escenario` (`container-type: size`, por lo que `cqw`, `cqh` y `cqi` valen dentro) y coloca el folio.

```jsx
<Pantalla
  className="ubud"
  etiqueta="Terrazas de arroz de Ubud"   // aria-label del escenario
  invertida                              // folio a la izquierda; solo en ancho y bajo
  noche                                  // escenario transparente, para Atacama
  fondo={<Cielo />}                      // capa absoluta tras escenario y folio
  escenario={<>…</>}
  folio={<Folio sabor="ubud" />}
  propsEscenario={{ onPointerMove }}     // props del <section>
/>
```

### `Folio` y `Hoja`

`Folio` es la ficha completa de un destino, con textos de `data.js`:

```jsx
<Folio sabor="casa" tam={tam} alCambiarTam={setTam}>{/* opcional, tras los tamaños */}</Folio>
```

Incluye etapa, dato, `h1`, cita, descripción, `SelectorTamano`, numeral, grabado, «Elegir otro destino» y billete al siguiente destino. `tam` y `alCambiarTam` son opcionales; pásalos si el escenario debe reaccionar (frasco de 150 g a escala 0,74). Solo admite `'casa' | 'ubud' | 'atacama'`.

El grabado se oculta si hay menos de 860 px de alto. El numeral asoma del lado del escenario para no quedar bajo ningún control. En `bajo` la ficha se compacta y `.folio__salidas` queda fija al pie, con un degradado de `--folio-pie` (Atacama lo define porque su `--folio` es transparente). El scroll del folio empieza bajo la pestaña.

`Hoja` es la cáscara para pantallas sin ficha (VIP, Final): papel, scroll propio, padding bajo la pestaña y `numeral` opcional. Usa dentro `.folio__titulo`, `.folio__cita`, `.folio__salidas`. Si no hay `h1` en el escenario, debe estar aquí. Pásale un `aria-label`.

`SelectorTamano({ valor, alCambiar })` funciona también suelto.

### `Frasco`: convención de los recortes

**Nunca pintes un `frasco-*.webp` con `<img>` directo.** El lienzo incluye fruta y centrarlo desplazaría el frasco y cambiaría su escala aparente. Usa:

```jsx
<Frasco sabor="ubud" alto="62cqh" />             // `alto`: altura aparente del frasco
<Frasco sabor="casa" alto="100%" decorativo />   // alt vacío, si el control ya lo nombra
```

- La caja del componente mide **exactamente el frasco**. La fruta sobresale de ella: no ocupa sitio ni recibe clics.
- Con el mismo `alto`, los tres se ven del mismo tamaño y sobre la misma línea. El borde inferior de la caja es la base del frasco.
- Para centrar, centra la caja. Para apoyarlo, coloca la caja: la fruta cuelga un poco por debajo de la base en Pitaya y Cactus y debe taparla un canto, según la regla del apoyo.
- Los datos viven en `GEOMETRIA_FRASCO` de `data.js`:

| Sabor | `aspecto` del lienzo | `eje` | `altura` | `base` | `proporcion` del frasco |
| --- | --- | --- | --- | --- | --- |
| `casa` | 540/946 | 0,496 | 0,998 | 0 | 0,566 |
| `ubud` | 1151/1314 | 0,697 | 0,935 | 0,063 | 0,566 |
| `atacama` | 714/1028 | 0,632 | 0,926 | 0,073 | 0,544 |

`eje` es el centro del frasco en fracción del ancho del lienzo. `altura` es el alto del frasco en fracción del alto del lienzo. `base` es lo que sobra bajo el frasco. Medido sobre el alfa de los recortes. Si se rehacen, hay que volver a medir.

**Ingredientes** (`pitaya-cortada`, `flor-cactus`, `fruto-nopal`, `cacahuete`): ya sin fondo. `flor-cactus`, `fruto-nopal` y `cacahuete` son de baja resolución: **168 px CSS como máximo**, un tope que solo se alcanza en monitores grandes. Usa `height` o `width` con `auto`. Sustituye lo que diga `DESIGN.md` sobre medallones ovalados y sobre recortar por silueta.

### `Boton`

```jsx
<Boton to="/ubud">Siguiente destino</Boton>     // billete con flecha, usa Go
<Boton onClick={f}>Abrir</Boton>                // billete como <button>
<Boton to="/" variante="enlace">Volver</Boton>  // secundario
```

Reenvía `ref`. `flecha={false}` quita la flecha.

### `BotonCerrar`

`<BotonCerrar onClick={f} />` es el único cierre de las capas (Web F y Contacto). Reenvía `ref`; el texto por defecto es «Cerrar». Úsalo también en cualquier capa nueva.

### `ErrorBoundary`

Pantalla de fallo con la marca. Con `clave` (la ruta) se recupera al navegar. `main.jsx` lleva otra sin clave por fuera del router.

### `Remolino`

`<Remolino tam={34} />` es la firma. Con `dibujar` y `duracion={0.9}` traza sus hebras al montarse; cambia su `key` para repetirlo. Toma `--remolino-a` y `--remolino-b` del tema.

### `Sello`

```jsx
<Sello arriba="Ubud" abajo="Bali" centro="2" tam={170} rot={-4} opaco cae />
```

Siempre `aria-hidden`. Los arcos solo aparecen con `tam >= 170`. `opaco` (`true` o un color) es obligatorio sobre imagen. `cae` lo hace entrar con el golpe seco al montarse.

### `Ilu`

`<Ilu src={rawSvg} style={{ width: 170 }} />`, con la importación `?raw`. Mínimo 96 px.

### `Cloud`

Motor de partículas por `transform`. Ocupa su contenedor posicionado, recorta lo que sale de él y no captura eventos salvo en las partículas con frase. Pásale `items` estable, con `useMemo` o una constante fuera del componente.

```jsx
<Cloud
  items={ITEMS}
  modo="caida"            // 'deriva' (flota en su sitio) o 'caida' (diagonal, con reentrada)
  caida={[14, 34]}        // px/s en modo caida
  radio={140}             // radio de esquiva
  rigidez={120}           // suave: 120/20 · esquiva: 260/18
  amortiguacion={20}
  esquivaTactil           // también huye del dedo. Úsalo en Ubud y Web F
  respuesta               // todas las partículas atienden al toque: empujón y latido
  mitadEnTactil           // por defecto true: la mitad de partículas en táctil
  activa={true}
  alElegir={(item, el) => {}}
/>
```

Cada `item` lleva `id`, `tam` (ancho en px) y su forma, que es `ilu` (SVG `?raw`, con `mancha` opcional) o `forma` (`cacahuete`, `petalo`, `hoja`, `estrella`, `semilla`, de `FORMAS`) con `color`. Opcionales: `x` e `y` (fracción 0-1 de la posición), `frase` (lo vuelve botón), `etiqueta` (`aria-label`), `oro`.

Con frase: se detiene con foco o con el cursor encima, y se cansa de huir a los 1,1 s para que se pueda atrapar. Con `reducido` queda quieta en su sitio y los botones siguen funcionando. Si das a un `Cloud` varias zonas, usa un contenedor por zona: las partículas no cruzan el suyo, así no entran en el folio.

### Capas

- **`useWebF()`**: `{ abierta, abrir, cerrar, eslogan }`. La abre la cabecera.
- **`useContacto()`**: `{ abierto, seccion, abrir('escribenos' | 'redes' | 'general'), cerrar }`. La cabecera lo abre en `general`, sin fila resaltada.
- **`useCapaModal(ref, abierta, { alCerrar, foco, devolver })`**: para modales propios, como el pasaporte. Hace `inert` el fondo, bloquea el scroll, atrapa Tab, cierra con Esc y devuelve el foco. `foco` y `devolver` son refs opcionales. Con `AnimatePresence` pásale `useIsPresent()` como `abierta`. Las capas se apilan: Esc y Tab solo actúan sobre la superior, y Esc no llega a los manejadores de la pantalla.

## Clases globales (`styles/app.css`)

`.titulo` (clima del tema; ya no hace falta la declaración de ejes), `.cita`, `.etiqueta`, `.dato`, `.nota` y `.nota--derecha`, `.sr`. El foco de doble anillo es global.

**Pared y balda**, comunes a Inicio y Final:

```jsx
<div className="pared" aria-hidden="true" />   {/* al fondo del escenario */}
…frascos, con z-index entre 6 y 39…
<div className="balda" aria-hidden="true" />   {/* requiere --alto-balda en el escenario */}
```

`.balda` no crea contexto de apilado: su `::before` (plano en perspectiva, `--z-balda-plano`, 5) queda detrás de los frascos y su `::after` (canto, `--z-balda-canto`, 40), delante. No le pongas `transform`, `opacity` ni `z-index`; anima los seudoelementos. `.frasco-sombra` es la sombra de contacto: va dentro del eje del frasco y usa `--alto-frasco`.

## Unidades

Altura de la vista: `var(--vista)` (`dvh`) y `var(--vista-s)` (`svh`). Barra de ruta con zona segura: `var(--ruta-total)`. En apilado, el `body` ya reserva ese espacio. Toda capa fija propia debe contar con `env(safe-area-inset-*)`.

**Unidades de contenedor: nunca `cqw`, `cqh` ni `cqi` a pelo.** Safari 15 y 16 no las conocen y un `calc()` entero sería inválido. Escribe `calc(58 * var(--cqh))`, y lo mismo con `--cqw` y `--cqi`. Sin soporte caen a `vw` y `vh`, ajustados al esquema de `.escenario`. Antes de `overflow: clip`, `overflow: hidden`; antes de `color-mix()`, un color sólido.

**Ultrapanorámico** (`min-aspect-ratio: 2/1`, con 560 px de alto o más): `--folio-ancho` sigue en 1/3, los `--t-*` se calculan con el alto y suben sus topes, y `--medida` pasa a 44ch. Variables públicas: `--ultra` (0 o 1, para multiplicar en un `calc()`) y `--alto-u` (1 % del alto útil). Con 1143 px de alto o más, en horizontal, el `rem` crece con la vista.

## Entrega

`npm run build` genera `dist` con `base: '/'` para Vercel. `npm run build:zip` genera `dist-zip` con rutas relativas, copia `index.html` a `documentacion.html` y `404.html`, y escribe `LEEME.txt`; se puede servir desde cualquier subcarpeta, porque `raiz.js` calcula el `basename` al ejecutar. `404.html` lleva además un script que busca la carpeta real de la web y normaliza `casa/` o `casa/x` a una ruta de un nivel. Hace falta un servidor: abierta con `file://`, el navegador bloquea los módulos e `index.html` explica cómo usar `npx serve`.

## Minijuego

**Motor.** `crearCrema(canvas, { reducido, dprMax, alPerder })` devuelve `{ verter(id), formar(alListo), saltar(), completar(), reiniciar(), fijarReducido(b), destruir() }`, o `null` sin WebGL. `saltar()` acelera lo que falte, y `alListo` llega igual. `destruir()` libera el contexto con `WEBGL_lose_context`. Si el contexto se pierde en plena partida, `alPerder` pasa al frasco plano en SVG y, en fase `girando`, Vip gana sin esperar.

**Pauta.** Cada ingrediente ocupa `--fila`, múltiplo de `--pauta-paso`. Vip mide el primer pie de foto y escribe `--pauta-y` en el escenario; el título y el pie del frasco se ajustan al renglón con `translate`. Si cambias el paso de la pauta, cambia también el `2.25` de `Vip.jsx`.

**Pista.** Va en `.vip__aviso`: en el folio en `ancho` y tableta, bajo el frasco en móvil, y en `bajo` queda fija arriba del scroll del folio hasta ganar.

## Reglas de la web pública

El único enlace a la documentación está en el panel de Contacto, con `HREF_DOCUMENTACION` de `raiz.js`: `/documentation` en Vercel y `documentacion.html` en el ZIP. Ninguno a los bocetos. Textos desde `data.js`. La pestaña de cabecera se desplaza con el scroll en apilado y es fija en el resto.

## Inicio: decisiones que el diseño no fijaba

- Cinco niveles de velocidad, de 9 a 1,8 s por parada. La hebra bajo la etiqueta muestra el tiempo hasta el siguiente frasco.
- Además de la pausa con cursor o foco, hay **botón de pausa** entre las flechas: el táctil no tiene cursor, y la pausa debe estar disponible en cualquier dispositivo. El primer toque la activa.
- La posición de los frascos se calcula en px (`medirOrbita`) desde su alto, con la fruta medida en `GEOMETRIA_FRASCO`.
- Solo el frasco de frente está en el orden de Tab; ← y → llevan el foco al que queda delante.
- La órbita pasa por debajo de la balda, no por encima: así la base nunca queda a la vista.
- Tope de 46 rem para el frasco, por resolución.

## Rendimiento en táctil

Todo se activa con `(hover: none), (pointer: coarse)`; escritorio no cambia. La regla: en cada fotograma solo cambian `transform` y `opacity`, y si puede, los anima el compositor. Bloque propio al final de cada CSS.

- **Velo:** disco en `<canvas>` pintado una vez que solo escala y gira. Sigue girando aunque montar la ruta ocupe el hilo principal.
- **Tema:** sin transición de ejes de fuente en `<html>`; remaquetaba el documento en cada fotograma.
- **Atacama:** parpadeo (`atacama-parpadeo`) y deriva (`atacama-deriva`, amplitud `--k`) en CSS. Fuego a 30 fps con DPR 1,25; estrellas a 10 fps con DPR 1. La calidad adaptable mide contra 33 ms.
- **Cloud:** 30 fps y pausa fuera de vista.
- **Límite de fps:** un temporizador entre fotogramas, nunca un `return` dentro del rAF, que gasta igual el fotograma.
- **Casa y Ubud:** sin parallax de scroll: desde JS siempre llega tarde al scroll del compositor. El parallax con el dedo sigue.
- **Texturas:** `--grano`, `--veta` y `--revoco` apuntan a `assets/texturas/*.webp`, la misma imagen rasterizada: `feTurbulence` tardaba segundos en pintarse. Si cambias el SVG de `tokens.css`, regenera el WebP.
- **Fusiones:** `mix-blend-mode` retirado de capas sobre contenido animado (`.casa__luz`, `.folio__numeral`, `.ubud__sello`, `.atacama__borde`) con opacidad equivalente.

Para medir: 412 × 915, DPR 2,625, CPU ×6, comparando contra la versión anterior en paralelo. Los fps de una sola pasada dependen de la carga de la máquina; cuenta repintados y recálculos en la traza.
