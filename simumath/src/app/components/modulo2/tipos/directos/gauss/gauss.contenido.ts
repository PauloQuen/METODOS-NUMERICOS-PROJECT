import type {
  ContenidoTeoriaSistema,
  EjemploSistema,
  EjercicioSistema,
} from '../../../../../shared/models/sistema.model';

/**
 * CONTENIDO DE LA ELIMINACIÓN GAUSSIANA CON PIVOTEO PARCIAL.
 *
 * ── Los números salen del motor, no de un libro ──────────────────────
 * Cada tabla, cada paso y cada conclusión de este archivo salieron de
 * correr el motor de verdad (`gauss.algoritmo.ts`) con los mismos datos
 * que están escritos acá. Si el algoritmo cambia, hay que recalcular el
 * archivo; el test `gauss.contenido.spec.ts` es el que lo vigila.
 *
 * ── Por qué la teoría NO usa "convergencia" ──────────────────────────
 * Un método directo no itera: no hay una sucesión que se acerque a la
 * respuesta, hay un número de operaciones fijo. Por eso este archivo no
 * promete un orden de convergencia como lo hace el Módulo 1. Lo que sí
 * se explica es lo que de verdad importa acá: el ERROR, que depende del
 * condicionamiento de la matriz.
 *
 * ── Las matrices se escriben en varias líneas ────────────────────────
 * El texto de los pasos lleva la matriz escrita con saltos de línea, y
 * el CSS los respeta (`white-space: pre-line`). Por eso el paso se lee
 * como en el cuaderno y no como un párrafo.
 */

/* ================================================================== */
/* TEORÍA                                                              */
/* ================================================================== */

