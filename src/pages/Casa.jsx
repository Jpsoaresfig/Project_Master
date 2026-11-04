/* Web 1, Modo Origen: la mesa del desayuno, en planos de profundidad (DESIGN §5). */
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import desayuno from '../assets/desayuno.webp';
import desayuno1050 from '../assets/casa/desayuno-1050.webp';
import desayuno700 from '../assets/casa/desayuno-700.webp';
import lino from '../assets/casa/lino.webp';
import lino1000 from '../assets/casa/lino-1000.webp';
import cacahuete from '../assets/cacahuete.webp';
import { GEOMETRIA_FRASCO, TAMANOS, saborPorId } from '../data.js';
import { useDisposicion } from '../hooks.js';
import { useViaje } from '../state.jsx';
import { Folio, Frasco, Pantalla, useTransicion } from '../components/index.js';
import FichaPeso from './FichaPeso.jsx';
import '../styles/casa.css';

const SABOR = saborPorId('casa');
const INSTRUCCION = 'Toca lo que hay sobre la mesa';
const DURA_OLA = 3200;
const GEO = GEOMETRIA_FRASCO.casa;
/* La luz y el borde del vidrio usan el propio recorte: si cambia la etiqueta, siguen encajando. */
const RECORTE = {
  '--recorte': `url("${SABOR.frasco}")`,
  '--f-altura': GEO.altura,
  '--f-base': GEO.base,
  '--f-eje': GEO.eje,
  '--f-aspecto': GEO.aspecto,
};
const FOTO = {
  srcSet: `${desayuno700} 700w, ${desayuno1050} 1050w, ${desayuno} 1400w`,
  sizes: '(orientation: portrait) max(100vw, 66vh), max(76vw, 100vh)',
};
const LINO = { srcSet: `${lino1000} 1000w, ${lino} 2000w`, src: lino, sizes: 'max(90vw, 900px)' };
const ESCALA_150 = 0.74;
const MUELLE_SUAVE = { stiffness: 120, damping: 20 };
const MUELLE_FRASCO = { type: 'spring', stiffness: 170, damping: 22, mass: 1.1 };
const CURVA_CUCHARA = [0.3, 1.45, 0.5, 1];
const CURVA_SALIDA = [0.22, 0.9, 0.3, 1];

/* Amplitud de cada plano en px. El signo opone la foto a lo que está delante. */
const PLANO = { foto: 8, luz: -30, sombra: -11, frasco: -18, grabado: -26, cacahuetes: -34 };
/* Lo que cada plano se desplaza con el scroll. El frasco no sube: su base no debe verse. */
const SCROLL = { foto: 44, luz: 20, grabado: -26, cacahuetes: -96 };
const ZOOM_SCROLL = 0.1;

const CACAHUETES = [
  { id: 'a', ancho: 'var(--cacahuete-a)', estilo: { left: 0, bottom: 0, rotate: '-14deg' } },
  { id: 'b', ancho: 'var(--cacahuete-b)', estilo: { left: '58%', bottom: '46%', rotate: '22deg' } },
];

const limitar = (v, a, b) => Math.min(b, Math.max(a, v));

function usePlano(cx, cy, desp, k, kScroll = 0) {
  const x = useTransform(cx, (v) => v * k);
  const y = useTransform([cy, desp], ([a, b]) => a * k + b * kScroll);
  return { x, y };
}

