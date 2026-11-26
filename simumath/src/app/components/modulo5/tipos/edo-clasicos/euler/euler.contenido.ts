import type {
  EjemploModulo5,
  EjercicioModulo5,
  TeoriaModulo5,
} from '../../../modelos/modulo5.model';

/**
 * CONTENIDO DE EULER EXPLÍCITO.
 *
 * Los textos usan la convención del Módulo 5: la matemática va entre
 * `$…$` (en línea) o `$$…$$` (bloque) y se renderiza con KaTeX.
 *
 * Las tablas, el valor final y los errores NO se escriben acá: salen de
 * correr `euler.algoritmo.ts` con el cálculo de cada ejemplo. Los números
 * de los pasos están calculados y verificados contra ese mismo motor.
 */

export const TEORIA_EULER: TeoriaModulo5 = {
  concepto:
    'Una ecuación diferencial ordinaria dice cómo cambia una cantidad: $y′ = f(t, y)$. ' +
    'Resolverla es encontrar la función $y(t)$ que cumple esa regla y arranca en un valor conocido ' +
    '$y(t_0) = y_0$. Cuando la solución exacta no existe en forma cerrada, se avanza paso a paso: ' +
    'desde el punto conocido se estima la pendiente y se camina un trecho $h$ en línea recta. Eso ' +
    'es Euler: el método de un paso más simple que hay.',

  fundamento:
    'La pendiente de la solución en $(t_n, y_n)$ es, por definición, $f(t_n, y_n)$. Si se avanza ' +
    'un paso pequeño $h$ y se supone que la pendiente no cambia demasiado, el nuevo valor es ' +
    '$y_{n+1} = y_n + h\\,f(t_n, y_n)$. Es el desarrollo de Taylor de primer orden: se toma el ' +
    'término lineal y se descarta el resto. El error local empieza en $h^2$; al acumular $N = (t_f - t_0)/h$ ' +
    'pasos, el error global queda de orden $h$.',

  cuandoFalla:
    'Falla con problemas rígidos (stiff): si $f$ cambia muy rápido, hace falta un $h$ diminuto ' +
    'para que el método no explote. En la ecuación de prueba $y′ = \\lambda y$ con $\\lambda < 0$, ' +
    'Euler multiplica por $(1 + h\\lambda)$ en cada paso; la aproximación se mantiene acotada solo ' +
    'si $|1 + h\\lambda| \\le 1$, o sea $h \\le 2/|\\lambda|$. Con $h$ mayor, la solución numérica ' +
    'oscila y crece aunque la exacta tienda a cero. Tampoco conviene usarlo cuando se exige mucha ' +
    'precisión: para bajar el error hay que reducir $h$ y aumentar el costo.',

  precision:
    'Euler es de orden 1: al dividir $h$ por 2, el error global baja aproximadamente a la mitad. ' +
    'No es mucho. La ventaja es que cada paso cuesta una sola evaluación de $f$ y que el método se ' +
    'explica en una línea. Su región de estabilidad es $|1 + h\\lambda| \\le 1$, es decir ' +
    '$h \\le 2/|\\lambda|$ para $\\lambda$ real negativo.',

  videoUrl: 'https://www.youtube.com/results?search_query=m%C3%A9todo+de+euler+edo+ejemplo',

  recursos: [
    {
      titulo: 'Método de Euler (Wikipedia, español)',
      url: 'https://es.wikipedia.org/wiki/M%C3%A9todo_de_Euler',
      tipo: 'lectura',
      descripcion: 'La deducción, el error y la relación con el desarrollo de Taylor.',
    },
    {
      titulo: 'Euler Forward Method (MathWorld)',
      url: 'https://mathworld.wolfram.com/EulerForwardMethod.html',
      tipo: 'lectura',
      descripcion: 'La fórmula, el orden del error y la región de estabilidad.',
    },
    {
      titulo: 'Ecuación diferencial ordinaria (Wikipedia, español)',
      url: 'https://es.wikipedia.org/wiki/Ecuaci%C3%B3n_diferencial_ordinaria',
      tipo: 'lectura',
      descripcion: 'El marco general de los problemas de valor inicial y sus soluciones.',
    },
  ],

  algoritmo: {
    formula: 'yₙ₊₁ = yₙ + h · f(tₙ, yₙ)',
    formulaTex: String.raw`y_{n+1}=y_n+h\,f(t_n,y_n)`,
    criterios: [
      {
        nombre: 'Paso h',
        explicacion:
          'Es la distancia entre dos instantes consecutivos. Se elige antes de calcular; más chico es más preciso, pero cuesta más pasos.',
      },
      {
        nombre: 'Una evaluación de f por paso',
        explicacion:
          'En cada paso se usa solo la pendiente del punto de partida. Es el método más barato por paso.',
      },
      {
        nombre: 'Orden 1',
        explicacion:
          'El error global es proporcional a $h$. Al dividir $h$ por 2, el error baja a la mitad: la convergencia es lenta.',
      },
      {
        nombre: 'Estabilidad',
        explicacion:
          'Con $y′ = \\lambda y$ ($\\lambda < 0$) hay que elegir $h \\le 2/|\\lambda|$. Si no, la solución numérica oscila y diverge aunque la exacta decaiga.',
      },
    ],
    pasos: [
      'Identificar $f(t, y)$, el punto inicial $(t_0, y_0)$, el paso $h$ y el instante final.',
      'Evaluar la pendiente en el punto actual: $k = f(t_n, y_n)$.',
      'Avanzar: $y_{n+1} = y_n + h\\,k$ y $t_{n+1} = t_n + h$.',
      'Repetir hasta llegar a t final. Si el último paso no entra justo, se acorta.',
      'Si se conoce la solución exacta, comparar y medir el error en cada paso.',
    ],
    ventajas: [
      'Es el método más simple de explicar e implementar: una línea de código.',
      'Cuesta una sola evaluación de $f$ por paso.',
      'La idea geométrica (seguir la tangente) se ve directamente en el gráfico.',
      'Sirve como base para entender los métodos de orden superior.',
    ],
    limitaciones: [
      'Es de orden 1: para ganar un decimal de precisión hay que reducir $h$ mucho.',
      'Es inestable con problemas rígidos si h no es suficientemente pequeño.',
      'El error se acumula paso a paso y puede crecer rápido en intervalos largos.',
      'No tiene control de error interno: no avisa cuándo el paso es demasiado grande.',
    ],
    recomendaciones: [
      'Usalo para aprender la idea y para problemas suaves en intervalos cortos.',
      'Mirá la gráfica: si la poligonal se separa mucho de la exacta, reducí h.',
      'En problemas rígidos, elegí $h$ con la condición de estabilidad antes de calcular.',
      'Para resultados de ingeniería, compará siempre contra RK4 con el mismo h.',
    ],
  },

  /* ---------------------------------------------------------------- */
  /* Ejemplo numérico                                                 */
  /* ---------------------------------------------------------------- */
  ejemploNormal: {
    id: 'eu-num-1',
    titulo: 'Crecer exponencialmente: y′ = y con h = 0.1',
    tipo: 'numerico',
    planteamiento:
      'Resolver $y′ = y$, $y(0) = 1$ en $[0, 1]$ con Euler y $h = 0.1$. Comparar con la solución exacta $y(t) = e^t$.',
    parametros: [
      { etiqueta: 'f(t, y)', valor: 'y' },
      { etiqueta: 'Punto inicial', valor: '(0, 1)' },
      { etiqueta: 'h', valor: '0.1' },
      { etiqueta: 'Solución exacta', valor: '$e^t$' },
    ],
    formula: 'y₁ = 1 + 0.1 · 1 = 1.1',
    formulaTex: String.raw`y_1 = 1 + 0.1\cdot 1 = 1.1`,
    interpretacion:
      'La solución exacta es la exponencial, que crece cada vez más rápido. Euler sigue la tangente ' +
      'del punto actual y se queda corto: la recta no alcanza a acompañar la curvatura. Por eso el ' +
      'valor final va a ser menor que $e$.',
    pasos: [
      'Paso 0: $(t_0, y_0) = (0, 1)$ y $f(0, 1) = 1$.',
      'Paso 1: $y_1 = 1 + 0.1 · 1 = 1.1$; $t_1 = 0.1$.',
      'Paso 2: $f(0.1, 1.1) = 1.1$; $y_2 = 1.1 + 0.1 · 1.1 = 1.21$.',
      'Al repetir diez veces se llega a $y_{10} = 2.593742$ en $t = 1$. El exacto es $e = 2.718282$.',
      'Error absoluto: $0.124539$; error relativo: $4.58\\,\\%$.',
    ],
    algoritmo:
      'Se avanza con la pendiente del punto anterior. En cada fila de la tabla, $f(t_n, y_n)$ es ' +
      'exactamente el número que se suma multiplicado por $h$.',
    criterio:
      'El exacto es $e = 2.718282$. Con $h = 0.1$ el error es $0.1245$; al dividir $h$ por 2, ' +
      'debería bajar a la mitad, porque el método es de orden 1.',
    conclusion:
      'Euler da $2.593742$ frente a $2.718282$ exactos: un error de $0.124539$ ($4.58\\,\\%$). ' +
      'La aproximación subestima porque la recta tangente queda por debajo de una curva convexa. ' +
      'Con $h = 0.05$ el error baja cerca de la mitad.',
    calculo: {
      funcion: 'y',
      t0: 0,
      y0: 1,
      h: 0.1,
      tFin: 1,
      exacta: 'exp(t)',
      etiqueta: 'y′ = y, y(0) = 1',
    },
  },

  /* ---------------------------------------------------------------- */
  /* Ejemplo de casuística                                            */
  /* ---------------------------------------------------------------- */
  ejemploCasuistica: {
    id: 'eu-cas-1',
    titulo: 'Enfriamiento de un cuerpo',
    tipo: 'casuistica',
    enunciado:
      'Un cuerpo a 1 °C de exceso sobre el ambiente se enfría según $T′ = -2T$. ¿Cuánto exceso de ' +
      'temperatura queda a los 2 segundos? Usar Euler con $h = 0.1$ y comparar con $T(t) = e^{-2t}$.',
    extraccion: {
      busqueda: 'Se busca la temperatura en función del tiempo a partir de cómo decrece.',
      datos: [
        { simbolo: 'T', valor: 'exceso de temperatura', queEs: 'Lo que se quiere calcular.' },
        { simbolo: '$T^\\prime$', valor: '$-2T$', queEs: 'Rapidez de enfriamiento, proporcional al exceso.' },
        { simbolo: 'T(0)', valor: '1', queEs: 'Condición inicial.' },
        { simbolo: 'h', valor: '0.1 s', queEs: 'Paso de tiempo con el que se avanza.' },
      ],
      formulacion:
        'El modelo es lineal: $T′ = -2T$. Su solución exacta es $T(t) = e^{-2t}$, que tiende a cero. ' +
        'Euler aproxima esa caída con tramos rectos.',
    },
    planteamiento:
      'Resolver $T′ = -2T$, $T(0) = 1$ en $[0, 2]$ con $h = 0.1$ y comparar con $e^{-2t}$.',
    parametros: [
      { etiqueta: 'f(t, T)', valor: '-2T' },
      { etiqueta: 'Punto inicial', valor: '(0, 1)' },
      { etiqueta: 'h', valor: '0.1' },
      { etiqueta: 'Solución exacta', valor: '$e^{-2t}$' },
    ],
    formula: 'T₁ = 1 + 0.1 · (−2·1) = 0.8',
    formulaTex: String.raw`T_1 = 1 + 0.1\cdot(-2\cdot 1) = 0.8`,
    interpretacion:
      'La temperatura baja más rápido al principio y luego se frena. Euler toma la pendiente del ' +
      'inicio de cada tramo: como la caída real se frena y la curva es convexa, la recta queda por ' +
      'debajo de la curva y el método subestima la temperatura que queda.',
    pasos: [
      'Paso 0: $T_0 = 1$ y $f(0, 1) = -2$.',
      'Paso 1: $T_1 = 1 + 0.1·(-2) = 0.8$; $t_1 = 0.1$.',
      'Paso 2: $f(0.1, 0.8) = -1.6$; $T_2 = 0.8 + 0.1·(-1.6) = 0.64$.',
      'Tras 20 pasos: $T(2) ≈ 0.011529$. El exacto es $e^{-4} = 0.018316$.',
      'Error absoluto: $0.006786$ ($37.05\\,\\%$): el error relativo es grande, aunque el valor sea chico.',
    ],
    algoritmo:
      'Se aplica Euler con $f(t, T) = -2T$. Cada paso usa la temperatura del paso anterior para ' +
      'calcular la nueva pendiente.',
    criterio:
      'El exacto en $t = 2$ es $e^{-4} = 0.018316$. La aproximación da $0.011529$: se enfrió de ' +
      'más. Con $h = 0.05$ el error baja a la mitad, como corresponde al orden 1.',
    conclusion:
      'A los 2 segundos el exceso de temperatura es $0.0115$ según Euler, frente a $0.0183$ exacto. ' +
      'La diferencia importa cuando el valor es tan chico: un error absoluto pequeño puede ser un ' +
      'error relativo grande. Para este problema conviene RK4 o un $h$ menor.',
    calculo: {
      funcion: '-2*y',
      t0: 0,
      y0: 1,
      h: 0.1,
      tFin: 2,
      exacta: 'exp(-2*t)',
      etiqueta: 'T′ = -2T, T(0) = 1',
    },
  },
};

