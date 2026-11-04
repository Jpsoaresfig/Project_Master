/* Transición de remolino entre rutas (DESIGN §4). Clic, Esc o cualquier tecla la omiten.
   Atrás del navegador gana siempre: anula el destino y cierra el velo. */
import { createContext, forwardRef, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useHref, useLocation, useNavigate } from 'react-router-dom';
import { metaDeRuta, normalizarRuta } from '../data.js';
import { precargarRuta } from '../rutasDiferidas.js';
import { useViaje } from '../state.jsx';
import './transicion.css';

const GIRO = 'cubic-bezier(0.76, 0, 0.24, 1)';
const CUBRE = 700;
const REVELA = 620;
const FUNDIDO = 160;
const VUELTAS = 6;

const Contexto = createContext(null);

/* Teclas del sistema: nunca omiten el velo ni se bloquean (F5, Alt+←, Ctrl+R, multimedia…). */
const TECLA_DEL_SISTEMA = /^(F\d{1,2}|Alt|AltGraph|Control|Meta|Shift|OS|CapsLock|Fn|Browser.*|Audio.*|Media.*|Launch.*)$/;
const esTeclaLibre = (e) => e.altKey || e.ctrlKey || e.metaKey || TECLA_DEL_SISTEMA.test(e.key);

/**
 * { ir(to, punto?), fase: 'reposo' | 'cubre' | 'revela', activa, libre(), reservar(bool) }.
 * `libre()`: no hay velo ni salida reservada; las capas lo consultan antes de abrirse.
 * `reservar(true)`: anuncia una salida inminente (el frasco elegido). Null fuera del Layout.
 */
export const useTransicion = () => useContext(Contexto);

/* Espiral de Arquímedes. pathLength="1". Segunda hebra: desfase = Math.PI. */
function espiral(cx, cy, R, vueltas, desfase = 0) {
  const pasos = vueltas * 96;
  let d = '';
  for (let i = 0; i <= pasos; i += 1) {
    const t = i / pasos;
    const a = t * vueltas * 2 * Math.PI + desfase;
    d += `${i ? 'L' : 'M'}${(cx + R * t * Math.cos(a)).toFixed(1)} ${(cy + R * t * Math.sin(a)).toFixed(1)}`;
  }
  return d;
}

function Velo({ vuelo, control, alCubrir, alRevelar, alTerminar }) {
  const { reducido } = vuelo;
  const raiz = useRef(null);
  const giro = useRef(null);
  const hebraA = useRef(null);
  const hebraB = useRef(null);

  const trazo = useMemo(() => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const { x, y } = vuelo;
    /* Radio justo para llegar a la esquina más lejana: así todo el trazo se ve. */
    const R = Math.hypot(Math.max(x, w - x), Math.max(y, h - y)) * 1.2;
    return {
      w,
      h,
      a: espiral(x, y, R, VUELTAS),
      b: espiral(x, y, R, VUELTAS, Math.PI),
      /* Cada hebra tiene un paso de R / VUELTAS. La A lo cubre entero; la B pinta la mitad. */
      anchoA: (R / VUELTAS) * 1.04,
      anchoB: (R / VUELTAS) * 0.5,
    };
  }, [vuelo]);

  useLayoutEffect(() => {
    let vivo = true;
    let cubierto = false;
    let anulado = false;
    let cuadro = 0;
    const animaciones = [];
    const animar = (el, fotogramas, opciones) => {
      const a = el.animate(fotogramas, { easing: GIRO, fill: 'forwards', ...opciones });
      animaciones.push(a);
      return a;
    };
    const cubrir = () => {
      if (cubierto) return;
      cubierto = true;
      alCubrir();
    };
    const terminar = () => {
      if (!vivo) return;
      vivo = false;
      animaciones.forEach((a) => a.cancel());
      alTerminar();
    };
    const revelar = () => {
      if (!vivo || anulado) return;
      alRevelar();
      if (reducido) {
        animar(raiz.current, { opacity: [1, 0] }, { duration: FUNDIDO, easing: 'linear' }).onfinish = terminar;
        return;
      }
      const tiempo = { duration: REVELA };
      animar(giro.current, { transform: ['rotate(120deg)', 'rotate(240deg)'] }, tiempo);
      animar(hebraA.current, { strokeDashoffset: ['0', '-1'] }, tiempo);
      animar(hebraB.current, { strokeDashoffset: ['0', '-1'] }, tiempo).onfinish = terminar;
    };
    const cubierta = () => {
      cubrir();
      /* Dos fotogramas: que React pinte la ruta nueva antes de abrir. */
      cuadro = requestAnimationFrame(() => {
        cuadro = requestAnimationFrame(revelar);
      });
    };

    if (reducido) {
      animar(raiz.current, { opacity: [0, 1] }, { duration: FUNDIDO, easing: 'linear' }).onfinish = cubierta;
    } else {
      const tiempo = { duration: CUBRE };
      animar(giro.current, { transform: ['rotate(0deg)', 'rotate(120deg)'] }, tiempo);
      animar(hebraA.current, { strokeDashoffset: ['1', '0'] }, tiempo);
      animar(hebraB.current, { strokeDashoffset: ['1', '0'] }, tiempo).onfinish = cubierta;
    }

    /* Atrás durante el velo: sin navegar, se detiene el trazo y se funde. */
    control.current = () => {
      if (!vivo || anulado) return;
      anulado = true;
      cubierto = true;
      cancelAnimationFrame(cuadro);
      animaciones.forEach((a) => a.pause());
      alRevelar();
      animar(raiz.current, { opacity: [1, 0] }, { duration: FUNDIDO, easing: 'linear' }).onfinish = terminar;
    };

    const saltar = () => {
      if (anulado) return;
      cancelAnimationFrame(cuadro);
      cubrir();
      terminar();
    };
    const tecla = (e) => {
      if (e.repeat || esTeclaLibre(e)) return;
      e.preventDefault();
      e.stopPropagation();
      saltar();
    };
    const velo = raiz.current;
    velo.addEventListener('pointerdown', saltar);
    window.addEventListener('keydown', tecla, true);

    return () => {
      vivo = false;
      control.current = null;
      cancelAnimationFrame(cuadro);
      velo.removeEventListener('pointerdown', saltar);
      window.removeEventListener('keydown', tecla, true);
      animaciones.forEach((a) => a.cancel());
    };
  }, [vuelo, reducido, control, alCubrir, alRevelar, alTerminar]);

  return (
    <div
      ref={raiz}
      className={`velo${reducido ? ' velo--fundido' : ''}`}
      data-theme={vuelo.tema}
      data-velo=""
      aria-hidden="true"
    >
      {!reducido && (
        <svg width={trazo.w} height={trazo.h} viewBox={`0 0 ${trazo.w} ${trazo.h}`} fill="none">
          <g ref={giro} style={{ transformOrigin: `${vuelo.x}px ${vuelo.y}px` }}>
            <path ref={hebraA} className="velo__a" d={trazo.a} pathLength="1" strokeWidth={trazo.anchoA} />
            <path ref={hebraB} className="velo__b" d={trazo.b} pathLength="1" strokeWidth={trazo.anchoB} />
          </g>
        </svg>
      )}
    </div>
  );
}

