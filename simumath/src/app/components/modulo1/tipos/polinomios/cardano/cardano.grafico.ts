import type { DibujarMetodo } from '../../../../../shared/models/metodo.model';

/**
 * Marcas de raíz de Cardano sobre el gráfico.
 *
 * ── Qué dibuja (y qué no) ────────────────────────────────────────────
 * El componente `grafico-metodo` ya dibuja ejes, cuadrícula y la curva
 * y = f(x). Cardano no itera: no hay telaraña, ni tangente, ni
 * escalera que animar. Lo único propio del método son LAS RAÍCES: la
 * fórmula devuelve todas las reales en una cuenta, así que este dibujo
 * las marca TODAS con una línea vertical punteada y un círculo sobre
 * el eje.
 *
 * ── De dónde salen las raíces ────────────────────────────────────────
 * De la columna `valor` de la tabla: las filas de raíz traen el número
 * (formateado a 8 decimales) y las demás traen '—', cuyo Number() es
 * NaN y por eso se saltea. La fila que se está mirando con los botones
 * de pasos (pasoActual) se resalta: es la forma de que el alumno
 * relacione "Paso 6 de la tabla" con "esa marca del gráfico".
 */
export const dibujarCardano: DibujarMetodo = (ctx, rect, contexto) => {
  const { aX, aY, iteraciones, pasoActual } = contexto;

  // Las raíces con su fila de origen, para poder resaltar la activa.
  const marcas: { x: number; fila: number }[] = [];
  iteraciones.forEach((fila, i) => {
    const v = Number(fila['valor']);
    if (Number.isFinite(v)) marcas.push({ x: v, fila: i });
  });
  if (!marcas.length) return;

  const colorRaiz = '#ec4899';
  const colorApagado = 'rgba(11,36,71,0.45)';

  ctx.save();
  ctx.font = '11px system-ui, sans-serif';

  marcas.forEach((marca, i) => {
    const activa = marca.fila === pasoActual;
    const px = aX(marca.x);
    const py = aY(0);

    // La vertical punteada: de la base del gráfico hasta el eje.
    ctx.strokeStyle = activa ? colorRaiz : colorApagado;
    ctx.lineWidth = activa ? 2 : 1.25;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(px, rect.y);
    ctx.lineTo(px, py);
    ctx.stroke();
    ctx.setLineDash([]);

    // El círculo sobre el eje x.
    ctx.fillStyle = activa ? colorRaiz : colorApagado;
    ctx.beginPath();
    ctx.arc(px, py, activa ? 5 : 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Etiqueta: x₁, x₂, x₃ (subíndices hasta 3; después, número plano).
    const indice = i < 3 ? ['₁', '₂', '₃'][i] : String(i + 1);
    ctx.fillStyle = activa ? colorRaiz : 'rgba(11,36,71,0.85)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(`x${indice}`, px, py - (activa ? 14 : 9));

    // Si la fila activa ES esta raíz, se agrega el valor numérico: es
    // el "acá está la respuesta" del paso que el alumno está mirando.
    if (activa) {
      ctx.fillStyle = colorRaiz;
      ctx.textBaseline = 'top';
      ctx.fillText(`≈ ${Number(marca.x).toFixed(6)}`, px, rect.y + 4);
    }
  });

  ctx.restore();
};
