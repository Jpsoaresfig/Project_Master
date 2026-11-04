/* Documentación del proyecto. Fuera del Layout, sin cabecera ni ruta. Su único enlace público
   está en el panel de Contacto. Texto en content/documentacion.md. */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Marked } from 'marked';
import fuente from '../content/documentacion.md?raw';
import { Boton, IconoFlecha, Remolino } from '../components/index.js';
import { useCapaModal } from '../hooks.js';
import { CONCEPTO, MARCA } from '../data.js';
import '../styles/documentacion.css';

const ARCHIVOS = import.meta.glob('../assets/bocetos/*.webp', { eager: true, query: '?url', import: 'default' });

const escapar = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

const aAncla = (texto) =>
  texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&[a-z#0-9]+;/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

/** Una sola pasada por el .md: da el HTML, el índice y la lista de láminas ampliables. */
function preparar() {
  const indice = [];
  const laminas = [];
  const usadas = {};
  let padre = null;

  /* `![pie](archivo "descripción")`: el pie se ve siempre; la descripción es el alt. */
  const figura = (token) => {
    const url = ARCHIVOS[token.href];
    if (!url) return '';
    const i = laminas.length;
    const nombre = token.href.split('/').pop();
    const numero = Number.parseInt(nombre, 10);
    const lamina = numero === 0;
    const rotulo = lamina ? 'Lámina' : `Boceto ${numero}`;
    const alt = token.title || token.text;
    laminas.push({ url, alt, rotulo, pie: token.text });
    const [ancho, alto] = lamina ? [2000, 1365] : [1100, 688];
    return `<figure class="doc-fig"><button type="button" class="doc-fig__boton" data-lamina="${i}" aria-label="Ampliar: ${escapar(token.text)}"><img src="${url}" alt="${escapar(alt)}" width="${ancho}" height="${alto}" loading="lazy" decoding="async"></button><figcaption><span class="etiqueta">${rotulo}</span> ${escapar(token.text)}</figcaption></figure>`;
  };

  const lector = new Marked({
    gfm: true,
    renderer: {
      heading(token) {
        const html = this.parser.parseInline(token.tokens);
        if (token.depth === 1) return `<h1 class="doc__titulo">${html}</h1>`;
        const base = aAncla(token.text);
        usadas[base] = (usadas[base] || 0) + 1;
        const id = usadas[base] > 1 ? `${base}-${usadas[base]}` : base;
        if (token.depth === 2) padre = id;
        if (token.depth <= 3) indice.push({ id, html, nivel: token.depth, padre });
        return `<h${token.depth} id="${id}">${html}</h${token.depth}>`;
      },
      paragraph(token) {
        /* Varias imágenes seguidas en un párrafo forman una rejilla de bocetos. */
        const imagenes = token.tokens.filter((t) => t.type === 'image');
        const soloImagenes = imagenes.length && token.tokens.every((t) => t.type === 'image' || !t.raw.trim());
        if (soloImagenes && imagenes.length === 1) return figura(imagenes[0]);
        if (soloImagenes) return `<div class="doc-rejilla">${imagenes.map(figura).join('')}</div>`;
        return `<p>${this.parser.parseInline(token.tokens)}</p>`;
      },
      image: figura,
    },
    hooks: {
      postprocess: (html) =>
        html
          .replace(/<table>/g, '<div class="doc-tabla" role="region" aria-label="Tabla" tabindex="0"><table>')
          .replace(/<\/table>/g, '</table></div>')
          /* Lo que debe rellenar el grupo se ve de lejos. */
          .replace(/\[(Nombre|Tareas)\]/g, '<mark class="doc-hueco">[$1]</mark>'),
    },
  });

  return { html: lector.parse(fuente), indice, laminas };
}

function Lamina({ laminas, indice, alCambiar, alCerrar }) {
  const capa = useRef(null);
  const cerrar = useRef(null);
  useCapaModal(capa, true, { alCerrar, foco: cerrar });
  const lamina = laminas[indice];
  const mover = useCallback(
    (n) => alCambiar((i) => (i + n + laminas.length) % laminas.length),
    [alCambiar, laminas.length],
  );

  useEffect(() => {
    const tecla = (e) => {
      if (e.key === 'ArrowLeft') mover(-1);
      if (e.key === 'ArrowRight') mover(1);
    };
    window.addEventListener('keydown', tecla);
    return () => window.removeEventListener('keydown', tecla);
  }, [mover]);

  return createPortal(
    <div
      ref={capa}
      className="doc-lamina"
      role="dialog"
      aria-modal="true"
      aria-label={lamina.alt}
      onClick={(e) => {
        if (e.target === e.currentTarget) alCerrar();
      }}
    >
      <div className="doc-lamina__barra">
        <p className="etiqueta" aria-live="polite">{indice + 1} de {laminas.length}</p>
        <div className="doc-lamina__controles">
          <button type="button" className="doc-lamina__boton" aria-label="Lámina anterior" onClick={() => mover(-1)}>
            <IconoFlecha direccion="izquierda" />
          </button>
          <button type="button" className="doc-lamina__boton" aria-label="Lámina siguiente" onClick={() => mover(1)}>
            <IconoFlecha />
          </button>
          <button ref={cerrar} type="button" className="doc-lamina__cerrar" onClick={alCerrar}>Cerrar</button>
        </div>
      </div>
      <div
        className="doc-lamina__marco"
        onClick={(e) => {
          if (e.target === e.currentTarget) alCerrar();
        }}
      >
        <img key={lamina.url} src={lamina.url} alt={lamina.alt} />
      </div>
      <p className="doc-lamina__pie">
        <span className="etiqueta">{lamina.rotulo}</span> {lamina.pie}
      </p>
    </div>,
    document.body,
  );
}

export default function Documentacion() {
  const { html, indice, laminas } = useMemo(preparar, []);
  const [abierta, setAbierta] = useState(null);
  const [activo, setActivo] = useState(null);
  const articulo = useRef(null);
  const desplegable = useRef(null);

  /* Mientras esta página está montada, los buscadores no deben indexarla. */
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex';
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);

  /* Llegar con ancla: el contenido se pinta después de que el navegador la busque. */
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (id) document.getElementById(id)?.scrollIntoView();
  }, []);

  /* Una tabla que no cabe avisa de que se puede deslizar. */
  useEffect(() => {
    const raiz = articulo.current;
    if (!raiz) return undefined;
    const marcar = () => {
      raiz.querySelectorAll('.doc-tabla').forEach((t) => {
        t.toggleAttribute('data-desliza', t.scrollWidth > t.clientWidth + 1);
      });
    };
    marcar();
    const obs = new ResizeObserver(marcar);
    obs.observe(raiz);
    return () => obs.disconnect();
  }, []);

  /* Al imprimir no hay scroll que dispare la carga diferida de los bocetos. */
  useEffect(() => {
    const cargar = () => {
      articulo.current?.querySelectorAll('img').forEach((img) => { img.loading = 'eager'; });
    };
    window.addEventListener('beforeprint', cargar);
    return () => window.removeEventListener('beforeprint', cargar);
  }, []);

  /* Índice vivo: marca el último título que ha cruzado el tercio superior. */
  useEffect(() => {
    const titulos = indice.map((i) => document.getElementById(i.id)).filter(Boolean);
    if (!titulos.length) return undefined;
    let cuadro = 0;
    const medir = () => {
      cuadro = 0;
      const linea = window.innerHeight * 0.3;
      let actual = titulos[0].id;
      for (const t of titulos) {
        if (t.getBoundingClientRect().top <= linea) actual = t.id;
        else break;
      }
      setActivo(actual);
    };
    const pedir = () => {
      if (!cuadro) cuadro = requestAnimationFrame(medir);
    };
    medir();
    window.addEventListener('scroll', pedir, { passive: true });
    window.addEventListener('resize', pedir);
    return () => {
      cancelAnimationFrame(cuadro);
      window.removeEventListener('scroll', pedir);
      window.removeEventListener('resize', pedir);
    };
  }, [indice]);

  const alPulsarArticulo = (e) => {
    const boton = e.target.closest?.('[data-lamina]');
    if (boton) setAbierta(Number(boton.dataset.lamina));
  };

  /* En el lateral, los subapartados solo de la sección abierta: así cabe en cualquier alto. */
  const seccionActiva = indice.find((i) => i.id === activo)?.padre;
  const lista = (entradas) => (
    <ol className="doc-indice__lista">
      {entradas.map((i) => (
        <li key={i.id} data-nivel={i.nivel}>
          <a
            href={`#${i.id}`}
            aria-current={activo === i.id ? 'location' : undefined}
            onClick={() => {
              if (desplegable.current) desplegable.current.open = false;
            }}
            dangerouslySetInnerHTML={{ __html: i.html }}
          />
        </li>
      ))}
    </ol>
  );

  return (
    <div className="doc" inert={abierta !== null ? '' : undefined}>
      <aside className="doc__lateral">
        <div className="doc__marca">
          <Remolino tam={30} />
          <span>{MARCA}</span>
        </div>
        <details ref={desplegable} className="doc-indice doc-indice--movil">
          <summary>Índice</summary>
          <nav aria-label="Índice de la documentación">{lista(indice)}</nav>
        </details>
        <nav className="doc-indice doc-indice--fijo" aria-label="Índice">
          <p className="etiqueta">Índice</p>
          {lista(indice.filter((i) => i.nivel === 2 || i.padre === seccionActiva))}
        </nav>
        <Boton to="/" variante="enlace" className="doc__volver">Volver a la web</Boton>
      </aside>

      <main className="doc__cuerpo">
        {/* Solo en papel: portada e índice con página. */}
        <div className="doc-papel">
          <section className="doc-portada" aria-hidden="true">
            <Remolino tam={120} />
            <p className="doc-portada__marca">{MARCA}</p>
            <h2 className="doc-portada__titulo">{CONCEPTO}</h2>
            <p className="doc-portada__sub">Documentación del proceso de creación</p>
            <dl className="doc-portada__datos">
              <dt>Asignatura</dt>
              <dd>Diseño Digital y Publicidad</dd>
              <dt>Universidad</dt>
              <dd>Universidad de Granada</dd>
              <dt>Entrega</dt>
              <dd>Práctica 4, web publicitaria interactiva</dd>
              <dt>Equipo</dt>
              <dd><mark className="doc-hueco">[Nombre]</mark></dd>
            </dl>
          </section>
          <nav className="doc-sumario" aria-hidden="true">
            <h2 className="doc-sumario__titulo">Índice</h2>
            <ol>
              {indice.map((i) => (
                <li key={i.id} data-nivel={i.nivel}>
                  <a href={`#${i.id}`}>
                    <span dangerouslySetInnerHTML={{ __html: i.html }} />
                    <span className="doc-sumario__pagina" data-para={i.id} />
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </div>
        <article
          ref={articulo}
          className="doc__articulo"
          onClick={alPulsarArticulo}
          dangerouslySetInnerHTML={{ __html: html }}
        />
        <footer className="doc__pie">
          <Boton to="/" variante="enlace">Volver a la web</Boton>
        </footer>
      </main>

      {abierta !== null && (
        <Lamina laminas={laminas} indice={abierta} alCambiar={setAbierta} alCerrar={() => setAbierta(null)} />
      )}
    </div>
  );
}
