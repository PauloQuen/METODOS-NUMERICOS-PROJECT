import type {
  EjemploModulo2,
  EjercicioModulo2,
  TeoriaModulo2,
} from '../../../modelos/modulo2.model';

/**
 * CONTENIDO DE MATRICES ESPECIALES (GAUSS-SEIDEL).
 *
 * La teoría explica por qué el método necesita matrices con estructura
 * —diagonal dominante, tridiagonal, dispersa— y los ejemplos usan
 * sistemas que cumplen esa condición. Todo se recalcula con el motor.
 */

export const TEORIA_MATRICES_ESPECIALES: TeoriaModulo2 = {
  concepto:
    'Gauss-Seidel es un método iterativo para sistemas lineales: en lugar de factorizar A, ' +
    'propone una aproximación inicial y mejora una incógnita por vez. Cada valor recién ' +
    'calculado se usa inmediatamente en las incógnitas siguientes, lo que suele acelerar la ' +
    'convergencia frente a Jacobi. Se usa sobre todo con matrices especiales: diagonalmente ' +
    'dominantes, tridiagonales, simétricas definidas positivas o dispersas de gran tamaño.',

  fundamento:
    'Despejando xᵢ de la i-ésima ecuación se obtiene una fórmula de punto fijo. Al iterar, ' +
    'el error se multiplica aproximadamente por el radio espectral de la matriz de iteración. ' +
    'Si ese radio es menor que 1, el método converge. Una condición suficiente y fácil de ' +
    'verificar es la dominancia diagonal estricta: en cada fila, el coeficiente de la diagonal ' +
    'supera en valor absoluto a la suma de los demás. En una matriz tridiagonal, además, cada ' +
    'iteración cuesta O(n) y se aprovecha que casi todos los coeficientes son cero.',

  cuandoFalla:
    'Si la matriz no es diagonalmente dominante, el método puede divergir o oscilar. Si algún ' +
    'elemento diagonal es cero, la fórmula divide entre cero y hay que reordenar las ecuaciones. ' +
    'También puede fallar con matrices mal condicionadas o con una aproximación inicial muy ' +
    'alejada, y no sirve para sistemas sin solución única. La dominancia diagonal es suficiente, ' +
    'no necesaria: hay matrices no dominantes que igual convergen.',

  precision:
    'El criterio práctico es detener cuando el cambio máximo entre dos iteraciones sea menor que ' +
    'la tolerancia: ‖x⁽ᵏ⁺¹⁾ − x⁽ᵏ⁾‖∞ < tol. Cuanto menor la tolerancia, más iteraciones y más ' +
    'costo. Siempre conviene calcular el residuo ‖Ax − b‖∞ para comprobar que la aproximación ' +
    'satisface el sistema original; un cambio pequeño no garantiza por sí solo un error pequeño ' +
    'si la matriz está mal condicionada.',

  videoUrl: 'https://www.youtube.com/results?search_query=gauss+seidel+metodo+iterativo',

  recursos: [
    {
      titulo: 'Método de Gauss-Seidel (Wikipedia, español)',
      url: 'https://es.wikipedia.org/wiki/M%C3%A9todo_de_Gauss-Seidel',
      tipo: 'lectura',
      descripcion: 'La fórmula iterativa, la convergencia y la comparación con Jacobi.',
    },
    {
      titulo: 'Matriz diagonalmente dominante (Wikipedia, español)',
      url: 'https://es.wikipedia.org/wiki/Matriz_diagonalmente_dominante',
      tipo: 'lectura',
      descripcion: 'La condición suficiente que garantiza la convergencia del método.',
    },
    {
      titulo: 'Matriz tridiagonal (Wikipedia, español)',
      url: 'https://es.wikipedia.org/wiki/Matriz_tridiagonal',
      tipo: 'lectura',
      descripcion: 'Un ejemplo de matriz especial donde el costo por iteración es lineal.',
    },
    {
      titulo: 'Videos de repaso: Gauss-Seidel',
      url: 'https://www.youtube.com/results?search_query=gauss+seidel+ejemplo+resuelto',
      tipo: 'video',
      descripcion: 'Iteraciones hechas a mano, con la tabla de valores y el error.',
    },
  ],

  algoritmo: {
    formula: 'xᵢ⁽ᵏ⁺¹⁾ = (bᵢ − Σⱼ≠ᵢ aᵢⱼ xⱼ) / aᵢᵢ',
    criterios: [
      {
        nombre: 'Diagonal no nula',
        explicacion:
          'Cada aᵢᵢ debe ser distinto de cero. Si no, hay que reordenar las ecuaciones antes de iterar.',
      },
      {
        nombre: 'Dominancia diagonal',
        explicacion:
          'Si |aᵢᵢ| > Σⱼ≠ᵢ |aᵢⱼ| en todas las filas, la convergencia está garantizada.',
      },
      {
        nombre: 'Criterio de parada',
        explicacion:
          'Se corta cuando el cambio máximo entre iteraciones es menor que la tolerancia pedida.',
      },
      {
        nombre: 'Residuo',
        explicacion:
          '‖Ax − b‖∞ comprueba que la aproximación final satisface el sistema, no solo que dejó de cambiar.',
      },
    ],
    pasos: [
      'Verificar que la diagonal no tenga ceros y, si se puede, que la matriz sea diagonalmente dominante.',
      'Elegir una aproximación inicial x⁽⁰⁾ (el vector cero es lo habitual).',
      'Para cada i, despejar xᵢ usando los valores ya actualizados de x₁…xᵢ₋₁ y los anteriores de xᵢ₊₁…xₙ.',
      'Calcular el cambio máximo entre la iteración nueva y la anterior.',
      'Repetir hasta que el cambio sea menor que la tolerancia o se alcance el máximo de iteraciones.',
      'Calcular el residuo y comparar con la solución esperada.',
    ],
    ventajas: [
      'Cada iteración cuesta O(n²) en una matriz densa y O(n) en una tridiagonal.',
      'No necesita almacenar una factorización: usa la matriz original.',
      'Aprovecha la estructura especial de matrices grandes y dispersas.',
      'El error y la tabla de iteraciones son fáciles de interpretar.',
    ],
    limitaciones: [
      'No siempre converge: depende del radio espectral de la matriz de iteración.',
      'Necesita diagonales no nulas y, en la práctica, cierta dominancia diagonal.',
      'La convergencia puede ser lenta si la matriz está mal condicionada.',
      'No reemplaza a un método directo cuando se necesita una solución exacta en pocos pasos.',
    ],
  },

  ejemploNormal: {
    id: 'seidel-teoria-numerico',
    titulo: 'Sistema diagonalmente dominante',
    tipo: 'numerico',
    planteamiento:
      'Resolver 10x₁ − x₂ + 2x₃ = 11, x₁ + 10x₂ − x₃ = 10 y 2x₁ − x₂ + 10x₃ = 11.',
    parametros: [
      { etiqueta: 'Matriz A', valor: '[[10, −1, 2], [1, 10, −1], [2, −1, 10]]' },
      { etiqueta: 'Vector b', valor: '(11, 10, 11)' },
      { etiqueta: 'Tolerancia', valor: '1 × 10⁻⁶' },
    ],
    interpretacion:
      'La diagonal (10, 10, 10) domina a los demás coeficientes de cada fila, así que la ' +
      'convergencia está garantizada. La solución exacta es (1, 1, 1).',
    pasos: [
      'Arrancar con x⁽⁰⁾ = (0, 0, 0).',
      'Actualizar x₁ con la primera ecuación: x₁ = (11 + x₂ − 2x₃)/10.',
      'Actualizar x₂ con la segunda, usando el x₁ recién calculado.',
      'Actualizar x₃ con la tercera, usando x₁ y x₂ nuevos.',
      'Repetir hasta que el cambio máximo sea menor que 10⁻⁶.',
    ],
    algoritmo:
      'Gauss-Seidel con actualización en el lugar: cada incógnita nueva se usa de inmediato.',
    criterio:
      'Convergencia garantizada por dominancia diagonal; parada por cambio máximo menor que la tolerancia.',
    conclusion:
      'La sucesión converge a x = (1, 1, 1). La tabla muestra cómo el error baja iteración a ' +
      'iteración y el residuo final es ≈ 0.',
    calculo: {
      A: [
        [10, -1, 2],
        [1, 10, -1],
        [2, -1, 10],
      ],
      b: [11, 10, 11],
      tol: 1e-6,
      maxIter: 100,
      etiqueta: 'Sistema diagonalmente dominante',
    },
  },

  ejemploCasuistica: {
    id: 'seidel-teoria-casuistica',
    titulo: 'Temperaturas en una barra tridiagonal',
    tipo: 'casuistica',
    enunciado:
      'Una barra metálica se divide en tres nodos. Las temperaturas T₁, T₂ y T₃ cumplen ' +
      '4T₁ − T₂ = 100, −T₁ + 4T₂ − T₃ = 10 y −T₂ + 4T₃ = 140 (en °C). ' +
      'La matriz es tridiagonal y diagonalmente dominante. ¿Cuáles son las temperaturas?',
    planteamiento: 'Plantear el sistema tridiagonal y resolverlo por Gauss-Seidel.',
    parametros: [
      { etiqueta: 'Incógnitas', valor: 'T₁, T₂, T₃ (°C)' },
      { etiqueta: 'Estructura', valor: 'matriz tridiagonal 3×3' },
    ],
    extraccion: {
      busqueda: 'Cada nodo intercambia calor con sus vecinos; los coeficientes no nulos forman tres diagonales.',
      datos: [
        { simbolo: 'T₁', valor: 'temperatura del nodo 1', queEs: 'Incógnita 1, en °C.' },
        { simbolo: 'T₂', valor: 'temperatura del nodo 2', queEs: 'Incógnita 2, en °C.' },
        { simbolo: 'T₃', valor: 'temperatura del nodo 3', queEs: 'Incógnita 3, en °C.' },
      ],
      formulacion:
        'El balance de energía en cada nodo da una ecuación con el nodo y sus vecinos. ' +
        'Los extremos reciben las condiciones de contorno.',
    },
    interpretacion:
      'La temperatura de cada nodo depende de sus vecinos. La estructura tridiagonal permite ' +
      'actualizar cada nodo con muy pocas operaciones.',
    pasos: [
      'Escribir A = [[4, −1, 0], [−1, 4, −1], [0, −1, 4]] y b = (100, 10, 140).',
      'Comprobar la dominancia diagonal: 4 > 1, 4 > 2 y 4 > 1.',
      'Iterar desde T = (0, 0, 0) con la fórmula de Gauss-Seidel.',
      'Detener cuando el cambio máximo sea menor que 10⁻⁶ y calcular el residuo.',
    ],
    algoritmo: 'Gauss-Seidel sobre una matriz tridiagonal.',
    criterio: 'La matriz es diagonalmente dominante, así que el método converge.',
    conclusion:
      'La solución es aproximadamente T = (30, 20, 40) °C. Comprobación: 4(30) − 20 = 100, ' +
      '−30 + 4(20) − 40 = 10 y −20 + 4(40) = 140.',
    calculo: {
      A: [
        [4, -1, 0],
        [-1, 4, -1],
        [0, -1, 4],
      ],
      b: [100, 10, 140],
      tol: 1e-6,
      maxIter: 200,
      etiqueta: 'Barra tridiagonal',
    },
  },
};

