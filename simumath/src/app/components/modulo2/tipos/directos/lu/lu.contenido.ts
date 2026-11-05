import type {
  ContenidoTeoriaSistema,
  EjemploSistema,
  EjercicioSistema,
} from '../../../../../shared/models/sistema.model';

/**
 * CONTENIDO DE LA FACTORIZACIÓN LU.
 *
 * ── Los números salen del motor, no de un libro ──────────────────────
 * Cada tabla, cada paso y cada conclusión de este archivo salieron de
 * correr el motor de verdad (`lu.algoritmo.ts`) con los mismos datos que
 * están escritos acá. Si el algoritmo cambia, hay que recalcular el
 * archivo; el test `lu.contenido.spec.ts` es el que lo vigila.
 *
 * ── Qué es lo que LU hace distinto de Gauss ──────────────────────────
 * La eliminación gaussiana hace una triangularización y DESCARTA la
 * información de cómo la hizo: los multiplicadores se usan y se pierden.
 * LU hace lo mismo pero GUARDA esos multiplicadores en una matriz L. Con
 * L y U a mano, el sistema A·x = b se parte en dos: L·y = b y U·x = y, que
 * son dos sustituciones (hacia adelante y hacia atrás) en vez de una
 * eliminación completa.
 *
 * ── Por qué se importa ───────────────────────────────────────────────
 * Si hay que resolver MUCHOS sistemas que comparten la misma matriz A
 * (y solo cambia b), la descomposición se hace UNA vez y cada resolución
 * cuesta O(n²) en vez de O(n³). Eso es la razón de ser del método.
 *
 * ── Variante: Doolittle ──────────────────────────────────────────────
 * Acá se usa la variante de DOOLITTLE: la diagonal de L es toda de unos
 * y los multiplicadores se guardan debajo. La variante de Crout es la
 * espejo: la diagonal de U es de unos y los multiplicadores se guardan
 * arriba. Las dos dan el mismo resultado; lo que cambia es dónde se
 * guardan los números y cuál de las dos matrices tiene la diagonal
 * "obligada".
 */

/* ================================================================== */
/* TEORÍA                                                              */
/* ================================================================== */

