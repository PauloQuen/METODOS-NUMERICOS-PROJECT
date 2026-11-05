import type { EjercicioBase } from '../../../../../shared/models/metodo.model';

/**
 * ACTIVIDADES DE AUTOEVALUACIÓN DE PUNTO FIJO.
 *
 * Valores de control:
 * · √(15 − 2x) = x          → x = 3
 * · eˣ/3 = x                → x = 0.6190612867
 * · √(0.5·(2 − x)) = x      → x = 0.7807764064
 */
export type ActividadesAuto = Pick<
  EjercicioBase,
  'cuestionario' | 'resolucion' | 'formatoRespuesta' | 'desbloqueo'
>;

export const AUTOEVALUACION_PUNTO_FIJO: Record<string, ActividadesAuto> = {
  'punto-fijo-ejercicio-1': {
    formatoRespuesta: 'escalar',
    cuestionario: [
      {
        id: 'pf-e1-q1',
        tipo: 'opcion-multiple',
        enunciado: 'Para g(x) = √(15 − 2x) y x₀ = 4, ¿cuánto vale g(4)?',
        opciones: [
          { id: 'a', texto: '2.6458' },
          { id: 'b', texto: '3' },
          { id: 'c', texto: '3.5' },
          { id: 'd', texto: '2.0' },
        ],
        correcta: 'a',
        explicacion: 'g(4) = √(15 − 8) = √7 ≈ 2.64575131.',
      },
      {
        id: 'pf-e1-q2',
        tipo: 'opcion-multiple',
        enunciado: '¿Qué condición suficiente garantiza la convergencia local del Punto Fijo?',
        opciones: [
          { id: 'a', texto: '|g′(x*)| < 1 en un entorno de la raíz.' },
          { id: 'b', texto: '|g′(x*)| > 1 en un entorno de la raíz.' },
          { id: 'c', texto: 'Que g sea siempre positiva.' },
          { id: 'd', texto: 'Que el intervalo mida 1.' },
        ],
        correcta: 'a',
        explicacion:
          'Si la derivada de la reescritura es menor que 1 en módulo, la iteración contrae el error y converge.',
      },
      {
        id: 'pf-e1-q3',
        tipo: 'opcion-multiple',
        enunciado: 'La ecuación tiene raíces 3 y −5. ¿Por qué esta reescritura solo alcanza la 3?',
        opciones: [
          { id: 'a', texto: 'Porque √(15 − 2x) exige x ≤ 7.5 y su punto fijo atractor es 3.' },
          { id: 'b', texto: 'Porque −5 no es una raíz real.' },
          { id: 'c', texto: 'Porque g′(3) > 1 y repele a −5.' },
          { id: 'd', texto: 'Porque el método siempre busca la raíz positiva.' },
        ],
        correcta: 'a',
        explicacion:
          'La reescritura define un dominio y una cuenca; la raíz −5 queda fuera del camino de esta g.',
      },
    ],
    resolucion: {
      valorCorrecto: 3,
      tolerancia: 0.0001,
      etiqueta: 'x',
      respuestaFinalTexto: 'x ≈ 3.000018, en 10 iteraciones desde x₀ = 4.',
    },
  },

  'punto-fijo-ejercicio-2': {
    formatoRespuesta: 'escalar',
    cuestionario: [
      {
        id: 'pf-e2-q1',
        tipo: 'opcion-multiple',
        enunciado: 'Para g(x) = eˣ/3 y x₀ = 0.5, ¿cuánto vale g(0.5)?',
        opciones: [
          { id: 'a', texto: '0.5496' },
          { id: 'b', texto: '0.6191' },
          { id: 'c', texto: '1.6487' },
          { id: 'd', texto: '0.5' },
        ],
        correcta: 'a',
        explicacion: 'g(0.5) = e^0.5/3 = 1.64872127/3 ≈ 0.54957376.',
      },
      {
        id: 'pf-e2-q2',
        tipo: 'opcion-multiple',
        enunciado:
          'g′(x) = eˣ/3. ¿Cuál de las dos raíces (0.619 y 1.512) atrae a la iteración?',
        opciones: [
          { id: 'a', texto: '0.619, porque allí |g′| ≈ 0.619 < 1; en 1.512 |g′| ≈ 1.512 > 1.' },
          { id: 'b', texto: '1.512, porque es la raíz más grande.' },
          { id: 'c', texto: 'Las dos por igual.' },
          { id: 'd', texto: 'Ninguna: el método diverge.' },
        ],
        correcta: 'a',
        explicacion:
          'La condición de contracción se cumple solo en la raíz chica. En la grande, la derivada mayor que 1 repele.',
      },
      {
        id: 'pf-e2-q3',
        tipo: 'opcion-multiple',
        enunciado: 'La convergencia es lineal con factor ≈ 0.619. ¿Qué significa?',
        opciones: [
          { id: 'a', texto: 'Cada iteración multiplica el error por 0.619, aproximadamente.' },
          { id: 'b', texto: 'El error se eleva al cuadrado en cada paso.' },
          { id: 'c', texto: 'El método llega en 3 iteraciones.' },
          { id: 'd', texto: 'El error se mantiene constante.' },
        ],
        correcta: 'a',
        explicacion:
          'En convergencia lineal, el error nuevo es aproximadamente |g′(x*)| veces el anterior. Acá, 0.619.',
      },
    ],
    resolucion: {
      valorCorrecto: 0.6190612867,
      tolerancia: 0.0001,
      etiqueta: 'x',
      respuestaFinalTexto: 'x ≈ 0.618936, que converge a 0.6190612867 en 14 iteraciones.',
    },
  },

  'punto-fijo-ejercicio-3': {
    formatoRespuesta: 'escalar',
    cuestionario: [
      {
        id: 'pf-e3-q1',
        tipo: 'opcion-multiple',
        enunciado:
          'Para g(x) = √(0.5·(2 − x)) y x₀ = 1, ¿cuánto vale g(1)?',
        opciones: [
          { id: 'a', texto: '0.7071' },
          { id: 'b', texto: '1' },
          { id: 'c', texto: '0.5' },
          { id: 'd', texto: '0.7808' },
        ],
        correcta: 'a',
        explicacion: 'g(1) = √(0.5·1) = √0.5 ≈ 0.70710678.',
      },
      {
        id: 'pf-e3-q2',
        tipo: 'opcion-multiple',
        enunciado: '¿Por qué la iteración respeta el rango físico 0 ≤ x ≤ 2?',
        opciones: [
          { id: 'a', texto: 'Porque la raíz cuadrada y el factor 0.5·(2 − x) obligan x ≤ 2.' },
          { id: 'b', texto: 'Porque la semilla es 1.' },
          { id: 'c', texto: 'Porque g′(x) es negativa.' },
          { id: 'd', texto: 'Porque el método detecta el rango automáticamente.' },
        ],
        correcta: 'a',
        explicacion:
          'El radicando 0.5·(2 − x) solo es no negativo para x ≤ 2; la propia reescritura impone el límite.',
      },
      {
        id: 'pf-e3-q3',
        tipo: 'opcion-multiple',
        enunciado: 'El valor x ≈ 0.78078 mol/L representa…',
        opciones: [
          { id: 'a', texto: 'la concentración de A libre en el equilibrio del reactor.' },
          { id: 'b', texto: 'la concentración total de A cargada al reactor.' },
          { id: 'c', texto: 'la constante de equilibrio K.' },
          { id: 'd', texto: 'la concentración de A₂ en el equilibrio.' },
        ],
        correcta: 'a',
        explicacion:
          'x es [A] en equilibrio. [A₂] se obtiene del balance, (2 − x)/2, y K es el dato 1 L/mol.',
      },
    ],
    resolucion: {
      valorCorrecto: 0.7807764064,
      tolerancia: 0.0001,
      etiqueta: 'x',
      respuestaFinalTexto: 'x ≈ 0.780776 mol/L, en 9 iteraciones desde x₀ = 1.',
    },
  },
};
