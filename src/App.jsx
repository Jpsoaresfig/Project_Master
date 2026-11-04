import { lazy, Suspense, useLayoutEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { metaDeRuta } from './data.js';
import Layout from './components/Layout.jsx';
import Inicio from './pages/Inicio.jsx';
import Casa from './pages/Casa.jsx';
import Final from './pages/Final.jsx';
import NoEncontrada from './pages/NoEncontrada.jsx';
import { CARGAS } from './rutasDiferidas.js';

/* Las tres pantallas más pesadas van aparte. Transicion.jsx las precarga al arrancar el velo. */
const Ubud = lazy(CARGAS['/ubud']);
const Atacama = lazy(CARGAS['/atacama']);
const Vip = lazy(CARGAS['/remolino-perfecto']);
const Documentacion = lazy(() => import('./pages/Documentacion.jsx'));

/* Cada ruta lleva su descripción. `valor` null retira la etiqueta. */
function ponerMeta(selector, atributo, nombre, valor) {
  let meta = document.head.querySelector(selector);
  if (valor === null) {
    meta?.remove();
    return;
  }
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute(atributo, nombre);
    document.head.append(meta);
  }
  meta.setAttribute('content', valor);
}

/* data-theme y título. El tema cambia aquí, cuando el remolino ya cubre la pantalla. */
function useMetaRuta() {
  const { pathname } = useLocation();
  useLayoutEffect(() => {
    const raiz = document.documentElement;
    const { tema, titulo, descripcion } = metaDeRuta(pathname);
    if (tema) raiz.setAttribute('data-theme', tema);
    else raiz.removeAttribute('data-theme');
    document.title = titulo;
    ponerMeta('meta[name="description"]', 'name', 'description', descripcion);
    ponerMeta('meta[property="og:title"]', 'property', 'og:title', titulo);
    ponerMeta('meta[property="og:description"]', 'property', 'og:description', descripcion);
    ponerMeta('meta[name="robots"]', 'name', 'robots', tema === null ? 'noindex' : null);

    /* Atacama: --intensidad cambia cada frame; la transición de <html> solo sirve al entrar. */
    raiz.removeAttribute('data-clima');
    if (tema !== 'atacama') return undefined;
    const t = setTimeout(() => raiz.setAttribute('data-clima', 'fijo'), 1200);
    return () => clearTimeout(t);
  }, [pathname]);
}

function PaginaDocumentacion() {
  return (
    <Suspense fallback={<div className="cargando" role="status">Cargando documentación</div>}>
      <Documentacion />
    </Suspense>
  );
}

export default function App() {
  useMetaRuta();
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Inicio />} />
        <Route path="/index.html" element={<Inicio />} />
        <Route path="/casa" element={<Casa />} />
        <Route path="/ubud" element={<Ubud />} />
        <Route path="/atacama" element={<Atacama />} />
        <Route path="/remolino-perfecto" element={<Vip />} />
        <Route path="/de-vuelta-a-casa" element={<Final />} />
        <Route path="*" element={<NoEncontrada />} />
      </Route>
      <Route path="/documentation" element={<PaginaDocumentacion />} />
      <Route path="/documentacion" element={<PaginaDocumentacion />} />
      <Route path="/documentacion.html" element={<PaginaDocumentacion />} />
    </Routes>
  );
}