/* ------------------------------------------------------------------ */
/* Ejemplos resueltos                                                   */
/* ------------------------------------------------------------------ */

export const EJEMPLOS_EULER: EjemploModulo5[] = [
  {
    id: 'eu-num-2',
    titulo: 'y′ = t + y con h = 0.1',
    tipo: 'numerico',
    planteamiento:
      'Resolver $y′ = t + y$, $y(0) = 1$ en $[0, 1]$ con $h = 0.1$. La solución exacta es $y(t) = 2e^t - t - 1$.',
    parametros: [
      { etiqueta: 'f(t, y)', valor: 't + y' },
      { etiqueta: 'Punto inicial', valor: '(0, 1)' },
      { etiqueta: 'h', valor: '0.1' },
      { etiqueta: 'Solución exacta', valor: '$2e^t - t - 1$' },
    ],
    formula: 'y₁ = 1 + 0.1 · (0 + 1) = 1.1',
    formulaTex: String.raw`y_1 = 1 + 0.1\cdot(0+1) = 1.1`,
    interpretacion:
      'La pendiente depende del tiempo y del valor actual: al crecer $y$, también crece la ' +
      'pendiente. La solución exacta combina una exponencial con un término lineal.',
    pasos: [
      'Paso 1: $f(0, 1) = 1$; $y_1 = 1 + 0.1·1 = 1.1$.',
      'Paso 2: $f(0.1, 1.1) = 1.2$; $y_2 = 1.1 + 0.1·1.2 = 1.32$.',
      'Paso 3: $f(0.2, 1.32) = 1.52$; $y_3 = 1.32 + 0.1·1.52 = 1.472$.',
      'Al llegar a $t = 1$: $y_{10} = 3.187485$. El exacto es $3.436564$.',
      'Error absoluto: $0.249079$; error relativo: $7.25\\,\\%$.',
    ],
    algoritmo:
      'En cada paso se evalúa $t + y$ con los valores actuales y se suma $h$ veces esa pendiente.',
    criterio:
      'El exacto es $3.436564$; Euler da $3.187485$. El error de $0.249$ es grande porque $h = 0.1$ ' +
      'es grueso para una función que crece exponencialmente.',
    conclusion:
      'La aproximación es $3.187485$, un $7.25\\,\\%$ por debajo del valor exacto. El método se ' +
      'queda corto porque la pendiente real aumenta dentro de cada paso y Euler solo usa la del inicio.',
    calculo: {
      funcion: 't + y',
      t0: 0,
      y0: 1,
      h: 0.1,
      tFin: 1,
      exacta: '2*exp(t) - t - 1',
    },
  },
  {
    id: 'eu-cas-2',
    titulo: 'Descarga de un capacitor',
    tipo: 'casuistica',
    enunciado:
      'La carga de un capacitor se descarga según $q′ = -2q$, con $q(0) = 1$ coulomb. Estimar la ' +
      'carga a $t = 1$ s con $h = 0.2$ y comparar con $e^{-2} = 0.135335$.',
    extraccion: {
      busqueda: 'Se busca cuánta carga queda después de un segundo de descarga.',
      datos: [
        { simbolo: 'q', valor: 'carga en coulombs', queEs: 'La cantidad que se quiere estimar.' },
        { simbolo: '$q^\\prime$', valor: '$-2q$', queEs: 'Corriente de descarga, proporcional a la carga.' },
        { simbolo: 'q(0)', valor: '1 C', queEs: 'Carga inicial.' },
      ],
      formulacion:
        'La descarga es exponencial: $q(t) = e^{-2t}$. Euler aproxima la curva con una poligonal ' +
        'que usa la pendiente al inicio de cada intervalo.',
    },
    planteamiento: 'Resolver $q′ = -2q$, $q(0) = 1$ en $[0, 1]$ con $h = 0.2$.',
    parametros: [
      { etiqueta: 'f(t, q)', valor: '-2q' },
      { etiqueta: 'Punto inicial', valor: '(0, 1)' },
      { etiqueta: 'h', valor: '0.2' },
      { etiqueta: 'Solución exacta', valor: '$e^{-2t}$' },
    ],
    formula: 'q₁ = 1 + 0.2 · (−2) = 0.6',
    formulaTex: String.raw`q_1 = 1 + 0.2\cdot(-2) = 0.6`,
    interpretacion:
      'Cada paso descuenta el $40\\,\\%$ de la carga: $1 → 0.6 → 0.36…$ Es una progresión ' +
      'geométrica. La exacta descuenta un poco menos en promedio, así que Euler subestima la carga final.',
    pasos: [
      'Paso 1: $q_1 = 1 + 0.2·(-2·1) = 0.6$.',
      'Paso 2: $q_2 = 0.6 + 0.2·(-2·0.6) = 0.36$.',
      'Tras cinco pasos: $q_5 = 0.6^5 = 0.07776$.',
      'El exacto es $e^{-2} = 0.135335$. Error: $0.057575$ ($42.54\\,\\%$).',
    ],
    algoritmo:
      'Se aplica Euler con $f(t, q) = -2q$; en cada paso la pendiente se recalcula con la carga ' +
      'que quedó.',
    criterio:
      'El exacto es $0.135335$. Con $h = 0.2$ el error es $0.0576$; si se usa $h = 0.1$ baja a la ' +
      'mitad, como corresponde al orden 1.',
    conclusion:
      'Euler estima $0.07776$ C contra $0.135335$ C exactos: $42.54\\,\\%$ de error. Es un ejemplo ' +
      'de que un error absoluto pequeño puede ser enorme en términos relativos cuando el valor decae.',
    calculo: {
      funcion: '-2*y',
      t0: 0,
      y0: 1,
      h: 0.2,
      tFin: 1,
      exacta: 'exp(-2*t)',
    },
  },
];

