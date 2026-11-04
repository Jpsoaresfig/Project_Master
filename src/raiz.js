/* Carpeta real de la web, calculada al ejecutar: el ZIP se sirve desde cualquier subcarpeta.
   Este módulo queda un nivel por debajo de la raíz, tanto en src/ como en assets/. */
const RAIZ = new URL(/* @vite-ignore */ '../', import.meta.url).pathname;

export const BASENAME = RAIZ.replace(/\/+$/, '') || '/';

/* Único enlace público a la documentación: vive en el panel de Contacto.
   Con `base: './'` (ZIP) apunta a la copia estática, que no necesita reescrituras. */
export const HREF_DOCUMENTACION =
  import.meta.env.BASE_URL === '/' ? '/documentation' : `${RAIZ}documentacion.html`;
