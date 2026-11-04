/* Crema del frasco VIP. WebGL 1, sin dependencias.
   El remolino no es un dibujo: cada píxel busca de dónde vino con la solución exacta de
   un vórtice con cizalla (θ(r) = giro · w(r), el centro gira más rápido que el borde).
   Las cintas de pitaya y flor entran rectas y se enrollan solas, y las vetas de la crema
   se estiran con ellas. La altura de todo eso da el relieve y el brillo.
   Los colores salen de las fotos del frasco: mermelada oscura sobre cacahuete tostado.
   El borde de cada cinta se suaviza según lo que mide un píxel, y el relieve se calcula
   por diferencias finitas: dFdx va por bloques de 2 × 2 y dentaba las curvas.
   Sin WebGL, crearCrema devuelve null y Vip.jsx pinta su versión plana en SVG. */

const VERTICE = `
attribute vec2 a;
void main() { gl_Position = vec4(a, 0.0, 1.0); }`;

const FRAGMENTO = `
#extension GL_OES_standard_derivatives : enable
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 uRes;
uniform float uTiempo, uNivel, uCac, uPit, uFlo, uGiro, uAng, uEmbudo, uOla, uChorro, uCabeza, uCola;
uniform vec3 uColChorro;

#ifdef GL_OES_standard_derivatives
#define PIXEL(v) fwidth(v)
#else
#define PIXEL(v) 0.006
#endif

const float ANCHO = 0.6;                       /* 240 / 400: proporción del frasco */
const vec3 CAC_OSC = vec3(0.530, 0.340, 0.165);
const vec3 CAC = vec3(0.725, 0.515, 0.285);
const vec3 CAC_CLARA = vec3(0.880, 0.725, 0.505);
const vec3 PITAYA = vec3(0.565, 0.085, 0.215);
const vec3 PITAYA_OSC = vec3(0.380, 0.045, 0.135);
const vec3 ROSA = vec3(0.790, 0.430, 0.420);
const vec3 LILA = vec3(0.415, 0.290, 0.440);
const vec3 PISTACHO = vec3(0.585, 0.600, 0.310);

float azar(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float ruido(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(azar(i), azar(i + vec2(1.0, 0.0)), f.x),
             mix(azar(i + vec2(0.0, 1.0)), azar(i + vec2(1.0, 1.0)), f.x), f.y);
}

float fbm(vec2 p) {
  return 0.55 * ruido(p) + 0.3 * ruido(p * 2.03 + 7.1) + 0.15 * ruido(p * 4.1 + 3.3);
}

/* Cinta que cruza el centro y entra desde el extremo alto, según su cantidad.
   Serpentea y cambia de ancho, como una cucharada de mermelada al removerla. */
float cinta(vec2 m, float angulo, float ancho, float cantidad, float semilla, float blando) {
  vec2 dir = vec2(cos(angulo), sin(angulo));
  float t = dot(m, dir);
  float s = dot(m, vec2(-dir.y, dir.x));
  s += (ruido(vec2(t * 2.1 + semilla, semilla)) - 0.5) * 0.36;
  s += (ruido(vec2(t * 7.3 + semilla, semilla + 2.0)) - 0.5) * 0.06;
  float w = ancho * (0.42 + 1.16 * ruido(vec2(t * 2.7, semilla + 4.0)));
  float frente = 1.5 - 3.1 * cantidad;
  float entrada = smoothstep(frente - 0.02, frente + 0.14, t);
  float pixel = PIXEL(s) * 1.1;
  return (1.0 - smoothstep(w * (1.0 - blando) - pixel, w + pixel, abs(s))) * entrada * step(0.001, cantidad);
}

struct Mezcla {
  float r, larga, fina, pit, halo, flo, pis, h;
};

/* De dónde vino este punto: un vórtice centrado en la masa de crema. */
Mezcla mezclar(vec2 q) {
  Mezcla z;
  float escala = max(uNivel * 0.6, 0.08);
  vec2 n = (q - vec2(0.0, uNivel * 0.53)) / escala;
  n += (vec2(ruido(n * 1.7 + 21.0), ruido(n * 1.7 + 37.0)) - 0.5) * 0.2;
  z.r = length(n);
  float a = uAng + uGiro / (0.34 + 3.1 * z.r * z.r);
  float c = cos(a), s = sin(a);
  vec2 m = vec2(c * n.x + s * n.y, -s * n.x + c * n.y);

  z.larga = fbm(m * vec2(1.5, 5.2) + 3.1);
  /* Donde la cizalla aprieta más que el píxel, la veta fina se funde con su media. */
  float fino = ruido(m * vec2(4.0, 15.0) + 9.0);
  z.fina = mix(fino, 0.5, smoothstep(0.35, 1.1, PIXEL(m.y) * 15.0));

  /* Las dos diagonales dan cuatro brazos alternos. */
  float centro = smoothstep(0.03, 0.2, length(m));
  z.pit = cinta(m, 2.32, 0.115, uPit, 2.0, 0.6) * centro;
  z.halo = cinta(m + vec2(0.05, 0.065), 2.32, 0.16, uPit, 5.0, 0.9) * centro;
  z.flo = cinta(m, 0.82, 0.075, uFlo, 11.0, 0.6) * centro;
  z.pis = cinta(m + vec2(0.085, -0.08), 0.82, 0.095, uFlo, 17.0, 0.75) * centro;

  /* Relieve: las cintas montan sobre la crema y las vetas la rizan. */
  z.h = z.larga * 0.34 + z.fina * 0.05
    + (max(z.pit, z.halo * 0.5) + max(z.flo, z.pis)) * 0.3
    + uEmbudo * 0.16 * sin(z.r * 13.0 - uTiempo * 8.0);
  return z;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  vec2 q = vec2((uv.x - 0.5) * ANCHO, uv.y);
  float px = 1.0 / uRes.y;

  /* Superficie: nivel, embudo del giro y ola del último vertido. */
  float xn = q.x / 0.3;
  float sup = uNivel
    + uEmbudo * 0.085 * (xn * xn - 0.5)
    + uEmbudo * 0.005 * sin(xn * 5.0 + uTiempo * 9.0)
    + uOla * 0.016 * exp(-abs(xn) * 1.3) * sin(abs(xn) * 11.0 - uTiempo * 12.0);
  float d = sup - q.y;
  float fluido = smoothstep(-px, px, d) * step(0.001, uNivel);

  vec3 color = vec3(0.0);
  float alfa = 0.0;

  if (fluido > 0.0) {
    Mezcla z = mezclar(q);
    float fina = z.fina;

    /* Sin cacahuete todavía, la masa toma el color de lo que haya entrado. */
    float p = uCac + 1e-3;
    float solaP = uPit * (1.0 - uCac), solaF = uFlo * (1.0 - uCac);
    float total = p + solaP + solaF;
    vec3 masa = (mix(CAC_OSC, CAC, smoothstep(0.25, 0.72, z.larga)) * p + PITAYA * solaP + LILA * solaF) / total;

    color = masa;
    color = mix(color, CAC_CLARA, smoothstep(0.5, 0.86, z.larga) * 0.42 * p / total);
    /* La mermelada no tapa la crema: la tiñe en los bordes y deja pasar sus vetas. */
    color = mix(color, ROSA, z.halo * 0.38);
    color = mix(color, PITAYA, z.pit * (0.74 + 0.26 * fina));
    color = mix(color, PITAYA_OSC, z.pit * z.pit * smoothstep(0.42, 0.74, z.larga) * 0.62);
    color = mix(color, PISTACHO, z.pis * (0.68 + 0.3 * fina));
    color = mix(color, LILA, z.flo * (0.7 + 0.3 * fina));

    float e = 0.0032;
    Mezcla ax = mezclar(q + vec2(e, 0.0));
    Mezcla ay = mezclar(q + vec2(0.0, e));
    vec2 g = clamp(vec2(ax.h - z.h, ay.h - z.h) / e * 0.03, -1.0, 1.0);
    vec3 normal = normalize(vec3(-g.x + xn * 0.72, -g.y, 1.0));
    vec3 luz = normalize(vec3(-0.42, 0.56, 0.72));
    float dif = 0.74 + 0.34 * max(dot(normal, luz), 0.0);
    float espejo = pow(max(dot(normal, normalize(luz + vec3(0.0, 0.0, 1.0))), 0.0), 26.0);

    color *= dif;
    color += vec3(1.0, 0.94, 0.84) * espejo * 0.11;
    /* El grano del cacahuete molido: lo que separa una crema de un líquido. */
    color *= 0.965 + 0.07 * ruido(q * vec2(170.0, 170.0));
    color *= 1.0 - 0.34 * pow(abs(xn), 5.0);
    color *= 0.82 + 0.18 * smoothstep(0.03, 0.16, q.y);
    /* Labio de la superficie contra el vidrio. */
    color = mix(color, min(color * 1.3 + 0.04, vec3(1.0)), smoothstep(0.022, 0.0, d) * 0.72);
    alfa = fluido;
    color *= alfa;
  }

  /* Chorro que cae desde la boca hasta la superficie. */
  if (uChorro > 0.001 && q.y > uCabeza - 0.02 && q.y < uCola + 0.02) {
    float x = q.x - sin(q.y * 13.0 - uTiempo * 7.0) * 0.006;
    float hw = uChorro * (0.014 + 0.02 * smoothstep(0.1, 1.0, q.y));
    float perfil = 1.0 - smoothstep(hw - px * 1.5, hw + px * 1.5, abs(x));
    perfil *= smoothstep(uCabeza - px, uCabeza + 0.012, q.y) * (1.0 - smoothstep(uCola - 0.03, uCola, q.y));
    float redondo = sqrt(max(1.0 - x * x / (hw * hw), 0.0));
    float brillo = pow(max(1.0 - abs(x / hw + 0.4), 0.0), 7.0);
    vec3 c = uColChorro * (0.66 + 0.42 * redondo) + vec3(1.0, 0.95, 0.88) * brillo * 0.28;
    color = mix(color, c, perfil);
    alfa = max(alfa, perfil);
  }

  gl_FragColor = vec4(color, alfa);
}`;

