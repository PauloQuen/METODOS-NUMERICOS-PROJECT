import type {
  EjemploModulo5,
  EjercicioModulo5,
  TeoriaModulo5,
} from '../../../modelos/modulo5.model';

/**
 * CONTENIDO DE RUNGE-KUTTA DE ORDEN 4.
 *
 * Misma convención que Euler: la matemática va entre `$…$` / `$$…$$` y se
 * renderiza con KaTeX. Las tablas y los errores salen de correr el
 * algoritmo, no se escriben a mano.
 */

export const TEORIA_RK4: TeoriaModulo5 = {
  concepto:
    'RK4 también resuelve $y′ = f(t, y)$, $y(t_0) = y_0$ avanzando paso a paso. La diferencia con ' +
    'Euler es que dentro de cada paso mira CUATRO pendientes: al inicio, dos en el medio (con ' +
    'correcciones) y al final. Después las combina con pesos $1$-$2$-$2$-$1$. Es como promediar ' +
    'varias estimaciones de la tangente para no quedarse corto en las curvas.',

  fundamento:
    'La idea viene de la cuadratura: al integrar $y′$ en un paso, $y_{n+1} = y_n + \\int_{t_n}^{t_{n+1}} f\\,dt$. ' +
    'Euler aproxima esa integral con el valor en un extremo (regla del rectángulo). RK4 usa una ' +
    'fórmula de cuadratura de cuarto orden, parecida a Simpson pero evaluada en puntos intermedios ' +
    'del paso. Si $f$ es polinómica de grado a lo sumo 3, la solución es polinómica de grado a lo ' +
    'sumo 4 y RK4 la reproduce exactamente; en general su error local es $O(h^5)$.',

  cuandoFalla:
    'Ningún método de un paso con h fijo es inmune a los problemas rígidos. RK4 tiene una región ' +
    'de estabilidad más amplia que Euler ($|h\\lambda| \\lesssim 2.78$ en vez de 2), pero si el ' +
    'problema es muy rígido igual hay que achicar $h$. También falla si $f$ tiene discontinuidades ' +
    'dentro del paso o si la solución exacta se vuelve infinita en el intervalo: el método no ' +
    'puede atravesar una singularidad.',

  precision:
    'Error local $O(h^5)$ y global $O(h^4)$: al dividir $h$ por 2, el error global baja a la ' +
    'dieciseisava parte. Cuesta cuatro evaluaciones de $f$ por paso, frente a una de Euler. Aun ' +
    'así, para la misma precisión suele ser mucho más barato que Euler con un $h$ diminuto. La ' +
    'región de estabilidad en $y′ = \\lambda y$ llega hasta $|h\\lambda| \\approx 2.78$.',

  videoUrl: 'https://www.youtube.com/results?search_query=runge+kutta+4+orden+ejemplo',

  recursos: [
    {
      titulo: 'Runge-Kutta (Wikipedia, español)',
      url: 'https://es.wikipedia.org/wiki/M%C3%A9todo_de_Runge-Kutta',
      tipo: 'lectura',
      descripcion: 'La familia de métodos, el RK4 clásico y la tabla de Butcher.',
    },
    {
      titulo: 'Runge-Kutta Method (MathWorld)',
      url: 'https://mathworld.wolfram.com/Runge-KuttaMethod.html',
      tipo: 'lectura',
      descripcion: 'Las fórmulas, el orden y la comparación con Euler.',
    },
    {
      titulo: 'Ecuación diferencial ordinaria (Wikipedia, español)',
      url: 'https://es.wikipedia.org/wiki/Ecuaci%C3%B3n_diferencial_ordinaria',
      tipo: 'lectura',
      descripcion: 'El marco de los problemas de valor inicial.',
    },
  ],

  algoritmo: {
    formula: 'yₙ₊₁ = yₙ + (h/6)(k₁ + 2k₂ + 2k₃ + k₄)',
    formulaTex: String.raw`y_{n+1}=y_n+\frac{h}{6}\left(k_1+2k_2+2k_3+k_4\right)`,
    criterios: [
      {
        nombre: 'Las cuatro pendientes',
        explicacion:
          '$k_1$ en el inicio; $k_2$ y $k_3$ en el punto medio (con correcciones); $k_4$ al final. Cada una mejora la estimación de la anterior.',
      },
      {
        nombre: 'Pesos 1-2-2-1',
        explicacion:
          'Se parecen a los de Simpson: los extremos pesan 1 y los puntos medios 2. La suma se divide por 6, no por 4, porque $h/6$ multiplica.',
      },
      {
        nombre: 'Orden 4',
        explicacion:
          'Error global proporcional a $h^4$. Al dividir $h$ por 2, el error baja a la dieciseisava parte.',
      },
      {
        nombre: 'Costo',
        explicacion:
          'Cuatro evaluaciones de $f$ por paso. Aun así, para la misma precisión suele convenir frente a Euler.',
      },
    ],
    pasos: [
      'Calcular $k_1 = f(t_n, y_n)$.',
      'Calcular $k_2 = f(t_n + h/2, y_n + (h/2)k_1)$.',
      'Calcular $k_3 = f(t_n + h/2, y_n + (h/2)k_2)$.',
      'Calcular $k_4 = f(t_n + h, y_n + h k_3)$.',
      'Combinar: $y_{n+1} = y_n + (h/6)(k_1 + 2k_2 + 2k_3 + k_4)$.',
      'Avanzar $t_{n+1} = t_n + h$ y repetir hasta el instante final.',
    ],
    ventajas: [
      'Mucho más preciso que Euler con el mismo h (orden 4 frente a orden 1).',
      'Es explícito y fácil de programar: no requiere resolver ecuaciones.',
      'Estable en una región amplia: $|h\\lambda| \\le 2.78$ en la ecuación de prueba.',
      'Es el caballo de batalla de la simulación en ingeniería y física.',
    ],
    limitaciones: [
      'Cuesta cuatro evaluaciones de $f$ por paso.',
      'No tiene control de error interno: usa h fijo.',
      'Puede fallar cerca de singularidades o con f discontinuas.',
      'En problemas muy rígidos puede necesitar h muy pequeño (o un método implícito).',
    ],
    recomendaciones: [
      'Usalo por defecto cuando necesites precisión razonable con poco esfuerzo.',
      'Compará siempre contra Euler con el mismo h: la diferencia se ve en la gráfica.',
      'Si el error no baja como $h^4$, revisá que la solución exacta esté bien evaluada.',
      'Para problemas rígidos, verificá la estabilidad antes de confiar en el resultado.',
    ],
  },

  /* ---------------------------------------------------------------- */
  /* Ejemplo numérico                                                 */
  /* ---------------------------------------------------------------- */
  ejemploNormal: {
    id: 'rk-num-1',
    titulo: 'La exponencial con RK4 y h = 0.1',
    tipo: 'numerico',
    planteamiento:
      'Resolver $y′ = y$, $y(0) = 1$ en $[0, 1]$ con RK4 y $h = 0.1$. Comparar con $y(t) = e^t$.',
    parametros: [
      { etiqueta: 'f(t, y)', valor: 'y' },
      { etiqueta: 'Punto inicial', valor: '(0, 1)' },
      { etiqueta: 'h', valor: '0.1' },
      { etiqueta: 'Solución exacta', valor: '$e^t$' },
    ],
    formula: 'k₁ = 1; k₂ = 1.05; k₃ = 1.0525; k₄ = 1.10525',
    formulaTex: String.raw`k_1=1,\quad k_2=1.05,\quad k_3=1.0525,\quad k_4=1.10525`,
    interpretacion:
      'Las cuatro pendientes son parecidas porque $f = y$ no cambia demasiado dentro de un paso ' +
      'de 0.1. RK4 las promedia y obtiene un valor casi igual al exacto: el error es del orden de ' +
      'millonésimas.',
    pasos: [
      'Paso 0: $k_1 = f(0, 1) = 1$; $k_2 = f(0.05, 1.05) = 1.05$; $k_3 = f(0.05, 1.0525) = 1.0525$; $k_4 = f(0.1, 1.10525) = 1.10525$.',
      'Combinación: $y_1 = 1 + (0.1/6)(1 + 2·1.05 + 2·1.0525 + 1.10525) = 1.105170833$.',
      'El exacto en $t = 0.1$ es $e^{0.1} = 1.105170918$: coinciden hasta la sexta cifra decimal.',
      'Tras diez pasos: $y_{10} = 2.718279744$. El exacto es $e = 2.718281828$.',
      'Error absoluto: $0.000002084$; error relativo: $0.000077\\,\\%$.',
    ],
    algoritmo:
      'Se calculan las cuatro pendientes en cada paso y se combinan con pesos 1-2-2-1. En la tabla ' +
      'se ven las cuatro columnas $k_1,\\ldots,k_4$.',
    criterio:
      'El exacto es $e = 2.718281828$. RK4 da $2.718279744$: un error de $2.08·10^{-6}$, unas ' +
      '60 000 veces menor que el de Euler con el mismo h.',
    conclusion:
      'RK4 reproduce la exponencial con un error de $0.000002$, frente a $0.124539$ de Euler. ' +
      'Cuatro evaluaciones por paso compran cuatro órdenes de precisión.',
    calculo: { funcion: 'y', t0: 0, y0: 1, h: 0.1, tFin: 1, exacta: 'exp(t)' },
  },

  /* ---------------------------------------------------------------- */
  /* Ejemplo de casuística                                            */
  /* ---------------------------------------------------------------- */
  ejemploCasuistica: {
    id: 'rk-cas-1',
    titulo: 'Enfriamiento con RK4',
    tipo: 'casuistica',
    enunciado:
      'El exceso de temperatura de un cuerpo sigue $T′ = -2T$, con $T(0) = 1$. Estimar $T(2)$ con ' +
      'RK4 y $h = 0.2$, y comparar con $e^{-4} = 0.018316$.',
    extraccion: {
      busqueda: 'Se busca la temperatura al cabo de 2 segundos.',
      datos: [
        { simbolo: 'T', valor: 'exceso de temperatura', queEs: 'Lo que se quiere estimar.' },
        { simbolo: '$T^\\prime$', valor: '$-2T$', queEs: 'Rapidez de enfriamiento.' },
        { simbolo: 'T(0)', valor: '1', queEs: 'Condición inicial.' },
        { simbolo: 'h', valor: '0.2 s', queEs: 'Paso de tiempo.' },
      ],
      formulacion: 'El modelo es $T′ = -2T$; la exacta es $e^{-2t}$.',
    },
    planteamiento: 'Resolver $T′ = -2T$, $T(0) = 1$ en $[0, 2]$ con $h = 0.2$ usando RK4.',
    parametros: [
      { etiqueta: 'f(t, T)', valor: '-2T' },
      { etiqueta: 'Punto inicial', valor: '(0, 1)' },
      { etiqueta: 'h', valor: '0.2' },
      { etiqueta: 'Solución exacta', valor: '$e^{-2t}$' },
    ],
    formula: 'T₁ ≈ 0.6704',
    formulaTex: String.raw`T_1 \approx 0.6704`,
    interpretacion:
      'La temperatura decae rápido. RK4 corrige la pendiente dentro de cada paso, así que sigue ' +
      'la curva con mucha más fidelidad que Euler.',
    pasos: [
      'Paso 0: $k_1 = -2$; $k_2 = -2(1 + 0.1·(-2)) = -1.6$; $k_3 = -1.68$; $k_4 = -1.328$.',
      'Combinación: $T_1 = 1 + (0.2/6)(-2 + 2(-1.6) + 2(-1.68) + (-1.328)) = 0.6704$.',
      'Tras 10 pasos: $T(2) = 0.018337497$.',
      'El exacto es $e^{-4} = 0.018315639$. Error: $0.000021858$ ($0.12\\,\\%$).',
    ],
    algoritmo:
      'En cada paso se evalúan las cuatro pendientes sobre el valor corregido y se combinan.',
    criterio:
      'El exacto es $0.0183156$. RK4 da $0.0183375$: un error de $2.19·10^{-5}$, frente a ' +
      '$0.006786$ de Euler con $h = 0.1$.',
    conclusion:
      'RK4 estima $0.018337$ contra $0.018316$ exactos. La diferencia es despreciable para ' +
      'cualquier aplicación, incluso con un paso relativamente grande.',
    calculo: { funcion: '-2*y', t0: 0, y0: 1, h: 0.2, tFin: 2, exacta: 'exp(-2*t)' },
  },
};

