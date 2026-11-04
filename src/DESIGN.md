# Sistema visual · Un viaje en cada cucharada

Guía para el front. Los valores viven en `styles/tokens.css`; aquí está cómo usarlos. Reglas de contenido: `../BRIEF.md`.

## 1. La idea

**Una libreta teñida por cada destino.** No hay un fondo crema con adornos: cada pantalla es un pliego de papel distinto, y la crema de cacahuete, la pitaya y la noche son el papel.

Cuatro rasgos hacen que parezca una sola marca y no una plantilla:

1. **El folio.** El tercio de texto no es una columna: es la hoja del cuaderno, y cambia de material en cada destino: papel mantequilla (Casa), papel teñido de pitaya (Ubud), nada, solo aire de noche (Atacama).
2. **El clima tipográfico.** La misma Fraunces cambia con el lugar: gruesa y blanda en Casa, cursiva húmeda en Ubud, un hilo afilado en Atacama. Los ejes se interpolan entre pantallas. Las letras viajan.
3. **La mancha desajustada.** Cada grabado lleva una mancha plana de color desplazada 4 px, como una impresión a dos tintas mal registrada. Es el gesto gráfico propio de la marca.
4. **El remolino.** Solo el remolino es curvo. Todo lo demás es recto, con filete fino y papel.

## 2. Bloqueos de imagen: leer antes de montar

### Los frascos `.webp` están rotos

`frasco-tradicional.webp`, `frasco-pitaya.webp` y `frasco-cactus.webp` **no se pueden usar**. Su canal alfa tiene dos defectos que el PNG de `web/img/` no tiene:

- **Peine:** en las zonas afectadas falta una de cada tres filas (10-12 % de los píxeles alternan).
- **Agujeros:** entre el 11 y el 13 % de la imagen pasó de opaca a transparente, y se come los hombros del vidrio y la etiqueta.

El color sí está bien. Hay que reconvertirlos desde `web/img/frasco-*.png`. Comprobado: `sharp(png).webp({ quality: 82, alphaQuality: 100 })` da 0 filas alternas y archivos más ligeros (35-59 KB).

### Tampoco el PNG es un recorte real

Es una máscara de esquinas redondeadas sobre la foto. Conserva pared en los hombros y madera en la base; pitaya y cactus llevan además fruta delante. Además están ampliados unas 2 veces: no pasar de **620 px de alto**. Consecuencias:

| Fondo | Con PNG reconvertido | Solución |
| --- | --- | --- |
| Pared y balda (Inicio, Final) | Funciona: la pared y la madera coinciden | Frasco suelto |
| Lino, Ubud, noche, Web F | Se ven restos de pared en los hombros | Recorte real de silueta o **plan B** |

**Plan B, la foto pegada.** No necesita ningún recorte y queda bien como detalle de cuaderno: una foto rectangular de `tres-frascos.webp` con borde crema de 10 px (44 px abajo), rotada -2,5°, con `--s-papel-alzado`. Caja de 270 × 376 px, `background-size: 320% auto` y `background-position`: pitaya `7% 58%`, cactus `47% 62%`, tradicional `92% 65%`.

**Regla del apoyo:** la base de un frasco suelto nunca queda a la vista. La tapa siempre algo: el canto de la balda, el borde inferior del escenario o la duna delantera.

### Otros problemas de imagen

- **`ubud.webp`**: el tarro de la foto dice «REMOLDS DE PITATA NOSA». No puede quedar legible: taparlo con el frasco o la foto pegada (x 24-33 %, y 69-82 % de la imagen). Si no hay nada encima, `object-position: 50% 12%` lo deja fuera.
- **`noche.webp`** es una ilustración vectorial plana, no un paisaje real, y el brief pide paisajes reales. Se compensa en Atacama (§5) y queda señalado para sustituirla.
- **`cacahuete`, `flor-cactus`, `fruto-nopal`, `pitaya-cortada`**: son recortes ovalados con fondo dentro, no siluetas. Usarlos solo como medallones ovalados, en VIP.
- **Etiquetas:** los frascos dicen «Mantequilla de cacahuete» y el brief dice «Crema». Todo el texto de la web dice **crema**.

## 3. Base

### Estructura

