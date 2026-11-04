/* Web 3, Modo Noche: la fogata manda. Motor en atacamaEscena.js; capas horneadas en assets/atacama/. */
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import lejos from '../assets/atacama/lejos.webp';
import lejos1300 from '../assets/atacama/lejos-1300.webp';
import medio from '../assets/atacama/medio.webp';
import medio800 from '../assets/atacama/medio-800.webp';
import suelo from '../assets/atacama/suelo.webp';
import suelo1400 from '../assets/atacama/suelo-1400.webp';
import sueloLuz from '../assets/atacama/suelo-luz.webp';
import sueloLuz1400 from '../assets/atacama/suelo-luz-1400.webp';
import duna from '../assets/atacama/duna.webp';
import duna1300 from '../assets/atacama/duna-1300.webp';
import dunaLuz from '../assets/atacama/duna-luz.webp';
import dunaLuz1300 from '../assets/atacama/duna-luz-1300.webp';
import grano from '../assets/atacama/grano.webp';
import cactusA from '../assets/atacama/cactus-a.webp';
import cactusALuz from '../assets/atacama/cactus-a-luz.webp';
import cactusB from '../assets/atacama/cactus-b.webp';
import cactusBLuz from '../assets/atacama/cactus-b-luz.webp';
import { GEOMETRIA_FRASCO, saborPorId } from '../data.js';
import { useDisposicion, useTactil } from '../hooks.js';
import { useViaje } from '../state.jsx';
import { Folio, Frasco, Go, Pantalla, Sello, useWebF } from '../components/index.js';
import { crearEscena, INTENSIDAD_BASE } from './atacamaEscena.js';
import FichaPeso from './FichaPeso.jsx';
import '../styles/atacama.css';

const SABOR = saborPorId('atacama');
const NOTAS = SABOR.notas;
const OTRA_VEZ = 'Otra vez, un poco más';
const GEO = GEOMETRIA_FRASCO.atacama;
/* El borde de luz es el propio recorte del frasco: si cambia la etiqueta, sigue encajando. */
const BORDE = {
  '--borde-img': `url("${SABOR.frasco}")`,
  '--f-altura': GEO.altura,
  '--f-base': GEO.base,
  '--f-eje': GEO.eje,
  '--f-aspecto': GEO.aspecto,
};

/* Fotografía real tratada: dos tamaños, para no servir 2800 px a un teléfono. */
const SUELO = { srcSet: `${suelo1400} 1400w, ${suelo} 2800w`, src: suelo, sizes: 'max(112vw, 205vh)' };
const SUELO_LUZ = { srcSet: `${sueloLuz1400} 1400w, ${sueloLuz} 2800w`, src: sueloLuz, sizes: 'max(112vw, 205vh)' };
const DUNA = { srcSet: `${duna1300} 1300w, ${duna} 2600w`, src: duna, sizes: 'max(114vw, 168vh)' };
const DUNA_LUZ = { srcSet: `${dunaLuz1300} 1300w, ${dunaLuz} 2600w`, src: dunaLuz, sizes: 'max(114vw, 168vh)' };
const LEJOS = { srcSet: `${lejos1300} 1300w, ${lejos} 2600w`, src: lejos, sizes: 'max(120vw, 230vh)' };
const MEDIO = { srcSet: `${medio800} 800w, ${medio} 1500w`, src: medio, sizes: 'max(46vw, 100vh)' };
const MUELLE = { type: 'spring', stiffness: 170, damping: 22, mass: 1.1 };
const ESPERA_SELLO = 620;

/* `lado` -1: el fuego le queda a la derecha y el cactus se voltea para que la luz le dé por ahí. */
function Cactus({ src, luz, clase, voltear }) {
  return (
    <div className={`atacama__cactus ${clase}`} data-voltear={voltear || undefined}>
      <img src={src} alt="" draggable="false" />
      <div className="atacama__cactus-luz">
        <img src={luz} alt="" draggable="false" data-parpadea />
      </div>
    </div>
  );
}

