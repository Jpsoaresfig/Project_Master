/* Página principal: órbita de los tres frascos (DESIGN §5). */
import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import grabadoCacahuete from '../assets/ilustraciones/cacahuete.svg?raw';
import grabadoPitaya from '../assets/ilustraciones/pitaya.svg?raw';
import grabadoFlor from '../assets/ilustraciones/flor-nopal.svg?raw';
import { CONTACTO, GEOMETRIA_FRASCO, SABORES } from '../data.js';
import { useDisposicion, useTactil } from '../hooks.js';
import { useViaje } from '../state.jsx';
import { Boton, Frasco, Hoja, IconoFlecha, Ilu, Pantalla, centroDe, useContacto, useTransicion, useWebF } from '../components/index.js';
import './inicio.css';

const NIVELES = [
  { nombre: 'muy lenta', espera: 9 },
  { nombre: 'lenta', espera: 6.5 },
  { nombre: 'normal', espera: 4.6 },
  { nombre: 'rápida', espera: 3 },
  { nombre: 'muy rápida', espera: 1.8 },
];
const NIVEL_INICIAL = 2;
const ESPERA_TRAS_FLECHA = 3;
const DERIVA = 0.045;
const UMBRAL_DESLIZAR = 40;
const MUELLE_FRASCO = { type: 'spring', stiffness: 170, damping: 22, mass: 1.1 };
const TEXTO_SUAVE = { duration: 0.22, ease: [0.22, 0.9, 0.3, 1] };
const GRABADOS = { casa: grabadoCacahuete, ubud: grabadoPitaya, atacama: grabadoFlor };

/* Frasco de frente, en fracción del ancho del escenario. */
const FRENTE = { ancho: 0.62, apilado: 0.5, bajo: 0.66 };
const ESCALA_LATERAL = 0.6;

/* De la geometría de los recortes: hasta dónde llega la fruta a la izquierda del eje y
   cuánto mide medio frasco, ambos en altos de frasco. */
const FRUTA = Math.max(...Object.values(GEOMETRIA_FRASCO).map((g) => (g.eje * g.aspecto) / g.altura));
const MEDIO_FRASCO = Math.max(...Object.values(GEOMETRIA_FRASCO).map((g) => g.proporcion)) / 2;

const modulo = (v, m) => ((v % m) + m) % m;

/**
 * Sitios de la órbita, en px. La distancia sale del frasco, no del ancho: la fruta del frasco
 * de frente nunca alcanza al lateral izquierdo, y en ultrapanorámico los laterales no se van
 * a los extremos del escenario.
 */
function medirOrbita(ancho, alto, altoFrasco, disposicion) {
  const lateral = MEDIO_FRASCO * altoFrasco * ESCALA_LATERAL;
  const aire = Math.max(6, ancho * 0.018);
  const frente = ancho * FRENTE[disposicion];
  const izquierda = Math.max(frente - FRUTA * altoFrasco - lateral - aire, 0);
  const derecha =
    disposicion === 'apilado'
      ? ancho - izquierda
      : Math.min(frente + MEDIO_FRASCO * altoFrasco + lateral + aire * 1.6, ancho);
  return { frente, derecha, izquierda, alto };
}

/** De la fase (0 frente, 1/3 derecha, 2/3 izquierda) a posición, en arco por debajo de la balda. */
function colocar(fase, orbita) {
  const { frente, derecha, izquierda, alto } = orbita;
  const f = modulo(fase, 1) * 3;
  const tramo = Math.floor(f);
  const t = f - tramo;
  const arco = Math.sin(Math.PI * t);
  const hundir = alto / 100;
  if (tramo === 0) {
    return { x: frente + (derecha - frente) * t, y: arco * 3 * hundir, s: 1 - 0.4 * t };
  }
  if (tramo === 1) {
    return { x: derecha + (izquierda - derecha) * t, y: arco * 5 * hundir, s: ESCALA_LATERAL - 0.16 * arco };
  }
  return { x: izquierda + (frente - izquierda) * t, y: arco * 3 * hundir, s: ESCALA_LATERAL + 0.4 * t };
}

function BotonOrbita({ etiqueta, onClick, children, ...resto }) {
  return (
    <motion.button
      type="button"
      className="orbita-boton"
      aria-label={etiqueta}
      onClick={onClick}
      whileTap={{ scale: 0.9 }}
      {...resto}
    >
      {children}
    </motion.button>
  );
}

