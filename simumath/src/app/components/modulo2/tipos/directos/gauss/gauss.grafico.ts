import type {
  ContextoGraficoSistema,
  DibujarSistema,
} from '../../../../../shared/models/sistema.model';

/**
 * DIBUJO PROPIO DE LA ELIMINACIÓN GAUSSIANA.
 *
 * ── Qué aporta este método al gráfico ─────────────────────────────────
 * El componente `grafico-sistema` dibuja lo que es igual para todos los
 * métodos: el plano, las rectas de las ecuaciones y el punto solución.
 * Esto es lo que el método agrega.
 *
 * ── La idea: la sustitución hacia atrás DIBUJA la solución ───────────
 * Cuando la eliminación termina, el sistema es triangular y la solución
 * se despeja de abajo hacia arriba. En un sistema de 2×2 eso es:
 *
 *   · primero se despeja x₂, y eso es trazar la recta horizontal y = x₂;
 *   · después se despeja x₁, y eso es trazar la recta vertical x = x₁.
 *
 * Las dos rectas se cortan exactamente en el punto solución. O sea: el
 * método no encuentra el punto por casualidad, lo CONSTRUYE, y el
 * gráfico lo muestra paso a paso, como se construye en el cuaderno.
 *
 * ── Por qué el avance depende del paso actual ────────────────────────
 * Las rectas auxiliares se dibujan a medida que el alumno avanza con los
 * botones: en el primer paso de sustitución aparece solo la horizontal,
 * y en el último aparecen las dos. Ver la solución "de golpe" al abrir la
 * página no dice nada; verla construirse sí.
 */

/** El color de las rectas auxiliares: el mismo dorado de la solución. */
const COLOR_AUXILIAR = '#b8860b';

export function dibujarGauss(
  ctx: CanvasRenderingContext2D,
  rect: { x: number; y: number; ancho: number; alto: number },
  contexto: ContextoGraficoSistema,
): void {
  const filas = contexto.iteraciones;
  const paso = contexto.pasoActual;
  const fila = filas[paso];
  if (!fila) return;

  // Las rectas auxiliares aparecen en la fase de SUSTITUCIÓN. Durante la
  // eliminación todavía no hay nada que dibujar: el sistema se está
  // transformando y en el plano eso no se ve.
  if (String(fila['etapa']) !== 'Sustitución') return;

  const solucion = contexto.solucion;
  if (!solucion || solucion.length < 2) return;

  const n = solucion.length;
  const aX = contexto.aX;
  const aY = contexto.aY;
  const rango = contexto.rango;

  // Las sustituciones son los ÚLTIMOS n pasos de la tabla, y van de la
  // última incógnita (xₙ) hacia la primera (x₁). Con el índice del paso
  // dentro de la tabla se sabe cuál de las n es.
  const indice = paso - (filas.length - n);
  if (indice < 0 || indice >= n) return;

  // La incógnita que se despeja en este paso: n−1, n−2, ..., 0.
  const k = n - 1 - indice;

  ctx.save();
  ctx.strokeStyle = COLOR_AUXILIAR;
  ctx.lineWidth = 1.4;
  ctx.setLineDash([6, 4]);

  for (let j = n - 1; j >= k; j--) {
    const valor = solucion[j];
    if (!Number.isFinite(valor)) continue;

    if (j === n - 1) {
      // La última incógnita da una recta HORIZONTAL: y = xₙ.
      const py = aY(valor);
      if (py < rect.y || py > rect.y + rect.alto) continue;
      ctx.beginPath();
      ctx.moveTo(rect.x, py);
      ctx.lineTo(rect.x + rect.ancho, py);
      ctx.stroke();
      etiqueta(ctx, `y = ${corto(valor)}`, aX(rango.min + (rango.max - rango.min) * 0.02), py, 'left');
    } else {
      // Las demás dan rectas VERTICALES: x = xⱼ.
      const px = aX(valor);
      if (px < rect.x || px > rect.x + rect.ancho) continue;
      ctx.beginPath();
      ctx.moveTo(px, rect.y);
      ctx.lineTo(px, rect.y + rect.alto);
      ctx.stroke();
      etiqueta(ctx, `x = ${corto(valor)}`, px, rect.y + rect.alto - 6, 'center');
    }
  }

  ctx.setLineDash([]);
  ctx.restore();
}

/** Escribe un texto chico al lado de una recta auxiliar. */
function etiqueta(
  ctx: CanvasRenderingContext2D,
  texto: string,
  x: number,
  y: number,
  alineacion: 'left' | 'center',
): void {
  ctx.save();
  ctx.fillStyle = COLOR_AUXILIAR;
  ctx.font = 'bold 11px system-ui, sans-serif';
  ctx.textAlign = alineacion;
  ctx.textBaseline = 'bottom';
  ctx.fillText(texto, x, y - 3);
  ctx.restore();
}

/** Un número corto, como "2" o "-1.5". */
function corto(v: number): string {
  if (Number.isInteger(v)) return String(v);
  return String(Number(v.toFixed(4)));
}
