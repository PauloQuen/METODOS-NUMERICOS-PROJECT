import type { EjercicioBase } from '../../../../../shared/models/metodo.model';

/**
 * ACTIVIDADES DE AUTOEVALUACIÓN DE ELIMINACIÓN GAUSSIANA.
 *
 * · Sistema 2×2  → (x₁, x₂) = (2, 3)
 * · Sistema 3×3  → (x₁, x₂, x₃) = (1, 2, 3)
 * · Sistema singular → sin solución única; solo cuestionario.
 */
export type ActividadesAuto = Pick<
  EjercicioBase,
  'cuestionario' | 'resolucion' | 'formatoRespuesta' | 'desbloqueo'
>;

export const AUTOEVALUACION_GAUSS: Record<string, ActividadesAuto> = {
  'gauss-ex-1': {
    formatoRespuesta: 'vector',
    cuestionario: [
      {
        id: 'gau-e1-q1',
        tipo: 'opcion-multiple',
        enunciado: 'Después de triangular el sistema 2×2, ¿cuánto vale x₂?',
        opciones: [
          { id: 'a', texto: '3' },
          { id: 'b', texto: '2' },
          { id: 'c', texto: '−3' },
          { id: 'd', texto: '1' },
        ],
        correcta: 'a',
        explicacion:
          'La segunda fila queda −2.3333·x₂ = −7, así que x₂ = 3. Después x₁ = (12 − 2·3)/3 = 2.',
      },
      {
        id: 'gau-e1-q2',
        tipo: 'opcion-multiple',
        enunciado: '¿Por qué no hubo pivoteo en la primera columna?',
        opciones: [
          { id: 'a', texto: 'Porque |3| es mayor que |2| y ya está en la fila 1.' },
          { id: 'b', texto: 'Porque la matriz es simétrica.' },
          { id: 'c', texto: 'Porque el determinante es cero.' },
          { id: 'd', texto: 'Porque el pivoteo solo se usa en matrices 3×3.' },
        ],
        correcta: 'a',
        explicacion:
          'El pivoteo parcial elige el mayor valor absoluto de la columna. Si ya está arriba, no hay intercambio.',
      },
      {
        id: 'gau-e1-q3',
        tipo: 'opcion-multiple',
        enunciado: 'La solución (2, 3) significa que…',
        opciones: [
          { id: 'a', texto: 'es el punto donde se cortan las dos rectas del sistema.' },
          { id: 'b', texto: 'es el pivote de la matriz.' },
          { id: 'c', texto: 'es el residuo del sistema.' },
          { id: 'd', texto: 'es la suma de los coeficientes de A.' },
        ],
        correcta: 'a',
        explicacion:
          'Cada ecuación es una recta; la solución del sistema es su intersección. El residuo ‖Ax − b‖∞ quedó en cero.',
      },
    ],
    resolucion: {
      valorCorrecto: [2, 3],
      tolerancia: 0.000000001,
      etiqueta: 'solución (x₁; x₂)',
      respuestaFinalTexto: 'x₁ = 2, x₂ = 3; residuo ‖Ax − b‖∞ = 0.',
    },
  },

  'gauss-ex-2': {
    formatoRespuesta: 'vector',
    cuestionario: [
      {
        id: 'gau-e2-q1',
        tipo: 'opcion-multiple',
        enunciado:
          'En la primera columna los valores son 0, 1 y −1. ¿Qué fila se usa como pivote?',
        opciones: [
          { id: 'a', texto: 'La fila 2, porque |1| es el mayor valor absoluto.' },
          { id: 'b', texto: 'La fila 1, porque está arriba.' },
          { id: 'c', texto: 'La fila 3, porque tiene un −1.' },
          { id: 'd', texto: 'No se puede pivotear.' },
        ],
        correcta: 'a',
        explicacion:
          'El pivoteo parcial compara |0|, |1| y |−1|: hay empate entre las filas 2 y 3, y se elige la primera de ellas.',
      },
      {
        id: 'gau-e2-q2',
        tipo: 'opcion-multiple',
        enunciado: '¿Para qué sirve el pivoteo parcial?',
        opciones: [
          { id: 'a', texto: 'Para usar el pivote más grande y reducir la amplificación de errores.' },
          { id: 'b', texto: 'Para cambiar la solución del sistema.' },
          { id: 'c', texto: 'Para evitar la sustitución hacia atrás.' },
          { id: 'd', texto: 'Para convertir la matriz en simétrica.' },
        ],
        correcta: 'a',
        explicacion:
          'Dividir por un pivote chico amplifica errores de redondeo. Elegir el mayor valor absoluto es más estable.',
      },
      {
        id: 'gau-e2-q3',
        tipo: 'opcion-multiple',
        enunciado: 'La solución (1, 2, 3) se comprueba…',
        opciones: [
          { id: 'a', texto: 'sustituyéndola en las tres ecuaciones originales.' },
          { id: 'b', texto: 'sumando los tres valores.' },
          { id: 'c', texto: 'multiplicando la matriz por su traspuesta.' },
          { id: 'd', texto: 'calculando el determinante de A.' },
        ],
        correcta: 'a',
        explicacion:
          'Cada ecuación debe dar el lado derecho correspondiente; además el residuo máximo es cero.',
      },
    ],
    resolucion: {
      valorCorrecto: [1, 2, 3],
      tolerancia: 0.000000001,
      etiqueta: 'solución (x₁; x₂; x₃)',
      respuestaFinalTexto: 'x₁ = 1, x₂ = 2, x₃ = 3; residuo ‖Ax − b‖∞ = 0.',
    },
  },

  'gauss-ex-3': {
    formatoRespuesta: 'escalar',
    cuestionario: [
      {
        id: 'gau-e3-q1',
        tipo: 'opcion-multiple',
        enunciado:
          'Al eliminar la primera columna del sistema x₁ + 2x₂ = 3; 2x₁ + 4x₂ = 6, ¿qué queda en la última fila?',
        opciones: [
          { id: 'a', texto: '[0 0 | 0]' },
          { id: 'b', texto: '[0 0 | 6]' },
          { id: 'c', texto: '[2 4 | 6]' },
          { id: 'd', texto: '[1 2 | 3]' },
        ],
        correcta: 'a',
        explicacion:
          'La segunda ecuación es el doble de la primera; al restarle 2 veces la fila 1 queda toda en ceros.',
      },
      {
        id: 'gau-e3-q2',
        tipo: 'opcion-multiple',
        enunciado: '¿Qué significa que el último pivote sea cero?',
        opciones: [
          { id: 'a', texto: 'Que la matriz es singular y el sistema no tiene solución única.' },
          { id: 'b', texto: 'Que la solución es (0, 0).' },
          { id: 'c', texto: 'Que el método necesita más iteraciones.' },
          { id: 'd', texto: 'Que el residuo es distinto de cero.' },
        ],
        correcta: 'a',
        explicacion:
          'Sin un pivote válido no se puede despejar la última incógnita; el sistema es singular.',
      },
      {
        id: 'gau-e3-q3',
        tipo: 'opcion-multiple',
        enunciado: 'Las dos ecuaciones son proporcionales. ¿Cuántas soluciones tiene el sistema?',
        opciones: [
          { id: 'a', texto: 'Infinitas: todos los puntos de la recta x₁ + 2x₂ = 3.' },
          { id: 'b', texto: 'Exactamente una.' },
          { id: 'c', texto: 'Ninguna.' },
          { id: 'd', texto: 'Exactamente dos.' },
        ],
        correcta: 'a',
        explicacion:
          'Las dos rectas coinciden; cualquier punto de esa recta satisface ambas ecuaciones.',
      },
    ],
  },
};
