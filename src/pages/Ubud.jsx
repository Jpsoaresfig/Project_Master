/* Web 2, Modo Selva: luz clara, viento y un remolino que abraza al frasco. */
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import foto from '../assets/ubud.webp';
import frondaA from '../assets/ubud/fronda-a.webp';
import frondaB from '../assets/ubud/fronda-b.webp';
import { saborPorId } from '../data.js';
import { useDisposicion, useTactil } from '../hooks.js';
import { useViaje } from '../state.jsx';
import { Cloud, Folio, Frasco, Pantalla, Sello, useTransicion, useWebF } from '../components/index.js';
import { useRafaga } from './ubudRafaga.js';
import { contorno, linea, vena } from './cinta.js';
import FichaPeso from './FichaPeso.jsx';
import '../styles/ubud.css';

const NOTAS = saborPorId('ubud').notas;
const SUAVE = { stiffness: 120, damping: 20 };
const MUELLE_FRASCO = { type: 'spring', stiffness: 170, damping: 22, mass: 1.1 };
const CAIDA = [16, 30];
const DURA_NOTA = 7000;
const DURA_REMOLINO = 0.95;
/* Se disuelve en unos 2 s tras el gesto: dibujo, y fundido de --ubud-fundido en CSS. */
const RETIRA_REMOLINO = 1400;
const INSTRUCCION = 'Toca el frasco y la pitaya';
const ESCALA_150 = 0.74;
const LIMITE_SCROLL = { foto: 44, frondas: -96 };
const ZOOM_SCROLL = 0.1;

const ROSAS = ['#F06A9E', '#C2185B', '#FCE3EC', '#E84C89'];
const VERDES = ['#6E8C4A', '#8FAE5C', '#4F6A32'];

/* Hasta 24: pétalos, hojas y semillas. La mitad se queda fuera en táctil. */
const ITEMS = [
  ...Array.from({ length: 12 }, (_, i) => ({ id: `p${i}`, forma: 'petalo', color: ROSAS[i % 4], tam: 16 + (i * 7) % 20 })),
  ...Array.from({ length: 7 }, (_, i) => ({ id: `h${i}`, forma: 'hoja', color: VERDES[i % 3], tam: 20 + (i * 9) % 22 })),
  ...Array.from({ length: 5 }, (_, i) => ({ id: `s${i}`, forma: 'semilla', color: '#2E2A1F', tam: 7 + (i * 3) % 6 })),
];

const limitar = (v, a, b) => Math.min(b, Math.max(a, v));

/* Hélice en torno al frasco, en unidades del SVG: frasco de 100 × 176,7, con x=100 en su eje,
   hombros de y=171 a y=219 y etiqueta debajo. Dos vueltas abiertas que nacen y mueren en punta
   fina, sin cerrarse en cono. Solo lo que cruza por los hombros va delante; todo lo demás pasa
   por detrás del vidrio, así la etiqueta nunca queda tapada. */
const SVG = { eje: 100, base: 356, cima: 142, hombro: 219, radio: 63, aplasta: 0.2 };

function hebraDeHelice({ fase, vueltas, grueso }) {
  const puntos = 260;
  const centro = [];
  const delante = [];
  for (let i = 0; i <= puntos; i += 1) {
    const t = i / puntos;
    const a = fase + t * vueltas * Math.PI * 2;
    const radio = SVG.radio + Math.sin(t * 7) * 3;
    const x = SVG.eje + Math.cos(a) * radio;
    const y = SVG.base - t * (SVG.base - SVG.cima) + Math.sin(a) * radio * SVG.aplasta;
    centro.push([x, y]);
    delante.push(Math.sin(a) > 0 && y < SVG.hombro);
  }
  /* Más gruesa al pasar por delante (perspectiva) y con pulso propio, como crema estirada. */
  const ancho = (t) => {
    const a = fase + t * vueltas * Math.PI * 2;
    const punta = Math.sin(Math.PI * t) ** 0.62;
    return grueso * punta * (0.74 + 0.26 * Math.sin(a)) * (0.82 + 0.18 * Math.sin(t * 13 + fase));
  };
  const trozos = [];
  let inicio = 0;
  for (let i = 1; i <= puntos + 1; i += 1) {
    if (i === puntos + 1 || delante[i] !== delante[inicio]) {
      const fin = Math.min(puntos, i);
      const tramo = centro.slice(inicio, fin + 1);
      const relativo = (u) => (inicio + u * (fin - inicio)) / puntos;
      const anchoTramo = (u) => ancho(relativo(u));
      trozos.push({
        delante: delante[inicio],
        d: contorno(tramo, anchoTramo),
        luz: vena(tramo, anchoTramo, -0.34, 0.2),
        sombra: vena(tramo, anchoTramo, 0.42, 0.26),
        linea: linea(tramo),
        desde: inicio / puntos,
        dura: (fin - inicio) / puntos,
      });
      inicio = i;
    }
  }
  return trozos;
}

