import type { EjercicioModulo3 } from '../../../modelos/modulo3.model';

/**
 * AUTOEVALUACIÓN DE MÍNIMOS CUADRADOS.
 *
 * Tres preguntas por ejercicio: una de cálculo con las fórmulas del
 * método, una conceptual sobre el ajuste y una de interpretación de r²,
 * del error estándar o de los coeficientes. Los valores de las
 * resoluciones se comprobaron con el algoritmo del método:
 *
 * · mc-ej-num-1: ŷ = −0.5 + 0.928571x → ŷ(3.5) = 2.75
 * · mc-ej-num-2: ŷ = 45.5 + 0.63x       → ŷ(35) = 67.55
 * · mc-ej-num-3: ŷ = 2.11 + 0.99x       → ŷ(4.5) = 6.565
 * · mc-ej-cas-1: C = 1630 + 7.7q        → C(350) = 4325
 * · mc-ej-cas-2: c = 11.64 − 0.012v     → c(90) = 10.56
 * · mc-ej-cas-3: P = −873.36 + 0.442t   → P(2030) = 23.9
 *
 * La tolerancia es 0.01 para todos: los datos tienen una o dos cifras
 * decimales y el redondeo del método no justifica un margen mayor.
 */
export type ActividadesAutoM3 = Pick<
  EjercicioModulo3,
  'cuestionario' | 'resolucion' | 'formatoRespuesta' | 'desbloqueo'
>;