Rejilla de 12 columnas: **8 de escenario + 4 de folio** (`--col-visual` / `--col-folio`). El elemento principal se coloca sobre un punto fuerte del escenario (intersección de sus tercios), nunca centrado.

Altura: `100svh` en escritorio. Escenario y folio llegan hasta arriba, sin franja de cabecera. Debajo, `--alto-ruta`.

El escenario y el folio son contenedores (`container-type: inline-size`). `--t-portada` y `--t-numeral` usan `cqi`.

### Temas

`data-theme` y `data-motion` van en `<html>`. Fuera de eso los tokens derivados no se recalculan. La documentación no lleva `data-theme`.

### Títulos

```css
.titulo {
  font-family: var(--f-display);
  font-style: var(--f-estilo);
  font-weight: var(--f-peso);
  font-variation-settings: 'opsz' var(--f-opsz), 'SOFT' var(--f-soft), 'WONK' var(--f-wonk);
  font-optical-sizing: none;
  letter-spacing: var(--e-display);
  line-height: var(--i-ajustado);
  text-wrap: balance;
}
html { transition: --f-soft var(--d-clima) var(--m-giro), --f-peso var(--d-clima) var(--m-giro), --f-opsz var(--d-clima) var(--m-giro); }
```

No usar el atajo `font:` después: reinicia los ejes. En Atacama quitar la `transition` de `html` tras entrar, porque `--intensidad` cambia cada frame. Con peso inferior a 300, tamaño mínimo 48 px.

| Rol | Letra | Detalle |
| --- | --- | --- |
| Portada y H1 | Fraunces, clima del tema | `--t-portada`, `--t-h1` |
| Cita del destino | Fraunces cursiva | `--t-entrada`; `'opsz' 36, 'SOFT' 100, 'WONK' 1`, peso 400 |
| Cuerpo | Instrument Sans 400 | `--t-cuerpo`, `--medida` |
| Etiqueta (etapa, ruta) | Instrument Sans 600 | Mayúsculas, `--t-etiqueta`, `font-stretch: var(--ancho-etiqueta)`, `--e-etiqueta` |
| Coordenada, gramos | Fraunces | `--t-dato`, `--f-ejes-dato`. **Instrument Sans no tiene el glifo ′** |
| Nota manuscrita | Fraunces cursiva | `--t-nota`, `--f-ejes-nota` |

### Detalles de cuaderno

- **Etapas:** Casa 01, Ubud 02, Atacama 03, De vuelta a casa 04. Formato: `Etapa 02 · Modo Selva`.
- **Numeral:** cifra enorme de la etapa (`--t-numeral`, clima del tema, `aria-hidden`) en la parte baja del folio, cruzando 1/5 de su ancho hacia el escenario. `mix-blend-mode: multiply` sobre claro, `screen` sobre oscuro, opacidad 0,18.
- **Coordenadas**, solo estas: Ubud `8°30′S 115°16′E`, San Pedro de Atacama `22°55′S 68°12′O`. Casa no tiene cifras: «Coordenadas: las de tu mesa».
- **Sellos** (`sello.svg`): textos en los arcos, número o inicial en el centro, rotación entre -8° y 6°. **Sobre imagen, mancha opaca** (`--ilu-mancha: var(--c-pitaya)`), o el texto no se lee. Es decoración: el dato real está en el folio, y el sello lleva `aria-hidden`.
- **Notas:** ficha `--ficha` con `--ficha-texto`, rotación ±1,2°, `--s-papel`, ancho máximo 24ch, hilo curvo de 1 px hasta el punto señalado. Texto del prototipo, sin inventar nada.
- **Grano:** `--grano` en el folio de Casa, la página VIP y las montañas de Atacama.

### Componentes

**Billete** (acción principal). Rectángulo `--acento` de 52 px de alto, muescas de `--muesca` a media altura en los lados, flecha SVG a la derecha. La muesca va en un `::before` con `mask`; si va en el botón, recorta el foco.

**Enlace secundario.** Texto subrayado, 1 px, `text-underline-offset: 0.25em`.

**Tamaños.** Dos casillas rectas de 72 × 44 px con filete `--linea`, en Fraunces. Activa: fondo `--folio-texto`, texto del color del folio. `aria-pressed`.

