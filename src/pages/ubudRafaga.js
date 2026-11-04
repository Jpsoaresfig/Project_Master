/* Ráfaga de pétalos y hojas en canvas. Solo corre mientras hay partículas: al terminar, se apaga. */
import { useEffect, useMemo, useRef } from 'react';

const PETALO = new Path2D('M0 -24C12 -12 15 8 0 24C-15 8 -12 -12 0 -24Z');
const HOJA = new Path2D('M-22 22C-22 -4 -4 -20 22 -22C22 4 4 22 -22 22Z');
const SEMILLA = new Path2D('M0 -10C6 -10 6 10 0 10C-6 10 -6 -10 0 -10Z');
const FORMAS = [
  { p: PETALO, c: '#F06A9E', nervio: 'M0 -20V20' },
  { p: PETALO, c: '#C2185B', nervio: 'M0 -20V20' },
  { p: PETALO, c: '#FCE3EC', nervio: 'M0 -20V20' },
  { p: HOJA, c: '#6E8C4A', nervio: 'M-20 20L18 -18' },
  { p: HOJA, c: '#8FAE5C', nervio: 'M-20 20L18 -18' },
  { p: SEMILLA, c: '#2E2A1F', nervio: null },
];

const az = (a, b) => a + Math.random() * (b - a);

export function useRafaga(ref, { reducido, tactil }) {
  const motor = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || reducido) return undefined;
    const ctx = canvas.getContext('2d');
    const nervios = new Map();
    FORMAS.forEach((f) => {
      if (f.nervio) nervios.set(f, new Path2D(f.nervio));
    });
    let lista = [];
    let cuadro = 0;
    let previo = 0;
    let W = 0;
    let H = 0;
    let dpr = 1;
    let oculto = document.hidden;

    const medir = () => {
      const r = canvas.getBoundingClientRect();
      W = r.width;
      H = r.height;
      dpr = Math.min(window.devicePixelRatio || 1, tactil ? 1.5 : 2);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
    };
    medir();

    const paso = (ahora) => {
      const dt = Math.min(0.04, previo ? (ahora - previo) / 1000 : 0.016);
      previo = ahora;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      lista = lista.filter((p) => p.v < 1);
      for (const p of lista) {
        p.v += dt / p.m;
        p.t += dt;
        const arrastre = 1 - p.drag * dt;
        p.vx = p.vx * arrastre + Math.sin(p.t * p.fv + p.s) * 90 * dt;
        p.vy = p.vy * arrastre + (34 + Math.cos(p.t * p.fv * 0.7 + p.s) * 60) * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.g += p.vg * dt;
        const giro = Math.cos(p.t * p.fg + p.s);
        const co = Math.cos(p.g);
        const si = Math.sin(p.g);
        const k = (p.tam / 48) * dpr;
        const ky = k * (0.25 + 0.75 * Math.abs(giro));
        ctx.setTransform(co * k, si * k, -si * ky, co * ky, p.x * dpr, p.y * dpr);
        ctx.globalAlpha = Math.min(1, (1 - p.v) * 3) * Math.min(1, p.v * 24);
        ctx.fillStyle = p.f.c;
        ctx.fill(p.f.p);
        const n = nervios.get(p.f);
        if (n) {
          ctx.strokeStyle = 'rgb(255 255 255 / 0.4)';
          ctx.lineWidth = 1.4;
          ctx.stroke(n);
        }
      }
      ctx.globalAlpha = 1;
      if (lista.length) {
        cuadro = requestAnimationFrame(paso);
      } else {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        cuadro = 0;
      }
    };

    const encender = () => {
      if (cuadro || oculto || !lista.length) return;
      previo = 0;
      cuadro = requestAnimationFrame(paso);
    };

    const particula = (x, y, vx, vy, m, retraso) => ({
      x,
      y,
      vx,
      vy,
      v: -retraso / m,
      m,
      t: 0,
      s: az(0, 6.28),
      g: az(0, 6.28),
      vg: az(-3.2, 3.2),
      fv: az(1.4, 3.2),
      fg: az(2.4, 6),
      drag: az(0.9, 1.7),
      tam: az(14, 34),
      f: FORMAS[(Math.random() * FORMAS.length) | 0],
    });

    motor.current = {
      entrada() {
        medir();
        const n = tactil ? 30 : 56;
        const base = Math.max(W, 520);
        for (let i = 0; i < n; i++) {
          const y = az(-0.1, 0.92) * H;
          lista.push(particula(-30, y, base * az(0.5, 1.15), az(-90, 90), az(2.4, 3.8), az(0, 0.7)));
        }
        encender();
      },
      soplo(x, y) {
        const n = tactil ? 10 : 18;
        for (let i = 0; i < n; i++) {
          const a = az(0, 6.28);
          const v = az(80, 300);
          lista.push(particula(x, y, Math.cos(a) * v, Math.sin(a) * v - 60, az(1.2, 2.2), az(0, 0.14)));
        }
        encender();
      },
    };

    const visibilidad = () => {
      oculto = document.hidden;
      if (oculto) {
        cancelAnimationFrame(cuadro);
        cuadro = 0;
      } else {
        encender();
      }
    };
    document.addEventListener('visibilitychange', visibilidad);
    const obs = new ResizeObserver(medir);
    obs.observe(canvas);

    return () => {
      cancelAnimationFrame(cuadro);
      document.removeEventListener('visibilitychange', visibilidad);
      obs.disconnect();
      motor.current = null;
    };
  }, [ref, reducido, tactil]);

  return useMemo(
    () => ({
      entrada: () => motor.current?.entrada(),
      soplo: (x, y) => motor.current?.soplo(x, y),
    }),
    [],
  );
}
