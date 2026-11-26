import type {
  EjemploModulo4,
  EjercicioModulo4,
  TeoriaModulo4,
} from '../../../modelos/modulo4.model';

/**
 * CONTENIDO DEL TRAPECIO COMPUESTO: teoría, ejemplos y ejercicios.
 *
 * ── Solo textos y datos ──────────────────────────────────────────────
 * Acá no se calcula nada: las tablas, las áreas y los errores salen de
 * correr `trapecio.algoritmo.ts` con la función, a, b y n de cada
 * ejemplo. Por eso el contenido no puede mentir si el motor cambia.
 *
 * ── Fórmulas ─────────────────────────────────────────────────────────
 * `formulaTex` va a KaTeX con `app-math` y tiene prioridad: se escribe
 * con `String.raw` para que las barras lleguen intactas. `formula` es
 * el respaldo en Unicode (₀, ᵢ, Σ, ∫, ·) para `app-formula-matematica`,
 * que solo arma fracciones y potencias simples: NO convierte subíndices
 * ni integrales. Por eso las dos versiones se mantienen en paralelo y
 * el spec `contenido-modulo4.spec.ts` valida ambas.
 *
 * ── Los números de los pasos ─────────────────────────────────────────
 * Están calculados y verificados contra el algoritmo (y contra el spec
 * del método). Si se cambia un dato, hay que recalcular los pasos.
 */

/* ------------------------------------------------------------------ */
/* Teoría                                                              */
/* ------------------------------------------------------------------ */

