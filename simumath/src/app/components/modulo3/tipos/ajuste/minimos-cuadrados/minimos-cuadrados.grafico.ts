import type { DibujarMetodo } from '../../../../../shared/models/metodo.model';

/**
 * DIBUJO DE MÍNIMOS CUADRADOS sobre el gráfico genérico.
 *
 * ── Qué agrega sobre lo común ────────────────────────────────────────
 * `grafico-metodo` ya dibuja ejes, cuadrícula y la "función", que acá es
 * la RECTA ajustada ŷ = a₀ + a₁x. Esta función agrega lo propio del
 * método:
 *
 *   1. Los puntos experimentales como dispersión (no como curva).
 *   2. El residuo de cada punto: la distancia vertical a la recta. Es
 *      lo que el método minimiza y lo que hay que VER.
 *   3. El punto seleccionado con los botones de pasos, resaltado con su
 *      residuo marcado.
 *   4. La predicción en x*, si el alumno pidió una.
 *
 * ── Por qué el residuo se dibuja siempre ─────────────────────────────
 * Porque un gráfico de regresión sin residuos esconde justamente lo que
 * hay que aprender: que la recta no pasa por los puntos, y que los
 * apartamientos pueden tener patrón (señal de que el modelo lineal no
 * corresponde).
 */

const COLOR_PUNTO = '#8a5a00';
const COLOR_PUNTO_ACTIVO = '#f0a52a';
const COLOR_RESIDUO = 'rgba(138, 90, 0, 0.35)';
const COLOR_RESIDUO_ACTIVO = '#b91c1c';
const COLOR_PREDICCION = '#16a34a';

export function crearDibujoMinimosCuadrados(marcas: {
  evaluarEn?: number;
  prediccion?: number;
  recta?: (x: number) => number;
}): DibujarMetodo {
  return (ctx, rect, { aX, aY, iteraciones, pasoActual }) => {
    ctx.save();

    // ── 1 y 2. Puntos y residuos ────────────────────────────────────
    iteraciones.forEach((fila, indice) => {
      const xi = Number(fila['xi']);
      const yi = Number(fila['yi']);
      if (!Number.isFinite(xi) || !Number.isFinite(yi)) return;

      const activo = indice === pasoActual;
      const px = aX(xi);
      const py = aY(yi);

      // El residuo: de la recta al punto. Con la recta ya dibujada por
      // el componente genérico, alcanza con el segmento vertical.
      const yhat = Number(fila['yhat']);
      if (Number.isFinite(yhat)) {
        const pyRecta = aY(yhat);
        ctx.strokeStyle = activo ? COLOR_RESIDUO_ACTIVO : COLOR_RESIDUO;
        ctx.lineWidth = activo ? 2 : 1.5;
        ctx.setLineDash(activo ? [] : [3, 2]);
        ctx.beginPath();
        ctx.moveTo(px, pyRecta);
        ctx.lineTo(px, py);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      circulo(ctx, px, py, activo ? 7 : 5, activo ? COLOR_PUNTO_ACTIVO : COLOR_PUNTO);

      if (activo) {
        ctx.fillStyle = COLOR_PUNTO_ACTIVO;
        ctx.font = '700 11px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(`(x${indice + 1}, y${indice + 1})`, px, py - 10);
      }
    });

    // ── 4. La predicción en x* ─────────────────────────────────────
    const x = marcas.evaluarEn;
    const y = marcas.prediccion;
    if (x !== undefined && Number.isFinite(x) && y !== undefined && Number.isFinite(y)) {
      const px = aX(x);
      const py = aY(y);

      ctx.strokeStyle = COLOR_PREDICCION;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(px, rect.y);
      ctx.lineTo(px, rect.y + rect.alto);
      ctx.stroke();
      ctx.setLineDash([]);

      circulo(ctx, px, py, 6, COLOR_PREDICCION);

      ctx.fillStyle = COLOR_PREDICCION;
      ctx.font = '700 11px system-ui, sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'bottom';
      ctx.fillText(
        `ŷ(${formatearCorto(x)}) ≈ ${formatearCorto(y)}`,
        Math.min(px + 8, rect.x + rect.ancho - 110),
        py - 8,
      );
    }

    ctx.restore();
  };
}

/* ------------------------------------------------------------------ */
/* Auxiliares de dibujo                                                */
/* ------------------------------------------------------------------ */

function circulo(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radio: number,
  relleno: string,
): void {
  ctx.beginPath();
  ctx.arc(x, y, radio, 0, Math.PI * 2);
  ctx.fillStyle = relleno;
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#ffffff';
  ctx.stroke();
}

function formatearCorto(v: number): string {
  if (Number.isInteger(v)) return String(v);
  return v.toFixed(3).replace(/\.?0+$/, '');
}
