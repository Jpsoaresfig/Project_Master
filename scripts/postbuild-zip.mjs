/* Tras `build:zip`: la web sale de `index.html` y el resto son copias o ayudas.
   - documentacion.html: la documentación se abre por su archivo, sin servidor especial.
   - 404.html: los alojamientos estáticos lo sirven en cualquier ruta profunda.
   - LEEME.txt: cómo abrir la entrega. */
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const salida = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist-zip');
const html = await readFile(join(salida, 'index.html'), 'utf8');

const entrada = html.match(/src="\.\/(assets\/index-[^"]+\.js)"/)?.[1];
if (!entrada) throw new Error('postbuild-zip: no encuentro el módulo de entrada en index.html');

/* Rutas relativas: desde `casa/` o `casa/x`, `./assets` apuntaría a una carpeta que no existe.
   Se busca hacia arriba la carpeta que de verdad contiene la web y se vuelve a su primer tramo. */
const normalizar = `<script>
(function () {
  var trozos = location.pathname.split('/');
  var archivo = trozos.pop();
  function probar(n) {
    if (n < 1) return;
    var raiz = trozos.slice(0, n).join('/') + '/';
    fetch(raiz + ${JSON.stringify(entrada)}, { method: 'HEAD' }).then(function (r) {
      var js = r.ok && /javascript/.test(r.headers.get('content-type') || '');
      if (!js) return probar(n - 1);
      if (n === trozos.length) return;
      location.replace(raiz + trozos[n] + location.search + location.hash);
    }, function () { probar(n - 1); });
  }
  probar(trozos.length);
})();
</script>`;

const LEEME = `Cuchavia · Un viaje en cada cucharada
Web publicitaria interactiva

La web necesita un servidor: abierta con doble clic, el navegador bloquea sus módulos.

CÓMO VERLA
1. Instala Node.js si no lo tienes (https://nodejs.org).
2. Abre esta carpeta en una terminal.
3. Ejecuta:  npx serve
4. Entra en la dirección que aparece, normalmente http://localhost:3000

Sirve cualquier servidor de archivos estáticos, también dentro de una subcarpeta.

ARCHIVOS
index.html           Página principal
documentacion.html   Documentación del proyecto
404.html             Copia de la web para rutas profundas
assets/              Código, estilos, fuentes e imágenes
`;

await writeFile(join(salida, 'documentacion.html'), html);
await writeFile(join(salida, '404.html'), html.replace('</head>', `${normalizar}\n  </head>`));
await writeFile(join(salida, 'LEEME.txt'), LEEME);
console.log('dist-zip listo: index.html, documentacion.html, 404.html y LEEME.txt');
