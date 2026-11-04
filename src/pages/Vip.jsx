/* Sección oculta: «Crea el remolino perfecto» (DESIGN §5, ARQUITECTURA para los recortes).
   Tres ingredientes van al frasco arrastrando o con elegir y pulsar. Sin derrota ni tiempo.
   La crema la pinta vipCrema.js; aquí vive el juego, el sello y el pasaporte. */
import { forwardRef, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, animate, motion, useAnimationControls, useIsPresent, useMotionValue } from 'framer-motion';
import brujula from '../assets/ilustraciones/brujula.svg?raw';
import cacahuete from '../assets/cacahuete.webp';
import flor from '../assets/flor-cactus.webp';
import pitaya from '../assets/pitaya-cortada.webp';
import { Boton, BotonCerrar, Hoja, Ilu, Pantalla, Remolino, Sello } from '../components/index.js';
import { useCapaModal, useDisposicion, useMedia, useTactil } from '../hooks.js';
import { useViaje } from '../state.jsx';
import { crearCrema } from './vipCrema.js';
import '../styles/vip.css';

const INGREDIENTES = [
  { id: 'cacahuete', nombre: 'Cacahuete', src: cacahuete, acierto: 'Base de cacahuete en el frasco.', falta: 'la base de cacahuete' },
  { id: 'pitaya', nombre: 'Pitaya rosa', src: pitaya, acierto: 'La pitaya tiñe el remolino de rosa.', falta: 'la fruta' },
  { id: 'flor', nombre: 'Flor de cactus', src: flor, acierto: 'La flor de cactus añade su giro violeta y verde.', falta: 'la flor' },
];
const INTRUSOS = [
  { id: 'brujula', nombre: 'Brújula', pie: 'No va dentro', rechazo: 'La brújula guía el viaje, pero no va dentro del frasco.' },
  { id: 'sello', nombre: 'Sello de viaje', rechazo: 'El sello es para el pasaporte, no para el frasco.' },
];
const POSIBILIDADES = ['Contenido exclusivo', 'Una ilustración especial', 'Una receta', 'Un beneficio promocional para clientes VIP'];
const PASOS = ['Base de cacahuete', 'Fruta y flor', 'Remolino perfecto'];

const TEXTO_GANAR = '¡Remolino perfecto! Tu pasaporte VIP ya está desbloqueado.';
const TEXTO_VOLVER = 'Tu pasaporte VIP sigue desbloqueado. Puedes repetir el remolino cuando quieras.';
const TEXTO_GIRO = 'Todo dentro. Mira cómo gira.';
const textoInicial = (tactil) =>
  tactil
    ? 'Elige un ingrediente y pulsa el frasco. También puedes arrastrarlo.'
    : 'Arrastra los ingredientes hasta el frasco. También puedes elegir uno y pulsar el frasco.';

const CURVA_SELLO = [0.5, 0, 0.1, 1];
const MUELLE_VUELTA = { type: 'spring', stiffness: 320, damping: 24 };

const SILUETA = 'M62 12h116q6 0 6 6v30q0 6-4 9q44 14 44 62v236q0 31-32 31H48q-32 0-32-31V119q0-48 44-62q-4-3-4-9V18q0-6 6-6z';

const dentro = (r, x, y, margen = 14) =>
  x > r.left - margen && x < r.right + margen && y > r.top - margen && y < r.bottom + margen;

function faltan(usados) {
  const lista = INGREDIENTES.filter((i) => !usados[i.id]).map((i) => i.falta);
  if (!lista.length) return '';
  return ` ${lista.length > 1 ? 'Faltan' : 'Falta'} ${lista.join(' y ')}.`;
}

