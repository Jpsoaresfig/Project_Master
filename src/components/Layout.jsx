/* Marco común de la web pública: cabecera, ruta, capas y efectos de cada cambio de ruta. */
import { Suspense, useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { normalizarRuta, PARADAS, RUTA_VIP } from '../data.js';
import { useViaje } from '../state.jsx';
import BarraRuta from './BarraRuta.jsx';
import Cabecera from './Cabecera.jsx';
import PanelContacto, { ContactoProvider, useContacto } from './Contacto.jsx';
import ErrorBoundary from './ErrorBoundary.jsx';
import { TransicionProvider } from './Transicion.jsx';
import WebF, { useWebF, WebFProvider } from './WebF.jsx';
import './layout.css';

/** Foco al inicio del <main>: el siguiente Tab cae en la primera interacción del destino.
    El lector de pantalla anuncia el h1, porque nombra al <main> (ver `nombrarContenido`). */
function enfocarContenido() {
  const principal = document.getElementById('contenido');
  if (!principal) return;
  principal.setAttribute('tabindex', '-1');
  principal.focus({ preventScroll: true });
}

/** El <main> se llama como el h1 de la pantalla, también si esta llega en un trozo diferido. */
function nombrarContenido() {
  const principal = document.getElementById('contenido');
  if (!principal) return undefined;
  const nombrar = () => {
    const h1 = principal.querySelector('h1');
    if (!h1) return false;
    if (!h1.id) h1.id = 'titulo-pantalla';
    principal.setAttribute('aria-labelledby', h1.id);
    return true;
  };
  principal.removeAttribute('aria-labelledby');
  if (nombrar()) return undefined;
  const vigia = new MutationObserver(() => {
    if (nombrar()) vigia.disconnect();
  });
  vigia.observe(principal, { childList: true, subtree: true });
  return () => vigia.disconnect();
}

function useEfectosDeRuta() {
  const { pathname } = useLocation();
  const { visitar, setOrigen } = useViaje();
  const { abierta: webFAbierta, cerrar: cerrarWebF } = useWebF();
  const { abierto: contactoAbierto, cerrar: cerrarContacto } = useContacto();
  const primera = useRef(true);
  const habiaCapa = useRef(false);
  habiaCapa.current = webFAbierta || contactoAbierto;

  useEffect(() => {
    const ruta = normalizarRuta(pathname);
    const parada = PARADAS.find((p) => p.ruta === ruta);
    if (parada) visitar(parada.id);
    if (ruta !== RUTA_VIP) setOrigen(ruta);

    const dejarDeNombrar = nombrarContenido();
    if (primera.current) {
      primera.current = false;
      return dejarDeNombrar;
    }

    /* Una capa abierta no sobrevive a la ruta (Atrás con la Web F abierta, por ejemplo). */
    const conCapa = habiaCapa.current;
    cerrarWebF();
    cerrarContacto();
    window.scrollTo(0, 0);
    enfocarContenido();
    /* El fondo sigue `inert` hasta que la capa empieza a irse, y ella devuelve el foco. */
    const espera = conCapa ? setTimeout(enfocarContenido, 80) : 0;
    return () => {
      clearTimeout(espera);
      dejarDeNombrar?.();
    };
  }, [pathname, visitar, setOrigen, cerrarWebF, cerrarContacto]);
}

/* La nota anclada nace sobre su botón, sin salirse de la vista; el hilo marca el botón. */
function colocarAviso(x) {
  const ancho = Math.min(304, window.innerWidth - 24);
  const izquierda = Math.max(12, Math.min(window.innerWidth - ancho - 12, x - ancho / 2));
  return { width: ancho, marginLeft: izquierda, '--aviso-hilo': `${x - izquierda}px` };
}

function Aviso() {
  const { aviso } = useViaje();
  return (
    <div className="aviso-zona" role="status" data-anclada={aviso?.ancla ? '' : undefined}>
      <AnimatePresence>
        {aviso && (
          <motion.p
            key={aviso.clave}
            className={`nota aviso${aviso.ancla ? ' aviso--anclado' : ''}`}
            style={aviso.ancla ? colocarAviso(aviso.ancla.x) : undefined}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28 }}
          >
            {aviso.mensaje}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

function Marco() {
  useEfectosDeRuta();
  const { pathname } = useLocation();
  return (
    <>
      <div id="app-contenido">
        <a
          className="saltar"
          href="#contenido"
          onClick={(e) => {
            e.preventDefault();
            enfocarContenido();
          }}
        >
          Saltar al contenido
        </a>
        <Cabecera />
        <main id="contenido">
          <ErrorBoundary clave={pathname}>
            <Suspense fallback={<div className="cargando-ruta" role="status"><span className="sr">Cargando el destino</span></div>}>
              <Outlet />
            </Suspense>
          </ErrorBoundary>
        </main>
        <BarraRuta />
      </div>
      <Aviso />
      <PanelContacto />
      <WebF />
    </>
  );
}

export default function Layout() {
  return (
    <TransicionProvider>
      <WebFProvider>
        <ContactoProvider>
          <Marco />
        </ContactoProvider>
      </WebFProvider>
    </TransicionProvider>
  );
}
