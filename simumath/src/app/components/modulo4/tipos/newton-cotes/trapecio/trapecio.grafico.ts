import type { DibujarMetodo } from '../../../../../shared/models/metodo.model';

/**
 * DIBUJO DEL TRAPECIO sobre el gráfico genérico.
 *
 * ── Se dibuja en DOS capas ───────────────────────────────────────────
 * `grafico-metodo` dibuja los ejes, la cuadrícula y la curva. El área
 * del método tiene que ir ANTES de la curva (si no, la taparía) y las
 * marcas tienen que ir DESPUÉS (si no, la curva las taparía a ellas).
 * Por eso este archivo devuelve dos funciones:
 *
 *   · `antes`  → rellena cada trapecio bajo la curva.
 *   · `despues`→ remarca el trapecio activo, marca los nodos y rotula.
 *
 * ── Por qué el relleno no es decoración ──────────────────────────────
 * El método ES ese relleno: la suma de las áreas de los trapecios es la
 * integral aproximada. Ver el escalón del borde superior (la recta de
 * cada trapecio) contra la curva es lo que explica de dónde sale el
 * error: donde la curva es cóncava, el trapecio sobra o falta.
 */

const COLOR_RELLENO = 'rgba(27, 107, 147, 0.16)';
const COLOR_RELLENO_ACTIVO = 'rgba(240, 165, 42, 0.35)';
const COLOR_BORDE = 'rgba(27, 107, 147, 0.55)';
const COLOR_ACTIVO = '#b8860b';
const COLOR_NODO = '#0b2447';

export function crearDibujoTrapecio(): { antes: DibujarMetodo; despues: DibujarMetodo } {
  /** Relleno de todos los trapecios. */
  const antes: DibujarMetodo = (ctx, _rect, { aX, aY, iteraciones, pasoActual }) => {
    if (iteraciones.length < 2) return;

    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.clip();

    // La última fila es Σ: no representa un nodo.
    for (let i = 0; i < iteraciones.length - 1; i++) {
      const xi = Number(iteraciones[i]['xi']);
      const fxi = Number(iteraciones[i]['fxi']);
      const x1 = Number(iteraciones[i + 1]?.['xi']);
      const f1 = Number(iteraciones[i + 1]?.['fxi']);
      if (![xi, fxi, x1, f1].every(Number.isFinite)) continue;

      const activo = i === Math.min(pasoActual, iteraciones.length - 2);

      ctx.beginPath();
      ctx.moveTo(aX(xi), aY(0));
      ctx.lineTo(aX(xi), aY(fxi));
      ctx.lineTo(aX(x1), aY(f1));
      ctx.lineTo(aX(x1), aY(0));
      ctx.closePath();
      ctx.fillStyle = activo ? COLOR_RELLENO_ACTIVO : COLOR_RELLENO;
      ctx.fill();

      if (activo) {
        ctx.strokeStyle = COLOR_ACTIVO;
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }

    ctx.restore();
  };

  /** Nodos, etiquetas y borde del trapecio activo. */
  const despues: DibujarMetodo = (ctx, _rect, { aX, aY, iteraciones, pasoActual }) => {
    if (iteraciones.length < 2) return;

    ctx.save();

    // Borde superior del trapecio activo, encima de la curva.
    const indiceActivo = Math.min(pasoActual, iteraciones.length - 2);
    const xa = Number(iteraciones[indiceActivo]?.['xi']);
    const fa = Number(iteraciones[indiceActivo]?.['fxi']);
    const xb = Number(iteraciones[indiceActivo + 1]?.['xi']);
    const fb = Number(iteraciones[indiceActivo + 1]?.['fxi']);
    if ([xa, fa, xb, fb].every(Number.isFinite)) {
      ctx.strokeStyle = COLOR_ACTIVO;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(aX(xa), aY(fa));
      ctx.lineTo(aX(xb), aY(fb));
      ctx.stroke();
    }

    // Nodos: un punto por cada xᵢ evaluada.
    for (let i = 0; i < iteraciones.length - 1; i++) {
      const xi = Number(iteraciones[i]['xi']);
      const fxi = Number(iteraciones[i]['fxi']);
      if (!Number.isFinite(xi) || !Number.isFinite(fxi)) continue;

      const px = aX(xi);
      const py = aY(fxi);
      ctx.beginPath();
      ctx.arc(px, py, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = COLOR_NODO;
      ctx.fill();

      // Con muchos nodos las etiquetas se pisan: solo se rotulan si hay
      // pocos y siempre el nodo activo.
      const activoAhora = i === indiceActivo || i === indiceActivo + 1;
      if (iteraciones.length <= 9 || activoAhora) {
        ctx.fillStyle = activoAhora ? COLOR_ACTIVO : 'rgba(11, 36, 71, 0.75)';
        ctx.font = `${activoAhora ? '700 ' : ''}11px system-ui, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(`x${subindice(i)}`, px, py - 7);
      }
    }

    ctx.restore();
  };

  return { antes, despues };
}

/** Subíndice Unicode: 0 → ₀, 12 → ₁₂. Sin guiones bajos en pantalla. */
function subindice(n: number): string {
  const mapa = ['₀', '₁', '₂', '₃', '₄', '₅', '₆', '₇', '₈', '₉'];
  return String(n)
    .split('')
    .map((d) => mapa[Number(d)] ?? d)
    .join('');
}
