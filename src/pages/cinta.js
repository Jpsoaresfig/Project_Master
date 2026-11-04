/* Cinta de crema: un trazo con grosor propio, no un tubo. De una línea central y una función de
   ancho saca el contorno relleno. Ubud (hélice) y el Final (hebras) la comparten. */

/** `puntos`: [[x, y], …]. `ancho(t, i)`: semiancho en cada punto, con t de 0 a 1. */
export function contorno(puntos, ancho, inicio = 0, fin = 1) {
  const n = puntos.length - 1;
  const ida = [];
  const vuelta = [];
  for (let i = 0; i <= n; i += 1) {
    const t = i / n;
    const [ax, ay] = puntos[Math.max(0, i - 1)];
    const [bx, by] = puntos[Math.min(n, i + 1)];
    const l = Math.hypot(bx - ax, by - ay) || 1;
    const nx = -(by - ay) / l;
    const ny = (bx - ax) / l;
    const a = ancho(t, i);
    const [x, y] = puntos[i];
    ida.push(`${(x + nx * a * (1 - inicio)).toFixed(2)} ${(y + ny * a * (1 - inicio)).toFixed(2)}`);
    vuelta.push(`${(x - nx * a * fin).toFixed(2)} ${(y - ny * a * fin).toFixed(2)}`);
  }
  return `M${ida.join('L')}L${vuelta.reverse().join('L')}Z`;
}

/** Línea central como `d`, para la máscara que revela la cinta con pathLength. */
export const linea = (puntos) =>
  puntos.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(2)} ${y.toFixed(2)}`).join('');

/** Vena fina que corre paralela a la línea central: da la textura del remolino en la crema.
    `vaiven`: cuánto serpentea de un borde a otro; con él deja de parecer un filo de tubo. */
export function vena(puntos, ancho, desvio, grueso, vaiven = 0) {
  const n = puntos.length - 1;
  const ida = puntos.map(([x, y], i) => {
    const t = i / n;
    const [ax, ay] = puntos[Math.max(0, i - 1)];
    const [bx, by] = puntos[Math.min(n, i + 1)];
    const l = Math.hypot(bx - ax, by - ay) || 1;
    const nx = -(by - ay) / l;
    const ny = (bx - ax) / l;
    const d = ancho(t, i) * (desvio + Math.sin(t * 17 + desvio * 9) * 0.14 + Math.sin(t * 9.3 + desvio * 4) * vaiven);
    return [x + nx * d, y + ny * d];
  });
  return contorno(ida, (t, i) => ancho(t, i) * grueso * (0.55 + 0.45 * Math.sin(t * 23 + desvio * 5) ** 2));
}