**Punto interactivo.** Área de 44 px; se ve un punto de 14 px crema con anillo tinta.

### Estados

| Elemento | Reposo | Hover (solo `@media (hover: hover)`) | Foco | Pulsado | Visitado o activo |
| --- | --- | --- | --- | --- | --- |
| Billete | Acento | Flecha +6 px, `--s-papel`, `--d-rapido` | Doble anillo | `translateY(1px)`, sin sombra | No aplica |
| Enlace | Subrayado 1 px | Subrayado 2 px | Doble anillo | Color `--folio-tenue` | No aplica |
| Pestaña | `--s-papel` | Baja 3 px (`--s-papel-alzado`) | Doble anillo | Sube 1 px | No aplica |
| Tamaño | Filete | Fondo al 10 % | Doble anillo | `scale(0.97)` | Relleno |
| Punto | Pulso lento | Anillo a 1,3 | Doble anillo | `scale(0.9)` | Punto relleno, nota abierta, sin pulso |
| Parada de ruta | Número en círculo | Etiqueta y filete en `--ruta-acento` | Doble anillo | `scale(0.94)` | Ver cabecera y ruta |
| Elemento de Web F | Deriva | Esquiva | Doble anillo, deja de esquivar | Da su frase | Atenuado a 0,6 |

**Doble anillo:** `outline: var(--l-foco) solid var(--foco); outline-offset: 2px; box-shadow: 0 0 0 2px var(--foco-halo);`. Va igual en todos los temas; en el folio de VIP usar `--foco-folio` y `--foco-halo-folio`. Solo con `:focus-visible`.

## 4. Elementos comunes

### Cabecera

No hay franja. Son **pestañas de cuaderno** que cuelgan del borde superior (`--alto-pestana`, `--ficha`, `--s-papel`, sin radio), en la capa `--z-cabecera`.

- Izquierda: remolino + Cuchavia en Instrument Sans. Enlaza a `/`.
- Derecha: «Contacto», en estilo etiqueta, que abre el panel común (G, H y el enlace a la documentación); con menos de 460 px de ancho es un sobre de 44 px con `aria-label`. A su lado, el eslogan en Fraunces cursiva, como botón que abre la Web F.
- Fijas: no cambian de sitio, aunque Ubud invierta la pantalla.

Se quitan «Destinos» (lo cubre la ruta) y «Storyboard». La documentación tiene un único enlace, discreto, dentro del panel de Contacto; ni en la cabecera, ni en la ruta, ni en el folio. Contacto está en la cabecera de todas las pantallas públicas y, además, en el folio de Inicio.

Movimiento: bajan 12 px al entrar (`--d-medio`, `--m-salida`).

### Barra de ruta

Franja de `--alto-ruta` en `--ruta-fondo`; es igual en todas las pantallas salvo el color de acento. Rejilla `auto 1fr auto`: **Inicio** a la izquierda, recorrido en el centro, **Reducir movimiento** a la derecha (`aria-pressed`). Todo en estilo etiqueta.

Recorrido: `Casa — Ubud — Atacama — De vuelta a casa — ?`. Cada parada es un círculo de 26 px con su número en Fraunces y su etiqueta; área táctil de 44 px.

- **Sin visitar:** filete `--ruta-linea`; tramo discontinuo (`--l-trazo`).
- **Actual:** anillo `--ruta-acento` a 3 px, `aria-current="page"`.
- **Visitada:** círculo relleno `--ruta-acento`; se conserva la cifra, enmarcada por las ondas del matasellos (una × se leería como error), y texto oculto «visitado». Tramo continuo.
- **Sello `?`:** círculo punteado. Al ganar la pista se rellena y da un giro de 12° con `--m-sello`.

Movimiento: al visitar una parada, el tramo se dibuja con `stroke-dashoffset` (`--d-lento`, `--m-salida`) y el matasellos cae (ver §6).

### Transición de remolino