export default function Casa() {
  const { reducido } = useViaje();
  const disposicion = useDisposicion();
  const transicion = useTransicion();

  const [tam, setTam] = useState(TAMANOS[0]);
  const [montado, setMontado] = useState(false);
  const [abierto, setAbierto] = useState(null);
  const [vistos, setVistos] = useState({});
  const [geo, setGeo] = useState(null);
  const [ola, setOla] = useState(false);

  const capaPuntos = useRef(null);
  const nota = useRef(null);
  const botones = useRef({});
  const dedo = useRef(false);

  /* Posición normalizada del cursor (-1 a 1) y avance del scroll (0 a 1). */
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const md = useMotionValue(0);
  const cx = useSpring(mx, MUELLE_SUAVE);
  const cy = useSpring(my, MUELLE_SUAVE);
  const desp = useSpring(md, { stiffness: 180, damping: 28 });

  const foto = usePlano(cx, cy, desp, PLANO.foto, SCROLL.foto);
  const luz = usePlano(cx, cy, desp, PLANO.luz, SCROLL.luz);
  const sombra = usePlano(cx, cy, desp, PLANO.sombra);
  const frasco = usePlano(cx, cy, desp, PLANO.frasco);
  const granos = usePlano(cx, cy, desp, PLANO.cacahuetes, SCROLL.cacahuetes);
  const zoomFoto = useTransform(desp, (v) => 1 + v * ZOOM_SCROLL);

  const entrada = montado && transicion?.fase !== 'cubre';

  useEffect(() => {
    const cuadro = requestAnimationFrame(() => setMontado(true));
    return () => cancelAnimationFrame(cuadro);
  }, []);

  /* Los tres puntos laten juntos justo cuando aparece la instrucción, y luego se calman. */
  useEffect(() => {
    if (!entrada || reducido) return undefined;
    setOla(true);
    const t = setTimeout(() => setOla(false), DURA_OLA);
    return () => clearTimeout(t);
  }, [entrada, reducido]);

  /* El grabado vive en el folio, fuera del escenario: se mueve con el mismo muelle. */
  useEffect(() => {
    const grabado = capaPuntos.current?.closest('.casa')?.querySelector('.folio__grabado .ilu');
    if (!grabado) return undefined;
    const pintar = () => {
      const dx = cx.get() * PLANO.grabado;
      const dy = cy.get() * PLANO.grabado + desp.get() * SCROLL.grabado;
      grabado.style.transform = `translate3d(${dx.toFixed(2)}px, ${dy.toFixed(2)}px, 0)`;
    };
    const quitar = [cx.on('change', pintar), cy.on('change', pintar), desp.on('change', pintar)];
    return () => {
      quitar.forEach((q) => q());
      grabado.style.transform = '';
    };
  }, [cx, cy, desp]);

  /* Cursor o lápiz en toda la pantalla. El dedo se escucha en el escenario. */
  useEffect(() => {
    if (reducido) {
      [mx, my, md, cx, cy, desp].forEach((v) => v.jump(0));
      return undefined;
    }
    const mover = (e) => {
      if (e.pointerType === 'touch') return;
      mx.set(limitar((e.clientX / window.innerWidth) * 2 - 1, -1, 1));
      my.set(limitar((e.clientY / window.innerHeight) * 2 - 1, -1, 1));
    };
    const salir = () => {
      mx.set(0);
      my.set(0);
    };
    window.addEventListener('pointermove', mover, { passive: true });
    document.documentElement.addEventListener('pointerleave', salir);
    return () => {
      window.removeEventListener('pointermove', mover);
      document.documentElement.removeEventListener('pointerleave', salir);
    };
  }, [reducido, mx, my, md, cx, cy, desp]);

  /* Scroll: el de la página en apilado; el del folio donde la página no se mueve. */
  useEffect(() => {
    if (reducido) return undefined;
    const raiz = capaPuntos.current?.closest('.casa');
    const escenario = raiz?.querySelector('.escenario');
    const hoja = raiz?.querySelector('.folio__hoja');
    if (!escenario || !hoja) return undefined;
    const leer = () => {
      if (disposicion === 'apilado') {
        const r = escenario.getBoundingClientRect();
        md.set(limitar(-r.top / r.height, 0, 1));
      } else {
        const recorrido = hoja.scrollHeight - hoja.clientHeight;
        md.set(recorrido > 0 ? limitar(hoja.scrollTop / recorrido, 0, 1) : 0);
      }
      /* Sin página que desplazar, el dedo es libre en los dos ejes. */
      const pagina = document.documentElement.scrollHeight > window.innerHeight + 1;
      escenario.style.touchAction = pagina ? 'pan-y' : 'none';
    };
    leer();
    window.addEventListener('scroll', leer, { passive: true });
    hoja.addEventListener('scroll', leer, { passive: true });
    window.addEventListener('resize', leer);
    return () => {
      window.removeEventListener('scroll', leer);
      hoja.removeEventListener('scroll', leer);
      window.removeEventListener('resize', leer);
    };
  }, [reducido, disposicion, md]);

  const seguirDedo = (e) => {
    if (e.pointerType !== 'touch' || reducido) return;
    const r = e.currentTarget.getBoundingClientRect();
    mx.set(limitar(((e.clientX - r.left) / r.width) * 2 - 1, -1, 1));
    my.set(limitar(((e.clientY - r.top) / r.height) * 2 - 1, -1, 1));
    dedo.current = true;
  };

  const soltarDedo = () => {
    if (!dedo.current) return;
    dedo.current = false;
    mx.set(0);
    my.set(0);
  };

  const alternar = (id) => {
    setVistos((v) => ({ ...v, [id]: true }));
    setAbierto((actual) => (actual === id ? null : id));
  };

  /* Esc cierra la nota y devuelve el foco a su punto. */
  useEffect(() => {
    if (!abierto) return undefined;
    const tecla = (e) => {
      if (e.key !== 'Escape') return;
      botones.current[abierto]?.focus();
      setAbierto(null);
    };
    document.addEventListener('keydown', tecla);
    return () => document.removeEventListener('keydown', tecla);
  }, [abierto]);

  /* Coloca la nota dentro del escenario y traza el hilo hasta su punto. */
  const medir = useCallback(() => {
    const capa = capaPuntos.current;
    const ficha = nota.current;
    const punto = SABOR.puntos.find((p) => p.id === abierto);
    if (!capa || !ficha || !punto) return;
    const rc = capa.getBoundingClientRect();
    const re = capa.closest('.escenario').getBoundingClientRect();
    const k = rc.width / capa.offsetWidth || 1;
    const px = (capa.offsetWidth * punto.x) / 100;
    const py = (capa.offsetHeight * punto.y) / 100;
    const ancho = ficha.offsetWidth;
    const alto = ficha.offsetHeight;
    const margen = 14;
    const techo = (re.top + 56 - rc.top) / k;
    const suelo = (re.bottom - margen - rc.top) / k;
    const izquierda = (re.left + margen - rc.left) / k;
    const derecha = (re.right - margen - rc.left) / k - ancho;

    const encima = py - alto - 34 >= techo;
    const top = limitar(encima ? py - alto - 34 : py + 34, techo, suelo - alto);
    const left = limitar(px + 22, izquierda, Math.max(izquierda, derecha));
    const ax = limitar(px, left + 14, left + ancho - 14);
    const ay = encima ? top + alto - 1 : top + 1;
    const qx = (ax + px) / 2 + (punto.x > 50 ? 22 : -22);
    const qy = (ay + py) / 2;
    setGeo({ id: punto.id, left, top, hilo: `M${ax} ${ay}Q${qx} ${qy} ${px} ${py}` });
  }, [abierto]);

  useLayoutEffect(medir, [medir]);

  useEffect(() => {
    if (!abierto) return undefined;
    window.addEventListener('resize', medir);
    return () => window.removeEventListener('resize', medir);
  }, [abierto, medir]);

  const puntoAbierto = SABOR.puntos.find((p) => p.id === abierto);
  const hilo = geo?.id === abierto ? geo : null;

  const escenario = (
    <>
      <motion.div className="casa__reflejo" style={{ x: foto.x, y: foto.y }} aria-hidden="true">
        <img src={desayuno700} alt="" draggable="false" />
      </motion.div>

      <motion.div className="casa__lienzo" style={{ x: foto.x, y: foto.y, scale: zoomFoto }}>
        <img
          src={desayuno}
          {...FOTO}
          alt="Cuenco de desayuno con crema de cacahuete en una cuchara dorada, sobre lino"
          width="1400"
          height="1400"
          draggable="false"
        />
      </motion.div>

      <motion.div className="casa__luz" style={luz} aria-hidden="true" />

      <motion.div className="casa__plano casa__plano--sombra" style={sombra} aria-hidden="true">
        <img className="casa__lino casa__lino--fondo" {...LINO} alt="" draggable="false" />
        <motion.span
          className="casa__sombra"
          initial={{ opacity: 0 }}
          animate={{ opacity: entrada ? 1 : 0, scale: tam === 300 ? 1 : ESCALA_150 }}
          transition={{ opacity: { duration: 0.52, delay: 0.1 }, scale: MUELLE_FRASCO }}
        />
      </motion.div>

      <motion.div className="casa__plano casa__plano--frasco" style={frasco}>
        <motion.div
          className="casa__aparicion"
          initial={{ y: 40, opacity: 0 }}
          animate={entrada ? { y: 0, opacity: 1 } : { y: 40, opacity: 0 }}
          transition={{
            y: { duration: 0.52, ease: CURVA_CUCHARA },
            opacity: { duration: 0.28, ease: CURVA_SALIDA },
          }}
        >
          <motion.div
            className="casa__escala"
            animate={{ scale: tam === 300 ? 1 : ESCALA_150 }}
            transition={MUELLE_FRASCO}
          >
            <div className="casa__frasco-caja">
              <span className="casa__contacto" aria-hidden="true" />
              <Frasco sabor="casa" alto="100%" />
              <span className="casa__frasco-luz" style={RECORTE} aria-hidden="true" />
              <span className="casa__frasco-borde" style={RECORTE} aria-hidden="true" />
            </div>
          </motion.div>
          <div className="casa__ficha">
            <FichaPeso tam={tam} escala={tam === 300 ? 1 : ESCALA_150} />
          </div>
        </motion.div>
      </motion.div>

      <motion.div className="casa__plano casa__plano--lino" style={frasco} aria-hidden="true">
        <motion.img
          className="casa__lino"
          {...LINO}
          alt=""
          draggable="false"
          initial={{ y: 26, opacity: 0 }}
          animate={entrada ? { y: 0, opacity: 1 } : { y: 26, opacity: 0 }}
          transition={{ duration: 0.52, ease: CURVA_SALIDA }}
        />
      </motion.div>

      <motion.div className="casa__plano casa__plano--cacahuetes" style={granos} aria-hidden="true">
        {CACAHUETES.map((c, i) => (
          <motion.img
            key={c.id}
            className="casa__cacahuete"
            src={cacahuete}
            alt=""
            draggable="false"
            style={{ width: c.ancho, ...c.estilo }}
            initial={{ opacity: 0, y: 26 }}
            animate={entrada ? { opacity: 1, y: 0 } : { opacity: 0, y: 26 }}
            transition={{ duration: 0.52, delay: 0.28 + i * 0.1, ease: CURVA_CUCHARA }}
          />
        ))}
      </motion.div>

      <motion.div
        ref={capaPuntos}
        className="casa__lienzo casa__lienzo--puntos"
        data-ola={ola || undefined}
        style={{ x: foto.x, y: foto.y, scale: zoomFoto }}
      >
        {SABOR.puntos.map((p, i) => (
          <motion.button
            key={p.id}
            ref={(el) => {
              botones.current[p.id] = el;
            }}
            type="button"
            className="casa__punto"
            style={{ '--x': p.x, '--i': i, top: `${p.y}%` }}
            aria-label={p.etiqueta}
            aria-expanded={abierto === p.id}
            data-visto={vistos[p.id] || undefined}
            initial={{ opacity: 0, scale: 0.4 }}
            animate={entrada ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.4 }}
            transition={{ duration: 0.28, delay: 0.5 + i * 0.12, ease: CURVA_SALIDA }}
            whileTap={{ scale: 0.9 }}
            onClick={() => alternar(p.id)}
          />
        ))}

        <AnimatePresence>
          {puntoAbierto && (
            <motion.div
              key={puntoAbierto.id}
              className="casa__anotacion"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.16 }}
            >
              <svg className="casa__hilo" aria-hidden="true">
                {hilo && (
                  <motion.path
                    d={hilo.hilo}
                    initial={{ pathLength: reducido ? 1 : 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.28, ease: CURVA_SALIDA }}
                  />
                )}
              </svg>
              <motion.p
                ref={(el) => {
                  if (el) nota.current = el;
                }}
                className={`nota casa__nota ${puntoAbierto.x > 50 ? 'nota--derecha' : ''}`.trim()}
                style={{ left: hilo?.left ?? 0, top: hilo?.top ?? 0, visibility: hilo ? 'visible' : 'hidden' }}
                initial={{ y: 8 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.28, ease: CURVA_SALIDA }}
              >
                {puntoAbierto.nota}
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {Object.keys(vistos).length === 0 && entrada && (
          <motion.p
            className="nota casa__instruccion"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0, transition: { delay: reducido ? 0 : 0.9, duration: 0.28 } }}
            exit={{ opacity: 0, transition: { duration: 0.16 } }}
          >
            {INSTRUCCION}
          </motion.p>
        )}
      </AnimatePresence>

      <p className="sr" aria-live="polite">
        {puntoAbierto ? `${puntoAbierto.etiqueta}: ${puntoAbierto.nota}` : ''}
      </p>
      <p className="sr" aria-live="polite">{`Frasco de ${tam} g`}</p>
    </>
  );

  return (
    <Pantalla
      className="casa"
      etiqueta="Mesa de desayuno con el frasco Tradicional. Los puntos abren notas del cuaderno"
      escenario={escenario}
      folio={<Folio sabor="casa" tam={tam} alCambiarTam={setTam} />}
      propsEscenario={{
        onPointerDown: (e) => {
          if (abierto && !e.target.closest('.casa__punto, .casa__nota')) setAbierto(null);
          seguirDedo(e);
        },
        onPointerMove: seguirDedo,
        onPointerUp: soltarDedo,
        onPointerCancel: soltarDedo,
        onPointerLeave: soltarDedo,
      }}
    />
  );
}
