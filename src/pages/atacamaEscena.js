/* Motor de la noche de Atacama: cielo, fogata y luz. Sin React: Atacama.jsx le pasa los nodos.
   - El cielo fijo (Vía Láctea) se pinta una vez; solo titilan las estrellas brillantes.
   - La fogata son partículas con `lighter`: chorros de llama, brasas, chispas y humo.
   - La luz real va por `--intensidad` en <html> y por el parpadeo, que solo toca `opacity`.
   - `--intensidad` se escribe cuando cambia, nunca por el parpadeo: mueve el h1 y recalcula estilos. */

const BASE = 0.3;
const CERCA = 0.6;
const AVIVADA = 0.25;
const SUBE = 1.8;
const BAJA = 0.09;
const DPR_MAX = 2;
const DPR_TACTIL = 1.25;
/* En táctil, 30 fps constantes: mejor que 60 a tirones y la mitad de batería. El temporizador deja
   libres los fotogramas intermedios; un `return` dentro del rAF los gastaría igual. */
const PAUSA_TACTIL = 20;
const ESTRELLAS_CADA = 3;
const MAX_LLAMAS = 460;
const MAX_CHISPAS = 240;
const MAX_HUMO = 16;
const FOTOGRAMAS = 28;

const limitar = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const mezcla = (a, b, t) => a + (b - a) * t;
const azar = (a = 1, b) => (b === undefined ? Math.random() * a : a + Math.random() * (b - a));

/* Ruido 1D barato: suma de senos inconmensurables. */
const vibra = (t, s = 0) =>
  (Math.sin(t * 7.3 + s) + Math.sin(t * 13.1 + s * 2.1) * 0.6 + Math.sin(t * 23.7 + s * 0.7) * 0.35) / 1.95;

function lienzo(w, h) {
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.ceil(w));
  c.height = Math.max(1, Math.ceil(h));
  return c;
}

/* ---------- Sprites ---------- */

const RAMPA = [
  [0, [255, 244, 205]],
  [0.14, [255, 214, 120]],
  [0.34, [255, 156, 48]],
  [0.58, [236, 84, 18]],
  [0.8, [150, 30, 8]],
  [1, [46, 8, 6]],
];

function colorRampa(t) {
  for (let i = 1; i < RAMPA.length; i++) {
    if (t <= RAMPA[i][0]) {
      const [a, ca] = RAMPA[i - 1];
      const [b, cb] = RAMPA[i];
      const k = (t - a) / (b - a);
      return [mezcla(ca[0], cb[0], k), mezcla(ca[1], cb[1], k), mezcla(ca[2], cb[2], k)];
    }
  }
  return RAMPA[RAMPA.length - 1][1];
}

/* Atlas de la llama: lágrima suave, en vertical, un fotograma por temperatura. */
function atlasLlama() {
  const cw = 48;
  const ch = 80;
  const c = lienzo(cw * FOTOGRAMAS, ch);
  const x = c.getContext('2d');
  for (let i = 0; i < FOTOGRAMAS; i++) {
    const [r, g, b] = colorRampa(i / (FOTOGRAMAS - 1));
    x.save();
    x.beginPath();
    x.rect(i * cw, 0, cw, ch);
    x.clip();
    x.translate(i * cw + cw / 2, ch * 0.64);
    x.scale(1, 1.75);
    const d = x.createRadialGradient(0, 0, 0, 0, 0, cw * 0.46);
    d.addColorStop(0, `rgba(${r | 0},${g | 0},${b | 0},0.95)`);
    d.addColorStop(0.42, `rgba(${r | 0},${g | 0},${b | 0},0.46)`);
    d.addColorStop(1, `rgba(${r | 0},${g | 0},${b | 0},0)`);
    x.fillStyle = d;
    x.fillRect(-cw, -ch, cw * 2, ch * 2);
    x.restore();
  }
  return { c, cw, ch };
}

function halo(tam, paradas) {
  const c = lienzo(tam, tam);
  const x = c.getContext('2d');
  const d = x.createRadialGradient(tam / 2, tam / 2, 0, tam / 2, tam / 2, tam / 2);
  paradas.forEach(([p, col]) => d.addColorStop(p, col));
  x.fillStyle = d;
  x.fillRect(0, 0, tam, tam);
  return c;
}

function tronco(x, cx, cy, largo, grosor, angulo, tono) {
  x.save();
  x.translate(cx, cy);
  x.rotate(angulo);
  const d = x.createLinearGradient(0, -grosor / 2, 0, grosor / 2);
  d.addColorStop(0, `rgb(${tono + 34},${tono + 16},${tono + 2})`);
  d.addColorStop(0.5, `rgb(${tono},${(tono * 0.62) | 0},${(tono * 0.42) | 0})`);
  d.addColorStop(1, '#0a0605');
  x.fillStyle = d;
  x.beginPath();
  x.moveTo(-largo / 2, -grosor * 0.42);
  x.bezierCurveTo(-largo * 0.2, -grosor * 0.56, largo * 0.2, -grosor * 0.46, largo / 2, -grosor * 0.4);
  x.quadraticCurveTo(largo / 2 + grosor * 0.3, 0, largo / 2, grosor * 0.42);
  x.bezierCurveTo(largo * 0.2, grosor * 0.56, -largo * 0.2, grosor * 0.48, -largo / 2, grosor * 0.4);
  x.closePath();
  x.fill();
  /* Veta de la corteza. */
  x.strokeStyle = 'rgba(0,0,0,0.5)';
  x.lineWidth = 1;
  for (let i = 0; i < 9; i++) {
    const y = -grosor * 0.36 + (i / 8) * grosor * 0.72;
    x.beginPath();
    x.moveTo(-largo / 2 + azar(largo * 0.3), y);
    x.quadraticCurveTo(0, y + azar(-2, 2), largo / 2 - azar(largo * 0.3), y + azar(-1, 1));
    x.stroke();
  }
  /* Testa. */
  x.fillStyle = '#3b2415';
  x.beginPath();
  x.ellipse(largo / 2, 0, grosor * 0.16, grosor * 0.4, 0, 0, Math.PI * 2);
  x.fill();
  x.restore();
}

