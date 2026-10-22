import type { DibujarMetodo, Rectangulo } from '../../../../../shared/models/metodo.model';

/**
 * DIBUJO DE LAGRANGE sobre el gráfico genérico.
 *
 * ── La separación, igual que en el Módulo 1 ───────────────────────────
 * `grafico-metodo` dibuja lo que es común: ejes, cuadrícula y la curva
 * de la "función". En Lagrange esa función es el POLINOMIO
 * interpolante P(x), que se le pasa como `[funcion]`.
 *
 * Esta función agrega lo propio del método:
 *   1. Los nodos (xᵢ, yᵢ) como puntos, para ver que la curva los toca.
 *   2. El nodo seleccionado por los botones de pasos, resaltado.
 *   3. El punto x* donde se está estimando, con su valor P(x*).
 *
 * ── Por qué es una fábrica y no una constante ─────────────────────────
 * El punto x* y su P(x*) cambian con cada ejemplo. Se pasan al crear el
 * dibujo y quedan capturados en la clausura, así el componente genérico
 * no necesita saber nada de Lagrange.
 */

const COLOR_NODO = '#1b6b93';
const COLOR_NODO_ACTIVO = '#f0a52a';
const COLOR_ESTIMACION = '#16a34a';

export function crearDibujoLagrange(marcas: {
  evaluarEn?: number;
  valor?: number;
}): DibujarMetodo {
  return (ctx, rect, { aX, aY, iteraciones, pasoActual }) => {
    ctx.save();

    // ── 1 y 2. Los nodos ────────────────────────────────────────────
    iteraciones.forEach((fila, indice) => {
      const xi = Number(fila['xi']);
      const yi = Number(fila['yi']);
      if (!Number.isFinite(xi) || !Number.isFinite(yi)) return;

      const activo = indice === pasoActual;
      const px = aX(xi);
      const py = aY(yi);

      // Línea de referencia hasta el eje x: ayuda a leer la coordenada.
      ctx.strokeStyle = 'rgba(27, 107, 147, 0.25)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(px, rect.y + rect.alto);
      ctx.stroke();
      ctx.setLineDash([]);

      circulo(ctx, px, py, activo ? 7 : 5, activo ? COLOR_NODO_ACTIVO : COLOR_NODO);

      // La etiqueta del nodo, solo para el activo (si no, se amontonan).
      if (activo) {
        ctx.fillStyle = COLOR_NODO_ACTIVO;
        ctx.font = '700 11px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(`(x${indice + 1}, y${indice + 1})`, px, py - 10);
      }
    });

    // ── 3. El punto de estimación ───────────────────────────────────
    const x = marcas.evaluarEn;
    const y = marcas.valor;
    if (x !== undefined && Number.isFinite(x) && y !== undefined && Number.isFinite(y)) {
      const px = aX(x);
      const py = aY(y);

      ctx.strokeStyle = COLOR_ESTIMACION;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(px, rect.y);
      ctx.lineTo(px, rect.y + rect.alto);
      ctx.stroke();
      ctx.setLineDash([]);

      circulo(ctx, px, py, 6, COLOR_ESTIMACION);

      ctx.fillStyle = COLOR_ESTIMACION;
      ctx.font = '700 11px system-ui, sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'bottom';
      const etiqueta = `P(${formatearCorto(x)}) ≈ ${formatearCorto(y)}`;
      etiquetaEnCuadro(ctx, etiqueta, px + 8, py - 8, rect);
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

/** Pinta una etiqueta con fondo blanco para que se lea sobre la curva. */
function etiquetaEnCuadro(
  ctx: CanvasRenderingContext2D,
  texto: string,
  x: number,
  y: number,
  rect: Rectangulo,
): void {
  const ancho = ctx.measureText(texto).width + 10;
  const alto = 16;
  const x0 = Math.min(x, rect.x + rect.ancho - ancho);
  const y0 = Math.max(y, rect.y + alto);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.fillRect(x0, y0 - alto, ancho, alto);
  ctx.fillStyle = COLOR_ESTIMACION;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(texto, x0 + 5, y0 - alto / 2);
}

function formatearCorto(v: number): string {
  if (Number.isInteger(v)) return String(v);
  return v.toFixed(3).replace(/\.?0+$/, '');
}
