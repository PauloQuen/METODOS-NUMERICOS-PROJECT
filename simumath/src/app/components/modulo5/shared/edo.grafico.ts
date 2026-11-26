import type { DibujarMetodo } from '../../../shared/models/metodo.model';

/**
 * Dibujo de la aproximación numérica sobre el gráfico compartido.
 *
 * `grafico-metodo` ya dibuja los ejes, la cuadrícula y la curva de la
 * solución exacta (que recibe como `funcion`). Esta capa agrega la
 * POLIGONAL de puntos calculados y resalta el paso que se está mirando.
 *
 * Las filas traen `t` e `y` ya formateados como texto (para la tabla); acá
 * se convierten con Number. Las filas vacías o no numéricas se saltan.
 */
export function crearDibujoEdo(): {
  antes?: DibujarMetodo;
  despues: DibujarMetodo;
} {
  const despues: DibujarMetodo = (ctx, rect, contexto) => {
    const filas = contexto.iteraciones ?? [];
    if (filas.length === 0) return;

    const puntos: { x: number; y: number }[] = [];
    for (const fila of filas) {
      const t = Number(fila['t']);
      const y = Number(fila['y']);
      if (!Number.isFinite(t) || !Number.isFinite(y)) continue;
      puntos.push({ x: contexto.aX(t), y: contexto.aY(y) });
    }
    if (puntos.length === 0) return;

    // Poligonal de la aproximación.
    ctx.save();
    ctx.beginPath();
    ctx.rect(rect.x, rect.y, rect.ancho, rect.alto);
    ctx.clip();
    ctx.strokeStyle = '#c2410c';
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    puntos.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
    ctx.stroke();

    // Puntos calculados: se marcan todos si son pocos; si no, solo el
    // actual y el final, para no llenar el gráfico de bolitas.
    const marcarTodos = puntos.length <= 40;
    puntos.forEach((p, i) => {
      if (!marcarTodos && i !== contexto.pasoActual && i !== puntos.length - 1) return;
      ctx.beginPath();
      ctx.fillStyle = i === contexto.pasoActual ? '#b8860b' : '#c2410c';
      ctx.arc(p.x, p.y, i === contexto.pasoActual ? 4.5 : 2.8, 0, Math.PI * 2);
      ctx.fill();
    });

    // Etiqueta del punto actual.
    const actual = puntos[Math.min(contexto.pasoActual, puntos.length - 1)];
    if (actual) {
      const fila = filas[Math.min(contexto.pasoActual, filas.length - 1)];
      ctx.fillStyle = '#7c2d12';
      ctx.font = '11px system-ui, sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'bottom';
      ctx.fillText(`(t, y) = (${fila['t']}, ${fila['y']})`, actual.x + 6, actual.y - 6);
    }
    ctx.restore();
  };

  return { despues };
}
