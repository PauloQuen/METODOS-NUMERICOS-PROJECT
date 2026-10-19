import type { DibujarMetodo } from '../../../../../shared/models/metodo.model';

/**
 * La telaraña (cobweb) de Punto Fijo.
 *
 * El componente `grafico-metodo` dibuja los ejes, la cuadrícula y la
 * curva y = g(x). Acá se dibujan las otras dos piezas del método:
 *
 *  1. La diagonal y = x, contra la que se rebota cada iteración.
 *  2. La escalera: se sube en vertical hasta g, se cruza en horizontal
 *     hasta la diagonal, y se vuelve a subir. Cada peldaño es una
 *     iteración, y la telaraña "se cierra" sobre la raíz cuando
 *     |g′(x*)| < 1.
 *
 * ── De dónde sale la x₀ de la primera subida ─────────────────────────
 * La tabla guarda x₁ = g(x₀) y δ₁ = |x₁ − x₀|, pero no x₀. Para el
 * primer peldaño se reconstruye probando los dos candidatos x₁ ± δ₁:
 * como el motor calculó x₁ = g(x₀), el verdadero x₀ es el candidato que
 * devuelve |g(candidato) − x₁| ≈ 0. Los dos candidatos caen lejos de
 * ese 0 salvo el real, así que la elección es inequívoca.
 */
export const dibujarPuntoFijo: DibujarMetodo = (ctx, rect, contexto) => {
  const { aX, aY, funcion, iteraciones, pasoActual, rango } = contexto;
  if (!iteraciones.length) return;

  const paso = Math.max(0, pasoActual);
  const fila = iteraciones[paso];
  if (!fila) return;

  const xCur = Number((fila as any).x);
  if (!Number.isFinite(xCur)) return;

  ctx.save();

  // 1. La diagonal y = x: el "espejo" que convierte g(xₙ) en xₙ₊₁.
  ctx.strokeStyle = 'rgba(11,36,71,0.28)';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([6, 4]);
  ctx.beginPath();
  ctx.moveTo(aX(rango.min), aY(rango.min));
  ctx.lineTo(aX(rango.max), aY(rango.max));
  ctx.stroke();
  ctx.setLineDash([]);

  // 2. Recuperar la semilla: x₁ y δ₁ están en la primera fila.
  const primera = iteraciones[0] as any;
  const x1 = Number(primera.x);
  const delta1 = Number(primera.delta);
  let x0: number;
  if (Number.isFinite(x1) && Number.isFinite(delta1) && delta1 >= 0) {
    const [mejor] = [x1 + delta1, x1 - delta1]
      .map((c) => ({ c, d: Math.abs(funcion(c) - x1) }))
      .filter((p) => Number.isFinite(p.d))
      .sort((p, q) => p.d - q.d);
    x0 = mejor?.c ?? x1;
  } else {
    x0 = x1;
  }

  // 3. La escalera. La secuencia x₀, x₁, x₂, … se arma con la semilla
  //    recuperada y las filas (cada fila guarda el punto NUEVO).
  const xs: number[] = [x0];
  for (let i = 0; i < iteraciones.length; i++) {
    const v = Number((iteraciones[i] as any).x);
    if (!Number.isFinite(v)) break;
    xs.push(v);
  }

  const hasta = Math.min(paso, xs.length - 2);
  const color = '#f59e0b';

  // El punto de arranque sobre el eje X.
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(aX(x0), aY(0), 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.font = '11px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillStyle = 'rgba(11,36,71,0.85)';
  ctx.fillText('x₀', aX(x0), aY(0) + 6);

  // El camino: subir de la diagonal a la curva y cruzar de vuelta.
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(aX(x0), aY(0));
  for (let k = 0; k <= hasta; k++) {
    const xk = xs[k];
    // g(xₖ): la primera subida usa x₁ = g(x₀); las demás, la fila k−1.
    const gxk = k === 0 ? x1 : Number((iteraciones[k - 1] as any).gx);
    if (!Number.isFinite(xk) || !Number.isFinite(gxk)) break;
    ctx.lineTo(aX(xk), aY(xk)); // subir hasta la diagonal
    ctx.lineTo(aX(xk), aY(gxk)); // de la diagonal a la curva
    ctx.lineTo(aX(gxk), aY(gxk)); // de la curva a la diagonal: xₖ₊₁
  }
  ctx.stroke();

  // El punto del último peldaño, con su etiqueta.
  const xkAct = xs[hasta];
  const gxkAct = hasta === 0 ? x1 : Number((iteraciones[hasta - 1] as any).gx);
  if (Number.isFinite(xkAct) && Number.isFinite(gxkAct)) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(aX(gxkAct), aY(gxkAct), 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillStyle = 'rgba(11,36,71,0.85)';
    ctx.fillText(
      `xₙ₊₁ ≈ ${gxkAct.toFixed(4)}`,
      aX(gxkAct),
      aY(gxkAct) - 8,
    );
  }
  ctx.restore();
};