1. Nace **en el punto del clic** o en el centro del frasco elegido.
2. Dos hebras en espiral, desfasadas media vuelta, con los colores `--remolino-a` y `--remolino-b` **del destino**. El grosor es igual al paso de la espiral, de modo que cubren la pantalla.
3. Cubre: `dashoffset` 1 → 0 y giro de 120°, `--d-remolino-cubre`, `--m-giro`.
4. Con la pantalla cubierta cambia la ruta y `data-theme`, y el clima tipográfico empieza a interpolar.
5. Revela: `dashoffset` 0 → -1, `--d-remolino-revela`, `--m-giro`.

```js
// Espiral de Arquímedes. pathLength="1". Segunda hebra: desfase = Math.PI.
const espiral = (cx, cy, R, vueltas, desfase = 0) => {
  const pasos = vueltas * 48; let d = '';
  for (let i = 0; i <= pasos; i++) {
    const t = i / pasos, a = t * vueltas * 2 * Math.PI + desfase;
    d += `${i ? 'L' : 'M'}${(cx + R * t * Math.cos(a)).toFixed(1)} ${(cy + R * t * Math.sin(a)).toFixed(1)}`;
  }
  return d;
};
// R = Math.hypot(innerWidth, innerHeight) · vueltas = 5 · strokeWidth = R / 5
```

**Clic, Esc o tecla** la saltan, salvo las del sistema: F5, Alt+←, combinaciones con Ctrl, Cmd o Alt y teclas multimedia nunca se bloquean. **Atrás gana siempre:** anula el destino, no navega y funde el velo en 160 ms. Con movimiento reducido: fundido de 160 ms. En la primera carga no se reproduce. El foco va al inicio del `<main>`, nombrado por el `h1` de destino: el lector anuncia el título y el siguiente Tab cae en la primera interacción.

## 5. Pantallas

### Inicio `/`

**Composición.** Escenario: la pared (`.pared`), con balda de madera (`.balda`) en el 11 % inferior: plano superior en perspectiva, detrás de los frascos, y canto delante. Cada frasco lleva sombra de contacto (`.frasco-sombra`). Arriba a la izquierda, el `h1` «Un viaje en cada cucharada» en `--t-portada`, en dos líneas. Folio: `--c-oliva-osc`.

**Jerarquía.** 1) Titular. 2) Frasco activo en el punto fuerte derecho (62 % del ancho). 3) Nombre del producto en el folio.

**Imagen.** Frasco activo: 54 % del alto del escenario; roza la línea base de «cucharada» sin tapar más del 20 % de la letra, para que parezca delante. Laterales a escala 0,6, `saturate(0.85)`, a la distancia justa para que la fruta del frasco de frente no los alcance (se calcula con el alto del frasco, no con el ancho). Base oculta por el canto de la balda.

**Folio, de arriba abajo.** Etiqueta `Destino: Casa`, título (`--t-h2`), descripción, billete, ritmo (numeral y grabado del sabor, solo con 860 px de alto o más), velocidad, contacto. En apilado y bajo, el billete sube tras el título. `.inicio__sabor` reserva la altura del sabor más largo: nada salta al cambiar.

- **A y B:** casillas de 56 px con la letra en Fraunces y debajo «Más lento» / «Más rápido»; encima, cinco marcas que indican la velocidad.
- **Contacto:** `G · Escríbenos` y `H · Redes sociales`, filas separadas por filete, sin cajas. Sin datos inventados.

**Flechas.** Sobre la balda, abajo a la izquierda, 44 px, SVG (Fraunces e Instrument no tienen ◀ ▶).

**Movimiento.** Entrada en menos de 1,2 s: pared, balda, titular línea a línea, frascos escalonados y folio; espera a que abra el remolino. Órbita continua: la posición se interpola con un progreso de 0 a 1 por `requestAnimationFrame`, no a saltos. Trayectoria en arco. El texto cambia con fundido y 8 px en vertical (`--d-medio`). Pausa con cursor, foco de teclado (`:focus-visible`) o escenario fuera de vista; en táctil, el primer toque la deja en pausa y el botón la reanuda. Hover o foco en un frasco: rótulo «Viajar a Ubud». Selección: el frasco crece a 1,12 (resorte `frasco`) y de su centro nace el remolino.

### Casa `/casa` · Modo Origen

**Composición.** Escenario a la izquierda con `desayuno.webp`, `object-position: 50% 58%`. Cuenco en el punto fuerte derecho, frasco en el izquierdo (eje al 20 %, 62 % del alto, base cortada por el borde). Folio: `--c-mantequilla` con grano.