export const TEORIA_GAUSS: ContenidoTeoriaSistema = {
  concepto:
    'La eliminación gaussiana es la forma de resolver un sistema lineal ' +
    'más usada del mundo. La idea es una sola: en vez de despejar las ' +
    'incógnitas una por una, se TRANSFORMA el sistema en otro más fácil ' +
    'pero equivalente. Se hacen operaciones sobre las filas (intercambiar ' +
    'dos filas, multiplicar una fila por un número, sumarle a una fila un ' +
    'múltiplo de otra) hasta que la matriz de coeficientes queda ' +
    'triangular, y entonces las incógnitas se despejan una detrás de ' +
    'otra por sustitución hacia atrás. El resultado es el mismo sistema ' +
    'resuelto de otra forma: por eso no se pierde nada en el camino.',
  fundamento:
    'Las tres operaciones permitidas son EQUIVALENTES: dejan el conjunto ' +
    'de soluciones intacto. Intercambiar dos filas solo cambia el orden ' +
    'en que están escritas las ecuaciones. Multiplicar una fila por un ' +
    'número distinto de cero divide esa ecuación por ese número, y sigue ' +
    'teniendo las mismas soluciones. Sumarle a una fila un múltiplo de otra ' +
    'agrega una ecuación que ya es consecuencia de las otras, así que no ' +
    'aporta ni quita soluciones. Con eso, la eliminación gaussiana es ' +
    'una cadena de equivalencias: el sistema final tiene exactamente las ' +
    'mismas soluciones que el original. Y un sistema triangular se resuelve ' +
    'sin ninguna dificultad: la última ecuación tiene una sola incógnita, ' +
    'la anterior tiene dos (una ya conocida), y así hacia arriba. ' +
    'Lo que hace el PIVOTEO PARCIAL es elegir, en cada columna, la fila ' +
    'con el mayor valor absoluto como pivote. El motivo es numérico: si ' +
    'el pivote es diminuto, al dividir por él los errores de redondeo se ' +
    'amplifican, y el resultado sale ensuciado. Con el pivoteo parcial el ' +
    'denominador es el más grande posible y el error se mantiene acotado.',
  cuandoFalla:
    'Falla por la matriz, no por el método. El caso grave es el pivote ' +
    'NULO: si al llegar a una columna todos los coeficientes de abajo son ' +
    'cero, esa columna no se puede eliminar y el método se detiene. Eso ' +
    'no es un error del algoritmo: significa que la matriz es SINGULAR, ' +
    'o sea que el sistema no tiene solución única (o no tiene solución, o ' +
    'tiene infinitas). El método lo avisa y no inventa una respuesta. El ' +
    'otro caso es el pivote MUY CHIQUITO: no es cero, así que el método ' +
    'sigue, pero al dividir por él el error de redondeo se amplifica y la ' +
    'solución sale con muchos decimales falsos. Ahí es donde el pivoteo ' +
    'parcial evita el problema, salvo que TODA la columna tenga valores ' +
    'diminutos. Y hay un límite que no es del método: la eliminación es ' +
    'de costo O(n³), o sea que resolver un sistema de 1000 ecuaciones a ' +
    'mano no es una opción.',
  ordenConvergencia:
    'Un método directo no tiene orden de convergencia, porque no itera: ' +
    'no hay una sucesión x₀, x₁, x₂, ... que se acerque a la respuesta. ' +
    'La cantidad de operaciones es fija y se conoce de antemano: para un ' +
    'sistema de n ecuaciones son n³/3 operaciones de la fase de ' +
    'eliminación, más n²/2 de la sustitución. Lo que en cambio importa es ' +
    'el ERROR, y ese lo mide el CONDICIONAMIENTO de la matriz. Si la ' +
    'matriz está bien condicionada, un error de redondeo de ε en los ' +
    'datos produce un error de ε·κ en la solución. Si está mal ' +
    'condicionada (κ enorme, o sea que hay casi-dependencias entre las ' +
    'ecuaciones), el mismo ε produce un error grande. Por eso dos ' +
    'sistemas con las MISMAS cuentas pueden dar soluciones muy distintas: ' +
    'no es que el método falle, es que el problema está mal condicionado.',
  recursos: [
    {
      titulo: 'Eliminación de Gauss-Jordan (Wikipedia, español)',
      url: 'https://es.wikipedia.org/wiki/Eliminaci%C3%B3n_de_Gauss-Jordan',
      tipo: 'lectura',
      descripcion: 'Las operaciones elementales, la triangularización y la sustitución hacia atrás.',
    },
    {
      titulo: 'Gaussian Elimination (MathWorld)',
      url: 'https://mathworld.wolfram.com/GaussianElimination.html',
      tipo: 'lectura',
      descripcion: 'El algoritmo matricial y el papel del pivoteo en la estabilidad numérica.',
    },
    {
      titulo: 'Videos de repaso: eliminación gaussiana',
      url: 'https://www.youtube.com/results?search_query=eliminacion+gaussiana',
      tipo: 'video',
      descripcion: 'Sistemas resueltos con matriz aumentada y pivoteo paso a paso.',
    },
  ],

  algoritmo: {
    formula:
      'mᵢₖ = aᵢₖ / aₖₖ   ·   Rᵢ ← Rᵢ − mᵢₖ · Rₖ   (i = k+1, ..., n)',
    criterios: [
      {
        nombre: 'Pivote no nulo',
        explicacion:
          'Antes de dividir, se verifica que el pivote de la columna no sea ' +
          'cero. Si lo es, la matriz es singular y el sistema no tiene ' +
          'solución única: el método se detiene y avisa.',
      },
      {
        nombre: 'Pivoteo parcial',
        explicacion:
          'En cada columna se busca la fila con el mayor valor absoluto y se ' +
          'la trae al lugar del pivote. No es un capricho: divide por el ' +
          'número más grande posible y así el error de redondeo no se ' +
          'amplifica tanto.',
      },
      {
        nombre: 'Residuo ‖Ax − b‖∞',
        explicacion:
          'La comprobación final: se vuelve a multiplicar A por la solución ' +
          'obtenida y se compara con b. Un residuo chiquito dice que la ' +
          'solución es buena, y no necesita conocer la solución verdadera.',
      },
    ],
    pasos: [
      'Se escribe la matriz aumentada [A | b]: a la izquierda los coeficientes, a la derecha el lado de cada ecuación.',
      'Para cada columna k = 1, ..., n−1: se busca, entre las filas de abajo, la que tenga el MAYOR valor absoluto en esa columna, y se intercambia con la fila k (pivoteo parcial).',
      'Si el pivote aₖₖ es cero, la matriz es singular: el sistema no tiene solución única y el método se detiene.',
      'Para cada fila i = k+1, ..., n: se calcula el factor mᵢₖ = aᵢₖ / aₖₖ y se reemplaza la fila i por Rᵢ − mᵢₖ · Rₖ. Así el coeficiente de la columna k en esa fila queda en cero.',
      'Al terminar, la matriz es triangular superior y el sistema se resuelve por sustitución hacia atrás: de la última ecuación se despeja la última incógnita, y se sube.',
      'Se comprueba el resultado calculando el residuo ‖Ax − b‖∞.',
    ],
    ventajas: [
      'Es el método más usado en la práctica: resolver un sistema de n ecuaciones es tan común que casi todos los programas de álgebra lo implementan.',
      'Es exacto en aritmética exacta: no hay aproximaciones acumuladas como en los métodos iterativos.',
      'El pivoteo parcial mantiene acotado el error de redondeo sin necesidad de un análisis previo.',
      'Se puede aplicar a sistemas rectangulares (más ecuaciones que incógnitas) sin cambiar nada del algoritmo.',
    ],
    limitaciones: [
      'Es de costo O(n³): resolver un sistema de miles de ecuaciones a mano es inviable.',
      'Se para en seco con las matrices singulares: no hay solución única y el método no puede inventarla.',
      'Si la matriz está mal condicionada, la solución sale con muchos decimales que no son ciertos; el método no avisa, solo lo delata el residuo grande.',
      'Cada vez que se resuelve el mismo sistema con un lado derecho distinto, hay que repetir toda la eliminación.',
    ],
    recomendaciones: [
      'Siempre con pivoteo parcial: el costo extra es ridículo (comparar n números por columna) y el beneficio es enorme.',
      'Si el sistema se va a resolver varias veces con distintos lados derechos, usar la factorización LU: la eliminación se hace UNA vez y después cada resolución es solo una sustitución.',
      'Mirar el residuo ‖Ax − b‖∞ antes de entregar la respuesta: es la única forma barata de saber si la solución es de fiar.',
      'Redondear SOLO al final. Si se redondea en el medio, los errores se acumulan y la solución sale peor.',
    ],
  },
  ejemploNormal: {
    id: 'gauss-ej-teoria-numerico',
    titulo: 'Sistema de tres ecuaciones con dos pivoteos',
    tipo: 'numerico',
    ecuacion:
      '2x₁ + x₂ − x₃ = 8\n' +
      '−3x₁ − x₂ + 2x₃ = −11\n' +
      '−2x₁ + x₂ + 2x₃ = −3',
    parametros: [
      { etiqueta: 'Matriz A', valor: '[[2, 1, −1], [−3, −1, 2], [−2, 1, 2]]' },
      { etiqueta: 'Lado derecho b', valor: '[8, −11, −3]' },
    ],
    interpretacion:
      'Cada ecuación es un plano en el espacio de tres dimensiones, y la ' +
      'solución es el punto donde los tres planos se cortan. Acá ese punto ' +
      'es (2, 3, −1). El método no lo busca geométricamente: lo construye ' +
      'con cuentas, triangularizando el sistema paso a paso. En el gráfico ' +
      'se ve el sistema desde el plano: con tres incógnitas no se puede ' +
      'dibujar el punto de solución, pero sí se ven las rectas que cada ' +
      'ecuación produce al fijar una de las incógnitas.',
    pasos: [
      'Paso 1 — Pivoteo de la columna 1. Los valores de la primera columna ' +
        'son 2, −3 y −2. El mayor valor absoluto es 3 (fila 2), así que se ' +
        'intercambian las filas 1 y 2:\n' +
        '[−3  −1   2 | −11]\n' +
        '[ 2   1  −1 |   8]\n' +
        '[−2   1   2 |  −3]',
      'Paso 2 — Eliminación de la columna 1. El factor de la fila 2 es ' +
        '2 / (−3) = −0.6667 y el de la fila 3 es −2 / (−3) = 0.6667:\n' +
        '[−3  −1      2      | −11    ]\n' +
        '[ 0   0.3333 0.3333 |   0.6667]\n' +
        '[ 0   1.6667 0.6667 |   4.3333]',
      'Paso 3 — Pivoteo de la columna 2. Entre las filas 2 y 3 los valores ' +
        'son 0.3333 y 1.6667. El mayor es 1.6667, así que se intercambian ' +
        'las filas 2 y 3:\n' +
        '[−3  −1      2      | −11    ]\n' +
        '[ 0   1.6667 0.6667 |   4.3333]\n' +
        '[ 0   0.3333 0.3333 |   0.6667]',
      'Paso 4 — Eliminación de la columna 2. El factor es 0.3333 / 1.6667 ' +
        '= 0.2 y la tercera fila queda:\n' +
        '[−3  −1      2      | −11    ]\n' +
        '[ 0   1.6667 0.6667 |   4.3333]\n' +
        '[ 0   0      0.2    |  −0.2  ]',
      'Paso 5 — Sustitución hacia atrás. Primero x₃ = −0.2 / 0.2 = −1. ' +
        'Después x₂ = (4.3333 − 0.6667·(−1)) / 1.6667 = 5 / 1.6667 = 3. ' +
        'Por último x₁ = (−11 + 3 + 2) / (−3) = 2.',
    ],
    algoritmo:
      'Dos pivoteos, tres eliminaciones y tres sustituciones: ocho pasos ' +
      'en total. El pivoteo parcial hizo su trabajo dos veces: en la ' +
      'primera columna eligió el −3 en vez del 2, y en la segunda eligió el ' +
      '1.6667 en vez del 0.3333. Sin pivoteo, la primera eliminación ' +
      'habría dividido por 2 y por −2 en lugar de por −3, y los factores ' +
      '−0.3333 y 0.6667 habrían dejado los decimales del resto de las ' +
      'filas bastante más sucios.',
    criterio:
      'No hay criterio de parada: el método es de un número fijo de pasos ' +
      'y termina cuando la matriz queda triangular. La comprobación final ' +
      'es el residuo, que en este caso quedó en cero.',
    conclusion:
      'La solución del sistema es x₁ = 2, x₂ = 3, x₃ = −1. El residuo ' +
      '‖Ax − b‖∞ quedó en cero: la solución cumple las tres ecuaciones ' +
      'exactamente. Con ocho pasos (dos pivoteos, tres eliminaciones y ' +
      'tres sustituciones) se resolvió un sistema de tres ecuaciones.',
    calculo: {
      A: [
        [2, 1, -1],
        [-3, -1, 2],
        [-2, 1, 2],
      ],
      b: [8, -11, -3],
    },
  },
  ejemploCasuistica: {
    id: 'gauss-ej-teoria-casuistica',
    titulo: 'Acero para dos tipos de piezas',
    tipo: 'casuistica',
    enunciado:
      'Una fábrica hace dos tipos de piezas. La pieza A usa 2 kg de acero y ' +
      'la pieza B usa 3 kg. Hay 120 kg de acero disponibles y se ' +
      'fabrican 50 piezas en total. ¿Cuántas piezas de cada tipo hay que ' +
      'hacer para usar exactamente el acero disponible?',
    ecuacion: '2a + 3b = 120\na + b = 50',
    parametros: [
      { etiqueta: 'Incógnita a', valor: 'cantidad de piezas A (2 kg de acero cada una)' },
      { etiqueta: 'Incógnita b', valor: 'cantidad de piezas B (3 kg de acero cada una)' },
      { etiqueta: 'Acero disponible', valor: '120 kg' },
      { etiqueta: 'Piezas totales', valor: '50' },
    ],
    extraccion: {
      busqueda:
        'El enunciado esconde dos ecuaciones: una de ACERO (la que habla ' +
        'de los 120 kg) y una de CANTIDAD (la que habla de las 50 piezas). ' +
        'Cada ecuación necesita su incógnita y su lado derecho.',
      datos: [
        {
          simbolo: 'a',
          valor: '?',
          queEs: 'cantidad de piezas de tipo A (cada una usa 2 kg de acero)',
        },
        {
          simbolo: 'b',
          valor: '?',
          queEs: 'cantidad de piezas de tipo B (cada una usa 3 kg de acero)',
        },
        {
          simbolo: '2a + 3b',
          valor: '120',
          queEs: 'kilogramos de acero que hay que gastar',
        },
        {
          simbolo: 'a + b',
          valor: '50',
          queEs: 'piezas que hay que fabricar en total',
        },
      ],
      formulacion:
        'La primera ecuación sale de la regla de los tres: cada pieza A ' +
        'gasta 2 kg y cada pieza B 3 kg, y el total tiene que ser 120 kg. ' +
        'La segunda sale de un conteo simple: las piezas de los dos tipos ' +
        'suman 50. Con eso, el sistema a resolver es 2a + 3b = 120 y ' +
        'a + b = 50.',
    },
    interpretacion:
      'Acá cada incógnita es una CANTIDAD: no puede ser negativa y no ' +
      'tiene por qué ser entera (aunque en este caso va a serlo). La ' +
      'solución, (30, 20), dice que hay que hacer 30 piezas A y 20 piezas B. ' +
      'La gráfica ayuda a entenderlo: las dos rectas se cortan en ese ' +
      'punto, y como el problema pide cantidades, el punto tiene que ' +
      'estar en el primer cuadrante.',
    pasos: [
      'Paso 1 — El sistema como matriz aumentada:\n' +
        '[ 2   3 | 120]\n' +
        '[ 1   1 |  50]',
      'Paso 2 — Pivoteo. En la primera columna los valores son 2 y 1: el ' +
        'mayor es 2 y ya está en la fila 1, así que NO hay intercambio.',
      'Paso 3 — Eliminación. El factor de la fila 2 es 1 / 2 = 0.5 y la ' +
        'fila 2 queda:\n' +
        '[ 2   3   | 120]\n' +
        '[ 0  −0.5 | −10]',
      'Paso 4 — Sustitución hacia atrás. Primero b = −10 / −0.5 = 20, y ' +
        'después a = (120 − 3·20) / 2 = 30.',
    ],
    algoritmo:
      'Un solo pivoteo, una sola eliminación y dos sustituciones: tres ' +
      'pasos. El pivoteo parcial no movió nada porque el 2 ya era el mayor ' +
      'valor absoluto de la columna; el método siempre compara, y cuando ' +
      'el mayor ya está en su lugar no hay nada que cambiar.',
    criterio:
      'El método es directo: no hay criterio de parada. La comprobación es ' +
      'el residuo, que en este caso también quedó en cero.',
    conclusion:
      'Hay que fabricar 30 piezas de tipo A y 20 de tipo B. Se verifica ' +
      'volviendo al enunciado: 30·2 + 20·3 = 60 + 60 = 120 kg de acero, y ' +
      '30 + 20 = 50 piezas. Las dos condiciones del problema se cumplen, y ' +
      'el residuo ‖Ax − b‖∞ quedó en cero.',
    calculo: {
      A: [
        [2, 3],
        [1, 1],
      ],
      b: [120, 50],
    },
  },
};