/* La fase deja la cresta delantera de la primera hebra a media altura de los hombros. */
const HEBRAS = [
  { color: 'var(--c-pitaya)', luz: '#F06A9E', trozos: hebraDeHelice({ fase: 0.72, vueltas: 1.75, grueso: 6.4 }) },
  { color: 'var(--c-rosa)', luz: '#FCE3EC', trozos: hebraDeHelice({ fase: 0.72 + Math.PI, vueltas: 1.75, grueso: 3.8 }) },
];

function Helice({ delante, activo, quieto }) {
  return (
    <svg className={`ubud__helice ubud__helice--${delante ? 'delante' : 'detras'}`} viewBox="0 0 200 360" fill="none" aria-hidden="true">
      {HEBRAS.map((h, n) =>
        h.trozos.map((tr, i) => {
          if (tr.delante !== delante) return null;
          const id = `helice-${activo}-${delante ? 'd' : 't'}-${n}-${i}`;
          const cinta = (
            <>
              <path d={tr.d} fill={h.color} />
              <path d={tr.sombra} fill="rgb(70 6 34 / 0.34)" />
              <path d={tr.luz} fill={h.luz} fillOpacity="0.7" />
            </>
          );
          if (quieto) return <g key={id}>{cinta}</g>;
          return (
            <g key={id}>
              <mask id={id} maskUnits="userSpaceOnUse" x="-40" y="100" width="280" height="300">
                <motion.path
                  d={tr.linea}
                  stroke="#fff"
                  strokeWidth="26"
                  strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{
                    pathLength: { duration: tr.dura * DURA_REMOLINO, delay: tr.desde * DURA_REMOLINO, ease: 'linear' },
                    opacity: { duration: 0.01, delay: tr.desde * DURA_REMOLINO },
                  }}
                />
              </mask>
              <g mask={`url(#${id})`}>{cinta}</g>
            </g>
          );
        }),
      )}
    </svg>
  );
}