**Folio.** `Etapa 01 · Modo Origen`, «Coordenadas: las de tu mesa», h1 «Tradicional» en `--t-h1`, cita, descripción, tamaños, numeral 01 y `cacahuete.svg` de 180 px con su mancha, enlace «Elegir otro destino», billete «Siguiente destino». El grabado nunca toca el título.

**Puntos** (en % de la imagen, ver §8): cuchara 55 %, 51 %; cuenco 66 %, 66 %; taza 5 %, 40 %. Notas del prototipo.

**Movimiento.** Parallax con el cursor en tres planos: foto ±8 px, frasco ∓18 px, cacahuete grabado ∓26 px, resorte `suave`. El frasco entra subiendo 40 px, `--d-lento`.

### Ubud `/ubud` · Modo Selva

**Composición.** **Pantalla invertida: folio a la izquierda**, escenario a la derecha. La mujer mira hacia la izquierda: así su mirada lleva al texto. `ubud.webp`, `object-position: 50% 44%`. Folio: `--c-pitaya` a todo color, sin blanco.

**Folio.** `Etapa 02 · Modo Selva`, `8°30′S 115°16′E · Ubud, Bali`, h1 «Remolino de Pitaya Rosa», cita, descripción, tamaños, numeral 02 y `pitaya.svg` de 170 px, enlace, billete crema.

**Imagen.** Frasco o foto pegada sobre el tarro de la foto, abajo a la izquierda (centro al 28 %). Sello opaco arriba a la izquierda, sobre la niebla; es el área de cielo limpia.

**Movimiento.**
- Hasta 24 pétalos, hojas y semillas (`hoja.svg` y pétalo simple) caen en diagonal. Repulsión del cursor en radio de 140 px, resorte `suave`. Canvas o `transform`.
- **Remolino rosa:** se dibuja desde el cuenco de la foto (57 %, 57 % de la imagen) con `--d-pliegue` al llegar y al pulsar.
- **Nota de la fruta:** en la pitaya (18 %, 79 %); texto del prototipo.
- Las partículas se quedan en el escenario: no cruzan el folio.

### Atacama `/atacama` · Modo Noche

**Composición.** Sin paneles: la noche ocupa toda la pantalla y el folio es transparente, con `--folio-velo` para apagar las estrellas tras el texto. Es la única pantalla sin hoja; ahí se nota el silencio. Fogata en el punto fuerte izquierdo inferior (38 % del escenario), frasco a su derecha (52 %).

**Folio.** `Etapa 03 · Modo Noche`, `22°55′S 68°12′O · San Pedro de Atacama`, h1, cita, descripción, tamaños, numeral 03 y `flor-nopal.svg` de 170 px, enlace, billete lila «De vuelta a casa».

**Imagen, por capas de atrás adelante.**
1. Cielo en `canvas`: hasta 140 estrellas parpadeando sobre `noche.webp`.
2. Montañas de `noche.webp` con `--grano`, para quitar lo plano.
3. Luz de fogata: gradiente radial `--c-ascua`, `mix-blend-mode: screen`, opacidad y radio según `--intensidad`.
4. Frasco: `filter: brightness(calc(0.3 + 0.75 * var(--intensidad)))`.
5. Duna delantera en SVG, color `#231D18`: tapa la base del frasco y recibe luz en el borde.
6. Llamas y chispas en `canvas`, con `globalCompositeOperation: 'lighter'`.

**Interacción.** `--intensidad` (0 a 1) va en `<html>`, actualizada como mucho una vez por frame.
- El cursor cerca de la fogata la sube hasta 0,6; se apaga despacio.
- Clic, Intro o Espacio en la fogata (botón real): +0,25, chispas y llama.
- **La tipografía lo acusa:** el h1 pasa de hilo afilado (peso 210, SOFT 0) a blando y cálido (peso 440, SOFT 100). La noche se ablanda con el fuego.
- A la **segunda avivada** cae el sello con `--m-sello`, arriba a la izquierda, y la nota lleva a «Sigue la pista».
- Con movimiento reducido: sin partículas ni parpadeo; cada avivada cambia `--intensidad` de golpe.

