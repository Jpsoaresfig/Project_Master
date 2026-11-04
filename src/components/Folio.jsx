/* El tercio de texto. `Hoja` es la cáscara; `Folio` es la ficha completa de un destino. */
import { useState } from 'react';
import cacahuete from '../assets/ilustraciones/cacahuete.svg?raw';
import pitaya from '../assets/ilustraciones/pitaya.svg?raw';
import florNopal from '../assets/ilustraciones/flor-nopal.svg?raw';
import { TAMANOS, saborPorId } from '../data.js';
import { Boton, Ilu } from './piezas.jsx';
import './folio.css';

const GRABADOS = { casa: cacahuete, ubud: pitaya, atacama: florNopal };

/** Cáscara del folio: papel, scroll propio y numeral opcional que cruza hacia el escenario. */
export function Hoja({ numeral, className = '', children, ...resto }) {
  return (
    <section className={`folio ${className}`.trim()} {...resto}>
      {numeral && (
        <span className="folio__numeral titulo" aria-hidden="true">
          {numeral}
        </span>
      )}
      <div className="folio__hoja">{children}</div>
    </section>
  );
}

/** Selector 300 g / 150 g. Controlado: `valor` y `alCambiar`. */
export function SelectorTamano({ valor, alCambiar, className = '' }) {
  return (
    <div className={`tamanos ${className}`.trim()} role="group" aria-label="Tamaño del frasco">
      {TAMANOS.map((g) => (
        <button
          key={g}
          type="button"
          className="tamano"
          aria-pressed={valor === g}
          onClick={() => alCambiar(g)}
        >
          {g} g
        </button>
      ))}
    </div>
  );
}

/**
 * Ficha de destino: etapa, coordenadas, h1, cita, descripción, tamaños, numeral,
 * grabado, «Elegir otro destino» y billete al siguiente.
 * `sabor`: id ('casa' | 'ubud' | 'atacama'). `tam`/`alCambiarTam`: opcionales; sin ellos
 * el folio guarda el tamaño por su cuenta. `children` se coloca tras los tamaños.
 */
export default function Folio({ sabor, tam, alCambiarTam, children, className = '' }) {
  const datos = saborPorId(sabor);
  const [tamPropio, setTamPropio] = useState(TAMANOS[0]);
  const tamano = tam ?? tamPropio;
  const cambiar = alCambiarTam ?? setTamPropio;

  return (
    <Hoja numeral={datos.etapa} className={className} aria-label={`Ficha de ${datos.nombre}`}>
      <div className="folio__ficha">
        <p className="etiqueta">
          Etapa {datos.etapa} · {datos.modo}
        </p>
        <p className="folio__dato dato">{datos.dato}</p>
        <h1 className="titulo folio__titulo">{datos.nombreFolio}</h1>
        <p className="cita folio__cita">«{datos.cita}»</p>
        <p className="folio__descripcion">{datos.descripcion}</p>
        <SelectorTamano valor={tamano} alCambiar={cambiar} />
        {children}
      </div>
      <div className="folio__grabado">
        <Ilu src={GRABADOS[sabor]} style={{ width: sabor === 'casa' ? 180 : 170 }} />
      </div>
      <div className="folio__salidas">
        <Boton to="/" variante="enlace">
          Elegir otro destino
        </Boton>
        <Boton to={datos.siguiente.ruta}>{datos.siguiente.etiqueta}</Boton>
      </div>
    </Hoja>
  );
}
