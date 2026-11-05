import type { EjercicioBase } from '../../../../../shared/models/metodo.model';

/**
 * ACTIVIDADES DE AUTOEVALUACIÓN DE NEWTON-RAPHSON.
 *
 * Valores de control:
 * · x² + 2x − 15 = 0      → x = 3
 * · ln(x+1) − 3 = 0       → x = e³ − 1 = 19.0855369232
 * · π(x) = 0 (semilla 1)  → x = 2.5417495868
 */
export type ActividadesAuto = Pick<
  EjercicioBase,
  'cuestionario' | 'resolucion' | 'formatoRespuesta' | 'desbloqueo'
>;

export const AUTOEVALUACION_NEWTON: Record<string, ActividadesAuto> = {
  'newton-ejercicio-1': {
    formatoRespuesta: 'escalar',
    cuestionario: [
      {
        id: 'nr-e1-q1',
        tipo: 'opcion-multiple',
        enunciado: 'Con f(x) = x² + 2x − 15 y x₀ = 0, ¿cuánto vale x₁?',
        opciones: [
          { id: 'a', texto: '7.5' },
          { id: 'b', texto: '3' },
          { id: 'c', texto: '−7.5' },
          { id: 'd', texto: '1.5' },
        ],
        correcta: 'a',
        explicacion:
          'f(0) = −15 y f′(0) = 2, así que x₁ = 0 − (−15)/2 = 7.5. Una pendiente chica produce un paso largo.',
      },
      {
        id: 'nr-e1-q2',
        tipo: 'opcion-multiple',
        enunciado: '¿Qué dato necesita Newton-Raphson que Bisección no necesita?',
        opciones: [
          { id: 'a', texto: 'La derivada f′(x) en cada iteración.' },
          { id: 'b', texto: 'Un intervalo con cambio de signo.' },
          { id: 'c', texto: 'Dos semillas distintas.' },
          { id: 'd', texto: 'El valor de f en los extremos.' },
        ],
        correcta: 'a',
        explicacion:
          'Newton usa la recta tangente: necesita f′. Bisección solo necesita f y un intervalo con cambio de signo.',
      },
      {
        id: 'nr-e1-q3',
        tipo: 'opcion-multiple',
        enunciado:
          'Aunque x₁ = 7.5 está lejos de la raíz 3, el método llega en 6 iteraciones. ¿Por qué?',
        opciones: [
          { id: 'a', texto: 'Porque cerca de una raíz simple la convergencia es cuadrática.' },
          { id: 'b', texto: 'Porque la derivada se hace cero en la raíz.' },
          { id: 'c', texto: 'Porque el método reduce el intervalo a la mitad.' },
          { id: 'd', texto: 'Porque f es lineal en todo el intervalo.' },
        ],
        correcta: 'a',
        explicacion:
          'Cerca de la raíz, el error de Newton se eleva al cuadrado en cada paso: los últimos decimales aparecen muy rápido.',
      },
    ],
    resolucion: {
      valorCorrecto: 3,
      tolerancia: 0.0001,
      etiqueta: 'x',
      respuestaFinalTexto: 'x = 3, alcanzada en 6 iteraciones desde x₀ = 0.',
    },
  },

  'newton-ejercicio-2': {
    formatoRespuesta: 'escalar',
    cuestionario: [
      {
        id: 'nr-e2-q1',
        tipo: 'opcion-multiple',
        enunciado:
          'Para f(x) = ln(x+1) − 3 con x₀ = 1, ¿cuánto vale x₁?',
        opciones: [
          { id: 'a', texto: '5.6137' },
          { id: 'b', texto: '19.0855' },
          { id: 'c', texto: '1.5' },
          { id: 'd', texto: '4.6137' },
        ],
        correcta: 'a',
        explicacion:
          'f(1) = −2.30685282 y f′(1) = 1/2 = 0.5; x₁ = 1 + 2.30685282/0.5 = 5.61370564.',
      },
      {
        id: 'nr-e2-q2',
        tipo: 'opcion-multiple',
        enunciado: '¿Por qué una derivada pequeña produce un paso grande?',
        opciones: [
          { id: 'a', texto: 'Porque x₁ = x₀ − f(x₀)/f′(x₀): dividir por un número chico amplifica el salto.' },
          { id: 'b', texto: 'Porque el método duplica el intervalo.' },
          { id: 'c', texto: 'Porque f(x₀) siempre es cero.' },
          { id: 'd', texto: 'Porque la derivada pequeña indica una raíz doble.' },
        ],
        correcta: 'a',
        explicacion:
          'La corrección es el cociente f/f′. Con f′ ≈ 0.5, la corrección es el doble de f y el salto se agranda.',
      },
      {
        id: 'nr-e2-q3',
        tipo: 'opcion-multiple',
        enunciado:
          'La raíz exacta es e³ − 1 ≈ 19.085537. ¿Qué describe mejor el comportamiento del método?',
        opciones: [
          { id: 'a', texto: 'Saltos grandes al principio y convergencia cuadrática al final.' },
          { id: 'b', texto: 'Convergencia lineal con factor 0.5 en todo el recorrido.' },
          { id: 'c', texto: 'Divergencia, porque x₀ está lejos de la raíz.' },
          { id: 'd', texto: 'Estancamiento desde la primera iteración.' },
        ],
        correcta: 'a',
        explicacion:
          'Los primeros pasos son largos porque f′ es chica; al acercarse a la raíz, el error se cuadruplica o eleva al cuadrado.',
      },
    ],
    resolucion: {
      valorCorrecto: 19.0855369232,
      tolerancia: 0.0001,
      etiqueta: 'x',
      respuestaFinalTexto: 'x = e³ − 1 ≈ 19.085537, en 6 iteraciones desde x₀ = 1.',
    },
  },

  'newton-ejercicio-3': {
    formatoRespuesta: 'escalar',
    cuestionario: [
      {
        id: 'nr-e3-q1',
        tipo: 'opcion-multiple',
        enunciado:
          'Con π(1) = −48.05 y π′(1) = 43.85, ¿cuánto vale x₁?',
        opciones: [
          { id: 'a', texto: '2.0958' },
          { id: 'b', texto: '1.0958' },
          { id: 'c', texto: '2.5417' },
          { id: 'd', texto: '4.7048' },
        ],
        correcta: 'a',
        explicacion:
          'x₁ = 1 − (−48.05)/43.85 = 1 + 1.09578107 = 2.09578107.',
      },
      {
        id: 'nr-e3-q2',
        tipo: 'opcion-multiple',
        enunciado: '¿Por qué Newton puede caer en una raíz u otra del mismo polinomio?',
        opciones: [
          { id: 'a', texto: 'Porque el resultado depende de la semilla inicial, no de un intervalo.' },
          { id: 'b', texto: 'Porque el método siempre busca la raíz más grande.' },
          { id: 'c', texto: 'Porque el polinomio tiene una sola raíz real.' },
          { id: 'd', texto: 'Porque usa el punto medio del intervalo.' },
        ],
        correcta: 'a',
        explicacion:
          'Newton es un método abierto: la cuenca de atracción de cada raíz depende de dónde se arranca.',
      },
      {
        id: 'nr-e3-q3',
        tipo: 'opcion-multiple',
        enunciado: 'El valor x ≈ 2.54175 representa…',
        opciones: [
          { id: 'a', texto: 'el primer nivel de producción donde la ganancia se anula.' },
          { id: 'b', texto: 'el nivel de producción donde la ganancia es máxima.' },
          { id: 'c', texto: 'el costo fijo de la pyme.' },
          { id: 'd', texto: 'la segunda raíz del polinomio.' },
        ],
        correcta: 'a',
        explicacion:
          'Es una raíz de π(x): la ganancia vale cero. La otra raíz es 4.70478842 y se alcanza con otra semilla.',
      },
    ],
    resolucion: {
      valorCorrecto: 2.5417495868,
      tolerancia: 0.0001,
      etiqueta: 'x',
      respuestaFinalTexto: 'x ≈ 2.541750 (primer equilibrio), en 5 iteraciones desde x₀ = 1.',
    },
  },
};
