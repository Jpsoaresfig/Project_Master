/* Pantallas en trozos aparte. La misma carga sirve al lazy() de App.jsx y a la
   precarga del velo: import() solo se resuelve una vez. */
import { normalizarRuta } from './data.js';

export const CARGAS = {
  '/casa': () => import('./pages/Casa.jsx'),
  '/de-vuelta-a-casa': () => import('./pages/Final.jsx'),
  '/ubud': () => import('./pages/Ubud.jsx'),
  '/atacama': () => import('./pages/Atacama.jsx'),
  '/remolino-perfecto': () => import('./pages/Vip.jsx'),
};

/** Sin esperar y sin fallar: si la red cae, lazy() lo reintenta y responde el ErrorBoundary. */
export function precargarRuta(to) {
  CARGAS[normalizarRuta(to)]?.().catch(() => {});
}

/** Con el móvil libre y sin ahorro de datos, deja listas las pantallas: el velo ya no espera a la red. */
export function precargarEnReposo() {
  if (navigator.connection?.saveData) return;
  const rutas = Object.keys(CARGAS);
  const siguiente = () => {
    const ruta = rutas.shift();
    if (!ruta) return;
    precargarRuta(ruta);
    programar();
  };
  const programar = () => {
    if ('requestIdleCallback' in window) requestIdleCallback(siguiente, { timeout: 4000 });
    else setTimeout(siguiente, 900);
  };
  programar();
}
