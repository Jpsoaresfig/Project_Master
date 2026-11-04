/* Barra de ruta: Inicio, paradas con matasellos, sello de la pista y reducir movimiento. */
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AVISO_VIP, normalizarRuta, PARADAS, RUTA_VIP } from '../data.js';
import { useMedia } from '../hooks.js';
import { useViaje } from '../state.jsx';
import { centroDe, Go } from './Transicion.jsx';

/* Sin etiqueta visible, «Reducir movimiento» necesita decir qué ha pasado. */
const CONSULTA_SIN_ETIQUETA = '(max-width: 899px), (orientation: landscape) and (max-height: 559px)';
const DURA_AVISO_VIP = 5000;

function Tramo({ recorrido }) {
  return (
    <svg className="tramo" viewBox="0 0 100 2" preserveAspectRatio="none" aria-hidden="true">
      <line className="tramo__base" x1="0" y1="1" x2="100" y2="1" vectorEffect="non-scaling-stroke" />
      <line
        className="tramo__hecho"
        data-recorrido={recorrido || undefined}
        x1="0"
        y1="1"
        x2="100"
        y2="1"
        pathLength="1"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/* Ondas de matasellos: enmarcan la cifra sin taparla. Una × se leería como error. */
function Matasellos() {
  return (
    <svg className="matasellos" viewBox="0 0 26 26" aria-hidden="true">
      <path d="M7 4.9c1-1 2-1 3 0s2 1 3 0 2-1 3 0 2 1 3 0M7 21.1c1-1 2-1 3 0s2 1 3 0 2-1 3 0 2 1 3 0" />
    </svg>
  );
}

function Parada({ parada, ruta, visitados }) {
  const actual = ruta === parada.ruta;
  const visitada = Boolean(visitados[parada.id]);
  const estado = actual ? 'actual' : visitada ? 'visitada' : 'libre';
  const tresVistos = visitados.casa && visitados.ubud && visitados.atacama;
  const lista = parada.id === 'final' && tresVistos && !visitados.final && !actual;
  return (
    <Go
        to={parada.ruta}
        className="parada__enlace"
        aria-current={actual ? 'page' : undefined}
        data-lista={lista || undefined}
      >
        <span className="parada__circulo">
          <span className="parada__numero">{parada.numero}</span>
          {estado === 'visitada' && <Matasellos />}
        </span>
        <span className="parada__texto">{parada.etiqueta}</span>
        {visitada && <span className="sr"> visitado</span>}
    </Go>
  );
}

export default function BarraRuta() {
  const { pathname } = useLocation();
  const ruta = normalizarRuta(pathname);
  const { visitados, pista, vip, reducido, reducirSistema, alternarMovimiento, avisar } = useViaje();
  const [lista, setLista] = useState(false);
  const pistaGanada = pista || vip;
  const enVip = ruta === RUTA_VIP;
  const sinEtiqueta = useMedia(CONSULTA_SIN_ETIQUETA);

  /* Las animaciones de sello solo cuentan después de la primera pintura. */
  useEffect(() => {
    const t = setTimeout(() => setLista(true), 400);
    return () => clearTimeout(t);
  }, []);

  const pulsarMovimiento = () => {
    if (reducirSistema) {
      avisar('Tu sistema ya pide reducir el movimiento.');
      return;
    }
    if (sinEtiqueta) avisar(reducido ? 'Movimiento activado' : 'Movimiento reducido');
    alternarMovimiento();
  };

  return (
    <nav className="ruta" aria-label="Ruta del viaje" data-lista={lista || undefined}>
      <Go to="/" className="ruta__lado" aria-current={ruta === '/' ? 'page' : undefined}>
        <svg className="ruta__icono" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M3.5 11.5 12 4l8.5 7.5M6 10v10h12V10M10 20v-6h4v6" />
        </svg>
        <span className="ruta__lado-texto">Inicio</span>
      </Go>

      <ol className="ruta__paradas">
        {PARADAS.map((parada, i) => (
          <li key={parada.id} className="parada" data-estado={ruta === parada.ruta ? 'actual' : visitados[parada.id] ? 'visitada' : 'libre'}>
            {i > 0 && <Tramo recorrido={Boolean(visitados[parada.id])} />}
            <Parada parada={parada} ruta={ruta} visitados={visitados} />
          </li>
        ))}
        <li className="parada parada--secreta" data-estado={enVip ? 'actual' : pistaGanada ? 'ganada' : 'libre'}>
          <Tramo recorrido={pistaGanada} />
          {pistaGanada || enVip ? (
            <Go
              to={RUTA_VIP}
              className="parada__enlace"
              aria-current={enVip ? 'page' : undefined}
              aria-label="Sección oculta: Crea el remolino perfecto"
            >
              <span className="parada__circulo">
                <span className="parada__numero">?</span>
              </span>
            </Go>
          ) : (
            <button
              type="button"
              className="parada__enlace"
              aria-label="Algo está escondido. Falta una pista"
              onClick={(e) => avisar(AVISO_VIP, DURA_AVISO_VIP, centroDe(e.currentTarget))}
            >
              <span className="parada__circulo">
                <span className="parada__numero">?</span>
              </span>
            </button>
          )}
        </li>
      </ol>

      <button
        type="button"
        className="ruta__lado ruta__lado--movimiento"
        aria-pressed={reducido}
        aria-label="Reducir movimiento"
        onClick={pulsarMovimiento}
      >
        <svg className="ruta__icono" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M3 8c3-3 6-3 9 0s6 3 9 0M3 16c3-3 6-3 9 0s6 3 9 0" />
        </svg>
        <span className="ruta__lado-texto">Reducir movimiento</span>
      </button>
    </nav>
  );
}