function IconoTriangulo({ izquierda }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path d={izquierda ? 'M13 3v12L4 9z' : 'M5 3v12l9-6z'} fill="currentColor" />
    </svg>
  );
}

function IconoPausa({ pausado }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      {pausado ? (
        <path d="M5 3v12l9-6z" fill="currentColor" />
      ) : (
        <path d="M5 3h3v12H5zM10 3h3v12h-3z" fill="currentColor" />
      )}
    </svg>
  );
}

function TextoSabor({ sabor }) {
  return (
    <>
      <p className="etiqueta inicio__destino">{sabor.etiqueta}</p>
      <h2 className="titulo inicio__nombre">{sabor.nombre}</h2>
      <Boton to={sabor.ruta} className="inicio__viajar">
        {sabor.accion}
      </Boton>
      <p className="inicio__descripcion">
        {sabor.resumen} <span className="cita-linea">«{sabor.cita}»</span>
      </p>
    </>
  );
}

/* Copia invisible de cada sabor en la misma celda: reserva la altura del más largo. */
function ReservaSabor({ sabor }) {
  return (
    <div className="inicio__texto inicio__texto--reserva" aria-hidden="true">
      <p className="etiqueta inicio__destino">{sabor.etiqueta}</p>
      <p className="titulo inicio__nombre">{sabor.nombre}</p>
      <span className="boton boton--billete inicio__viajar">{sabor.accion}</span>
      <p className="inicio__descripcion">
        {sabor.resumen} <span className="cita-linea">«{sabor.cita}»</span>
      </p>
    </div>
  );
}