/* ---------- Pieza: el mismo botón sirve para arrastrar y para elegir ---------- */
const Pieza = forwardRef(function Pieza(
  { item, usado, elegida, activa, limites, aviso, children, alElegir, alMover, alSoltar },
  ref,
) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const scale = useMotionValue(1);
  const rotate = useMotionValue(0);
  const opacity = useMotionValue(1);
  const boton = useRef(null);
  const arrastrada = useRef(false);
  const [enVuelo, setEnVuelo] = useState(false);

  useEffect(() => {
    ref?.({ boton, x, y, scale, rotate, opacity });
    return () => ref?.(null);
  }, [ref, x, y, scale, rotate, opacity]);

  return (
    <motion.button
      ref={boton}
      type="button"
      className="pieza"
      data-usada={usado || undefined}
      data-elegida={elegida || undefined}
      data-vuelo={enVuelo || undefined}
      data-aviso={aviso || undefined}
      data-id={item.id}
      onPointerDown={() => {
        arrastrada.current = false;
      }}
      aria-pressed={elegida}
      aria-disabled={!activa}
      tabIndex={activa ? 0 : -1}
      style={{ x, y, scale, rotate, opacity }}
      drag={activa}
      dragConstraints={limites}
      dragElastic={0.06}
      dragMomentum={false}
      whileDrag={{ scale: 1.04 }}
      onDragStart={() => {
        arrastrada.current = true;
        setEnVuelo(true);
      }}
      onDrag={(e) => alMover(e.clientX, e.clientY)}
      onDragEnd={(e) => {
        setEnVuelo(false);
        alSoltar(item.id, e.clientX, e.clientY);
      }}
      onClick={(e) => {
        if (arrastrada.current) {
          arrastrada.current = false;
          return;
        }
        /* detail 0: viene del teclado, no de un puntero. */
        if (activa) alElegir(item.id, e.detail === 0);
      }}
    >
      {children}
      <span className="pieza__pie">
        {item.nombre}
        {item.pie && <small>{item.pie}</small>}
        {usado && <span className="sr"> (en el frasco)</span>}
      </span>
    </motion.button>
  );
});

/* ---------- Frasco ---------- */
function CremaPlana({ usados, formado }) {
  /* Sin WebGL: la misma idea, en capas planas de SVG. */
  const nivel = (usados.cacahuete ? 0.62 : 0) + (usados.pitaya ? 0.11 : 0) + (usados.flor ? 0.09 : 0);
  return (
    <svg className="tarro__plana" viewBox="0 0 240 400" aria-hidden="true">
      <defs>
        <clipPath id="tarro-interior"><path d={SILUETA} /></clipPath>
      </defs>
      <g clipPath="url(#tarro-interior)">
        <rect x="0" y={400 - 400 * nivel} width="240" height={400 * nivel} fill="#B98449" />
        <g fill="none" strokeLinecap="round" transform="translate(24 16) scale(.8)">
          {(usados.pitaya || formado) && (
            <path d="M120 262c20-20 56-8 52 24-4 42-68 56-100 24-36-38-20-118 48-130 78-12 130 62 110 136" stroke="#90163A" strokeWidth="14" />
          )}
          {(usados.flor || formado) && (
            <path d="M120 262c-18 14-46 4-42-20 4-28 46-38 70-18" stroke="#6A4A70" strokeWidth="12" />
          )}
        </g>
      </g>
    </svg>
  );
}

const Tarro = forwardRef(function Tarro(
  { controles, cerca, lleno, sinGL, usados, formado, etiqueta, alPulsar, lienzo },
  ref,
) {
  return (
    <motion.button
      ref={ref}
      type="button"
      className="tarro"
      animate={controles}
      data-cerca={cerca || undefined}
      data-lleno={lleno || undefined}
      aria-label={etiqueta}
      aria-disabled={formado}
      onClick={alPulsar}
    >
      <svg className="tarro__fondo" viewBox="0 0 240 400" aria-hidden="true">
        <path d={SILUETA} />
      </svg>
      {sinGL ? <CremaPlana usados={usados} formado={formado} /> : <canvas ref={lienzo} className="tarro__crema" aria-hidden="true" />}
      <svg className="tarro__vidrio" viewBox="0 0 240 400" fill="none" aria-hidden="true">
        <path className="tarro__rosca" d="M56 26h128M56 37h128M56 48h128" />
        <path className="tarro__reflejo" d="M38 136q-4 8-4 22v150" />
        <path className="tarro__reflejo tarro__reflejo--fino" d="M206 170v92" />
        <path className="tarro__contorno" d={SILUETA} pathLength="100" />
      </svg>
    </motion.button>
  );
});