export function TransicionProvider({ children }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { reducido } = useViaje();
  const [vuelo, setVuelo] = useState(null);
  const [fase, setFase] = useState('reposo');
  const ocupado = useRef(false);
  const reservado = useRef(false);
  const control = useRef(null);
  const reducidoActual = useRef(reducido);
  reducidoActual.current = reducido;
  const rutaActual = useRef(pathname);
  rutaActual.current = pathname;
  const destino = useRef(null);
  /* useNavigate cambia de identidad con cada ruta: por ref, para no reiniciar el Velo. */
  const irA = useRef(navigate);
  irA.current = navigate;

  const ir = useCallback((to, punto) => {
    if (ocupado.current || reservado.current) return;
    if (normalizarRuta(to) === normalizarRuta(rutaActual.current)) {
      window.scrollTo(0, 0);
      return;
    }
    ocupado.current = true;
    destino.current = to;
    /* El velo no espera: si el trozo llega tarde, lo cubre el Suspense del Layout. */
    precargarRuta(to);
    setFase('cubre');
    setVuelo({
      clave: Date.now(),
      tema: metaDeRuta(to).tema || 'inicio',
      reducido: reducidoActual.current,
      x: punto?.x ?? window.innerWidth / 2,
      y: punto?.y ?? window.innerHeight / 2,
    });
  }, []);

  const libre = useCallback(() => !ocupado.current && !reservado.current, []);
  const reservar = useCallback((v) => {
    reservado.current = v;
  }, []);

  /* Atrás, adelante o Alt+←: gana el usuario. El router ya aplica su ruta. */
  useEffect(() => {
    const alVolver = () => {
      if (!ocupado.current) return;
      destino.current = null;
      control.current?.();
    };
    window.addEventListener('popstate', alVolver);
    return () => window.removeEventListener('popstate', alVolver);
  }, []);

  const alCubrir = useCallback(() => {
    const a = destino.current;
    destino.current = null;
    if (a) irA.current(a);
  }, []);
  const alRevelar = useCallback(() => setFase('revela'), []);
  const alTerminar = useCallback(() => {
    ocupado.current = false;
    setVuelo(null);
    setFase('reposo');
  }, []);

  const valor = useMemo(
    () => ({ ir, fase, activa: fase !== 'reposo', libre, reservar }),
    [ir, fase, libre, reservar],
  );

  return (
    <Contexto.Provider value={valor}>
      {children}
      {vuelo && (
        <Velo
          key={vuelo.clave}
          vuelo={vuelo}
          control={control}
          alCubrir={alCubrir}
          alRevelar={alRevelar}
          alTerminar={alTerminar}
        />
      )}
    </Contexto.Provider>
  );
}

/** Centro de un elemento, para que el remolino nazca ahí. */
export function centroDe(el) {
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

/**
 * Enlace interno que pasa por la transición. Acepta todas las props de <a>.
 * Con ctrl, cmd, mayúsculas o botón central se comporta como un enlace normal.
 * `origen`: ref opcional de un elemento; el remolino nace en su centro.
 */
export const Go = forwardRef(function Go({ to, origen, onClick, children, ...resto }, ref) {
  const transicion = useTransicion();
  const navigate = useNavigate();
  const href = useHref(to);

  const pulsar = (e) => {
    onClick?.(e);
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    if (!transicion) {
      navigate(to);
      return;
    }
    /* Con teclado clientX vale 0: se usa el centro del enlace. */
    const conPuntero = e.clientX !== 0 || e.clientY !== 0;
    let punto = { x: e.clientX, y: e.clientY };
    if (origen?.current) punto = centroDe(origen.current);
    else if (!conPuntero) punto = centroDe(e.currentTarget);
    transicion.ir(to, punto);
  };

  return (
    <a ref={ref} href={href} onClick={pulsar} {...resto}>
      {children}
    </a>
  );
});