function NotaCuaderno({ nota, ancla, frasco, contenedor, alCerrar }) {
  const caja = useRef(null);
  const [pos, setPos] = useState(null);

  useLayoutEffect(() => {
    const el = caja.current;
    const a = ancla.current;
    const c = contenedor.current;
    if (!el || !a || !c) return;
    const rc = c.getBoundingClientRect();
    const ra = a.getBoundingClientRect();
    const ax = ra.left + ra.width / 2 - rc.left;
    const ay = ra.top + ra.height / 2 - rc.top;
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    const arriba = 56;
    const margen = 12;
    const rf = frasco.current.getBoundingClientRect();
    const izq = rf.left - rc.left;
    const der = rf.right - rc.left;
    const cima = rf.top - rc.top;
    const hueco = 18;
    /* Nunca sobre el frasco: a su izquierda y, si no cabe, encima, sobre el valle. */
    let left = izq - w - hueco;
    let top = Math.max(arriba, Math.min(rc.height - h - margen, cima + 6));
    if (left < margen) {
      left = Math.max(margen, Math.min(rc.width - w - margen, (izq + der - w) / 2 - 24));
      top = Math.max(arriba, cima - h - hueco - 14);
    }
    const encima = top + h <= cima + 8;
    const px = Math.max(left + 14, Math.min(left + w - 14, ax));
    const py = encima || top + h < ay ? top + h : top;
    setPos({
      left,
      top,
      hilo: `M${px.toFixed(1)} ${py.toFixed(1)}C${(px + 26).toFixed(1)} ${(py + (ay - py) * 0.4).toFixed(1)} ${(ax - 24).toFixed(1)} ${(py + (ay - py) * 0.7).toFixed(1)} ${ax.toFixed(1)} ${ay.toFixed(1)}`,
    });
  }, [nota, ancla, frasco, contenedor]);

  useEffect(() => {
    const t = setTimeout(alCerrar, DURA_NOTA);
    const tecla = (e) => {
      if (e.key === 'Escape') alCerrar();
    };
    window.addEventListener('keydown', tecla);
    return () => {
      clearTimeout(t);
      window.removeEventListener('keydown', tecla);
    };
  }, [nota, alCerrar]);

  return (
    <motion.div className="ubud__nota-capa" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
      {pos && (
        <svg className="ubud__hilo" fill="none" aria-hidden="true">
          <path d={pos.hilo} />
        </svg>
      )}
      <motion.p
        ref={caja}
        className={`nota ${nota.id === 'fruta' ? 'nota--derecha' : ''} ubud__nota`}
        style={pos ? { left: pos.left, top: pos.top } : { visibility: 'hidden' }}
        initial={{ y: 8 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.28, ease: [0.22, 0.9, 0.3, 1] }}
      >
        {nota.texto}
      </motion.p>
    </motion.div>
  );
}

