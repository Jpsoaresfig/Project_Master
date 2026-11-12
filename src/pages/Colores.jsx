/* Paleta de colores y por qué se eligió cada uno. Fuera del Layout, como la documentación:
   rige :root, sin tema. Textos en content/colores.js. Las muestras de los temas usan
   data-theme sobre su propio bloque, así leen los tokens reales de styles/tokens.css. */
import { useEffect, useMemo, useState } from 'react';
import { Boton, Remolino } from '../components/index.js';
import { MARCA } from '../data.js';
import { APOYO, PRINCIPALES, REGLAS, TEMAS } from '../content/colores.js';
import '../styles/colores.css';

const TODOS = [...PRINCIPALES, ...APOYO];

function aRgb(hex) {
  const n = Number.parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function tono(hex) {
  const [r, g, b] = aRgb(hex).map((v) => v / 255);
  const max = Math.max(r, g, b);
  const d = max - Math.min(r, g, b);
  if (!d) return 0;
  let h;
  if (max === r) h = ((g - b) / d) % 6;
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  return Math.round((h * 60 + 360) % 360);
}

function luminancia(hex) {
  const [r, g, b] = aRgb(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contraste(a, b) {
  const [l1, l2] = [luminancia(a), luminancia(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

const coma = (n) => n.toFixed(1).replace('.', ',');
const textoSobre = (hex) => (contraste(hex, '#2E2A1F') >= contraste(hex, '#F7F3EA') ? '#2E2A1F' : '#F7F3EA');

function Copiar({ hex }) {
  const [hecho, setHecho] = useState(false);
  useEffect(() => {
    if (!hecho) return undefined;
    const t = setTimeout(() => setHecho(false), 1600);
    return () => clearTimeout(t);
  }, [hecho]);
  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(hex);
      setHecho(true);
    } catch {
      /* Sin portapapeles (http o permiso denegado): el hex sigue visible para copiarlo a mano. */
    }
  };
  return (
    <button type="button" className="col-copiar" onClick={copiar} aria-label={`Copiar ${hex}`}>
      <code>{hex}</code>
      <span className="col-copiar__estado" aria-live="polite">{hecho ? 'Copiado' : 'Copiar'}</span>
    </button>
  );
}

function Rueda({ elegido, alElegir }) {
  return (
    <div className="col-rueda" role="group" aria-label="Rueda cromática con los colores principales">
      <div className="col-rueda__aro" aria-hidden="true" />
      <div className="col-rueda__zona" aria-hidden="true" />
      <div className="col-rueda__centro" aria-hidden="true">
        <span className="col-rueda__grados">32°–87°</span>
        <span className="etiqueta">base análoga</span>
      </div>
      {PRINCIPALES.map((c, i) => {
        const h = tono(c.hex);
        /* Crema y tinta comparten casi el mismo tono: se separan en el radio para que no se tapen. */
        const radio = 41 - (i % 3) * 4;
        const rad = (h * Math.PI) / 180;
        return (
          <button
            key={c.id}
            type="button"
            className="col-rueda__punto"
            data-acento={c.grupo !== 'Base' && h > 200 ? '' : undefined}
            aria-pressed={elegido === c.id}
            aria-label={`${c.nombre}, ${h}°`}
            style={{
              left: `${50 + radio * Math.sin(rad)}%`,
              top: `${50 - radio * Math.cos(rad)}%`,
              background: c.hex,
            }}
            onClick={() => alElegir(c.id)}
          />
        );
      })}
    </div>
  );
}

function Detalle({ color }) {
  const sobreCrema = contraste(color.hex, '#F7F3EA');
  const sobreTinta = contraste(color.hex, '#2E2A1F');
  return (
    <div className="col-detalle" aria-live="polite">
      <div className="col-detalle__muestra" style={{ background: color.hex, color: textoSobre(color.hex) }}>
        <span className="col-detalle__aa">Aa</span>
        <span className="etiqueta">{color.grupo}</span>
      </div>
      <h3 className="col-detalle__nombre">{color.nombre}</h3>
      <p className="col-detalle__datos">
        <Copiar hex={color.hex} /> <code>{color.token}</code> <span>Tono {tono(color.hex)}°</span>
      </p>
      <p><strong>Uso.</strong> {color.uso}</p>
      <p><strong>Por qué.</strong> {color.porque}</p>
      <p className="col-detalle__contraste">
        Contraste con crema <strong>{coma(sobreCrema)}:1</strong> · con tinta <strong>{coma(sobreTinta)}:1</strong>
      </p>
    </div>
  );
}

function Comprobador() {
  const [texto, setTexto] = useState('#F7F3EA');
  const [fondo, setFondo] = useState('#C2185B');
  const ratio = contraste(texto, fondo);
  const veredicto = [
    { nombre: 'Texto normal (AA, 4,5:1)', ok: ratio >= 4.5 },
    { nombre: 'Texto grande (AA, 3:1)', ok: ratio >= 3 },
    { nombre: 'Texto normal (AAA, 7:1)', ok: ratio >= 7 },
  ];
  const opciones = TODOS.map((c) => (
    <option key={c.hex + c.nombre} value={c.hex}>{`${c.nombre} · ${c.hex}`}</option>
  ));
  return (
    <div className="col-comprobador">
      <div className="col-comprobador__controles">
        <label>
          <span className="etiqueta">Texto</span>
          <select value={texto} onChange={(e) => setTexto(e.target.value)}>{opciones}</select>
        </label>
        <button
          type="button"
          className="col-comprobador__invertir"
          onClick={() => { setTexto(fondo); setFondo(texto); }}
        >
          Invertir
        </button>
        <label>
          <span className="etiqueta">Fondo</span>
          <select value={fondo} onChange={(e) => setFondo(e.target.value)}>{opciones}</select>
        </label>
      </div>
      <div className="col-comprobador__muestra" style={{ background: fondo, color: texto }}>
        <p className="col-comprobador__grande">Atrévete.</p>
        <p>El mundo cabe en una cucharada.</p>
      </div>
      <p className="col-comprobador__ratio" aria-live="polite">
        <strong>{coma(ratio)}:1</strong>
      </p>
      <ul className="col-comprobador__veredicto">
        {veredicto.map((v) => (
          <li key={v.nombre} data-ok={v.ok ? '' : undefined}>
            <span aria-hidden="true">{v.ok ? '✓' : '✕'}</span> {v.nombre}
            <span className="sr">{v.ok ? ': cumple' : ': no cumple'}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Colores() {
  const [elegido, setElegido] = useState('pitaya');
  const color = useMemo(() => PRINCIPALES.find((c) => c.id === elegido), [elegido]);

  return (
    <div className="col">
      <header className="col__cabecera">
        <div className="col__marca">
          <Remolino tam={30} />
          <span>{MARCA}</span>
        </div>
        <Boton to="/" variante="enlace">Volver a la web</Boton>
      </header>

      <main className="col__cuerpo">
        <section className="col__intro" aria-labelledby="col-titulo">
          <p className="etiqueta">Sistema visual</p>
          <h1 id="col-titulo" className="col__titulo">Los colores del viaje</h1>
          <p className="col__lead">
            Una <strong>base cálida y apagada</strong>, común a toda la web, y un <strong>acento saturado por destino</strong>.
            La base mantiene la unidad de marca; los acentos hacen que cada página parezca otro lugar sin parecer otra marca.
          </p>
          <div className="col__franja" aria-hidden="true">
            {PRINCIPALES.map((c) => <span key={c.id} style={{ background: c.hex }} />)}
          </div>
        </section>

        <section aria-labelledby="col-rueda">
          <h2 id="col-rueda">La lógica en la rueda cromática</h2>
          <div className="col-rueda-bloque">
            <div>
              <Rueda elegido={elegido} alElegir={setElegido} />
              <p className="col-ayuda">Pulsa un punto de la rueda o una muestra de la paleta para ver su ficha.</p>
            </div>
            <div className="col-texto">
              <p>
                <strong>Base análoga, de 32° a 87°.</strong> Crema, tinta, oliva, cacahuete y verde están juntos en la rueda:
                tonos de tierra, paja y hoja. Los colores vecinos combinan sin conflicto y dan una sensación tranquila, natural
                y artesanal, la de la madera, el lino y la cerámica.
              </p>
              <p>
                <strong>Acentos al otro lado.</strong> La pitaya (336°) y la flor (280°) quedan en el lado opuesto de la rueda.
                Por eso saltan a la vista sobre la base: son los sabores exóticos, la sorpresa del producto.
              </p>
              <p>
                <strong>Color igual a sabor.</strong> Ningún acento es arbitrario: el marrón del cacahuete, el magenta de la pitaya,
                el lila de la flor del nopal y el verde del cactus salen de los ingredientes.
              </p>
            </div>
          </div>
        </section>

        <section aria-labelledby="col-paleta">
          <h2 id="col-paleta">Paleta principal</h2>
          <p className="col-texto">Son los colores de la presentación del producto. Viven en <code>styles/tokens.css</code> y no se modifican.</p>
          <div className="col-paleta">
            <ul className="col-muestras">
              {PRINCIPALES.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    className="col-muestra"
                    aria-pressed={elegido === c.id}
                    onClick={() => setElegido(c.id)}
                  >
                    <span className="col-muestra__color" style={{ background: c.hex }} />
                    <span className="col-muestra__nombre">{c.nombre}</span>
                    <span className="col-muestra__hex">{c.hex} · {c.grupo}</span>
                  </button>
                </li>
              ))}
            </ul>
            <Detalle color={color} />
          </div>
        </section>

        <section aria-labelledby="col-temas">
          <h2 id="col-temas">Un clima por destino</h2>
          <p className="col-texto">
            Cada pantalla fija <code>data-theme</code> en la página y reasigna los mismos roles: fondo, ficha, texto, acento y
            remolino. Estas muestras usan los tokens reales de la web.
          </p>
          <ul className="col-temas">
            {TEMAS.map((t) => (
              <li key={t.tema} className="col-tema">
                <div className="col-tema__escena" data-theme={t.tema} aria-hidden="true">
                  <div className="col-tema__ficha">
                    <Remolino tam={34} />
                    <span className="col-tema__nombre">{t.nombre}</span>
                    <span className="col-tema__tenue">{t.clima}</span>
                    <span className="col-tema__acento">Siguiente destino</span>
                  </div>
                </div>
                <p><strong>{t.nombre}.</strong> {t.porque}</p>
              </li>
            ))}
          </ul>
          <p className="col-texto">
            El remolino de la transición entre páginas también cambia: sus dos hebras toman los colores del destino al que vas,
            y adelantan su clima antes de que aparezca.
          </p>
        </section>

        <section aria-labelledby="col-apoyo">
          <h2 id="col-apoyo">Colores de apoyo</h2>
          <p className="col-texto">Salen de la paleta principal para resolver casos concretos, casi siempre de legibilidad.</p>
          <ul className="col-apoyo">
            {APOYO.map((c) => (
              <li key={c.token}>
                <span className="col-apoyo__color" style={{ background: c.hex }} />
                <div>
                  <p className="col-apoyo__nombre">{c.nombre} <code>{c.hex}</code></p>
                  <p>{c.porque}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="col-contraste">
          <h2 id="col-contraste">Comprobador de contraste</h2>
          <p className="col-texto">
            Elige un texto y un fondo de la paleta. El cálculo es el de las pautas WCAG: así se decidió qué colores pueden ir
            como texto y cuáles solo como acento.
          </p>
          <Comprobador />
        </section>

        <section aria-labelledby="col-reglas">
          <h2 id="col-reglas">Reglas de uso</h2>
          <ul className="col-reglas">
            {REGLAS.map((r) => <li key={r}>{r}</li>)}
          </ul>
        </section>
      </main>

      <footer className="col__pie">
        <Boton to="/" variante="enlace">Volver a la web</Boton>
      </footer>
    </div>
  );
}