/* ------------------------------------------------------------------ */
/* Ejemplos resueltos                                                   */
/* ------------------------------------------------------------------ */

export const EJEMPLOS_MATRICES_ESPECIALES: EjemploModulo2[] = [
  {
    id: 'seidel-ejemplo-3x3',
    titulo: 'Sistema 3×3 con solución (2, 1, 3)',
    tipo: 'numerico',
    planteamiento:
      'Resolver 8x₁ − x₂ + 2x₃ = 21, x₁ + 7x₂ − x₃ = 6 y 2x₁ − x₂ + 9x₃ = 30.',
    parametros: [
      { etiqueta: 'Matriz A', valor: '[[8, −1, 2], [1, 7, −1], [2, −1, 9]]' },
      { etiqueta: 'Vector b', valor: '(21, 6, 30)' },
      { etiqueta: 'Tolerancia', valor: '1 × 10⁻⁶' },
    ],
    interpretacion:
      'La diagonal domina en las tres filas. La solución exacta es (2, 1, 3).',
    pasos: [
      'Comprobar la dominancia diagonal.',
      'Arrancar en ceros y actualizar x₁, x₂ y x₃ en ese orden.',
      'Usar cada valor nuevo en la incógnita siguiente.',
      'Cortar cuando el cambio máximo baje de 10⁻⁶.',
    ],
    algoritmo: 'Gauss-Seidel con actualización en el lugar.',
    criterio: 'Cambio máximo < 10⁻⁶ y residuo final ≈ 0.',
    conclusion: 'La solución es x = (2, 1, 3). El método converge porque la matriz es dominante.',
    calculo: {
      A: [
        [8, -1, 2],
        [1, 7, -1],
        [2, -1, 9],
      ],
      b: [21, 6, 30],
      tol: 1e-6,
      maxIter: 100,
      etiqueta: 'Sistema 3×3',
    },
  },
  {
    id: 'seidel-ejemplo-2x2',
    titulo: 'Sistema 2×2 dominante',
    tipo: 'numerico',
    planteamiento: 'Resolver 5x₁ + x₂ = 6 y x₁ + 4x₂ = 5.',
    parametros: [
      { etiqueta: 'Matriz A', valor: '[[5, 1], [1, 4]]' },
      { etiqueta: 'Vector b', valor: '(6, 5)' },
      { etiqueta: 'Tolerancia', valor: '1 × 10⁻⁸' },
    ],
    interpretacion:
      'Dos ecuaciones con diagonal dominante y solución exacta (1, 1).',
    pasos: [
      'Verificar que 5 > 1 y 4 > 1.',
      'Actualizar x₁ = (6 − x₂)/5 y x₂ = (5 − x₁)/4.',
      'Repetir hasta que el cambio sea menor que 10⁻⁸.',
    ],
    algoritmo: 'Gauss-Seidel para un sistema 2×2.',
    criterio: 'El cambio máximo entre iteraciones debe ser menor que la tolerancia.',
    conclusion:
      'La solución es x = (1, 1). Comprobación: 5(1) + 1 = 6 y 1 + 4(1) = 5.',
    calculo: {
      A: [
        [5, 1],
        [1, 4],
      ],
      b: [6, 5],
      tol: 1e-8,
      maxIter: 100,
      etiqueta: 'Sistema 2×2',
    },
  },
  {
    id: 'seidel-ejemplo-produccion',
    titulo: 'Producción de tres líneas',
    tipo: 'casuistica',
    enunciado:
      'Una fábrica produce x, y, z unidades en tres líneas. Las restricciones son ' +
      '10x − y + 2z = 25, x + 10y − z = 28 y 2x − y + 10z = 41. ' +
      '¿Cuánto produce cada línea?',
    planteamiento: 'Plantear el sistema diagonalmente dominante y resolverlo por Gauss-Seidel.',
    parametros: [
      { etiqueta: 'Incógnitas', valor: 'x, y, z (unidades)' },
      { etiqueta: 'Ecuaciones', valor: '3' },
    ],
    extraccion: {
      busqueda: 'Se identifican las tres líneas y sus coeficientes de producción.',
      datos: [
        { simbolo: 'x', valor: 'línea 1', queEs: 'Unidades producidas por la línea 1.' },
        { simbolo: 'y', valor: 'línea 2', queEs: 'Unidades producidas por la línea 2.' },
        { simbolo: 'z', valor: 'línea 3', queEs: 'Unidades producidas por la línea 3.' },
      ],
      formulacion:
        'Cada ecuación combina la producción de las tres líneas; la diagonal concentra el ' +
        'mayor coeficiente de cada una.',
    },
    interpretacion:
      'Las producciones deben ser no negativas y satisfacer las tres restricciones.',
    pasos: [
      'Escribir A y b.',
      'Comprobar la dominancia diagonal.',
      'Iterar desde ceros usando los valores actualizados.',
      'Verificar la solución en las tres ecuaciones.',
    ],
    algoritmo: 'Gauss-Seidel con tolerancia 10⁻⁶ y máximo 100 iteraciones.',
    criterio: 'La matriz es diagonalmente dominante y el error de cambio baja de la tolerancia.',
    conclusion:
      'La solución es x = (2, 3, 4): 10(2) − 3 + 2(4) = 25, 2 + 30 − 4 = 28 y ' +
      '4 − 3 + 40 = 41.',
    calculo: {
      A: [
        [10, -1, 2],
        [1, 10, -1],
        [2, -1, 10],
      ],
      b: [25, 28, 41],
      tol: 1e-6,
      maxIter: 100,
      etiqueta: 'Producción de tres líneas',
    },
  },
  {
    id: 'seidel-ejemplo-tridiagonal',
    titulo: 'Temperaturas en una barra',
    tipo: 'casuistica',
    enunciado:
      'Tres nodos de una barra tienen temperaturas T₁, T₂ y T₃. El balance de energía da ' +
      '4T₁ − T₂ = 100, −T₁ + 4T₂ − T₃ = 10 y −T₂ + 4T₃ = 140. ' +
      'La matriz es tridiagonal. ¿Cuáles son las temperaturas?',
    planteamiento: 'Aprovechar la estructura tridiagonal y resolver por Gauss-Seidel.',
    parametros: [
      { etiqueta: 'Incógnitas', valor: 'T₁, T₂, T₃ (°C)' },
      { etiqueta: 'Estructura', valor: 'tridiagonal' },
    ],
    extraccion: {
      busqueda: 'Cada nodo solo intercambia calor con sus vecinos inmediatos.',
      datos: [
        { simbolo: 'T₁', valor: 'nodo 1', queEs: 'Temperatura del extremo izquierdo.' },
        { simbolo: 'T₂', valor: 'nodo 2', queEs: 'Temperatura del nodo central.' },
        { simbolo: 'T₃', valor: 'nodo 3', queEs: 'Temperatura del extremo derecho.' },
      ],
      formulacion: 'Los coeficientes no nulos forman tres diagonales; el resto es cero.',
    },
    interpretacion: 'Las temperaturas deben ser coherentes con los flujos de calor entre nodos.',
    pasos: [
      'Escribir A y b.',
      'Verificar la dominancia diagonal.',
      'Iterar nodo por nodo usando los valores actualizados.',
      'Calcular el residuo final.',
    ],
    algoritmo: 'Gauss-Seidel sobre una matriz tridiagonal.',
    criterio: 'La matriz es diagonalmente dominante; se corta por cambio máximo.',
    conclusion:
      'La solución es T = (30, 20, 40) °C. Comprobación: 4(30) − 20 = 100, ' +
      '−30 + 4(20) − 40 = 10 y −20 + 4(40) = 140.',
    calculo: {
      A: [
        [4, -1, 0],
        [-1, 4, -1],
        [0, -1, 4],
      ],
      b: [100, 10, 140],
      tol: 1e-6,
      maxIter: 200,
      etiqueta: 'Barra tridiagonal',
    },
  },
];