export const TEORIA_TRAPECIO: TeoriaModulo4 = {
  concepto:
    'Una integral definida es un área. Cuando f(x) no tiene primitiva elemental, o solo se ' +
    'conocen algunos valores medidos, esa área no se puede calcular con una fórmula exacta: se ' +
    'aproxima. El trapecio hace la aproximación más simple posible: parte el intervalo en trozos ' +
    'iguales y, en cada trozo, cambia la curva por la recta que une los dos extremos. El área de ' +
    'cada trozo es la de un trapecio, y la integral es la suma de todos.',

  fundamento:
    'En un trozo de ancho h, el área del trapecio es (h/2)·(f izquierda + f derecha). Al sumar los ' +
    'n trozos, cada nodo interior se cuenta dos veces (es el borde derecho de un trapecio y el ' +
    'izquierdo del siguiente) y los extremos una sola vez. De ahí sale la fórmula compuesta: ' +
    'I ≈ (h/2)·[f(x₀) + 2f(x₁) + … + 2f(xₙ₋₁) + f(xₙ)]. No es una regla mágica: es la suma de ' +
    'áreas de trapecios, y se puede reconstruir en una hoja.',

  cuandoFalla:
    'Falla cuando la función cambia mucho dentro de un trozo: el trapecio une dos puntos con una ' +
    'recta y no ve lo que pasa en el medio. Con curvas muy pronunciadas hace falta un n grande, y ' +
    'entonces conviene pasar a Simpson. Tampoco sirve si la función no está definida en todo ' +
    '[a, b] (por ejemplo ln(x) con a = 0) o si tiene una discontinuidad dentro del intervalo: ahí ' +
    'la suma de trapecios no converge al área. Y ojo con los datos tabulados: el trapecio supone ' +
    'que entre dos mediciones la variable se comporta linealmente, lo cual es una decisión, no un hecho.',

  precision:
    'El error de un trapecio es proporcional a h³ y a la segunda derivada. Al sumar n trozos queda ' +
    'de orden h²: si se duplica n, el error baja a la cuarta parte. Eso se ve en la calculadora ' +
    'pasando de n = 4 a n = 8 y a n = 16. La curva del error es una parábola en h, y por eso el ' +
    'trapecio se llama método de orden 2. Cuando f es una recta, el error es exactamente cero: ' +
    'la recta del trapecio coincide con la función.',

  videoUrl: 'https://www.youtube.com/results?search_query=regla+del+trapecio+compuesta+ejemplo',

  recursos: [
    {
      titulo: 'Regla del trapecio (Wikipedia, español)',
      url: 'https://es.wikipedia.org/wiki/Regla_del_trapecio',
      tipo: 'lectura',
      descripcion: 'La deducción del área del trapecio, la versión compuesta y la fórmula del error.',
    },
    {
      titulo: 'Integración numérica (Wikipedia, español)',
      url: 'https://es.wikipedia.org/wiki/Integraci%C3%B3n_num%C3%A9rica',
      tipo: 'lectura',
      descripcion: 'El panorama completo: trapecio, Simpson, cuadratura y orden de los métodos.',
    },
    {
      titulo: 'Trapezoidal rule (MathWorld)',
      url: 'https://mathworld.wolfram.com/TrapezoidalRule.html',
      tipo: 'lectura',
      descripcion: 'La fórmula, el término de error y la relación con la regla de Simpson.',
    },
    {
      titulo: 'Calculus Grapher (PhET, simulación)',
      url: 'https://phet.colorado.edu/es/simulations/calculus-grapher',
      tipo: 'interactivo',
      descripcion: 'Dibujá una función y mirá el área bajo la curva para comparar con tus cálculos.',
    },
    {
      titulo: 'Videos de repaso: trapecio compuesto',
      url: 'https://www.youtube.com/results?search_query=regla+del+trapecio+compuesta+ejercicios+resueltos',
      tipo: 'video',
      descripcion: 'Ejemplos con tabla de nodos y coeficientes, para practicar el cálculo a mano.',
    },
  ],

  algoritmo: {
    formula:
      'I ≈ (h/2) · [ f(x₀) + 2f(x₁) + 2f(x₂) + … + 2f(xₙ₋₁) + f(xₙ) ]      h = (b − a)/n',
    formulaTex: String.raw`I \approx \frac{h}{2}\left[f(x_0)+2f(x_1)+2f(x_2)+\cdots+2f(x_{n-1})+f(x_n)\right], \quad h=\frac{b-a}{n}`,
    criterios: [
      {
        nombre: 'Ancho h',
        explicacion:
          'h = (b − a)/n. Es la distancia entre nodos consecutivos: cuanto más chico, más fina la aproximación.',
      },
      {
        nombre: 'Coeficientes 1 y 2',
        explicacion:
          'Los extremos pesan 1 y los nodos interiores pesan 2, porque cada uno es borde de dos trapecios.',
      },
      {
        nombre: 'Error de orden h²',
        explicacion:
          'Al duplicar n, el error se reduce a la cuarta parte. Es la forma práctica de comprobar que el resultado está bien.',
      },
      {
        nombre: 'Valor exacto (opcional)',
        explicacion:
          'Si se conoce, el error real es |I aproximada − I exacta|. Si no, se compara contra una solución con n más grande.',
      },
    ],
    pasos: [
      'Identificar f(x), el intervalo [a, b] y la cantidad de subintervalos n.',
      'Calcular h = (b − a)/n y los nodos xᵢ = a + i·h, para i = 0, 1, …, n.',
      'Evaluar f en cada nodo y armar la tabla con su coeficiente (1 en los extremos, 2 en los interiores).',
      'Sumar los aportes coeficiente · f(xᵢ) para obtener la suma ponderada.',
      'Multiplicar por h/2: ese es el valor aproximado de la integral.',
      'Si se conoce el valor exacto, medir el error. Si no, repetir con n duplicado y comparar.',
    ],
    ventajas: [
      'Es el método más fácil de explicar y de hacer a mano: cada trozo es un trapecio.',
      'Funciona con datos tabulados, sin necesidad de conocer la fórmula de f.',
      'Es exacta para funciones lineales y muy robusta frente a funciones suaves.',
      'El error se puede estimar sin conocer f′ ni f″: alcanza con comparar dos valores de n.',
    ],
    limitaciones: [
      'Necesita muchos subintervalos para competir en precisión con Simpson.',
      'Si la función tiene curvatura fuerte, el error baja lento (orden h²).',
      'No detecta lo que pasa dentro de un trozo: una discontinuidad escondida pasa desapercibida.',
      'Con datos tabulados, supone comportamiento lineal entre mediciones, lo que puede ser falso.',
    ],
    recomendaciones: [
      'Empezá con n = 4 u 8 para ver la tabla y el dibujo, y después duplicá para medir la mejora.',
      'Graficá siempre los trapecios: donde la curva es cóncava, se ve si el área sobra o falta.',
      'Si el error no baja como h², sospechá de una discontinuidad o de un error en la función.',
      'Para mayor precisión con el mismo n, usá Simpson (pero recordá que exige n par).',
    ],
  },

  /* ---------------------------------------------------------------- */
  /* Ejemplo numérico                                                 */
  /* ---------------------------------------------------------------- */
  ejemploNormal: {
    id: 'tr-num-1',
    titulo: 'Integral de x² en [0, 1] con cuatro trapecios',
    tipo: 'numerico',
    planteamiento:
      'Aproximar ∫₀¹ x² dx con la regla del trapecio compuesta usando n = 4 subintervalos, y ' +
      'comparar con el valor exacto 1/3.',
    parametros: [
      { etiqueta: 'f(x)', valor: 'x²' },
      { etiqueta: 'Intervalo', valor: '[0, 1]' },
      { etiqueta: 'n', valor: '4' },
      { etiqueta: 'Valor exacto', valor: '1/3 = 0.333333' },
    ],
    formula: '∫₀¹ x² dx ≈ (0.25/2) · [0 + 2(0.0625) + 2(0.25) + 2(0.5625) + 1]',
    formulaTex: String.raw`\int_0^1 x^2\,dx \approx \frac{0.25}{2}\left[0+2(0.0625)+2(0.25)+2(0.5625)+1\right]`,
    interpretacion:
      'x² es una parábola que crece; en cada trozo la recta del trapecio queda por encima de la ' +
      'curva, así que el resultado va a ser un poco mayor que 1/3. La diferencia es el error de ' +
      'truncamiento del método, no un error de cuentas.',
    pasos: [
      'h = (1 − 0)/4 = 0.25. Los nodos son 0, 0.25, 0.5, 0.75 y 1.',
      'f evaluada: f(0) = 0; f(0.25) = 0.0625; f(0.5) = 0.25; f(0.75) = 0.5625; f(1) = 1.',
      'Suma ponderada: 1·0 + 2·0.0625 + 2·0.25 + 2·0.5625 + 1·1 = 0.125 + 0.5 + 1.125 + 1 = 2.75.',
      'Integral: I ≈ (0.25/2)·2.75 = 0.125·2.75 = 0.34375. El exacto es 0.333333, así que el error ' +
        'absoluto es 0.010417 (3.125 %).',
    ],
    algoritmo:
      'Se parte el intervalo en cuatro trozos iguales, se evalúa f en los cinco nodos, se aplican ' +
      'los coeficientes 1-2-2-2-1 y se multiplica la suma por h/2.',
    criterio:
      'El valor exacto es 1/3. El error relativo del 3.1 % es grande para solo cuatro trozos, y es ' +
      'la señal de que hay que aumentar n: con n = 8 el error baja a 0.78 %.',
    conclusion:
      'La integral aproximada es 0.34375, contra 0.333333 del valor exacto: un error de 0.010417 ' +
      '(3.125 %). El resultado es mayor que el exacto porque la parábola es cóncava hacia arriba y ' +
      'cada trapecio queda por encima de la curva.',
    calculo: { funcion: 'x^2', a: 0, b: 1, n: 4, valorExacto: 1 / 3, etiqueta: 'x² en [0, 1]' },
  },

  /* ---------------------------------------------------------------- */
  /* Ejemplo de casuística: trabajo de una fuerza variable            */
  /* ---------------------------------------------------------------- */
  ejemploCasuistica: {
    id: 'tr-cas-1',
    titulo: 'Trabajo de una fuerza que depende de la posición',
    tipo: 'casuistica',
    enunciado:
      'Una fuerza F(x) = 200/(x + 1) N empuja un carrito a lo largo de 4 m. El trabajo realizado es ' +
      'la integral de la fuerza por el desplazamiento: W = ∫₀⁴ F(x) dx. Calcularlo con n = 8 y ' +
      'estimar el error, sabiendo que el valor exacto es 200·ln(5) = 321.8876 J.',
    extraccion: {
      busqueda: 'Se busca el trabajo total a partir de una fuerza que cambia con la posición.',
      datos: [
        {
          simbolo: 'F',
          valor: '200/(x + 1) N',
          queEs: 'Fuerza aplicada, que disminuye a medida que el carrito avanza.',
        },
        { simbolo: 'x', valor: 'de 0 a 4 m', queEs: 'Posición del carrito (variable de integración).' },
        { simbolo: 'W', valor: '∫₀⁴ F(x) dx', queEs: 'Trabajo, en joules (N·m).' },
      ],
      formulacion:
        'El trabajo es la integral de la fuerza a lo largo del camino. Con la fuerza dada, la ' +
        'primitiva existe (200·ln(x + 1)), así que se puede comparar la aproximación con el valor exacto.',
    },
    planteamiento:
      'Aproximar W = ∫₀⁴ 200/(x + 1) dx con n = 8 subintervalos y comparar con 200·ln(5) = 321.8876 J.',
    parametros: [
      { etiqueta: 'F(x)', valor: '200/(x + 1)' },
      { etiqueta: 'Intervalo', valor: '[0, 4] m' },
      { etiqueta: 'n', valor: '8' },
      { etiqueta: 'Valor exacto', valor: '321.8876 J' },
    ],
    formula: 'W ≈ (0.5/2) · [200 + 2(133.3333) + … + 2(44.4444) + 40]',
    formulaTex: String.raw`W \approx \frac{0.5}{2}\left[200+2(133.3333)+\cdots+2(44.4444)+40\right]`,
    interpretacion:
      'La fuerza empieza en 200 N y baja a 40 N. Como la curva es convexa (decrece cada vez más ' +
      'despacio), las rectas del trapecio quedan por encima de la curva y el trabajo se sobreestima. ' +
      'Ocho trozos ya dan una aproximación razonable para ingeniería.',
    pasos: [
      'h = (4 − 0)/8 = 0.5. Los nodos son 0, 0.5, 1, …, 4.',
      'F evaluada: 200; 133.3333; 100; 80; 66.6667; 57.1429; 50; 44.4444; 40.',
      'Suma ponderada: 200 + 40 + 2·(133.3333 + 100 + 80 + 66.6667 + 57.1429 + 50 + 44.4444) = ' +
        '240 + 2·531.5873 = 1303.1746.',
      'Trabajo: W ≈ (0.5/2)·1303.1746 = 325.7937 J. Error absoluto: 3.9061 J (1.21 %).',
    ],
    algoritmo:
      'Se aplica la fórmula compuesta con F como función, a = 0, b = 4 y n = 8. Los coeficientes ' +
      '1-2-…-1 reparten el peso de cada medición de fuerza.',
    criterio:
      'El valor exacto es 200·ln(5) = 321.8876 J. La aproximación da 325.7937 J, un 1.21 % más. ' +
      'Al pasar a n = 16 el error baja a 0.9937 J (0.31 %), cerca de la cuarta parte.',
    conclusion:
      'El trabajo aproximado es 325.79 J, contra 321.89 J del valor exacto: un error de 3.91 J ' +
      '(1.21 %). El trapecio sobreestima porque la fuerza decrece con curvatura. Para una decisión ' +
      'de ingeniería, 8 trozos alcanzan; para un informe que exija 0.1 %, hay que subir n o usar Simpson.',
    calculo: {
      funcion: '200/(x + 1)',
      a: 0,
      b: 4,
      n: 8,
      valorExacto: 200 * Math.log(5),
      etiqueta: 'Trabajo de F(x) = 200/(x+1)',
    },
  },
};

