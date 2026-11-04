/* De vuelta a casa: la pared de Inicio, ya con los tres frascos (DESIGN §5). */
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import cacahuete from '../assets/ilustraciones/cacahuete.svg?raw';
import pitaya from '../assets/ilustraciones/pitaya.svg?raw';
import florNopal from '../assets/ilustraciones/flor-nopal.svg?raw';
import { CIERRE, ESLOGAN_A, ESLOGAN_B, SABORES } from '../data.js';
import { useTactil } from '../hooks.js';
import { useViaje } from '../state.jsx';
import { Boton, Frasco, Go, Hoja, Ilu, Pantalla, Sello, useTransicion } from '../components/index.js';
import { contorno, linea, vena } from './cinta.js';
import '../styles/final.css';

const INTERVALO = 420;
const VUELO = 520;
const PASO_SELLO = 200;
const MARGEN_RUTA = 96;
const ROTACIONES = [-6, 5, -3];
const CURVA_SELLO = [0.5, 0, 0.1, 1];
const CURVA_HEBRA = [0.76, 0, 0.24, 1];

const VOLVER = {
  casa: 'Volver a Casa',
  ubud: 'Volver a Ubud, Bali',
  atacama: 'Volver al Desierto de Atacama',
};
/* Color y motivo de cada destino: el sello dice de dónde vienes antes de leerlo. */
const SELLOS = {
  casa: { color: 'var(--c-cacahuete-osc, #8A5A2B)', motivo: cacahuete },
  ubud: { color: 'var(--c-pitaya)', motivo: pitaya },
  atacama: { color: 'var(--c-flor-osc, #6C4585)', motivo: florNopal },
};
const TINTAS = {
  casa: { base: 'var(--c-cacahuete)', luz: '#E9C08C', sombra: 'rgb(74 44 16 / 0.42)' },
  ubud: { base: 'var(--c-pitaya)', luz: '#F7A3C4', sombra: 'rgb(84 6 40 / 0.42)' },
  atacama: { base: 'var(--c-flor)', luz: '#D9C4EA', sombra: 'rgb(48 24 70 / 0.42)' },
};

const limitar = (v, a, b) => Math.min(b, Math.max(a, v));

/** Hueco libre mayor: bajo el titular o a su derecha. Siempre sobre los frascos. */
function huecoLibre(ancho, titulo, techo, cimaFrascos, m) {
  const debajo = { x0: m, x1: ancho - m, y0: titulo.bottom + m, y1: cimaFrascos - m };
  const lado = { x0: titulo.right + m, x1: ancho - m, y0: techo, y1: cimaFrascos - m };
  const radio = (c) => Math.min(c.x1 - c.x0, c.y1 - c.y0) / 2;
  return radio(lado) > radio(debajo) ? lado : debajo;
}

/** Hebra `i`: sale de la boca del frasco y entra al remolino por debajo, ya girando.
    Al entrar por la mitad inferior, ningún tramo pasa por la altura del titular. */
