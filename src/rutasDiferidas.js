/* Pantallas pesadas en trozos aparte. La misma carga sirve al lazy() de App.jsx y a la
   precarga del velo: import() solo se resuelve una vez. */
import { normalizarRuta } from './data.js';

export const CARGAS = {
  '/ubud': () => import('./pages/Ubud.jsx'),
  '/atacama': () => import('./pages/Atacama.jsx'),
  '/remolino-perfecto': () => import('./pages/Vip.jsx'),
};

/** Sin esperar y sin fallar: si la red cae, lazy() lo reintenta y responde el ErrorBoundary. */
export function precargarRuta(to) {
  CARGAS[normalizarRuta(to)]?.().catch(() => {});
}
