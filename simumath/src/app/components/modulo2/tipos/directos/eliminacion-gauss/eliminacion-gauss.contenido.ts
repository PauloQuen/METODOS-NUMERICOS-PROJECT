import type {
  EjemploModulo2,
  EjercicioModulo2,
  TeoriaModulo2,
} from '../../../modelos/modulo2.model';

/**
 * CONTENIDO DE ELIMINACIÓN DE GAUSS.
 *
 * Solo textos y datos. Las tablas y los resultados se calculan con
 * `eliminacion-gauss.algoritmo.ts`; ningún número de la solución se
 * escribe a mano en la tabla.
 */

export const TEORIA_ELIMINACION_GAUSS: TeoriaModulo2 = {
  concepto:
    'Un sistema lineal es un conjunto de ecuaciones que comparten las mismas incógnitas. ' +
    'En forma matricial se escribe A·x = b: A guarda los coeficientes, x las incógnitas y b ' +
    'los términos independientes. La eliminación de Gauss lo resuelve transformándolo en un ' +
    'sistema triangular equivalente, donde la última ecuación tiene una sola incógnita y se ' +
    'puede despejar hacia arriba.',

  fundamento:
    'Las operaciones elementales de fila —intercambiar dos ecuaciones, multiplicar una por un ' +
    'escalar no nulo y sumarle a otra un múltiplo de una tercera— no cambian el conjunto ' +
    'solución. Gauss las usa para hacer ceros debajo de cada pivote. Al terminar queda una ' +
    'matriz triangular superior U y un vector c, y el sistema U·x = c se resuelve por ' +
    'sustitución regresiva. El pivoteo parcial elige como pivote el mayor valor absoluto de la ' +
    'columna: no cambia la solución y evita dividir por números muy pequeños.',

  cuandoFalla:
    'Si un pivote es exactamente cero y no hay otra fila con la que intercambiar, el sistema es ' +
    'singular o no tiene solución única. Si el pivote es muy pequeño pero no cero, la división ' +
    'amplifica los errores de redondeo: es el caso de las matrices mal condicionadas. También ' +
    'hay que revisar que A y b tengan dimensiones compatibles; el método no funciona con ' +
    'matrices no cuadradas.',

  precision:
    'En aritmética exacta la solución es la del sistema. En punto flotante aparece un error de ' +
    'redondeo que crece con el número de operaciones y con el condicionamiento de A. Una forma ' +
    'práctica de controlarlo es calcular el residuo ‖Ax − b‖∞: si es pequeño, la solución ' +
    'satisface el sistema aunque los coeficientes tengan redondeo. El pivoteo parcial mejora ' +
    'la estabilidad, pero no arregla una matriz singular.',

  videoUrl: 'https://www.youtube.com/results?search_query=eliminacion+de+gauss+pivoteo+parcial',

  recursos: [
    {
      titulo: 'Eliminación de Gauss (Wikipedia, español)',
      url: 'https://es.wikipedia.org/wiki/Eliminaci%C3%B3n_de_Gauss',
      tipo: 'lectura',
      descripcion: 'El algoritmo, las operaciones elementales y la sustitución regresiva.',
    },
    {
      titulo: 'Pivoteo parcial (Wikipedia, español)',
      url: 'https://es.wikipedia.org/wiki/Pivoteo_parcial',
      tipo: 'lectura',
      descripcion: 'Por qué se elige el pivote de mayor valor absoluto y cómo mejora la estabilidad.',
    },
    {
      titulo: 'Sistemas de ecuaciones con GeoGebra',
      url: 'https://www.geogebra.org/search/sistema%20de%20ecuaciones',
      tipo: 'interactivo',
      descripcion: 'Representación gráfica de sistemas 2×2 y 3×3 para interpretar la solución.',
    },
    {
      titulo: 'Videos de repaso: Gauss con pivoteo',
      url: 'https://www.youtube.com/results?search_query=eliminacion+gauss+pivoteo+parcial',
      tipo: 'video',
      descripcion: 'Ejemplos resueltos paso a paso, con las operaciones de fila a la vista.',
    },
  ],

  algoritmo: {
    formula: 'A·x = b  →  U·x = c  →  x',
    criterios: [
      {
        nombre: 'Pivote no nulo',
        explicacion:
          'En cada columna se elige el mayor valor absoluto. Si el mejor pivote es cero, el sistema es singular.',
      },
      {
        nombre: 'Operaciones elementales',
        explicacion:
          'Intercambiar filas, multiplicar por un escalar no nulo y sumar múltiplos no cambian la solución.',
      },
      {
        nombre: 'Triangular superior',
        explicacion:
          'Al terminar la eliminación, debajo de la diagonal todos los coeficientes deben ser cero.',
      },
      {
        nombre: 'Residuo',
        explicacion:
          '‖Ax − b‖∞ cercano a cero confirma que la solución calculada satisface el sistema original.',
      },
    ],
    pasos: [
      'Escribir el sistema como matriz aumentada [A | b].',
      'Para cada columna, elegir el pivote de mayor valor absoluto y, si hace falta, intercambiar filas.',
      'Eliminar los coeficientes debajo del pivote con operaciones de fila.',
      'Repetir hasta obtener una matriz triangular superior.',
      'Despejar las incógnitas desde la última ecuación hasta la primera (sustitución regresiva).',
      'Calcular el residuo y comprobar la solución en el sistema original.',
    ],
    ventajas: [
      'Es un método directo: termina en un número finito y predecible de pasos.',
      'Resuelve sistemas pequeños y medianos con buena precisión.',
      'El pivoteo parcial lo hace razonablemente estable.',
      'La tabla de operaciones permite auditar cada paso.',
    ],
    limitaciones: [
      'El costo crece como n³ para una matriz densa de n×n.',
      'No detecta por sí solo todas las malas condiciones; el residuo ayuda, pero no lo reemplaza.',
      'Si el sistema es singular, no hay solución única que calcular.',
      'Para matrices dispersas muy grandes suele ser mejor un método iterativo.',
    ],
  },

  ejemploNormal: {
    id: 'gauss-teoria-numerico',
    titulo: 'Sistema clásico 3×3',
    tipo: 'numerico',
    planteamiento: 'Resolver el sistema 2x + y − z = 8, −3x − y + 2z = −11, −2x + y + 2z = −3.',
    parametros: [
      { etiqueta: 'Matriz A', valor: '[[2, 1, −1], [−3, −1, 2], [−2, 1, 2]]' },
      { etiqueta: 'Vector b', valor: '(8, −11, −3)' },
    ],
    interpretacion:
      'Tres planos se cortan en un único punto. La eliminación busca ese punto haciendo ceros ' +
      'debajo de los pivotes.',
    pasos: [
      'Se elige el pivote de mayor valor absoluto en la primera columna: la fila 2 tiene |−3|.',
      'Se intercambian las filas 1 y 2 y se elimina la primera columna de las filas restantes.',
      'Se repite el pivoteo en la segunda columna y se elimina debajo del nuevo pivote.',
      'Con la matriz triangular, se despeja z, después y, y por último x.',
    ],
    algoritmo:
      'Pivoteo parcial, eliminación hacia adelante y sustitución regresiva. La tabla muestra ' +
      'la matriz y el vector b después de cada operación.',
    criterio:
      'El residuo máximo debe ser prácticamente cero. La solución debe cumplir las tres ' +
      'ecuaciones originales.',
    conclusion:
      'La solución es x = (2, 3, −1). Al reemplazar: 2(2) + 3 − (−1) = 8, −3(2) − 3 + 2(−1) = −11 ' +
      'y −2(2) + 3 + 2(−1) = −3. El residuo es ≈ 0.',
    calculo: {
      A: [
        [2, 1, -1],
        [-3, -1, 2],
        [-2, 1, 2],
      ],
      b: [8, -11, -3],
      etiqueta: 'Sistema clásico 3×3',
    },
  },

  ejemploCasuistica: {
    id: 'gauss-teoria-casuistica',
    titulo: 'Corrientes en una red de tres mallas',
    tipo: 'casuistica',
    enunciado:
      'En una red eléctrica de tres mallas, las corrientes i₁, i₂ e i₃ cumplen las ecuaciones ' +
      '2i₁ + i₂ = 25, i₁ + 3i₂ + i₃ = 30 e i₂ + 2i₃ = 15 (unidades en amperios). ' +
      '¿Cuánto vale cada corriente?',
    planteamiento: 'Plantear el sistema A·i = b y resolverlo por eliminación de Gauss.',
    parametros: [
      { etiqueta: 'Incógnitas', valor: 'i₁, i₂, i₃' },
      { etiqueta: 'Ecuaciones', valor: '3' },
    ],
    extraccion: {
      busqueda: 'Se identifican las tres corrientes y los coeficientes de cada ecuación.',
      datos: [
        { simbolo: 'i₁', valor: 'corriente de la malla 1', queEs: 'Incógnita 1, en amperios.' },
        { simbolo: 'i₂', valor: 'corriente de la malla 2', queEs: 'Incógnita 2, en amperios.' },
        { simbolo: 'i₃', valor: 'corriente de la malla 3', queEs: 'Incógnita 3, en amperios.' },
      ],
      formulacion:
        'Los coeficientes son las resistencias compartidas; el vector b reúne las fuentes de ' +
        'tensión. Queda un sistema 3×3 que se resuelve por Gauss.',
    },
    interpretacion:
      'Las corrientes deben satisfacer simultáneamente las tres leyes de malla. La solución ' +
      'positiva indica el sentido supuesto.',
    pasos: [
      'Construir A con los coeficientes de i₁, i₂ e i₃ en cada malla.',
      'Aplicar pivoteo parcial y eliminar debajo de cada pivote.',
      'Despejar i₃, luego i₂ y finalmente i₁.',
      'Comprobar las tres ecuaciones con los valores obtenidos.',
    ],
    algoritmo:
      'Eliminación de Gauss con pivoteo parcial sobre la matriz aumentada [A | b].',
    criterio:
      'El residuo debe ser ≈ 0 y las tres corrientes deben satisfacer las ecuaciones de malla.',
    conclusion:
      'La solución es i = (10, 5, 5) A. En efecto: 2(10) + 5 = 25, 10 + 3(5) + 5 = 30 y ' +
      '5 + 2(5) = 15. Las tres mallas quedan consistentes.',
    calculo: {
      A: [
        [2, 1, 0],
        [1, 3, 1],
        [0, 1, 2],
      ],
      b: [25, 30, 15],
      etiqueta: 'Red de tres mallas',
    },
  },
};

