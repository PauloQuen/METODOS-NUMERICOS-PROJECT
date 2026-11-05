import type { EjercicioBase } from '../../../../../shared/models/metodo.model';

/**
 * ACTIVIDADES DE AUTOEVALUACIÓN DE CARDANO.
 *
 * · (x+1)³ = 0                  → raíz triple x = −1
 * · 2x³ + 3x² − 11x − 6 = 0      → raíces −3, −0.5 y 2
 * · t³ − 6t² + 11t − 6 = 0       → raíces 1, 2 y 3
 */
export type ActividadesAuto = Pick<
  EjercicioBase,
  'cuestionario' | 'resolucion' | 'formatoRespuesta' | 'desbloqueo'
>;

export const AUTOEVALUACION_CARDANO: Record<string, ActividadesAuto> = {
  'cardano-ejercicio-triple': {
    formatoRespuesta: 'escalar',
    cuestionario: [
      {
        id: 'car-e1-q1',
        tipo: 'opcion-multiple',
        enunciado:
          'Para x³ + 3x² + 3x + 1 = 0, ¿cuánto vale el desplazamiento m = −b/(3a)?',
        opciones: [
          { id: 'a', texto: '−1' },
          { id: 'b', texto: '1' },
          { id: 'c', texto: '3' },
          { id: 'd', texto: '0' },
        ],
        correcta: 'a',
        explicacion: 'a = 1 y b = 3, así que m = −3/3 = −1. Ese desplazamiento elimina el término cuadrático.',
      },
      {
        id: 'car-e1-q2',
        tipo: 'opcion-multiple',
        enunciado: 'Si Δ = 0 y además p = q = 0, ¿qué naturaleza tiene la raíz?',
        opciones: [
          { id: 'a', texto: 'Raíz triple: las tres raíces coinciden.' },
          { id: 'b', texto: 'Una raíz real y dos complejas.' },
          { id: 'c', texto: 'Tres raíces reales distintas.' },
          { id: 'd', texto: 'No hay raíces reales.' },
        ],
        correcta: 'a',
        explicacion:
          'La deprimida queda t³ = 0, cuya única raíz es t = 0 con multiplicidad 3.',
      },
      {
        id: 'car-e1-q3',
        tipo: 'opcion-multiple',
        enunciado: 'La raíz x = −1 con multiplicidad 3 significa que…',
        opciones: [
          { id: 'a', texto: 'el polinomio se factoriza como (x + 1)³ y se anula solo en x = −1.' },
          { id: 'b', texto: 'hay tres raíces reales diferentes.' },
          { id: 'c', texto: 'el polinomio no se puede factorizar.' },
          { id: 'd', texto: 'x = −1 es una raíz simple.' },
        ],
        correcta: 'a',
        explicacion:
          'Multiplicidad 3 quiere decir que el factor (x + 1) aparece tres veces; las tres raíces son el mismo número.',
      },
    ],
    resolucion: {
      valorCorrecto: -1,
      tolerancia: 0.000001,
      etiqueta: 'x',
      respuestaFinalTexto: 'x = −1, raíz triple: (x + 1)³ = 0.',
    },
  },

  'cardano-ejercicio-a-diferente': {
    formatoRespuesta: 'vector',
    cuestionario: [
      {
        id: 'car-e2-q1',
        tipo: 'opcion-multiple',
        enunciado: 'Para 2x³ + 3x² − 11x − 6 = 0, ¿cuánto vale m = −b/(3a)?',
        opciones: [
          { id: 'a', texto: '−0.5' },
          { id: 'b', texto: '0.5' },
          { id: 'c', texto: '−1' },
          { id: 'd', texto: '2' },
        ],
        correcta: 'a',
        explicacion: 'a = 2 y b = 3, así que m = −3/(3·2) = −0.5.',
      },
      {
        id: 'car-e2-q2',
        tipo: 'opcion-multiple',
        enunciado: 'En Cardano, Δ < 0 indica que…',
        opciones: [
          { id: 'a', texto: 'hay tres raíces reales (caso trigonométrico de Viète).' },
          { id: 'b', texto: 'hay una sola raíz real.' },
          { id: 'c', texto: 'no hay raíces reales.' },
          { id: 'd', texto: 'la raíz es doble.' },
        ],
        correcta: 'a',
        explicacion:
          'Con Δ < 0 las tres raíces son reales; se calculan con cosenos. Con Δ > 0 hay una real y dos complejas.',
      },
      {
        id: 'car-e2-q3',
        tipo: 'opcion-multiple',
        enunciado: 'Las raíces son −3, −0.5 y 2. ¿Cómo se comprueba?',
        opciones: [
          { id: 'a', texto: 'Sustituyendo cada valor en el polinomio o factorizando 2(x+3)(x+0.5)(x−2).' },
          { id: 'b', texto: 'Sumando las tres raíces y dividiendo por 3.' },
          { id: 'c', texto: 'Evaluando solo en x = 0.' },
          { id: 'd', texto: 'Derivando el polinomio.' },
        ],
        correcta: 'a',
        explicacion:
          'Si el factorizado es correcto, cada raíz anula uno de los factores y por lo tanto anula el polinomio.',
      },
    ],
    resolucion: {
      valorCorrecto: [-3, -0.5, 2],
      tolerancia: 0.000001,
      etiqueta: 'raíces (x₁; x₂; x₃)',
      respuestaFinalTexto: 'Raíces: −3, −0.5 y 2; factorizado 2(x + 3)(x + 0.5)(x − 2).',
    },
  },

  'cardano-ejercicio-dron': {
    formatoRespuesta: 'vector',
    cuestionario: [
      {
        id: 'car-e3-q1',
        tipo: 'opcion-multiple',
        enunciado: 'Para t³ − 6t² + 11t − 6 = 0, ¿cuánto vale m = −b/(3a)?',
        opciones: [
          { id: 'a', texto: '2' },
          { id: 'b', texto: '−2' },
          { id: 'c', texto: '6' },
          { id: 'd', texto: '1' },
        ],
        correcta: 'a',
        explicacion: 'a = 1 y b = −6, así que m = −(−6)/3 = 2.',
      },
      {
        id: 'car-e3-q2',
        tipo: 'opcion-multiple',
        enunciado: 'En este caso q = 0. ¿Cómo queda la cúbica deprimida?',
        opciones: [
          { id: 'a', texto: 't³ + p·t = t(t² + p) = 0.' },
          { id: 'b', texto: 't³ + q = 0.' },
          { id: 'c', texto: 't² + p·t + q = 0.' },
          { id: 'd', texto: 't³ + p·t + q no se puede resolver.' },
        ],
        correcta: 'a',
        explicacion:
          'Al anularse q, la deprimida queda t(t² + p) = 0: una raíz es t = 0 y las otras salen de t² = −p.',
      },
      {
        id: 'car-e3-q3',
        tipo: 'opcion-multiple',
        enunciado: 'Las raíces 1, 2 y 3 segundos representan…',
        opciones: [
          { id: 'a', texto: 'los instantes en que la altura del dron es cero.' },
          { id: 'b', texto: 'los instantes de altura máxima.' },
          { id: 'c', texto: 'las velocidades del dron.' },
          { id: 'd', texto: 'los coeficientes del polinomio.' },
        ],
        correcta: 'a',
        explicacion:
          'Se resolvió h(t) = 0; cada raíz es un tiempo en que el dron toca la altura cero.',
      },
    ],
    resolucion: {
      valorCorrecto: [1, 2, 3],
      tolerancia: 0.000001,
      etiqueta: 'raíces (t₁; t₂; t₃)',
      respuestaFinalTexto: 'Raíces: 1, 2 y 3 segundos; h(1) = h(2) = h(3) = 0.',
    },
  },
};
