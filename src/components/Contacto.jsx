/* Panel de Contacto. Se abre desde la pestaña de la cabecera y desde G y H en Inicio. */
import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useIsPresent } from 'framer-motion';
import { CONTACTO, MARCA } from '../data.js';
import { useCapaModal } from '../hooks.js';
import { HREF_DOCUMENTACION } from '../raiz.js';
import { useViaje } from '../state.jsx';
import { BotonCerrar, Remolino } from './piezas.jsx';
import { useTransicion } from './Transicion.jsx';

const Contexto = createContext(null);

/** { abierto, seccion, abrir(seccion?), cerrar() } */
export const useContacto = () => useContext(Contexto);

export function ContactoProvider({ children }) {
  const [seccion, setSeccion] = useState(null);
  const libre = useTransicion()?.libre;
  /* Con el velo en marcha o un frasco elegido, la web ya se está yendo. */
  const abrir = useCallback(
    (id = 'escribenos') => {
      if (!libre || libre()) setSeccion(id);
    },
    [libre],
  );
  const cerrar = useCallback(() => setSeccion(null), []);
  const valor = useMemo(
    () => ({ abierto: seccion !== null, seccion, abrir, cerrar }),
    [seccion, abrir, cerrar],
  );
  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

function Panel({ seccion, alCerrar }) {
  const { reducido } = useViaje();
  const capa = useRef(null);
  const cerrarBoton = useRef(null);
  const presente = useIsPresent();
  useCapaModal(capa, presente, { alCerrar, foco: cerrarBoton });
  const tiempo = reducido ? { duration: 0 } : { duration: 0.28, ease: [0.22, 0.9, 0.3, 1] };

  return (
    <div className="contacto" data-theme="inicio">
      <motion.div
        className="contacto__fondo"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={tiempo}
        onClick={alCerrar}
      />
      <motion.aside
        ref={capa}
        className="contacto__hoja"
        role="dialog"
        aria-modal="true"
        aria-labelledby="contacto-titulo"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={tiempo}
      >
        <BotonCerrar ref={cerrarBoton} className="contacto__cerrar" onClick={alCerrar} />
        <h2 id="contacto-titulo" className="titulo contacto__titulo">Contacto</h2>
        <dl className="contacto__lista">
          {CONTACTO.map((c) => (
            <div key={c.id} className="contacto__fila" data-activa={seccion === c.id || undefined}>
              <dt className="etiqueta">
                {c.letra} · {c.titulo}
              </dt>
              <dd className="dato">{c.valor}</dd>
            </div>
          ))}
        </dl>
        <a className="contacto__documentacion" href={HREF_DOCUMENTACION}>
          Documentación
        </a>
        <p className="contacto__firma">
          <Remolino tam={34} />
          <span>{MARCA}</span>
        </p>
      </motion.aside>
    </div>
  );
}

export default function PanelContacto() {
  const { abierto, seccion, cerrar } = useContacto();
  return <AnimatePresence>{abierto && <Panel seccion={seccion} alCerrar={cerrar} />}</AnimatePresence>;
}