/* ------------------------------------------------------------------ */
/* Ejemplos resueltos                                                   */
/* ------------------------------------------------------------------ */

export const EJEMPLOS_ELIMINACION_GAUSS: EjemploModulo2[] = [
  {
    id: 'gauss-ejemplo-3x3',
    titulo: 'Sistema 3×3 con solución entera',
    tipo: 'numerico',
    planteamiento:
      'Resolver x + 2y + z = 7, 2x + y − z = 2 y 3x + y + 2z = 13.',
    parametros: [
      { etiqueta: 'Matriz A', valor: '[[1, 2, 1], [2, 1, −1], [3, 1, 2]]' },
      { etiqueta: 'Vector b', valor: '(7, 2, 13)' },
    ],
    interpretacion:
      'Un sistema de tres ecuaciones con tres incógnitas que tiene una solución entera, ' +
      'útil para comprobar a mano.',
    pasos: [
      'Escribir la matriz aumentada [A | b].',
      'Pivotear la primera columna y eliminar debajo del pivote.',
      'Repetir en la segunda columna.',
      'Despejar z, y, x por sustitución regresiva.',
    ],
    algoritmo: 'Eliminación de Gauss con pivoteo parcial.',
    criterio: 'La solución debe satisfacer las tres ecuaciones con residuo ≈ 0.',
    conclusion:
      'La solución es x = (2, 1, 3). Comprobación: 2 + 2(1) + 3 = 7, 2(2) + 1 − 3 = 2 y ' +
      '3(2) + 1 + 2(3) = 13.',
    calculo: {
      A: [
        [1, 2, 1],
        [2, 1, -1],
        [3, 1, 2],
      ],
      b: [7, 2, 13],
      etiqueta: 'Sistema 3×3',
    },
  },
  {
    id: 'gauss-ejemplo-2x2',
    titulo: 'Sistema 2×2 sin sorpresas',
    tipo: 'numerico',
    planteamiento: 'Resolver 3x + y = 10, x + 2y = 10.',
    parametros: [
      { etiqueta: 'Matriz A', valor: '[[3, 1], [1, 2]]' },
      { etiqueta: 'Vector b', valor: '(10, 10)' },
    ],
    interpretacion:
      'Dos rectas que se cortan en un punto. El pivoteo parcial no necesita intercambiar filas.',
    pasos: [
      'El pivote de la primera columna es 3 (fila 1).',
      'Se elimina la x de la segunda ecuación: F₂ ← F₂ − (1/3)F₁.',
      'Queda una ecuación con y; se despeja y = 4.',
      'Se sustituye en la primera ecuación y se obtiene x = 2.',
    ],
    algoritmo: 'Gauss con pivoteo parcial y sustitución regresiva.',
    criterio: 'La solución debe cumplir 3x + y = 10 y x + 2y = 10.',
    conclusion: 'La solución es x = (2, 4). Comprobación: 3(2) + 4 = 10 y 2 + 2(4) = 10.',
    calculo: {
      A: [
        [3, 1],
        [1, 2],
      ],
      b: [10, 10],
      etiqueta: 'Sistema 2×2',
    },
  },
  {
    id: 'gauss-ejemplo-presupuesto',
    titulo: 'Presupuesto de tres áreas',
    tipo: 'casuistica',
    enunciado:
      'Una empresa reparte 30 unidades de presupuesto entre tres áreas. El área 1 recibe x, ' +
      'el área 2 recibe y y el área 3 recibe z. Se sabe que x + y + z = 30, que 2x + y + 3z = 65 ' +
      'y que x + 2y + z = 40. ¿Cuánto recibe cada área?',
    planteamiento: 'Plantear el sistema 3×3 y resolverlo por eliminación de Gauss.',
    parametros: [
      { etiqueta: 'Incógnitas', valor: 'x, y, z (unidades de presupuesto)' },
      { etiqueta: 'Ecuaciones', valor: '3' },
    ],
    extraccion: {
      busqueda: 'Cada ecuación representa una restricción de reparto.',
      datos: [
        { simbolo: 'x', valor: 'área 1', queEs: 'Unidades asignadas al área 1.' },
        { simbolo: 'y', valor: 'área 2', queEs: 'Unidades asignadas al área 2.' },
        { simbolo: 'z', valor: 'área 3', queEs: 'Unidades asignadas al área 3.' },
      ],
      formulacion: 'La suma total es 30; las otras dos ecuaciones fijan proporciones entre áreas.',
    },
    interpretacion:
      'Las tres asignaciones deben ser no negativas y sumar el presupuesto total.',
    pasos: [
      'Escribir A = [[1, 1, 1], [2, 1, 3], [1, 2, 1]] y b = (30, 65, 40).',
      'Eliminar la primera incógnita de las otras dos ecuaciones.',
      'Eliminar la segunda incógnita de la tercera.',
      'Despejar z, y, x y comprobar la suma.',
    ],
    algoritmo: 'Gauss con pivoteo parcial.',
    criterio: 'Las tres asignaciones deben sumar 30 y satisfacer las proporciones.',
    conclusion:
      'La solución es x = (5, 10, 15): 5 + 10 + 15 = 30, 2(5) + 10 + 3(15) = 65 y ' +
      '5 + 2(10) + 15 = 40.',
    calculo: {
      A: [
        [1, 1, 1],
        [2, 1, 3],
        [1, 2, 1],
      ],
      b: [30, 65, 40],
      etiqueta: 'Reparto de presupuesto',
    },
  },
  {
    id: 'gauss-ejemplo-mezcla',
    titulo: 'Mezcla de tres insumos',
    tipo: 'casuistica',
    enunciado:
      'Una planta combina tres insumos. Las cantidades x, y, z cumplen x + y + z = 9, ' +
      '2x + y = 7 y x + y + 2z = 13 (en toneladas). ¿Cuánto se usa de cada insumo?',
    planteamiento: 'Armar el sistema y resolverlo por eliminación de Gauss.',
    parametros: [
      { etiqueta: 'Incógnitas', valor: 'x, y, z (toneladas)' },
      { etiqueta: 'Ecuaciones', valor: '3' },
    ],
    extraccion: {
      busqueda: 'Cada ecuación representa una restricción de cantidad o de composición.',
      datos: [
        { simbolo: 'x', valor: 'insumo 1', queEs: 'Toneladas del primer insumo.' },
        { simbolo: 'y', valor: 'insumo 2', queEs: 'Toneladas del segundo insumo.' },
        { simbolo: 'z', valor: 'insumo 3', queEs: 'Toneladas del tercer insumo.' },
      ],
      formulacion:
        'La suma total da 9; la segunda ecuación relaciona x e y; la tercera relaciona y y z.',
    },
    interpretacion:
      'Las tres restricciones deben cumplirse a la vez. Si alguna cantidad saliera negativa, ' +
      'el planteo no sería físicamente posible.',
    pasos: [
      'Escribir A = [[1, 1, 1], [2, 1, 0], [1, 1, 2]] y b = (9, 7, 13).',
      'Eliminar la primera incógnita de la segunda y la tercera ecuación.',
      'Eliminar la segunda incógnita de la tercera.',
      'Despejar z, y y x en ese orden.',
    ],
    algoritmo: 'Gauss con pivoteo parcial; la matriz no necesita intercambios.',
    criterio: 'Las tres cantidades deben ser positivas y satisfacer las tres ecuaciones.',
    conclusion:
      'La solución es x = (2, 3, 4) toneladas. Comprobación: 2 + 3 + 4 = 9, ' +
      '2(2) + 3 = 7 y 2 + 3 + 2(4) = 13.',
    calculo: {
      A: [
        [1, 1, 1],
        [2, 1, 0],
        [1, 1, 2],
      ],
      b: [9, 7, 13],
      etiqueta: 'Mezcla de tres insumos',
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
  ],
  interpretacion: 'Resolver el sistema y comprobar la solución en las ecuaciones originales.',
  pasos: [
    'Escribir la matriz aumentada [A | b].',
    'Aplicar pivoteo parcial y eliminar debajo de cada pivote.',
    'Despejar las incógnitas por sustitución regresiva.',
    'Calcular el residuo para verificar la solución.',
  ],
  algoritmo: 'Eliminación de Gauss con pivoteo parcial.',
  criterio: 'La solución debe dejar un residuo máximo prácticamente nulo.',
  conclusion,
  pista,
  calculo: { A, b, etiqueta: titulo },
});

