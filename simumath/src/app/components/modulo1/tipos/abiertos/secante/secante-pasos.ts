/** Explicación común a Teoría y Ejemplos. */
export const PASOS_SECANTE = [
  ['error', 'Elige DOS semillas', 'x₀ y x₁, distintas entre sí y cerca de la raíz. No hay intervalo que verificar.'],
  ['primario', 'Evalúa f(x₀) y f(x₁)', 'En las dos semillas.'],
  ['error', 'Comprueba f(x₁) ≠ f(x₀)', 'Si son iguales, la secante es horizontal y el método no puede dar el paso.'],
  ['primario', 'Calcula el nuevo punto', 'Con la fórmula de la secante.'],
  ['primario', 'Evalúa f(xₙ₊₁)', 'Si da cero exacto, terminó.'],
  ['ok', 'Mide el desplazamiento', '|Δx| = |xₙ₊₁ − xₙ|, y compáralo con la tolerancia.'],
  ['neutro', 'Avanza la ventana', 'x₀ ← x₁ y x₁ ← x₂, y vuelve al paso 2. Si se agota el máximo de iteraciones, avisa que no convergió.'],
];