### Remolino perfecto `/remolino-perfecto` · VIP

**Composición.** Por fin, el cuaderno: **página crema pautada** (2/3) con `repeating-linear-gradient` de `--pauta` cada `--pauta-paso`, y folio oliva oscuro (1/3). Es la única pantalla de crema a toda página: aquí tiene sentido, y por eso no se usa en el resto.

**Jerarquía.** 1) Frasco vacío en el centro de la página. 2) h1 en cursiva arriba a la izquierda, con el texto sobre la pauta. 3) Ingredientes a la izquierda.

**Imagen.** Medallones ovalados (`cacahuete`, `pitaya-cortada`, `flor-cactus`) con pie en Fraunces cursiva, como especímenes pegados. La brújula es `brujula.svg` a 140 px, con «no va dentro»; su aguja tiembla si se intenta soltar. Sobre la página, sello y acentos con `--pagina-acento` y `--pagina-acento-texto`.

**Frasco objetivo.** Silueta SVG a trazo discontinuo, `stroke` `--pagina-acento-texto`, que se llena por capas: base de cacahuete, fruta y flor.

**Folio.** Etiqueta, pasos 1-3 con el número en Fraunces (hecho: tachado fino, sigue siendo legible), pista como nota, pasaporte, «Salir del juego».

**Pasaporte.** Cuadernillo recto, sin radio, fondo `--c-oliva` con texto `--c-tinta`, con `sello.svg` en blanco. Al desbloquear, el sello cae con `--m-sello` y se abre el modal de la misma forma, como una página que pasa (`rotateY` 90° → 0°, `--d-lento`).

**Movimiento.** Arrastre: el ingrediente sigue al cursor con 1,04 y `--s-flotante`; al soltar en el frasco entra con `--m-cuchara`. Incorrecto: rebota al origen con la pista como nota, sin penalización. Al completar, el remolino se dibuja dentro del frasco con `--d-pliegue`. Teclado y táctil: seleccionar y pulsar el frasco, con el mismo aspecto que al arrastrar.

### De vuelta a casa `/de-vuelta-a-casa` · Final

**Composición.** La misma pared y balda de Inicio, **el viaje vuelve al punto de partida**, pero ahora los tres frascos están juntos sobre la balda, en el tercio central. Titular «Vuelves distinto, con el mundo dentro» en `--t-portada`, en el mismo sitio que el de Inicio. Folio oliva oscuro.

**Folio.** `Etapa 04 · De vuelta a casa`, eslogan, tres sellos en fila (uno por destino, 120 px, solo con el número en el centro, `aria-hidden`), billete «Volver a explorar los sabores».

**Movimiento.**
1. Tradicional, Pitaya y Cactus entran uno a uno por la derecha, a 420 ms de distancia, `--m-cuchara`.
2. Cuando cada uno aterriza, cae su sello: `scale(1.5)` → 1, `--m-sello`, 180 ms.
3. El titular: cada palabra pasa de SOFT 0 a 100 en cascada (`--f-soft` local en un `span`).

Con movimiento reducido, todo aparece ya colocado.

### Web F (capa)

Se abre al pulsar el eslogan en cualquier pantalla. Lleva `data-capa="web-f"`.

**Composición.** Fondo `--c-tinta` opaco al 94 % con `--grano`. «Atrévete.» en `--t-portada` en el tercio inferior izquierdo, con `'SOFT' 100, 'WONK' 1`, y debajo «El mundo cabe en una cucharada» en cursiva. Los dos tercios restantes son aire para los elementos. Botón «Cerrar» arriba a la derecha, siempre visible.

**Imagen.** Cacahuetes, hojas y pitayas son los grabados en trazo crema, con mancha del color de su sabor: cacahuete, rosa, lila. Pétalos y estrellas: las formas simples de `web/js/main.js`. **El cacahuete dorado** es el único relleno (`--c-oro`), en registro y con su propio grabado en tostado, con un destello cada 6 s. Bajo el lema, la instrucción «Prueba a tocar lo que flota». Un remolino diminuto en la pestaña indica que el eslogan se puede pulsar.