/* Leña y piedras. `brasa` es la capa incandescente, que se suma según la luz. */
function hoguera() {
  const W = 420;
  const H = 170;
  const atras = lienzo(W, H);
  const delante = lienzo(W, H);
  const brasa = lienzo(W, H);
  const a = atras.getContext('2d');
  const d = delante.getContext('2d');
  const b = brasa.getContext('2d');

  /* Lecho de ceniza. */
  const lecho = a.createRadialGradient(W / 2, H * 0.72, 4, W / 2, H * 0.72, W * 0.42);
  lecho.addColorStop(0, 'rgba(30,18,12,0.95)');
  lecho.addColorStop(0.7, 'rgba(18,12,10,0.6)');
  lecho.addColorStop(1, 'rgba(10,8,8,0)');
  a.save();
  a.translate(0, H * 0.72);
  a.scale(1, 0.26);
  a.translate(0, -H * 0.72);
  a.fillStyle = lecho;
  a.fillRect(0, -H * 3, W, H * 7);
  a.restore();

  tronco(a, W * 0.56, H * 0.56, 210, 34, -0.32, 58);
  tronco(a, W * 0.44, H * 0.56, 216, 34, 0.34, 52);
  tronco(a, W * 0.5, H * 0.64, 190, 30, 0.04, 46);
  tronco(d, W * 0.36, H * 0.73, 200, 38, -0.12, 66);
  tronco(d, W * 0.66, H * 0.74, 196, 36, 0.15, 60);

  /* Grietas al rojo sobre la leña. */
  b.lineCap = 'round';
  for (let i = 0; i < 46; i++) {
    const x0 = W * 0.2 + azar(W * 0.6);
    const y0 = H * 0.46 + azar(H * 0.38);
    const g = b.createRadialGradient(x0, y0, 0, x0, y0, azar(10, 26));
    g.addColorStop(0, 'rgba(255,190,90,0.95)');
    g.addColorStop(0.3, 'rgba(255,92,24,0.65)');
    g.addColorStop(1, 'rgba(160,20,0,0)');
    b.fillStyle = g;
    b.fillRect(x0 - 30, y0 - 30, 60, 60);
  }
  b.globalCompositeOperation = 'destination-in';
  b.drawImage(atras, 0, 0);
  b.drawImage(delante, 0, 0);
  b.globalCompositeOperation = 'source-over';

  /* Corona de piedras delante. */
  const piedras = [[0.11, 0.8, 21], [0.2, 0.87, 15], [0.33, 0.92, 24], [0.49, 0.95, 17], [0.63, 0.92, 26], [0.79, 0.87, 16], [0.89, 0.8, 22]];
  for (const [t, v, base] of piedras) {
    const px = W * t;
    const py = H * v;
    const rx = base * azar(0.9, 1.2);
    const ry = rx * azar(0.52, 0.7);
    const fase = azar(6.28);
    const g = d.createLinearGradient(px, py - ry, px, py + ry);
    g.addColorStop(0, '#6d594a');
    g.addColorStop(0.5, '#2f261f');
    g.addColorStop(1, '#0b0908');
    d.fillStyle = g;
    d.beginPath();
    /* Canto rodado irregular: radio con dos armónicos, nada de elipses perfectas. */
    for (let k = 0; k <= 22; k++) {
      const a = (k / 22) * Math.PI * 2;
      const m = 1 + Math.sin(a * 2 + fase) * 0.14 + Math.sin(a * 5 + fase * 2) * 0.07;
      const qx = px + Math.cos(a) * rx * m;
      const qy = py + Math.sin(a) * ry * m;
      if (k) d.lineTo(qx, qy);
      else d.moveTo(qx, qy);
    }
    d.closePath();
    d.fill();
  }
  /* Piedra y leña con poro: sin esto se leen como óvalos lisos. */
  d.globalCompositeOperation = 'source-atop';
  for (let i = 0; i < 2600; i++) {
    const claro = azar() > 0.55;
    d.fillStyle = claro ? `rgba(190,170,150,${azar(0.05, 0.2)})` : `rgba(0,0,0,${azar(0.1, 0.34)})`;
    d.fillRect(azar(W), azar(H * 0.3, H), azar(0.7, 2.6), azar(0.7, 1.8));
  }
  d.globalCompositeOperation = 'source-over';
  return { atras, delante, brasa, W, H };
}

/* ---------- Cielo fijo ---------- */