/* ---------- Pasaporte ---------- */
const Pasaporte = forwardRef(function Pasaporte({ desbloqueado, girando, oculto, golpe }, ref) {
  let estado = 'Bloqueado. Se abre al completar el reto.';
  if (girando) estado = 'Casi. Se abre cuando el remolino acabe de girar.';
  if (desbloqueado) estado = 'Desbloqueado. Ya forma parte de tu viaje.';
  return (
    <motion.div
      className="pasaporte"
      data-abierto={desbloqueado || undefined}
      animate={golpe ? { y: [0, 5, -1, 0], rotate: [0, 0.5, -0.2, 0] } : { y: 0, rotate: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <div className="pasaporte__tapa" aria-hidden="true">
        <Remolino tam={40} />
        <span className="etiqueta">Pasaporte</span>
      </div>
      <div className="pasaporte__texto">
        <h2 className="titulo pasaporte__titulo">Pasaporte VIP</h2>
        <p>{estado}</p>
      </div>
      <div ref={ref} className="pasaporte__hueco" aria-hidden="true">
        {desbloqueado && !oculto && <Sello centro="VIP" tam={92} rot={-7} opaco="var(--c-crema)" />}
        {golpe && <span className="pasaporte__onda" />}
      </div>
    </motion.div>
  );
});

function ModalPasaporte({ alCerrar, volver }) {
  const capa = useRef(null);
  const cerrar = useRef(null);
  const presente = useIsPresent();
  useCapaModal(capa, presente, { alCerrar, foco: cerrar, devolver: volver });

  return createPortal(
    <motion.div
      ref={capa}
      className="capa-pasaporte"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pasaporte-titulo"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={(e) => {
        if (e.target === e.currentTarget) alCerrar();
      }}
    >
      <motion.div
        className="librito"
        tabIndex={0}
        initial={{ rotateY: 90, opacity: 0 }}
        animate={{ rotateY: 0, opacity: 1 }}
        exit={{ rotateY: -40, opacity: 0 }}
        transition={{ duration: 0.52, ease: [0.22, 0.9, 0.3, 1] }}
      >
        <div className="librito__izquierda">
          <Sello arriba="Remolino perfecto" abajo="Pasaporte" centro="VIP" tam={190} rot={-7} opaco="var(--c-crema)" />
        </div>
        <div className="librito__derecha">
          <h2 id="pasaporte-titulo" className="titulo librito__titulo">Tu pasaporte VIP</h2>
          <p>Has creado el remolino perfecto. Este sello ya es tuyo: una pieza de colección de tu viaje.</p>
          <p>Algún día, un pasaporte así podría abrir:</p>
          <ul className="librito__lista">
            {POSIBILIDADES.map((p) => <li key={p}>{p}</li>)}
          </ul>
          <p className="librito__aviso">De momento, guárdalo. El mundo cabe en una cucharada.</p>
        </div>
      </motion.div>
      <BotonCerrar ref={cerrar} className="librito__cerrar" onClick={alCerrar} />
    </motion.div>,
    document.body,
  );
}