/* ------------------------------------------------------------------ */
/* Autoevaluación (6 ejercicios)                                       */
/* ------------------------------------------------------------------ */

export const EJERCICIOS_EULER: EjercicioModulo5[] = [
  {
    id: 'eu-ej-1',
    titulo: 'Ejercicio 1 · Un paso a mano',
    tipo: 'numerico',
    planteamiento:
      'Con $y′ = t + y$, $y(0) = 1$ y $h = 0.1$, calcular $y_1$ con Euler.',
    parametros: [
      { etiqueta: 'f(t, y)', valor: 't + y' },
      { etiqueta: 'Punto inicial', valor: '(0, 1)' },
      { etiqueta: 'h', valor: '0.1' },
    ],
    pista: 'La pendiente en el punto inicial es $f(0, 1) = 1$.',
    interpretacion: 'Se pide un solo paso: evaluar la pendiente y avanzar $h$.',
    pasos: [
      '$f(0, 1) = 0 + 1 = 1$.',
      '$y_1 = 1 + 0.1·1 = 1.1$.',
      '$t_1 = 0 + 0.1 = 0.1$.',
    ],
    algoritmo: 'Euler: $y_{n+1} = y_n + h·f(t_n, y_n)$.',
    criterio: 'El resultado tiene que ser mayor que 1 porque la pendiente es positiva.',
    conclusion: 'Después de un paso, $y(0.1) ≈ 1.1$.',
    calculo: { funcion: 't + y', t0: 0, y0: 1, h: 0.1, tFin: 0.1 },
    cuestionario: [
      {
        id: 'q1',
        tipo: 'opcion-multiple',
        enunciado: '¿Cuánto vale $y_1$ con $h = 0.1$?',
        opciones: [
          { id: 'a', texto: '1.0' },
          { id: 'b', texto: '1.1' },
          { id: 'c', texto: '1.2' },
          { id: 'd', texto: '0.1' },
        ],
        correcta: 'b',
        explicacion: 'La pendiente es 1 y el paso 0.1: $y_1 = 1 + 0.1·1 = 1.1$.',
      },
      {
        id: 'q2',
        tipo: 'verdadero-falso',
        enunciado: 'Para avanzar, Euler evalúa la pendiente en el punto inicial $(0, 1)$.',
        opciones: [
          { id: 'v', texto: 'Verdadero' },
          { id: 'f', texto: 'Falso' },
        ],
        correcta: 'v',
        explicacion: 'La pista da $f(0, 1) = 1$: esa es la pendiente que se usa en el paso.',
      },
      {
        id: 'q3',
        tipo: 'opcion-multiple',
        enunciado: '¿Qué representa el valor $1.1$ obtenido al final?',
        opciones: [
          { id: 'a', texto: 'El valor aproximado de $y(0.1)$.' },
          { id: 'b', texto: 'La pendiente inicial.' },
          { id: 'c', texto: 'El paso $h$.' },
          { id: 'd', texto: 'El valor inicial.' },
        ],
        correcta: 'a',
        explicacion: 'La conclusión dice $y(0.1) ≈ 1.1$: es el valor aproximado tras avanzar un paso.',
      },
    ],
  },
  {
    id: 'eu-ej-2',
    titulo: 'Ejercicio 2 · Orden del error',
    tipo: 'numerico',
    planteamiento:
      'Se resuelve $y′ = y$, $y(0) = 1$ con Euler y $h = 0.2$. ¿Qué se espera del error si se pasa a $h = 0.1$?',
    parametros: [
      { etiqueta: 'f(t, y)', valor: 'y' },
      { etiqueta: 'h', valor: '0.2 → 0.1' },
      { etiqueta: 'Solución exacta', valor: '$e^t$' },
    ],
    pista: 'Euler es de orden 1 en el error global.',
    interpretacion: 'Al dividir $h$ por 2, el error global baja aproximadamente a la mitad.',
    pasos: [
      'Con $h = 0.2$: $y_5 = 1.2^5 = 2.48832$; exacto $e = 2.718282$; error $0.229962$.',
      'Con $h = 0.1$: $y_{10} = 1.1^{10} = 2.593742$; error $0.124539$.',
      'La razón entre errores es $0.229962 / 0.124539 ≈ 1.85$, cerca de 2.',
    ],
    algoritmo: 'Euler con dos pasos distintos para comparar.',
    criterio: 'Orden 1: el error es proporcional a h.',
    conclusion: 'Al dividir h por 2, el error baja cerca de la mitad (en este caso, un 46 %).',
    calculo: { funcion: 'y', t0: 0, y0: 1, h: 0.2, tFin: 1, exacta: 'exp(t)' },
    cuestionario: [
      {
        id: 'q1',
        tipo: 'opcion-multiple',
        enunciado: 'Si h se divide por 2, el error global de Euler…',
        opciones: [
          { id: 'a', texto: 'se divide por 4.' },
          { id: 'b', texto: 'se divide por 2, aproximadamente.' },
          { id: 'c', texto: 'se duplica.' },
          { id: 'd', texto: 'no cambia.' },
        ],
        correcta: 'b',
        explicacion: 'El error global es $O(h)$: al reducir $h$ a la mitad, el error también baja a la mitad.',
      },
      {
        id: 'q2',
        tipo: 'verdadero-falso',
        enunciado: 'Al pasar de $h = 0.2$ a $h = 0.1$, el error baja de $0.229962$ a $0.124539$.',
        opciones: [
          { id: 'v', texto: 'Verdadero' },
          { id: 'f', texto: 'Falso' },
        ],
        correcta: 'v',
        explicacion: 'Los pasos muestran esos dos errores y una razón $0.229962 / 0.124539 ≈ 1.85$.',
      },
      {
        id: 'q3',
        tipo: 'opcion-multiple',
        enunciado: '¿Con qué valor se compara la aproximación para medir el error?',
        opciones: [
          { id: 'a', texto: 'Con el exacto $e = 2.718282$.' },
          { id: 'b', texto: 'Con $1.2^5 = 2.48832$.' },
          { id: 'c', texto: 'Con $1.1^{10} = 2.593742$.' },
          { id: 'd', texto: 'Con el paso $h = 0.2$.' },
        ],
        correcta: 'a',
        explicacion: 'Los pasos toman $e = 2.718282$ como referencia: el error es la diferencia con esa solución.',
      },
    ],
  },
  {
    id: 'eu-ej-3',
    titulo: 'Ejercicio 3 · Elegir un h estable',
    tipo: 'numerico',
    planteamiento:
      'Para $y′ = -10y$ con Euler, ¿qué paso h garantiza estabilidad? Probar con $h = 0.25$ y con $h = 0.1$.',
    parametros: [
      { etiqueta: 'f(t, y)', valor: '-10y' },
      { etiqueta: 'Condición', valor: '$h \\le 2/|-10| = 0.2$' },
      { etiqueta: 'Punto inicial', valor: '(0, 1)' },
    ],
    pista: 'La estabilidad de Euler pide $|1 + h\\lambda| \\le 1$.',
    interpretacion:
      'Con $h = 0.25$, el factor es $1 - 2.5 = -1.5$: cambia de signo y crece en valor absoluto. ' +
      'Con $h = 0.1$, el factor es $0.0$: la solución numérica queda en cero.',
    pasos: [
      'Con $h = 0.25$: factores $-1.5$; en 4 pasos, $y(1) = (-1.5)^4 = 5.0625$. La exacta es $4.54·10^{-5}$.',
      'Con $h = 0.1$: factor $1 - 1 = 0$; en 10 pasos, $y(1) = 0$. Queda acotada (aunque muy chica).',
      'El límite es $h ≤ 0.2$; en el borde, el factor vale $-1$ y oscila sin crecer.',
    ],
    algoritmo: 'Euler en $[0, 1]$ con dos valores de h.',
    criterio: 'Si $|1 + h\\lambda| > 1$, la solución numérica diverge.',
    conclusion: 'Con $h = 0.25$ el método es inestable; con $h ≤ 0.2$ se mantiene acotado.',
    calculo: { funcion: '-10*y', t0: 0, y0: 1, h: 0.25, tFin: 1, exacta: 'exp(-10*t)' },
    cuestionario: [
      {
        id: 'q1',
        tipo: 'opcion-multiple',
        enunciado: 'Para $y′ = -10y$, ¿cuál es el h máximo estable de Euler?',
        opciones: [
          { id: 'a', texto: '0.5' },
          { id: 'b', texto: '0.2' },
          { id: 'c', texto: '2' },
          { id: 'd', texto: 'No hay límite.' },
        ],
        correcta: 'b',
        explicacion: '$h \\le 2/|\\lambda| = 2/10 = 0.2$.',
      },
      {
        id: 'q2',
        tipo: 'verdadero-falso',
        enunciado: 'Con $h = 0.25$, el factor $1 - 2.5 = -1.5$ cambia de signo y crece en valor absoluto.',
        opciones: [
          { id: 'v', texto: 'Verdadero' },
          { id: 'f', texto: 'Falso' },
        ],
        correcta: 'v',
        explicacion: 'La interpretación lo indica: por eso en 4 pasos se llega a $(-1.5)^4 = 5.0625$.',
      },
      {
        id: 'q3',
        tipo: 'opcion-multiple',
        enunciado: '¿Qué ocurre en el borde $h = 0.2$?',
        opciones: [
          { id: 'a', texto: 'El factor vale $-1$ y oscila sin crecer.' },
          { id: 'b', texto: 'El factor vale $-1.5$ y crece.' },
          { id: 'c', texto: 'El factor vale $0$ y se anula.' },
          { id: 'd', texto: 'El factor vale $1$ y crece.' },
        ],
        correcta: 'a',
        explicacion: 'Los pasos dicen que en el borde el factor es $-1$: oscila sin crecer.',
      },
    ],
  },
  {
    id: 'eu-ej-4',
    titulo: 'Ejercicio 4 · Interpretar la gráfica',
    tipo: 'numerico',
    planteamiento:
      'Se resuelve $y′ = 0.5y$, $y(0) = 1$ con Euler y $h = 0.5$ en $[0, 2]$. ¿La poligonal queda por encima o por debajo de $e^{0.5t}$?',
    parametros: [
      { etiqueta: 'f(t, y)', valor: '0.5y' },
      { etiqueta: 'h', valor: '0.5' },
      { etiqueta: 'Solución exacta', valor: '$e^{0.5t}$' },
    ],
    pista: 'La exponencial es convexa; la recta tangente queda por debajo.',
    interpretacion: 'Euler sigue tangentes de una curva convexa, así que subestima.',
    pasos: [
      'Con $h = 0.5$: factor $1 + 0.25 = 1.25$; en 4 pasos, $y(2) = 1.25^4 = 2.441406$.',
      'La exacta es $e^1 = 2.718282$.',
      'La poligonal queda por debajo de la curva en todo el intervalo.',
    ],
    algoritmo: 'Euler con cuatro pasos de 0.5.',
    criterio: 'El error es $0.276876$ (10.2 %), por debajo del exacto.',
    conclusion: 'La aproximación subestima: $2.4414 < 2.7183$.',
    calculo: { funcion: '0.5*y', t0: 0, y0: 1, h: 0.5, tFin: 2, exacta: 'exp(0.5*t)' },
    cuestionario: [
      {
        id: 'q1',
        tipo: 'verdadero-falso',
        enunciado: 'Con una solución convexa, Euler suele quedar por debajo de la curva exacta.',
        opciones: [
          { id: 'v', texto: 'Verdadero' },
          { id: 'f', texto: 'Falso' },
        ],
        correcta: 'v',
        explicacion: 'La recta tangente a una curva convexa queda por debajo; por eso la poligonal subestima.',
      },
      {
        id: 'q2',
        tipo: 'opcion-multiple',
        enunciado: '¿Qué factor se aplica en cada paso cuando $h = 0.5$?',
        opciones: [
          { id: 'a', texto: '1.25' },
          { id: 'b', texto: '0.5' },
          { id: 'c', texto: '2.718282' },
          { id: 'd', texto: '0.276876' },
        ],
        correcta: 'a',
        explicacion: 'Los pasos dan $1 + 0.25 = 1.25$ y con cuatro pasos $1.25^4 = 2.441406$.',
      },
      {
        id: 'q3',
        tipo: 'opcion-multiple',
        enunciado: '¿Cuál es el error absoluto que informa el criterio?',
        opciones: [
          { id: 'a', texto: '0.276876' },
          { id: 'b', texto: '2.441406' },
          { id: 'c', texto: '0.5' },
          { id: 'd', texto: '1.25' },
        ],
        correcta: 'a',
        explicacion: 'El criterio da $0.276876$ (10.2 %), por debajo del exacto.',
      },
    ],
  },
  {
    id: 'eu-ej-5',
    titulo: 'Ejercicio 5 · Encontrar el error',
    tipo: 'numerico',
    planteamiento:
      'Un compañero escribe $y_1 = y_0$ para $y′ = t + y$, $y(0) = 1$ y $h = 0.1$, y obtiene 1. ¿Qué olvidó?',
    parametros: [
      { etiqueta: 'f(t, y)', valor: 't + y' },
      { etiqueta: 'h', valor: '0.1' },
      { etiqueta: 'Resultado del compañero', valor: '1' },
    ],
    pista: 'La fórmula es $y_1 = y_0 + h·f(t_0, y_0)$.',
    interpretacion: 'Se olvidó de sumar el incremento $h·f(t_0, y_0)$.',
    pasos: [
      'Lo correcto es $y_1 = 1 + 0.1·1 = 1.1$.',
      'El compañero dejó $y_1 = y_0 = 1$: no sumó el incremento.',
      'El error es $0.1$: el $9.09\\,\\%$ del valor correcto $1.1$ (el $10\\,\\%$ del valor inicial).',
    ],
    algoritmo: 'Euler con h = 0.1.',
    criterio: 'El resultado correcto es 1.1, no 1.',
    conclusion: 'Faltó multiplicar por h: $y_1 = 1.1$.',
    calculo: { funcion: 't + y', t0: 0, y0: 1, h: 0.1, tFin: 0.1 },
    cuestionario: [
      {
        id: 'q1',
        tipo: 'opcion-multiple',
        enunciado: '¿Cuál es el error del compañero?',
        opciones: [
          { id: 'a', texto: 'Dejó $y_1 = y_0$: no sumó el incremento.' },
          { id: 'b', texto: 'Sumó en vez de restar.' },
          { id: 'c', texto: 'Evaluó f en el punto siguiente.' },
          { id: 'd', texto: 'No hay error: el resultado es 1.' },
        ],
        correcta: 'a',
        explicacion: 'El paso correcto es $y_1 = 1 + 0.1·1 = 1.1$. Quedarse con 1 equivale a usar un paso nulo.',
      },
      {
        id: 'q2',
        tipo: 'opcion-multiple',
        enunciado: '¿Cuál es la diferencia entre el valor correcto $1.1$ y el que escribió el compañero?',
        opciones: [
          { id: 'a', texto: '0.1' },
          { id: 'b', texto: '1' },
          { id: 'c', texto: '1.1' },
          { id: 'd', texto: '0' },
        ],
        correcta: 'a',
        explicacion: 'Los pasos calculan $1 + 0.1·1 = 1.1$ y un error de $0.1$.',
      },
      {
        id: 'q3',
        tipo: 'verdadero-falso',
        enunciado: 'El 10 % mencionado en los pasos es el error medido respecto del valor inicial $1$.',
        opciones: [
          { id: 'v', texto: 'Verdadero' },
          { id: 'f', texto: 'Falso' },
        ],
        correcta: 'v',
        explicacion: 'Los pasos aclaran que $0.1$ es el 9.09 % de $1.1$ y el 10 % del valor inicial.',
      },
    ],
  },
  {
    id: 'eu-ej-6',
    titulo: 'Ejercicio 6 · Casuística: drenaje de un tanque',
    tipo: 'casuistica',
    enunciado:
      'El nivel de agua de un tanque baja según $h′ = -0.5h$, con $h(0) = 2$ m. Estimar el nivel a los ' +
      '2 minutos con $h = 0.5$ (paso de tiempo) y comparar con $2e^{-0.5t}$.',
    extraccion: {
      busqueda: 'Se busca el nivel que queda después de 2 minutos.',
      datos: [
        { simbolo: 'h', valor: 'nivel en metros', queEs: 'La cantidad que se quiere estimar.' },
        { simbolo: '$h^\\prime$', valor: '$-0.5h$', queEs: 'Rapidez de drenaje.' },
        { simbolo: 'h(0)', valor: '2 m', queEs: 'Nivel inicial.' },
      ],
      formulacion: 'El modelo es $h′ = -0.5h$; la solución exacta es $2e^{-0.5t}$.',
    },
    planteamiento: 'Resolver $h′ = -0.5h$, $h(0) = 2$ en $[0, 2]$ con $h_{paso} = 0.5$.',
    parametros: [
      { etiqueta: 'f(t, h)', valor: '-0.5h' },
      { etiqueta: 'Punto inicial', valor: '(0, 2)' },
      { etiqueta: 'Paso', valor: '0.5' },
      { etiqueta: 'Solución exacta', valor: '$2e^{-0.5t}$' },
    ],
    pista: 'Cada paso multiplica por $1 - 0.5·0.5 = 0.75$.',
    interpretacion: 'El nivel decae exponencialmente; Euler lo aproxima con tramos rectos.',
    pasos: [
      'Paso 1: $h_1 = 2 + 0.5·(-1) = 1.5$.',
      'Paso 2: $h_2 = 1.5 + 0.5·(-0.75) = 1.125$.',
      'Paso 3: $h_3 = 1.125 + 0.5·(-0.5625) = 0.84375$.',
      'Paso 4: $h_4 = 0.84375 + 0.5·(-0.421875) = 0.6328125$.',
      'Exacto a t = 2: $2e^{-1} = 0.735759$; error $0.102946$ ($13.99\\,\\%$).',
    ],
    algoritmo: 'Euler con paso 0.5 sobre el nivel.',
    criterio: 'El exacto es 0.735759; el error es 0.102946.',
    conclusion: 'Euler estima 0.632813 m contra 0.735759 m exactos: subestima un $13.99\\,\\%$.',
    calculo: { funcion: '-0.5*y', t0: 0, y0: 2, h: 0.5, tFin: 2, exacta: '2*exp(-0.5*t)' },
    cuestionario: [
      {
        id: 'q1',
        tipo: 'opcion-multiple',
        enunciado: '¿Por qué el nivel aproximado es menor que el exacto?',
        opciones: [
          { id: 'a', texto: 'Porque el drenaje real se frena y la recta no lo sigue.' },
          { id: 'b', texto: 'Porque el nivel exacto es negativo.' },
          { id: 'c', texto: 'Porque h es negativo.' },
          { id: 'd', texto: 'No es menor: es mayor.' },
        ],
        correcta: 'a',
        explicacion:
          'La pendiente $|-0.5h|$ baja a medida que el nivel baja. Euler usa la pendiente inicial, más fuerte, y drena de más.',
      },
      {
        id: 'q2',
        tipo: 'opcion-multiple',
        enunciado: 'Según la pista, ¿por qué factor se multiplica el nivel en cada paso?',
        opciones: [
          { id: 'a', texto: '0.75' },
          { id: 'b', texto: '0.5' },
          { id: 'c', texto: '2' },
          { id: 'd', texto: '1' },
        ],
        correcta: 'a',
        explicacion: 'La pista da $1 - 0.5·0.5 = 0.75$: de $2$ se pasa a $h_1 = 1.5$.',
      },
      {
        id: 'q3',
        tipo: 'verdadero-falso',
        enunciado: 'El valor $0.735759$ es lo que estima Euler y $0.6328125$ es el exacto.',
        opciones: [
          { id: 'v', texto: 'Verdadero' },
          { id: 'f', texto: 'Falso' },
        ],
        correcta: 'f',
        explicacion: 'Los pasos dan $h_4 = 0.6328125$ y el exacto $2e^{-1} = 0.735759$: están al revés.',
      },
    ],
  },
];