function pintarVia(ctx, W, H, densidad) {
  ctx.clearRect(0, 0, W, H);
  /* Banda en diagonal, de abajo a la izquierda hacia arriba a la derecha. */
  const ang = -0.52;
  const cx = W * 0.4;
  const cy = H * 0.3;
  const largo = Math.hypot(W, H) * 0.72;
  const anchura = Math.min(H, W) * 0.17;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(ang);
  ctx.globalCompositeOperation = 'lighter';
  const colores = ['120,132,190', '160,140,190', '205,170,160', '110,150,190'];
  for (let i = 0; i < 70; i++) {
    const x = azar(-largo, largo);
    const y = (azar() + azar() - 1) * anchura * 0.9;
    const r = azar(0.45, 1.3) * anchura * (1 - (Math.abs(x) / largo) * 0.5);
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    const c = colores[i % 4];
    g.addColorStop(0, `rgba(${c},${azar(0.016, 0.042)})`);
    g.addColorStop(1, `rgba(${c},0)`);
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }
  /* Grieta oscura del centro de la galaxia. */
  ctx.globalCompositeOperation = 'destination-out';
  for (let i = 0; i < 46; i++) {
    const x = azar(-largo * 0.8, largo * 0.8);
    const y = Math.sin(x * 0.006) * anchura * 0.2 + azar(-anchura * 0.16, anchura * 0.16);
    const r = azar(0.14, 0.42) * anchura;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, 'rgba(0,0,0,0.3)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }
  /* Polvo de estrellas: denso en la banda y casi nada fuera. */
  ctx.globalCompositeOperation = 'lighter';
  const total = Math.round(densidad);
  for (let i = 0; i < total; i++) {
    const x = azar(-largo, largo);
    const y = (azar() + azar() + azar() - 1.5) * anchura * 0.92;
    const m = azar();
    ctx.fillStyle = `rgba(226,226,246,${(0.08 + m * m * 0.5).toFixed(2)})`;
    const s = m > 0.94 ? 1.25 : 0.72;
    ctx.fillRect(x, y, s, s);
  }
  ctx.restore();

  /* Fondo de estrellas tenues por todo el cielo. */
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < total * 0.16; i++) {
    const m = azar();
    ctx.fillStyle = `rgba(226,230,250,${(0.1 + m * m * 0.44).toFixed(2)})`;
    ctx.fillRect(azar(W), azar(H), 0.9, 0.9);
  }
  ctx.globalCompositeOperation = 'source-over';
}

function crearEstrellas(n, W, H) {
  const lista = [];
  const tonos = ['255,255,255', '206,222,255', '255,232,206', '226,214,255'];
  for (let i = 0; i < n; i++) {
    const m = Math.pow(azar(), 2.6);
    lista.push({
      x: azar(W),
      y: azar(H),
      r: 1.1 + m * 3.8,
      f: azar(6.28),
      v: azar(0.5, 2.2),
      a: 0.4 + m * 0.6,
      t: (i % 9 === 0 ? 2 : i % 7 === 0 ? 1 : i % 5 === 0 ? 3 : 0),
      tono: tonos[0],
    });
  }
  lista.forEach((e) => {
    e.tono = tonos[e.t];
  });
  return lista;
}

function spritesEstrella() {
  const tonos = ['255,255,255', '206,222,255', '255,232,206', '226,214,255'];
  return tonos.map((t) => {
    const s = 32;
    const c = lienzo(s, s);
    const x = c.getContext('2d');
    const d = x.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    d.addColorStop(0, `rgba(${t},1)`);
    d.addColorStop(0.09, `rgba(${t},0.9)`);
    d.addColorStop(0.16, `rgba(${t},0.2)`);
    d.addColorStop(0.5, `rgba(${t},0.03)`);
    d.addColorStop(1, `rgba(${t},0)`);
    x.fillStyle = d;
    x.fillRect(0, 0, s, s);
    return c;
  });
}

/* ---------- Escena ---------- */

/**
 * `nodos`: { raiz, escenario, cielo, titila, fuego, ancla, planos: [{ el, k }], parpadeos: [el], sombra }.
 * `op`: { reducido, tactil, estado: { i } }.
 */