export const TEORIA_LU: ContenidoTeoriaSistema = {
  concepto:
    'La factorización LU es la eliminación gaussiana que no tira nada ' +
    'por la borda. La eliminación triangulariza la matriz, y para eso ' +
    'usa unos multiplicadores: para dejar en cero el coeficiente de la ' +
    'columna k en la fila i, multiplica la fila i por aᵢₖ/aₖₖ y le resta ' +
    'esa cantidad de veces la fila k. Esos multiplicadores son ' +
    'justamente la información que la eliminación clásico pierde. En LU ' +
    'no se pierden: se guardan en una matriz L, y al final se tiene la ' +
    'igualdad A = L·U. Con esa igualdad, resolver A·x = b es resolver dos ' +
    'sistemas triangulares: primero L·y = b (sustitución hacia adelante) ' +
    'y después U·x = y (sustitución hacia atrás). Y como la descomposición ' +
    'solo depende de A, se puede guardar: la próxima vez que aparezca ' +
    'un sistema con la misma A, no hay que triangularizar otra vez.',
  fundamento:
    'El fundamento tiene dos mitades. La primera es que las operaciones ' +
    'de eliminación son EQUIVALENTES: la fila i menos m veces la fila k ' +
    'no cambia el conjunto de soluciones, porque la nueva fila i es una ' +
    'combinación lineal de las dos filas anteriores y no agrega ni quita ' +
    'ecuaciones. Por eso triangularizar es lícito. La segunda mitad es la ' +
    'que da nombre al método. Cada operación de eliminación se puede ' +
    'escribir como el producto por una matriz elemental: Eᵢ = I − mᵢₖ·eᵢₖᵀ, ' +
    'que es la identidad con un −mᵢₖ en la posición (i, k). Si se ' +
    'aplican todas esas matrices, E₁·E₂·…·Eₘ = L⁻¹, y como el resultado ' +
    'de la eliminación es U, queda L⁻¹·A = U, o sea A = L·U. La matriz L ' +
    'es el producto acumulado de las matrices elementales invertidas, y ' +
    'por eso sus coeficientes son justamente los multiplicadores que se ' +
    'usaron en cada paso. En la variante de DOOLITTLE que se usa acá, la ' +
    'diagonal de L es toda de unos: eso no es una coincidencia, es que ' +
    'las matrices elementales de eliminación tienen la forma ' +
    'I − m·eᵢₖᵀ con i ≠ k, y al invertirlas se obtiene la L con unos en ' +
    'la diagonal. La descomposición es única cuando A tiene todos sus ' +
    'pivotes no nulos: hay una sola pareja (L, U) con L triangular de ' +
    'unos en la diagonal y U triangular.',
  cuandoFalla:
    'Falla por la matriz, y por dos motivos distintos. El primero es el ' +
    'pivote NULO: si al llegar a la columna k el coeficiente aₖₖ es cero, ' +
    'no hay forma de calcular los multiplicadores de esa columna, porque ' +
    'habría que dividir por cero. Si todos los coeficientes de la columna ' +
    'k por debajo de la diagonal son cero, la matriz es SINGULAR y el ' +
    'sistema no tiene solución única: el método se detiene y avisa. Pero ' +
    'si hay coeficientes no nulos más abajo, la matriz NO es singular y el ' +
    'problema es solo que la descomposición sin permutaciones no existe: ' +
    'la solución es permutar las filas, y entonces la igualdad correcta ' +
    'es PA = LU en vez de A = LU. El segundo motivo es el pivote MUY ' +
    'CHIQUITO: no es cero, así que el método sigue, pero al dividir por ' +
    'él los errores de redondeo se amplifican y la solución sale con ' +
    'decimales falsos. La variante con pivoteo (PA = LU) resuelve ese ' +
    'problema, pero tiene un costo: la permutación hay que guardarla y ' +
    'aplicarla al lado derecho. Y hay un límite que no es del método: la ' +
    'descomposición es de costo O(n³), así que factorizar una matriz de ' +
    '1000×1000 a mano no es una opción.',
  ordenConvergencia:
    'Un método directo no tiene orden de convergencia, porque no itera: ' +
    'no hay una sucesión x₀, x₁, x₂, ... que se acerque a la respuesta. ' +
    'Lo que LU cambia es el COSTO, y ese sí se puede medir. La ' +
    'descomposición cuesta lo mismo que la eliminación de Gauss, ' +
    'O(n³). Pero cada resolución posterior cuesta solo O(n²): dos ' +
    'sustituciones triangulares. Así, si hay m sistemas con la misma ' +
    'matriz A, resolverlos todos con Gauss cuesta O(m·n³), mientras que ' +
    'con LU cuesta O(n³ + m·n²). Para un solo sistema, LU no tiene ' +
    'ninguna ventaja: es un poco más caro. La ventaja aparece cuando el ' +
    'mismo A se repite, que es el caso típico (matrices de rigidez en ' +
    'estructuras, que se factoriza una vez y se resuelven cientos de ' +
    'cargas). El ERROR, en cambio, es el mismo que en la eliminación: lo ' +
    'mide el condicionamiento de A. Si la matriz está mal condicionada, ' +
    'la solución sale con muchos decimales que no son ciertos, y el ' +
    'método no avisa: solo lo delata el residuo grande.',
  recursos: [
    {
      titulo: 'Factorización LU (Wikipedia, español)',
      url: 'https://es.wikipedia.org/wiki/Factorizaci%C3%B3n_LU',
      tipo: 'lectura',
      descripcion: 'La descomposición A = L·U, las matrices elementales y el pivoteo PA = LU.',
    },
    {
      titulo: 'LU Decomposition (MathWorld)',
      url: 'https://mathworld.wolfram.com/LUDecomposition.html',
      tipo: 'lectura',
      descripcion: 'La definición formal, la variante de Doolittle y el costo de las sustituciones.',
    },
    {
      titulo: 'Videos de repaso: factorización LU',
      url: 'https://www.youtube.com/results?search_query=factorizacion+lu',
      tipo: 'video',
      descripcion: 'Descomposiciones 2×2 y 3×3, con las dos sustituciones al final.',
    },
  ],

  algoritmo: {
    formula:
      'mᵢₖ = aᵢₖ / aₖₖ   ·   Lᵢₖ = mᵢₖ   ·   Rᵢ ← Rᵢ − mᵢₖ · Rₖ   ' +
      '(i = k+1, ..., n)\n' +
      'L·y = b  (sustitución hacia adelante)   ·   U·x = y  (sustitución hacia atrás)',
    criterios: [
      {
        nombre: 'Pivote no nulo',
        explicacion:
          'Antes de dividir se verifica que aₖₖ no sea cero. Si lo es y la ' +
          'columna es toda de ceros abajo, la matriz es singular y el ' +
          'sistema no tiene solución única. Si hay coeficientes no nulos ' +
          'abajo, hay que permutar filas: la igualdad correcta es PA = LU.',
      },
      {
        nombre: 'Diagonal unitaria en L',
        explicacion:
          'Es la convención de Doolittle: la diagonal de L es toda de unos ' +
          'y los multiplicadores van debajo. La alternativa (Crout) pone ' +
          'los unos en la diagonal de U. Con una u otra, A = L·U sigue ' +
          'valiendo igual.',
      },
      {
        nombre: 'Reutilización de la descomposición',
        explicacion:
          'La descomposición depende solo de A. Si se va a resolver más de ' +
          'un sistema con la misma A, se factoriza UNA vez y cada resolución ' +
          'es solo la sustitución hacia adelante y la hacia atrás.',
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
      'Se escribe la matriz A y se la descompone: se busca L (triangular inferior, con unos en la diagonal) y U (triangular superior) tales que A = L·U.',
      'Para cada columna k = 1, ..., n−1: si el pivote aₖₖ es cero, el método se detiene y avisa (matriz singular, o hace falta permutar filas).',
      'Para cada fila i = k+1, ..., n: se calcula el multiplicador mᵢₖ = aᵢₖ / aₖₖ, se GUARDA en L (Lᵢₖ = mᵢₖ) y se reemplaza la fila i por Rᵢ − mᵢₖ · Rₖ. Así el coeficiente de la columna k en esa fila queda en cero.',
      'Al terminar la descomposición, la parte superior de A es U y lo que quedó abajo es L.',
      'Sustitución hacia adelante: se resuelve L·y = b, de arriba abajo. En cada fila se despeja yᵢ restando lo ya conocido.',
      'Sustitución hacia atrás: se resuelve U·x = y, de abajo arriba. En cada fila se despeja xᵢ dividiendo por el pivote y restando lo ya conocido.',
      'Se comprueba el resultado calculando el residuo ‖Ax − b‖∞.',
    ],
    ventajas: [
      'Resuelve muchos sistemas con la misma A mucho más barato: una sola descomposición O(n³) y después O(n²) por sistema.',
      'Guarda la información que la eliminación gaussiana descarta: los multiplicadores quedan a la vista en L.',
      'Da la misma solución que la eliminación gaussiana, con los mismos números y el mismo error: es la misma cuenta, guardada.',
      'Es exacto en aritmética exacta: no hay aproximaciones acumuladas como en los métodos iterativos.',
    ],
    limitaciones: [
      'Para un solo sistema no aporta nada: es un poco más caro que la eliminación directa, porque además de triangularizar hay que guardar los multiplicadores.',
      'Sin pivoteo se detiene en seco con un pivote nulo, aunque la matriz NO sea singular: ahí lo que falta es la permutación de filas.',
      'La descomposición es de costo O(n³): factorizar matrices grandes a mano es inviable.',
      'Si la matriz está mal condicionada, la solución sale con muchos decimales que no son ciertos; el método no avisa, solo lo delata el residuo grande.',
    ],
    recomendaciones: [
      'Usar LU cuando el mismo A aparece una y otra vez; para un sistema suelto, la eliminación gaussiana es más simple.',
      'Si se va a factorizar mucho, conviene la variante CON pivoteo (PA = LU), que evita el problema del pivote nulo y del pivote diminuto.',
      'Guardar L y U al terminar la descomposición: son la mitad del trabajo, y la otra mitad es pura sustitución.',
      'Mirar el residuo ‖Ax − b‖∞ antes de entregar la respuesta: es la única forma barata de saber si la solución es de fiar.',
      'Redondear SOLO al final. Si se redondea en el medio, los errores se acumulan y la solución sale peor.',
    ],
  },
  ejemploNormal: {
    id: 'lu-ej-teoria-numerico',
    titulo: 'Sistema de dos ecuaciones con una sola eliminación',
    tipo: 'numerico',
    ecuacion: '4x₁ + x₂ = 10\n2x₁ + 2x₂ = 8',
    parametros: [
      { etiqueta: 'Matriz A', valor: '[[4, 1], [2, 2]]' },
      { etiqueta: 'Lado derecho b', valor: '[10, 8]' },
    ],
    interpretacion:
      'Cada ecuación es una recta, y la solución es el punto donde se ' +
      'cortan: (2, 2). Lo interesante acá no es el punto, sino lo que pasa ' +
      'con las rectas cuando se elimina. Al triangularizar, la segunda ' +
      'recta deja de ser la que era y pasa a ser horizontal (x₂ = 2): el ' +
      'sistema triangular tiene las MISMAS soluciones pero otras rectas, y ' +
      'verlas en el gráfico es lo que hace entender qué hizo la ' +
      'eliminación.',
    pasos: [
      'Paso 1 — Descomposición. El multiplicador de la fila 2 es ' +
        'm₂₁ = 2 / 4 = 0.5. Se guarda en L y se reemplaza la fila 2 por ' +
        'R₂ − 0.5·R₁:\n' +
        '[ 4   1 ]\n' +
        '[ 0  1.5]',
      'Paso 2 — La descomposición quedó así:\n' +
        'L = [ 1     0  ]   U = [ 4   1  ]\n' +
        '    [ 0.5   1  ]       [ 0   1.5]\n' +
        'y se cumple A = L·U: [4, 1; 2, 2] = [1, 0; 0.5, 1] · [4, 1; 0, 1.5].',
      'Paso 3 — Sustitución hacia adelante (L·y = b). De la primera fila: ' +
        'y₁ = 10. De la segunda: y₂ = 8 − 0.5·10 = 3.',
      'Paso 4 — Sustitución hacia atrás (U·x = y). De la segunda fila: ' +
        'x₂ = 3 / 1.5 = 2. De la primera: x₁ = (10 − 1·2) / 4 = 2.',
      'Paso 5 — Comprobación. El residuo ‖Ax − b‖∞ quedó en cero.',
    ],
    algoritmo:
      'Una eliminación, dos sustituciones: cinco pasos. Lo que distingue a ' +
      'LU de la eliminación gaussiana no son las cuentas, que son las ' +
      'mismas, sino que el 0.5 que se usó para eliminar la fila 2 queda ' +
      'guardado en L. Con ese número guardado, el sistema se partió en ' +
      'dos: L·y = b y U·x = y. Y lo que se ve en el gráfico es que la ' +
      'segunda recta del sistema triangular es horizontal, mientras que la ' +
      'del sistema original no lo era.',
    criterio:
      'No hay criterio de parada: el método es de un número fijo de pasos ' +
      'y termina cuando la matriz queda triangular. La comprobación final ' +
      'es el residuo, que en este caso quedó en cero.',
    conclusion:
      'La solución del sistema es x₁ = 2, x₂ = 2. El residuo ‖Ax − b‖∞ ' +
      'quedó en cero: la solución cumple las dos ecuaciones exactamente. ' +
      'La descomposición LU quedó como L = [[1, 0], [0.5, 1]] y ' +
      'U = [[4, 1], [0, 1.5]], y con ella este mismo A se puede resolver ' +
      'contra cualquier otro lado derecho sin triangularizar otra vez.',
    calculo: {
      A: [
        [4, 1],
        [2, 2],
      ],
      b: [10, 8],
    },
  },
  ejemploCasuistica: {
    id: 'lu-ej-teoria-casuistica',
    titulo: 'Mezcla de café: dos cantidades y un solo molino',
    tipo: 'casuistica',
    enunciado:
      'Un lote de café se mezcla con grano. Cada kilo de la mezcla se ' +
      'compone de 1 kg de grano y 1 kg de otro componente, y el molino ' +
      'tiene que producir 30 kilos de mezcla. Además, el lote tiene que ' +
      'cumplir una especificación: 12 partes de un tipo de grano por cada 8 ' +
      'del otro, y en total eso da 280 kilos de la mezcla cruda. ¿Cuántos ' +
      'kilos de cada tipo de grano hay que moler?',
    ecuacion: 'x + y = 30\n12x + 8y = 280',
    parametros: [
      { etiqueta: 'Incógnita x', valor: 'kilos del primer tipo de grano' },
      { etiqueta: 'Incógnita y', valor: 'kilos del segundo tipo de grano' },
      { etiqueta: 'Mezcla del primer lote', valor: '30 kilos (1 kilo de cada tipo)' },
      { etiqueta: 'Proporción del segundo lote', valor: '12 del primer tipo por cada 8 del segundo, 280 kilos en total' },
    ],
    extraccion: {
      busqueda:
        'El enunciado esconde dos ecuaciones: una de CANTIDAD (los 30 ' +
        'kilos de mezcla del primer lote) y una de PROPORCIÓN (los 280 ' +
        'kilos del segundo lote). Cada ecuación necesita su incógnita y su ' +
        'lado derecho.',
      datos: [
        {
          simbolo: 'x',
          valor: '?',
          queEs: 'kilos del primer tipo de grano',
        },
        {
          simbolo: 'y',
          valor: '?',
          queEs: 'kilos del segundo tipo de grano',
        },
        {
          simbolo: 'x + y',
          valor: '30',
          queEs: 'kilos de mezcla del primer lote (1 kilo de cada tipo)',
        },
        {
          simbolo: '12x + 8y',
          valor: '280',
          queEs: 'kilos del segundo lote, con la proporción 12 a 8',
        },
      ],
      formulacion:
        'La primera ecuación sale del conteo del primer lote: 1 kilo de cada ' +
        'tipo, 30 kilos en total, así que x + y = 30. La segunda sale de la ' +
        'proporción del segundo lote: 12 kilos del primer tipo por cada 8 ' +
        'del segundo, y 280 kilos en total, así que 12x + 8y = 280. Con eso ' +
        'el sistema a resolver es x + y = 30 y 12x + 8y = 280.',
    },
    interpretacion:
      'Cada incógnita es una CANTIDAD: no puede ser negativa. La ' +
      'solución, (10, 20), dice que el segundo lote lleva 10 kilos del ' +
      'primer tipo y 20 del segundo. La gráfica ayuda a entenderlo: las ' +
      'dos rectas se cortan en ese punto, y como el problema pide ' +
      'cantidades, el punto tiene que estar en el primer cuadrante. Y ' +
      'fíjate en la descomposición: el multiplicador es 12, un número ' +
      'grande, y eso deja una U con un −4 abajo. Con un pivote tan ' +
      'chiquito, un paso de redondeo se nota; la eliminación gaussiana ' +
      'haría exactamente las mismas cuentas.',
    pasos: [
      'Paso 1 — El sistema como matriz:\n' +
        'A = [ 1   1 ]   b = [ 30 ]\n' +
        '    [12   8 ]       [280]',
      'Paso 2 — Descomposición. El multiplicador de la fila 2 es ' +
        'm₂₁ = 12 / 1 = 12. Se guarda en L y se reemplaza la fila 2 por ' +
        'R₂ − 12·R₁:\n' +
        '[ 1   1 ]\n' +
        '[ 0  −4]',
      'Paso 3 — La descomposición quedó así:\n' +
        'L = [ 1    0 ]   U = [ 1   1 ]\n' +
        '    [12    1 ]       [ 0  −4]',
      'Paso 4 — Sustitución hacia adelante (L·y = b). De la primera fila: ' +
        'y₁ = 30. De la segunda: y₂ = 280 − 12·30 = −80.',
      'Paso 5 — Sustitución hacia atrás (U·x = y). De la segunda fila: ' +
        'x₂ = −80 / −4 = 20. De la primera: x₁ = 30 − 20 = 10.',
      'Paso 6 — Comprobación. 10 + 20 = 30 y 12·10 + 8·20 = 120 + 160 = ' +
        '280. El residuo ‖Ax − b‖∞ quedó en cero.',
    ],
    algoritmo:
      'Una eliminación y dos sustituciones: cinco pasos. El detalle que ' +
      'conviene mirar es el multiplicador: 12. Es grande, y por eso la ' +
      'fila 2 queda [0, −4] y el vector y queda con un −80 en la segunda ' +
      'posición. Son números grandes, pero todos exactos: la descomposición ' +
      'no redondea en ningún momento, solo la sustitución final.',
    criterio:
      'El método es directo: no hay criterio de parada. La comprobación es ' +
      'el residuo, que en este caso también quedó en cero.',
    conclusion:
      'El segundo lote lleva 10 kilos del primer tipo de grano y 20 kilos ' +
      'del segundo. Se verifica volviendo al enunciado: 10 + 20 = 30 kilos ' +
      'de mezcla del primer lote, y 12·10 + 8·20 = 280 kilos del segundo ' +
      'lote con la proporción pedida. El residuo ‖Ax − b‖∞ quedó en cero.',
    calculo: {
      A: [
        [1, 1],
        [12, 8],
      ],
      b: [30, 280],
    },
  },
};

/* ================================================================== */
/* EJEMPLOS                                                            */
/* ================================================================== */

export const EJEMPLOS_LU: EjemploSistema[] = [
  {
    id: 'lu-ej-1',
    titulo: 'Sistema de 3×3: tres eliminaciones y seis sustituciones',
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
      'Este es el mismo sistema que resolvió la eliminación gaussiana, y ' +
      'obtiene la misma solución: (2, 3, −1). Las cuentas también son las ' +
      'mismas. Lo que cambia es que aquí los multiplicadores no se ' +
      'pierden: quedan guardados en L, así que la triangularización ' +
      'queda disponible para cualquier otro lado derecho. Con tres ' +
      'ecuaciones ya no cabe en un plano de dos ejes, así que el gráfico ' +
      'no se muestra, pero la tabla de pasos sí.',
    pasos: [
      'Paso 1 — Descomposición, columna 1. El multiplicador de la fila 2 ' +
        'es m₂₁ = −3 / 2 = −1.5 y el de la fila 3 es m₃₁ = −2 / 2 = −1. Se ' +
        'guardan en L y las filas quedan:\n' +
        '[ 2   1  −1 ]\n' +
        '[ 0  0.5 0.5]\n' +
        '[ 0   2   1 ]',
      'Paso 2 — Descomposición, columna 2. El multiplicador de la fila 3 ' +
        'es m₃₂ = 2 / 0.5 = 4 y la tercera fila queda:\n' +
        '[ 2   1  −1 ]\n' +
        '[ 0  0.5 0.5]\n' +
        '[ 0   0  −1 ]',
      'Paso 3 — La descomposición quedó así:\n' +
        'L = [ 1     0    0 ]   U = [ 2   1  −1 ]\n' +
        '    [−1.5   1    0 ]       [ 0  0.5 0.5]\n' +
        '    [−1     4    1 ]       [ 0   0  −1 ]',
      'Paso 4 — Sustitución hacia adelante (L·y = b). y₁ = 8, ' +
        'y₂ = −11 − (−1.5)·8 = 1, y₃ = −3 − (−1)·8 − 4·1 = 1.',
      'Paso 5 — Sustitución hacia atrás (U·x = y). x₃ = 1 / (−1) = −1, ' +
        'x₂ = (1 − 0.5·(−1)) / 0.5 = 3, x₁ = (8 − 1·3 − (−1)·(−1)) / 2 = 2.',
    ],
    algoritmo:
      'Tres eliminaciones, tres sustituciones hacia adelante y tres hacia ' +
      'atrás: nueve pasos. La descomposición es la parte cara: ahí se ' +
      'calculan los tres multiplicadores (−1.5, −1 y 4). Fijate en que ' +
      'el último multiplicador, 4, sale de dividir 2 por 0.5: un pivote ' +
      'chiquito produce un multiplicador grande, y de ahí vienen los ' +
      'númeres redondos de la solución.',
    criterio:
      'Método directo: sin criterio de parada. La verificación es el ' +
      'residuo ‖Ax − b‖∞, que quedó en cero.',
    conclusion:
      'La solución es x₁ = 2, x₂ = 3, x₃ = −1, la misma que por ' +
      'eliminación gaussiana. La descomposición LU quedó como ' +
      'L = [[1, 0, 0], [−1.5, 1, 0], [−1, 4, 1]] y ' +
      'U = [[2, 1, −1], [0, 0.5, 0.5], [0, 0, −1]]. El residuo ‖Ax − b‖∞ ' +
      'quedó en cero.',
    calculo: {
      A: [
        [2, 1, -1],
        [-3, -1, 2],
        [-2, 1, 2],
      ],
      b: [8, -11, -3],
    },
  },
  {
    id: 'lu-ej-2',
    titulo: 'Un 2×2 con decimales: la descomposición da 0.25',
    tipo: 'numerico',
    ecuacion: '4x₁ + 2x₂ = 14\nx₁ + 3x₂ = 10',
    parametros: [
      { etiqueta: 'Matriz A', valor: '[[4, 2], [1, 3]]' },
      { etiqueta: 'Lado derecho b', valor: '[14, 10]' },
    ],
    interpretacion:
      'Un caso corriente, sin trampas: los pivotes (4 y 2.5) son ' +
      'grandes y el método no se tropieza con nada. La solución es ' +
      '(2.2, 2.6) y el gráfico muestra las dos rectas originales y el ' +
      'sistema triangular que produjo la descomposición, con la segunda ' +
      'recta ya convertida en horizontal.',
    pasos: [
      'Paso 1 — Descomposición. El multiplicador de la fila 2 es ' +
        'm₂₁ = 1 / 4 = 0.25. Se guarda en L y la fila 2 queda:\n' +
        '[ 4   2 ]\n' +
        '[ 0  2.5]',
      'Paso 2 — La descomposición quedó así:\n' +
        'L = [ 1    0  ]   U = [ 4   2  ]\n' +
        '    [0.25  1  ]       [ 0  2.5]',
      'Paso 3 — Sustitución hacia adelante (L·y = b). y₁ = 14, ' +
        'y₂ = 10 − 0.25·14 = 6.5.',
      'Paso 4 — Sustitución hacia atrás (U·x = y). x₂ = 6.5 / 2.5 = 2.6, ' +
        'x₁ = (14 − 2·2.6) / 4 = 2.2.',
      'Paso 5 — Comprobación. 4·2.2 + 2·2.6 = 8.8 + 5.2 = 14 y ' +
        '2.2 + 3·2.6 = 2.2 + 7.8 = 10. El residuo ‖Ax − b‖∞ quedó en cero.',
    ],
    algoritmo:
      'Una eliminación y dos sustituciones: cinco pasos. El multiplicador ' +
      '0.25 es el que queda guardado en L, y es lo que permite separar ' +
      'el problema: L·y = b despeja y = [14, 6.5] sin tocar la matriz A, ' +
      'y U·x = y despeja la solución.',
    criterio:
      'Método directo: sin criterio de parada. La verificación es el ' +
      'residuo ‖Ax − b‖∞, que quedó en cero.',
    conclusion:
      'La solución es x₁ = 2.2, x₂ = 2.6. Verificación: 4·2.2 + 2·2.6 = ' +
      '14 y 2.2 + 3·2.6 = 10, las dos ecuaciones del sistema. El residuo ' +
      '‖Ax − b‖∞ quedó en cero.',
    calculo: {
      A: [
        [4, 2],
        [1, 3],
      ],
      b: [14, 10],
    },
  },
  {
    id: 'lu-ej-3',
    titulo: 'Un 2×2 con pivote negativo',
    tipo: 'numerico',
    ecuacion: '5x₁ + 2x₂ = 11\n3x₁ + x₂ = 7',
    parametros: [
      { etiqueta: 'Matriz A', valor: '[[5, 2], [3, 1]]' },
      { etiqueta: 'Lado derecho b', valor: '[11, 7]' },
    ],
    interpretacion:
      'La descomposición de este sistema tiene un detalle que no aparece ' +
      'en los otros: el pivote de U es NEGATIVO (−0.2). Pasa porque el ' +
      'multiplicador 0.6 es grande respecto del 2 de la fila 1: al restar ' +
      '0.6 veces esa fila, la segunda fila da [0, −0.2]. Nada grave: la ' +
      'solución es (3, −2) y sale exacta. Pero es el recordatorio de que ' +
      'el pivote puede tener cualquier signo.',
    pasos: [
      'Paso 1 — Descomposición. El multiplicador de la fila 2 es ' +
        'm₂₁ = 3 / 5 = 0.6. Se guarda en L y la fila 2 queda:\n' +
        '[ 5   2 ]\n' +
        '[ 0 −0.2]',
      'Paso 2 — La descomposición quedó así:\n' +
        'L = [ 1   0  ]   U = [ 5   2  ]\n' +
        '    [0.6  1  ]       [ 0 −0.2]',
      'Paso 3 — Sustitución hacia adelante (L·y = b). y₁ = 11, ' +
        'y₂ = 7 − 0.6·11 = 0.4.',
      'Paso 4 — Sustitución hacia atrás (U·x = y). x₂ = 0.4 / (−0.2) = −2, ' +
        'x₁ = (11 − 2·(−2)) / 5 = 3.',
      'Paso 5 — Comprobación. 5·3 + 2·(−2) = 15 − 4 = 11 y 3·3 + (−2) = 7. ' +
        'El residuo ‖Ax − b‖∞ quedó en cero.',
    ],
    algoritmo:
      'Una eliminación y dos sustituciones: cinco pasos. Lo que hay que ' +
      'mirar es que el pivote −0.2 es pequeño en valor absoluto: al ' +
      'dividir por él, cualquier error de redondeo se amplifica. Acá no ' +
      'pasó nada porque todos los números son exactos, pero con decimales ' +
      'en los datos este es el tipo de sistema donde LU sin pivoteo ' +
      'empieza a dar decimales falsos.',
    criterio:
      'Método directo: sin criterio de parada. La verificación es el ' +
      'residuo ‖Ax − b‖∞, que quedó en cero.',
    conclusion:
      'La solución es x₁ = 3, x₂ = −2. Verificación: 5·3 + 2·(−2) = 11 ' +
      'y 3·3 + (−2) = 7, las dos ecuaciones del sistema. El residuo ' +
      '‖Ax − b‖∞ quedó en cero.',
    calculo: {
      A: [
        [5, 2],
        [3, 1],
      ],
      b: [11, 7],
    },
  },
];

/* ================================================================== */
/* EJERCICIOS                                                          */
/* ================================================================== */

export const EJERCICIOS_LU: EjercicioSistema[] = [
  {
    id: 'lu-ex-1',
    titulo: 'Descomponer y resolver un 2×2 con números enteros',
    tipo: 'numerico',
    ecuacion: '2x₁ + x₂ = 6\nx₁ + x₂ = 4',
    parametros: [
      { etiqueta: 'Matriz A', valor: '[[2, 1], [1, 1]]' },
      { etiqueta: 'Lado derecho b', valor: '[6, 4]' },
    ],
    interpretacion:
      'Un sistema de dos ecuaciones con dos incógnitas donde todo sale ' +
      'exacto: el multiplicador es 0.5 y la solución es (2, 2). La ' +
      'solución es el punto donde se cortan las dos rectas, y el método ' +
      'la encuentra con cuentas: primero triangulariza, después ' +
      'sustituye.',
    pasos: [
      'Paso 1 — Descomposición. El multiplicador de la fila 2 es ' +
        'm₂₁ = 1 / 2 = 0.5. Se guarda en L y la fila 2 queda:\n' +
        '[ 2   1 ]\n' +
        '[ 0  0.5]',
      'Paso 2 — La descomposición quedó así:\n' +
        'L = [ 1    0  ]   U = [ 2   1  ]\n' +
        '    [0.5   1  ]       [ 0  0.5]',
      'Paso 3 — Sustitución hacia adelante (L·y = b). y₁ = 6, ' +
        'y₂ = 4 − 0.5·6 = 1.',
      'Paso 4 — Sustitución hacia atrás (U·x = y). x₂ = 1 / 0.5 = 2, ' +
        'x₁ = (6 − 1·2) / 2 = 2.',
    ],
    algoritmo:
      'Una eliminación y dos sustituciones: cinco pasos. Con la ' +
      'descomposición a la vista, el sistema se partió en dos: ' +
      'L·y = b dio y = [6, 1] y U·x = y dio x = [2, 2].',
    criterio:
      'Método directo: sin criterio de parada. La verificación es el ' +
      'residuo ‖Ax − b‖∞, que quedó en cero.',
    conclusion:
      'La solución es x₁ = 2, x₂ = 2. Verificación: 2·2 + 2 = 6 y ' +
      '2 + 2 = 4, las dos ecuaciones del sistema. El residuo ‖Ax − b‖∞ ' +
      'quedó en cero.',
    pista:
      'Escribí L con unos en la diagonal y anotá el multiplicador abajo: ' +
      'L₂₁ = 1/2 = 0.5. Después fijate en que la fila 2 de U queda con ' +
      'un solo coeficiente, y de ahí sale x₂.',
    calculo: {
      A: [
        [2, 1],
        [1, 1],
      ],
      b: [6, 4],
    },
  },
  {
    id: 'lu-ex-2',
    titulo: 'Un 2×2 con multiplicador 1/3',
    tipo: 'numerico',
    ecuacion: '3x₁ + x₂ = 8\nx₁ + 2x₂ = 7',
    parametros: [
      { etiqueta: 'Matriz A', valor: '[[3, 1], [1, 2]]' },
      { etiqueta: 'Lado derecho b', valor: '[8, 7]' },
    ],
    interpretacion:
      'Acá el multiplicador no es redondo: es 1/3. Y el pivote de U ' +
      'tampoco: 5/3. Los decimales se van acumulando y la solución ' +
      '(1.8, 2.6) no es entera. Es el caso normal, y por eso conviene ' +
      'comprobar con el residuo: si queda en cero, los decimales son ' +
      'correctos.',
    pasos: [
      'Paso 1 — Descomposición. El multiplicador de la fila 2 es ' +
        'm₂₁ = 1 / 3 = 0.3333. Se guarda en L y la fila 2 queda:\n' +
        '[ 3      1   ]\n' +
        '[ 0   1.6667]',
      'Paso 2 — La descomposición quedó así:\n' +
        'L = [ 1      0   ]   U = [ 3      1   ]\n' +
        '    [0.3333  1   ]       [ 0   1.6667]',
      'Paso 3 — Sustitución hacia adelante (L·y = b). y₁ = 8, ' +
        'y₂ = 7 − (1/3)·8 = 4.3333.',
      'Paso 4 — Sustitución hacia atrás (U·x = y). ' +
        'x₂ = 4.3333 / 1.6667 = 2.6, x₁ = (8 − 1·2.6) / 3 = 1.8.',
    ],
    algoritmo:
      'Una eliminación y dos sustituciones: cinco pasos. Con el ' +
      'multiplicador 1/3 guardado en L, la sustitución hacia adelante es ' +
      'la que carga con los decimales: y₂ = 7 − 8/3 = 4.3333. Redondear ' +
      'ahí (por ejemplo a 4.33) ya desvía la respuesta final.',
    criterio:
      'Método directo: sin criterio de parada. La verificación es el ' +
      'residuo ‖Ax − b‖∞, que quedó en cero.',
    conclusion:
      'La solución es x₁ = 1.8, x₂ = 2.6. Verificación: 3·1.8 + 2.6 = 8 ' +
      'y 1.8 + 2·2.6 = 7, las dos ecuaciones del sistema. El residuo ' +
      '‖Ax − b‖∞ quedó en cero.',
    pista:
      'El multiplicador es 1/3, pero no lo redondees a 0.33: dejalo como ' +
      'fracción o con más decimales. El error más común en este ejercicio ' +
      'es redondear el multiplicador y arruinar la sustitución hacia ' +
      'adelante.',
    calculo: {
      A: [
        [3, 1],
        [1, 2],
      ],
      b: [8, 7],
    },
  },
  {
    id: 'lu-ex-3',
    titulo: 'Un 3×3: dos eliminaciones en cadena',
    tipo: 'numerico',
    ecuacion:
      'x₁ + 2x₂ + x₃ = 6\n' +
      '3x₁ + x₂ + 2x₃ = 14\n' +
      '2x₁ + x₂ + 3x₃ = 13',
    parametros: [
      { etiqueta: 'Matriz A', valor: '[[1, 2, 1], [3, 1, 2], [2, 1, 3]]' },
      { etiqueta: 'Lado derecho b', valor: '[6, 14, 13]' },
    ],
    interpretacion:
      'Un sistema de tres ecuaciones: la descomposición tiene que ' +
      'eliminar en dos columnas, y el segundo multiplicador (0.6) sale de ' +
      'dividir −3 por −5. La solución es (3.125, 0.375, 2.125), con ' +
      'decimales que no son enteros, y eso es normal. Un sistema de tres ' +
      'incógnitas no entra en un gráfico de dos ejes, así que acá se ve la ' +
      'tabla de pasos.',
    pasos: [
      'Paso 1 — Descomposición, columna 1. Los multiplicadores son ' +
        'm₂₁ = 3 / 1 = 3 y m₃₁ = 2 / 1 = 2. Se guardan en L y las filas ' +
        'quedan:\n' +
        '[ 1   2   1 ]\n' +
        '[ 0  −5  −1 ]\n' +
        '[ 0  −3   1 ]',
      'Paso 2 — Descomposición, columna 2. El multiplicador de la fila 3 ' +
        'es m₃₂ = −3 / (−5) = 0.6 y la tercera fila queda:\n' +
        '[ 1   2   1 ]\n' +
        '[ 0  −5  −1 ]\n' +
        '[ 0   0  1.6]',
      'Paso 3 — La descomposición quedó así:\n' +
        'L = [ 1   0    0 ]   U = [ 1   2   1 ]\n' +
        '    [ 3   1    0 ]       [ 0  −5  −1 ]\n' +
        '    [ 2   0.6  1 ]       [ 0   0  1.6]',
      'Paso 4 — Sustitución hacia adelante (L·y = b). y₁ = 6, ' +
        'y₂ = 14 − 3·6 = −4, y₃ = 13 − 2·6 − 0.6·(−4) = 3.4.',
      'Paso 5 — Sustitución hacia atrás (U·x = y). ' +
        'x₃ = 3.4 / 1.6 = 2.125, x₂ = (−4 + 2.125) / (−5) = 0.375, ' +
        'x₁ = 6 − 2·0.375 − 2.125 = 3.125.',
    ],
    algoritmo:
      'Tres eliminaciones, tres sustituciones hacia adelante y tres hacia ' +
      'atrás: nueve pasos. La cadena de multiplicadores (3, 2 y 0.6) es ' +
      'justo lo que queda guardado en L, y es lo que permite resolver ' +
      'cualquier otro b con esta misma matriz sin triangularizar de nuevo.',
    criterio:
      'Método directo: sin criterio de parada. La verificación es el ' +
      'residuo ‖Ax − b‖∞, que quedó en cero.',
    conclusion:
      'La solución es x₁ = 3.125, x₂ = 0.375, x₃ = 2.125. Verificación: ' +
      '3.125 + 2·0.375 + 2.125 = 6, 3·3.125 + 0.375 + 2·2.125 = 14 y ' +
      '2·3.125 + 0.375 + 3·2.125 = 13. El residuo ‖Ax − b‖∞ quedó en cero.',
    pista:
      'Anotá los multiplicadores mientras eliminás: m₂₁ = 3, m₃₁ = 2 y ' +
      'después m₃₂ = 0.6. Esos tres números son la fila 2 y la fila 3 de ' +
      'L. Con L y U a mano, la sustitución es mecánica.',
    calculo: {
      A: [
        [1, 2, 1],
        [3, 1, 2],
        [2, 1, 3],
      ],
      b: [6, 14, 13],
    },
  },
];