export const EJERCICIOS_ELIMINACION_GAUSS: EjercicioModulo2[] = [
  ejercicio(
    'gauss-ejercicio-1',
    'Sistema 2×2',
    'Resolver 4x + y = 9, x + 3y = 5.',
    [
      [4, 1],
      [1, 3],
    ],
    [9, 5],
    'La solución es x = (2, 1): 4(2) + 1 = 9 y 2 + 3(1) = 5.',
    'El pivote de la primera columna ya es el mayor: 4.',
  ),
  ejercicio(
    'gauss-ejercicio-2',
    'Tres incógnitas con coeficientes mixtos',
    'Resolver x + y + z = 6, 2x − y + z = 3, x + 2y − z = 2.',
    [
      [1, 1, 1],
      [2, -1, 1],
      [1, 2, -1],
    ],
    [6, 3, 2],
    'La solución es x = (1, 2, 3): 1 + 2 + 3 = 6, 2 − 2 + 3 = 3 y 1 + 4 − 3 = 2.',
  ),
  ejercicio(
    'gauss-ejercicio-3',
    'Matriz tridiagonal',
    'Resolver 2x − y = 0, −x + 2y − z = 0, −y + 2z = 10.',
    [
      [2, -1, 0],
      [-1, 2, -1],
      [0, -1, 2],
    ],
    [0, 0, 10],
    'La solución es x = (2.5, 5, 7.5). El residuo es ≈ 0.',
    'La estructura tridiagonal hace que muchas operaciones sean sobre ceros.',
  ),
  ejercicio(
    'gauss-ejercicio-4',
    'Mezcla de dos productos',
    'Una mezcla usa x e y toneladas. Se sabe que x + y = 5 y 2x + y + z = 12, con z = 4. Plantear y resolver el sistema 3×3.',
    [
      [1, 1, 0],
      [2, 1, 1],
      [0, 0, 1],
    ],
    [5, 12, 4],
    'La solución es x = (3, 2, 4): 3 + 2 = 5, 6 + 2 + 4 = 12 y z = 4.',
    'Sustituí z = 4 en la segunda ecuación para reducir el trabajo.',
    'casuistica',
  ),
  ejercicio(
    'gauss-ejercicio-5',
    'Producción de tres líneas',
    'Tres líneas producen x, y, z unidades. Las restricciones son x + 2y + z = 80, 3x + y + z = 80 y x + y + 2z = 90.',
    [
      [1, 2, 1],
      [3, 1, 1],
      [1, 1, 2],
    ],
    [80, 80, 90],
    'La solución es x = (10, 20, 30): 10 + 40 + 30 = 80, 30 + 20 + 30 = 80 y 10 + 20 + 60 = 90.',
    'Las tres ecuaciones suman 2(x + y + z) = 250; usá eso para controlar.',
    'casuistica',
  ),
  ejercicio(
    'gauss-ejercicio-6',
    'Red eléctrica de tres mallas',
    'Las corrientes de una red cumplen 4i₁ − i₂ − i₃ = 10, −i₁ + 4i₂ − i₃ = 20 y −i₁ − i₂ + 4i₃ = 30.',
    [
      [4, -1, -1],
      [-1, 4, -1],
      [-1, -1, 4],
    ],
    [10, 20, 30],
    'La solución es i = (8, 10, 12) A. Las tres ecuaciones se cumplen y el residuo es ≈ 0.',
    'Sumá las tres ecuaciones: 2(i₁ + i₂ + i₃) = 60.',
    'casuistica',
  ),
];