/* ------------------------------------------------------------------ */
/* Ejercicios                                                          */
/* ------------------------------------------------------------------ */

const ejercicio = (
  id: string,
  titulo: string,
  planteamiento: string,
  A: number[][],
  b: number[],
  conclusion: string,
  pista?: string,
  tipo: 'numerico' | 'casuistica' = 'numerico',
): EjercicioModulo2 => ({
  id,
  titulo,
  tipo,
  planteamiento,
  parametros: [
    { etiqueta: 'Matriz A', valor: JSON.stringify(A) },
    { etiqueta: 'Vector b', valor: `(${b.join(', ')})` },
    { etiqueta: 'Tolerancia', valor: '1 × 10⁻⁶' },
  ],
  interpretacion:
    'Aplicar Gauss-Seidel, controlar la dominancia diagonal y verificar el residuo final.',
  pasos: [
    'Comprobar que la diagonal no tenga ceros y que la matriz sea dominante.',
    'Elegir x⁽⁰⁾ = (0, 0, 0).',
    'Actualizar cada incógnita con los valores más recientes.',
    'Detener cuando el cambio máximo sea menor que 10⁻⁶.',
  ],
  algoritmo: 'Gauss-Seidel para matrices especiales.',
  criterio: 'Cambio máximo menor que la tolerancia y residuo final ≈ 0.',
  conclusion,
  pista,
  calculo: { A, b, tol: 1e-6, maxIter: 100, etiqueta: titulo },
});

