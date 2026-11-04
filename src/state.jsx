/* Estado global del viaje. Persistente, seguro si localStorage falla.
   Contrato completo en src/ARQUITECTURA.md. */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { MotionConfig } from 'framer-motion';

const PREFIJO = 'viaje.';
const memoria = {};

const tipoDe = (v) => (v === null ? 'null' : Array.isArray(v) ? 'array' : typeof v);

/** Lee un valor guardado. Si su tipo no coincide con `porDefecto`, gana `porDefecto`. */
export function leer(clave, porDefecto) {
  try {
    const v = localStorage.getItem(PREFIJO + clave);
    if (v === null) return porDefecto;
    const dato = JSON.parse(v);
    if (porDefecto === undefined || porDefecto === null) return dato;
    return tipoDe(dato) === tipoDe(porDefecto) ? dato : porDefecto;
  } catch {
    return clave in memoria ? memoria[clave] : porDefecto;
  }
}

export function guardar(clave, valor) {
  memoria[clave] = valor;
  try {
    localStorage.setItem(PREFIJO + clave, JSON.stringify(valor));
  } catch {
    /* Sin almacenamiento: la web sigue con la copia en memoria. */
  }
}

const consultaMovimiento = '(prefers-reduced-motion: reduce)';
const sistemaPideQuietud = () =>
  typeof window.matchMedia === 'function' && window.matchMedia(consultaMovimiento).matches;

const Contexto = createContext(null);

/* `origen` acaba en un navigate: solo rutas propias, nunca //otro-sitio. */
const esRutaInterna = (r) => /^\/(?!\/)/.test(r);

function usePersistido(clave, porDefecto, valida) {
  const [valor, setValor] = useState(() => {
    const dato = leer(clave, porDefecto);
    return !valida || valida(dato) ? dato : porDefecto;
  });
  const poner = useCallback(
    (siguiente) => {
      setValor((previo) => {
        const nuevo = typeof siguiente === 'function' ? siguiente(previo) : siguiente;
        guardar(clave, nuevo);
        return nuevo;
      });
    },
    [clave],
  );
  return [valor, poner];
}

export function ViajeProvider({ children }) {
  const [visitados, setVisitados] = usePersistido('visitados', {});
  const [pista, setPista] = usePersistido('pista', false);
  const [vip, setVip] = usePersistido('vip', false);
  const [reducirBoton, setReducirBoton] = usePersistido('quieto', false);
  const [origen, setOrigen] = usePersistido('origen', '/', esRutaInterna);
  const [sistema, setSistema] = useState(sistemaPideQuietud);
  const [aviso, setAviso] = useState(null);
  const temporizadorAviso = useRef(0);

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return undefined;
    const lista = window.matchMedia(consultaMovimiento);
    const cambio = () => setSistema(lista.matches);
    lista.addEventListener('change', cambio);
    return () => lista.removeEventListener('change', cambio);
  }, []);

  const reducido = sistema || reducirBoton;

  /* data-motion va en <html>: tokens.css lleva las duraciones a casi 0. */
  useEffect(() => {
    const raiz = document.documentElement;
    if (reducido) raiz.setAttribute('data-motion', 'reducido');
    else raiz.removeAttribute('data-motion');
  }, [reducido]);

  const visitar = useCallback(
    (id) => setVisitados((v) => (v[id] ? v : { ...v, [id]: true })),
    [setVisitados],
  );
  const darPista = useCallback(() => setPista(true), [setPista]);
  const completarVip = useCallback(() => {
    setVip(true);
    setPista(true);
  }, [setVip, setPista]);
  const alternarMovimiento = useCallback(() => setReducirBoton((v) => !v), [setReducirBoton]);

  /* `ancla`: { x } opcional, para que la nota nazca sobre el botón que la pidió. */
  const avisar = useCallback((mensaje, duracion = 3600, ancla = null) => {
    clearTimeout(temporizadorAviso.current);
    setAviso({ mensaje, ancla, clave: Date.now() });
    temporizadorAviso.current = setTimeout(() => setAviso(null), duracion);
  }, []);

  const valor = useMemo(
    () => ({
      visitados,
      pista,
      vip,
      reducido,
      reducirSistema: sistema,
      reducirBoton,
      origen,
      aviso,
      visitar,
      darPista,
      completarVip,
      alternarMovimiento,
      setOrigen,
      avisar,
    }),
    [visitados, pista, vip, reducido, sistema, reducirBoton, origen, aviso, visitar, darPista,
      completarVip, alternarMovimiento, setOrigen, avisar],
  );

  return (
    <Contexto.Provider value={valor}>
      <MotionConfig reducedMotion={reducido ? 'always' : 'never'}>{children}</MotionConfig>
    </Contexto.Provider>
  );
}

export function useViaje() {
  const contexto = useContext(Contexto);
  if (!contexto) throw new Error('useViaje debe usarse dentro de ViajeProvider');
  return contexto;
}
