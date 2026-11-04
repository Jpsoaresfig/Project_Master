/* 404 con la marca: una parada que no está en el mapa. */
import { MARCA } from '../data.js';
import { Boton, Hoja, Pantalla, Remolino } from '../components/index.js';
import './noencontrada.css';

export default function NoEncontrada() {
  return (
    <Pantalla
      className="perdido"
      etiqueta="Ruta fuera del mapa"
      escenario={
        <div className="perdido__escena" aria-hidden="true">
          <Remolino tam={260} dibujar duracion={1.2} />
        </div>
      }
      folio={
        <Hoja aria-label="Volver al inicio">
          <p className="etiqueta perdido__marca">{MARCA}</p>
          <h1 className="titulo folio__titulo">Esta ruta no está en el mapa</h1>
          <p className="cita folio__cita">Ninguna cucharada lleva hasta aquí.</p>
          <div className="folio__salidas">
            <Boton to="/">Volver al inicio</Boton>
          </div>
        </Hoja>
      }
    />
  );
}