export const EJERCICIOS_MATRICES_ESPECIALES: EjercicioModulo2[] = [
  ejercicio(
    'seidel-ejercicio-1',
    'Sistema dominante 3×3',
    'Resolver 5x₁ + x₂ = 6, x₁ + 4x₂ + x₃ = 6 y x₂ + 3x₃ = 4.',
    [
      [5, 1, 0],
      [1, 4, 1],
      [0, 1, 3],
    ],
    [6, 6, 4],
    'La solución es x = (1, 1, 1): 5 + 1 = 6, 1 + 4 + 1 = 6 y 1 + 3 = 4.',
    'La diagonal domina en las tres filas.',
  ),
  ejercicio(
    'seidel-ejercicio-2',
    'Sistema con solución (1, 2, 3)',
    'Resolver 6x₁ − x₂ + x₃ = 7, x₁ + 7x₂ − 2x₃ = 9 y −x₁ + x₂ + 8x₃ = 25.',
    [
      [6, -1, 1],
      [1, 7, -2],
      [-1, 1, 8],
    ],
    [7, 9, 25],
    'La solución es x = (1, 2, 3). El residuo final es ≈ 0.',
    'Comprobá que 6 > 2, 7 > 3 y 8 > 2.',
  ),
  ejercicio(
    'seidel-ejercicio-3',
    'Sistema 2×2',
    'Resolver 4x₁ + x₂ = 9 y x₁ + 3x₂ = 5.',
    [
      [4, 1],
      [1, 3],
    ],
    [9, 5],
    'La solución es x = (2, 1): 4(2) + 1 = 9 y 2 + 3(1) = 5.',
  ),
  ejercicio(
    'seidel-ejercicio-4',
    'Producción con demanda',
    'Resolver 10x − y + 2z = 25, x + 10y − z = 28 y 2x − y + 10z = 41.',
    [
      [10, -1, 2],
      [1, 10, -1],
      [2, -1, 10],
    ],
    [25, 28, 41],
    'La solución es x = (2, 3, 4): 20 − 3 + 8 = 25, 2 + 30 − 4 = 28 y 4 − 3 + 40 = 41.',
    'La matriz es la misma de un ejemplo; cambia la interpretación.',
    'casuistica',
  ),
  ejercicio(
    'seidel-ejercicio-5',
    'Flujo entre tres nodos',
    'Resolver 5f₁ + f₂ + f₃ = 100, f₁ + 6f₂ + f₃ = 160 y f₁ + f₂ + 7f₃ = 240.',
    [
      [5, 1, 1],
      [1, 6, 1],
      [1, 1, 7],
    ],
    [100, 160, 240],
    'La solución es f = (10, 20, 30). Las tres ecuaciones se cumplen.',
    'Todos los coeficientes son positivos y la diagonal domina.',
    'casuistica',
  ),
  ejercicio(
    'seidel-ejercicio-6',
    'Barra tridiagonal con tres nodos',
    'Resolver 4T₁ − T₂ = 100, −T₁ + 4T₂ − T₃ = 10 y −T₂ + 4T₃ = 140.',
    [
      [4, -1, 0],
      [-1, 4, -1],
      [0, -1, 4],
    ],
    [100, 10, 140],
    'La solución es T = (30, 20, 40) °C.',
    'La estructura tridiagonal deja muchos ceros: no los operes de más.',
    'casuistica',
  ),
];