const CANTIDAD = { cacahuete: 0.62, pitaya: 0.11, flor: 0.09 };
const CAMPO = { cacahuete: 'cac', pitaya: 'pit', flor: 'flo' };
const COLOR = {
  cacahuete: [0.725, 0.515, 0.285],
  pitaya: [0.565, 0.085, 0.215],
  flor: [0.415, 0.29, 0.44],
};
const GIRO_FINAL = 2.1;
const VUELTAS_FINALES = Math.PI * 2 * 1.5;
const T_VERTER = 1.55;
const T_FORMAR = 3.5;
const DERIVA = 0.07;
/* Al omitir el giro no se corta: lo que quede se ve a esta velocidad. */
const PRISA = 7;
/* Tope del lienzo: en un monitor enorme no compensa pintar más píxeles que estos. */
const ALTO_MAX = 1200;
/* Lienzos con motor en marcha: al volver a montar, el anterior no debe apagar el contexto. */
const vigente = new WeakSet();

const limitar = (v) => Math.min(1, Math.max(0, v));
const suave = (v) => {
  const t = limitar(v);
  return t * t * (3 - 2 * t);
};
const curvaGiro = (v) => {
  const t = limitar(v);
  return t < 0.5 ? 8 * t * t * t * t : 1 - (-2 * t + 2) ** 4 / 2;
};

