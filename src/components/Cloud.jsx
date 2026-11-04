/* Motor de partículas por transform. Lo usan la Web F y Ubud.
   Cada partícula tiene una trayectoria base y un desvío con muelle que la aparta del cursor.
   Contrato en src/ARQUITECTURA.md. */
import { memo, useEffect, useMemo, useRef } from 'react';
import { CONSULTA_TACTIL, useTactil } from '../hooks.js';
import { useViaje } from '../state.jsx';
import './cloud.css';

/* Formas simples del prototipo. */
export const FORMAS = {
  cacahuete: (c) => (
    <svg viewBox="0 0 100 60" aria-hidden="true">
      <path
        d="M8 30c0-16 14-24 28-20 8 2 12 5 18 3 8-3 12-6 22-4 14 3 18 16 16 26-3 15-19 21-33 15-7-3-12-3-19 0C22 58 8 46 8 30z"
        fill={c}
      />
      <path
        d="M26 18c-6 8-6 18 0 26M48 16c-3 10-3 20 0 30M72 16c5 9 5 19 0 28"
        stroke="#7a5426"
        strokeWidth="1.3"
        fill="none"
        opacity=".6"
      />
    </svg>
  ),
  petalo: (c) => (
    <svg viewBox="0 0 60 60" aria-hidden="true">
      <path d="M30 4C46 18 50 38 30 56 10 38 14 18 30 4z" fill={c} />
      <path d="M30 8v44" stroke="#fff" strokeOpacity=".5" />
    </svg>
  ),
  hoja: (c) => (
    <svg viewBox="0 0 60 60" aria-hidden="true">
      <path d="M6 54C6 24 26 6 56 4c0 30-20 50-50 50z" fill={c} />
      <path d="M8 52 50 10" stroke="#fff" strokeOpacity=".45" />
    </svg>
  ),
  estrella: (c) => (
    <svg viewBox="0 0 40 40" aria-hidden="true">
      <path d="M20 2l4 14 14 4-14 4-4 14-4-14-14-4 14-4z" fill={c} />
    </svg>
  ),
  semilla: (c) => (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <ellipse cx="10" cy="10" rx="5" ry="8" fill={c} />
    </svg>
  ),
};

const DOS_PI = Math.PI * 2;
/* Semilla determinista: cada carga compone la misma nube. */
const azar = (i, n) => {
  const v = Math.sin((i + 1) * 12.9898 + n * 78.233) * 43758.5453;
  return v - Math.floor(v);
};

function Particula({ item, indice, alElegir }) {
  const Etiqueta = item.frase ? 'button' : 'span';
  const contenido = item.ilu ? (
    <span
      className="ilu"
      style={item.mancha ? { '--ilu-mancha': item.mancha } : undefined}
      dangerouslySetInnerHTML={{ __html: item.ilu }}
    />
  ) : (
    FORMAS[item.forma]?.(item.color)
  );
  const props = item.frase
    ? {
        type: 'button',
        'aria-label': item.etiqueta || 'Elemento flotante con una frase',
        onClick: (e) => {
          e.currentTarget.dataset.tocado = '';
          alElegir?.(item, e.currentTarget);
        },
      }
    : { 'aria-hidden': true };
  return (
    <Etiqueta
      className={`flot${item.frase ? ' flot--toca' : ''}${item.oro ? ' flot--oro' : ''}`}
      data-indice={indice}
      style={{ width: item.tam }}
      {...props}
    >
      {contenido}
    </Etiqueta>
  );
}

