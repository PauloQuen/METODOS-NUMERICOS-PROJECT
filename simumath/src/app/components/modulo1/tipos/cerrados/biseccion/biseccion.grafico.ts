import type { ContextoGrafico, DibujarMetodo } from '../../../../../shared/models/metodo.model';

/**
 * DIBUJO DE BISECCIÓN sobre el gráfico genérico.
 *
 * ── La separación ────────────────────────────────────────────────────
 * `grafico-metodo` ya dibujó los ejes, la cuadrícula y la curva de f(x),
 * porque eso es igual para todos los métodos. Esta función dibuja lo
 * ÚNICO que le corresponde a bisección:
 *
 *   1. La recta que une (a, 0) y (b, 0): el intervalo acotado.
 *   2. Las dos líneas verticales que lo delimitan.
 *   3. El punto medio c sobre el eje, con su marca.
 *   4. El punto (c, f(c)) sobre la curva, para ver qué tan arriba o abajo cae.
 *   5. El punto de la raíz, cuando el método ya terminó.
 *
 * Nada de esto se dibuja si la fila de la iteración actual no trae los
 * números (por ejemplo, en la primera carga, antes de calcular).
 */

/** Cuánto margen se deja arriba y abajo de la curva para que respire. */
const MARGEN_VERTICAL = 0.15;

/** El color del intervalo, en el mismo tono que el índice del método. */
const COLOR_INTERVALO = '#5b7cfa';
/** El color del punto medio. */
const COLOR_MEDIO = '#f0a52a';
/** El color de la raíz encontrada. */
const COLOR_RAIZ = '#16a34a';

export const dibujarBiseccion: DibujarMetodo = (
  ctx,
  rect,
  { aX, aY, iteraciones, pasoActual, rango, raiz },
) => {
  const fila = iteraciones?.[pasoActual];

  // ── Sin datos para este paso: no se dibuja nada del método ────────
  if (!fila) return;

  const a = Number(fila['a']);
  const b = Number(fila['b']);
  const c = Number(fila['c']);
  const fc = Number(fila['fc']);

  if (![a, b, c, fc].every(Number.isFinite)) return;

  const yCero = aY(0);
  const xA = aX(a);
  const xB = aX(b);
  const xC = aX(c);

  ctx.save();

  // ── 1 y 2. El intervalo acotado ───────────────────────────────────
  // El trazo grueso en el eje es el "dónde estamos buscando".
  ctx.strokeStyle = COLOR_INTERVALO;
  ctx.lineWidth = 3;
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.moveTo(xA, yCero);
  ctx.lineTo(xB, yCero);
  ctx.stroke();

  // Las dos paredes del intervalo.
  ctx.lineWidth = 1.5;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(xA, yCero - 14);
  ctx.lineTo(xA, yCero + 14);
  ctx.moveTo(xB, yCero - 14);
  ctx.lineTo(xB, yCero + 14);
  ctx.stroke();
  ctx.setLineDash([]);

  // Las letras a y b, arriba del intervalo.
  ctx.fillStyle = COLOR_INTERVALO;
  ctx.font = '600 11px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.fillText('a', xA, yCero - 16);
  ctx.fillText('b', xB, yCero - 16);

  // ── 3. El punto medio c sobre el eje ──────────────────────────────
  // Se marca con una línea punteada hasta el eje y un triángulo.
  ctx.strokeStyle = COLOR_MEDIO;
  ctx.lineWidth = 1.5;
  ctx.setLineDash([2, 3]);
  ctx.beginPath();
  ctx.moveTo(xC, yCero);
  ctx.lineTo(xC, rect.y + rect.alto);
  ctx.stroke();
  ctx.setLineDash([]);

  // El triángulo que señala c, mirando hacia arriba desde el eje.
  triangulo(ctx, xC, yCero, 6, COLOR_MEDIO);

  ctx.fillStyle = COLOR_MEDIO;
  ctx.font = '700 11px system-ui, sans-serif';
  ctx.textBaseline = 'top';
  ctx.fillText('c', xC, yCero + 8);

  // ── 4. El punto (c, f(c)) sobre la curva ──────────────────────────
  // Con la línea punteada vertical se ve la distancia entre f(c) y cero,
  // que es lo que decide en qué mitad del intervalo sigue la raíz.
  const yFc = aY(fc);
  ctx.strokeStyle = COLOR_MEDIO;
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 3]);
  ctx.beginPath();
  ctx.moveTo(xC, yCero);
  ctx.lineTo(xC, yFc);
  ctx.stroke();
  ctx.setLineDash([]);

  circulo(ctx, xC, yFc, 5, COLOR_MEDIO, '#ffffff');

  // ── 5. La raíz, si el método ya terminó ───────────────────────────
  if (raiz !== undefined && Number.isFinite(raiz)) {
    const xR = aX(raiz);
    const yR = aY(0);

    // Una banda vertical finita: dice "la raíz está en esta tira".
    const anchoBanda = Math.max(2, Math.abs(xA - xB) / 2);
    ctx.fillStyle = 'rgba(22, 163, 74, 0.12)';
    ctx.fillRect(xR - anchoBanda, rect.y, anchoBanda * 2, rect.alto);

    ctx.strokeStyle = COLOR_RAIZ;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(xR, rect.y);
    ctx.lineTo(xR, rect.y + rect.alto);
    ctx.stroke();

    circulo(ctx, xR, yR, 5, COLOR_RAIZ, '#ffffff');

    ctx.fillStyle = COLOR_RAIZ;
    ctx.font = '700 11px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('raíz', xR + 8, yR);
  }

  ctx.restore();

  // `rango` y `MARGEN_VERTICAL` quedan disponibles para cuando se quiera
  // acotar la vista a los valores que tomó f. No se usan todavía porque el
  // componente genérico ya calcula el rango vertical de la curva completa.
  void rango;
  void MARGEN_VERTICAL;
};

/** Un círculo con borde, para que se lea sobre cualquier fondo. */
function circulo(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radio: number,
  relleno: string,
  borde: string,
): void {
  ctx.beginPath();
  ctx.arc(x, y, radio, 0, Math.PI * 2);
  ctx.fillStyle = relleno;
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = borde;
  ctx.stroke();
}

/** Un triángulo pequeño, para marcar el punto medio sobre el eje. */
function triangulo(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  lado: number,
  color: string,
): void {
  ctx.beginPath();
  ctx.moveTo(x, y - lado);
  ctx.lineTo(x - lado, y + lado);
  ctx.lineTo(x + lado, y + lado);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}