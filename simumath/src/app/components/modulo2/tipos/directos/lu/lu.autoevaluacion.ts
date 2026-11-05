import type { EjercicioBase } from '../../../../../shared/models/metodo.model';

/**
 * ACTIVIDADES DE AUTOEVALUACIÓN DE FACTORIZACIÓN LU.
 *
 * · Sistema 2×2 → (x₁, x₂) = (2, 2)
 * · Sistema 2×2 con m = 1/3 → (1.8, 2.6)
 * · Sistema 3×3 → (3.125, 0.375, 2.125)
 */
export type ActividadesAuto = Pick<
  EjercicioBase,
  'cuestionario' | 'resolucion' | 'formatoRespuesta' | 'desbloqueo'
>;

export const AUTOEVALUACION_LU: Record<string, ActividadesAuto> = {
  'lu-ex-1': {
    formatoRespuesta: 'vector',
    cuestionario: [
      {
        id: 'lu-e1-q1',
        tipo: 'opcion-multiple',
        enunciado: 'Para A = [[2, 1], [1, 1]], ¿cuánto vale el multiplicador m₂₁?',
        opciones: [
          { id: 'a', texto: '0.5' },
          { id: 'b', texto: '2' },
          { id: 'c', texto: '1' },
          { id: 'd', texto: '0.25' },
        ],
        correcta: 'a',
        explicacion: 'm₂₁ = a₂₁/a₁₁ = 1/2 = 0.5. Ese valor se guarda en L.',
      },
      {
        id: 'lu-e1-q2',
        tipo: 'opcion-multiple',
        enunciado: '¿Qué guarda la matriz L de la factorización A = L·U?',
        opciones: [
          { id: 'a', texto: 'Los multiplicadores usados durante la eliminación.' },
          { id: 'b', texto: 'Las soluciones del sistema.' },
          { id: 'c', texto: 'El lado derecho b.' },
          { id: 'd', texto: 'La inversa de A.' },
        ],
        correcta: 'a',
        explicacion:
          'L es triangular inferior con unos en la diagonal; debajo guarda los multiplicadores de cada eliminación.',
      },
      {
        id: 'lu-e1-q3',
        tipo: 'opcion-multiple',
        enunciado: 'La solución (2, 2) se verifica con…',
        opciones: [
          { id: 'a', texto: '2·2 + 2 = 6 y 2 + 2 = 4: satisface ambas ecuaciones.' },
          { id: 'b', texto: 'la suma de los coeficientes de L.' },
          { id: 'c', texto: 'el determinante de U solamente.' },
          { id: 'd', texto: 'el valor de m₂₁.' },
        ],
        correcta: 'a',
        explicacion:
          'Sustituir la solución en el sistema original es la comprobación directa; el residuo máximo es cero.',
      },
    ],
    resolucion: {
      valorCorrecto: [2, 2],
      tolerancia: 0.000000001,
      etiqueta: 'solución (x₁; x₂)',
      respuestaFinalTexto: 'x₁ = 2, x₂ = 2; residuo ‖Ax − b‖∞ = 0.',
    },
  },

  'lu-ex-2': {
    formatoRespuesta: 'vector',
    cuestionario: [
      {
        id: 'lu-e2-q1',
        tipo: 'opcion-multiple',
        enunciado: 'Para A = [[3, 1], [1, 2]], ¿cuánto vale m₂₁?',
        opciones: [
          { id: 'a', texto: '1/3 ≈ 0.3333' },
          { id: 'b', texto: '3' },
          { id: 'c', texto: '0.5' },
          { id: 'd', texto: '2' },
        ],
        correcta: 'a',
        explicacion: 'm₂₁ = 1/3. Conviene conservarlo como fracción o con suficientes decimales.',
      },
      {
        id: 'lu-e2-q2',
        tipo: 'opcion-multiple',
        enunciado: '¿Por qué no conviene redondear el multiplicador a 0.33?',
        opciones: [
          { id: 'a', texto: 'Porque el error se propaga en las sustituciones y desvía la solución.' },
          { id: 'b', texto: 'Porque L debe tener números enteros.' },
          { id: 'c', texto: 'Porque U dejaría de ser triangular.' },
          { id: 'd', texto: 'Porque el pivoteo fallaría.' },
        ],
        correcta: 'a',
        explicacion:
          'L y U se usan para resolver; un multiplicador redondeado contamina y y después x.',
      },
      {
        id: 'lu-e2-q3',
        tipo: 'opcion-multiple',
        enunciado: 'La solución (1.8, 2.6) es…',
        opciones: [
          { id: 'a', texto: 'la solución exacta del sistema; su residuo es cero.' },
          { id: 'b', texto: 'una aproximación con error apreciable.' },
          { id: 'c', texto: 'el resultado de redondear m₂₁ a 0.33.' },
          { id: 'd', texto: 'la solución de U·x = b, no del sistema original.' },
        ],
        correcta: 'a',
        explicacion:
          '3·1.8 + 2.6 = 8 y 1.8 + 2·2.6 = 7: satisface el sistema original.',
      },
    ],
    resolucion: {
      valorCorrecto: [1.8, 2.6],
      tolerancia: 0.000000001,
      etiqueta: 'solución (x₁; x₂)',
      respuestaFinalTexto: 'x₁ = 1.8, x₂ = 2.6; residuo ‖Ax − b‖∞ = 0.',
    },
  },

  'lu-ex-3': {
    formatoRespuesta: 'vector',
    cuestionario: [
      {
        id: 'lu-e3-q1',
        tipo: 'opcion-multiple',
        enunciado:
          'En la segunda columna, la fila 3 queda con −3 y el pivote es −5. ¿Cuánto vale m₃₂?',
        opciones: [
          { id: 'a', texto: '0.6' },
          { id: 'b', texto: '−0.6' },
          { id: 'c', texto: '1.6667' },
          { id: 'd', texto: '2' },
        ],
        correcta: 'a',
        explicacion: 'm₃₂ = −3/(−5) = 0.6. Se guarda en la posición (3,2) de L.',
      },
      {
        id: 'lu-e3-q2',
        tipo: 'opcion-multiple',
        enunciado: '¿Qué ventaja tiene LU frente a Gauss cuando se repite el mismo sistema?',
        opciones: [
          { id: 'a', texto: 'La descomposición se reutiliza para distintos lados derechos b.' },
          { id: 'b', texto: 'Nunca necesita sustitución hacia atrás.' },
          { id: 'c', texto: 'No requiere pivoteo.' },
          { id: 'd', texto: 'Siempre da enteros.' },
        ],
        correcta: 'a',
        explicacion:
          'A = L·U se calcula una vez; cada b nuevo solo pide dos sustituciones, no una nueva eliminación.',
      },
      {
        id: 'lu-e3-q3',
        tipo: 'opcion-multiple',
        enunciado: 'La solución (3.125, 0.375, 2.125) se comprueba…',
        opciones: [
          { id: 'a', texto: 'sustituyéndola en las tres ecuaciones del sistema original.' },
          { id: 'b', texto: 'multiplicando L por U.' },
          { id: 'c', texto: 'sumando las tres componentes.' },
          { id: 'd', texto: 'calculando el determinante de U.' },
        ],
        correcta: 'a',
        explicacion:
          'Cada ecuación debe satisfacerse; el residuo máximo quedó en cero.',
      },
    ],
    resolucion: {
      valorCorrecto: [3.125, 0.375, 2.125],
      tolerancia: 0.000000001,
      etiqueta: 'solución (x₁; x₂; x₃)',
      respuestaFinalTexto: 'x₁ = 3.125, x₂ = 0.375, x₃ = 2.125; residuo ‖Ax − b‖∞ = 0.',
    },
  },
};
