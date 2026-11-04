/* Piezas pequeñas del sistema: Boton, BotonCerrar, Remolino, Sello, Ilu e iconos. */
import { forwardRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import selloSvg from '../assets/ilustraciones/sello.svg?raw';
import { GEOMETRIA_FRASCO, saborPorId } from '../data.js';
import { Go } from './Transicion.jsx';
import './piezas.css';

/** Inserta un SVG `?raw` en línea, para que herede color y variables (DESIGN §8). */
export function Ilu({ src, className = '', style, ...resto }) {
  return (
    <span
      className={`ilu ${className}`.trim()}
      style={style}
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: src }}
      {...resto}
    />
  );
}

/**
 * Frasco recortado, alineado por su eje y apoyado en su base.
 * La caja mide exactamente el frasco: `alto` es su altura aparente, igual en los tres
 * sabores. La fruta del lienzo sobresale de la caja sin afectar a la composición.
 * `alto`: longitud CSS ('100%', 'calc(62 * var(--cqh))', 'var(--x)'). `decorativo`: alt vacío.
 */
export function Frasco({ sabor, alto = '100%', decorativo = false, className = '', style }) {
  const datos = saborPorId(sabor);
  const g = GEOMETRIA_FRASCO[sabor];
  return (
    <span
      className={`frasco ${className}`.trim()}
      style={{
        height: alto,
        aspectRatio: g.proporcion,
        '--f-altura': g.altura,
        '--f-base': g.base,
        '--f-eje': g.eje,
        ...style,
      }}
    >
      <img
        className="frasco__lienzo"
        src={datos.frasco}
        alt={decorativo ? '' : datos.frascoAlt}
        draggable="false"
        decoding="async"
      />
    </span>
  );
}

export function IconoFlecha({ direccion = 'derecha', tam = 18 }) {
  return (
    <svg
      className="icono-flecha"
      width={tam}
      height={tam}
      viewBox="0 0 18 18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="square"
      aria-hidden="true"
      style={direccion === 'izquierda' ? { transform: 'scaleX(-1)' } : undefined}
    >
      <path d="M2 9h13M10.5 4.5 15 9l-4.5 4.5" />
    </svg>
  );
}

/**
 * Acción. `variante="billete"` (principal) o `"enlace"` (secundaria).
 * Con `to` es un enlace con transición (acepta `origen`); sin `to`, un <button>.
 */
export const Boton = forwardRef(function Boton(
  { to, variante = 'billete', flecha, className = '', children, ...resto },
  ref,
) {
  const conFlecha = flecha ?? variante === 'billete';
  const clases = `boton boton--${variante} ${className}`.trim();
  const contenido = (
    <>
      <span className="boton__texto">{children}</span>
      {conFlecha && <IconoFlecha />}
    </>
  );
  if (to) {
    return (
      <Go ref={ref} to={to} className={clases} {...resto}>
        {contenido}
      </Go>
    );
  }
  return (
    <button ref={ref} type="button" className={clases} {...resto}>
      {contenido}
    </button>
  );
});

/** Único cierre de las capas: misma forma, mismo sitio, misma palabra. */
export const BotonCerrar = forwardRef(function BotonCerrar({ className = '', children = 'Cerrar', ...resto }, ref) {
  return (
    <button ref={ref} type="button" className={`cerrar ${className}`.trim()} {...resto}>
      <span>{children}</span>
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" aria-hidden="true">
        <path d="M2 2l10 10M12 2 2 12" />
      </svg>
    </button>
  );
});

const CURVA_SELLO = [0.5, 0, 0.1, 1];

/** Firma de marca. `dibujar` traza las hebras al montar; cambia `key` para repetirlo. */
export function Remolino({ tam = 34, dibujar = false, duracion = 0.9, className = '', style }) {
  const trazo = dibujar
    ? {
        initial: { pathLength: 0 },
        animate: { pathLength: 1 },
        transition: { duration: duracion, ease: [0.76, 0, 0.24, 1] },
      }
    : {};
  return (
    <svg
      className={`remolino ${className}`.trim()}
      style={style}
      width={tam}
      height={(tam * 58) / 68}
      viewBox="20 20 68 58"
      fill="none"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <motion.path
        d="M50 50c6-6 16-2 15 7-1 12-19 16-28 7C26 53 31 30 50 27c22-3 37 18 31 39"
        strokeWidth="6"
        stroke="var(--remolino-a, currentColor)"
        {...trazo}
      />
      <motion.path
        d="M50 50c-5 4-13 1-12-6 1-8 13-11 20-5"
        strokeWidth="5"
        stroke="var(--remolino-b, currentColor)"
        {...trazo}
      />
    </svg>
  );
}

const escapar = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;');

/**
 * Sello de cuaderno. Decorativo: siempre aria-hidden; el dato real va en el texto.
 * `opaco`: true usa --c-pitaya como mancha; también admite un color. Obligatorio sobre imagen.
 * `cae`: entra con el golpe seco de --m-sello.
 */
export function Sello({ arriba, abajo, centro, tam = 170, rot = -4, opaco = false, cae = false, className = '', style }) {
  const html = useMemo(() => {
    const arcos = tam >= 170;
    const estilo = 'font-family:var(--f-display);fill:currentColor;stroke:none;text-anchor:middle';
    let extra = '';
    if (arcos && arriba) {
      extra += `<text style="${estilo};font-size:15px;letter-spacing:.08em"><textPath href="#sello-arco-superior" startOffset="50%">${escapar(arriba)}</textPath></text>`;
    }
    if (arcos && abajo) {
      extra += `<text style="${estilo};font-size:14px;letter-spacing:.08em"><textPath href="#sello-arco-inferior" startOffset="50%">${escapar(abajo)}</textPath></text>`;
    }
    if (centro) {
      extra += `<text x="120" y="141" style="${estilo};font-size:58px;font-style:italic">${escapar(centro)}</text>`;
    }
    return selloSvg.replace('</svg>', `${extra}</svg>`);
  }, [arriba, abajo, centro, tam]);

  const mancha = opaco === true ? 'var(--c-pitaya)' : opaco || undefined;
  const entrada = cae
    ? {
        initial: { scale: 1.5, rotate: rot - 10, opacity: 0 },
        animate: { scale: 1, rotate: rot, opacity: 1 },
        transition: { duration: 0.18, ease: CURVA_SELLO },
      }
    : { initial: false, animate: { rotate: rot } };

  return (
    <motion.span
      className={`sello ilu ${className}`.trim()}
      style={{ width: tam, ...(mancha ? { '--ilu-mancha': mancha } : null), ...style }}
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: html }}
      {...entrada}
    />
  );
}