/* ================================================================== */
/* EJEMPLOS                                                            */
/* ================================================================== */

export const EJEMPLOS_GAUSS: EjemploSistema[] = [
  {
    id: 'gauss-ej-1',
    titulo: 'Sistema de 2×2 que obliga a pivotear',
    tipo: 'numerico',
    ecuacion: '0·x₁ + x₂ = 1\n2x₁ − 3x₂ = 8',
    parametros: [
      { etiqueta: 'Matriz A', valor: '[[0, 1], [2, −3]]' },
      { etiqueta: 'Lado derecho b', valor: '[1, 8]' },
    ],
    interpretacion:
      'La primera ecuación tiene el coeficiente de x₁ en cero, así que la ' +
      'eliminación NO puede empezar por ahí: dividir por cero no se puede. ' +
      'El pivoteo parcial tiene que traer la fila 2, que tiene un 2 en esa ' +
      'columna. La solución es (5.5, 1), y el gráfico muestra cómo las ' +
      'dos rectas se cortan en ese punto.',
    pasos: [
      'Paso 1 — Pivoteo parcial. En la primera columna los valores son 0 y ' +
        '2. El mayor valor absoluto es 2 (fila 2), así que se intercambian ' +
        'las filas:\n' +
        '[ 2  −3 |  8]\n' +
        '[ 0   1 |  1]',
      'Paso 2 — Eliminación. La fila 2 ya tiene un cero en la primera ' +
        'columna, así que no hay nada que eliminar y no se anota ningún ' +
        'paso de eliminación.',
      'Paso 3 — Sustitución hacia atrás. Primero x₂ = 1 / 1 = 1, y ' +
        'después x₁ = (8 + 3·1) / 2 = 5.5.',
    ],
    algoritmo:
      'Un pivoteo, ninguna eliminación y dos sustituciones. La eliminación ' +
      'no hizo nada porque, después del intercambio, la fila 2 ya tenía un ' +
      'cero en la columna 1. Ese es un caso normal: el pivoteo puede dejar ' +
      'el sistema tan limpio que la eliminación sobra.',
    criterio:
      'Método directo: sin criterio de parada. La verificación es el ' +
      'residuo ‖Ax − b‖∞, que quedó en cero.',
    conclusion:
      'La solución es x₁ = 5.5, x₂ = 1. Verificación: 0·5.5 + 1·1 = 1 y ' +
      '2·5.5 − 3·1 = 8, las dos ecuaciones del sistema. El residuo quedó en ' +
      'cero.',
    calculo: {
      A: [
        [0, 1],
        [2, -3],
      ],
      b: [1, 8],
    },
  },
  {
    id: 'gauss-ej-2',
    titulo: 'Sistema de 3×3 donde no hace falta pivotear',
    tipo: 'numerico',
    ecuacion:
      '4x₁ + x₂ + x₃ = 13\n' +
      '2x₁ − 3x₂ + x₃ = −1\n' +
      'x₁ + 2x₂ + x₃ = 6',
    parametros: [
      { etiqueta: 'Matriz A', valor: '[[4, 1, 1], [2, −3, 1], [1, 2, 1]]' },
      { etiqueta: 'Lado derecho b', valor: '[13, −1, 6]' },
    ],
    interpretacion:
      'Un sistema de tres ecuaciones con tres incógnitas, cuya solución es ' +
      '(3, 2, −1). Sirve de contraste con el ejemplo anterior: acá el ' +
      'pivoteo parcial compara las filas y NO encuentra nada que ' +
      'reordenar, porque en las dos columnas el mayor valor absoluto ya ' +
      'estaba en su lugar. El pivoteo parcial siempre compara; si el ' +
      'mayor ya está arriba, no hay nada que cambiar.',
    pasos: [
      'Paso 1 — Pivoteo de la columna 1. Los valores son 4, 2 y 1: el ' +
        'mayor es 4 y ya está en la fila 1, así que no hay intercambio. ' +
        'En la columna 2 los valores de las filas 2 y 3 son −3 y 2: ' +
        'también está el mayor en su lugar.',
      'Paso 2 — Eliminación de la columna 1. Los factores son 2 / 4 = 0.5 ' +
        'y 1 / 4 = 0.25:\n' +
        '[ 4   1    1   |  13   ]\n' +
        '[ 0  −3.5  0.5  |  −7.5  ]\n' +
        '[ 0   1.75 0.75 |   2.75 ]',
      'Paso 3 — Eliminación de la columna 2. El factor es 1.75 / (−3.5) = ' +
        '−0.5 y la tercera fila queda:\n' +
        '[ 4   1    1   |  13   ]\n' +
        '[ 0  −3.5  0.5  |  −7.5  ]\n' +
        '[ 0   0    1   |  −1   ]',
      'Paso 4 — Sustitución hacia atrás. x₃ = −1 / 1 = −1, ' +
        'x₂ = (−7.5 − 0.5·(−1)) / (−3.5) = 2, y ' +
        'x₁ = (13 − 2 − (−1)) / 4 = 3.',
    ],
    algoritmo:
      'Ninguna eliminación desperdiciada por un pivoteo: tres ' +
      'eliminaciones y tres sustituciones, seis pasos en total. El pivoteo ' +
      'parcial no intervino, y esa es la respuesta honesta: no siempre ' +
      'hace falta. Cuando el sistema ya viene "ordenado", el método es ' +
      'más corto.',
    criterio:
      'Método directo: sin criterio de parada. La verificación es el ' +
      'residuo ‖Ax − b‖∞, que quedó en cero.',
    conclusion:
      'La solución es x₁ = 3, x₂ = 2, x₃ = −1. Verificación en las tres ' +
      'ecuaciones: 4·3 + 2 − 1 = 13, 2·3 − 3·2 − 1 = −1 y ' +
      '3 + 2·2 − 1 = 6. El residuo ‖Ax − b‖∞ quedó en cero.',
    calculo: {
      A: [
        [4, 1, 1],
        [2, -3, 1],
        [1, 2, 1],
      ],
      b: [13, -1, 6],
    },
  },
  {
    id: 'gauss-ej-3',
    titulo: 'Piezas por turno: el sistema del taller',
    tipo: 'casuistica',
    enunciado:
      'En un taller se fabrican dos tipos de piezas. La pieza P usa 4 ' +
      'minutos de máquina y la pieza Q usa 6 minutos. En el turno hay 120 ' +
      'minutos de máquina disponibles y se entregan 28 piezas en total. ' +
      '¿Cuántas de cada tipo hay que fabricar?',
    ecuacion: '4p + 6q = 120\np + q = 28',
    parametros: [
      { etiqueta: 'Incógnita p', valor: 'piezas tipo P (4 minutos de máquina cada una)' },
      { etiqueta: 'Incógnita q', valor: 'piezas tipo Q (6 minutos de máquina cada una)' },
      { etiqueta: 'Minutos de máquina', valor: '120' },
      { etiqueta: 'Piezas entregadas', valor: '28' },
    ],
    extraccion: {
      busqueda:
        'Dos reglas distintas dan dos ecuaciones: los MINUTOS de máquina ' +
        'y la CANTIDAD de piezas.',
      datos: [
        { simbolo: 'p', valor: '?', queEs: 'piezas tipo P que hay que fabricar' },
        { simbolo: 'q', valor: '?', queEs: 'piezas tipo Q que hay que fabricar' },
        {
          simbolo: '4p + 6q',
          valor: '120',
          queEs: 'minutos de máquina que hay que gastar en el turno',
        },
        { simbolo: 'p + q', valor: '28', queEs: 'piezas entregadas en el turno' },
      ],
      formulacion:
        'Cada pieza P ocupa 4 minutos de máquina y cada Q 6, y el turno ' +
        'tiene 120 minutos: de ahí 4p + 6q = 120. La cantidad entregada ' +
        'es 28: de ahí p + q = 28.',
    },
    interpretacion:
      'Las dos ecuaciones se pueden ver como rectas: la primera dice ' +
      'cuántas piezas caben según los minutos de máquina, la segunda dice ' +
      'cuántas se entregan. Su intersección, (24, 4), es la respuesta. El ' +
      'gráfico es especialmente útil acá: muestra de un vistazo que hay ' +
      'una única combinación posible, y no un rango.',
    pasos: [
      'Paso 1 — El sistema como matriz aumentada:\n' +
        '[ 4   6 | 120]\n' +
        '[ 1   1 |  28]',
      'Paso 2 — Pivoteo. En la primera columna los valores son 4 y 1: el ' +
        'mayor es 4 y ya está en la fila 1, así que no hay intercambio.',
      'Paso 3 — Eliminación. El factor de la fila 2 es 1 / 4 = 0.25 y la ' +
        'fila 2 queda:\n' +
        '[ 4   6   | 120]\n' +
        '[ 0  −0.5 |  −2]',
      'Paso 4 — Sustitución hacia atrás. Primero q = −2 / −0.5 = 4, y ' +
        'después p = (120 − 6·4) / 4 = 24.',
    ],
    algoritmo:
      'Ningún pivoteo, una eliminación y dos sustituciones: tres pasos. ' +
      'Es el caso más corto: cuando la primera columna ya tiene al mayor ' +
      'valor absoluto arriba, el método no tiene nada que reordenar.',
    criterio:
      'Método directo: sin criterio de parada. La verificación es el ' +
      'residuo ‖Ax − b‖∞, que quedó en cero.',
    conclusion:
      'Hay que fabricar 24 piezas tipo P y 4 tipo Q. Comprobación: ' +
      '24·4 + 4·6 = 96 + 24 = 120 minutos de máquina, y 24 + 4 = 28 piezas ' +
      'entregadas. El residuo ‖Ax − b‖∞ quedó en cero.',
    calculo: {
      A: [
        [4, 6],
        [1, 1],
      ],
      b: [120, 28],
    },
  },
];