/* ------------------------------------------------------------------ */
/* Ejemplos resueltos (2 numéricos + 2 casuísticas)                    */
/* ------------------------------------------------------------------ */

export const EJEMPLOS_TRAPECIO: EjemploModulo4[] = [
  {
    id: 'tr-num-2',
    titulo: 'Integral de 1/x en [1, 2] con cuatro trapecios',
    tipo: 'numerico',
    planteamiento: 'Aproximar ∫₁² (1/x) dx con n = 4 y comparar con ln(2) = 0.6931472.',
    parametros: [
      { etiqueta: 'f(x)', valor: '1/x' },
      { etiqueta: 'Intervalo', valor: '[1, 2]' },
      { etiqueta: 'n', valor: '4' },
      { etiqueta: 'Valor exacto', valor: 'ln 2 = 0.6931472' },
    ],
    formula: '∫₁² (1/x) dx ≈ (0.25/2) · [1 + 2(0.8) + 2(0.6666667) + 2(0.5714286) + 0.5]',
    formulaTex: String.raw`\int_1^2 \frac{1}{x}\,dx \approx \frac{0.25}{2}\left[1+2(0.8)+2(0.6666667)+2(0.5714286)+0.5\right]`,
    interpretacion:
      '1/x es convexa y decreciente: los trapecios quedan por encima de la curva, así que el ' +
      'resultado será mayor que ln(2). Es el ejemplo clásico para comparar trapecio contra Simpson.',
    pasos: [
      'h = (2 − 1)/4 = 0.25. Nodos: 1; 1.25; 1.5; 1.75; 2.',
      'f evaluada: 1; 0.8; 0.6666667; 0.5714286; 0.5.',
      'Suma ponderada: 1 + 0.5 + 2·(0.8 + 0.6666667 + 0.5714286) = 1.5 + 4.0761905 = 5.5761905.',
      'I ≈ (0.25/2)·5.5761905 = 0.6970238. Error: 0.0038766 (0.56 %).',
    ],
    algoritmo: 'Fórmula compuesta con cuatro trozos, coeficientes 1-2-2-2-1.',
    criterio:
      'ln(2) = 0.6931472. El trapecio con n = 4 da 0.6970238, un 0.56 % alto. Con n = 8 baja a ' +
      '0.6941219, aproximadamente la cuarta parte del error.',
    conclusion:
      'La aproximación es 0.697024, con un error absoluto de 0.003877 (0.56 %). El resultado ' +
      'sobreestima porque 1/x es convexa. Con el mismo n, Simpson da 0.693254: ahí se ve por qué ' +
      'conviene el método de orden superior.',
    calculo: { funcion: '1/x', a: 1, b: 2, n: 4, valorExacto: Math.LN2, etiqueta: '1/x en [1, 2]' },
  },
  {
    id: 'tr-cas-2',
    titulo: 'Costo total a partir del costo marginal',
    tipo: 'casuistica',
    enunciado:
      'El costo marginal de una planta (miles de soles por unidad) es C′(q) = 0.5q² + 1. Estimar el ' +
      'costo de pasar de producir 0 a 2 unidades integrando el costo marginal: C = ∫₀² C′(q) dq. ' +
      'Comparar con el valor exacto 10/3 = 3.333333 miles de soles.',
    extraccion: {
      busqueda: 'Se busca el costo acumulado al producir q unidades, integrando el costo de cada unidad.',
      datos: [
        {
          simbolo: 'C′(q)',
          valor: '0.5q² + 1 mil soles/unidad',
          queEs: 'Costo marginal: lo que cuesta la unidad siguiente.',
        },
        { simbolo: 'q', valor: 'de 0 a 2 unidades', queEs: 'Nivel de producción.' },
        { simbolo: 'C', valor: '∫₀² C′(q) dq', queEs: 'Costo total del tramo productivo.' },
      ],
      formulacion:
        'El costo total es el área bajo el costo marginal. La integral se aproxima con la regla del ' +
        'trapecio, que supone que entre dos niveles de producción el costo marginal varía linealmente.',
    },
    planteamiento:
      'Aproximar C = ∫₀² (0.5q² + 1) dq con n = 4 y comparar con 10/3 = 3.333333 mil soles.',
    parametros: [
      { etiqueta: 'C′(q)', valor: '0.5q² + 1' },
      { etiqueta: 'Intervalo', valor: '[0, 2]' },
      { etiqueta: 'n', valor: '4' },
      { etiqueta: 'Valor exacto', valor: '3.333333 mil soles' },
    ],
    formula: 'C ≈ (0.5/2) · [1 + 2(1.125) + 2(1.5) + 2(2.125) + 3]',
    formulaTex: String.raw`C \approx \frac{0.5}{2}\left[1+2(1.125)+2(1.5)+2(2.125)+3\right]`,
    interpretacion:
      'El costo marginal es una parábola que crece: producir más se vuelve cada vez más caro. El ' +
      'trapecio va a sobreestimar el costo acumulado, porque la recta entre dos niveles queda por ' +
      'encima de la curva.',
    pasos: [
      'h = (2 − 0)/4 = 0.5. Nodos: 0; 0.5; 1; 1.5; 2.',
      'C′ evaluada: 1; 1.125; 1.5; 2.125; 3.',
      'Suma ponderada: 1 + 3 + 2·(1.125 + 1.5 + 2.125) = 4 + 9.5 = 13.5.',
      'Costo: C ≈ (0.5/2)·13.5 = 3.375 mil soles. Error: 0.041667 (1.25 %).',
    ],
    algoritmo:
      'Se integra el costo marginal con cuatro trapecios y se interpreta el resultado en miles de soles.',
    criterio:
      'El valor exacto es 3.333333. El trapecio da 3.375, un 1.25 % alto. Con n = 8 el error baja a ' +
      '0.010417 (0.31 %), como corresponde al orden h².',
    conclusion:
      'El costo estimado del tramo es 3.375 mil soles, contra 3.333333 exactos: 0.0417 mil soles de ' +
      'más (1.25 %). La aproximación sirve para presupuestar, pero no para cerrar una contabilidad: ' +
      'ahí conviene duplicar n o usar Simpson.',
    calculo: {
      funcion: '0.5*x^2 + 1',
      a: 0,
      b: 2,
      n: 4,
      valorExacto: 10 / 3,
      etiqueta: 'Costo marginal acumulado',
    },
  },
];