function trazarHebra(i, boca, hueco, grueso, titulo, m) {
  const cx = (hueco.x0 + hueco.x1) / 2;
  const cy = (hueco.y0 + hueco.y1) / 2;
  const radio = Math.max(8, Math.min(hueco.x1 - hueco.x0, hueco.y1 - hueco.y0) / 2 - grueso);
  /* Tres brazos concéntricos: entran a la izquierda, abajo y a la derecha del giro. */
  const a0 = ((104 - i * 36) * Math.PI) / 180;
  const R = radio * (1 - i * 0.06);
  const vueltas = 1.45;
  const entrada = [cx + Math.cos(a0) * R, cy + Math.sin(a0) * R];
  /* Giro antihorario en pantalla: la tangente empuja hacia la derecha y arriba. */
  const tx = Math.sin(a0);
  const ty = -Math.cos(a0);
  const largo = Math.hypot(entrada[0] - boca[0], entrada[1] - boca[1]);
  const suelo = titulo.bottom + m + grueso;
  const c1 = [boca[0], Math.max(boca[1] - largo * 0.46, Math.min(boca[1], suelo))];
  const c2 = [entrada[0] - tx * largo * 0.46, Math.max(entrada[1] - ty * largo * 0.46, suelo)];
  const puntos = [];
  const pasosSubida = 70;
  for (let n = 0; n <= pasosSubida; n += 1) {
    const t = n / pasosSubida;
    const u = 1 - t;
    puntos.push([
      u * u * u * boca[0] + 3 * u * u * t * c1[0] + 3 * u * t * t * c2[0] + t * t * t * entrada[0],
      u * u * u * boca[1] + 3 * u * u * t * c1[1] + 3 * u * t * t * c2[1] + t * t * t * entrada[1],
    ]);
  }
  const pasosGiro = 170;
  for (let n = 1; n <= pasosGiro; n += 1) {
    const t = n / pasosGiro;
    /* Al enroscarse, cada brazo se abre un tercio de vuelta: se ven los tres sabores. */
    const a = a0 - t * vueltas * Math.PI * 2 - i * ((Math.PI * 2) / 3) * Math.min(1, t * 2.2);
    const r = R * (1 - t * 0.9) ** 1.15;
    puntos.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
  }
  for (let vez = 0; vez < 4; vez += 1) {
    for (let n = 1; n < puntos.length - 1; n += 1) {
      puntos[n] = [
        (puntos[n - 1][0] + puntos[n][0] * 2 + puntos[n + 1][0]) / 4,
        (puntos[n - 1][1] + puntos[n][1] * 2 + puntos[n + 1][1]) / 4,
      ];
    }
  }
  /* Pincelada de crema: nace fina en la boca, engorda, se estira y muere en punta. */
  const ancho = (t) => {
    const cuerpo = Math.sin(Math.PI * t ** 0.5) ** 0.9;
    const pulso = 0.76 + 0.24 * Math.sin(t * 8.5 + i * 2.1) + 0.06 * Math.sin(t * 41 + i);
    return grueso * Math.max(0.03, 0.26 * (1 - t) + cuerpo) * pulso;
  };
  return {
    d: contorno(puntos, ancho),
    luz: vena(puntos, ancho, -0.3, 0.26, 0.2),
    sombra: vena(puntos, ancho, 0.34, 0.2, 0.26),
    linea: linea(puntos),
    mascara: grueso * 3,
  };
}