/* ================================================================== */
/* EJERCICIOS                                                          */
/* ================================================================== */

export const EJERCICIOS_GAUSS: EjercicioSistema[] = [
  {
    id: 'gauss-ex-1',
    titulo: 'Resolver un sistema de 2×2',
    tipo: 'numerico',
    ecuacion: '3x₁ + 2x₂ = 12\n2x₁ − x₂ = 1',
    parametros: [
      { etiqueta: 'Matriz A', valor: '[[3, 2], [2, −1]]' },
      { etiqueta: 'Lado derecho b', valor: '[12, 1]' },
    ],
    interpretacion:
      'Un sistema de dos ecuaciones con dos incógnitas. La solución es el ' +
      'punto donde se cortan las dos rectas, y el método la encuentra con ' +
      'cuentas: primero triangulariza y después despeja.',
    pasos: [
      'Paso 1 — Pivoteo. En la primera columna los valores son 3 y 2: el ' +
        'mayor valor absoluto es 3 y ya está en la fila 1, así que NO hay ' +
        'intercambio.\n' +
        '[ 3   2 | 12]\n' +
        '[ 2  −1 |  1]',
      'Paso 2 — Eliminación. El factor de la fila 2 es 2 / 3 = 0.6667 y la ' +
        'fila 2 queda:\n' +
        '[ 3   2      | 12]\n' +
        '[ 0  −2.3333 | −7]',
      'Paso 3 — Sustitución hacia atrás. Primero x₂ = −7 / −2.3333 = 3, y ' +
        'después x₁ = (12 − 2·3) / 3 = 2.',
    ],
    algoritmo:
      'Una eliminación y dos sustituciones: tres pasos. El pivoteo parcial ' +
      'comparó los valores 3 y 2 de la primera columna y no movió nada, ' +
      'porque el 3 ya estaba en la fila 1.',
    criterio:
      'Método directo: sin criterio de parada. La verificación es el ' +
      'residuo ‖Ax − b‖∞, que quedó en cero.',
    conclusion:
      'La solución es x₁ = 2, x₂ = 3. Verificación: 3·2 + 2·3 = 12 y ' +
      '2·2 − 3 = 1, las dos ecuaciones del sistema. El residuo ‖Ax − b‖∞ ' +
      'quedó en cero.',
    pista:
      'En la primera columna los valores son 3 y 2: el mayor es 3 y ya ' +
      'está arriba, así que no hay pivoteo. Después de la eliminación, la ' +
      'fila 2 queda con un solo coeficiente y de ahí sale x₂.',
    calculo: {
      A: [
        [3, 2],
        [2, -1],
      ],
      b: [12, 1],
    },
  },
  {
    id: 'gauss-ex-2',
    titulo: 'Resolver un sistema de 3×3 que necesita dos pivoteos',
    tipo: 'numerico',
    ecuacion:
      '0·x₁ + x₂ − x₃ = −1\n' +
      'x₁ + 3x₂ − x₃ = 4\n' +
      '−x₁ + x₂ + 2x₃ = 7',
    parametros: [
      { etiqueta: 'Matriz A', valor: '[[0, 1, −1], [1, 3, −1], [−1, 1, 2]]' },
      { etiqueta: 'Lado derecho b', valor: '[−1, 4, 7]' },
    ],
    interpretacion:
      'La primera columna arranca con un cero, así que el método no puede ' +
      'eliminar usando la primera fila: el pivoteo parcial tiene que ' +
      'traer una de las otras. Y en la segunda columna pasa algo parecido. ' +
      'La solución es (1, 2, 3).',
    pasos: [
      'Paso 1 — Pivoteo de la columna 1. Los valores son 0, 1 y −1: el ' +
        'mayor valor absoluto es 1 (fila 2), así que se intercambian las ' +
        'filas 1 y 2.\n' +
        '[ 1   3  −1 |  4]\n' +
        '[ 0   1  −1 | −1]\n' +
        '[−1   1   2 |  7]',
      'Paso 2 — Eliminación de la columna 1. El factor de la fila 3 es ' +
        '−1 / 1 = −1 y la fila 3 queda:\n' +
        '[ 1   3  −1 |  4]\n' +
        '[ 0   1  −1 | −1]\n' +
        '[ 0   4   1 | 11]',
      'Paso 3 — Pivoteo de la columna 2. Los valores son 1 y 4: el mayor ' +
        'es 4 (fila 3), así que se intercambian las filas 2 y 3.\n' +
        '[ 1   3  −1 |  4]\n' +
        '[ 0   4   1 | 11]\n' +
        '[ 0   1  −1 | −1]',
      'Paso 4 — Eliminación de la columna 2. El factor es 1 / 4 = 0.25 y la ' +
        'tercera fila queda:\n' +
        '[ 1   3     −1   |  4    ]\n' +
        '[ 0   4      1   | 11    ]\n' +
        '[ 0   0     −1.25 | −3.75 ]',
      'Paso 5 — Sustitución hacia atrás. x₃ = −3.75 / −1.25 = 3, ' +
        'x₂ = (11 − 1·3) / 4 = 2 y x₁ = (4 − 3·2 + 1·3) / 1 = 1.',
    ],
    algoritmo:
      'Dos pivoteos, dos eliminaciones y tres sustituciones: siete pasos. ' +
      'Los dos pivoteos fueron necesarios: en la primera columna había un ' +
      '0, y en la segunda el valor 1 quedaba debajo del 4.',
    criterio:
      'Método directo: sin criterio de parada. La verificación es el ' +
      'residuo ‖Ax − b‖∞, que quedó en cero.',
    conclusion:
      'La solución es x₁ = 1, x₂ = 2, x₃ = 3. Verificación: 0·1 + 2 − 3 = ' +
      '−1, 1 + 3·2 − 3 = 4 y −1 + 2 + 2·3 = 7. El residuo ‖Ax − b‖∞ ' +
      'quedó en cero.',
    pista:
      'Fijate en la primera columna: hay un 0, un 1 y un −1. El pivoteo ' +
      'parcial compara los tres valores absolutos y elige el mayor. Después ' +
      'mirá la segunda columna: el −1 y el 4, de nuevo con un intercambio.',
    calculo: {
      A: [
        [0, 1, -1],
        [1, 3, -1],
        [-1, 1, 2],
      ],
      b: [-1, 4, 7],
    },
  },
  {
    id: 'gauss-ex-3',
    titulo: 'Un sistema sin solución única',
    tipo: 'numerico',
    ecuacion: 'x₁ + 2x₂ = 3\n2x₁ + 4x₂ = 6',
    parametros: [
      { etiqueta: 'Matriz A', valor: '[[1, 2], [2, 4]]' },
      { etiqueta: 'Lado derecho b', valor: '[3, 6]' },
    ],
    interpretacion:
      'La segunda ecuación es el DOBLE de la primera. Las dos rectas se ' +
      'superponen: hay infinitas soluciones, no una sola. El método tiene ' +
      'que detectar eso y avisar, en vez de devolver un número cualquiera.',
    pasos: [
      'Paso 1 — Pivoteo de la columna 1. Los valores son 1 y 2: el mayor ' +
        'valor absoluto es 2 (fila 2), así que se intercambian las filas 1 ' +
        'y 2.\n' +
        '[ 2   4 | 6]\n' +
        '[ 1   2 | 3]',
      'Paso 2 — Eliminación de la columna 1. El factor de la fila 2 es ' +
        '1 / 2 = 0.5 y la fila 2 queda:\n' +
        '[ 2   4 | 6]\n' +
        '[ 0   0 | 0]',
      'Paso 3 — El último pivote es cero. La matriz es singular: el método ' +
        'se detiene y avisa que el sistema no tiene solución única.',
    ],
    algoritmo:
      'Un pivoteo y una eliminación: dos pasos antes de detenerse. El ' +
      'pivoteo parcial hizo su trabajo (eligió el 2 de la fila 2), pero al ' +
      'triangularizar, la última fila quedó toda en ceros, y eso ya no es ' +
      'un sistema triangular resoluble.',
    criterio:
      'El método es directo y no tiene criterio de parada, pero sí tiene una ' +
      'condición de existencia: si al terminar la eliminación el último ' +
      'pivote es cero, la matriz es singular. Ahí el método se detiene y ' +
      'avisa que el sistema no tiene solución única.',
    conclusion:
      'El sistema NO tiene solución única. La segunda ecuación es el doble ' +
      'de la primera, así que las dos rectas coinciden: hay infinitas ' +
      'soluciones, toda la recta x₁ + 2x₂ = 3. El método detectó la ' +
      'singularidad y se detuvo en vez de devolver un número cualquiera.',
    pista:
      'Mirá el determinante: si es cero, la matriz es singular y el ' +
      'sistema no tiene solución única. El método triangulariza, la última ' +
      'fila queda toda en ceros, y ahí se detiene y avisa.',
    calculo: {
      A: [
        [1, 2],
        [2, 4],
      ],
      b: [3, 6],
    },
  },
];