export default function Ubud() {
  const { reducido } = useViaje();
  const disposicion = useDisposicion();
  const tactil = useTactil();
  const transicion = useTransicion();
  const { abierta: webFAbierta } = useWebF();

  const [tam, setTam] = useState(300);
  const [remolino, setRemolino] = useState({ n: 0, visible: false });
  const [nota, setNota] = useState(null);
  const [tocado, setTocado] = useState(false);

  const escena = useRef(null);
  const cajaFrasco = useRef(null);
  const puntoFrasco = useRef(null);
  const puntoFruta = useRef(null);
  const lienzoRafaga = useRef(null);
  const retiro = useRef(0);

  const listo = !transicion || transicion.fase !== 'cubre';
  const conParallax = !reducido;
  const conCursor = !tactil && !reducido;

  const cx = useMotionValue(0);
  const cy = useMotionValue(0);
  const md = useMotionValue(0);
  const sx = useSpring(cx, SUAVE);
  const sy = useSpring(cy, SUAVE);
  const desp = useSpring(md, { stiffness: 180, damping: 28 });
  const fotoX = useTransform(sx, (v) => v * 6);
  const fotoY = useTransform([sy, desp], ([a, b]) => a * 4 + b * LIMITE_SCROLL.foto);
  const fotoZoom = useTransform(desp, (v) => 1 + v * ZOOM_SCROLL);
  const frascoX = useTransform(sx, (v) => v * -12);
  const frascoY = useTransform(sy, (v) => v * -6);
  const frondaX = useTransform(sx, (v) => v * -22);
  const frondaY = useTransform([sy, desp], ([a, b]) => a * -12 + b * LIMITE_SCROLL.frondas);

  const rafaga = useRafaga(lienzoRafaga, { reducido, tactil });

  /* Ráfaga de bienvenida, cuando el remolino de la transición abre la pantalla. */
  const yaEntro = useRef(false);
  useEffect(() => {
    if (!listo || yaEntro.current) return undefined;
    yaEntro.current = true;
    const t = setTimeout(() => rafaga.entrada(), 120);
    return () => clearTimeout(t);
  }, [listo, rafaga]);

  useEffect(() => () => clearTimeout(retiro.current), []);

  /* Scroll, como en Casa: el de la página en apilado; el del folio donde la página no se mueve. */
  useEffect(() => {
    if (reducido) {
      [cx, cy, md, sx, sy, desp].forEach((v) => v.jump(0));
      return undefined;
    }
    /* En táctil el scroll va por el compositor: un parallax desde JS siempre llega tarde y tiembla. */
    if (tactil) return undefined;
    const raiz = escena.current?.closest('.ubud');
    const lienzo = raiz?.querySelector('.escenario');
    const hoja = raiz?.querySelector('.folio__hoja');
    if (!lienzo || !hoja) return undefined;
    const leer = () => {
      if (disposicion === 'apilado') {
        const r = lienzo.getBoundingClientRect();
        md.set(limitar(-r.top / r.height, 0, 1));
      } else {
        const recorrido = hoja.scrollHeight - hoja.clientHeight;
        md.set(recorrido > 0 ? limitar(hoja.scrollTop / recorrido, 0, 1) : 0);
      }
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
  }, [reducido, tactil, disposicion, cx, cy, md, sx, sy, desp]);

  const cerrarNota = useCallback(() => setNota(null), []);

  const pulsarFrasco = (e) => {
    setTocado(true);
    setRemolino((r) => ({ n: r.n + 1, visible: true }));
    setNota({ id: 'frasco', texto: NOTAS.frasco, ancla: puntoFrasco });
    const c = e.currentTarget.getBoundingClientRect();
    const rc = escena.current.getBoundingClientRect();
    rafaga.soplo(c.left + c.width / 2 - rc.left, c.top + c.height * 0.4 - rc.top);
    clearTimeout(retiro.current);
    retiro.current = setTimeout(() => setRemolino((r) => ({ ...r, visible: false })), RETIRA_REMOLINO);
  };

  const pulsarFruta = () => {
    setTocado(true);
    setNota((n) => (n?.id === 'fruta' ? null : { id: 'fruta', texto: NOTAS.fruta, ancla: puntoFruta }));
  };

  const cambiarTam = (g) => {
    setNota(null);
    setTam(g);
  };

  const eventos = useMemo(
    () => ({
      onPointerMove: (e) => {
        if (reducido) return;
        if (e.pointerType === 'mouse' ? !conCursor : false) return;
        const r = e.currentTarget.getBoundingClientRect();
        cx.set(((e.clientX - r.left) / r.width - 0.5) * 2);
        cy.set(((e.clientY - r.top) / r.height - 0.5) * 2);
      },
      onPointerLeave: () => {
        cx.set(0);
        cy.set(0);
      },
      onPointerUp: (e) => {
        if (e.pointerType !== 'touch') return;
        cx.set(0);
        cy.set(0);
      },
      onPointerCancel: () => {
        cx.set(0);
        cy.set(0);
      },
    }),
    [conCursor, reducido, cx, cy],
  );

  const entrada = reducido ? {} : { initial: { y: 40, opacity: 0 }, animate: listo ? { y: 0, opacity: 1 } : undefined };
  const tamSello = disposicion === 'ancho' ? 170 : disposicion === 'bajo' ? 84 : 110;

  const escenario = (
    <div className="ubud__escena" ref={escena}>
      <motion.div className="ubud__plano ubud__plano--foto" style={conParallax ? { x: fotoX, y: fotoY, scale: fotoZoom } : undefined}>
        <div className="ubud__reflejo" aria-hidden="true">
          <div className="ubud__extension">
            <img src={foto} alt="" draggable="false" />
          </div>
          <div className="ubud__extension ubud__extension--base">
            <img src={foto} alt="" draggable="false" />
          </div>
        </div>
        <div className="ubud__lienzo">
          <img className="ubud__foto" src={foto} alt="Una mujer desayuna un cuenco de pitaya en una terraza de bambú, sobre los arrozales de Ubud" draggable="false" />
          <img className="ubud__foto ubud__foto--techo" src={foto} alt="" aria-hidden="true" draggable="false" />
          <img className="ubud__foto ubud__foto--espigas" src={foto} alt="" aria-hidden="true" draggable="false" />
        </div>
      </motion.div>

      <div className="ubud__niebla ubud__niebla--a" />
      <div className="ubud__niebla ubud__niebla--b" />
      <div className="ubud__sol" />

      {/* Partículas y ráfaga, por detrás del frasco: nunca cruzan su etiqueta. */}
      <Cloud items={ITEMS} modo="caida" caida={CAIDA} radio={140} rigidez={120} amortiguacion={20} esquivaTactil activa={!webFAbierta} />
      <canvas className="ubud__rafaga" ref={lienzoRafaga} aria-hidden="true" />

      <motion.div className="ubud__plano ubud__plano--frasco" style={conParallax ? { x: frascoX, y: frascoY } : undefined}>
        <div className="ubud__frasco-eje">
          <motion.div {...entrada} transition={{ duration: 0.52, ease: [0.22, 0.9, 0.3, 1] }}>
            <div className="ubud__contacto" aria-hidden="true" />
            <motion.div className="ubud__frasco-caja" ref={cajaFrasco} animate={{ scale: tam === 150 ? ESCALA_150 : 1 }} transition={MUELLE_FRASCO}>
              <div className="ubud__helice-capa" data-visible={remolino.visible || undefined}>
                {remolino.n > 0 && <Helice activo={remolino.n} quieto={reducido} delante={false} />}
              </div>
              <motion.button
                type="button"
                className="ubud__frasco-boton"
                aria-label="Remolino de Pitaya Rosa: dibujar el remolino alrededor del frasco"
                onClick={pulsarFrasco}
                whileTap={{ scale: 0.98 }}
              >
                <Frasco sabor="ubud" alto="100%" decorativo />
                <span className="ubud__punto ubud__punto--frasco" />
              </motion.button>
              <div className="ubud__helice-capa" data-visible={remolino.visible || undefined}>
                {remolino.n > 0 && <Helice activo={remolino.n} quieto={reducido} delante />}
              </div>
              <span className="ubud__ancla-frasco" ref={puntoFrasco} aria-hidden="true" />
              <button
                type="button"
                className="ubud__fruta"
                ref={puntoFruta}
                aria-label="Pitaya cortada: abrir la nota del cuaderno"
                aria-pressed={nota?.id === 'fruta'}
                onClick={pulsarFruta}
              >
                <span className="ubud__punto" />
              </button>
            </motion.div>
            <FichaPeso tam={tam} escala={tam === 150 ? ESCALA_150 : 1} />
          </motion.div>
        </div>
      </motion.div>

      <motion.div className="ubud__plano ubud__plano--frondas" style={conParallax ? { x: frondaX, y: frondaY } : undefined} aria-hidden="true">
        <img className="ubud__fronda ubud__fronda--a" src={frondaA} alt="" draggable="false" />
        <img className="ubud__fronda ubud__fronda--b" src={frondaB} alt="" draggable="false" />
        <img className="ubud__fronda ubud__fronda--c" src={frondaA} alt="" draggable="false" />
      </motion.div>

      {/* Sello impreso en la foto, no una pieza: sin sombra ni relieve, y sin cursor. */}
      <Sello className="ubud__sello" arriba="Ubud · Bali" abajo="Modo Selva" centro="2" tam={tamSello} rot={-5} opaco />

      <AnimatePresence>
        {!tocado && listo && (
          <motion.p
            className="nota ubud__instruccion"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0, transition: { delay: reducido ? 0 : 1.1, duration: 0.28 } }}
            exit={{ opacity: 0, transition: { duration: 0.16 } }}
          >
            {INSTRUCCION}
          </motion.p>
        )}
      </AnimatePresence>
      <p className="sr" aria-live="polite">{`Frasco de ${tam} g`}</p>

      <div className="ubud__nota-zona" aria-live="polite">
        <AnimatePresence>
          {nota && <NotaCuaderno key={nota.id} nota={nota} ancla={nota.ancla} frasco={cajaFrasco} contenedor={escena} alCerrar={cerrarNota} />}
        </AnimatePresence>
      </div>
    </div>
  );

  return (
    <Pantalla
      className="ubud"
      invertida
      etiqueta="Terraza de bambú sobre los arrozales de Ubud, con el frasco de Remolino de Pitaya Rosa"
      escenario={escenario}
      folio={<Folio sabor="ubud" tam={tam} alCambiarTam={cambiarTam} />}
      propsEscenario={eventos}
    />
  );
}
