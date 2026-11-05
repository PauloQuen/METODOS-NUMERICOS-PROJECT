import type { EjercicioBase } from '../../../../../shared/models/metodo.model';

/**
 * ACTIVIDADES DE AUTOEVALUACIÓN DE BISECCIÓN.
 *
 * El ejercicio 1 ya trae su cuestionario en `biseccion.contenido.ts`;
 * acá están el 2 y el 3. Cada valor se comprobó con la raíz exacta:
 * · ln(x+1) − 3 = 0 → x = e³ − 1 = 19.0855369232
 * · x·eˣ − 5 = 0     → x = W(5)   = 1.3267246652
 */
export type ActividadesAuto = Pick<
  EjercicioBase,
  'cuestionario' | 'resolucion' | 'formatoRespuesta' | 'desbloqueo'
>;

export const AUTOEVALUACION_BISECCION: Record<string, ActividadesAuto> = {
  // El ejercicio 1 ya trae cuestionario y resolución en el contenido;
  // acá solo se declara el formato exacto de la respuesta.
  'biseccion-ejercicio-1': {
    formatoRespuesta: 'entero',
  },

  'biseccion-ejercicio-2': {
    formatoRespuesta: 'escalar',
    cuestionario: [
      {
        id: 'bis-e2-q1',
        tipo: 'opcion-multiple',
        enunciado:
          'Con f(x) = ln(x+1) − 3 en [1, 20], la primera bisección da c = 10.5. ¿En qué intervalo queda la raíz?',
        opciones: [
          { id: 'a', texto: 'En [10.5, 20], porque ahí está el cambio de signo.' },
          { id: 'b', texto: 'En [1, 10.5], porque f(1) es negativo.' },
          { id: 'c', texto: 'Exactamente en c = 10.5.' },
          { id: 'd', texto: 'Fuera de [1, 20], porque el logaritmo no está definido.' },
        ],
        correcta: 'a',
        explicacion:
          'f(1) y f(10.5) son negativos; f(20) es positivo. El cambio de signo queda entre 10.5 y 20.',
      },
      {
        id: 'bis-e2-q2',
        tipo: 'opcion-multiple',
        enunciado: '¿Qué condición habilita a Bisección en este problema?',
        opciones: [
          { id: 'a', texto: 'f continua en [1, 20] y f(1)·f(20) < 0.' },
          { id: 'b', texto: 'Que f sea derivable y monótona.' },
          { id: 'c', texto: 'Que el intervalo mida exactamente 20.' },
          { id: 'd', texto: 'Que la raíz sea un número entero.' },
        ],
        correcta: 'a',
        explicacion:
          'El teorema de Bolzano solo pide continuidad y cambio de signo en los extremos; no pide derivada.',
      },
      {
        id: 'bis-e2-q3',
        tipo: 'opcion-multiple',
        enunciado:
          'La raíz exacta es e³ − 1 ≈ 19.085537. ¿Qué garantiza el método al detenerse?',
        opciones: [
          { id: 'a', texto: 'Que la distancia a la raíz es a lo sumo (b − a)/2ⁿ.' },
          { id: 'b', texto: 'Que el resultado coincide exactamente con la raíz.' },
          { id: 'c', texto: 'Que f(c) = 0 en la última iteración.' },
          { id: 'd', texto: 'Que el error relativo es menor que 10⁻¹².' },
        ],
        correcta: 'a',
        explicacion:
          'Bisección garantiza una cota: la raíz está dentro del intervalo final, cuyo ancho es (b − a)/2ⁿ.',
      },
    ],
    resolucion: {
      valorCorrecto: 19.0855369232,
      tolerancia: 0.001,
      etiqueta: 'x',
      respuestaFinalTexto: 'x = e³ − 1 ≈ 19.085537, con cota de Bolzano menor que 10⁻⁴.',
    },
  },

  'biseccion-ejercicio-3': {
    formatoRespuesta: 'escalar',
    cuestionario: [
      {
        id: 'bis-e3-q1',
        tipo: 'opcion-multiple',
        enunciado:
          'Para f(x) = x·eˣ − 5 en [0, 5], ¿cuál es el primer punto medio que evalúa Bisección?',
        opciones: [
          { id: 'a', texto: '2.5' },
          { id: 'b', texto: '1.25' },
          { id: 'c', texto: '0.5' },
          { id: 'd', texto: '5' },
        ],
        correcta: 'a',
        explicacion: 'c = (0 + 5)/2 = 2.5. Después el intervalo se parte a la mitad en cada paso.',
      },
      {
        id: 'bis-e3-q2',
        tipo: 'opcion-multiple',
        enunciado:
          '¿Por qué el residuo |f(c)| sería un mal criterio de parada en esta función?',
        opciones: [
          { id: 'a', texto: 'Porque f crece muy rápido y puede valer mucho aunque c esté cerca de la raíz.' },
          { id: 'b', texto: 'Porque f es negativa en todo el intervalo.' },
          { id: 'c', texto: 'Porque Bisección nunca puede evaluar f.' },
          { id: 'd', texto: 'Porque el residuo siempre vale cero.' },
        ],
        correcta: 'a',
        explicacion:
          'Con una exponencial, el valor de f cambia de escala muy rápido; la cota del intervalo es más confiable.',
      },
      {
        id: 'bis-e3-q3',
        tipo: 'opcion-multiple',
        enunciado: 'La raíz es λ ≈ 1.3267. ¿Cómo se interpreta en el problema del puente?',
        opciones: [
          { id: 'a', texto: 'La carga real es unas 1.33 veces la de diseño cuando el puente opera al límite.' },
          { id: 'b', texto: 'El puente soporta 1.3267 toneladas exactas.' },
          { id: 'c', texto: 'La carga de diseño es 1.3267 veces la real.' },
          { id: 'd', texto: 'El método no encontró ninguna raíz.' },
        ],
        correcta: 'a',
        explicacion:
          'λ = carga real / carga de diseño. El valor 1.3267 indica el factor de carga en el equilibrio.',
      },
    ],
    resolucion: {
      valorCorrecto: 1.3267246652,
      tolerancia: 0.001,
      etiqueta: 'λ',
      respuestaFinalTexto: 'λ = W(5) ≈ 1.326725, con cota de Bolzano menor que 10⁻⁴.',
    },
  },
};
