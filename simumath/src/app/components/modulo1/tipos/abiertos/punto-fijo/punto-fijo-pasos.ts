/** Pasos de Punto fijo compartidos entre Teoría y Ejemplos. */
export const PASOS_PUNTO_FIJO = [
  ['error', 'Define g(x)', 'Despeja la incógnita de f(x) = 0 para tener x = g(x) y elige una semilla x₀ cerca de la raíz. No hay intervalo.'],
  ['primario', 'Evalúa g(x₀)', 'Si da exactamente x₀, ya es el punto fijo.'],
  ['primario', 'Guarda x₁ = g(x₀)', 'Y mide el desplazamiento |Δx| = |x₁ − x₀|.'],
  ['acento', 'Proyecta contra la diagonal', 'El siguiente paso arranca en x₁, no en g(x₀): cada punto rebota contra y = x.'],
  ['ok', 'Compara con la tolerancia', 'Si |Δx| queda debajo, para y devuelve el último punto como aproximación.'],
  ['neutro', 'Repite desde el paso 2', 'Con el punto nuevo: g(x) se evalúa siempre sobre la última x.'],
  ['error', 'Revisa el tope y el resultado', 'Si se agota el máximo de iteraciones, avisa que no convergió. Verifica además que g(raíz) = raíz y que f(raíz) = 0.'],
];