export const AUTOEVALUACION_MINIMOS_CUADRADOS: Record<string, ActividadesAutoM3> = {
  'mc-ej-num-1': {
    formatoRespuesta: 'escalar',
    cuestionario: [
      {
        id: 'mc1-q1',
        tipo: 'opcion-multiple',
        enunciado: 'Con las sumatorias Σx = 21, Σy = 16.5, Σx² = 91 y Σxy = 74, ¿cuánto vale la pendiente a₁?',
        opciones: [
          { id: 'a', texto: '0.928571' },
          { id: 'b', texto: '0.5' },
          { id: 'c', texto: '2.75' },
          { id: 'd', texto: '−0.5' },
        ],
        correcta: 'a',
        explicacion:
          'a₁ = (nΣxy − ΣxΣy)/(nΣx² − (Σx)²) = (6·74 − 21·16.5)/(6·91 − 21²) = 97.5/105 ≈ 0.928571.',
      },
      {
        id: 'mc1-q2',
        tipo: 'opcion-multiple',
        enunciado: '¿Por qué la predicción en x = 3.5 coincide exactamente con el promedio de y?',
        opciones: [
          {
            id: 'a',
            texto: 'Porque 3.5 es x̄ y la recta de mínimos cuadrados siempre pasa por (x̄, ȳ).',
          },
          { id: 'b', texto: 'Porque la recta pasa por el primer punto de la tabla.' },
          { id: 'c', texto: 'Porque r² vale exactamente 1.' },
          { id: 'd', texto: 'Porque n = 6 es par.' },
        ],
        correcta: 'a',
        explicacion:
          'La recta ajustada cumple ŷ(x̄) = ȳ. Acá x̄ = 21/6 = 3.5 y ȳ = 16.5/6 = 2.75.',
      },
      {
        id: 'mc1-q3',
        tipo: 'opcion-multiple',
        enunciado: 'El ajuste da r² = 0.99435. ¿Cómo se interpreta?',
        opciones: [
          {
            id: 'a',
            texto: 'La recta explica aproximadamente el 99.4 % de la variación de y.',
          },
          { id: 'b', texto: 'Hay un 99.4 % de probabilidad de que el modelo sea correcto.' },
          { id: 'c', texto: 'El error estándar es 0.99435 en unidades de y.' },
          { id: 'd', texto: 'El 99.4 % de los puntos cae exactamente sobre la recta.' },
        ],
        correcta: 'a',
        explicacion:
          'r² es la proporción de la variabilidad de y explicada por la recta; no es una probabilidad ni una garantía de causalidad.',
      },
    ],
    resolucion: {
      valorCorrecto: 2.75,
      tolerancia: 0.01,
      etiqueta: 'ŷ(3.5)',
      respuestaFinalTexto: 'ŷ = −0.5 + 0.928571x; ŷ(3.5) = 2.75.',
    },
  },

  'mc-ej-num-2': {
    formatoRespuesta: 'escalar',
    cuestionario: [
      {
        id: 'mc2-q1',
        tipo: 'opcion-multiple',
        enunciado: 'Para los datos de temperatura y presión, ¿cuál es la pendiente de la recta ajustada?',
        opciones: [
          { id: 'a', texto: '0.63' },
          { id: 'b', texto: '45.5' },
          { id: 'c', texto: '6.3' },
          { id: 'd', texto: '0.063' },
        ],
        correcta: 'a',
        explicacion:
          'a₁ = (5·10290 − 150·322)/(5·5500 − 150²) = 3150/5000 = 0.63.',
      },
      {
        id: 'mc2-q2',
        tipo: 'opcion-multiple',
        enunciado: 'Con ŷ = 45.5 + 0.63x, ¿qué valor se predice para x = 35?',
        opciones: [
          { id: 'a', texto: '67.55' },
          { id: 'b', texto: '64.4' },
          { id: 'c', texto: '22.05' },
          { id: 'd', texto: '70.55' },
        ],
        correcta: 'a',
        explicacion: 'ŷ(35) = 45.5 + 0.63·35 = 45.5 + 22.05 = 67.55.',
      },
      {
        id: 'mc2-q3',
        tipo: 'opcion-multiple',
        enunciado: 'Los residuos son 0.2, −0.1, −0.4, 0.3 y 0. ¿Qué indica eso sobre el ajuste?',
        opciones: [
          {
            id: 'a',
            texto: 'Son pequeños y no muestran un patrón: la recta describe bien los datos.',
          },
          { id: 'b', texto: 'Tienen forma de U, así que la recta no sirve.' },
          { id: 'c', texto: 'Uno de ellos es negativo, así que el ajuste es inválido.' },
          { id: 'd', texto: 'La suma de residuos debe ser 1 para que el ajuste sea válido.' },
        ],
        correcta: 'a',
        explicacion:
          'Los residuos alternan signo y son del orden del error de medición; no hay un patrón sistemático que invalide el modelo.',
      },
    ],
    resolucion: {
      valorCorrecto: 67.55,
      tolerancia: 0.01,
      etiqueta: 'ŷ(35)',
      respuestaFinalTexto: 'ŷ = 45.5 + 0.63x; ŷ(35) = 67.55.',
    },
  },

  'mc-ej-num-3': {
    formatoRespuesta: 'escalar',
    cuestionario: [
      {
        id: 'mc3-q1',
        tipo: 'opcion-multiple',
        enunciado: '¿Cuánto vale la pendiente para los datos (1; 3.1), (2; 4.0), (3; 5.2), (4; 6.1) y (5; 7.0)?',
        opciones: [
          { id: 'a', texto: '0.99' },
          { id: 'b', texto: '2.11' },
          { id: 'c', texto: '5.08' },
          { id: 'd', texto: '1.0' },
        ],
        correcta: 'a',
        explicacion:
          'a₁ = (5·86.1 − 15·25.4)/(5·55 − 15²) = 49.5/50 = 0.99. La pendiente es cercana a 1, no exactamente 1.',
      },
      {
        id: 'mc3-q2',
        tipo: 'opcion-multiple',
        enunciado: 'Con ŷ = 2.11 + 0.99x, ¿qué se predice en x = 4.5?',
        opciones: [
          { id: 'a', texto: '6.565' },
          { id: 'b', texto: '6.10' },
          { id: 'c', texto: '7.00' },
          { id: 'd', texto: '4.455' },
        ],
        correcta: 'a',
        explicacion: 'ŷ(4.5) = 2.11 + 0.99·4.5 = 2.11 + 4.455 = 6.565.',
      },
      {
        id: 'mc3-q3',
        tipo: 'opcion-multiple',
        enunciado: 'El error estándar de la estimación es 0.0949. ¿Qué mide?',
        opciones: [
          {
            id: 'a',
            texto: 'El tamaño típico de los residuos, en las mismas unidades que y.',
          },
          { id: 'b', texto: 'La proporción de variación explicada por la recta.' },
          { id: 'c', texto: 'La pendiente expresada en porcentaje.' },
          { id: 'd', texto: 'La probabilidad de que la recta pase por todos los puntos.' },
        ],
        correcta: 'a',
        explicacion:
          'El error estándar es √(Σresiduos²/(n−2)) y se mide en unidades de y; r² es el que mide la proporción explicada.',
      },
    ],
    resolucion: {
      valorCorrecto: 6.565,
      tolerancia: 0.01,
      etiqueta: 'ŷ(4.5)',
      respuestaFinalTexto: 'ŷ = 2.11 + 0.99x; ŷ(4.5) = 6.565.',
    },
  },

  'mc-ej-cas-1': {
    formatoRespuesta: 'escalar',
    cuestionario: [
      {
        id: 'mc4-q1',
        tipo: 'opcion-multiple',
        enunciado: 'En el ajuste C = 1630 + 7.7q, ¿qué significa la pendiente 7.7?',
        opciones: [
          { id: 'a', texto: 'El costo variable por unidad producida, en soles.' },
          { id: 'b', texto: 'El costo fijo mensual de la planta.' },
          { id: 'c', texto: 'La producción total del mes.' },
          { id: 'd', texto: 'El error estándar del ajuste.' },
        ],
        correcta: 'a',
        explicacion:
          'La pendiente es el cambio de C por cada unidad extra de q: el costo marginal. El intercepto es el costo fijo.',
      },
      {
        id: 'mc4-q2',
        tipo: 'opcion-multiple',
        enunciado: '¿Qué representa a₀ = 1630 en este modelo de costos?',
        opciones: [
          { id: 'a', texto: 'El costo fijo: lo que se paga aunque no se produzca nada.' },
          { id: 'b', texto: 'El costo de producir 1630 unidades.' },
          { id: 'c', texto: 'El costo variable por unidad.' },
          { id: 'd', texto: 'La producción donde el costo es cero.' },
        ],
        correcta: 'a',
        explicacion:
          'a₀ es el valor de C cuando q = 0. En el contexto del ejercicio, ese es el costo fijo de la planta.',
      },
      {
        id: 'mc4-q3',
        tipo: 'opcion-multiple',
        enunciado: '¿Cuál es el costo estimado para 350 unidades?',
        opciones: [
          { id: 'a', texto: '4325 soles' },
          { id: 'b', texto: '3940 soles' },
          { id: 'c', texto: '2695 soles' },
          { id: 'd', texto: '3500 soles' },
        ],
        correcta: 'a',
        explicacion: 'C(350) = 1630 + 7.7·350 = 1630 + 2695 = 4325 soles.',
      },
    ],
    resolucion: {
      valorCorrecto: 4325,
      tolerancia: 0.01,
      etiqueta: 'C(350)',
      respuestaFinalTexto: 'C = 1630 + 7.7q; C(350) = 4325 soles.',
    },
  },

  'mc-ej-cas-2': {
    formatoRespuesta: 'escalar',
    cuestionario: [
      {
        id: 'mc5-q1',
        tipo: 'opcion-multiple',
        enunciado: 'La recta ajustada es c = 11.64 − 0.012v. ¿Qué indica el signo negativo de la pendiente?',
        opciones: [
          {
            id: 'a',
            texto: 'Que, según la recta, el consumo baja 0.012 L/100 km por cada km/h adicional.',
          },
          { id: 'b', texto: 'Que el consumo no depende de la velocidad.' },
          { id: 'c', texto: 'Que la recta pasa por el origen.' },
          { id: 'd', texto: 'Que r² es negativo.' },
        ],
        correcta: 'a',
        explicacion:
          'La pendiente es la variación media de c por unidad de v. El signo negativo describe una tendencia descendente en el rango ajustado.',
      },
      {
        id: 'mc5-q2',
        tipo: 'opcion-multiple',
        enunciado: 'El ajuste da r² = 0.0869 y los residuos forman una U. ¿Cuál es la conclusión correcta?',
        opciones: [
          {
            id: 'a',
            texto: 'El modelo lineal no es adecuado: la relación es curva y la recta no captura el patrón.',
          },
          { id: 'b', texto: 'El modelo es excelente porque r² es positivo.' },
          { id: 'c', texto: 'Basta con cambiar el signo de la pendiente para corregirlo.' },
          { id: 'd', texto: 'El problema es que faltan más decimales en los datos.' },
        ],
        correcta: 'a',
        explicacion:
          'r² bajo y residuos con patrón sistemático son la señal clásica de un modelo mal especificado. No se arregla cambiando el signo.',
      },
      {
        id: 'mc5-q3',
        tipo: 'opcion-multiple',
        enunciado: '¿Qué harías para modelar mejor el consumo en función de la velocidad?',
        opciones: [
          {
            id: 'a',
            texto: 'Probar un ajuste polinómico (por ejemplo, cuadrático) o un modelo físico.',
          },
          { id: 'b', texto: 'Forzar la recta a pasar por el punto de menor consumo.' },
          { id: 'c', texto: 'Eliminar los puntos de 40 y 120 km/h para que quede lineal.' },
          { id: 'd', texto: 'Usar la misma recta, porque r² no importa.' },
        ],
        correcta: 'a',
        explicacion:
          'La forma en U pide un término cuadrático o un modelo con fundamento físico; eliminar datos solo esconde el problema.',
      },
    ],
    resolucion: {
      valorCorrecto: 10.56,
      tolerancia: 0.01,
      etiqueta: 'c(90)',
      respuestaFinalTexto:
        'c = 11.64 − 0.012v; c(90) = 10.56 L/100 km. El modelo lineal no es válido: r² = 0.0869 y residuos en U.',
    },
  },

  'mc-ej-cas-3': {
    formatoRespuesta: 'escalar',
    cuestionario: [
      {
        id: 'mc6-q1',
        tipo: 'opcion-multiple',
        enunciado: 'La recta ajustada es P = −873.36 + 0.442t. ¿Qué significa 0.442?',
        opciones: [
          { id: 'a', texto: 'Un crecimiento medio de 0.442 miles de habitantes por año (442 por año).' },
          { id: 'b', texto: 'La población en el año 2030.' },
          { id: 'c', texto: 'La población en el año 0.' },
          { id: 'd', texto: 'El error estándar de la proyección.' },
        ],
        correcta: 'a',
        explicacion:
          'La pendiente es el cambio medio de P por año: 0.442 miles de habitantes anuales, es decir, 442 habitantes por año.',
      },
      {
        id: 'mc6-q2',
        tipo: 'opcion-multiple',
        enunciado: '¿Cuál es la proyección para 2030?',
        opciones: [
          { id: 'a', texto: '23.9 miles de habitantes' },
          { id: 'b', texto: '18.375 miles de habitantes' },
          { id: 'c', texto: '897.26 miles de habitantes' },
          { id: 'd', texto: '21.8 miles de habitantes' },
        ],
        correcta: 'a',
        explicacion: 'P(2030) = −873.36 + 0.442·2030 = −873.36 + 897.26 = 23.9.',
      },
      {
        id: 'mc6-q3',
        tipo: 'opcion-multiple',
        enunciado: 'El intercepto es −873.36. ¿Cómo se interpreta?',
        opciones: [
          {
            id: 'a',
            texto: 'No tiene sentido físico: es una extrapolación al año 0; solo la pendiente se interpreta.',
          },
          { id: 'b', texto: 'La población en el año 0 era negativa, así que el modelo está mal.' },
          { id: 'c', texto: 'La población disminuye 873.36 habitantes por año.' },
          { id: 'd', texto: 'El modelo predice 873.36 habitantes en 2030.' },
        ],
        correcta: 'a',
        explicacion:
          'El intercepto es el valor de la recta en t = 0, muy lejos del rango de datos. En una regresión con años, el intercepto suele no ser interpretable; la pendiente sí.',
      },
    ],
    resolucion: {
      valorCorrecto: 23.9,
      tolerancia: 0.01,
      etiqueta: 'P(2030)',
      respuestaFinalTexto: 'P = −873.36 + 0.442t; P(2030) = 23.9 miles de habitantes.',
    },
  },
};
