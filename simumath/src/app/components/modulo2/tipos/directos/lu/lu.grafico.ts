import type {
  ContextoGraficoSistema,
  DibujarSistema,
} from '../../../../../shared/models/sistema.model';

/**
 * DIBUJO PROPIO DE LA FACTORIZACIÓN LU.
 *
 * ── Qué aporta este método al gráfico ─────────────────────────────────
 * El componente `grafico-sistema` dibuja lo que es igual para todos los
 * métodos: el plano, las rectas de las ecuaciones y el punto solución.
 * Esto es lo que el método agrega.
 *
 * ── La idea: la solución se construye con rectas VERTICALES ───────────
 * Cuando la descomposición termina, el sistema triangular U·x = y tiene
 * las MISMAS soluciones que el original pero rectas DISTINTAS (eso lo
 * dibuja el componente, como sistema extra, con trazo atenuado).
 *
 * Después la sustitución hacia atrás despeja las incógnitas de la última
 * a la primera. En un sistema de 2×2 eso es:
 *
 *   · primero se despeja x₂, y eso es trazar la recta vertical x = x₂;
 *   · después se despeja x₁, y eso es trazar la vertical x = x₁.
 *
 * Las dos verticales se cortan exactamente en el punto solución: el
 * método no lo encuentra por casualidad, lo CONSTRUYE.
 *
 * ── Por qué el avance depende del paso actual ────────────────────────
 * Las verticales aparecen a medida que el alumno avanza con los botones:
 * en el primer paso de sustitución aparece solo una, y en el último
 * aparecen las dos. Ver la solución "de golpe" al abrir la página no
 * dice nada; verla construirse sí.
 *
 * ── Lo que LU tiene y Gauss no ────────────────────────────────────────
 * La fase de descomposición de LU no dibuja rectas: ella sola no cambia
 * la solución, solo la reescribe. Lo que sí cambia son las rectas del
 * sistema, y eso lo ve el componente como sistema extra. Por eso el
 * dibujo de LU es más sobrio que el de Gauss: menos trazos, pero los que
 * pone son los que explican el método.
 */

/** El color de las rectas auxiliares: el morado del método LU. */
const COLOR_AUXILIAR = '#7a3b8f';

export function dibujarLu(
  ctx: CanvasRenderingContext2D,
  rect: { x: number; y: number; ancho: number; alto: number },
  contexto: ContextoGraficoSistema,
): void {
  const filas = contexto.iteraciones;
  const paso = contexto.pasoActual;
  const fila = filas[paso];
  if (!fila) return;

  // Las rectas auxiliares aparecen en la fase de SUSTITUCIÓN HACIA ATRÁS.
  // Durante la descomposición y la sustitución adelante todavía no hay
  // coordenadas que trazar: son cuentas sobre números.
  if (String(fila['etapa']) !== 'Sustitución atrás') return;

  const solucion = contexto.solucion;
  if (!solucion || solucion.length < 2) return;

  const n = solucion.length;
  const aX = contexto.aX;

  // Cuántas incógnitas se despejaron antes de este paso: eso dice cuál
  // de las n es la que se está despejando ahora (n−1, n−2, ..., 0).
  let indice = 0;
  for (let i = 0; i < paso; i++) {
    if (String(filas[i]['etapa']) === 'Sustitución atrás') indice++;
  }
  if (indice >= n) return;

  const k = n - 1 - indice;
  const valor = solucion[k];
  if (!Number.isFinite(valor)) return;

  const px = aX(valor);
  if (px < rect.x || px > rect.x + rect.ancho) return;

  ctx.save();
  ctx.strokeStyle = COLOR_AUXILIAR;
  ctx.lineWidth = 1.6;
  ctx.setLineDash([6, 4]);

  ctx.beginPath();
  ctx.moveTo(px, rect.y);
  ctx.lineTo(px, rect.y + rect.alto);
  ctx.stroke();

  ctx.setLineDash([]);
  ctx.fillStyle = COLOR_AUXILIAR;
  ctx.font = 'bold 11px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.fillText(`x${subindice(k)} = ${corto(valor)}`, px, rect.y + rect.alto - 6);

  ctx.restore();
}

/** El subíndice de la incógnita: 1, 2, 3... */
function subindice(k: number): string {
  const numeros = ['₁', '₂', '₃', '₄', '₅'];
  return numeros[k] ?? String(k + 1);
}

/** Un número corto, como "2" o "-1.5". */
function corto(v: number): string {
  if (Number.isInteger(v)) return String(v);
  return String(Number(v.toFixed(4)));
}