**Movimiento.**
- Apertura: iris con `clip-path: circle()` desde el eslogan, `--d-lento`, `--m-giro`.
- Deriva lenta de 12 a 20 s. Esquivan el cursor en radio de 120 px, resorte `esquiva`.
- Al pulsar uno da su frase en una nota (ficha crema). Los textos son los del prototipo.
- El dorado da la pista VIP.

**Accesibilidad.** Los elementos con frase son botones de 44 px; el foco queda atrapado en la capa. Cierra con el botón o Esc, y el foco vuelve al eslogan. Esc solo cierra la capa superior. Con foco no esquivan. La capa no sobrevive a un cambio de ruta ni se abre con el velo en marcha.

### Documentación `/documentation`

Un solo enlace público, «Documentación», en el panel de Contacto. `:root`, sin tema; sin transición de remolino ni partículas.

**Composición.** Crema tranquila, una memoria de viaje. Índice fijo en el tercio izquierdo; contenido en los dos tercios derechos, `--medida-larga`. Cabecera con la marca, sin ruta. Títulos con Fraunces sin WONK.

**Bocetos.** Hoja de contactos: rejilla de `bocetos/*.webp` sin radio, con filete fino, número de pantalla en estilo etiqueta y pie. Clic para ampliar, con Esc para cerrar. Sin rotaciones.

**Tablas** con filetes horizontales, sin relleno. **Miembros:** deja los nombres como marcadores, sin inventarlos.

**Cambios respecto al storyboard**, para documentar:
- Ubud invierte la pantalla, con el folio a la izquierda.
- El texto de Inicio pasa al folio.
- El titular del Final sale del folio y va a la pared.
- La cabecera pasa a ser tres pestañas (marca, Contacto y eslogan); se quitan «Destinos» y «Storyboard».
- Las píldoras redondeadas de la ruta pasan a paradas con matasellos.

Debe ser imprimible: `@media print` sin ruta ni pestañas.

## 6. Movimiento

Curvas y duraciones en tokens. Muelles de framer-motion:

```js
const suave = { type: 'spring', stiffness: 120, damping: 20 };   // parallax, repulsión
const esquiva = { type: 'spring', stiffness: 260, damping: 18 }; // Web F
const frasco = { type: 'spring', stiffness: 170, damping: 22, mass: 1.1 };
```

| Gesto | Curva | Duración |
| --- | --- | --- |
| Entrar, frenar | `--m-salida` | `--d-medio` |
| Salir | `--m-entrada` | `--d-rapido` |
| Remolino y clima | `--m-giro` | `--d-remolino-*`, `--d-clima` |
| Soltar, aterrizar | `--m-cuchara` | `--d-lento` |
| **Sello que cae** | `--m-sello` | 180 ms: `scale(1.5) rotate(-10deg)` → 1, sin rebote |
| Pulso, vaivén | `--m-marea` | 2,4 s en bucle |

Solo se animan `transform`, `opacity`, `stroke-dashoffset` y los ejes tipográficos. Máximo una animación continua en cada zona de la vista.

**Reducir movimiento.** `prefers-reduced-motion` o `data-motion="reducido"`: los tokens pasan a casi 0. Además, el JS detiene `requestAnimationFrame`, partículas, parallax, órbita automática y deriva. El estado final siempre se ve. Todas las funciones siguen disponibles.

## 7. Móvil y tableta

| Ancho | Diseño |
| --- | --- |
| ≥ 1100 px | 2/3 + 1/3 |
| 700-1099 px, horizontal | 2/3 + 1/3, sin numeral |
| 700-1099 px, vertical | Escenario arriba (52 svh); folio debajo a dos columnas: texto y controles |
| Proporción 2:1 o más | Folio de 1/3 real, tipografía según el alto, laterales cerca del frasco de frente |
| < 700 px | Una columna: escenario 62 svh, folio debajo; la página hace scroll |
| Alto < 560 px | Horizontal 3/5 + 2/5, folio con scroll propio; ruta solo con números |

**En una columna.** La regla de los 2/3 pasa a vertical. El orden siempre es escenario y luego folio: Ubud **no** invierte. Sin parallax ni numeral cruzado (numeral dentro del folio, 7rem). Márgenes `--margen`.

