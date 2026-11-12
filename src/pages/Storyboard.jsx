/* El storyboard explicado: lámina completa, flujo y pantalla por pantalla, con lo que cambió
   en la versión final. Fuera del Layout, como la documentación: rige :root, sin tema.
   Textos en content/storyboard.js. */
import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Boton, Remolino } from '../components/index.js';
import { useCapaModal } from '../hooks.js';
import { MARCA } from '../data.js';
import { CAMBIOS_GENERALES, COMUNES, CRITERIOS, FLECHAS, LAMINA, PANTALLAS } from '../content/storyboard.js';
import '../styles/storyboard.css';

function Ampliacion({ imagen, alCerrar }) {
  const capa = useRef(null);
  const cerrar = useRef(null);
  useCapaModal(capa, true, { alCerrar, foco: cerrar });
  return createPortal(
    <div
      ref={capa}
      className="sb-ampliacion"
      role="dialog"
      aria-modal="true"
      aria-label={imagen.alt}
      onClick={(e) => {
        if (e.target === e.currentTarget) alCerrar();
      }}
    >
      <div className="sb-ampliacion__barra">
        <p className="etiqueta">{imagen.rotulo}</p>
        <button ref={cerrar} type="button" className="sb-ampliacion__cerrar" onClick={alCerrar}>Cerrar</button>
      </div>
      <img src={imagen.src} alt={imagen.alt} />
    </div>,
    document.body,
  );
}

