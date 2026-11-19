/**
 * Textos explicativos que comparten la teoría y los ejemplos de Bisección.
 *
 * Están acá y no dentro de un componente para que las dos pestañas digan
 * exactamente lo mismo: si se corrige una explicación, cambia en ambas.
 */

/** Pasos del algoritmo, con el formato [título, explicación]. */
export const PASOS_ALGORITMO_BISECCION: [string, string][] = [
  [
    'Verifica las condiciones',
    'Comprueba que f sea continua en [a, b]. Si un extremo es raíz, termina; en otro caso exige f(a) · f(b) < 0.',
  ],
  [
    'Calcula el punto medio',
    'c = (a + b) / 2. Esta será la aproximación de la iteración.',
  ],
  [
    'Evalúa la función',
    'Calcula f(c). Si f(c) = 0, c es una raíz y el proceso termina.',
  ],
  [
    'Comprueba la tolerancia',
    'Si (b − a)/2 ≤ tolerancia, devuelve c con esa cota de error.',
  ],
  [
    'Elige la mitad izquierda',
    'Si f(a) y f(c) tienen signos opuestos, conserva [a, c]: sustituye b por c.',
  ],
  [
    'O elige la mitad derecha',
    'En caso contrario, conserva [c, b]: sustituye a por c. Solo se elige una de las dos mitades.',
  ],
  [
    'Repite desde el paso 2',
    'Cada reducción divide el ancho por dos. Detén también el proceso si se alcanza el máximo de iteraciones.',
  ],
];

/** Criterios de parada, en el mismo orden en que se muestran en Teoría. */
export const CRITERIOS_PARADA_BISECCION: {
  titulo: string;
  texto: string;
  principal?: boolean;
  insignia?: string;
}[] = [
  {
    titulo: 'Cota del intervalo',
    texto:
      'Para el punto medio, |c − raíz| ≤ (b − a)/2. Se detiene cuando esta cota es menor o igual ' +
      'que la tolerancia. No mide el error real: lo acota, siempre que se mantengan las condiciones de Bolzano.',
    principal: true,
    insignia: 'Por defecto',
  },
  {
    titulo: 'Residuo |f(c)|',
    texto:
      'Mide la cercanía de f(c) a cero, no la distancia de c a la raíz. Si multiplicas la función por ' +
      '1000 y mantienes la tolerancia, el residuo aumenta y el criterio puede requerir más iteraciones. ' +
      'Un residuo pequeño no garantiza por sí solo un error pequeño en x.',
  },
  {
    titulo: 'Residuo normalizado',
    texto:
      'Divide |f(c)| por una escala de referencia de la función, positiva y explícitamente definida. ' +
      'Puede reducir la sensibilidad al escalado, pero no sustituye la cota del intervalo.',
  },
  {
    titulo: 'Cambio entre aproximaciones',
    texto:
      'Compara |cₙ − cₙ₋₁|, o su versión relativa |cₙ − cₙ₋₁| / |cₙ| cuando cₙ ≠ 0. ' +
      'Es un indicador a posteriori; cerca de cero conviene usar una tolerancia absoluta.',
  },
];

/** Explicación de la velocidad de convergencia. */
export const CONVERGENCIA_BISECCION =
  'El ancho se reduce por un factor de 1/2 en cada reducción: Lₖ = (b₀ − a₀)/2ᵏ. ' +
  'En el n-ésimo punto medio (n empieza en 1), la cota es (b₀ − a₀)/2ⁿ. ' +
  'La reducción de esta cota es lineal y permite anticipar el número de iteraciones.';