- **Cabecera:** remolino y marca; a la derecha, «Atrévete.» con `aria-label` del eslogan completo.
- **Ruta:** fija abajo, con `env(safe-area-inset-bottom)`. Solo círculos numerados, inicio y movimiento; etiqueta visible solo en la actual. No debe tener scroll horizontal.
- **Inicio:** h1 sobre el escenario, frasco centrado (50 %) con laterales asomando al 8 % y 92 %. Deslizar con `touch-action: pan-y`. Flechas 44 px sobre la balda.
- **Ubud:** `object-position: 58% 30%`, cara y cuenco visibles. El sello baja a 110 px.
- **Atacama:** folio sólido `--c-noche`, sin velo. La fogata reacciona al toque, no al cursor.
- **VIP:** escenario y folio apilados. Ingredientes en fila encima del frasco. Elegir y pulsar por defecto.
- **Web F:** titular arriba, elementos abajo. Esquivan el dedo, se pulsan y todos responden al toque.
- **Rendimiento:** mitad de partículas, `devicePixelRatio` máximo 1,5 en `canvas`.

Sin hover en táctil: ningún contenido depende de él.

## 8. Ilustraciones y puntos sobre imagen

Carpeta `assets/ilustraciones/`:

| Archivo | Lienzo | Uso |
| --- | --- | --- |
| `cacahuete.svg` | 320 × 200 | Casa, Web F |
| `hoja.svg` | 200 × 330 | Ubud, Web F |
| `flor-nopal.svg` | 320 × 366 | Atacama, Web F, VIP |
| `pitaya.svg` | 300 × 350 | Ubud, Web F |
| `brujula.svg` | 320 × 320 | VIP; `.aguja` gira sola |
| `sello.svg` | 240 × 240 | Todos; arcos `#sello-arco-superior` e `#sello-arco-inferior` |
| `remolino.svg` | 68 × 58 | Firma; colores `--remolino-a` y `--remolino-b` |

**Insertar en línea**, para que hereden color y variables:

```jsx
import flor from '../assets/ilustraciones/flor-nopal.svg?raw';
<span className="ilu" aria-hidden="true" dangerouslySetInnerHTML={{ __html: flor }} />
```

Trazan con `currentColor`: dar `color: var(--ilu-tinta)`. Con `<img>` saldrían negras y sin mancha.

- **Clases:** `.mancha`, `.grabado`, `.contorno`.
- **`--ilu-mancha`** rellena la mancha; **`--ilu-papel`** rellena la aguja de la brújula.
- **Tamaño mínimo 96 px.** Por debajo, `.grabado { display: none }`. En Web F, que anima muchos, usar 96 px o más.
- **Texto en el sello:** `<textPath href="#sello-arco-superior" startOffset="50%">` con `text-anchor="middle"`, 15 unidades arriba y 14 abajo, en `--f-display`. Por debajo de 170 px, sin texto en los arcos: solo el número central.
- Las `.mancha` no se animan por separado: el desajuste es fijo.

**Puntos sobre imagen.** Con `object-fit: cover` los porcentajes se desplazan. Meter imagen y puntos en un lienzo con la proporción de la imagen, que cubre el escenario:

```css
.escenario { container-type: size; overflow: hidden; }
.lienzo {
  --ar: 1; /* desayuno: 1; ubud: 0.8056 (928 / 1152) */
  position: absolute; left: 50%; top: 50%; translate: -50% -50%;
  width: max(100cqw, calc(100cqh * var(--ar)));
  aspect-ratio: var(--ar);
}
```

Ajustar `top` y `translate` para reproducir el `object-position`.

## 9. Lo que no se hace

- Crema de fondo fuera de VIP y la documentación. Terracota: no existe en este sistema.
- `border-radius` en tarjetas, botones o fotos. Solo puntos, círculos de ruta y remolino son curvos.
- Tarjetas con sombra difusa, gradientes morados, emojis, barras de acento.
- `--c-rosa`, `--c-verde`, `--c-flor` o `--c-cacahuete` como texto pequeño sobre claro.
- Texto sobre foto sin ficha. Texto sobre estrellas sin velo.
- Inventar nombre de marca, cifras, datos de contacto o afirmaciones nutricionales. Sin precios ni carrito.
- Enlazar la documentación desde cualquier sitio que no sea el panel de Contacto.
