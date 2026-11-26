/** Explicación común a Teoría y Ejemplos. */
export const PASOS_NEWTON = [
  ['error', 'Elige la semilla x₀', 'Es el único dato que aportas y no hay intervalo que verificar.'],
  ['error', 'Evalúa f(xₙ) y f′(xₙ)', 'Si |f′(xₙ)| es casi cero, frena: el paso se va a disparar.'],
  ['primario', 'Calcula xₙ₊₁', 'Con la fórmula xₙ₊₁ = xₙ − f(xₙ)/f′(xₙ).'],
  ['primario', 'Evalúa f(xₙ₊₁)', 'Si da cero exacto, terminó: ese punto es la raíz.'],
  ['ok', 'Mide el desplazamiento', '|Δx| = |xₙ₊₁ − xₙ|, y compáralo con la tolerancia.'],
  ['neutro', 'Corre el índice', 'Si |Δx| todavía no llega a la tolerancia, la x vieja se reemplaza por la nueva.'],
  ['neutro', 'Vuelve al paso 2', 'Si se agota el máximo de iteraciones, avisa que no convergió y devuelve el último punto.'],
];