/* ------------------------------------------------------------------ */
/* Ejemplos resueltos                                                   */
/* ------------------------------------------------------------------ */

export const EJEMPLOS_RK4: EjemploModulo5[] = [
  {
    id: 'rk-num-2',
    titulo: 'y′ = t + y con RK4 y h = 0.2',
    tipo: 'numerico',
    planteamiento:
      'Resolver $y′ = t + y$, $y(0) = 1$ en $[0, 1]$ con RK4 y $h = 0.2$. La exacta es $2e^t - t - 1$.',
    parametros: [
      { etiqueta: 'f(t, y)', valor: 't + y' },
      { etiqueta: 'Punto inicial', valor: '(0, 1)' },
      { etiqueta: 'h', valor: '0.2' },
      { etiqueta: 'Solución exacta', valor: '$2e^t - t - 1$' },
    ],
    formula: 'y₁ ≈ 1.2428',
    formulaTex: String.raw`y_1 \approx 1.2428`,
    interpretacion:
      'Con solo cinco pasos de 0.2, RK4 alcanza una precisión que Euler necesitaría con pasos ' +
      'mucho más chicos.',
    pasos: [
      'Paso 0: $k_1 = 1$; $k_2 = f(0.1, 1.1) = 1.2$; $k_3 = f(0.1, 1.12) = 1.22$; $k_4 = f(0.2, 1.244) = 1.444$.',
      'Combinación: $y_1 = 1 + (0.2/6)(1 + 2·1.2 + 2·1.22 + 1.444) = 1.2428$.',
      'Tras cinco pasos: $y_5 = 3.436502273$.',
      'El exacto es $3.436563657$. Error: $0.000061384$ ($0.0018\\,\\%$).',
    ],
    algoritmo: 'RK4 con cuatro pendientes por paso.',
    criterio: 'El error es $6.14·10^{-5}$, mucho menor que el de Euler con $h = 0.1$.',
    conclusion:
      'RK4 da $3.436502$ frente a $3.436564$ exactos: cinco pasos alcanzan para cuatro decimales ' +
      'correctos.',
    calculo: { funcion: 't + y', t0: 0, y0: 1, h: 0.2, tFin: 1, exacta: '2*exp(t) - t - 1' },
  },
  {
    id: 'rk-cas-2',
    titulo: 'Crecimiento poblacional',
    tipo: 'casuistica',
    enunciado:
      'Una población crece según $P′ = P$, con $P(0) = 1$ (en miles). Estimar la población a $t = 1$ ' +
      'con RK4 y $h = 0.2$, y comparar con $e = 2.718282$.',
    extraccion: {
      busqueda: 'Se busca la población al cabo de una unidad de tiempo.',
      datos: [
        { simbolo: 'P', valor: 'población en miles', queEs: 'La cantidad que se quiere estimar.' },
        { simbolo: '$P^\\prime$', valor: '$P$', queEs: 'Crecimiento proporcional al tamaño actual.' },
        { simbolo: 'P(0)', valor: '1', queEs: 'Población inicial.' },
      ],
      formulacion: 'El modelo es $P′ = P$; la solución exacta es $e^t$.',
    },
    planteamiento: 'Resolver $P′ = P$, $P(0) = 1$ en $[0, 1]$ con RK4 y $h = 0.2$.',
    parametros: [
      { etiqueta: 'f(t, P)', valor: 'P' },
      { etiqueta: 'Punto inicial', valor: '(0, 1)' },
      { etiqueta: 'h', valor: '0.2' },
      { etiqueta: 'Solución exacta', valor: '$e^t$' },
    ],
    formula: 'P₁ ≈ 1.2214',
    formulaTex: String.raw`P_1 \approx 1.2214`,
    interpretacion:
      'El crecimiento es exponencial. RK4 sigue la curva con cinco pasos y un error del orden de ' +
      '$3·10^{-5}$, mucho menor que el de Euler.',
    pasos: [
      'Paso 0: $k_1 = 1$; $k_2 = 1.1$; $k_3 = 1.11$; $k_4 = 1.222$.',
      'Combinación: $P_1 = 1 + (0.2/6)(1 + 2.2 + 2.22 + 1.222) = 1.2214$.',
      'Tras cinco pasos: $P_5 = 2.718251137$.',
      'El exacto es $e = 2.718281828$. Error: $0.000030692$ ($0.0011\\,\\%$).',
    ],
    algoritmo: 'RK4 con pesos 1-2-2-1 en cada paso.',
    criterio: 'El error es $3.07·10^{-5}$: cinco pasos bastan para cuatro cifras.',
    conclusion:
      'La población estimada es $2.718251$ miles, contra $2.718282$ exactos. La diferencia es ' +
      'despreciable para cualquier proyección real.',
    calculo: { funcion: 'y', t0: 0, y0: 1, h: 0.2, tFin: 1, exacta: 'exp(t)' },
  },
];

