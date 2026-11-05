import type { EjercicioBase } from '../../../../../shared/models/metodo.model';

/**
 * ACTIVIDADES DE AUTOEVALUACIÓN DE REGLA FALSA.
 *
 * Los tres ejercicios comparten raíz con sus equivalentes de Bisección:
 * · x² + 2x − 15 = 0     → x = 3
 * · ln(x+1) − 3 = 0      → x = e³ − 1 = 19.0855369232
 * · x·eˣ − 5 = 0         → x = W(5)   = 1.3267246652
 */
export type ActividadesAuto = Pick<
  EjercicioBase,
  'cuestionario' | 'resolucion' | 'formatoRespuesta' | 'desbloqueo'
>;

export const AUTOEVALUACION_REGLA_FALSA: Record<string, ActividadesAuto> = {
  'regla-falsa-ejercicio-1': {
    formatoRespuesta: 'escalar',
    cuestionario: [
      {
        id: 'rf-e1-q1',
        tipo: 'opcion-multiple',
        enunciado:
          'Con f(0) = −15 y f(5) = 20, ¿dónde corta la primera cuerda de la Regla Falsa?',
        opciones: [
          { id: 'a', texto: 'c ≈ 2.1429' },
          { id: 'b', texto: 'c = 2.5' },
          { id: 'c', texto: 'c = 3' },
          { id: 'd', texto: 'c = 1.5' },
        ],
        correcta: 'a',
        explicacion:
          'c = a − f(a)(b − a)/(f(b) − f(a)) = 0 − (−15)·5/35 = 75/35 ≈ 2.1429.',
      },
      {
        id: 'rf-e1-q2',
        tipo: 'opcion-multiple',
        enunciado: '¿Por qué la Regla Falsa garantiza convergencia?',
        opciones: [
          { id: 'a', texto: 'Porque conserva el encierro de Bolzano en cada iteración.' },
          { id: 'b', texto: 'Porque usa la derivada en la raíz.' },
          { id: 'c', texto: 'Porque siempre da el punto medio.' },
          { id: 'd', texto: 'Porque el intervalo se duplica.' },
        ],
        correcta: 'a',
        explicacion:
          'Al mantener los extremos con signos opuestos, la raíz queda encerrada; la cuerda solo cambia el punto de corte.',
      },
      {
        id: 'rf-e1-q3',
        tipo: 'opcion-multiple',
        enunciado:
          'Este ejercicio converge en 8 iteraciones y Bisección necesitaba 16. ¿Cuál es la razón?',
        opciones: [
          { id: 'a', texto: 'La cuerda usa las magnitudes de f y suele acercarse más rápido que el punto medio.' },
          { id: 'b', texto: 'La Regla Falsa tiene convergencia cuadrática garantizada.' },
          { id: 'c', texto: 'La Regla Falsa evalúa menos veces la función.' },
          { id: 'd', texto: 'El intervalo inicial es más angosto.' },
        ],
        correcta: 'a',
        explicacion:
          'El corte de la cuerda incorpora cuánto vale f en cada extremo; por eso avanza más rápido en funciones suaves.',
      },
    ],
    resolucion: {
      valorCorrecto: 3,
      tolerancia: 0.001,
      etiqueta: 'x',
      respuestaFinalTexto: 'x ≈ 2.999988, que converge a la raíz exacta x = 3.',
    },
  },

  'regla-falsa-ejercicio-2': {
    formatoRespuesta: 'escalar',
    cuestionario: [
      {
        id: 'rf-e2-q1',
        tipo: 'opcion-multiple',
        enunciado:
          'Con f(1) = −2.3069 y f(20) = 0.0445, ¿dónde cae el primer corte de la cuerda?',
        opciones: [
          { id: 'a', texto: 'c ≈ 19.6402' },
          { id: 'b', texto: 'c = 10.5' },
          { id: 'c', texto: 'c ≈ 19.0855' },
          { id: 'd', texto: 'c = 18.5' },
        ],
        correcta: 'a',
        explicacion:
          'La cuerda es casi horizontal porque f(20) es casi cero; por eso el corte se va hasta 19.6402.',
      },
      {
        id: 'rf-e2-q2',
        tipo: 'opcion-multiple',
        enunciado:
          '¿Qué fenómeno explica que la Regla Falsa empate con Bisección en este ejercicio?',
        opciones: [
          { id: 'a', texto: 'El extremo estancado: a = 1 queda fijo y la cuerda avanza muy poco.' },
          { id: 'b', texto: 'La función tiene una discontinuidad en la raíz.' },
          { id: 'c', texto: 'El intervalo no tiene cambio de signo.' },
          { id: 'd', texto: 'La cuerda siempre converge en 18 pasos.' },
        ],
        correcta: 'a',
        explicacion:
          'Un extremo se queda clavado y la pendiente de la cuerda se aplana; la ventaja sobre el punto medio desaparece.',
      },
      {
        id: 'rf-e2-q3',
        tipo: 'opcion-multiple',
        enunciado: '¿Qué mide exactamente |Δc| como criterio de parada?',
        opciones: [
          { id: 'a', texto: 'Cuánto se movió el corte entre dos iteraciones, no la distancia a la raíz.' },
          { id: 'b', texto: 'La distancia exacta entre el corte y la raíz.' },
          { id: 'c', texto: 'El valor de f en el extremo izquierdo.' },
          { id: 'd', texto: 'El ancho total del intervalo inicial.' },
        ],
        correcta: 'a',
        explicacion:
          '|Δc| es un criterio a posteriori: mide el avance del corte. La cota real del error es otra cosa.',
      },
    ],
    resolucion: {
      valorCorrecto: 19.0855369232,
      tolerancia: 0.001,
      etiqueta: 'x',
      respuestaFinalTexto: 'x = e³ − 1 ≈ 19.085537; la cuerda llega en 18 iteraciones.',
    },
  },

  'regla-falsa-ejercicio-3': {
    formatoRespuesta: 'escalar',
    cuestionario: [
      {
        id: 'rf-e3-q1',
        tipo: 'opcion-multiple',
        enunciado:
          'Con [1, 2], f(1) = −2.2817 y f(2) = 9.7781, ¿dónde corta la primera cuerda?',
        opciones: [
          { id: 'a', texto: 'c ≈ 1.1892' },
          { id: 'b', texto: 'c = 1.5' },
          { id: 'c', texto: 'c ≈ 1.3267' },
          { id: 'd', texto: 'c = 2' },
        ],
        correcta: 'a',
        explicacion:
          'c = 1 − (−2.2817)·1/(9.7781 + 2.2817) ≈ 1.1892. El corte se acerca a la raíz renovando el extremo izquierdo.',
      },
      {
        id: 'rf-e3-q2',
        tipo: 'opcion-multiple',
        enunciado: '¿Por qué usar [0, 5] sería una mala elección para este problema?',
        opciones: [
          { id: 'a', texto: 'Porque b = 5 se clava y la cuerda, casi vertical, arrastra la convergencia.' },
          { id: 'b', texto: 'Porque f no es continua en [0, 5].' },
          { id: 'c', texto: 'Porque no hay cambio de signo en [0, 5].' },
          { id: 'd', texto: 'Porque la raíz queda fuera de [0, 5].' },
        ],
        correcta: 'a',
        explicacion:
          'El extremo estancado en b = 5 hace que la Regla Falsa no llegue a la tolerancia en 100 iteraciones.',
      },
      {
        id: 'rf-e3-q3',
        tipo: 'opcion-multiple',
        enunciado: 'El resultado λ ≈ 1.32669 significa que…',
        opciones: [
          { id: 'a', texto: 'la carga real es aproximadamente 1.33 veces la de diseño en el límite.' },
          { id: 'b', texto: 'el puente soporta 1.32669 toneladas.' },
          { id: 'c', texto: 'la carga de diseño supera a la real en 33 %.' },
          { id: 'd', texto: 'la raíz no tiene interpretación física.' },
        ],
        correcta: 'a',
        explicacion:
          'λ es la relación carga real / carga de diseño; 1.32669 indica el factor de carga en el equilibrio.',
      },
    ],
    resolucion: {
      valorCorrecto: 1.3267246652,
      tolerancia: 0.001,
      etiqueta: 'λ',
      respuestaFinalTexto: 'λ = W(5) ≈ 1.326725; con [1, 2] converge en 10 iteraciones.',
    },
  },
};