/* ---------- Pantalla ---------- */
export default function Vip() {
  const { origen, vip, reducido, completarVip } = useViaje();
  const disposicion = useDisposicion();
  const tactil = useTactil();
  const estrecho = useMedia('(max-width: 699px)');
  const enMovil = disposicion === 'apilado' && estrecho;

  const [usados, setUsados] = useState({});
  const [fase, setFase] = useState(vip ? 'ganado' : 'jugando');
  const [elegida, setElegida] = useState(null);
  const [cerca, setCerca] = useState(false);
  const [aviso, setAviso] = useState(null);
  const [pista, setPista] = useState(() => (vip ? TEXTO_VOLVER : textoInicial(tactil)));
  const [sinGL, setSinGL] = useState(false);
  const [modal, setModal] = useState(false);
  const [vuelo, setVuelo] = useState(null);
  const [golpe, setGolpe] = useState(false);

  const pagina = useRef(null);
  const tarro = useRef(null);
  const lienzo = useRef(null);
  const motor = useRef(null);
  const piezas = useRef({});
  const hechos = useRef({});
  const ocupado = useRef(new Set());
  const hueco = useRef(null);
  const verBoton = useRef(null);
  const temporizadores = useRef([]);
  const formado = useRef(fase === 'ganado');
  const saltado = useRef(false);
  const alFormadoRef = useRef(null);
  const controlesTarro = useAnimationControls();

  const reducidoRef = useRef(reducido);
  reducidoRef.current = reducido;
  const faseRef = useRef(fase);
  faseRef.current = fase;

  const esperar = (f, ms) => temporizadores.current.push(setTimeout(f, ms));
  useEffect(() => () => temporizadores.current.forEach(clearTimeout), []);

  /* Motor de la crema. Se crea una vez; si no hay WebGL, se pinta el frasco plano. */
  useEffect(() => {
    if (!lienzo.current) return undefined;
    const m = crearCrema(lienzo.current, {
      reducido: reducidoRef.current,
      dprMax: tactil ? 1.5 : 2,
      alPerder: () => {
        motor.current = null;
        setSinGL(true);
        /* El giro ya no terminará por sí solo: la partida sigue en el frasco plano. */
        if (faseRef.current === 'girando') esperar(() => alFormadoRef.current?.(), 0);
      },
    });
    if (!m) {
      setSinGL(true);
      return undefined;
    }
    motor.current = m;
    if (faseRef.current === 'ganado') m.completar();
    return () => {
      m.destruir();
      motor.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    motor.current?.fijarReducido(reducido);
  }, [reducido]);

  const alFormado = useCallback(() => {
    if (formado.current) return;
    formado.current = true;
    setFase('ganado');
    setPista(TEXTO_GANAR);
    completarVip();
    setVuelo('pendiente');
  }, [completarVip]);
  alFormadoRef.current = alFormado;

  /* El sello cae: se mide el hueco cuando ya está en su sitio definitivo. */
  useLayoutEffect(() => {
    if (vuelo !== 'pendiente') return;
    const el = hueco.current;
    if (!el) {
      setVuelo(null);
      return;
    }
    el.scrollIntoView({ block: 'nearest' });
    if (reducido) {
      setVuelo(null);
      return;
    }
    const r = el.getBoundingClientRect();
    const t = tarro.current?.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const tam = el.querySelector('.sello')?.getBoundingClientRect().width || 64;
    setVuelo({ cx, cy, tam: Math.min(tam, r.width), dx: t ? (t.left + t.width / 2 - cx) * 0.3 : 0, dy: -window.innerHeight * 0.12 });
  }, [vuelo, reducido]);

  const aterrizar = () => {
    setVuelo(null);
    setGolpe(true);
    esperar(() => setGolpe(false), 620);
    /* En móvil horizontal las acciones quedan bajo el pliegue del folio. */
    if (disposicion === 'bajo') verBoton.current?.scrollIntoView({ block: 'nearest' });
  };

  /* Con la GPU saturada el sello puede no avisar al terminar: el pasaporte no se queda esperando. */
  const enVuelo = Boolean(vuelo) && vuelo !== 'pendiente';
  useEffect(() => {
    if (!enVuelo) return undefined;
    const t = setTimeout(aterrizar, 900);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enVuelo]);

  /* Tras ganar, el teclado sigue el hilo: el foco pasa del frasco al pasaporte. */
  useEffect(() => {
    if (fase !== 'ganado' || vuelo) return;
    if (document.activeElement === tarro.current || saltado.current) verBoton.current?.focus();
    saltado.current = false;
  }, [fase, vuelo]);

  /* El giro se puede omitir: acelera lo que falte y el sello cae igual. */
  const saltarGiro = useCallback(() => {
    if (faseRef.current !== 'girando') return;
    saltado.current = true;
    if (motor.current) motor.current.saltar();
    else alFormadoRef.current?.();
  }, []);

  useEffect(() => {
    if (fase !== 'girando') return undefined;
    const tecla = (e) => {
      if (e.key === 'Escape') saltarGiro();
    };
    window.addEventListener('keydown', tecla);
    return () => window.removeEventListener('keydown', tecla);
  }, [fase, saltarGiro]);

  /* ---------- Reglas ---------- */
  const registrar = useCallback((item) => {
    hechos.current = { ...hechos.current, [item.id]: true };
    const siguientes = hechos.current;
    setUsados(siguientes);
    motor.current?.verter(item.id);
    setPista(`${item.acierto}${faltan(siguientes)}`);
    if (!INGREDIENTES.every((i) => siguientes[i.id])) return;
    setFase('girando');
    if (motor.current) motor.current.formar(alFormado);
    else esperar(alFormado, reducidoRef.current ? 0 : 700);
    if (!reducidoRef.current) esperar(() => setPista((p) => (p === TEXTO_GANAR ? p : TEXTO_GIRO)), 1500);
  }, [alFormado]);

  const sacudirTarro = useCallback(() => {
    if (reducidoRef.current) return;
    controlesTarro.start({ x: [0, -6, 5, -3, 2, 0], rotate: [0, -1.2, 1, -0.5, 0], transition: { duration: 0.42 } });
  }, [controlesTarro]);

  /* Lleva la pieza a la boca del frasco. Sirve para arrastrar y para elegir y pulsar. */
  const lanzar = useCallback((id) => {
    const p = piezas.current[id];
    const caja = tarro.current?.getBoundingClientRect();
    setElegida(null);
    if (!p?.boton.current || !caja || ocupado.current.has(id)) return;
    const item = INGREDIENTES.find((i) => i.id === id);
    ocupado.current.add(id);

    const r = p.boton.current.getBoundingClientRect();
    const dx = caja.left + caja.width / 2 - (r.left + r.width / 2);
    const dy = caja.top + caja.height * 0.04 - (r.top + r.height / 2);
    const x0 = p.x.get();
    const y0 = p.y.get();
    const quieto = reducidoRef.current;

    if (item) {
      const fin = () => {
        ocupado.current.delete(id);
        p.x.set(0);
        p.y.set(0);
        p.scale.set(1);
        p.opacity.set(1);
        registrar(item);
      };
      if (quieto) {
        fin();
        return;
      }
      const opciones = { duration: 0.46, ease: [0.45, 0.05, 0.3, 1] };
      animate(p.x, x0 + dx, opciones);
      animate(p.y, [y0, y0 + dy * 0.72 - 34, y0 + dy], opciones);
      animate(p.scale, 0.34, opciones);
      animate(p.opacity, [1, 1, 0], { ...opciones, times: [0, 0.76, 1] }).then(fin);
      return;
    }

    const intruso = INTRUSOS.find((i) => i.id === id);
    setPista(intruso.rechazo);
    setAviso(id);
    esperar(() => setAviso((a) => (a === id ? null : a)), 760);
    if (quieto) {
      p.x.set(0);
      p.y.set(0);
      ocupado.current.delete(id);
      return;
    }
    /* Pega en el vidrio y vuelve a su sitio dando un saltito. */
    const ida = { duration: 0.2, ease: [0.45, 0.05, 0.55, 0.95] };
    const hastaX = x0 + dx * 0.72;
    const hastaY = y0 + dy + caja.height * 0.26;
    animate(p.rotate, [0, 12, -9, 5, 0], { duration: 0.7 });
    Promise.all([animate(p.x, hastaX, ida), animate(p.y, hastaY, ida)]).then(() => {
      sacudirTarro();
      animate(p.x, 0, MUELLE_VUELTA);
      animate(p.y, 0, MUELLE_VUELTA).then(() => ocupado.current.delete(id));
    });
  }, [registrar, sacudirTarro]);

  const devolver = (id) => {
    const p = piezas.current[id];
    if (!p) return;
    if (reducidoRef.current) {
      p.x.set(0);
      p.y.set(0);
      return;
    }
    animate(p.x, 0, MUELLE_VUELTA);
    animate(p.y, 0, MUELLE_VUELTA);
  };

  const alMover = useCallback((px, py) => {
    const c = tarro.current?.getBoundingClientRect();
    setCerca(Boolean(c) && dentro(c, px, py));
  }, []);

  const alSoltar = (id, px, py) => {
    setCerca(false);
    const c = tarro.current?.getBoundingClientRect();
    if (c && dentro(c, px, py)) lanzar(id);
    else devolver(id);
  };

  const alElegir = (id, conTeclado) => {
    const nueva = elegida === id ? null : id;
    setElegida(nueva);
    setPista(nueva ? 'Ahora pulsa el frasco para añadirlo.' : textoInicial(tactil));
    /* Con teclado, el siguiente paso está en el frasco: el foco se adelanta. */
    if (nueva && conTeclado) tarro.current?.focus();
  };

  const pulsarTarro = (e) => {
    if (fase === 'girando') {
      saltarGiro();
      return;
    }
    if (fase !== 'jugando') return;
    if (!elegida) {
      setPista('Primero elige un ingrediente o arrástralo hasta el frasco.');
      return;
    }
    /* Con teclado, el foco vuelve al primer ingrediente que falte. */
    const siguiente = INGREDIENTES.find((i) => !hechos.current[i.id] && i.id !== elegida);
    lanzar(elegida);
    if (e.detail === 0 && siguiente) piezas.current[siguiente.id]?.boton.current?.focus({ preventScroll: true });
  };

  const repetir = () => {
    hechos.current = {};
    formado.current = false;
    setUsados({});
    setElegida(null);
    setFase('jugando');
    setPista(textoInicial(tactil));
    motor.current?.reiniciar();
    /* El foco vuelve al primer ingrediente, una vez montado de nuevo. */
    esperar(() => piezas.current.cacahuete?.boton.current?.focus({ preventScroll: true }), 30);
  };

  useEffect(() => {
    if (!elegida) return undefined;
    const tecla = (e) => {
      if (e.key !== 'Escape') return;
      if (document.activeElement === tarro.current) piezas.current[elegida]?.boton.current?.focus();
      setElegida(null);
      setPista(textoInicial(tactil));
    };
    window.addEventListener('keydown', tecla);
    return () => window.removeEventListener('keydown', tecla);
  }, [elegida, tactil]);

  /* ---------- Derivados ---------- */
  const ganado = fase === 'ganado';
  const activo = fase === 'jugando';
  const lleno = !activo;
  const pasos = [Boolean(usados.cacahuete) || ganado, Boolean(usados.pitaya && usados.flor) || ganado, ganado];
  const nombreElegida = [...INGREDIENTES, ...INTRUSOS].find((i) => i.id === elegida)?.nombre;
  let etiquetaTarro = 'Frasco: suelta aquí los ingredientes';
  if (nombreElegida) etiquetaTarro = `Frasco: añadir ${nombreElegida}`;
  if (fase === 'girando') etiquetaTarro = 'Frasco: el remolino está girando. Púlsalo para saltar el giro';
  if (ganado) etiquetaTarro = 'Frasco con el remolino perfecto';
  const premioArriba = enMovil && ganado;
  let pieDeTarro = 'Suelta aquí los ingredientes';
  if (elegida) pieDeTarro = 'Pulsa el frasco';
  if (fase === 'girando') pieDeTarro = 'Girando';
  if (ganado) pieDeTarro = 'Remolino perfecto';

  /* La pauta del cuaderno se ajusta a los pies de foto, y título y pie del frasco a ella.
     Son las únicas medidas que CSS no puede dar: dependen de las métricas de la letra. */
  useLayoutEffect(() => {
    const raiz = pagina.current;
    const esc = raiz?.parentElement;
    if (!esc) return undefined;
    const base = (el) => {
      const c = getComputedStyle(el);
      const fs = parseFloat(c.fontSize);
      const lh = parseFloat(c.lineHeight) || fs * 1.2;
      return el.getBoundingClientRect().top + lh / 2 + fs * 0.32;
    };
    const medir = () => {
      const paso = 2.25 * parseFloat(getComputedStyle(document.documentElement).fontSize);
      const arriba = esc.getBoundingClientRect().top;
      const ajustar = [raiz.querySelector('.vip__titulo'), raiz.querySelector('.vip__pie')].filter(Boolean);
      ajustar.forEach((el) => { el.style.translate = ''; });
      const pie = raiz.querySelector('.pieza__pie') || ajustar[0];
      if (!pie) return;
      const y0 = base(pie) - arriba;
      esc.style.setProperty('--pauta-y', `${(y0 + 1) % paso}px`);
      ajustar.forEach((el) => {
        const d = (((y0 - (base(el) - arriba)) % paso) + paso) % paso;
        el.style.translate = `0 ${d > paso / 2 ? d - paso : d}px`;
      });
    };
    medir();
    const obs = new ResizeObserver(medir);
    obs.observe(esc);
    document.fonts?.ready.then(medir);
    return () => obs.disconnect();
  }, [premioArriba, disposicion]);

  const fijarPieza = useMemo(() => {
    const mapa = {};
    [...INGREDIENTES, ...INTRUSOS].forEach((i) => {
      mapa[i.id] = (v) => {
        if (v) piezas.current[i.id] = v;
        else delete piezas.current[i.id];
      };
    });
    return mapa;
  }, []);

  const propsPieza = (item, usado) => ({
    ref: fijarPieza[item.id],
    item,
    usado,
    elegida: elegida === item.id,
    activa: activo && !usado,
    limites: pagina,
    aviso: aviso === item.id,
    alElegir,
    alMover,
    alSoltar,
  });

  const titulo = <h1 className="titulo vip__titulo">Crea el remolino perfecto</h1>;
  const nota = (
    <div className="vip__aviso">
      <p className="nota vip__pista" role="status">{pista}</p>
      {fase === 'girando' && <Boton variante="enlace" className="vip__saltar" onClick={saltarGiro}>Saltar el giro</Boton>}
    </div>
  );
  const pasaporte = (
    <Pasaporte ref={hueco} desbloqueado={vip} girando={fase === 'girando'} oculto={Boolean(vuelo)} golpe={golpe} />
  );

  const acciones = (
    <div className="vip__acciones">
      <Boton ref={verBoton} onClick={() => setModal(true)}>Ver mi pasaporte</Boton>
      <div className="vip__enlaces">
        <Boton to="/" variante="enlace">Seguir explorando</Boton>
        {ganado && <Boton variante="enlace" onClick={repetir}>Repetir el remolino</Boton>}
      </div>
    </div>
  );

  const bandeja = (
    <div className="vip__bandeja" role="group" aria-label="Ingredientes">
      {INGREDIENTES.map((i) => (
        <Pieza key={i.id} {...propsPieza(i, Boolean(usados[i.id]) || lleno)}>
          <img className="pieza__img" src={i.src} alt="" draggable="false" />
        </Pieza>
      ))}
    </div>
  );

  const intrusos = (
    <div className="vip__extra" role="group" aria-label="Otros objetos del viaje" data-fuera={lleno || undefined}>
      <Pieza {...propsPieza(INTRUSOS[0], false)}>
        <Ilu src={brujula} className="pieza__ilu" />
      </Pieza>
      <Pieza {...propsPieza(INTRUSOS[1], false)}>
        <Sello centro="?" tam={120} rot={-6} className="pieza__sello" />
      </Pieza>
    </div>
  );

  const escenario = (
    <div className="vip__pagina" ref={pagina}>
      {disposicion !== 'bajo' && titulo}
      <div className="vip__mesa" data-premio={premioArriba || undefined}>
        {premioArriba ? (
          <div className="vip__premio">
            {pasaporte}
            {acciones}
          </div>
        ) : (
          <>
            {bandeja}
            {intrusos}
          </>
        )}
        <div className="vip__centro">
          {!Object.keys(usados).length && activo && (
            <svg className="vip__flecha" viewBox="0 0 120 56" fill="none" aria-hidden="true">
              <path d="M4 44C30 8 72 6 110 30" />
              <path d="M97 32l14-1-7-12" />
            </svg>
          )}
          <div className="vip__hueco-tarro">
            <Tarro
              ref={tarro}
              lienzo={lienzo}
              controles={controlesTarro}
              cerca={cerca}
              lleno={lleno}
              sinGL={sinGL}
              usados={ganado ? { cacahuete: true, pitaya: true, flor: true } : usados}
              formado={ganado}
              etiqueta={etiquetaTarro}
              alPulsar={pulsarTarro}
            />
          </div>
          <p className="vip__pie" aria-hidden="true">{pieDeTarro}</p>
          {enMovil && <div className="vip__tira">{!premioArriba && nota}</div>}
        </div>
      </div>
    </div>
  );

  const folio = (
    <Hoja className="vip__folio" data-ganado={ganado || undefined} aria-label="Pasos del juego y pasaporte">
      {disposicion === 'bajo' && titulo}
      {disposicion === 'bajo' && nota}
      <div className="vip__estado">
        <p className="etiqueta">Sección oculta</p>
        <ol className="pasos">
          {PASOS.map((p, i) => (
            <li key={p} data-hecho={pasos[i] || undefined}>
              <span className="pasos__numero" aria-hidden="true">{i + 1}</span>
              <span className="pasos__texto">{p}</span>
              {pasos[i] && <span className="sr"> (hecho)</span>}
            </li>
          ))}
        </ol>
        {disposicion !== 'bajo' && !enMovil && nota}
        {premioArriba && <p className="sr" role="status">{pista}</p>}
      </div>
      {!premioArriba && pasaporte}
      {!premioArriba && vip && acciones}
      <div className="vip__salida">
        <Boton to={origen} variante="enlace">Salir del juego</Boton>
      </div>
    </Hoja>
  );

  return (
    <>
      <Pantalla className="vip" etiqueta="Cuaderno del remolino perfecto" escenario={escenario} folio={folio} />

      {disposicion === 'apilado' && (
        <Boton to={origen} className="vip__salir-fijo" flecha={false} aria-label="Salir del juego">
          Salir
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path d="M1.5 1.5l9 9M10.5 1.5l-9 9" />
          </svg>
        </Boton>
      )}

      {vuelo && vuelo !== 'pendiente' && (
        <motion.div
          className="vip__golpe"
          style={{
            left: vuelo.cx,
            top: vuelo.cy,
            width: vuelo.tam,
            height: vuelo.tam,
            marginLeft: -vuelo.tam / 2,
            marginTop: -vuelo.tam / 2,
          }}
          initial={{ x: vuelo.dx, y: vuelo.dy, scale: 3.6, rotate: -19, opacity: 0 }}
          animate={{ x: 0, y: 0, scale: 1, rotate: -7, opacity: 1 }}
          transition={{ duration: 0.3, ease: CURVA_SELLO, opacity: { duration: 0.08 } }}
          onAnimationComplete={aterrizar}
        >
          <Sello centro="VIP" tam={92} rot={0} opaco="var(--c-crema)" />
        </motion.div>
      )}

      <AnimatePresence>
        {modal && <ModalPasaporte key="pasaporte" alCerrar={() => setModal(false)} volver={verBoton} />}
      </AnimatePresence>
    </>
  );
}