export default function Storyboard() {
  const [ampliada, setAmpliada] = useState(null);

  return (
    <div className="sb" inert={ampliada ? '' : undefined}>
      <header className="sb__cabecera">
        <div className="sb__marca">
          <Remolino tam={30} />
          <span>{MARCA}</span>
        </div>
        <Boton to="/" variante="enlace">Volver a la web</Boton>
      </header>

      <main className="sb__cuerpo">
        <section className="sb__intro" aria-labelledby="sb-titulo">
          <p className="etiqueta">Proceso creativo</p>
          <h1 id="sb-titulo" className="sb__titulo">El storyboard, pantalla a pantalla</h1>
          <p className="sb__lead">
            Antes de escribir código, el viaje se dibujó en una sola lámina: siete pantallas unidas por flechas que indican
            por dónde se mueve el usuario. Con la guía de la asignatura como referencia, sirvió de plano para el prototipo
            estático y, después, para la web en React.
          </p>
          <ol className="sb__proceso" aria-label="Lugar del storyboard en el proceso">
            <li>Concepto</li>
            <li aria-current="step">Storyboard</li>
            <li>Prototipo HTML</li>
            <li>Web en React</li>
          </ol>
        </section>

        <section aria-labelledby="sb-lamina">
          <h2 id="sb-lamina">La lámina completa</h2>
          <p className="sb-texto">Pulsa una pantalla de la lámina para ir a su explicación.</p>
          <figure className="sb-lamina">
            <div className="sb-lamina__marco">
              <img src={LAMINA.src} alt={LAMINA.alt} width={LAMINA.ancho} height={LAMINA.alto} />
              {PANTALLAS.map((p) => {
                const [x, y, w, h] = p.zona;
                return (
                  <a
                    key={p.id}
                    href={`#sb-${p.id}`}
                    className="sb-lamina__zona"
                    style={{ left: `${x}%`, top: `${y}%`, width: `${w}%`, height: `${h}%` }}
                    aria-label={`Ir a ${p.nombre}`}
                  />
                );
              })}
            </div>
            <figcaption>
              <span>Las flechas marcan el recorrido; las etiquetas de color, el papel de cada pantalla.</span>
              <button
                type="button"
                className="sb-boton"
                onClick={() => setAmpliada({ ...LAMINA, rotulo: 'Lámina completa' })}
              >
                Ampliar la lámina
              </button>
            </figcaption>
          </figure>
        </section>

        <section aria-labelledby="sb-flujo">
          <h2 id="sb-flujo">Cómo leer las flechas</h2>
          <p className="sb-texto">
            El recorrido sugerido es lineal, de Inicio al cierre, pero ningún paso es obligatorio: la barra de ruta lleva a
            cualquier destino desde cualquier pantalla.
          </p>
          <ol className="sb-flechas">
            {FLECHAS.map((f) => (
              <li key={f.desde + f.hasta}>
                <span className="sb-flechas__nodo">{f.desde}</span>
                <span className="sb-flechas__como">
                  <span className="sb-flechas__linea" aria-hidden="true" />
                  <span className="etiqueta">{f.como}</span>
                  <span className="sr">lleva a</span>
                </span>
                <span className="sb-flechas__nodo">{f.hasta}</span>
                {f.nota && <span className="sb-flechas__nota">{f.nota}</span>}
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="sb-comunes">
          <h2 id="sb-comunes">Lo que comparten todas las pantallas</h2>
          <ul className="sb-comunes">
            {COMUNES.map((c) => (
              <li key={c.titulo}>
                <h3>{c.titulo}</h3>
                <p>{c.texto}</p>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="sb-pantallas">
          <h2 id="sb-pantallas">Pantalla a pantalla</h2>
          <nav className="sb-saltos" aria-label="Pantallas del storyboard">
            {PANTALLAS.map((p) => (
              <a key={p.id} href={`#sb-${p.id}`}>
                <span className="sb-marca">{p.marca}</span> {p.nombre}
              </a>
            ))}
          </nav>

          {PANTALLAS.map((p) => (
            <article key={p.id} id={`sb-${p.id}`} className="sb-pantalla" aria-labelledby={`sb-${p.id}-titulo`}>
              <div className="sb-pantalla__imagen">
                <button
                  type="button"
                  className="sb-pantalla__ampliar"
                  aria-label={`Ampliar el boceto de ${p.nombre}`}
                  onClick={() => setAmpliada({ src: p.boceto, alt: `Boceto de ${p.nombre}: ${p.pie}`, rotulo: p.nombre })}
                >
                  <img src={p.boceto} alt="" width="1100" height="688" loading="lazy" decoding="async" />
                </button>
                <p className="sb-pantalla__pie">«{p.pie}»<span> Nota del storyboard</span></p>
              </div>

              <div className="sb-pantalla__texto">
                <p className="sb-pantalla__cabeza">
                  <span className="sb-marca">{p.marca}</span>
                  <span className="etiqueta">{p.papel}</span>
                  {p.ruta && <code>{p.ruta}</code>}
                </p>
                <h3 id={`sb-${p.id}-titulo`}>{p.nombre}</h3>
                <p>{p.muestra}</p>

                <h4>Qué hace el usuario</h4>
                <ul>{p.interaccion.map((t) => <li key={t}>{t}</li>)}</ul>

                <h4>Qué cambió en la versión final</h4>
                <ul className="sb-pantalla__cambios">{p.cambios.map((t) => <li key={t}>{t}</li>)}</ul>

                {p.ruta && (
                  <Boton to={p.ruta} variante="enlace">Ver la pantalla</Boton>
                )}
                {!p.ruta && (
                  <p className="sb-pantalla__nota">No tiene ruta: se abre desde el eslogan de la cabecera.</p>
                )}
              </div>
            </article>
          ))}
        </section>

        <section aria-labelledby="sb-cambios">
          <h2 id="sb-cambios">Cambios generales respecto al storyboard</h2>
          <p className="sb-texto">Comprobados contra el código de la versión final.</p>
          <div className="sb-tabla" role="region" aria-label="Cambios generales" tabIndex={0}>
            <table>
              <thead>
                <tr><th>Elemento</th><th>Storyboard</th><th>Versión final</th><th>Motivo</th></tr>
              </thead>
              <tbody>
                {CAMBIOS_GENERALES.map((c) => (
                  <tr key={c.elemento}>
                    <th scope="row">{c.elemento}</th>
                    <td>{c.antes}</td>
                    <td>{c.despues}</td>
                    <td>{c.motivo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section aria-labelledby="sb-criterios">
          <h2 id="sb-criterios">Criterios de revisión</h2>
          <p className="sb-texto">El storyboard fijó tres preguntas para comprobar la versión final.</p>
          <ul className="sb-criterios">
            {CRITERIOS.map((c) => (
              <li key={c.nombre}>
                <h3>{c.nombre}</h3>
                <p className="sb-criterios__pregunta">{c.pregunta}</p>
                <p>{c.respuesta}</p>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <footer className="sb__pie">
        <Boton to="/" variante="enlace">Volver a la web</Boton>
      </footer>

      {ampliada && <Ampliacion imagen={ampliada} alCerrar={() => setAmpliada(null)} />}
    </div>
  );
}
