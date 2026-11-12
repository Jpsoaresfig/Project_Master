/* Identidad visual completa en /colors: idea, colores, tipografía, ilustraciones, texturas,
   formas, composición y movimiento, con el porqué de cada decisión. Fuera del Layout, como la
   documentación: rige :root, sin tema. Textos en content/colores.js. Las muestras de los temas
   usan data-theme sobre su propio bloque, así leen los tokens reales de styles/tokens.css. */
import { useEffect, useMemo, useState } from 'react';
import { Boton, Frasco, Ilu, Remolino, SelectorTamano, Sello } from '../components/index.js';
import { useViaje } from '../state.jsx';
import { MARCA } from '../data.js';
import {
  AJUSTES_COLOR, APOYO, ARMONIA, CLIMAS_TIPO, NOTA_PSICOLOGIA, PSICOLOGIA, DETALLES_TIPO, FAMILIAS, IDEA, ILUSTRACIONES, MOVIMIENTOS, PILARES,
  PRINCIPALES, RASGOS, REGLAS, ROLES_TIPO, TEMAS, TEXTURAS,
} from '../content/colores.js';
import cacahuete from '../assets/ilustraciones/cacahuete.svg?raw';
import pitaya from '../assets/ilustraciones/pitaya.svg?raw';
import hoja from '../assets/ilustraciones/hoja.svg?raw';
import florNopal from '../assets/ilustraciones/flor-nopal.svg?raw';
import brujula from '../assets/ilustraciones/brujula.svg?raw';
import '../styles/colores.css';

const SVG = { cacahuete, pitaya, hoja, 'flor-nopal': florNopal, brujula };
const TODOS = [...PRINCIPALES, ...APOYO];

const SECCIONES = [
  ['idea', 'La idea'],
  ['colores', 'Colores'],
  ['psicologia', 'Psicología del color'],
  ['tipografia', 'Tipografía'],
  ['ilustracion', 'Ilustración'],
  ['texturas', 'Texturas'],
  ['formas', 'Formas'],
  ['composicion', 'Composición'],
  ['movimiento', 'Movimiento'],
  ['reglas', 'Reglas'],
];

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
      <h4 className="col-detalle__nombre">{color.nombre}</h4>
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

/** Muestra del clima tipográfico de un tema. En Atacama, un control hace de fogata. */
function ClimaTipo({ clima }) {
  const [fuego, setFuego] = useState(0);
  return (
    <li className="col-clima">
      <div
        className="col-clima__muestra"
        data-theme={clima.tema}
        style={clima.fogata ? { '--intensidad': fuego / 100 } : undefined}
      >
        <p className="titulo col-clima__texto" aria-hidden="true">{clima.nombre}</p>
      </div>
      <p className="col-clima__ejes"><code>{clima.ejes}</code></p>
      <p>{clima.porque}</p>
      {clima.fogata && (
        <label className="col-clima__fogata">
          <span className="etiqueta">Aviva la fogata: {fuego} %</span>
          <input type="range" min="0" max="100" value={fuego} onChange={(e) => setFuego(Number(e.target.value))} />
        </label>
      )}
    </li>
  );
}

function DemoMovimiento({ mov }) {
  const [vuelta, setVuelta] = useState(0);
  return (
    <li className="col-mov">
      <div className="col-mov__pista">
        <span
          key={vuelta}
          className="col-mov__bola"
          data-jugando={vuelta ? '' : undefined}
          style={{ '--curva': `var(${mov.curva})` }}
        />
      </div>
      <div className="col-mov__texto">
        <p className="col-mov__nombre">{mov.nombre} <code>{mov.curva}</code> · {mov.duracion}</p>
        <p>{mov.porque}</p>
      </div>
      <button type="button" className="col-boton" onClick={() => setVuelta((v) => v + 1)}>
        Ver <span className="sr">{mov.nombre}</span>
      </button>
    </li>
  );
}

