import type { EjercicioBase } from '../../../../../shared/models/metodo.model';

/**
 * ACTIVIDADES DE AUTOEVALUACIÓN DE SECANTE.
 *
 * Valores de control:
 * · x² + 2x − 15 = 0      → x = 3
 * · ln(x+1) − 3 = 0       → x = e³ − 1 = 19.0855369232
 * · π(x) = 0 (semillas 2,3) → x = 2.5417495868
 */
export type ActividadesAuto = Pick<
  EjercicioBase,
  'cuestionario' | 'resolucion' | 'formatoRespuesta' | 'desbloqueo'
>;

export const AUTOEVALUACION_SECANTE: Record<string, ActividadesAuto> = {
  'secante-ejercicio-1': {
    formatoRespuesta: 'escalar',
    cuestionario: [
      {
        id: 'sec-e1-q1',
        tipo: 'opcion-multiple',
        enunciado:
          'Con x₀ = 4 y x₁ = 5 para f(x) = x² + 2x − 15, ¿cuánto vale x₂?',
        opciones: [
          { id: 'a', texto: '3.1818' },
          { id: 'b', texto: '3' },
          { id: 'c', texto: '2.5' },
          { id: 'd', texto: '5' },
        ],
        correcta: 'a',
        explicacion:
          'x₂ = 5 − 20·(5 − 4)/(20 − 9) = 5 − 20/11 = 3.18181818.',
      },
      {
        id: 'sec-e1-q2',
        tipo: 'opcion-multiple',
        enunciado: '¿Qué diferencia a la Secante de Newton-Raphson?',
        opciones: [
          { id: 'a', texto: 'Aproxima f′ con dos puntos y no necesita la derivada.' },
          { id: 'b', texto: 'Necesita un intervalo con cambio de signo.' },
          { id: 'c', texto: 'Siempre converge en menos iteraciones.' },
          { id: 'd', texto: 'Usa el punto medio del intervalo.' },
        ],
        correcta: 'a',
        explicacion:
          'La Secante reemplaza f′(xₙ) por la pendiente de la recta entre dos iterados; por eso pide dos semillas.',
      },
      {
        id: 'sec-e1-q3',
        tipo: 'opcion-multiple',
        enunciado: 'f(4) = 9 y f(5) = 20 son ambos positivos. ¿Qué hace el método?',
        opciones: [
          { id: 'a', texto: 'Arranca igual: es un método abierto y no exige cambio de signo.' },
          { id: 'b', texto: 'Se detiene porque no hay raíz.' },
          { id: 'c', texto: 'Cambia de método automáticamente.' },
          { id: 'd', texto: 'Busca primero un intervalo con signo opuesto.' },
        ],
        correcta: 'a',
        explicacion:
          'La Secante no usa el teorema de Bolzano; con dos semillas distintas puede acercarse a la raíz aunque los extremos tengan el mismo signo.',
      },
    ],
    resolucion: {
      valorCorrecto: 3,
      tolerancia: 0.0001,
      etiqueta: 'x',
      respuestaFinalTexto: 'x = 3, en 5 iteraciones desde x₀ = 4 y x₁ = 5.',
    },
  },

  'secante-ejercicio-2': {
    formatoRespuesta: 'escalar',
    cuestionario: [
      {
        id: 'sec-e2-q1',
        tipo: 'opcion-multiple',
        enunciado:
          'Con x₀ = 18 y x₁ = 20 para f(x) = ln(x+1) − 3, ¿cuánto vale x₂?',
        opciones: [
          { id: 'a', texto: '19.1103' },
          { id: 'b', texto: '19.0855' },
          { id: 'c', texto: '19.6402' },
          { id: 'd', texto: '18.5' },
        ],
        correcta: 'a',
        explicacion:
          'x₂ = 20 − 0.04452244·2/(0.04452244 + 0.05556102) ≈ 19.11029378.',
      },
      {
        id: 'sec-e2-q2',
        tipo: 'opcion-multiple',
        enunciado: '¿Por qué conviene arrancar con puntos cercanos a la raíz?',
        opciones: [
          { id: 'a', texto: 'Porque la cuerda entre puntos cercanos representa mejor la función y converge más rápido.' },
          { id: 'b', texto: 'Porque así el método se vuelve cerrado.' },
          { id: 'c', texto: 'Porque evita tener que calcular f.' },
          { id: 'd', texto: 'Porque garantiza que x₂ sea exacto.' },
        ],
        correcta: 'a',
        explicacion:
          'La Secante trabaja con la pendiente entre las dos semillas; si están lejos, esa pendiente puede no representar la zona de la raíz.',
      },
      {
        id: 'sec-e2-q3',
        tipo: 'opcion-multiple',
        enunciado:
          'El método llega en 4 iteraciones contra 15 de Bisección. ¿Qué orden de convergencia tiene la Secante?',
        opciones: [
          { id: 'a', texto: 'Superlineal, aproximadamente 1.618 (número áureo).' },
          { id: 'b', texto: 'Lineal, exactamente 0.5.' },
          { id: 'c', texto: 'Cuadrático, igual que Newton.' },
          { id: 'd', texto: 'Cúbico.' },
        ],
        correcta: 'a',
        explicacion:
          'La Secante converge con orden ≈ 1.618: más rápido que Bisección, algo más lento que Newton.',
      },
    ],
    resolucion: {
      valorCorrecto: 19.0855369232,
      tolerancia: 0.0001,
      etiqueta: 'x',
      respuestaFinalTexto: 'x = e³ − 1 ≈ 19.085537, en 4 iteraciones desde 18 y 20.',
    },
  },

  'secante-ejercicio-3': {
    formatoRespuesta: 'escalar',
    cuestionario: [
      {
        id: 'sec-e3-q1',
        tipo: 'opcion-multiple',
        enunciado:
          'Con π(2) = −12.4 y π(3) = 6.65, ¿cuánto vale x₂?',
        opciones: [
          { id: 'a', texto: '2.6509' },
          { id: 'b', texto: '2.5417' },
          { id: 'c', texto: '3' },
          { id: 'd', texto: '2.5' },
        ],
        correcta: 'a',
        explicacion:
          'x₂ = 3 − 6.65·1/(6.65 + 12.4) = 3 − 6.65/19.05 ≈ 2.65091864.',
      },
      {
        id: 'sec-e3-q2',
        tipo: 'opcion-multiple',
        enunciado: '¿Qué ocurre si se usan las semillas x₀ = 3 y x₁ = 4?',
        opciones: [
          { id: 'a', texto: 'El método cae en la otra raíz, 4.70478842.' },
          { id: 'b', texto: 'El método diverge porque no hay cambio de signo.' },
          { id: 'c', texto: 'Devuelve la misma raíz 2.54174957.' },
          { id: 'd', texto: 'Se detiene porque π(3) y π(4) tienen signos opuestos.' },
        ],
        correcta: 'a',
        explicacion:
          'Las semillas eligen la cuenca. Con 3 y 4 la Secante se dirige a la segunda raíz del polinomio.',
      },
      {
        id: 'sec-e3-q3',
        tipo: 'opcion-multiple',
        enunciado: '¿Cuál es el costo de no necesitar la derivada?',
        opciones: [
          { id: 'a', texto: 'Hacen falta dos semillas y el método puede divergir.' },
          { id: 'b', texto: 'Hay que evaluar f′ en cada paso.' },
          { id: 'c', texto: 'Solo funciona con funciones lineales.' },
          { id: 'd', texto: 'Necesita un intervalo con cambio de signo.' },
        ],
        correcta: 'a',
        explicacion:
          'La Secante cambia la derivada por una diferencia finita: gana no derivar, pero paga con dos semillas y menor robustez.',
      },
    ],
    resolucion: {
      valorCorrecto: 2.5417495868,
      tolerancia: 0.0001,
      etiqueta: 'x',
      respuestaFinalTexto: 'x ≈ 2.541750 (primer equilibrio), en 5 iteraciones desde 2 y 3.',
    },
  },
};
