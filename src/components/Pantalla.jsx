/* Rejilla común de pantalla: escenario (2/3) + folio (1/3), con todas sus adaptaciones. */
export default function Pantalla({
  escenario,
  folio,
  fondo,
  invertida = false,
  noche = false,
  etiqueta,
  className = '',
  propsEscenario,
}) {
  return (
    <div
      className={`pantalla ${className}`.trim()}
      data-invertida={invertida || undefined}
      data-noche={noche || undefined}
    >
      {fondo && <div className="pantalla__fondo">{fondo}</div>}
      <section className="escenario" aria-label={etiqueta} {...propsEscenario}>
        {escenario}
      </section>
      {folio}
    </div>
  );
}