export default function Colores() {
  const { reducido } = useViaje();
  const [elegido, setElegido] = useState('pitaya');
  const [tam, setTam] = useState(300);
  const [golpe, setGolpe] = useState(0);
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
          <p className="etiqueta">Identidad visual</p>
          <h1 id="col-titulo" className="col__titulo">La estética del viaje</h1>
          <p className="col__lead">
            Todo lo que da su aspecto a Cuchavia, y el porqué de cada decisión: colores, letras, ilustraciones,
            texturas, formas, composición y movimiento.
          </p>
          <div className="col__franja" aria-hidden="true">
            {PRINCIPALES.map((c) => <span key={c.id} style={{ background: c.hex }} />)}
          </div>
          <nav className="col-indice" aria-label="Secciones">
            {SECCIONES.map(([id, nombre], i) => (
              <a key={id} href={`#col-${id}`}><span>{String(i + 1).padStart(2, '0')}</span> {nombre}</a>
            ))}
          </nav>
        </section>

        {/* ---------- 1. Idea ---------- */}
        <section aria-labelledby="col-idea">
          <h2 id="col-idea"><span className="col-num">01</span> La idea</h2>
          <p className="col-cita">{IDEA}</p>
          <h3>Cuatro pilares visuales</h3>
          <ul className="col-rejilla col-rejilla--4">
            {PILARES.map((p) => <li key={p.titulo}><h4>{p.titulo}</h4><p>{p.texto}</p></li>)}
          </ul>
          <h3>Cuatro rasgos propios</h3>
          <p className="col-texto">Lo que hace que la web parezca una sola marca y no una plantilla.</p>
          <ul className="col-rejilla col-rejilla--4">
            {RASGOS.map((p) => <li key={p.titulo}><h4>{p.titulo}</h4><p>{p.texto}</p></li>)}
          </ul>
        </section>

        {/* ---------- 2. Colores ---------- */}
        <section aria-labelledby="col-colores">
          <h2 id="col-colores"><span className="col-num">02</span> Colores</h2>
          <p className="col-texto">
            Una <strong>base cálida y apagada</strong>, común a toda la web, y un <strong>acento saturado por destino</strong>.
            La base mantiene la unidad de marca; los acentos hacen que cada página parezca otro lugar sin parecer otra marca.
          </p>

          <h3>La lógica en la rueda cromática</h3>
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

          <h3>Paleta principal</h3>
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

          <h3>Un clima por destino</h3>
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

          <h3>Colores de apoyo</h3>
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

          <h3>Comprobador de contraste</h3>
          <p className="col-texto">
            Elige un texto y un fondo de la paleta. El cálculo es el de las pautas WCAG: así se decidió qué colores pueden ir
            como texto y cuáles solo como acento.
          </p>
          <Comprobador />
        </section>

        {/* ---------- 3. Psicología del color y armonía ---------- */}
        <section aria-labelledby="col-psicologia">
          <h2 id="col-psicologia"><span className="col-num">03</span> Psicología del color y armonía</h2>
          <p className="col-texto">
            Qué transmite cada color, por qué encaja con el producto y con su destino, y qué reglas hacen que colores tan
            distintos convivan en armonía.
          </p>

          <h3>Cómo se consigue la armonía</h3>
          <ul className="col-rejilla col-rejilla--2">
            {ARMONIA.map((a) => <li key={a.titulo}><h4>{a.titulo}</h4><p>{a.texto}</p></li>)}
          </ul>

          <h3>Qué transmite cada color</h3>
          <ul className="col-psico">
            {PSICOLOGIA.map((c) => (
              <li key={c.nombre}>
                <span className="col-psico__color" style={{ background: c.hex }} aria-hidden="true" />
                <div>
                  <p className="col-psico__nombre">{c.nombre} <code>{c.hex}</code></p>
                  <p className="col-psico__sensacion">{c.sensacion}</p>
                </div>
                <p>{c.encaje}</p>
              </li>
            ))}
          </ul>

          <h3>Ajustes hechos para mejorar la armonía</h3>
          <div className="sb-tabla col-tabla" role="region" aria-label="Ajustes de color" tabIndex={0}>
            <table>
              <thead><tr><th>Antes</th><th>Ahora</th><th>Por qué</th></tr></thead>
              <tbody>
                {AJUSTES_COLOR.map((a) => (
                  <tr key={a.antes}><td>{a.antes}</td><td>{a.despues}</td><td>{a.motivo}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="col-nota">{NOTA_PSICOLOGIA}</p>
        </section>

        {/* ---------- 4. Tipografía ---------- */}
        <section aria-labelledby="col-tipografia">
          <h2 id="col-tipografia"><span className="col-num">04</span> Tipografía</h2>
          <p className="col-texto">
            Una sola familia, Fraunces, para todo: títulos, texto, botones y etiquetas. La misma voz de principio a fin,
            como un cuaderno escrito a mano por una sola persona. Lo que cambia es cómo se usa: peso, tamaño, cursiva y ejes.
          </p>
          <div className="col-familias">
            {FAMILIAS.map((f) => (
              <article key={f.id} className={`col-fam ${f.clase}`}>
                <p className="col-fam__aa" aria-hidden="true">Aa</p>
                <h3 className="col-fam__nombre">{f.nombre}</h3>
                <p className="etiqueta col-fam__tipo">{f.tipo}</p>
                <p className="col-fam__alfabeto" aria-hidden="true">
                  ABCDEFGHIJKLMNÑOPQRSTUVWXYZ<br />abcdefghijklmnñopqrstuvwxyz<br />0123456789 ¿?¡! «» · ′
                </p>
                <p className="col-fam__pesos" aria-hidden="true">
                  <span style={{ fontWeight: 200 }}>Ligera</span>
                  <span style={{ fontWeight: 420 }}>Regular</span>
                  <span style={{ fontWeight: 700 }}>Negrita</span>
                  <span style={{ fontWeight: 900 }}>Black</span>
                  <span style={{ fontStyle: 'italic' }}>Cursiva</span>
                  <span style={{ fontVariationSettings: "'SOFT' 100, 'WONK' 1" }}>Blanda y torcida</span>
                </p>
                <p><strong>Uso.</strong> {f.uso}</p>
                <ul>{f.porque.map((t) => <li key={t}>{t}</li>)}</ul>
              </article>
            ))}
          </div>

          <h3>Cada letra, su papel</h3>
          <ul className="col-roles">
            {ROLES_TIPO.map((r) => (
              <li key={r.rol}>
                <div>
                  <p className="col-roles__rol">{r.rol}</p>
                  <p className="col-roles__letra">{r.letra}</p>
                </div>
                <p className={`col-roles__muestra ${r.clase}`}>{r.muestra}</p>
              </li>
            ))}
          </ul>

          <h3>El clima tipográfico: las letras viajan</h3>
          <p className="col-texto">
            Fraunces tiene ejes que cambian su peso, su suavidad (SOFT) y lo torcido de algunas letras (WONK). Cada destino
            los ajusta a su ambiente, y al cambiar de pantalla se interpolan durante el remolino. Estas muestras usan los
            valores reales de cada tema.
          </p>
          <ul className="col-climas">
            {CLIMAS_TIPO.map((c) => <ClimaTipo key={c.tema} clima={c} />)}
          </ul>

          <h3>Detalles</h3>
          <ul className="col-lista">
            {DETALLES_TIPO.map((t) => <li key={t}>{t}</li>)}
          </ul>
        </section>

        {/* ---------- 4. Ilustración ---------- */}
        <section aria-labelledby="col-ilustracion">
          <h2 id="col-ilustracion"><span className="col-num">05</span> Ilustración</h2>
          <p className="col-texto">
            Grabados botánicos de cuaderno de viaje, en SVG. Se insertan en línea para que tomen la tinta y la mancha de
            cada destino. La <strong>mancha desajustada</strong>, un relleno plano desplazado unos píxeles respecto al
            trazo, imita una impresión a dos tintas mal registrada: es el gesto gráfico propio de la marca, y no se anima.
          </p>
          <ul className="col-ilus">
            {ILUSTRACIONES.map((i) => (
              <li key={i.id}>
                <div className="col-ilus__lienzo" data-theme={i.tema}>
                  <Ilu src={SVG[i.id]} className="col-ilus__dibujo" />
                </div>
                <p className="col-ilus__nombre">{i.nombre}</p>
                <p className="col-ilus__uso">{i.uso}</p>
              </li>
            ))}
          </ul>

          <h3>Sellos y remolino</h3>
          <div className="col-firma">
            <div className="col-firma__pieza">
              <div className="col-firma__lienzo" data-theme="vip">
                <Sello key={golpe} arriba="Ubud" abajo="Bali" centro="2" tam={170} rot={-4} cae={golpe > 0 && !reducido} />
              </div>
              <p>
                <strong>Sello de viaje.</strong> Un matasellos con el destino en los arcos y la etapa en el centro, girado
                unos grados. Marca lo visitado y cae con un golpe seco, sin rebote.
              </p>
              <button type="button" className="col-boton" onClick={() => setGolpe((g) => g + 1)}>Estampar el sello</button>
            </div>
            <div className="col-firma__pieza">
              <div className="col-firma__lienzo col-firma__lienzo--remolino" data-theme="ubud">
                <Remolino key={`r${golpe}`} tam={140} dibujar={!reducido} duracion={1.2} />
              </div>
              <p>
                <strong>El remolino.</strong> Dos hebras en espiral con los colores del destino. Es la firma de la marca: el
                logotipo, la transición entre páginas y el premio del minijuego. Es lo único curvo de toda la web.
              </p>
            </div>
          </div>

          <h3>Los frascos</h3>
          <div className="col-frascos">
            <div className="col-frascos__balda">
              <Frasco sabor="casa" alto="min(11rem, 26vw)" />
              <Frasco sabor="ubud" alto="min(11rem, 26vw)" />
              <Frasco sabor="atacama" alto="min(11rem, 26vw)" />
            </div>
            <p className="col-texto">
              Recortes de fotografía, no ilustración: el producto debe parecer real. Los tres se dibujan con el mismo
              componente, medido sobre su transparencia, para que se vean del mismo tamaño y sobre la misma línea, con la
              fruta asomando. La etiqueta se retocó para que diga «Crema», como toda la web.
            </p>
          </div>
        </section>

        {/* ---------- 5. Texturas ---------- */}
        <section aria-labelledby="col-texturas">
          <h2 id="col-texturas"><span className="col-num">06</span> Texturas</h2>
          <p className="col-texto">
            El segundo pilar es la luz y las texturas naturales. Tres texturas dan tacto a las superficies; en móvil se
            sirven como imágenes ya pintadas para no frenar la página.
          </p>
          <ul className="col-texturas">
            {TEXTURAS.map((t) => (
              <li key={t.id}>
                <div className={`col-textura col-textura--${t.id}`} aria-hidden="true" />
                <p className="col-ilus__nombre">{t.nombre} <code>{t.token}</code></p>
                <p>{t.porque}</p>
                <p className="col-ilus__uso">{t.uso}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* ---------- 6. Formas ---------- */}
        <section aria-labelledby="col-formas">
          <h2 id="col-formas"><span className="col-num">07</span> Formas y componentes</h2>
          <p className="col-texto">
            Todo es recto, con filete fino y sombra de papel, como piezas impresas recortadas. Así el remolino, lo único
            curvo, destaca siempre. Estos son los componentes reales de la web.
          </p>
          <ul className="col-rejilla col-rejilla--2 col-piezas">
            <li>
              <div className="col-piezas__muestra">
                <Boton onClick={() => {}}>Siguiente destino</Boton>
              </div>
              <h4>Billete</h4>
              <p>La acción principal. Un rectángulo con muescas en los lados, como un billete de tren, y una flecha que avanza al pasar el cursor.</p>
            </li>
            <li>
              <div className="col-piezas__muestra">
                <Boton to="/" variante="enlace">Elegir otro destino</Boton>
              </div>
              <h4>Enlace</h4>
              <p>La acción secundaria. Texto subrayado que se engrosa al pasar el cursor: no compite con el billete.</p>
            </li>
            <li>
              <div className="col-piezas__muestra">
                <SelectorTamano valor={tam} alCambiar={setTam} />
              </div>
              <h4>Tamaños</h4>
              <p>Dos casillas rectas en Fraunces. La elegida se rellena, como una casilla marcada en un formulario de papel.</p>
            </li>
            <li>
              <div className="col-piezas__muestra">
                <span className="col-piezas__foco">Foco de teclado</span>
              </div>
              <h4>Foco de doble anillo</h4>
              <p>Un contorno y un halo de dos colores: se ve igual sobre papel, sobre foto y sobre pitaya. Solo aparece al navegar con teclado.</p>
            </li>
          </ul>
        </section>

        {/* ---------- 7. Composición ---------- */}
        <section aria-labelledby="col-composicion">
          <h2 id="col-composicion"><span className="col-num">08</span> Composición</h2>
          <div className="col-rueda-bloque">
            <div className="col-dosterc" aria-hidden="true">
              <div className="col-dosterc__escena"><span>Escenario · 2/3</span></div>
              <div className="col-dosterc__folio"><span>Folio · 1/3</span></div>
            </div>
            <div className="col-texto">
              <p>
                <strong>La regla de los 2/3.</strong> Dos tercios de la pantalla para la imagen y un tercio para el texto y
                los controles, en una rejilla de 12 columnas: 8 de escenario y 4 de folio. Es un anuncio: manda la imagen.
              </p>
              <p>
                <strong>Nunca centrado.</strong> El elemento principal se coloca en un punto fuerte del escenario, en el
                cruce de sus tercios, lo que da tensión y aire a la composición.
              </p>
              <p>
                <strong>El folio es una hoja.</strong> No es una columna de texto: es el papel del cuaderno, y cambia de
                material en cada destino. En Ubud se pone a la izquierda para que la mirada de la foto lleve al texto.
              </p>
              <p>
                <strong>En el móvil</strong> la imagen va arriba y el folio debajo, en una sola columna, con la misma jerarquía.
              </p>
            </div>
          </div>
        </section>

        {/* ---------- 8. Movimiento ---------- */}
        <section aria-labelledby="col-movimiento">
          <h2 id="col-movimiento"><span className="col-num">09</span> Movimiento</h2>
          <p className="col-texto">
            Cada gesto tiene su curva, y todas cuentan algo del producto: remover, soltar, estampar. Pulsa «Ver» para
            comparar. {reducido && <strong>Tienes activado «Reducir movimiento»: las demos van sin animación.</strong>}
          </p>
          <ul className="col-movs">
            {MOVIMIENTOS.map((m) => <DemoMovimiento key={m.id} mov={m} />)}
          </ul>
        </section>

        {/* ---------- 9. Reglas ---------- */}
        <section aria-labelledby="col-reglas">
          <h2 id="col-reglas"><span className="col-num">10</span> Reglas de uso</h2>
          <ul className="col-lista">
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
