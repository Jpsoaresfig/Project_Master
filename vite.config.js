import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/* Con dominio definitivo (SITIO_URL, o el que da Vercel) las etiquetas Open Graph son absolutas,
   como exigen los lectores de enlaces. Sin él, siguen relativas. */
const sitio =
  process.env.SITIO_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : '');

/* Lo crítico de la primera pintura, con los nombres finales del bundle. */
function precargasCriticas() {
  let base = '/';
  return {
    name: 'precargas-criticas',
    configResolved(config) {
      base = config.base;
    },
    transformIndexHtml: {
      order: 'post',
      handler(html, ctx) {
        if (!ctx.bundle) return html;
        const archivos = Object.keys(ctx.bundle);
        const buscar = (patron) => archivos.find((nombre) => patron.test(nombre));
        const precarga = (patron, attrs) => {
          const archivo = buscar(patron);
          if (!archivo) throw new Error(`precargas-criticas: no encuentro ${patron}`);
          return { tag: 'link', attrs: { rel: 'preload', href: `${base}${archivo}`, ...attrs }, injectTo: 'head' };
        };
        const fuente = { as: 'font', type: 'font/woff2', crossorigin: '' };
        const raizOg = sitio ? `${sitio}/` : base;
        const final = html.replace(/content="(?:\.\/|\/)og-imagen/g, `content="${raizOg}og-imagen`);
        return {
          html: final,
          tags: [
            precarga(/fraunces-latin-full-normal.*\.woff2$/, fuente),
            precarga(/instrument-sans-latin-standard-normal.*\.woff2$/, fuente),
          ],
        };
      },
    },
  };
}

export default defineConfig({
  plugins: [react(), precargasCriticas()],
  build: {
    assetsInlineLimit: 0,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          movimiento: ['framer-motion'],
        },
      },
    },
  },
});