export default function Atacama() {
  const { reducido, darPista } = useViaje();
  const disposicion = useDisposicion();
  const tactil = useTactil();
  const { abierta: webFAbierta } = useWebF();

  const [tam, setTam] = useState(300);
  const [avivadas, setAvivadas] = useState(0);
  const [sello, setSello] = useState(false);

  const raiz = useRef(null);
  const cielo = useRef(null);
  const titila = useRef(null);
  const fuego = useRef(null);
  const ancla = useRef(null);
  const plano1 = useRef(null);
  const plano2 = useRef(null);
  const plano3 = useRef(null);
  const plano4 = useRef(null);
  const sombra = useRef(null);
  const selloRef = useRef(null);
  const motor = useRef(null);
  const estado = useRef({ i: INTENSIDAD_BASE });
  const temporizador = useRef(0);
  const reducidoRef = useRef(reducido);
  reducidoRef.current = reducido;

  /* El motor depende de la disposición: en `apilado` la escena mide lo que el escenario. */
  useEffect(() => {
    const nodo = raiz.current;
    const esc = nodo.closest('.pantalla').querySelector('.escenario');
    const fijarAlto = () => {
      nodo.style.setProperty('--alto-escena', `${esc.offsetHeight}px`);
    };
    fijarAlto();
    const altura = new ResizeObserver(fijarAlto);
    altura.observe(esc);

    const m = crearEscena(
      {
        raiz: nodo,
        escenario: esc,
        cielo: cielo.current,
        titila: titila.current,
        fuego: fuego.current,
        ancla: ancla.current,
        planos: [
          { el: plano1.current, k: 5 },
          { el: plano2.current, k: 9 },
          { el: plano3.current, k: 14 },
          { el: fuego.current, k: 14 },
          { el: plano4.current, k: 22 },
        ],
        parpadeos: [...nodo.querySelectorAll('[data-parpadea]')],
        sombra: sombra.current,
      },
      { reducido, tactil, estado: estado.current },
    );
    motor.current = m;
    return () => {
      altura.disconnect();
      m.destruir();
      motor.current = null;
    };
  }, [reducido, tactil, disposicion]);

  useEffect(() => {
    motor.current?.pausar(webFAbierta);
  }, [webFAbierta]);

  useEffect(
    () => () => {
      clearTimeout(temporizador.current);
      document.documentElement.style.removeProperty('--intensidad');
    },
    [],
  );

  const aRaiz = (e) => {
    const c = raiz.current.getBoundingClientRect();
    return { x: e.clientX - c.left, y: e.clientY - c.top };
  };

  const eventos = {
    onPointerMove: (e) => {
      const { x, y } = aRaiz(e);
      motor.current?.cursor(x, y);
    },
    onPointerDown: (e) => {
      const { x, y } = aRaiz(e);
      motor.current?.cursor(x, y);
    },
    onPointerLeave: () => motor.current?.cursor(null),
    onPointerCancel: () => motor.current?.cursor(null),
    onPointerUp: (e) => {
      if (e.pointerType === 'touch') motor.current?.cursor(null);
    },
  };

  const avivar = () => {
    const siguiente = avivadas + 1;
    setAvivadas(siguiente);
    const segunda = siguiente === 2 && !sello;
    let objetivo = null;
    if (segunda) {
      const c = raiz.current.getBoundingClientRect();
      const r = selloRef.current.getBoundingClientRect();
      objetivo = { x: r.left + r.width / 2 - c.left, y: r.top + r.height / 2 - c.top };
    }
    motor.current?.avivar(objetivo);
    if (segunda) {
      darPista();
      if (reducidoRef.current) setSello(true);
      else temporizador.current = setTimeout(() => setSello(true), ESPERA_SELLO);
    }
  };

  const tamSello = disposicion === 'ancho' ? 170 : disposicion === 'bajo' ? 84 : 118;

  const fondo = (
    <div className="atacama__escena" ref={raiz}>
      <canvas className="atacama__lienzo" ref={cielo} aria-hidden="true" />
      <canvas className="atacama__lienzo atacama__titila" ref={titila} aria-hidden="true" />
      <div className="atacama__horizonte" />

      <div className="atacama__plano" ref={plano1}>
        <img className="atacama__lejos" {...LEJOS} alt="" draggable="false" />
        <div className="atacama__bruma" />
      </div>
      <div className="atacama__plano" ref={plano2}>
        <img className="atacama__medio" {...MEDIO} alt="" draggable="false" />
        <img className="atacama__medio atacama__medio--der" {...MEDIO} alt="" draggable="false" />
      </div>

      <div className="atacama__plano" ref={plano3}>
        <div className="atacama__suelo">
          <img className="atacama__suelo-img" {...SUELO} alt="" draggable="false" />
          <div className="atacama__luz atacama__luz--amplia">
            <div className="atacama__luz-mascara" data-parpadea>
              <img className="atacama__suelo-img" {...SUELO_LUZ} alt="" draggable="false" />
            </div>
          </div>
          <div className="atacama__luz atacama__luz--cerca">
            <div className="atacama__luz-mascara" data-parpadea>
              <img className="atacama__suelo-img" {...SUELO_LUZ} alt="" draggable="false" />
            </div>
          </div>
        </div>

        <Cactus src={cactusB} luz={cactusBLuz} clase="atacama__cactus--lejos" />
        <Cactus src={cactusB} luz={cactusBLuz} clase="atacama__cactus--izq" voltear />
        <Cactus src={cactusA} luz={cactusALuz} clase="atacama__cactus--der" />

        <motion.div className="atacama__frasco" animate={{ scale: tam === 150 ? 0.74 : 1 }} transition={MUELLE}>
          <div className="atacama__contacto" />
          <div className="atacama__sombra" ref={sombra} />
          <Frasco sabor="atacama" alto="100%" className="atacama__frasco-noche" />
          <div className="atacama__frasco-luz">
            <div className="atacama__frasco-parpadeo" data-parpadea>
              <Frasco sabor="atacama" alto="100%" decorativo />
            </div>
          </div>
          <div className="atacama__borde atacama__borde--fuego" style={BORDE} data-parpadea />
          <div className="atacama__borde atacama__borde--luna" style={BORDE} />
          <div className="atacama__destello" data-parpadea />
        </motion.div>
        <div className="atacama__frasco-ficha">
          <FichaPeso tam={tam} escala={tam === 150 ? 0.74 : 1} />
        </div>
      </div>

      <div className="atacama__plano" ref={plano4}>
        <img className="atacama__duna" {...DUNA} alt="" draggable="false" />
        <div className="atacama__duna-luz">
          <img className="atacama__duna" {...DUNA_LUZ} alt="" draggable="false" data-parpadea />
        </div>
      </div>

      <canvas className="atacama__lienzo atacama__fuego" ref={fuego} aria-hidden="true" />
      <div className="atacama__grano" style={{ backgroundImage: `url("${grano}")` }} />
    </div>
  );

  const escenario = (
    <>
      <button
        type="button"
        className="atacama__fogata"
        ref={ancla}
        aria-label={sello ? 'Avivar la fogata' : `Fogata. ${NOTAS.fogata}`}
        onClick={avivar}
        onFocus={(e) => {
          if (e.target.matches(':focus-visible')) motor.current?.foco(true);
        }}
        onBlur={() => motor.current?.foco(false)}
      />

      <AnimatePresence mode="wait">
        {avivadas < 2 && (
          <motion.p
            key={avivadas}
            className="nota atacama__pista"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0, transition: { delay: reducido || avivadas ? 0 : 1.1, duration: 0.28 } }}
            exit={{ opacity: 0, transition: { duration: 0.16 } }}
          >
            {avivadas === 0 ? NOTAS.fogata : OTRA_VEZ}
          </motion.p>
        )}
      </AnimatePresence>
      <p className="sr" aria-live="polite">
        {avivadas === 1 ? OTRA_VEZ : ''}
      </p>
      <p className="sr" aria-live="polite">{`Frasco de ${tam} g`}</p>

      <div className="atacama__hallazgo" ref={selloRef}>
        <div aria-live="polite">
          {sello && (
            <Go to="/remolino-perfecto" className="atacama__sello">
              <Sello arriba="Sigue la pista" abajo="Remolino perfecto" centro="?" tam={tamSello} rot={-6} opaco cae />
              <motion.span
                className="nota atacama__sello-nota"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: reducido ? 0 : 0.22, duration: 0.28 }}
              >
                <span className="atacama__sello-frase">{NOTAS.chispas} </span>
                <strong>{NOTAS.pista}</strong>
              </motion.span>
            </Go>
          )}
        </div>
      </div>
    </>
  );

  return (
    <Pantalla
      className="atacama"
      noche
      etiqueta="Noche en el desierto de Atacama, con una fogata encendida junto al frasco"
      fondo={fondo}
      escenario={escenario}
      folio={<Folio sabor="atacama" tam={tam} alCambiarTam={setTam} />}
      propsEscenario={eventos}
    />
  );
}