/* ------------------------------------------------------------------ */
/* Autoevaluación (6 ejercicios)                                       */
/* ------------------------------------------------------------------ */

export const EJERCICIOS_RK4: EjercicioModulo5[] = [
  {
    id: 'rk-ej-1',
    titulo: 'Ejercicio 1 · Un paso de RK4',
    tipo: 'numerico',
    planteamiento:
      'Con $y′ = y$, $y(0) = 1$ y $h = 0.1$, calcular $y_1$ usando RK4.',
    parametros: [
      { etiqueta: 'f(t, y)', valor: 'y' },
      { etiqueta: 'Punto inicial', valor: '(0, 1)' },
      { etiqueta: 'h', valor: '0.1' },
    ],
    pista: 'Las cuatro pendientes valen 1, 1.05, 1.0525 y 1.10525.',
    interpretacion: 'Se pide aplicar una vez la combinación 1-2-2-1.',
    pasos: [
      '$k_1 = 1$; $k_2 = 1.05$; $k_3 = 1.0525$; $k_4 = 1.10525$.',
      '$y_1 = 1 + (0.1/6)(1 + 2.1 + 2.105 + 1.10525) = 1.105170833$.',
      'El exacto es $e^{0.1} = 1.105170918$.',
    ],
    algoritmo: 'RK4 con un solo paso.',
    criterio: 'El resultado debe coincidir con $e^{0.1}$ hasta la sexta cifra decimal.',
    conclusion: '$y(0.1) ≈ 1.1051708$.',
    calculo: { funcion: 'y', t0: 0, y0: 1, h: 0.1, tFin: 0.1, exacta: 'exp(t)' },
    cuestionario: [
      {
        id: 'q1',
        tipo: 'opcion-multiple',
        enunciado: '¿Cuál es el valor de $k_2$ en el primer paso?',
        opciones: [
          { id: 'a', texto: '1' },
          { id: 'b', texto: '1.05' },
          { id: 'c', texto: '1.1' },
          { id: 'd', texto: '1.10525' },
        ],
        correcta: 'b',
        explicacion: '$k_2 = f(t_0 + h/2, y_0 + (h/2)k_1) = 1 + 0.05·1 = 1.05$.',
      },
      {
        id: 'q2',
        tipo: 'opcion-multiple',
        enunciado: '¿Cuál es la primera pendiente $k_1$ del paso?',
        opciones: [
          { id: 'a', texto: '1' },
          { id: 'b', texto: '1.05' },
          { id: 'c', texto: '1.0525' },
          { id: 'd', texto: '1.10525' },
        ],
        correcta: 'a',
        explicacion: 'Los pasos listan $k_1 = 1$; las otras tres son las correcciones dentro del paso.',
      },
      {
        id: 'q3',
        tipo: 'opcion-multiple',
        enunciado: '¿Qué valor da la combinación 1-2-2-1 de las cuatro pendientes?',
        opciones: [
          { id: 'a', texto: '$y_1 = 1.105170833$.' },
          { id: 'b', texto: '$k_4 = 1.10525$.' },
          { id: 'c', texto: '$e^{0.1} = 1.105170918$.' },
          { id: 'd', texto: '$h = 0.1$.' },
        ],
        correcta: 'a',
        explicacion:
          'Los pasos muestran $y_1 = 1 + (0.1/6)(1 + 2.1 + 2.105 + 1.10525) = 1.105170833$.',
      },
    ],
  },
  {
    id: 'rk-ej-2',
    titulo: 'Ejercicio 2 · Orden del error',
    tipo: 'numerico',
    planteamiento:
      'Si se divide h por 2 en RK4, ¿qué pasa con el error global? Comprobar con $y′ = y$ en $[0, 1]$.',
    parametros: [
      { etiqueta: 'f(t, y)', valor: 'y' },
      { etiqueta: 'h', valor: '0.1 → 0.05' },
      { etiqueta: 'Solución exacta', valor: '$e^t$' },
    ],
    pista: 'RK4 es de orden 4 en el error global.',
    interpretacion: 'El error debe bajar a la dieciseisava parte, aproximadamente.',
    pasos: [
      'Con $h = 0.1$: error $2.08·10^{-6}$.',
      'Con $h = 0.05$: error $1.36·10^{-7}$.',
      'La razón es $15.35$, cerca de 16 (la asíntota).',
    ],
    algoritmo: 'RK4 con dos pasos distintos.',
    criterio: 'Orden 4: al dividir h por 2, el error baja a la dieciseisava parte.',
    conclusion: 'El error baja un factor cercano a 16, como corresponde al orden 4.',
    calculo: { funcion: 'y', t0: 0, y0: 1, h: 0.1, tFin: 1, exacta: 'exp(t)' },
    cuestionario: [
      {
        id: 'q1',
        tipo: 'opcion-multiple',
        enunciado: 'Al dividir h por 2, el error global de RK4 se reduce a…',
        opciones: [
          { id: 'a', texto: 'la mitad.' },
          { id: 'b', texto: 'la cuarta parte.' },
          { id: 'c', texto: 'la dieciseisava parte.' },
          { id: 'd', texto: 'nada.' },
        ],
        correcta: 'c',
        explicacion: 'El error global es $O(h^4)$: $(1/2)^4 = 1/16$.',
      },
      {
        id: 'q2',
        tipo: 'opcion-multiple',
        enunciado: '¿Qué error se obtuvo con $h = 0.1$ según los pasos?',
        opciones: [
          { id: 'a', texto: '$2.08·10^{-6}$' },
          { id: 'b', texto: '$1.36·10^{-7}$' },
          { id: 'c', texto: '$15.35$' },
          { id: 'd', texto: '$0.05$' },
        ],
        correcta: 'a',
        explicacion: 'Los pasos dan $2.08·10^{-6}$ con $h = 0.1$ y $1.36·10^{-7}$ con $h = 0.05$.',
      },
      {
        id: 'q3',
        tipo: 'verdadero-falso',
        enunciado: 'La razón entre ambos errores es $15.35$, cerca de 16.',
        opciones: [
          { id: 'v', texto: 'Verdadero' },
          { id: 'f', texto: 'Falso' },
        ],
        correcta: 'v',
        explicacion: 'Los pasos calculan esa razón y la comparan con el valor asíntota $16$.',
      },
    ],
  },
  {
    id: 'rk-ej-3',
    titulo: 'Ejercicio 3 · Calcular k₂',
    tipo: 'numerico',
    planteamiento:
      'Para $y′ = t + y$, $y(0) = 1$ y $h = 0.2$, calcular $k_2$ del primer paso.',
    parametros: [
      { etiqueta: 'f(t, y)', valor: 't + y' },
      { etiqueta: 'Punto inicial', valor: '(0, 1)' },
      { etiqueta: 'h', valor: '0.2' },
    ],
    pista: '$k_2 = f(t_0 + h/2, y_0 + (h/2)k_1)$.',
    interpretacion: 'Se evalúa f en el punto medio, corregido con la primera pendiente.',
    pasos: [
      '$k_1 = f(0, 1) = 1$.',
      '$t_0 + h/2 = 0.1$; $y_0 + (h/2)k_1 = 1 + 0.1·1 = 1.1$.',
      '$k_2 = f(0.1, 1.1) = 0.1 + 1.1 = 1.2$.',
    ],
    algoritmo: 'Primer paso de RK4.',
    criterio: 'El resultado es 1.2, no 1.1 (ese sería si no se sumara t).',
    conclusion: '$k_2 = 1.2$.',
    calculo: { funcion: 't + y', t0: 0, y0: 1, h: 0.2, tFin: 0.2 },
    cuestionario: [
      {
        id: 'q1',
        tipo: 'opcion-multiple',
        enunciado: '¿Cuánto vale $k_2$?',
        opciones: [
          { id: 'a', texto: '1' },
          { id: 'b', texto: '1.1' },
          { id: 'c', texto: '1.2' },
          { id: 'd', texto: '1.4' },
        ],
        correcta: 'c',
        explicacion: '$f(0.1, 1.1) = 0.1 + 1.1 = 1.2$.',
      },
      {
        id: 'q2',
        tipo: 'opcion-multiple',
        enunciado: '¿En qué punto se evalúa $k_2$ según la pista?',
        opciones: [
          { id: 'a', texto: '$t_0 + h/2$ con $y_0 + (h/2)k_1$' },
          { id: 'b', texto: '$t_0$ con $y_0$' },
          { id: 'c', texto: '$t_0 + h$ con $y_0 + h k_1$' },
          { id: 'd', texto: '$0.1$ con $1.2$' },
        ],
        correcta: 'a',
        explicacion: 'La pista da $k_2 = f(t_0 + h/2, y_0 + (h/2)k_1)$; con $h = 0.2$ es $f(0.1, 1.1)$.',
      },
      {
        id: 'q3',
        tipo: 'verdadero-falso',
        enunciado: 'Si no se sumara $t$ en $f(t, y) = t + y$, el resultado sería $1.1$ y no $1.2$.',
        opciones: [
          { id: 'v', texto: 'Verdadero' },
          { id: 'f', texto: 'Falso' },
        ],
        correcta: 'v',
        explicacion: 'El criterio indica que $1.1$ sería el resultado de no sumar $t$; al sumarlo da $1.2$.',
      },
    ],
  },
  {
    id: 'rk-ej-4',
    titulo: 'Ejercicio 4 · Estabilidad',
    tipo: 'numerico',
    planteamiento:
      'Para $y′ = -50y$, ¿qué h conviene para RK4? Comparar $h = 0.05$ con $h = 0.1$.',
    parametros: [
      { etiqueta: 'f(t, y)', valor: '-50y' },
      { etiqueta: 'Región de RK4', valor: '$|h\\lambda| \\le 2.78$' },
      { etiqueta: 'Punto inicial', valor: '(0, 1)' },
    ],
    pista: 'El límite de estabilidad de RK4 es $h ≤ 2.78/50 ≈ 0.0556$.',
    interpretacion:
      'Con $h = 0.05$ el método se mantiene acotado; con $h = 0.1$ el factor supera la región y ' +
      'la solución numérica explota.',
    pasos: [
      'Con $h = 0.05$: $|hλ| = 2.5 < 2.78$, estable. $y(1) = 0.0001727$.',
      'Con $h = 0.1$: $|hλ| = 5 > 2.78$, inestable: el valor crece sin control.',
      'La exacta es $e^{-50} ≈ 1.93·10^{-22}$, prácticamente cero.',
    ],
    algoritmo: 'RK4 con dos pasos distintos.',
    criterio: 'Si $|h\\lambda|$ supera 2.78, la aproximación diverge.',
    conclusion: 'Para este problema, $h = 0.05$ es estable y $h = 0.1$ no.',
    calculo: { funcion: '-50*y', t0: 0, y0: 1, h: 0.05, tFin: 1, exacta: 'exp(-50*t)' },
    cuestionario: [
      {
        id: 'q1',
        tipo: 'opcion-multiple',
        enunciado: '¿Cuál es aproximadamente el h máximo estable de RK4 para $y′ = -50y$?',
        opciones: [
          { id: 'a', texto: '0.04' },
          { id: 'b', texto: '0.055' },
          { id: 'c', texto: '0.5' },
          { id: 'd', texto: 'No hay límite.' },
        ],
        correcta: 'b',
        explicacion: '$h ≤ 2.78/50 ≈ 0.0556$; 0.055 entra justo, 0.5 no.',
      },
      {
        id: 'q2',
        tipo: 'verdadero-falso',
        enunciado: 'Con $h = 0.05$ se tiene $|hλ| = 2.5 < 2.78$ y el método se mantiene acotado.',
        opciones: [
          { id: 'v', texto: 'Verdadero' },
          { id: 'f', texto: 'Falso' },
        ],
        correcta: 'v',
        explicacion: 'Los pasos indican $|hλ| = 2.5 < 2.78$, estable, con $y(1) = 0.0001727$.',
      },
      {
        id: 'q3',
        tipo: 'opcion-multiple',
        enunciado: '¿Qué valor de $h$ hace crecer la solución numérica sin control?',
        opciones: [
          { id: 'a', texto: '0.1' },
          { id: 'b', texto: '0.05' },
          { id: 'c', texto: '2.78' },
          { id: 'd', texto: '0.0556' },
        ],
        correcta: 'a',
        explicacion: 'Los pasos muestran que con $h = 0.1$ se tiene $|hλ| = 5 > 2.78$: inestable.',
      },
    ],
  },
  {
    id: 'rk-ej-5',
    titulo: 'Ejercicio 5 · Encontrar el error',
    tipo: 'numerico',
    planteamiento:
      'Un compañero calcula $k_2 = f(t_0 + h, y_0 + h·k_1)$ en RK4. ¿Qué está mal?',
    parametros: [
      { etiqueta: 'f(t, y)', valor: 'y' },
      { etiqueta: 'Punto inicial', valor: '(0, 1)' },
      { etiqueta: 'h', valor: '0.1' },
    ],
    pista: 'RK4 evalúa $k_2$ y $k_3$ en el PUNTO MEDIO del paso.',
    interpretacion: 'Usó h en vez de h/2 en el punto medio; eso convierte a RK4 en otra fórmula.',
    pasos: [
      'Lo correcto: $k_2 = f(t_0 + h/2, y_0 + (h/2)k_1) = f(0.05, 1.05) = 1.05$.',
      'Lo que hizo: $f(0.1, 1.1) = 1.1$.',
      'El error cambia el peso de la segunda pendiente y arruina el orden 4.',
    ],
    algoritmo: 'Primer paso de RK4.',
    criterio: '$k_2$ se evalúa en $t_0 + h/2$, no en $t_0 + h$.',
    conclusion: 'Hay que usar $h/2$ en la posición y en la corrección de $k_2$ y $k_3$.',
    calculo: { funcion: 'y', t0: 0, y0: 1, h: 0.1, tFin: 0.1, exacta: 'exp(t)' },
    cuestionario: [
      {
        id: 'q1',
        tipo: 'opcion-multiple',
        enunciado: '¿Dónde se evalúa $k_2$?',
        opciones: [
          { id: 'a', texto: 'En $t_0 + h$ con $y_0 + h k_1$.' },
          { id: 'b', texto: 'En $t_0 + h/2$ con $y_0 + (h/2)k_1$.' },
          { id: 'c', texto: 'En $t_0$ con $y_0$.' },
          { id: 'd', texto: 'En $t_0 + h/2$ con $y_0 + h k_1$.' },
        ],
        correcta: 'b',
        explicacion: '$k_2$ y $k_3$ se evalúan en el punto medio, con la corrección $h/2$.',
      },
      {
        id: 'q2',
        tipo: 'opcion-multiple',
        enunciado: '¿Qué valor obtuvo el compañero para $k_2$?',
        opciones: [
          { id: 'a', texto: '1.1' },
          { id: 'b', texto: '1.05' },
          { id: 'c', texto: '1' },
          { id: 'd', texto: '0.05' },
        ],
        correcta: 'a',
        explicacion: 'Los pasos muestran que hizo $f(0.1, 1.1) = 1.1$ en lugar de $f(0.05, 1.05) = 1.05$.',
      },
      {
        id: 'q3',
        tipo: 'verdadero-falso',
        enunciado: 'Usar $h$ en lugar de $h/2$ cambia el peso de la segunda pendiente y arruina el orden 4.',
        opciones: [
          { id: 'v', texto: 'Verdadero' },
          { id: 'f', texto: 'Falso' },
        ],
        correcta: 'v',
        explicacion: 'Los pasos señalan exactamente ese efecto sobre el orden 4.',
      },
    ],
  },
  {
    id: 'rk-ej-6',
    titulo: 'Ejercicio 6 · Casuística: drenaje con RK4',
    tipo: 'casuistica',
    enunciado:
      'El nivel de un tanque baja según $h′ = -0.5h$, con $h(0) = 2$ m. Estimar el nivel a los 2 ' +
      'minutos con RK4 y paso 0.5, y comparar con $2e^{-0.5t} = 0.735759$.',
    extraccion: {
      busqueda: 'Se busca el nivel que queda después de 2 minutos.',
      datos: [
        { simbolo: 'h', valor: 'nivel en metros', queEs: 'La cantidad a estimar.' },
        { simbolo: '$h^\\prime$', valor: '$-0.5h$', queEs: 'Rapidez de drenaje.' },
        { simbolo: 'h(0)', valor: '2 m', queEs: 'Nivel inicial.' },
      ],
      formulacion: 'El modelo es $h′ = -0.5h$; la exacta es $2e^{-0.5t}$.',
    },
    planteamiento: 'Resolver $h′ = -0.5h$, $h(0) = 2$ en $[0, 2]$ con RK4 y paso 0.5.',
    parametros: [
      { etiqueta: 'f(t, h)', valor: '-0.5h' },
      { etiqueta: 'Punto inicial', valor: '(0, 2)' },
      { etiqueta: 'Paso', valor: '0.5' },
      { etiqueta: 'Solución exacta', valor: '$2e^{-0.5t}$' },
    ],
    pista: 'Con solo cuatro pasos, RK4 debería quedar muy cerca del exacto.',
    interpretacion: 'El nivel decae; RK4 corrige la pendiente dentro de cada paso.',
    pasos: [
      'Paso 0: $k_1 = -1$; $k_2 = -0.875$; $k_3 = -0.890625$; $k_4 = -0.77734375$.',
      'Combinación: $h_1 = 2 + (0.5/6)(-1 + 2(-0.875) + 2(-0.890625) - 0.77734375) = 1.557617188$.',
      'Tras 4 pasos: $h(2) = 0.735788399$.',
      'El exacto es $0.735758882$. Error: $0.000029516$ ($0.0040\\,\\%$).',
    ],
    algoritmo: 'RK4 con cuatro pasos de 0.5.',
    criterio: 'El error es $2.95·10^{-5}$, unas 3 500 veces menor que el de Euler con el mismo paso.',
    conclusion: 'RK4 estima $0.735788$ m contra $0.735759$ m exactos: error de 0.03 mm.',
    calculo: { funcion: '-0.5*y', t0: 0, y0: 2, h: 0.5, tFin: 2, exacta: '2*exp(-0.5*t)' },
    cuestionario: [
      {
        id: 'q1',
        tipo: 'opcion-multiple',
        enunciado: '¿Por qué RK4 necesita menos pasos que Euler para la misma precisión?',
        opciones: [
          { id: 'a', texto: 'Porque evalúa más veces f por paso y combina mejor la información.' },
          { id: 'b', texto: 'Porque usa números más grandes.' },
          { id: 'c', texto: 'Porque no comete error.' },
          { id: 'd', texto: 'Porque el paso es más grande.' },
        ],
        correcta: 'a',
        explicacion:
          'Las cuatro pendientes corregidas capturan la curvatura dentro del paso; por eso el error global es de orden 4.',
      },
      {
        id: 'q2',
        tipo: 'opcion-multiple',
        enunciado: '¿Cuánto vale $k_1$ en el primer paso?',
        opciones: [
          { id: 'a', texto: '-1' },
          { id: 'b', texto: '-0.875' },
          { id: 'c', texto: '-0.890625' },
          { id: 'd', texto: '-0.77734375' },
        ],
        correcta: 'a',
        explicacion: 'Los pasos listan $k_1 = -1$, a partir de $h′ = -0.5h$ y $h(0) = 2$.',
      },
      {
        id: 'q3',
        tipo: 'verdadero-falso',
        enunciado: 'El valor $0.735788399$ es la estimación de RK4 y $0.735758882$ el exacto.',
        opciones: [
          { id: 'v', texto: 'Verdadero' },
          { id: 'f', texto: 'Falso' },
        ],
        correcta: 'v',
        explicacion: 'Los pasos dan $h(2) = 0.735788399$ y el exacto $0.735758882$, con error $0.000029516$.',
      },
    ],
  },
];