export default function Inicio() {
  const { reducido } = useViaje();
  const disposicion = useDisposicion();
  const tactil = useTactil();
  const { abrir: abrirContacto, abierto: contactoAbierto } = useContacto();
  const { abierta: webFAbierta } = useWebF();
  const transicion = useTransicion();
  const faseVelo = transicion?.fase ?? 'reposo';
  const reservar = transicion?.reservar;

  const [activo, setActivo] = useState(0);
  const [nivel, setNivel] = useState(NIVEL_INICIAL);
  const [pausaManual, setPausaManual] = useState(false);
  const [atencion, setAtencion] = useState({ cursor: false, foco: false });
  const [fueraDeVista, setFueraDeVista] = useState(false);
  const [elegido, setElegido] = useState(null);
  const [limite, setLimite] = useState(null);
  /* La entrada espera a que el remolino abra. Una vez dada, no se repite. */
  const [entrada, setEntrada] = useState(faseVelo === 'cubre' ? 'espera' : 'entra');

  const motor = useRef({ pos: 0, vel: 0, destino: 0, espera: 0, arrastre: 0 });
  const raiz = useRef(null);
  const orbita = useRef(null);
  const sitios = useRef(null);
  const ejes = useRef([]);
  const botones = useRef([]);
  const pulso = useRef(null);
  const toque = useRef(null);
  const suprimirClic = useRef(false);
  const temporizador = useRef(0);

  const enPausa =
    pausaManual || atencion.cursor || atencion.foco || fueraDeVista || elegido !== null ||
    webFAbierta || contactoAbierto || Boolean(transicion?.activa);
  const parado = useRef(enPausa);
  parado.current = enPausa;
  const nivelActual = useRef(nivel);
  nivelActual.current = nivel;
  const disposicionRef = useRef(disposicion);
  disposicionRef.current = disposicion;
  const tactilRef = useRef(false);
  const frontalRef = useRef(0);
  tactilRef.current = tactil;

  useEffect(() => {
    if (faseVelo !== 'cubre') setEntrada('entra');
  }, [faseVelo]);

  const pintar = useCallback(() => {
    const m = motor.current;
    const orbitaActual = sitios.current;
    if (orbitaActual) {
      ejes.current.forEach((eje, i) => {
        if (!eje) return;
        const { x, y, s } = colocar((i - m.pos) / 3, orbitaActual);
        eje.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) scale(${s.toFixed(4)})`;
        /* Solo `transform` cambia en cada fotograma: lo demás recalcula estilos y reordena capas. */
        const z = 10 + Math.round(s * 20);
        if (eje.dataset.z !== String(z)) {
          eje.dataset.z = z;
          eje.style.zIndex = String(z);
        }
        const frente = s > 0.8 ? 'si' : 'no';
        if (eje.dataset.frente !== frente) eje.dataset.frente = frente;
        /* El rótulo solo se ve con cursor o foco. */
        if (!tactilRef.current) eje.style.setProperty('--contra-escala', (1 / s).toFixed(3));
      });
    }
    const frontal = modulo(Math.round(m.pos), 3);
    if (frontal !== frontalRef.current) {
      frontalRef.current = frontal;
      setActivo(frontal);
    }
  }, []);

  /* Mide en px: el transform no depende de `cqw`, que Safari 15 no conoce. */
  const medir = useCallback(() => {
    const caja = orbita.current;
    const eje = ejes.current[0];
    if (!caja || !eje) return;
    sitios.current = medirOrbita(caja.clientWidth, caja.clientHeight, eje.offsetHeight, disposicionRef.current);
    pintar();
  }, [pintar]);

  useEffect(() => {
    medir();
    const vigia = new ResizeObserver(medir);
    vigia.observe(orbita.current);
    vigia.observe(ejes.current[0]);
    return () => vigia.disconnect();
  }, [medir, disposicion]);

  /* Motor de la órbita: un muelle críticamente amortiguado persigue al destino. */
  useEffect(() => {
    const m = motor.current;
    if (reducido) {
      m.pos = m.destino;
      m.vel = 0;
      m.espera = 0;
      if (pulso.current) pulso.current.style.transform = 'scaleX(0)';
      pintar();
      return undefined;
    }
    let cuadro = 0;
    let previo = 0;
    const omega = 5.2;
    const paso = (ahora) => {
      const dt = Math.min(0.05, previo ? (ahora - previo) / 1000 : 0.016);
      previo = ahora;
      const espera = NIVELES[nivelActual.current].espera;
      if (!parado.current) {
        m.espera += dt;
        if (m.espera >= espera) {
          m.destino += 1;
          m.espera = 0;
        }
      }
      const objetivo = m.destino + DERIVA * (Math.max(0, m.espera) / espera) + m.arrastre;
      m.vel += (omega * omega * (objetivo - m.pos) - 2 * omega * m.vel) * dt;
      m.pos += m.vel * dt;
      /* Parado y asentado no hay nada que escribir. */
      if (parado.current && Math.abs(m.vel) < 1e-3 && Math.abs(objetivo - m.pos) < 1e-3) {
        cuadro = requestAnimationFrame(paso);
        return;
      }
      pintar();
      if (pulso.current) {
        pulso.current.style.transform = `scaleX(${(Math.max(0, m.espera) / espera).toFixed(3)})`;
      }
      cuadro = requestAnimationFrame(paso);
    };
    cuadro = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(cuadro);
  }, [reducido, pintar]);

  useEffect(
    () => () => {
      clearTimeout(temporizador.current);
      reservar?.(false);
    },
    [reservar],
  );

  /* Sin ver el escenario no se rota: al volver, el frasco sigue siendo el que se leía. */
  useEffect(() => {
    const escenario = raiz.current?.closest('.pantalla')?.querySelector('.escenario');
    if (!escenario || !('IntersectionObserver' in window)) return undefined;
    const vigia = new IntersectionObserver(([e]) => setFueraDeVista(!e.isIntersecting), { threshold: 0.6 });
    vigia.observe(escenario);
    return () => vigia.disconnect();
  }, []);

  /* Primer toque: el CTA deja de cambiar bajo el dedo. El botón de pausa lo reanuda. */
  useEffect(() => {
    const alTocar = (e) => {
      /* framer-motion emite un pointerdown propio con pointerType vacío: solo cuenta el dedo. */
      if (e.pointerType !== 'touch' && e.pointerType !== 'pen') return;
      /* Quien usa la velocidad o las flechas quiere ver rotar el carrusel. */
      if (e.target.closest?.('.casilla, .orbita-boton:not([data-pausa])')) return;
      window.removeEventListener('pointerdown', alTocar, true);
      if (!e.target.closest?.('[data-pausa]')) setPausaManual(true);
    };
    window.addEventListener('pointerdown', alTocar, true);
    return () => window.removeEventListener('pointerdown', alTocar, true);
  }, []);

  const paso = useCallback(
    (n) => {
      const m = motor.current;
      m.destino = Math.round(m.destino) + n;
      m.espera = -ESPERA_TRAS_FLECHA;
      if (reducido) {
        m.pos = m.destino;
        pintar();
      }
    },
    [reducido, pintar],
  );

  const cambiarVelocidad = (n) => {
    const siguiente = nivel + n;
    if (siguiente < 0 || siguiente >= NIVELES.length) {
      setLimite(n);
      return;
    }
    setLimite(null);
    setNivel(siguiente);
    motor.current.espera = Math.min(motor.current.espera, NIVELES[siguiente].espera * 0.8);
  };

  const elegir = (sabor, i, e) => {
    if (elegido !== null) return;
    const punto = centroDe(e.currentTarget);
    if (reducido) {
      transicion.ir(sabor.ruta, punto);
      return;
    }
    setElegido(i);
    reservar?.(true);
    temporizador.current = setTimeout(() => {
      reservar?.(false);
      transicion.ir(sabor.ruta, punto);
      setElegido(null);
    }, 300);
  };

  /* Deslizar: el frasco sigue al dedo y al soltar pasa de sitio. */
  const eventosEscenario = {
    onPointerEnter: (e) => {
      if (e.pointerType === 'mouse') setAtencion((a) => ({ ...a, cursor: true }));
    },
    onPointerLeave: (e) => {
      if (e.pointerType === 'mouse') setAtencion((a) => ({ ...a, cursor: false }));
      toque.current = null;
      motor.current.arrastre = 0;
    },
    /* :focus-visible: el foco que deja un clic no debe parar el carrusel. */
    onFocus: (e) => {
      if (e.target.matches('.frasco-boton:focus-visible, .orbita-boton:focus-visible')) {
        setAtencion((a) => ({ ...a, foco: true }));
      }
    },
    onBlur: () => setAtencion((a) => ({ ...a, foco: false })),
    onKeyDown: (e) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      e.preventDefault();
      paso(e.key === 'ArrowLeft' ? -1 : 1);
      /* El foco acompaña al frasco que queda delante. */
      if (e.target.closest('.frasco-boton')) {
        botones.current[modulo(motor.current.destino, 3)]?.focus({ preventScroll: true });
      }
    },
    onPointerDown: (e) => {
      /* Un deslizamiento que acabó fuera no dispara clic: la marca no debe comerse este toque. */
      suprimirClic.current = false;
      if (e.button !== 0) return;
      toque.current = { x: e.clientX, ancho: e.currentTarget.clientWidth };
    },
    onPointerMove: (e) => {
      if (!toque.current || e.pointerType === 'mouse') return;
      if (!reducido) motor.current.arrastre = -(e.clientX - toque.current.x) / (toque.current.ancho * 0.7);
    },
    onPointerUp: (e) => {
      if (!toque.current) return;
      const dx = e.clientX - toque.current.x;
      toque.current = null;
      motor.current.arrastre = 0;
      if (Math.abs(dx) > UMBRAL_DESLIZAR) {
        suprimirClic.current = true;
        paso(dx < 0 ? 1 : -1);
      }
    },
    onPointerCancel: () => {
      toque.current = null;
      motor.current.arrastre = 0;
    },
    onClickCapture: (e) => {
      if (suprimirClic.current) {
        suprimirClic.current = false;
        e.preventDefault();
        e.stopPropagation();
      }
    },
  };

  const sabor = SABORES[activo];
  const estadoVelocidad = reducido
    ? 'Carrusel detenido'
    : pausaManual
      ? 'En pausa'
      : `Velocidad ${NIVELES[nivel].nombre}`;

  const escenario = (
    <>
      <div className="pared inicio__pared" aria-hidden="true" />
      <svg className="inicio__trazo" viewBox="0 0 1000 400" preserveAspectRatio="none" fill="none" aria-hidden="true">
        <path d="M-10 250C160 150 280 330 470 210S800 120 1010 270" />
      </svg>
      <h1 className="titulo inicio__titular">
        <span className="inicio__linea"><span>Un viaje en</span></span>{' '}
        <span className="inicio__linea"><span>cada cucharada</span></span>
      </h1>

      <div className="orbita" ref={orbita}>
        {SABORES.map((s, i) => (
          <div
            key={s.id}
            className="frasco-eje"
            ref={(el) => {
              ejes.current[i] = el;
            }}
          >
            <span className="frasco-entrada" style={{ '--orden': i }}>
              <span className="frasco-sombra" aria-hidden="true" />
              <button
                type="button"
                className="frasco-boton"
                aria-label={`${s.accion} con ${s.nombre}`}
                tabIndex={activo === i ? 0 : -1}
                ref={(el) => {
                  botones.current[i] = el;
                }}
                onClick={(e) => elegir(s, i, e)}
              >
                <motion.span
                  className="frasco-boton__imagen"
                  animate={{ scale: elegido === i ? 1.12 : 1 }}
                  transition={MUELLE_FRASCO}
                >
                  <Frasco sabor={s.id} alto="var(--alto-frasco)" decorativo />
                </motion.span>
                <span className="frasco-rotulo nota" aria-hidden="true">{s.accion}</span>
              </button>
            </span>
          </div>
        ))}
      </div>

      <div className="balda" aria-hidden="true" />

      <div className="orbita-controles" role="group" aria-label="Controles del carrusel">
        <BotonOrbita etiqueta="Frasco anterior" onClick={() => paso(-1)}>
          <IconoTriangulo izquierda />
        </BotonOrbita>
        <BotonOrbita
          etiqueta={pausaManual ? 'Reanudar carrusel' : 'Pausar carrusel'}
          aria-pressed={pausaManual}
          data-pausa=""
          onClick={() => setPausaManual((v) => !v)}
        >
          <IconoPausa pausado={pausaManual} />
        </BotonOrbita>
        <BotonOrbita etiqueta="Frasco siguiente" onClick={() => paso(1)}>
          <IconoTriangulo />
        </BotonOrbita>
        <span className="orbita-rotulo etiqueta" aria-hidden="true">
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={sabor.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {sabor.destinoLargo}
            </motion.span>
          </AnimatePresence>
        </span>
      </div>
    </>
  );

  const folio = (
    <Hoja className="inicio__folio" aria-label="Sabor elegido y controles">
      <div className="inicio__sabor" ref={raiz} aria-live={enPausa ? 'polite' : 'off'}>
        {SABORES.map((s) => (
          <ReservaSabor key={s.id} sabor={s} />
        ))}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={sabor.id}
            className="inicio__texto"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={TEXTO_SUAVE}
          >
            <TextoSabor sabor={sabor} />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* El ritmo del folio: etapa y grabado de cada sabor, en el aire entre texto y controles. */}
      <div className="inicio__ritmo" aria-hidden="true">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={sabor.id}
            className="inicio__ritmo-caja"
            initial={{ opacity: 0, y: 12, rotate: -1.5 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={TEXTO_SUAVE}
          >
            <span className="titulo inicio__numeral">{sabor.etapa}</span>
            <Ilu src={GRABADOS[sabor.id]} className="inicio__grabado" />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="inicio__controles">
        <div className="velocidad" role="group" aria-label="Velocidad del carrusel">
          <div className="velocidad__cabeza">
            <span className="etiqueta" aria-live="polite">{estadoVelocidad}</span>
            <span className="velocidad__marcas" aria-hidden="true">
              {NIVELES.map((n, i) => (
                <span key={n.nombre} className="marca" data-llena={i <= nivel || undefined} />
              ))}
            </span>
          </div>
          <div className="velocidad__pulso" aria-hidden="true">
            <span ref={pulso} />
          </div>
          <div className="velocidad__casillas">
            <button
              type="button"
              className="casilla"
              aria-label="A, más lento"
              aria-disabled={nivel === 0}
              data-limite={limite === -1 || undefined}
              onClick={() => cambiarVelocidad(-1)}
            >
              <span className="casilla__letra">A</span>
              <span className="casilla__pie">Más lento</span>
            </button>
            <button
              type="button"
              className="casilla"
              aria-label="B, más rápido"
              aria-disabled={nivel === NIVELES.length - 1}
              data-limite={limite === 1 || undefined}
              onClick={() => cambiarVelocidad(1)}
            >
              <span className="casilla__letra">B</span>
              <span className="casilla__pie">Más rápido</span>
            </button>
          </div>
        </div>

        <div className="inicio__contacto">
          <h2 className="etiqueta inicio__contacto-titulo">Contacto</h2>
          {CONTACTO.map((c) => (
            <button key={c.id} type="button" className="contacto-enlace" onClick={() => abrirContacto(c.id)}>
              <span>
                <span className="contacto-enlace__letra">{c.letra}</span> · {c.titulo}
              </span>
              <IconoFlecha tam={16} />
            </button>
          ))}
        </div>
      </div>
    </Hoja>
  );

  return (
    <Pantalla
      className={`inicio inicio--${entrada}`}
      etiqueta="Elige un frasco para viajar a su destino"
      escenario={escenario}
      folio={folio}
      propsEscenario={eventosEscenario}
    />
  );
}