export function crearEscena(nodos, op) {
  const { raiz, escenario, cielo, titila, fuego, ancla, planos, parpadeos, sombra } = nodos;
  const { reducido, tactil, estado } = op;
  const html = document.documentElement;
  const cx = fuego.getContext('2d');
  const tx = titila.getContext('2d');
  const qx = cielo.getContext('2d');

  const atlas = atlasLlama();
  const brillo = halo(256, [
    [0, 'rgba(255,190,96,0.9)'],
    [0.22, 'rgba(255,132,40,0.42)'],
    [0.55, 'rgba(226,84,20,0.1)'],
    [1, 'rgba(200,60,10,0)'],
  ]);
  const humoS = halo(96, [
    [0, 'rgba(120,112,128,0.5)'],
    [0.5, 'rgba(92,88,108,0.2)'],
    [1, 'rgba(70,68,90,0)'],
  ]);
  const puntoS = halo(32, [
    [0, 'rgba(255,240,200,1)'],
    [0.28, 'rgba(255,170,70,0.6)'],
    [1, 'rgba(255,90,20,0)'],
  ]);
  const lena = hoguera();
  const destellos = spritesEstrella();

  let W = 0;
  let H = 0;
  let dpr = 1;
  let topeDpr = tactil ? DPR_TACTIL : DPR_MAX;
  let dprTitila = 1;
  let espera = 0;
  let turno = 0;
  let fx = 0;
  let fy = 0;
  let u = 1;
  let reloj = 0;
  let cuadro = 0;
  let previo = 0;
  let enMarcha = false;
  let visible = !document.hidden;
  let enVista = true;
  let enPausa = false;
  let calidad = tactil ? 0.58 : 1;
  let medida = 0;
  let cuenta = 0;
  let cercania = 0;
  let conFoco = false;
  let golpe = 0;
  let acumulado = 0;
  let acumuladoChispa = 0;
  let acumuladoHumo = 0;
  let escrito = -1;
  let ultimoEscrito = 0;
  let px = 0;
  let py = 0;
  let cursorX = 0;
  let cursorY = 0;
  let cursorActivo = false;
  let fugaz = null;
  let proximaFugaz = 2.6;
  let estrellas = [];
  let sucio = null;
  let picado = estado.i;

  const llamas = [];
  const chispas = [];
  const humos = [];
  const chorros = Array.from({ length: 7 }, (_, i) => ({
    o: (i / 6 - 0.5) * 2,
    s: azar(6.28),
    f: 1,
    x: 0,
  }));

  function escribir(ahora, forzar) {
    const v = Math.round(estado.i * 100) / 100;
    if (v === escrito) return;
    if (!forzar && ahora - ultimoEscrito < (tactil ? 100 : 33)) return;
    escrito = v;
    ultimoEscrito = ahora;
    html.style.setProperty('--intensidad', String(v));
  }

  function nacerLlama(fuerza, ii) {
    if (llamas.length >= MAX_LLAMAS) return;
    /* Elige chorro: los fuertes dan más lenguas. */
    let c = chorros[(azar() * chorros.length) | 0];
    const otro = chorros[(azar() * chorros.length) | 0];
    if (otro.f > c.f) c = otro;
    const borde = Math.abs(c.o);
    const lado = azar(-1, 1);
    const vida = azar(0.46, 1.02) * (0.82 + ii * 0.46) * (1 - borde * 0.24) * (0.8 + c.f * 0.3);
    llamas.push({
      x: fx + c.x + lado * 15 * u,
      y: fy + azar(-5, 8) * u,
      vx: lado * 8 * u,
      vy: -(112 + 216 * ii) * u * azar(0.7, 1.15) * (1 - borde * 0.24) * fuerza,
      v: 0,
      m: vida,
      r: azar(17, 38) * u * (0.92 + ii * 0.72) * (1 - borde * 0.3),
      c: limitar(borde * 0.36 + Math.abs(lado) * 0.14 + azar(0.1)),
      a: azar(0.62, 1) / (1 + ii * 1.5),
      s: azar(6.28),
      j: c.x,
    });
  }

  function nacerChispa(x, y, vx, vy, vida, destino) {
    if (chispas.length >= MAX_CHISPAS) chispas.shift();
    chispas.push({ x, y, px: x, py: y, vx, vy, v: 0, m: vida, s: azar(6.28), g: azar(0.7, 1.5), d: destino || null });
  }

  function lanzarChispas(n, fuerza) {
    for (let i = 0; i < n; i++) {
      const a = -Math.PI / 2 + azar(-0.75, 0.75);
      const v = azar(120, 560) * u * fuerza;
      nacerChispa(fx + azar(-46, 46) * u, fy - azar(4, 42) * u, Math.cos(a) * v, Math.sin(a) * v, azar(0.8, 2.4));
    }
  }

  function simular(dt, ii) {
    reloj += dt;
    golpe = Math.max(0, golpe - dt * 2.1);
    const fuerza = 1 + golpe * 0.72;

    for (const c of chorros) {
      c.f = 0.5 + 0.5 * Math.sin(reloj * (1.9 + c.s * 0.14) + c.s) * Math.cos(reloj * 0.8 + c.s * 2);
      c.x = c.o * (56 + 34 * estado.i) * u + Math.sin(reloj * 1.3 + c.s) * 9 * u;
    }

    const brisa = (Math.sin(reloj * 0.53) + Math.sin(reloj * 1.31 + 1) * 0.6) * 12 * u +
      (cursorActivo ? limitar((cursorX - fx) / (260 * u), -1, 1) * -26 * u : 0);

    /* Emisión. */
    acumulado += dt * (80 + 210 * ii + golpe * 360) * calidad;
    while (acumulado >= 1) {
      acumulado -= 1;
      nacerLlama(fuerza, ii);
    }
    acumuladoChispa += dt * (2 + 13 * ii) * (tactil ? 0.7 : 1);
    while (acumuladoChispa >= 1) {
      acumuladoChispa -= 1;
      const v = azar(70, 240) * u * (0.8 + ii);
      nacerChispa(fx + azar(-40, 40) * u, fy - azar(10, 70) * u, azar(-36, 36) * u, -v, azar(0.9, 2.6) * (0.7 + ii * 0.6));
    }
    acumuladoHumo += dt * (1.4 + ii * 1.8);
    while (acumuladoHumo >= 1 && humos.length < MAX_HUMO) {
      acumuladoHumo -= 1;
      humos.push({
        x: fx + azar(-20, 20) * u,
        y: fy - (60 + 150 * ii) * u,
        vx: azar(-5, 5) * u,
        vy: -azar(24, 46) * u,
        v: 0,
        m: azar(3.4, 5.6),
        r: azar(26, 44) * u,
      });
    }

    /* Llamas. */
    for (let i = llamas.length - 1; i >= 0; i--) {
      const p = llamas[i];
      p.v += dt / p.m;
      if (p.v >= 1) {
        llamas[i] = llamas[llamas.length - 1];
        llamas.pop();
        continue;
      }
      const alt = fy - p.y;
      const rizo =
        Math.sin(p.y * 0.023 / u + reloj * 3.9 + p.s) * 170 * u +
        Math.sin(p.y * 0.052 / u - reloj * 6.7 + p.s * 2.3) * 130 * u;
      const centrar = (fx + (p.j || 0) * (1 - p.v * p.v) - p.x) * (2.4 + p.v * 5.5);
      p.vx += (rizo * (0.3 + p.v) + centrar + brisa * (alt / (90 * u + alt)) * 5.4) * dt;
      p.vy -= 170 * u * dt;
      p.vx *= 1 - 2.1 * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
    }

    /* Chispas. */
    for (let i = chispas.length - 1; i >= 0; i--) {
      const c = chispas[i];
      c.v += dt / c.m;
      if (c.v >= 1) {
        chispas[i] = chispas[chispas.length - 1];
        chispas.pop();
        continue;
      }
      c.px = c.x;
      c.py = c.y;
      if (c.d) {
        /* Las que buscan el sello: una atracción que aprieta al final. */
        const k = 7 + c.v * 34;
        c.vx += (c.d.x - c.x) * k * dt;
        c.vy += (c.d.y - c.y) * k * dt;
        c.vx *= 1 - 5 * dt;
        c.vy *= 1 - 5 * dt;
      } else {
        c.vx += Math.sin(reloj * 3.1 * c.g + c.s + c.y * 0.012 / u) * 150 * u * dt + brisa * 1.4 * dt;
        c.vy += (-34 * u + 90 * u * c.v) * dt;
        c.vx *= 1 - 1.3 * dt;
        c.vy *= 1 - 1.1 * dt;
      }
      c.x += c.vx * dt;
      c.y += c.vy * dt;
    }

    /* Humo. */
    for (let i = humos.length - 1; i >= 0; i--) {
      const h = humos[i];
      h.v += dt / h.m;
      if (h.v >= 1) {
        humos.splice(i, 1);
        continue;
      }
      h.x += (h.vx + Math.sin(reloj * 0.9 + h.m) * 12 * u + brisa * 0.4) * dt;
      h.y += h.vy * dt;
    }
  }

  function pintarFuego(ii, parpadeo) {
    const c = cx;
    if (sucio) {
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      c.clearRect(sucio.x0, sucio.y0, sucio.x1 - sucio.x0, sucio.y1 - sucio.y0);
    } else {
      c.setTransform(1, 0, 0, 1, 0, 0);
      c.clearRect(0, 0, fuego.width, fuego.height);
    }
    const margen = 430 * u;
    let x0 = fx - margen;
    let x1 = fx + margen;
    let y0 = fy - margen * 1.2;
    let y1 = fy + 170 * u;

    const luz = limitar(ii * parpadeo + golpe * 0.2);

    /* Charco de luz en el suelo, aplastado por la perspectiva. */
    c.globalCompositeOperation = 'lighter';
    const r0 = (150 + 250 * luz) * u;
    c.globalAlpha = 0.28 + luz * 0.46;
    c.setTransform(dpr, 0, 0, dpr * 0.3, fx * dpr, (fy + 16 * u) * dpr);
    c.drawImage(brillo, -r0, -r0, r0 * 2, r0 * 2);
    c.globalAlpha = 1;

    /* Humo detrás de la llama. */
    c.globalCompositeOperation = 'source-over';
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    for (const h of humos) {
      const s = h.r * (1 + h.v * 2.1);
      c.globalAlpha = Math.sin(h.v * Math.PI) * 0.1;
      c.drawImage(humoS, h.x - s, h.y - s, s * 2, s * 2);
      if (h.y - s < y0) y0 = h.y - s;
    }
    c.globalAlpha = 1;

    /* Leña de atrás. */
    const lw = 280 * u;
    const lh = (lw * lena.H) / lena.W;
    const lx = fx - lw / 2;
    const ly = fy - lh * 0.64;
    c.drawImage(lena.atras, lx, ly, lw, lh);

    /* Llama: primero el halo, luego las lenguas. */
    c.globalCompositeOperation = 'lighter';
    const r1 = (72 + 150 * luz) * u;
    c.globalAlpha = 0.34 + luz * 0.3;
    c.drawImage(brillo, fx - r1, fy - r1 * 1.1, r1 * 2, r1 * 2);

    const { c: sprite, cw, ch } = atlas;
    const alturaLlama = (300 + 260 * luz) * u;
    for (const p of llamas) {
      const t = p.v;
      const crece = limitar(t * 7);
      const tam = p.r * crece * (1 - t * t * 0.84);
      const veloc = Math.hypot(p.vx, p.vy);
      const estira = 1 + limitar(veloc / (330 * u), 0, 1.2);
      const temperatura = limitar(p.c + t * (0.92 - p.c * 0.4));
      const fot = Math.min(FOTOGRAMAS - 1, (temperatura * FOTOGRAMAS) | 0);
      /* Sin columnas rojas: lo que se enfría o sube demasiado se apaga antes de acumularse. */
      const fria = limitar((temperatura - 0.72) / 0.2);
      const techo = limitar(((fy - p.y) - alturaLlama * 0.5) / (alturaLlama * 0.5));
      const al = crece * Math.pow(1 - t, 0.82) * p.a * (1 - fria * fria * 0.92) * (1 - techo);
      const ang = Math.atan2(p.vx, -p.vy);
      const co = Math.cos(ang) * dpr;
      const si = Math.sin(ang) * dpr;
      const w = tam * 2;
      const h = tam * 2 * (ch / cw) * 0.72 * estira;
      c.globalAlpha = al;
      c.setTransform(co, si, -si, co, p.x * dpr, p.y * dpr);
      c.drawImage(sprite, fot * cw, 0, cw, ch, -w / 2, -h * 0.62, w, h);
      if (p.y - h < y0) y0 = p.y - h;
    }

    /* Leña delantera: asienta la llama y recibe su luz. */
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    c.globalCompositeOperation = 'source-over';
    c.globalAlpha = 1;
    c.drawImage(lena.delante, lx, ly, lw, lh);
    c.globalCompositeOperation = 'lighter';
    c.globalAlpha = limitar(0.42 + luz * 0.7 + vibra(reloj * 0.5, 3) * 0.1);
    c.drawImage(lena.brasa, lx, ly, lw, lh);

    /* Chispas: un trazo que se enfría, con punto de brasa en las más vivas. */
    c.lineCap = 'round';
    for (const p of chispas) {
      const t = p.v;
      const al = limitar((1 - t) * 1.5) * (0.72 + 0.28 * Math.sin(reloj * 22 * p.g + p.s));
      const [r, g, b] = colorRampa(0.12 + t * 0.62);
      c.globalAlpha = al;
      c.strokeStyle = `rgb(${r | 0},${g | 0},${b | 0})`;
      c.lineWidth = (1.7 - t) * Math.max(0.7, u);
      const dx = p.x - p.px;
      const dy = p.y - p.py;
      c.beginPath();
      const largo = Math.min(1, 10 / (Math.hypot(dx, dy) * 2.2 + 0.01)) * 2.2;
      c.moveTo(p.x - dx * largo, p.y - dy * largo);
      c.lineTo(p.x, p.y);
      c.stroke();
      if (t < 0.42) {
        const s = (5.5 - t * 7) * Math.max(0.8, u);
        c.drawImage(puntoS, p.x - s, p.y - s, s * 2, s * 2);
      }
      if (p.x < x0) x0 = p.x - 20;
      if (p.x > x1) x1 = p.x + 20;
      if (p.y < y0) y0 = p.y - 20;
    }
    c.globalAlpha = 1;
    c.globalCompositeOperation = 'source-over';
    sucio = {
      x0: Math.max(0, x0 - 8),
      y0: Math.max(0, y0 - 8),
      x1: Math.min(W, x1 + 8),
      y1: Math.min(H, y1 + 8),
    };
  }

  function pintarEstrellas(fijo) {
    tx.setTransform(1, 0, 0, 1, 0, 0);
    tx.clearRect(0, 0, titila.width, titila.height);
    tx.setTransform(dprTitila, 0, 0, dprTitila, 0, 0);
    tx.globalCompositeOperation = 'lighter';
    for (const e of estrellas) {
      const al = fijo ? e.a * 0.8 : e.a * (0.55 + 0.45 * Math.sin(reloj * e.v + e.f));
      tx.globalAlpha = limitar(al);
      const s = e.r * 2.6;
      tx.drawImage(destellos[e.t], e.x - s, e.y - s, s * 2, s * 2);
    }
    tx.globalAlpha = 1;
    if (fugaz && !fijo) {
      const f = fugaz;
      const al = Math.sin(limitar(f.v) * Math.PI);
      const cola = 180 * Math.max(0.55, u);
      const ang = Math.atan2(f.vy, f.vx);
      const ex = f.x - Math.cos(ang) * cola;
      const ey = f.y - Math.sin(ang) * cola;
      const g = tx.createLinearGradient(ex, ey, f.x, f.y);
      g.addColorStop(0, 'rgba(210,220,255,0)');
      g.addColorStop(0.72, `rgba(226,232,255,${0.42 * al})`);
      g.addColorStop(1, `rgba(255,255,255,${al})`);
      tx.strokeStyle = g;
      tx.lineWidth = 1.5;
      tx.lineCap = 'round';
      tx.beginPath();
      tx.moveTo(ex, ey);
      tx.lineTo(f.x, f.y);
      tx.stroke();
      tx.globalAlpha = al;
      tx.drawImage(destellos[1], f.x - 8, f.y - 8, 16, 16);
      tx.globalAlpha = 1;
    }
    tx.globalCompositeOperation = 'source-over';
  }

  function moverPlanos() {
    /* En táctil la deriva es una animación CSS: la lleva el compositor. */
    if (tactil && !reducido) return;
    const ox = px + Math.sin(reloj * 0.17) * 0.32;
    const oy = py + Math.cos(reloj * 0.13) * 0.26;
    for (const { el, k } of planos) {
      el.style.transform = `translate3d(${(-ox * k).toFixed(2)}px, ${(-oy * k * 0.34).toFixed(2)}px, 0)`;
    }
  }

  function aplicarParpadeo(p) {
    /* En táctil el parpadeo es una animación CSS: sin escrituras por fotograma. */
    if (tactil && !reducido) return;
    const v = p.toFixed(3);
    for (const el of parpadeos) el.style.opacity = v;
    if (sombra) {
      sombra.style.transform = `scaleX(${(0.92 + (1 - p) * 0.7 + estado.i * 0.14).toFixed(3)})`;
    }
  }

  const frame = (ahora) => {
    if (tactil) {
      espera = setTimeout(() => {
        cuadro = requestAnimationFrame(frame);
      }, PAUSA_TACTIL);
    } else {
      cuadro = requestAnimationFrame(frame);
    }
    const dt = Math.min(0.05, previo ? (ahora - previo) / 1000 : 0.016);
    previo = ahora;

    /* Calidad adaptable: si el dispositivo no llega, bajan partículas y resolución. */
    medida += (dt - medida) * 0.06;
    cuenta += 1;
    if (cuenta > 50) {
      cuenta = 0;
      if (medida > (tactil ? 0.042 : 0.024) && calidad > 0.36) {
        calidad *= 0.82;
        if (calidad < 0.5 && dpr > 1) {
          topeDpr = 1;
          if (tactil) medirLienzos();
          else ajustar();
        }
      } else if (medida < (tactil ? 0.036 : 0.0175) && calidad < (tactil ? 0.58 : 1)) {
        calidad = Math.min(tactil ? 0.58 : 1, calidad * 1.05);
      }
    }

    const objetivo = Math.max(BASE, conFoco ? CERCA : 0, cercania * CERCA);
    if (estado.i < objetivo) estado.i = Math.min(objetivo, estado.i + SUBE * dt);
    else estado.i = Math.max(objetivo, estado.i - BAJA * dt);
    escribir(ahora, false);

    const ii = estado.i;
    const parpadeo = 0.88 + vibra(reloj * 0.62, 1.2) * 0.1 + golpe * 0.04;
    simular(dt, ii);
    pintarFuego(ii, parpadeo);
    aplicarParpadeo(limitar(parpadeo));

    /* Parallax: cursor con muelle suave y una deriva lenta, para que el móvil también respire. */
    px += ((cursorActivo && !tactil ? limitar((cursorX - W / 2) / (W / 2), -1, 1) : 0) - px) * 0.05;
    py += ((cursorActivo && !tactil ? limitar((cursorY - H / 2) / (H / 2), -1, 1) : 0) - py) * 0.05;
    moverPlanos();

    /* Estrella fugaz. */
    proximaFugaz -= dt;
    if (!fugaz && proximaFugaz <= 0) {
      const izq = azar() > 0.5;
      const v = Math.max(W, 520) * azar(0.5, 0.8);
      fugaz = {
        x: izq ? azar(W * 0.05, W * 0.3) : azar(W * 0.3, W * 0.6),
        y: azar(H * 0.05, H * 0.28),
        vx: (izq ? 1 : -1) * v,
        vy: v * azar(0.2, 0.42),
        v: 0,
      };
      proximaFugaz = azar(7, 16);
    }
    if (fugaz) {
      fugaz.x += fugaz.vx * dt;
      fugaz.y += fugaz.vy * dt;
      fugaz.v += dt / 0.8;
      if (fugaz.v >= 1) fugaz = null;
    }
    turno = (turno + 1) % (tactil ? ESTRELLAS_CADA : 2);
    if (turno === 0 || fugaz) pintarEstrellas(false);
  };

  function arrancar() {
    if (reducido || enMarcha || !visible || !enVista || enPausa) return;
    enMarcha = true;
    previo = 0;
    cuadro = requestAnimationFrame(frame);
  }

  function parar() {
    enMarcha = false;
    clearTimeout(espera);
    cancelAnimationFrame(cuadro);
  }

  /* Un solo cuadro quieto: con movimiento reducido la fogata se ve, pero nada corre. */
  function pintarQuieto() {
    llamas.length = 0;
    humos.length = 0;
    golpe = 0;
    const ii = estado.i;
    for (let i = 0; i < 110; i++) simular(1 / 60, ii);
    sucio = null;
    pintarFuego(ii, 1);
    aplicarParpadeo(1);
    pintarEstrellas(true);
    moverPlanos();
  }

  function medirLienzos() {
    dpr = Math.min(window.devicePixelRatio || 1, topeDpr);
    dprTitila = tactil ? 1 : dpr;
    fuego.width = Math.round(W * dpr);
    fuego.height = Math.round(H * dpr);
    titila.width = Math.round(W * dprTitila);
    titila.height = Math.round(H * dprTitila);
    sucio = null;
  }

  function ajustar() {
    const caja = raiz.getBoundingClientRect();
    const a = ancla.getBoundingClientRect();
    const esc = escenario.getBoundingClientRect();
    W = caja.width;
    H = caja.height;
    if (!W || !H) return;
    fx = a.left + a.width / 2 - caja.left;
    fy = a.bottom - caja.top - a.height * 0.14;
    u = limitar(Math.min(esc.width / 900, esc.height / 760), 0.5, 1.5);

    raiz.style.setProperty('--fx', `${fx.toFixed(1)}px`);
    raiz.style.setProperty('--fy', `${fy.toFixed(1)}px`);
    raiz.style.setProperty('--u', u.toFixed(3));

    medirLienzos();

    /* El polvo de estrellas se pinta a densidad de pantalla y no vuelve a tocarse. */
    const dprCielo = Math.min(window.devicePixelRatio || 1, tactil ? 1.5 : DPR_MAX);
    cielo.width = Math.round(W * dprCielo);
    cielo.height = Math.round(H * dprCielo);
    qx.setTransform(dprCielo, 0, 0, dprCielo, 0, 0);
    pintarVia(qx, W, H, limitar(W * H * 0.012, 2600, tactil ? 6000 : 15000));

    const n = Math.round(limitar((W * H) / 8000, 50, tactil ? 80 : 140));
    estrellas = crearEstrellas(n, W, H * 0.72);
    if (reducido) pintarQuieto();
    else pintarEstrellas(false);
  }

  const alCambiarVisibilidad = () => {
    visible = !document.hidden;
    if (visible) arrancar();
    else parar();
  };
  document.addEventListener('visibilitychange', alCambiarVisibilidad);

  const vista = new IntersectionObserver(
    ([e]) => {
      enVista = e.isIntersecting;
      if (enVista) arrancar();
      else parar();
    },
    { threshold: 0 },
  );
  vista.observe(raiz);

  let temporizador = 0;
  const observador = new ResizeObserver(() => {
    clearTimeout(temporizador);
    temporizador = setTimeout(ajustar, 140);
  });
  observador.observe(raiz);

  ajustar();
  html.style.setProperty('--intensidad', String(Math.round(estado.i * 100) / 100));
  escrito = Math.round(estado.i * 100) / 100;
  if (reducido) {
    pintarQuieto();
  } else {
    /* Enciende ya hecha: no se ve el primer segundo de una hoguera vacía. */
    for (let i = 0; i < 50; i++) simular(1 / 60, estado.i);
    aplicarParpadeo(0.94);
    arrancar();
  }

  return {
    /** Sube la intensidad, lanza llamas y chispas. `sello`: {x, y} para las que van al sello. */
    avivar(sello) {
      estado.i = Math.min(1, estado.i + AVIVADA);
      picado = estado.i;
      golpe = 1;
      if (reducido) {
        pintarQuieto();
        golpe = 1;
        lanzarChispas(46, 0.9);
        for (let i = 0; i < 24; i++) simular(1 / 60, estado.i);
        sucio = null;
        pintarFuego(estado.i, 1);
        escribir(0, true);
        return;
      }
      lanzarChispas(tactil ? 54 : 96, 1);
      for (let i = 0; i < 36; i++) {
        const a = -Math.PI / 2 + azar(-0.5, 0.5);
        const v = azar(180, 520) * u;
        llamas.push({
          x: fx + azar(-52, 52) * u,
          y: fy - azar(0, 24) * u,
          vx: Math.cos(a) * v,
          vy: Math.sin(a) * v,
          v: 0,
          m: azar(0.42, 0.86),
          r: azar(16, 34) * u,
          c: azar(0.05, 0.3),
          a: 0.6,
          s: azar(6.28),
          j: 0,
        });
      }
      if (sello) {
        for (let i = 0; i < 40; i++) {
          const a = -Math.PI / 2 + azar(-0.9, 0.9);
          const v = azar(200, 460) * u;
          nacerChispa(fx + azar(-30, 30) * u, fy - azar(10, 50) * u, Math.cos(a) * v, Math.sin(a) * v, azar(0.72, 1.1), {
            x: sello.x + azar(-48, 48) * u,
            y: sello.y + azar(-48, 48) * u,
          });
        }
      }
      escribir(performance.now(), true);
    },
    /** Posición del cursor en píxeles de la escena, o null si se fue. */
    cursor(x, y) {
      if (x === null) {
        cursorActivo = false;
        cercania = 0;
      } else {
        cursorActivo = true;
        cursorX = x;
        cursorY = y;
        const d = Math.hypot(x - fx, (y - (fy - 90 * u)) * 0.8);
        const alcance = 300 * Math.max(0.7, u);
        cercania = limitar(1 - d / alcance) ** 0.6 * 1.25;
        cercania = limitar(cercania);
      }
      if (reducido) {
        estado.i = Math.max(BASE, picado, cercania * CERCA, conFoco ? CERCA : 0);
        const v = Math.round(estado.i * 20) / 20;
        if (v !== escrito) {
          escribir(0, true);
          pintarQuieto();
        }
      }
    },
    foco(activo) {
      conFoco = activo;
      if (reducido) {
        estado.i = Math.max(BASE, picado, activo ? CERCA : 0);
        escribir(0, true);
        pintarQuieto();
      }
    },
    /** Sin trabajo mientras una capa (Web F) tapa la noche. */
    pausar(activo) {
      enPausa = activo;
      if (activo) parar();
      else arrancar();
    },
    medidas: () => ({ fx, fy, u }),
    destruir() {
      parar();
      clearTimeout(temporizador);
      observador.disconnect();
      vista.disconnect();
      document.removeEventListener('visibilitychange', alCambiarVisibilidad);
      if (html.dataset.theme !== 'atacama') html.style.removeProperty('--intensidad');
    },
  };
}

export const INTENSIDAD_BASE = BASE;
