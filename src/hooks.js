/* Ganchos compartidos. Las consultas de disposición son las mismas que en styles/app.css. */
import { useEffect, useRef, useState } from 'react';

export const CONSULTA_APILADO =
  '(orientation: portrait) and (max-width: 1099px), (max-width: 699px) and (min-height: 560px)';
export const CONSULTA_BAJO = '(orientation: landscape) and (max-height: 559px)';
export const CONSULTA_TACTIL = '(hover: none), (pointer: coarse)';

export function useMedia(consulta) {
  const [coincide, setCoincide] = useState(() => window.matchMedia(consulta).matches);
  useEffect(() => {
    const lista = window.matchMedia(consulta);
    const cambio = () => setCoincide(lista.matches);
    cambio();
    lista.addEventListener('change', cambio);
    return () => lista.removeEventListener('change', cambio);
  }, [consulta]);
  return coincide;
}

/** 'ancho' (2/3 + 1/3), 'apilado' (una columna o tableta vertical) o 'bajo' (móvil horizontal). */
export function useDisposicion() {
  const apilado = useMedia(CONSULTA_APILADO);
  const bajo = useMedia(CONSULTA_BAJO);
  if (bajo) return 'bajo';
  return apilado ? 'apilado' : 'ancho';
}

export const useTactil = () => useMedia(CONSULTA_TACTIL);

const ENFOCABLES =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const pila = [];
let scrollPrevio = '';

/**
 * Capa modal: bloquea el fondo con `inert`, atrapa Tab, cierra con Esc y devuelve el foco.
 * Las capas se apilan: Esc y Tab solo actúan sobre la superior, y Esc no llega a la pantalla.
 * `foco`: ref del elemento que recibe el foco al abrir. `devolver`: ref opcional del
 * elemento que lo recupera al cerrar; por defecto, el que lo tenía antes.
 */
export function useCapaModal(ref, abierta, { alCerrar, foco, devolver } = {}) {
  const cerrar = useRef(alCerrar);
  cerrar.current = alCerrar;

  useEffect(() => {
    if (!abierta) return undefined;
    const previo = document.activeElement;
    const fondo = document.getElementById('app-contenido');
    const raiz = document.documentElement;
    if (!pila.length) {
      scrollPrevio = raiz.style.overflow;
      raiz.style.overflow = 'hidden';
      fondo?.setAttribute('inert', '');
    }
    const marca = {};
    pila.push(marca);

    const capa = ref.current;
    (foco?.current || capa?.querySelector(ENFOCABLES) || capa)?.focus({ preventScroll: true });

    const tecla = (e) => {
      if (pila[pila.length - 1] !== marca) return;
      if (e.key === 'Escape') {
        e.stopImmediatePropagation();
        cerrar.current?.();
        return;
      }
      if (e.key !== 'Tab' || !capa) return;
      const lista = [...capa.querySelectorAll(ENFOCABLES)].filter((el) => el.offsetParent !== null);
      if (!lista.length) return;
      const primero = lista[0];
      const ultimo = lista[lista.length - 1];
      if (e.shiftKey && document.activeElement === primero) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && document.activeElement === ultimo) {
        e.preventDefault();
        primero.focus();
      }
    };
    /* En captura: la capa responde antes que los Esc propios de cada pantalla. */
    window.addEventListener('keydown', tecla, true);

    return () => {
      window.removeEventListener('keydown', tecla, true);
      pila.splice(pila.indexOf(marca), 1);
      if (!pila.length) {
        fondo?.removeAttribute('inert');
        raiz.style.overflow = scrollPrevio;
      }
      (devolver?.current || previo)?.focus?.({ preventScroll: true });
    };
  }, [abierta, ref, foco, devolver]);
}