/* ------------------------------------------------------------------ */
/* Autoevaluación (2 numéricos + 2 casuísticas)                        */
/* ------------------------------------------------------------------ */

export const EJERCICIOS_TRAPECIO: EjercicioModulo4[] = [
  {
    id: 'tr-ej-num-1',
    titulo: 'Ejercicio 1 · Exponencial en [0, 1]',
    tipo: 'numerico',
    planteamiento: 'Aproximar ∫₀¹ eˣ dx con n = 4 y comparar con e − 1 = 1.7182818.',
    parametros: [
      { etiqueta: 'f(x)', valor: 'eˣ (escribila como exp(x))' },
      { etiqueta: 'Intervalo', valor: '[0, 1]' },
      { etiqueta: 'n', valor: '4' },
      { etiqueta: 'Valor exacto', valor: 'e − 1 = 1.7182818' },
    ],
    pista: 'Los nodos son 0; 0.25; 0.5; 0.75; 1. La función es convexa: el trapecio sobreestima.',
    interpretacion:
      'La exponencial crece cada vez más rápido, así que las rectas quedan por encima de la curva.',
    pasos: [
      'h = 0.25. f evaluada: 1; 1.2840254; 1.6487213; 2.1170000; 2.7182818.',
      'Suma: 1 + 2.7182818 + 2·(1.2840254 + 1.6487213 + 2.1170000) = 3.7182818 + 10.0994935 = 13.8177752.',
      'I ≈ (0.25/2)·13.8177752 = 1.7272219.',
      'Error absoluto: 0.0089401; error relativo: 0.52 %.',
    ],
    algoritmo: 'Cuatro trapecios con coeficientes 1-2-2-2-1.',
    criterio: 'El error es 0.0089401 (0.52 %). Al duplicar n debería bajar a unos 0.00224.',
    conclusion:
      'La integral aproximada es 1.727222, frente a 1.718282 exacta: 0.52 % alto. El resultado ' +
      'mejora rápido al duplicar n, como corresponde a un método de orden 2.',
    calculo: { funcion: 'exp(x)', a: 0, b: 1, n: 4, valorExacto: Math.E - 1 },
    cuestionario: [
      {
        id: 'q1',
        tipo: 'opcion-multiple',
        enunciado: 'Si se pasa de n = 4 a n = 8, ¿qué se espera del error?',
        opciones: [
          { id: 'a', texto: 'Se reduce a la mitad.' },
          { id: 'b', texto: 'Se reduce a la cuarta parte, aproximadamente.' },
          { id: 'c', texto: 'Se duplica.' },
          { id: 'd', texto: 'No cambia.' },
        ],
        correcta: 'b',
        explicacion:
          'El trapecio es de orden h². Al duplicar n, h se parte a la mitad y el error queda multiplicado por (1/2)² = 1/4.',
      },
      {
        id: 'q2',
        tipo: 'opcion-multiple',
        enunciado: '¿Por qué 1.7272219 queda por encima de 1.7182818?',
        opciones: [
          { id: 'a', texto: 'Porque la exponencial es convexa: las rectas quedan por encima.' },
          { id: 'b', texto: 'Porque la exponencial decrece en [0, 1].' },
          { id: 'c', texto: 'Porque h = 0.25 se resta del valor exacto.' },
          { id: 'd', texto: 'Porque n = 4 es impar.' },
        ],
        correcta: 'a',
        explicacion:
          'La curva es convexa: en cada trozo la recta entre los extremos queda por encima y el trapecio sale mayor.',
      },
      {
        id: 'q3',
        tipo: 'verdadero-falso',
        enunciado:
          'Con los coeficientes 1-2-2-2-1, los extremos 0 y 1 pesan 1 y los tres valores intermedios pesan 2.',
        opciones: [
          { id: 'v', texto: 'Verdadero' },
          { id: 'f', texto: 'Falso' },
        ],
        correcta: 'v',
        explicacion:
          'Cada nodo interior es borde de dos trapecios, por eso se cuenta dos veces; los extremos 0 y 1, una sola.',
      },
    ],
  },
  {
    id: 'tr-ej-num-2',
    titulo: 'Ejercicio 2 · Logaritmo con seis trapecios',
    tipo: 'numerico',
    planteamiento: 'Aproximar ∫₁² (1/x) dx con n = 6 y comparar con ln(2) = 0.6931472.',
    parametros: [
      { etiqueta: 'f(x)', valor: '1/x' },
      { etiqueta: 'Intervalo', valor: '[1, 2]' },
      { etiqueta: 'n', valor: '6' },
      { etiqueta: 'Valor exacto', valor: '0.6931472' },
    ],
    pista: 'h = 1/6 ≈ 0.1666667. Con más trozos que en el ejemplo, el error debe ser menor.',
    interpretacion:
      'La función decrece con curvatura positiva: el trapecio sobreestima otra vez, pero con menos fuerza.',
    pasos: [
      'h = 1/6. Nodos: 1; 1.1666667; 1.3333333; 1.5; 1.6666667; 1.8333333; 2.',
      'f evaluada: 1; 0.8571429; 0.75; 0.6666667; 0.6; 0.5454545; 0.5.',
      'Suma: 1 + 0.5 + 2·(0.8571429 + 0.75 + 0.6666667 + 0.6 + 0.5454545) = 1.5 + 6.8385283 = 8.3385283.',
      'I ≈ (1/12)·8.3385283 = 0.6948773. Error: 0.0017302 (0.25 %).',
    ],
    algoritmo: 'Seis trapecios de ancho 1/6.',
    criterio: 'El error baja de 0.003877 (n = 4) a 0.001730 (n = 6), consistente con el orden h².',
    conclusion:
      'La aproximación es 0.694877, con 0.25 % de error. Es casi cuatro veces mejor que con cuatro ' +
      'trozos, aunque n solo creció un 50 %: el error depende de h².',
    calculo: { funcion: '1/x', a: 1, b: 2, n: 6, valorExacto: Math.LN2 },
    cuestionario: [
      {
        id: 'q1',
        tipo: 'verdadero-falso',
        enunciado: 'Con 1/x, el trapecio da un valor mayor que ln(2).',
        opciones: [
          { id: 'v', texto: 'Verdadero' },
          { id: 'f', texto: 'Falso' },
        ],
        correcta: 'v',
        explicacion:
          'La curva es convexa (f″ > 0), así que la recta entre dos puntos queda por encima de la curva y el área del trapecio es mayor que la real.',
      },
      {
        id: 'q2',
        tipo: 'opcion-multiple',
        enunciado: '¿De dónde sale el factor 1/12 que multiplica la suma 8.3385283?',
        opciones: [
          { id: 'a', texto: 'De h/2 con h = 1/6.' },
          { id: 'b', texto: 'De h/3 con h = 1/6.' },
          { id: 'c', texto: 'De dividir la suma entre n = 6.' },
          { id: 'd', texto: 'Del valor exacto 0.6931472.' },
        ],
        correcta: 'a',
        explicacion:
          'El trapecio compuesto multiplica la suma ponderada por h/2; con h = 1/6 eso da 1/12.',
      },
      {
        id: 'q3',
        tipo: 'verdadero-falso',
        enunciado:
          'El error bajó de 0.003877 (n = 4) a 0.001730 (n = 6) aunque n creció solo un 50 %: se explica porque el error depende de h².',
        opciones: [
          { id: 'v', texto: 'Verdadero' },
          { id: 'f', texto: 'Falso' },
        ],
        correcta: 'v',
        explicacion:
          'El criterio lo atribuye al orden h²: al achicarse h, el error cae más rápido que el aumento de n.',
      },
    ],
  },
  {
    id: 'tr-ej-cas-1',
    titulo: 'Ejercicio 3 · Área bajo un seno',
    tipo: 'numerico',
    planteamiento: 'Aproximar ∫ de 0 a π sin(x) dx con n = 4 y comparar con el valor exacto 2.',
    parametros: [
      { etiqueta: 'f(x)', valor: 'sin(x)' },
      { etiqueta: 'Intervalo', valor: '[0, π]' },
      { etiqueta: 'n', valor: '4' },
      { etiqueta: 'Valor exacto', valor: '2' },
    ],
    pista: 'π ≈ 3.1415927 y h = π/4. La curva es cóncava hacia abajo: el trapecio subestima.',
    interpretacion:
      'El seno sube y baja. En [0, π] es cóncavo, así que las rectas quedan por debajo de la curva ' +
      'y el área se subestima: el error tiene signo negativo.',
    pasos: [
      'h = π/4 ≈ 0.7853982. Nodos: 0; π/4; π/2; 3π/4; π.',
      'f evaluada: 0; 0.7071068; 1; 0.7071068; 0.',
      'Suma: 0 + 0 + 2·(0.7071068 + 1 + 0.7071068) = 4.8284271.',
      'I ≈ (π/8)·4.8284271 = 1.8961189. Error: 0.1038811 (5.19 %).',
    ],
    algoritmo: 'Cuatro trapecios, con los nodos medidos en radianes.',
    criterio:
      'El exacto es 2. La aproximación queda 5.19 % baja. Con n = 8 el error baja a 0.02577 (1.29 %), ' +
      'otra vez cerca de la cuarta parte.',
    conclusion:
      'La integral aproximada es 1.896119, frente a 2 exacta: 0.103881 de menos (5.19 %). El error ' +
      'es grande porque solo hay cuatro trozos en una curva muy curvada; con n = 8 la diferencia se ' +
      'reduce a la cuarta parte.',
    calculo: { funcion: 'sin(x)', a: 0, b: Math.PI, n: 4, valorExacto: 2 },
    cuestionario: [
      {
        id: 'q1',
        tipo: 'opcion-multiple',
        enunciado: '¿Por qué el resultado es MENOR que 2?',
        opciones: [
          { id: 'a', texto: 'Porque el seno es negativo en [0, π].' },
          { id: 'b', texto: 'Porque la curva es cóncava y las rectas quedan por debajo.' },
          { id: 'c', texto: 'Porque π es irracional.' },
          { id: 'd', texto: 'Porque n es par.' },
        ],
        correcta: 'b',
        explicacion:
          'En [0, π] el seno es positivo y cóncavo. La recta entre dos puntos de una curva cóncava queda por debajo, así que el área del trapecio es menor que la real.',
      },
      {
        id: 'q2',
        tipo: 'opcion-multiple',
        enunciado: 'El criterio dice que con n = 8 el error baja a 0.02577 (1.29 %). ¿Por qué?',
        opciones: [
          { id: 'a', texto: 'Porque se duplicó n y la diferencia se reduce a la cuarta parte.' },
          { id: 'b', texto: 'Porque el seno pasa a ser convexo en [0, π].' },
          { id: 'c', texto: 'Porque el valor exacto cambia con n.' },
          { id: 'd', texto: 'Porque con n = 8 el error es cero.' },
        ],
        correcta: 'a',
        explicacion:
          'La conclusión lo dice: con n = 8 la diferencia se reduce a la cuarta parte frente a los 0.103881 de antes.',
      },
      {
        id: 'q3',
        tipo: 'verdadero-falso',
        enunciado:
          'En la suma 0 + 0 + 2·(0.7071068 + 1 + 0.7071068), los extremos 0 y π entran una sola vez porque cada uno toca un solo trapecio.',
        opciones: [
          { id: 'v', texto: 'Verdadero' },
          { id: 'f', texto: 'Falso' },
        ],
        correcta: 'v',
        explicacion:
          'Los extremos del intervalo son borde de un trapecio; los nodos interiores, de dos, y por eso llevan el factor 2.',
      },
    ],
  },
  {
    id: 'tr-ej-cas-2',
    titulo: 'Ejercicio 4 · Volumen acumulado en un depósito',
    tipo: 'casuistica',
    enunciado:
      'El caudal que entra a un depósito (m³/h) sigue Q(t) = 0.5t² + 1 durante 3 horas. El volumen ' +
      'acumulado es V = ∫₀³ Q(t) dt. Estimarlo con n = 6 y comparar con el valor exacto 7.5 m³.',
    extraccion: {
      busqueda: 'Se busca el volumen total acumulado integrando el caudal en el tiempo.',
      datos: [
        { simbolo: 'Q(t)', valor: '0.5t² + 1 m³/h', queEs: 'Caudal de entrada en cada instante.' },
        { simbolo: 't', valor: 'de 0 a 3 h', queEs: 'Tiempo transcurrido.' },
        { simbolo: 'V', valor: '∫₀³ Q(t) dt', queEs: 'Volumen acumulado, en m³.' },
      ],
      formulacion:
        'El volumen es el área bajo el caudal. Se aproxima con trapecios, suponiendo que entre dos ' +
        'mediciones el caudal varía linealmente.',
    },
    planteamiento: 'Aproximar V = ∫₀³ (0.5t² + 1) dt con n = 6 y comparar con 7.5 m³.',
    parametros: [
      { etiqueta: 'Q(t)', valor: '0.5t² + 1' },
      { etiqueta: 'Intervalo', valor: '[0, 3] h' },
      { etiqueta: 'n', valor: '6' },
      { etiqueta: 'Valor exacto', valor: '7.5 m³' },
    ],
    pista: 'h = 0.5. El caudal crece, así que el trapecio sobreestima el volumen.',
    interpretacion:
      'El caudal aumenta con el tiempo: el depósito recibe más agua cada hora. La integral acumula ' +
      'ese caudal y el trapecio lo aproxima con tramos rectos.',
    pasos: [
      'h = (3 − 0)/6 = 0.5. Nodos: 0; 0.5; 1; 1.5; 2; 2.5; 3.',
      'Q evaluada: 1; 1.125; 1.5; 2.125; 3; 4.125; 5.5.',
      'Suma: 1 + 5.5 + 2·(1.125 + 1.5 + 2.125 + 3 + 4.125) = 6.5 + 23.75 = 30.25.',
      'V ≈ (0.5/2)·30.25 = 0.25·30.25 = 7.5625 m³.',
      'Valor exacto: ∫₀³ (0.5t² + 1) dt = 0.5·27/3 + 3 = 7.5 m³. Error: 0.0625 m³ (0.83 %).',
    ],
    algoritmo: 'Seis trapecios de ancho 0.5 sobre el caudal.',
    criterio:
      'El exacto es 7.5 m³. El trapecio da 7.5625, un 0.83 % alto. Al duplicar n el error ' +
      'baja a la cuarta parte.',
    conclusion:
      'El volumen acumulado es 7.5625 m³, contra 7.5 m³ exactos: 0.0625 m³ de más (0.83 %). El ' +
      'trapecio sobreestima porque el caudal es convexo. Para llenar un tanque real, la diferencia ' +
      'es despreciable frente a la incertidumbre de la medición.',
    calculo: {
      funcion: '0.5*x^2 + 1',
      a: 0,
      b: 3,
      n: 6,
      valorExacto: 7.5,
      etiqueta: 'Volumen acumulado',
    },
    cuestionario: [
      {
        id: 'q1',
        tipo: 'opcion-multiple',
        enunciado: '¿Qué representa la integral del caudal en el tiempo?',
        opciones: [
          { id: 'a', texto: 'La aceleración del agua.' },
          { id: 'b', texto: 'El volumen total acumulado.' },
          { id: 'c', texto: 'El caudal promedio.' },
          { id: 'd', texto: 'La presión en el fondo.' },
        ],
        correcta: 'b',
        explicacion:
          'Integrar una tasa (m³/h) respecto del tiempo (h) da una cantidad acumulada: m³ de volumen.',
      },
      {
        id: 'q2',
        tipo: 'opcion-multiple',
        enunciado: '¿Por qué 7.5625 m³ queda por encima de los 7.5 m³ exactos?',
        opciones: [
          { id: 'a', texto: 'Porque el caudal es convexo y las rectas del trapecio quedan por encima.' },
          { id: 'b', texto: 'Porque el caudal baja de 5.5 a 1.' },
          { id: 'c', texto: 'Porque n = 6 es impar.' },
          { id: 'd', texto: 'Porque h = 0.5 es el volumen exacto.' },
        ],
        correcta: 'a',
        explicacion:
          'La conclusión lo dice: el caudal es convexo, así que el trapecio sobreestima el volumen acumulado.',
      },
      {
        id: 'q3',
        tipo: 'opcion-multiple',
        enunciado:
          'La formulación supone que entre dos mediciones el caudal varía linealmente. ¿Qué implica esa decisión?',
        opciones: [
          { id: 'a', texto: 'Que se une cada par de nodos con una recta, aunque el caudal real sea curvado.' },
          { id: 'b', texto: 'Que el caudal es constante entre 0 y 3 h.' },
          { id: 'c', texto: 'Que el error es cero con n = 6.' },
          { id: 'd', texto: 'Que no hacen falta los valores de Q evaluada.' },
        ],
        correcta: 'a',
        explicacion:
          'Es la suposición del trapecio: reemplaza la curva por tramos rectos entre mediciones, por eso el resultado depende de n.',
      },
    ],
  },
];
