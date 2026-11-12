/* Carpeta real de la web, calculada al ejecutar: el ZIP se sirve desde cualquier subcarpeta.
   Este módulo queda un nivel por debajo de la raíz, tanto en src/ como en assets/. */
const RAIZ = new URL(/* @vite-ignore */ '../', import.meta.url).pathname;

export const BASENAME = RAIZ.replace(/\/+$/, '') || '/';

/* Enlaces del panel de Contacto: documentación, identidad visual y storyboard.
   Con `base: './'` (ZIP) apunta a la copia estática, que no necesita reescrituras. */
export const HREF_DOCUMENTACION =
  import.meta.env.BASE_URL === '/' ? '/documentation' : `${RAIZ}documentacion.html`;
export const HREF_COLORES = import.meta.env.BASE_URL === '/' ? '/colors' : `${RAIZ}colors.html`;
export const HREF_STORYBOARD = import.meta.env.BASE_URL === '/' ? '/storyboard' : `${RAIZ}storyboard.html`;