function CloudBase({
  items,
  modo = 'deriva',
  radio = 120,
  rigidez = 260,
  amortiguacion = 18,
  caida = [14, 34],
  activa = true,
  esquivaTactil = false,
  mitadEnTactil = true,
  respuesta = false,
  className = '',
  alElegir,
}) {
  const { reducido } = useViaje();
  const tactil = useTactil();
  const raiz = useRef(null);

  const visibles = useMemo(
    () => (mitadEnTactil && tactil ? items.filter((it, i) => it.frase || i % 2 === 0) : items),
    [items, mitadEnTactil, tactil],
  );

  useEffect(() => {
    const cont = raiz.current;
    if (!cont) return undefined;
    let W = cont.clientWidth;
    let H = cont.clientHeight;
    const cursor = { x: -9999, y: -9999, activo: false };

    const vivos = [...cont.querySelectorAll('.flot')].map((el) => {
      const item = visibles[Number(el.dataset.indice)];
      const i = Number(el.dataset.indice);
      const r = el.getBoundingClientRect();
      return {
        el,
        item,
        w: el.offsetWidth || r.width,
        h: el.offsetHeight || r.height,
        fx: item.x ?? azar(i, 1),
        fy: item.y ?? azar(i, 2),
        x: 0,
        y: 0,
        /* Deriva: periodos de 12 a 20 s, como pide el diseño. */
        tx: 12 + azar(i, 3) * 8,
        ty: 12 + azar(i, 4) * 8,
        fase: azar(i, 5) * DOS_PI,
        ax: 18 + azar(i, 6) * 26,
        ay: 14 + azar(i, 7) * 22,
        vel: 0.75 + azar(i, 8) * 0.5,
        g: azar(i, 9) * 360,
        vg: (azar(i, 10) - 0.5) * 34,
        ox: 0,
        oy: 0,
        vx: 0,
        vy: 0,
        fatiga: 0,
        quieto: false,
      };
    });

    const situar = (v) => {
      v.x = v.fx * Math.max(0, W - v.w);
      v.y = v.fy * Math.max(0, H - v.h);
    };
    vivos.forEach(situar);

    const pintar = (v, x, y, g) => {
      v.el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) rotate(${g.toFixed(1)}deg)`;
    };
    const quieta = () => vivos.forEach((v) => pintar(v, v.x, v.y, modo === 'caida' ? v.g : v.g % 24 - 12));
    quieta();

    let cuadro = 0;
    let espera = 0;
    let previo = 0;
    let reloj = 0;
    const tactil = window.matchMedia(CONSULTA_TACTIL).matches;

    /* En táctil, 30 fps: el temporizador deja libres los fotogramas intermedios. */
    const pedir = () => {
      if (tactil) {
        espera = setTimeout(() => {
          cuadro = requestAnimationFrame(paso);
        }, 20);
      } else {
        cuadro = requestAnimationFrame(paso);
      }
    };
    const detener = () => {
      clearTimeout(espera);
      cancelAnimationFrame(cuadro);
    };

    const paso = (ahora) => {
      const dt = Math.min(0.033, previo ? (ahora - previo) / 1000 : 0.016);
      previo = ahora;
      reloj += dt;

      for (const v of vivos) {
        let bx;
        let by;
        let g;
        if (modo === 'caida') {
          v.x += caida[0] * v.vel * dt;
          v.y += caida[1] * v.vel * dt;
          if (v.x > W + v.w) v.x = -v.w;
          if (v.y > H + v.h) {
            v.y = -v.h;
            v.x = azar(v.y + reloj, 1) * W;
          }
          v.g += v.vg * dt;
          bx = v.x;
          by = v.y;
          g = v.g;
        } else {
          bx = v.x + Math.sin((DOS_PI * reloj) / v.tx + v.fase) * v.ax;
          by = v.y + Math.cos((DOS_PI * reloj) / v.ty + v.fase) * v.ay;
          g = (v.g % 24) - 12 + Math.sin((DOS_PI * reloj) / v.ty + v.fase) * 9;
        }

        let objetivoX = 0;
        let objetivoY = 0;
        const dx = bx + v.w / 2 - cursor.x;
        const dy = by + v.h / 2 - cursor.y;
        const d = Math.hypot(dx, dy) || 0.01;
        const alcance = radio + Math.max(v.w, v.h) * 0.35;
        const cerca = cursor.activo && d < alcance && !v.quieto;
        if (cerca) {
          /* Con frase se cansa de huir: si insistes, se deja atrapar. */
          if (v.item.frase) v.fatiga = Math.min(1, v.fatiga + dt / 1.1);
          const empuje = (alcance - d) * (1 - v.fatiga);
          objetivoX = (dx / d) * empuje;
          objetivoY = (dy / d) * empuje;
        } else if (!v.quieto) {
          v.fatiga = Math.max(0, v.fatiga - dt / 2.4);
        }

        v.vx += (rigidez * (objetivoX - v.ox) - amortiguacion * v.vx) * dt;
        v.vy += (rigidez * (objetivoY - v.oy) - amortiguacion * v.vy) * dt;
        v.ox += v.vx * dt;
        v.oy += v.vy * dt;

        let x = bx + v.ox;
        let y = by + v.oy;
        if (modo !== 'caida') {
          x = Math.min(Math.max(0, x), Math.max(0, W - v.w));
          y = Math.min(Math.max(0, y), Math.max(0, H - v.h));
        }
        pintar(v, x, y, g);
      }
      pedir();
    };

    const mover = (e) => {
      if (e.pointerType === 'touch' && !esquivaTactil) return;
      const r = cont.getBoundingClientRect();
      cursor.x = e.clientX - r.left;
      cursor.y = e.clientY - r.top;
      cursor.activo = true;
    };
    const soltar = (e) => {
      if (e.pointerType === 'touch') cursor.activo = false;
    };
    const salir = () => {
      cursor.activo = false;
    };

    /* Toda partícula contesta al toque, tenga frase o no: un empujón y un latido. */
    const reaccionar = (e) => {
      const v = vivos.find((p) => p.el === e.currentTarget);
      if (!v) return;
      const dibujo = v.el.firstElementChild;
      if (reducido) {
        dibujo?.animate?.({ opacity: [0.55, 1] }, { duration: 180 });
        return;
      }
      const angulo = azar(v.el.dataset.indice, reloj) * DOS_PI;
      v.vx += Math.cos(angulo) * 300;
      v.vy += Math.sin(angulo) * 300;
      dibujo?.animate?.(
        { transform: ['scale(1)', 'scale(1.2) rotate(7deg)', 'scale(1)'] },
        { duration: 340, easing: 'cubic-bezier(0.22, 0.9, 0.3, 1)' },
      );
    };
    if (respuesta) vivos.forEach(({ el }) => el.addEventListener('pointerdown', reaccionar));

    /* Con foco o cursor encima, el elemento deja de esquivar. */
    const parar = (e) => {
      const v = vivos.find((p) => p.el === e.currentTarget);
      if (v) v.quieto = true;
    };
    const seguir = (e) => {
      const v = vivos.find((p) => p.el === e.currentTarget);
      if (v) v.quieto = false;
    };
    const tocables = vivos.filter((v) => v.item.frase);
    tocables.forEach(({ el }) => {
      el.addEventListener('focus', parar);
      el.addEventListener('blur', seguir);
      el.addEventListener('pointerenter', parar);
      el.addEventListener('pointerleave', seguir);
    });

    const observador = new ResizeObserver(() => {
      W = cont.clientWidth;
      H = cont.clientHeight;
      if (modo !== 'caida') vivos.forEach(situar);
      if (reducido || !activa) quieta();
    });
    observador.observe(cont);

    /* Fuera de vista no se anima: en móvil se pasa la mayor parte del tiempo leyendo el folio. */
    const vista = new IntersectionObserver(([e]) => {
      detener();
      if (e.isIntersecting) {
        previo = 0;
        cuadro = requestAnimationFrame(paso);
      }
    });

    if (activa && !reducido) {
      window.addEventListener('pointermove', mover, { passive: true });
      window.addEventListener('pointerdown', mover, { passive: true });
      window.addEventListener('pointerup', soltar, { passive: true });
      window.addEventListener('pointercancel', salir, { passive: true });
      document.documentElement.addEventListener('pointerleave', salir);
      vista.observe(cont);
    }

    return () => {
      detener();
      vista.disconnect();
      observador.disconnect();
      window.removeEventListener('pointermove', mover);
      window.removeEventListener('pointerdown', mover);
      window.removeEventListener('pointerup', soltar);
      window.removeEventListener('pointercancel', salir);
      vivos.forEach(({ el }) => el.removeEventListener('pointerdown', reaccionar));
      document.documentElement.removeEventListener('pointerleave', salir);
      tocables.forEach(({ el }) => {
        el.removeEventListener('focus', parar);
        el.removeEventListener('blur', seguir);
        el.removeEventListener('pointerenter', parar);
        el.removeEventListener('pointerleave', seguir);
      });
    };
  }, [visibles, modo, radio, rigidez, amortiguacion, caida, activa, esquivaTactil, respuesta, reducido]);

  return (
    <div ref={raiz} className={`nube${respuesta ? ' nube--responde' : ''} ${className}`.trim()}>
      {visibles.map((item, i) => (
        <Particula key={item.id ?? i} item={item} indice={i} alElegir={alElegir} />
      ))}
    </div>
  );
}

export const Cloud = memo(CloudBase);
export default Cloud;
