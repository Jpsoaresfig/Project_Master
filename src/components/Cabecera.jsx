/* Pestañas de cuaderno que cuelgan del borde superior (DESIGN §4). */
import { motion } from 'framer-motion';
import { ESLOGAN, ESLOGAN_A, MARCA } from '../data.js';
import { useContacto } from './Contacto.jsx';
import { Remolino } from './piezas.jsx';
import { Go } from './Transicion.jsx';
import { useWebF } from './WebF.jsx';

const ENTRADA = {
  initial: { y: -12, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  transition: { duration: 0.28, ease: [0.22, 0.9, 0.3, 1] },
};

export default function Cabecera() {
  const { abierta, abrir, eslogan } = useWebF();
  const { abierto: contactoAbierto, abrir: abrirContacto } = useContacto();
  return (
    <header className="cabecera">
      <motion.div className="pestana-caja" {...ENTRADA}>
        <Go to="/" className="pestana pestana--marca" aria-label={`${MARCA}, volver al inicio`}>
          <Remolino tam={26} />
          <span>{MARCA}</span>
        </Go>
      </motion.div>
      <motion.div className="pestana-caja pestana-grupo" {...ENTRADA}>
        <button
          type="button"
          className="pestana pestana--contacto"
          aria-label="Contacto"
          aria-haspopup="dialog"
          aria-expanded={contactoAbierto}
          onClick={() => abrirContacto('general')}
        >
          <span className="pestana__contacto-texto">Contacto</span>
          <svg className="pestana__contacto-icono" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
            <path d="M2.5 4.5h15v11h-15zM2.5 5l7.5 6 7.5-6" />
          </svg>
        </button>
        <button
          ref={eslogan}
          type="button"
          className="pestana pestana--eslogan"
          aria-label={ESLOGAN}
          aria-haspopup="dialog"
          aria-expanded={abierta}
          onClick={abrir}
        >
          <span className="pestana__largo">{ESLOGAN}</span>
          <span className="pestana__corto">{ESLOGAN_A}</span>
          <Remolino tam={16} className="pestana__remolino" />
        </button>
      </motion.div>
    </header>
  );
}
