/* Red de seguridad con el aspecto de la marca: nunca una pantalla en blanco. */
import { Component } from 'react';
import { MARCA } from '../data.js';
import { Boton, Remolino } from './piezas.jsx';
import './error.css';

export default class ErrorBoundary extends Component {
  state = { fallo: false };

  static getDerivedStateFromError() {
    return { fallo: true };
  }

  componentDidCatch(error) {
    console.error(error);
  }

  componentDidUpdate(previas) {
    /* Con `clave` (la ruta), salir de la pantalla rota devuelve la web a la normalidad. */
    if (this.state.fallo && previas.clave !== this.props.clave) this.setState({ fallo: false });
  }

  render() {
    if (!this.state.fallo) return this.props.children;
    return (
      <div className="fallo" role="alert">
        <Remolino tam={72} />
        <p className="etiqueta fallo__marca">{MARCA}</p>
        <h1 className="titulo fallo__titulo">Nos hemos perdido por el camino</h1>
        <p className="fallo__texto">Esta parada no ha podido cargarse. Vuelve a intentarlo.</p>
        <Boton flecha={false} onClick={() => window.location.reload()}>
          Volver a intentarlo
        </Boton>
      </div>
    );
  }
}
