/* Web F: capa del eslogan (DESIGN §5). Iris desde el eslogan, nube y cacahuete dorado. */
import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useIsPresent } from 'framer-motion';
import cacahuete from '../assets/ilustraciones/cacahuete.svg?raw';
import hoja from '../assets/ilustraciones/hoja.svg?raw';
import pitaya from '../assets/ilustraciones/pitaya.svg?raw';
import flor from '../assets/ilustraciones/flor-nopal.svg?raw';
import { ESLOGAN, ESLOGAN_A, ESLOGAN_B, FRASES_F, RUTA_VIP } from '../data.js';
import { useCapaModal, useDisposicion } from '../hooks.js';
import { useViaje } from '../state.jsx';
import Cloud from './Cloud.jsx';
import { BotonCerrar } from './piezas.jsx';
import { Go, useTransicion } from './Transicion.jsx';
import './webf.css';

const Contexto = createContext(null);
export const useWebF = () => useContext(Contexto);

export function WebFProvider({ children }) {
  const [abierta, setAbierta] = useState(false);
  const eslogan = useRef(null);
  const libre = useTransicion()?.libre;
  /* Con el velo en marcha o un frasco elegido, la web ya se está yendo. */
  const abrir = useCallback(() => {
    if (!libre || libre()) setAbierta(true);
  }, [libre]);
  const cerrar = useCallback(() => setAbierta(false), []);
  const valor = useMemo(() => ({ abierta, abrir, cerrar, eslogan }), [abierta, abrir, cerrar]);
  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

const ROSA = '#F06A9E';
const LILA = '#B98BD0';
const PITAYA = '#C2185B';
const VERDE = '#8DB35F';
const BLANCO = '#F7F3EA';
const MANCHA_C = 'rgb(176 122 62 / 0.7)';
const MANCHA_R = 'rgb(240 106 158 / 0.55)';
const MANCHA_L = 'rgb(142 95 166 / 0.6)';
const ORO = '#F2C94C';

/* Composición a mano: x e y en fracción del área libre. El dorado nunca queda tapado. */
const ELEMENTOS = [
  { id: 'c1', ilu: cacahuete, mancha: MANCHA_C, tam: 136, x: 0.32, y: 0.06, frase: FRASES_F.casa, etiqueta: 'Cacahuete con una frase' },
  { id: 'p1', ilu: pitaya, mancha: MANCHA_R, tam: 118, x: 0.62, y: 0.28, frase: FRASES_F.ubud, etiqueta: 'Pitaya con una frase' },
  { id: 'f1', ilu: flor, mancha: MANCHA_L, tam: 112, x: 0.88, y: 0.56, frase: FRASES_F.atacama, etiqueta: 'Flor de cactus con una frase' },
  { id: 'oro', ilu: cacahuete, mancha: ORO, tam: 128, x: 0.8, y: 0.86, oro: true, frase: FRASES_F.oro, etiqueta: 'Cacahuete dorado' },
  { id: 'h1', ilu: hoja, mancha: MANCHA_R, tam: 96, x: 0.1, y: 0.1 },
  { id: 'c2', ilu: cacahuete, mancha: MANCHA_C, tam: 104, x: 0.56, y: 0.74 },
  { id: 'h2', ilu: hoja, mancha: MANCHA_L, tam: 96, x: 0.96, y: 0.16 },
  { id: 'e1', forma: 'estrella', color: BLANCO, tam: 28, x: 0.46, y: 0.2 },
  { id: 'e2', forma: 'estrella', color: BLANCO, tam: 20, x: 0.74, y: 0.1 },
  { id: 'e3', forma: 'estrella', color: BLANCO, tam: 24, x: 0.66, y: 0.56 },
  { id: 'e4', forma: 'estrella', color: BLANCO, tam: 18, x: 0.2, y: 0.42 },
  { id: 'pe1', forma: 'petalo', color: ROSA, tam: 44, x: 0.4, y: 0.44 },
  { id: 'pe2', forma: 'petalo', color: PITAYA, tam: 34, x: 0.78, y: 0.4 },
  { id: 'pe3', forma: 'petalo', color: LILA, tam: 40, x: 0.92, y: 0.36 },
  { id: 'pe4', forma: 'hoja', color: VERDE, tam: 46, x: 0.04, y: 0.5 },
  { id: 'pe5', forma: 'petalo', color: LILA, tam: 30, x: 0.5, y: 0.92 },
];

/* Móvil y horizontal: menos área, otra composición. Los grabados no bajan de 96 px. */
const POSICION_MOVIL = {
  c1: { x: 0.04, y: 0.04, tam: 112 },
  p1: { x: 0.92, y: 0.02, tam: 100 },
  f1: { x: 0.9, y: 0.62, tam: 96 },
  oro: { x: 0.44, y: 0.52, tam: 116 },
  h1: { x: 0.02, y: 0.62, tam: 96 },
  e1: { x: 0.5, y: 0.1 },
  e3: { x: 0.74, y: 0.42 },
  e4: { x: 0.26, y: 0.4 },
  pe1: { x: 0.6, y: 0.3 },
  pe2: { x: 0.34, y: 0.94 },
  pe4: { x: 0.06, y: 0.42 },
};
const ELEMENTOS_MOVIL = ELEMENTOS.filter((e) => POSICION_MOVIL[e.id]).map((e) => ({
  ...e,
  ...POSICION_MOVIL[e.id],
}));

function Capa({ origen, alCerrar, botonCerrar, devolver }) {
  const { reducido, darPista } = useViaje();
  const capa = useRef(null);
  const [nota, setNota] = useState(null);
  const movil = useDisposicion() !== 'ancho';

  const presente = useIsPresent();

  useCapaModal(capa, presente, { alCerrar, foco: botonCerrar, devolver });

  const elegir = useCallback(
    (item, el) => {
      const c = capa.current.getBoundingClientRect();
      const r = el.getBoundingClientRect();
      if (item.oro) darPista();
      setNota({
        clave: Date.now(),
        oro: Boolean(item.oro),
        texto: item.frase,
        x: Math.max(12, Math.min(c.width - 268, r.left - 24)),
        y: Math.max(64, Math.min(c.height - 132, r.bottom + 10)),
      });
    },
    [darPista],
  );

  const R = Math.hypot(window.innerWidth, window.innerHeight) * 1.1;
  const cerrado = `circle(0px at ${origen.x}px ${origen.y}px)`;
  const abierto = `circle(${R}px at ${origen.x}px ${origen.y}px)`;
  const tiempo = reducido ? { duration: 0 } : { duration: 0.52, ease: [0.76, 0, 0.24, 1] };

  return (
    <motion.div
      ref={capa}
      id="web-f"
      className="webf"
      data-capa="web-f"
      role="dialog"
      aria-modal="true"
      aria-label={ESLOGAN}
      tabIndex={-1}
      initial={{ clipPath: cerrado }}
      animate={{ clipPath: abierto }}
      exit={{ clipPath: cerrado }}
      transition={tiempo}
    >
      <div className="webf__lema">
        <p className="webf__atrevete titulo">{ESLOGAN_A}</p>
        <p className="webf__mundo cita">{ESLOGAN_B}</p>
        <p className="etiqueta webf__instruccion">Prueba a tocar lo que flota</p>
      </div>

      <div className="webf__aire">
        <Cloud
          items={movil ? ELEMENTOS_MOVIL : ELEMENTOS}
          modo="deriva"
          radio={120}
          rigidez={260}
          amortiguacion={18}
          mitadEnTactil={false}
          esquivaTactil
          respuesta
          alElegir={elegir}
        />
      </div>

      <BotonCerrar ref={botonCerrar} className="webf__cerrar" onClick={alCerrar} />

      {nota && (
        <p
          key={nota.clave}
          className={`nota webf__nota${nota.oro ? ' webf__nota--oro' : ''}`}
          role="status"
          style={{ '--nota-x': `${nota.x}px`, '--nota-y': `${nota.y}px` }}
        >
          {nota.oro ? 'Algo brilla en el camino.' : nota.texto}
          {nota.oro && (
            <Go to={RUTA_VIP} className="webf__pista" onClick={alCerrar}>
              Sigue la pista
            </Go>
          )}
        </p>
      )}
    </motion.div>
  );
}

export default function WebF() {
  const { abierta, cerrar, eslogan } = useWebF();
  const botonCerrar = useRef(null);
  const origen = useRef({ x: 0, y: 0 });

  /* El iris nace del eslogan. Se mide al abrir. */
  if (abierta && eslogan.current) {
    const r = eslogan.current.getBoundingClientRect();
    origen.current = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }

  return (
    <AnimatePresence>
      {abierta && (
        <Capa origen={origen.current} alCerrar={cerrar} botonCerrar={botonCerrar} devolver={eslogan} />
      )}
    </AnimatePresence>
  );
}
