import type { DibujarMetodo } from '../../../shared/models/metodo.model';

/**
 * Dibujo de la convergencia de un método iterativo.
 *
 * El gráfico base ya dibuja ejes y cuadrícula. Acá se agrega la curva
 * (k, error) de cada iteración y se resalta la que se está mirando con
 * los botones de paso. El error se mide en escala lineal; para clases
 * con convergencia rápida puede quedar pegado al eje, y eso también es
 * información: dice que el método ya está muy cerca de la solución.
 */
export function crearDibujoConvergencia(color = '#8a5a00'): DibujarMetodo {
  return (ctx, _rect, contexto) => {
    const puntos = contexto.iteraciones
      .map((fila) => ({ k: Number(fila['k']), error: Number(fila['error']) }))
      .filter((p) => Number.isFinite(p.k) && Number.isFinite(p.error));

    if (puntos.length === 0) return;

    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    puntos.forEach((p, i) => {
      const px = contexto.aX(p.k);
      const py = contexto.aY(p.error);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.stroke();

    puntos.forEach((p, i) => {
      const px = contexto.aX(p.k);
      const py = contexto.aY(p.error);
      const actual = i === contexto.pasoActual;
      ctx.beginPath();
      ctx.fillStyle = actual ? color : '#ffffff';
      ctx.strokeStyle = color;
      ctx.lineWidth = actual ? 3 : 1.5;
      ctx.arc(px, py, actual ? 5 : 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });

    ctx.restore();
  };
}

/** Rango horizontal para el gráfico de convergencia. */
export function rangoConvergencia(filas: readonly Record<string, number | string>[]): {
  min: number;
  max: number;
} {
  if (filas.length === 0) return { min: 0, max: 1 };
  const maxK = Math.max(
    ...filas.map((f) => Number(f['k'])).filter((v) => Number.isFinite(v)),
  );
  return { min: 0, max: Math.max(1, maxK) };
}

/** Rango vertical (error) con un margen para que los puntos se vean. */
export function rangoError(
  filas: readonly Record<string, number | string>[],
): { min: number; max: number } {
  const errores = filas
    .map((f) => Number(f['error']))
    .filter((v) => Number.isFinite(v) && v >= 0);
  if (errores.length === 0) return { min: 0, max: 1 };
  const max = Math.max(...errores);
  return { min: 0, max: max > 0 ? max * 1.1 : 1 };
}
