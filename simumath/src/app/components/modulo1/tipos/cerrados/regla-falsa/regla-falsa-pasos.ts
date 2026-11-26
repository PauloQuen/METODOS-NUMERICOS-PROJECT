/** Pasos compartidos por Teoría y Ejemplos. */
export const PASOS_REGLA_FALSA = [
  ['Verifica las condiciones', 'Comprueba la continuidad en [a, b]. Si un extremo es raíz, termina; en otro caso exige f(a) · f(b) < 0.'],
  ['Calcula c', 'Une (a, f(a)) con (b, f(b)). Su cruce con el eje x es c = b − f(b)·(b − a)/(f(b) − f(a)).'],
  ['Evalúa la nueva aproximación', 'Calcula f(c). Si f(c) = 0, c es una raíz y el proceso termina.'],
  ['Comprueba la tolerancia', 'Desde la segunda iteración, compara |cₙ − cₙ₋₁| con la tolerancia absoluta. Es un indicador a posteriori, no una garantía del error real.'],
  ['Conserva el intervalo izquierdo', 'Si f(a) y f(c) tienen signos opuestos, sustituye b por c y f(b) por f(c).'],
  ['O conserva el intervalo derecho', 'En caso contrario, sustituye a por c y f(a) por f(c). Solo se conserva uno de los dos intervalos.'],
  ['Construye la siguiente cuerda', 'Repite desde el paso 2 con los extremos actualizados. Un extremo puede permanecer fijo; establece un máximo de iteraciones.'],
];
