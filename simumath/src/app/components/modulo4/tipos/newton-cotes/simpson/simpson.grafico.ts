import type { DibujarMetodo } from '../../../../../shared/models/metodo.model';

/**
 * DIBUJO DE SIMPSON sobre el gráfico genérico.
 *
 * ── Qué se dibuja y por qué ──────────────────────────────────────────
 * Simpson no suma trapecios: en cada par de subintervalos ajusta la
 * PARÁBOLA que pasa por los tres nodos y usa el área bajo esa parábola.
 * Para que el método se entienda, el relleno tiene que mostrar esa
 * parábola, no el trapecio. Comparar visualmente los dos métodos es el
 * objetivo de la pestaña: el borde curvo donde el trapecio tenía un
 * escalón es exactamente la mejora.
 *
 * ── Dos capas, igual que el trapecio ─────────────────────────────────
 *   · `antes`  → rellena cada bloque de dos subintervalos (antes de la curva).
 *   · `despues`→ remarca la parábola del bloque activo y los nodos.
 */

const COLOR_RELLENO = 'rgba(138, 90, 0, 0.15)';
const COLOR_RELLENO_ACTIVO = 'rgba(240, 165, 42, 0.32)';
const COLOR_ACTIVO = '#8a5a00';
const COLOR_NODO = '#0b2447';

/** Evaluador de la parábola que pasa por tres puntos (Lagrange). */
function parabola(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): (x: number) => number {
  return (x: number) =>
    (y0 * (x - x1) * (x - x2)) / ((x0 - x1) * (x0 - x2)) +
    (y1 * (x - x0) * (x - x2)) / ((x1 - x0) * (x1 - x2)) +
    (y2 * (x - x0) * (x - x1)) / ((x2 - x0) * (x2 - x1));
}

export function crearDibujoSimpson(): { antes: DibujarMetodo; despues: DibujarMetodo } {
  /** Relleno del área bajo cada parábola. */
  const antes: DibujarMetodo = (ctx, _rect, { aX, aY, iteraciones, pasoActual }) => {
    if (iteraciones.length < 4) return;

    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.clip();

    // La tabla trae n + 1 nodos y una fila Σ al final.
    const n = iteraciones.length - 2;
    const bloques = Math.floor(n / 2);
    const bloqueActivo = Math.min(Math.floor(pasoActual / 2), Math.max(0, bloques - 1));

    for (let k = 0; k < bloques; k++) {
      const p0 = leer(iteraciones[2 * k]);
      const p1 = leer(iteraciones[2 * k + 1]);
      const p2 = leer(iteraciones[2 * k + 2]);
      if (!p0 || !p1 || !p2) continue;

      const f = parabola(p0.x, p0.y, p1.x, p1.y, p2.x, p2.y);

      ctx.beginPath();
      ctx.moveTo(aX(p0.x), aY(0));
      ctx.lineTo(aX(p0.x), aY(p0.y));
      const muestras = 28;
      for (let j = 1; j <= muestras; j++) {
        const x = p0.x + ((p2.x - p0.x) * j) / muestras;
        const y = f(x);
        if (!Number.isFinite(y)) continue;
        ctx.lineTo(aX(x), aY(y));
      }
      ctx.lineTo(aX(p2.x), aY(0));
      ctx.closePath();
      ctx.fillStyle = k === bloqueActivo ? COLOR_RELLENO_ACTIVO : COLOR_RELLENO;
      ctx.fill();
    }

    ctx.restore();
  };

  /** Parábola activa remarcada, nodos y etiquetas. */
  const despues: DibujarMetodo = (ctx, _rect, { aX, aY, iteraciones, pasoActual }) => {
    if (iteraciones.length < 4) return;

    ctx.save();

    const n = iteraciones.length - 2;
    const bloques = Math.floor(n / 2);
    const bloqueActivo = Math.min(Math.floor(pasoActual / 2), Math.max(0, bloques - 1));
    const p0 = leer(iteraciones[2 * bloqueActivo]);
    const p1 = leer(iteraciones[2 * bloqueActivo + 1]);
    const p2 = leer(iteraciones[2 * bloqueActivo + 2]);

    if (p0 && p1 && p2) {
      const f = parabola(p0.x, p0.y, p1.x, p1.y, p2.x, p2.y);
      ctx.strokeStyle = COLOR_ACTIVO;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(aX(p0.x), aY(p0.y));
      for (let j = 1; j <= 60; j++) {
        const x = p0.x + ((p2.x - p0.x) * j) / 60;
        const y = f(x);
        if (Number.isFinite(y)) ctx.lineTo(aX(x), aY(y));
      }
      ctx.stroke();
    }

    for (let i = 0; i < iteraciones.length - 1; i++) {
      const punto = leer(iteraciones[i]);
      if (!punto) continue;

      const px = aX(punto.x);
      const py = aY(punto.y);
      ctx.beginPath();
      ctx.arc(px, py, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = COLOR_NODO;
      ctx.fill();

      const enBloqueActivo = i >= 2 * bloqueActivo && i <= 2 * bloqueActivo + 2;
      if (iteraciones.length <= 9 || enBloqueActivo) {
        ctx.fillStyle = enBloqueActivo ? COLOR_ACTIVO : 'rgba(11, 36, 71, 0.75)';
        ctx.font = `${enBloqueActivo ? '700 ' : ''}11px system-ui, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(`x${subindice(i)}`, px, py - 7);
      }
    }

    ctx.restore();
  };

  return { antes, despues };
}

/** Lee un nodo de la fila, o null si no es una fila de nodo. */
function leer(fila: Record<string, number | string> | undefined): { x: number; y: number } | null {
  if (!fila) return null;
  const x = Number(fila['xi']);
  const y = Number(fila['fxi']);
  if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
  return { x, y };
}

/** Subíndice Unicode: 0 → ₀, 12 → ₁₂. Sin guiones bajos en pantalla. */
function subindice(n: number): string {
  const mapa = ['₀', '₁', '₂', '₃', '₄', '₅', '₆', '₇', '₈', '₉'];
  return String(n)
    .split('')
    .map((d) => mapa[Number(d)] ?? d)
    .join('');
}