function compilar(gl, tipo, fuente) {
  const s = gl.createShader(tipo);
  gl.shaderSource(s, fuente);
  gl.compileShader(s);
  return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
}

/**
 * @returns motor { verter(id), formar(alListo), saltar(), completar(), reiniciar(),
 *   fijarReducido(b), destruir() } o null si no hay WebGL.
 */
export function crearCrema(canvas, { reducido = false, dprMax = 2, alPerder } = {}) {
  let gl = null;
  try {
    gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false, powerPreference: 'low-power' });
  } catch {
    return null;
  }
  if (!gl) return null;
  gl.getExtension('OES_standard_derivatives');

  const vs = compilar(gl, gl.VERTEX_SHADER, VERTICE);
  const fs = compilar(gl, gl.FRAGMENT_SHADER, FRAGMENTO);
  if (!vs || !fs) return null;
  const programa = gl.createProgram();
  gl.attachShader(programa, vs);
  gl.attachShader(programa, fs);
  gl.linkProgram(programa);
  if (!gl.getProgramParameter(programa, gl.LINK_STATUS)) return null;
  gl.useProgram(programa);

  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const atributo = gl.getAttribLocation(programa, 'a');
  gl.enableVertexAttribArray(atributo);
  gl.vertexAttribPointer(atributo, 2, gl.FLOAT, false, 0, 0);

  const u = {};
  ['uRes', 'uTiempo', 'uNivel', 'uCac', 'uPit', 'uFlo', 'uGiro', 'uAng', 'uEmbudo', 'uOla', 'uChorro', 'uCabeza', 'uCola', 'uColChorro']
    .forEach((n) => { u[n] = gl.getUniformLocation(programa, n); });
  gl.clearColor(0, 0, 0, 0);

  const e = { cac: 0, pit: 0, flo: 0, giro: 0, ang: 0, embudo: 0, ola: 0, chorro: 0, cabeza: 1.1, cola: 1.1, col: COLOR.cacahuete };
  const cola = [];
  let actual = null;
  let deriva = false;
  let quieto = reducido;
  let cuadro = 0;
  let previo = 0;
  let tiempo = 0;
  let prisa = 1;

  const nivel = () => e.cac * CANTIDAD.cacahuete + e.pit * CANTIDAD.pitaya + e.flo * CANTIDAD.flor;

  function pintar() {
    if (gl.isContextLost()) return;
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform2f(u.uRes, canvas.width, canvas.height);
    gl.uniform1f(u.uTiempo, tiempo);
    gl.uniform1f(u.uNivel, nivel());
    gl.uniform1f(u.uCac, e.cac);
    gl.uniform1f(u.uPit, e.pit);
    gl.uniform1f(u.uFlo, e.flo);
    gl.uniform1f(u.uGiro, e.giro);
    gl.uniform1f(u.uAng, e.ang);
    gl.uniform1f(u.uEmbudo, e.embudo);
    gl.uniform1f(u.uOla, e.ola);
    gl.uniform1f(u.uChorro, e.chorro);
    gl.uniform1f(u.uCabeza, e.cabeza);
    gl.uniform1f(u.uCola, e.cola);
    gl.uniform3fv(u.uColChorro, e.col);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  function ajustar() {
    const caja = canvas.getBoundingClientRect();
    /* Siempre sobremuestrea hasta dprMax, salvo en frascos enormes. */
    const dpr = Math.min(dprMax, ALTO_MAX / Math.max(caja.height, 1));
    const w = Math.max(2, Math.round(caja.width * dpr));
    const h = Math.max(2, Math.round(caja.height * dpr));
    if (canvas.width === w && canvas.height === h) return;
    canvas.width = w;
    canvas.height = h;
    gl.viewport(0, 0, w, h);
    pintar();
  }
  const observador = new ResizeObserver(ajustar);
  observador.observe(canvas);
  ajustar();

  function pasoVerter(a, t) {
    const superficie = nivel();
    const campo = CAMPO[a.id];
    e.col = COLOR[a.id];
    e.chorro = suave(t / 0.16) * (1 - suave((t - 1.3) / 0.22));
    e.cabeza = 1.05 + (superficie - 1.05) * suave(t / 0.3);
    e.cola = t < 1.12 ? 1.1 : 1.1 + (superficie - 1.1) * suave((t - 1.12) / 0.34);
    e[campo] = a.desde + (1 - a.desde) * suave((t - 0.22) / 1.05);
    e.ola = suave((t - 0.24) / 0.2) * Math.exp(-Math.max(0, t - 0.5) * 2.1);
    e.giro = a.giro + (a.id === 'cacahuete' ? 0 : 0.34) * suave((t - 0.3) / 1.2);
    return t >= T_VERTER;
  }

  function pasoFormar(a, t) {
    const v = t / T_FORMAR;
    e.giro = a.giro + (GIRO_FINAL - a.giro) * curvaGiro(v);
    e.ang = a.ang + VUELTAS_FINALES * curvaGiro(v);
    /* El embudo crece con la velocidad y al frenar rebota una vez. */
    const velocidad = Math.sin(Math.PI * limitar(v)) ** 2;
    e.embudo = velocidad - 0.16 * Math.sin(Math.PI * suave((v - 0.74) / 0.26));
    e.ola = 0.5 * suave((v - 0.8) / 0.1) * (1 - suave((v - 0.92) / 0.08));
    return t >= T_FORMAR;
  }

  function terminarActual() {
    if (!actual) return;
    if (actual.tipo === 'verter') {
      pasoVerter(actual, T_VERTER);
      e.chorro = 0;
      e.ola = 0;
      actual = null;
      return;
    }
    e.embudo = 0;
    e.ola = 0;
    e.giro = GIRO_FINAL;
    e.ang = actual.ang + VUELTAS_FINALES;
    deriva = !quieto;
    prisa = 1;
    const listo = actual.alListo;
    actual = null;
    listo?.();
  }

  const tomar = () => {
    actual = { ...cola.shift(), t: 0, giro: e.giro, ang: e.ang };
    if (actual.tipo === 'verter') actual.desde = e[CAMPO[actual.id]];
  };

  function bucle(ahora) {
    const real = previo ? (ahora - previo) / 1000 : 0.016;
    const dt = Math.min(0.05, real);
    previo = ahora;
    tiempo += dt;
    cuadro = 0;
    if (!actual && cola.length) tomar();
    if (actual) {
      actual.t += real * prisa;
      const fin = actual.tipo === 'verter' ? pasoVerter(actual, actual.t) : pasoFormar(actual, actual.t);
      if (fin) terminarActual();
    } else if (deriva) {
      e.ang += DERIVA * dt;
    }
    pintar();
    if (actual || cola.length || deriva) {
      if (!cuadro) cuadro = requestAnimationFrame(bucle);
    } else {
      previo = 0;
    }
  }

  const arrancar = () => {
    if (!cuadro) cuadro = requestAnimationFrame(bucle);
  };

  /* Sin movimiento: se salta al estado final de todo lo pendiente. */
  function vaciar() {
    terminarActual();
    while (cola.length) {
      tomar();
      terminarActual();
    }
    pintar();
  }

  const perdido = (ev) => {
    ev.preventDefault();
    cancelAnimationFrame(cuadro);
    cuadro = 0;
    cola.length = 0;
    actual = null;
    deriva = false;
    alPerder?.();
  };
  canvas.addEventListener('webglcontextlost', perdido);
  vigente.add(canvas);

  return {
    verter(id) {
      cola.push({ tipo: 'verter', id });
      if (quieto) vaciar();
      else arrancar();
    },
    formar(alListo) {
      cola.push({ tipo: 'formar', alListo });
      if (quieto) vaciar();
      else arrancar();
    },
    /* Acelera lo que falte; alListo llega igual, un instante después. */
    saltar() {
      if (quieto) vaciar();
      else if (actual || cola.length) {
        prisa = PRISA;
        arrancar();
      }
    },
    completar() {
      Object.assign(e, { cac: 1, pit: 1, flo: 1, giro: GIRO_FINAL, ang: 0.6, embudo: 0, ola: 0, chorro: 0 });
      deriva = !quieto;
      pintar();
      if (deriva) arrancar();
    },
    reiniciar() {
      cola.length = 0;
      actual = null;
      deriva = false;
      prisa = 1;
      Object.assign(e, { cac: 0, pit: 0, flo: 0, giro: 0, ang: 0, embudo: 0, ola: 0, chorro: 0, cabeza: 1.1, cola: 1.1 });
      pintar();
    },
    fijarReducido(valor) {
      quieto = valor;
      if (valor) {
        deriva = false;
        vaciar();
      } else if (e.giro >= GIRO_FINAL) {
        deriva = true;
        arrancar();
      }
    },
    destruir() {
      cancelAnimationFrame(cuadro);
      observador.disconnect();
      canvas.removeEventListener('webglcontextlost', perdido);
      cola.length = 0;
      actual = null;
      deriva = false;
      /* El contexto se libera sin esperar al recolector. Se aplaza un tic: en desarrollo,
         StrictMode vuelve a montar sobre este mismo lienzo y necesita el contexto vivo. */
      vigente.delete(canvas);
      setTimeout(() => {
        if (!vigente.has(canvas)) gl.getExtension('WEBGL_lose_context')?.loseContext();
      }, 0);
    },
  };
}