export default function Final() {
  const { reducido, visitados } = useViaje();
  const tactil = useTactil();
  const transicion = useTransicion();
  const [montado, setMontado] = useState(false);
  const [llegados, setLlegados] = useState(reducido ? SABORES.length : 0);
  const [caidos, setCaidos] = useState(reducido ? SABORES.length : 0);
  const [selloEnVista, setSelloEnVista] = useState(false);
  const [resaltado, setResaltado] = useState(null);
  const [geo, setGeo] = useState(null);

  const giro = useRef(null);
  const titular = useRef(null);
  const fila = useRef(null);
  const sellos = useRef(null);

  const listo = montado && transicion?.fase !== 'cubre';
  const palabras = CIERRE.split(' ');
  const lineas = [palabras.slice(0, 2), palabras.slice(2)];
  const pendientes = useMemo(() => SABORES.filter((s) => !visitados[s.id]), [visitados]);

  useEffect(() => {
    const cuadro = requestAnimationFrame(() => setMontado(true));
    return () => cancelAnimationFrame(cuadro);
  }, []);

  /* Cada frasco aterriza a su hora; al aterrizar cae su hebra. */
  useEffect(() => {
    if (reducido) {
      setLlegados(SABORES.length);
      return undefined;
    }
    if (!listo) return undefined;
    const relojes = SABORES.map((_, i) =>
      setTimeout(() => setLlegados((n) => Math.max(n, i + 1)), i * INTERVALO + VUELO),
    );
    return () => relojes.forEach(clearTimeout);
  }, [listo, reducido]);

  /* Los sellos esperan a verse: en móvil quedan bajo el pliegue y su caída no debe perderse. */
  useEffect(() => {
    const el = sellos.current;
    if (!el) return undefined;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setSelloEnVista(true);
          obs.disconnect();
        }
      },
      /* La barra de ruta tapa el pie de la vista: visto es por encima de ella. */
      { threshold: 0.6, rootMargin: `0px 0px -${MARGEN_RUTA}px 0px` },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (reducido) {
      setCaidos(SABORES.length);
      return undefined;
    }
    if (!selloEnVista || caidos >= llegados) return undefined;
    const t = setTimeout(() => setCaidos((n) => n + 1), PASO_SELLO);
    return () => clearTimeout(t);
  }, [reducido, selloEnVista, caidos, llegados]);

  /* Las hebras se trazan con las medidas reales: boca de cada frasco y hueco que deja el titular. */
  const medir = useCallback(() => {
    const capa = giro.current;
    const h1 = titular.current;
    const caja = fila.current;
    if (!capa || !h1 || !caja) return;
    const rc = capa.getBoundingClientRect();
    if (!rc.width) return;
    const rt = h1.getBoundingClientRect();
    const titulo = { right: rt.right - rc.left, bottom: rt.bottom - rc.top };
    const m = Math.max(12, rc.height * 0.022);
    const pestana = parseFloat(getComputedStyle(capa).getPropertyValue('--tope-giro')) || 56;
    const enlaces = [...caja.querySelectorAll('.final__enlace')];
    const bocas = enlaces.map((el) => {
      const r = el.getBoundingClientRect();
      return { x: r.left + r.width / 2 - rc.left, y: r.top - rc.top, alto: r.height };
    });
    const alto = Math.max(...bocas.map((b) => b.alto));
    const cima = Math.min(...bocas.map((b) => b.y));
    const hueco = huecoLibre(rc.width, titulo, pestana, cima, m);
    const grueso = limitar(alto * 0.032, 3.5, 19);
    setGeo({
      w: rc.width,
      h: rc.height,
      hebras: bocas.map((b, i) => trazarHebra(i, [b.x, b.y + alto * 0.018], hueco, grueso, titulo, m)),
    });
  }, []);

  useLayoutEffect(() => {
    medir();
    const capa = giro.current;
    if (!capa) return undefined;
    const obs = new ResizeObserver(medir);
    obs.observe(capa);
    document.fonts?.ready.then(medir);
    return () => obs.disconnect();
  }, [medir]);

  /* En táctil no hay hover: el primer toque resalta la hebra y el rótulo; el segundo viaja. */
  const tocarFrasco = (e, id) => {
    if (!tactil || e.detail === 0 || resaltado === id) return;
    e.preventDefault();
    e.stopPropagation();
    setResaltado(id);
  };

  let indicePalabra = 0;

  const escenario = (
    <>
      <div className="pared" aria-hidden="true" />

      <div className="final__giro" ref={giro} aria-hidden="true">
        {geo && (
          <svg
            className="final__remolino"
            viewBox={`0 0 ${geo.w} ${geo.h}`}
            fill="none"
            data-resaltado={resaltado || undefined}
          >
            {SABORES.map((s, i) => {
              const h = geo.hebras[i];
              const tinta = TINTAS[s.id];
              const id = `hebra-${s.id}`;
              const cinta = (
                <>
                  <path d={h.d} fill={tinta.base} />
                  <path d={h.sombra} fill={tinta.sombra} />
                  <path d={h.luz} fill={tinta.luz} fillOpacity="0.58" />
                </>
              );
              return (
                <g key={s.id} className="final__hebra" data-sabor={s.id}>
                  {reducido ? (
                    cinta
                  ) : (
                    <>
                      <mask id={id} maskUnits="userSpaceOnUse" x="0" y="0" width={geo.w} height={geo.h}>
                        <motion.path
                          d={h.linea}
                          stroke="#fff"
                          strokeWidth={h.mascara}
                          strokeLinecap="round"
                          initial={false}
                          animate={{ pathLength: llegados > i ? 1 : 0, opacity: llegados > i ? 1 : 0 }}
                          transition={{
                            pathLength: { duration: 0.9, ease: CURVA_HEBRA },
                            opacity: { duration: 0.16 },
                          }}
                        />
                      </mask>
                      <g mask={`url(#${id})`}>{cinta}</g>
                    </>
                  )}
                </g>
              );
            })}
          </svg>
        )}
      </div>

      <h1 className="titulo final__titular" ref={titular} data-listo={listo || reducido || undefined}>
        {lineas.map((lineaTitular) => (
          <span key={lineaTitular.join(' ')} className="final__linea">
            {lineaTitular.map((p, i) => {
              indicePalabra += 1;
              return (
                <span key={p} className="final__palabra" style={{ '--i': indicePalabra - 1 }}>
                  {p}
                  {i < lineaTitular.length - 1 ? ' ' : ''}
                </span>
              );
            })}
          </span>
        ))}
      </h1>

      <div className="final__fila" ref={fila} data-listo={listo || reducido || undefined}>
        {SABORES.map((s, i) => (
          <Go
            key={s.id}
            to={s.ruta}
            className="final__enlace"
            style={{ '--i': i, zIndex: 30 + i }}
            aria-label={VOLVER[s.id]}
            data-activo={resaltado === s.id || undefined}
            onPointerEnter={(e) => {
              if (e.pointerType === 'mouse') setResaltado(s.id);
            }}
            onPointerLeave={(e) => {
              if (e.pointerType === 'mouse') setResaltado(null);
            }}
            onFocus={(e) => {
              if (e.target.matches(':focus-visible')) setResaltado(s.id);
            }}
            onBlur={() => setResaltado(null)}
            onClickCapture={(e) => tocarFrasco(e, s.id)}
          >
            <span className="final__vuelo">
              <span className="final__llegada">
                <span className="frasco-sombra final__sombra" />
                <Frasco sabor={s.id} alto="var(--alto-frasco)" decorativo />
              </span>
            </span>
          </Go>
        ))}
      </div>

      <div className="balda" aria-hidden="true" />

      <div className="final__rotulos" aria-hidden="true">
        {SABORES.map((s) => (
          <span key={s.id} className="etiqueta" data-activo={resaltado === s.id || undefined}>
            {s.destino}
          </span>
        ))}
      </div>

      <p className="sr" aria-live="polite">
        {tactil && resaltado ? `${VOLVER[resaltado]}. Toca otra vez para viajar` : ''}
      </p>
    </>
  );

  const folio = (
    <Hoja numeral="04" className="final__folio" aria-label="Cierre del viaje">
      <div className="folio__ficha">
        <p className="etiqueta final__etapa">Etapa 04 · De vuelta a casa</p>
        <p className="final__eslogan">
          <span className="titulo">{ESLOGAN_A}</span> <span className="cita">{ESLOGAN_B}</span>
        </p>
      </div>

      <div className="final__recorrido">
        <ul className="final__sellos" ref={sellos} aria-label="Sellos del viaje">
          {SABORES.map((s, i) => {
            const hecho = Boolean(visitados[s.id]);
            const marca = SELLOS[s.id];
            return (
              <li key={s.id} className="final__sello" data-hecho={hecho || undefined}>
                <span className="final__sello-caja">
                  <span className="final__sello-vacio" aria-hidden="true">
                    {s.etapa.slice(-1)}
                  </span>
                  {hecho && caidos > i && (
                    <motion.span
                      className="final__sello-marca"
                      initial={reducido ? false : { scale: 1.5, rotate: ROTACIONES[i] - 10, opacity: 0 }}
                      animate={{ scale: 1, rotate: ROTACIONES[i], opacity: 1 }}
                      transition={{ duration: 0.18, ease: CURVA_SELLO }}
                    >
                      <Sello tam={120} rot={0} opaco={marca.color} style={{ width: '100%' }} />
                      <Ilu src={marca.motivo} className="final__sello-motivo" data-sabor={s.id} />
                      <span className="final__sello-numero" aria-hidden="true">
                        {s.etapa.slice(-1)}
                      </span>
                    </motion.span>
                  )}
                </span>
                <span className="etiqueta final__sello-nombre">
                  {s.destino}
                  <span className="final__sello-estado">{hecho ? 'Visitado' : 'Pendiente'}</span>
                </span>
              </li>
            );
          })}
        </ul>

        {pendientes.length > 0 && (
          <p className="final__pendiente">
            {pendientes.length === SABORES.length ? 'El viaje está por empezar. Sal hacia ' : 'Aún te queda mundo por recorrer: '}
            {pendientes.map((s, i) => (
              <span key={s.id}>
                {i > 0 && (i === pendientes.length - 1 ? ' y ' : ', ')}
                <Go to={s.ruta}>{s.destino}</Go>
              </span>
            ))}
            .
          </p>
        )}
      </div>

      <div className="folio__salidas">
        <Boton to="/">Volver a explorar los sabores</Boton>
      </div>
    </Hoja>
  );

  return (
    <Pantalla
      className="final"
      etiqueta="Los tres frascos reunidos sobre la balda"
      escenario={escenario}
      folio={folio}
      propsEscenario={{
        onPointerDown: (e) => {
          if (e.pointerType !== 'mouse' && !e.target.closest('.final__enlace')) setResaltado(null);
        },
      }}
    />
  );
}
