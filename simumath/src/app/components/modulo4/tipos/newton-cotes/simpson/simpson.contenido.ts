import type {
  EjemploModulo4,
  EjercicioModulo4,
  TeoriaModulo4,
} from '../../../modelos/modulo4.model';

/**
 * CONTENIDO DE SIMPSON 1/3 COMPUESTO: teoría, ejemplos y ejercicios.
 *
 * ── Solo textos y datos ──────────────────────────────────────────────
 * Las tablas, las parábolas y los errores salen de correr
 * `simpson.algoritmo.ts`. Los números de los pasos están verificados
 * contra el algoritmo y contra su spec.
 *
 * ── Fórmulas ─────────────────────────────────────────────────────────
 * Símbolos Unicode y `/` para fracciones; nada de guiones bajos ni de
 * LaTeX en pantalla.
 */

/* ------------------------------------------------------------------ */
/* Teoría                                                              */
/* ------------------------------------------------------------------ */

export const TEORIA_SIMPSON: TeoriaModulo4 = {
  concepto:
    'El trapecio aproxima la curva con rectas y por eso necesita muchos trozos para ser preciso. ' +
    'Simpson da un paso más: toma tres puntos consecutivos y hace pasar por ellos una parábola. El ' +
    'área bajo esa parábola se calcula exactamente y resulta una fórmula muy simple. Encadenando ' +
    'parábolas de dos en dos subintervalos se obtiene una aproximación mucho mejor con el mismo ' +
    'trabajo de tabla.',

  fundamento:
    'Por tres puntos pasa una única parábola. Integrándola entre los extremos sale ' +
    '(h/3)·[f(x₀) + 4f(x₁) + f(x₂)] para un bloque de dos subintervalos. Al unir varios bloques, ' +
    'los nodos impares quedan con coeficiente 4, los pares interiores con 2 y los extremos con 1. ' +
    'Como la parábola reproduce exactamente polinomios de grado ≤ 3, Simpson acierta la integral ' +
    'de cualquier cúbica con cualquier n par, sin necesidad de refinar, algo que el trapecio no ' +
    'logra. Esa es la ' +
    'razón profunda de su orden 4.',

  cuandoFalla:
    'Primero, exige n par: cada parábola cubre dos subintervalos, y con n impar el último queda ' +
    'suelto. Segundo, necesita que f sea suave en [a, b]; una discontinuidad o un pico dentro del ' +
    'intervalo hace que la parábola atraviese el salto y el resultado no converja. Tercero, no ' +
    'sirve para datos tabulados con espaciado irregular: los nodos tienen que estar igualmente ' +
    'separados. Y cuarto, con muy pocos puntos puede dar una falsa sensación de precisión: un n = 2 ' +
    'puede ajustar una parábola que no tiene nada que ver con la función real.',

  precision:
    'El error de Simpson es −(b − a)·h⁴·f⁗(ξ)/180: de orden h⁴. Al duplicar n, el error baja a la ' +
    'dieciseisava parte, mucho más rápido que el trapecio (h²). En la práctica, con la mitad de ' +
    'puntos se obtiene más precisión que con el trapecio. La contracara es que el error depende de ' +
    'la cuarta derivada: si f⁗ es enorme (funciones muy oscilantes), la ventaja se reduce, y si f ' +
    'no es suave, la fórmula del error deja de valer.',

  videoUrl: 'https://www.youtube.com/results?search_query=regla+de+simpson+1/3+compuesta+ejemplo',

  recursos: [
    {
      titulo: 'Regla de Simpson (Wikipedia, español)',
      url: 'https://es.wikipedia.org/wiki/Regla_de_Simpson',
      tipo: 'lectura',
      descripcion: 'La deducción por parábolas, la versión compuesta y el término de error.',
    },
    {
      titulo: 'Integración numérica (Wikipedia, español)',
      url: 'https://es.wikipedia.org/wiki/Integraci%C3%B3n_num%C3%A9rica',
      tipo: 'lectura',
      descripcion: 'Comparación entre trapecio, Simpson y cuadratura gaussiana.',
    },
    {
      titulo: 'Simpson’s Rule (MathWorld)',
      url: 'https://mathworld.wolfram.com/SimpsonsRule.html',
      tipo: 'lectura',
      descripcion: 'La fórmula, los coeficientes y la relación con la regla de los tres octavos.',
    },
    {
      titulo: 'Calculus Grapher (PhET, simulación)',
      url: 'https://phet.colorado.edu/es/simulations/calculus-grapher',
      tipo: 'interactivo',
      descripcion: 'Compará visualmente el área real con las aproximaciones por trozos.',
    },
    {
      titulo: 'Videos de repaso: Simpson 1/3',
      url: 'https://www.youtube.com/results?search_query=regla+de+simpson+1/3+compuesta+ejercicios+resueltos',
      tipo: 'video',
      descripcion: 'Ejemplos con la tabla 1-4-2-4-1 y comparación contra el valor exacto.',
    },
  ],

  algoritmo: {
    formula:
      'I ≈ (h/3) · [ f(x₀) + 4f(x₁) + 2f(x₂) + 4f(x₃) + … + f(xₙ) ]      h = (b − a)/n,  n par',
    formulaTex:
      'I \\approx \\frac{h}{3}\\left[f(x_0)+4f(x_1)+2f(x_2)+4f(x_3)+\\cdots+f(x_n)\\right], \\quad h=\\frac{b-a}{n},\\ n\\text{ par}',
    criterios: [
      {
        nombre: 'n par obligatorio',
        explicacion:
          'Cada parábola cubre dos subintervalos. Con n impar, el último trozo queda sin pareja y la fórmula no aplica.',
      },
      {
        nombre: 'Coeficientes 1, 4, 2, 4, …',
        explicacion:
          'Extremos 1, nodos impares 4, nodos pares interiores 2. Es la firma de Simpson y hay que verificarla en la tabla.',
      },
      {
        nombre: 'Error de orden h⁴',
        explicacion:
          'Al duplicar n, el error baja a la dieciseisava parte. Es la comprobación práctica de que el resultado es confiable.',
      },
      {
        nombre: 'Valor exacto (opcional)',
        explicacion:
          'Si se conoce, el error real es |I aproximada − I exacta|. Si no, se compara con n duplicado.',
      },
    ],
    pasos: [
      'Identificar f(x), el intervalo [a, b] y elegir un n PAR de subintervalos.',
      'Calcular h = (b − a)/n y los nodos xᵢ = a + i·h, para i = 0, 1, …, n.',
      'Evaluar f en cada nodo y asignar coeficientes: 1 en los extremos, 4 en los impares, 2 en los pares interiores.',
      'Sumar los aportes coeficiente · f(xᵢ).',
      'Multiplicar por h/3: ese es el valor aproximado de la integral.',
      'Si se conoce el valor exacto, medir el error; si no, repetir con n duplicado y comparar.',
    ],
    ventajas: [
      'Con la misma cantidad de nodos que el trapecio, da mucha más precisión (orden h⁴ contra h²).',
      'Es exacta para polinomios de grado ≤ 3.',
      'La tabla es igual de simple que la del trapecio: solo cambian los coeficientes.',
      'El error se estima sin derivadas, comparando dos valores de n.',
    ],
    limitaciones: [
      'Exige n par; con n impar hay que cambiar de método o de n.',
      'Requiere nodos igualmente espaciados (no sirve para tablas irregulares).',
      'Si la función tiene una discontinuidad o un pico, la parábola lo atraviesa y el error no baja.',
      'El orden 4 depende de que f tenga cuarta derivada razonable: con funciones muy oscilantes hay que refinar igual.',
    ],
    recomendaciones: [
      'Verificá siempre que n sea par antes de calcular.',
      'Compará con el trapecio en el mismo n: la diferencia muestra el valor de usar parábolas.',
      'Duplicá n y comprobá que el error baja cerca de 16 veces; si no, sospechá de una discontinuidad.',
      'Para datos tabulados con espaciado irregular, no uses Simpson: interpolá o usá trapecio.',
    ],
  },

  /* ---------------------------------------------------------------- */
  /* Ejemplo numérico                                                 */
  /* ---------------------------------------------------------------- */
  ejemploNormal: {
    id: 'si-num-1',
    titulo: 'Integral de x² en [0, 1] con Simpson y cuatro subintervalos',
    tipo: 'numerico',
    planteamiento:
      'Aproximar ∫₀¹ x² dx con Simpson 1/3 compuesto usando n = 4, y comprobar que el resultado es ' +
      'exacto.',
    parametros: [
      { etiqueta: 'f(x)', valor: 'x²' },
      { etiqueta: 'Intervalo', valor: '[0, 1]' },
      { etiqueta: 'n', valor: '4 (par)' },
      { etiqueta: 'Valor exacto', valor: '1/3 = 0.333333' },
    ],
    formula: '∫₀¹ x² dx ≈ (0.25/3) · [0 + 4(0.0625) + 2(0.25) + 4(0.5625) + 1]',
    formulaTex:
      '\\int_0^1 x^2\\,dx \\approx \\frac{0.25}{3}\\left[0+4(0.0625)+2(0.25)+4(0.5625)+1\\right]',
    interpretacion:
      'x² es una parábola, así que Simpson la reproduce exactamente: el resultado tiene que dar 1/3 ' +
      'sin error. Es la mejor forma de ver por qué el método es exacto para polinomios de grado ≤ 3.',
    pasos: [
      'h = (1 − 0)/4 = 0.25. Nodos: 0; 0.25; 0.5; 0.75; 1.',
      'f evaluada: 0; 0.0625; 0.25; 0.5625; 1.',
      'Coeficientes 1-4-2-4-1: suma = 0 + 0.25 + 0.5 + 2.25 + 1 = 4.',
      'Integral: I ≈ (0.25/3)·4 = 1/3 = 0.333333. Error: 0.',
    ],
    algoritmo:
      'Se aplican los coeficientes 1-4-2-4-1 a los cinco nodos y se multiplica la suma por h/3.',
    criterio:
      'El error es exactamente cero porque la función es un polinomio de grado 2 y Simpson es ' +
      'exacta hasta grado 3. Si se cambiara por x⁴, ya no sería exacta y habría que aumentar n.',
    conclusion:
      'La integral aproximada es 0.333333, idéntica al valor exacto 1/3. El método no tuvo error ' +
      'porque la parábola que ajusta cada bloque coincide con la función. Esto no pasa con ' +
      'cualquier función: es una propiedad de los polinomios de grado ≤ 3.',
    calculo: { funcion: 'x^2', a: 0, b: 1, n: 4, valorExacto: 1 / 3, etiqueta: 'x² en [0, 1]' },
  },

  /* ---------------------------------------------------------------- */
  /* Ejemplo de casuística: área bajo un seno                        */
  /* ---------------------------------------------------------------- */
  ejemploCasuistica: {
    id: 'si-cas-1',
    titulo: 'Área bajo un arco de seno',
    tipo: 'casuistica',
    enunciado:
      'La forma de un techo paraboloide se modela con y = sin(x) entre 0 y π. El área del perfil es ' +
      'A = ∫ de 0 a π sin(x) dx, que vale exactamente 2. Calcularla con Simpson y n = 6 para verificar el ' +
      'diseño.',
    extraccion: {
      busqueda: 'Se busca el área bajo el perfil del techo, integrando la altura y(x).',
      datos: [
        { simbolo: 'y', valor: 'sin(x)', queEs: 'Altura del perfil en cada punto del ancho.' },
        { simbolo: 'x', valor: 'de 0 a π', queEs: 'Ancho del techo, en radianes.' },
        { simbolo: 'A', valor: '∫ de 0 a π sin(x) dx', queEs: 'Área del perfil, en unidades cuadradas.' },
      ],
      formulacion:
        'El área es la integral de la altura. Como el seno es suave, Simpson con pocos bloques ya ' +
        'da una aproximación excelente: es el caso típico de aplicación en diseño.',
    },
    planteamiento: 'Aproximar A = ∫ de 0 a π sin(x) dx con Simpson y n = 6, y comparar con 2.',
    parametros: [
      { etiqueta: 'f(x)', valor: 'sin(x)' },
      { etiqueta: 'Intervalo', valor: '[0, π]' },
      { etiqueta: 'n', valor: '6 (par)' },
      { etiqueta: 'Valor exacto', valor: '2' },
    ],
    formula: 'A ≈ (π/18) · [0 + 4(0.5) + 2(0.8660254) + 4(1) + 2(0.8660254) + 4(0.5) + 0]',
    formulaTex:
      'A \\approx \\frac{\\pi}{18}\\left[0+4(0.5)+2(0.8660254)+4(1)+2(0.8660254)+4(0.5)+0\\right]',
    interpretacion:
      'Con solo seis subintervalos, tres parábolas cubren todo el arco. El resultado va a quedar muy ' +
      'cerca de 2: el error de Simpson baja como h⁴, y h = π/6 ≈ 0.52 no es tan chico.',
    pasos: [
      'h = π/6 ≈ 0.5235988. Nodos: 0; π/6; π/3; π/2; 2π/3; 5π/6; π.',
      'f evaluada: 0; 0.5; 0.8660254; 1; 0.8660254; 0.5; 0.',
      'Coeficientes 1-4-2-4-2-4-1: suma = 0 + 2 + 1.7320508 + 4 + 1.7320508 + 2 + 0 = 11.4641016.',
      'Área: A ≈ (0.5235988/3)·11.4641016 = 2.0008632. Error: 0.0008632 (0.043 %).',
    ],
    algoritmo:
      'Se evalúa el seno en los siete nodos, se aplican los coeficientes 1-4-2-4-2-4-1 y se ' +
      'multiplica por h/3.',
    criterio:
      'El exacto es 2. Simpson da 2.0008632: un 0.043 % alto. Con n = 4, en cambio, el error es ' +
      '0.228 %: al pasar de 4 a 6 nodos ya mejora unas cinco veces.',
    conclusion:
      'El área calculada es 2.0008632, contra 2 exacta: un error de 0.0008632 (0.043 %). Para un ' +
      'cálculo de diseño es más que suficiente, y con n = 12 el error bajaría a la dieciseisava ' +
      'parte (0.0027 %).',
    calculo: {
      funcion: 'sin(x)',
      a: 0,
      b: Math.PI,
      n: 6,
      valorExacto: 2,
      etiqueta: 'Área bajo sin(x) en [0, π]',
    },
  },
};

/* ------------------------------------------------------------------ */
/* Ejemplos resueltos (2 numéricos + 2 casuísticas)                    */
/* ------------------------------------------------------------------ */

export const EJEMPLOS_SIMPSON: EjemploModulo4[] = [
  {
    id: 'si-num-2',
    titulo: 'Integral de 1/x en [1, 2] con Simpson',
    tipo: 'numerico',
    planteamiento: 'Aproximar ∫₁² (1/x) dx con n = 4 y comparar con ln(2) = 0.6931472.',
    parametros: [
      { etiqueta: 'f(x)', valor: '1/x' },
      { etiqueta: 'Intervalo', valor: '[1, 2]' },
      { etiqueta: 'n', valor: '4 (par)' },
      { etiqueta: 'Valor exacto', valor: 'ln 2 = 0.6931472' },
    ],
    formula: '∫₁² (1/x) dx ≈ (0.25/3) · [1 + 4(0.8) + 2(0.6666667) + 4(0.5714286) + 0.5]',
    formulaTex:
      '\\int_1^2 \\frac{1}{x}\\,dx \\approx \\frac{0.25}{3}\\left[1+4(0.8)+2(0.6666667)+4(0.5714286)+0.5\\right]',
    interpretacion:
      'Es el mismo ejemplo que en el trapecio, con el mismo n. Comparar los dos resultados deja ver ' +
      'la diferencia de orden: trapecio 0.6970238, Simpson 0.6932540, exacto 0.6931472.',
    pasos: [
      'h = 0.25. Nodos: 1; 1.25; 1.5; 1.75; 2.',
      'f evaluada: 1; 0.8; 0.6666667; 0.5714286; 0.5.',
      'Suma con coeficientes 1-4-2-4-1: 1 + 3.2 + 1.3333333 + 2.2857143 + 0.5 = 8.3190476.',
      'I ≈ (0.25/3)·8.3190476 = 0.6932540. Error: 0.0001068 (0.015 %).',
    ],
    algoritmo: 'Coeficientes 1-4-2-4-1 sobre cuatro subintervalos.',
    criterio:
      'ln(2) = 0.6931472. Simpson da 0.6932540: 0.015 % alto, unas 36 veces mejor que el trapecio ' +
      'con el mismo n (0.56 %).',
    conclusion:
      'La integral aproximada es 0.6932540, con un error absoluto de 0.0001068. Frente al trapecio, ' +
      'que necesitaba duplicar varias veces n para acercarse, Simpson llega con cuatro trozos al ' +
      'mismo orden de precisión.',
    calculo: { funcion: '1/x', a: 1, b: 2, n: 4, valorExacto: Math.LN2, etiqueta: '1/x en [1, 2]' },
  },
  {
    id: 'si-cas-2',
    titulo: 'Volumen de un tanque de perfil cúbico',
    tipo: 'casuistica',
    enunciado:
      'Un tanque tiene sección transversal A(h) = h³ + 1 m² a la altura h, entre 0 y 2 m. El volumen ' +
      'total es V = ∫₀² (h³ + 1) dh, que vale exactamente 6 m³. Verificar el cálculo con Simpson y ' +
      'n = 4.',
    extraccion: {
      busqueda: 'Se busca el volumen acumulado integrando el área de la sección transversal.',
      datos: [
        { simbolo: 'A(h)', valor: 'h³ + 1 m²', queEs: 'Área de la sección a cada altura.' },
        { simbolo: 'h', valor: 'de 0 a 2 m', queEs: 'Altura del tanque.' },
        { simbolo: 'V', valor: '∫₀² A(h) dh', queEs: 'Volumen total, en m³.' },
      ],
      formulacion:
        'El volumen es la integral del área por la altura. Como A es un polinomio de grado 3, ' +
        'Simpson debe dar el valor exacto: es la prueba de que reproduce cúbicas.',
    },
    planteamiento: 'Aproximar V = ∫₀² (h³ + 1) dh con Simpson y n = 4, y comparar con 6 m³.',
    parametros: [
      { etiqueta: 'A(h)', valor: 'h³ + 1' },
      { etiqueta: 'Intervalo', valor: '[0, 2] m' },
      { etiqueta: 'n', valor: '4 (par)' },
      { etiqueta: 'Valor exacto', valor: '6 m³' },
    ],
    formula: 'V ≈ (0.5/3) · [1 + 4(1.125) + 2(2) + 4(4.375) + 9]',
    formulaTex:
      'V \\approx \\frac{0.5}{3}\\left[1+4(1.125)+2(2)+4(4.375)+9\\right]',
    interpretacion:
      'El área de la sección crece muy rápido con la altura. El trapecio se quedaría corto, pero ' +
      'Simpson ajusta parábolas y reproduce exactamente el polinomio cúbico.',
    pasos: [
      'h = (2 − 0)/4 = 0.5. Nodos: 0; 0.5; 1; 1.5; 2.',
      'A evaluada: 1; 1.125; 2; 4.375; 9.',
      'Suma con coeficientes 1-4-2-4-1: 1 + 4.5 + 4 + 17.5 + 9 = 36.',
      'V ≈ (0.5/3)·36 = 6 m³ exactos. Error: 0.',
    ],
    algoritmo: 'Cuatro subintervalos y dos parábolas cubren todo el perfil.',
    criterio:
      'El exacto es 6 y Simpson da 6: error cero, porque el integrando es de grado 3. Con el ' +
      'trapecio, en cambio, el resultado sería 6.25, un 4.17 % alto.',
    conclusion:
      'El volumen calculado es 6 m³, exactamente el valor analítico. Este ejemplo muestra la ventaja ' +
      'decisiva de Simpson: para perfiles polinómicos de hasta grado 3 no hay error de truncamiento, ' +
      'por más grande que sea el intervalo.',
    calculo: {
      funcion: 'x^3 + 1',
      a: 0,
      b: 2,
      n: 4,
      valorExacto: 6,
      etiqueta: 'Volumen de perfil cúbico',
    },
  },
];

/* ------------------------------------------------------------------ */
/* Autoevaluación (2 numéricos + 2 casuísticas)                        */
/* ------------------------------------------------------------------ */

export const EJERCICIOS_SIMPSON: EjercicioModulo4[] = [
  {
    id: 'si-ej-num-1',
    titulo: 'Ejercicio 1 · Exponencial en [0, 1]',
    tipo: 'numerico',
    planteamiento: 'Aproximar ∫₀¹ eˣ dx con Simpson y n = 4, y comparar con e − 1 = 1.7182818.',
    parametros: [
      { etiqueta: 'f(x)', valor: 'eˣ (escribila como exp(x))' },
      { etiqueta: 'Intervalo', valor: '[0, 1]' },
      { etiqueta: 'n', valor: '4 (par)' },
      { etiqueta: 'Valor exacto', valor: 'e − 1 = 1.7182818' },
    ],
    pista: 'Coeficientes 1-4-2-4-1. El error debe ser del orden de 10⁻⁵, no de 10⁻³.',
    interpretacion:
      'La exponencial es suave y muy bien comportada: es el caso donde Simpson luce su orden 4.',
    pasos: [
      'h = 0.25. f evaluada: 1; 1.2840254; 1.6487213; 2.1170000; 2.7182818.',
      'Suma: 1 + 5.1361017 + 3.2974425 + 8.4680001 + 2.7182818 = 20.6198261.',
      'I ≈ (0.25/3)·20.6198261 = 1.7183188.',
      'Error absoluto: 0.0000371; error relativo: 0.0022 %.',
    ],
    algoritmo: 'Dos parábolas (n = 4) con coeficientes 1-4-2-4-1.',
    criterio:
      'El error es 0.0000371, unas 240 veces menor que el del trapecio con el mismo n (0.0089401).',
    conclusion:
      'La integral es 1.7183188, frente a 1.7182818 exacta: 0.0022 % de error. Con tan pocos ' +
      'puntos, el resultado ya es de cuatro cifras significativas.',
    calculo: { funcion: 'exp(x)', a: 0, b: 1, n: 4, valorExacto: Math.E - 1 },
    cuestionario: [
      {
        id: 'q1',
        tipo: 'opcion-multiple',
        enunciado: '¿Qué ventaja tiene Simpson frente al trapecio con el mismo n?',
        opciones: [
          { id: 'a', texto: 'Usa menos evaluaciones de f.' },
          { id: 'b', texto: 'El error baja como h⁴ en vez de h².' },
          { id: 'c', texto: 'No necesita que f sea continua.' },
          { id: 'd', texto: 'Funciona con n impar.' },
        ],
        correcta: 'b',
        explicacion:
          'Ambos usan los mismos n + 1 nodos. La diferencia es el orden: Simpson ajusta parábolas y su error es proporcional a h⁴.',
      },
      {
        id: 'q2',
        tipo: 'opcion-multiple',
        enunciado: '¿De dónde sale el factor 0.25/3 en I ≈ (0.25/3)·20.6198261?',
        opciones: [
          { id: 'a', texto: 'De h/3 con h = 0.25.' },
          { id: 'b', texto: 'De h/2 con h = 0.25.' },
          { id: 'c', texto: 'De dividir la suma entre n = 4.' },
          { id: 'd', texto: 'De multiplicar 20.6198261 por 0.25.' },
        ],
        correcta: 'a',
        explicacion: 'Simpson compuesto multiplica la suma ponderada por h/3; con h = 0.25 da 0.25/3.',
      },
      {
        id: 'q3',
        tipo: 'verdadero-falso',
        enunciado:
          'Con los coeficientes 1-4-2-4-1, el valor central 1.6487213 entra multiplicado por 2.',
        opciones: [
          { id: 'v', texto: 'Verdadero' },
          { id: 'f', texto: 'Falso' },
        ],
        correcta: 'v',
        explicacion:
          'El patrón 1-4-2-4-1 pone 2 en el nodo central; 1.2840254 y 2.1170000 entran con 4.',
      },
    ],
  },
  {
    id: 'si-ej-num-2',
    titulo: 'Ejercicio 2 · Logaritmo con seis subintervalos',
    tipo: 'numerico',
    planteamiento: 'Aproximar ∫₁² (1/x) dx con Simpson y n = 6, y comparar con ln(2) = 0.6931472.',
    parametros: [
      { etiqueta: 'f(x)', valor: '1/x' },
      { etiqueta: 'Intervalo', valor: '[1, 2]' },
      { etiqueta: 'n', valor: '6 (par)' },
      { etiqueta: 'Valor exacto', valor: '0.6931472' },
    ],
    pista: 'Con n = 6 hay tres parábolas y los coeficientes son 1-4-2-4-2-4-1.',
    interpretacion:
      'La función decrece con curvatura. Simpson ya dio 0.015 % de error con n = 4; ahora debería ' +
      'mejorar todavía más.',
    pasos: [
      'h = 1/6. Nodos: 1; 1.1666667; 1.3333333; 1.5; 1.6666667; 1.8333333; 2.',
      'f evaluada: 1; 0.8571429; 0.75; 0.6666667; 0.6; 0.5454545; 0.5.',
      'Suma 1-4-2-4-2-4-1: 1 + 3.4285714 + 1.5 + 2.6666667 + 1.2 + 2.1818182 + 0.5 = 12.4770563.',
      'I ≈ (1/18)·12.4770563 = 0.6931698. Error: 0.0000226 (0.0033 %).',
    ],
    algoritmo: 'Tres parábolas, coeficientes 1-4-2-4-2-4-1.',
    criterio:
      'Error 0.0000226, casi cinco veces menor que con n = 4 (0.0001068), consistente con el orden ' +
      'h⁴ al pasar de 4 a 6.',
    conclusion:
      'El resultado es 0.6931698, con 0.0033 % de error. Para obtener algo parecido con el trapecio ' +
      'haría falta un n mucho mayor: esa es la diferencia práctica entre orden 2 y orden 4.',
    calculo: { funcion: '1/x', a: 1, b: 2, n: 6, valorExacto: Math.LN2 },
    cuestionario: [
      {
        id: 'q1',
        tipo: 'verdadero-falso',
        enunciado: 'Simpson también daría ln(2) exacto si 1/x fuera un polinomio de grado 2.',
        opciones: [
          { id: 'v', texto: 'Verdadero' },
          { id: 'f', texto: 'Falso' },
        ],
        correcta: 'v',
        explicacion:
          'Simpson es exacta para todo polinomio de grado ≤ 3. Si el integrando fuera cuadrático, el resultado sería exacto con cualquier n par.',
      },
      {
        id: 'q2',
        tipo: 'opcion-multiple',
        enunciado: 'Los pasos evalúan f en 1; 1.1666667; …; 2. ¿Por qué se incluyen los extremos?',
        opciones: [
          { id: 'a', texto: 'Porque la suma ponderada usa los extremos y los nodos interiores.' },
          { id: 'b', texto: 'Porque el valor exacto 0.6931472 es uno de los nodos.' },
          { id: 'c', texto: 'Porque h = 1/6 solo se aplica a los extremos.' },
          { id: 'd', texto: 'Porque Simpson promedia extremos en vez de integrar.' },
        ],
        correcta: 'a',
        explicacion:
          'Los coeficientes 1-4-2-4-2-4-1 empiezan y terminan en 1: los extremos 1 y 2 también entran en la suma.',
      },
      {
        id: 'q3',
        tipo: 'opcion-multiple',
        enunciado:
          'El error pasó de 0.0001068 (n = 4) a 0.0000226 (n = 6). ¿Cómo se explica esa caída?',
        opciones: [
          { id: 'a', texto: 'Por el orden h⁴: al pasar de 4 a 6 el error baja más de lo proporcional.' },
          { id: 'b', texto: 'Porque 1/x se volvió un polinomio.' },
          { id: 'c', texto: 'Porque el valor exacto cambió.' },
          { id: 'd', texto: 'Porque con n = 6 Simpson no tiene error.' },
        ],
        correcta: 'a',
        explicacion:
          'El criterio lo dice: es consistente con el orden h⁴ al pasar de 4 a 6.',
      },
    ],
  },
  {
    id: 'si-ej-cas-1',
    titulo: 'Ejercicio 3 · Área de un arco de seno con cuatro trozos',
    tipo: 'numerico',
    planteamiento: 'Aproximar ∫ de 0 a π sin(x) dx con Simpson y n = 4, y comparar con 2.',
    parametros: [
      { etiqueta: 'f(x)', valor: 'sin(x)' },
      { etiqueta: 'Intervalo', valor: '[0, π]' },
      { etiqueta: 'n', valor: '4 (par)' },
      { etiqueta: 'Valor exacto', valor: '2' },
    ],
    pista: 'h = π/4. Con solo dos parábolas, el resultado debe quedar a menos de 0.5 %.',
    interpretacion:
      'El seno es suave pero muy curvado. Comparar con el trapecio (que con n = 4 da 5.19 % de ' +
      'error) muestra el efecto de ajustar parábolas.',
    pasos: [
      'h = π/4 ≈ 0.7853982. Nodos: 0; π/4; π/2; 3π/4; π.',
      'f evaluada: 0; 0.7071068; 1; 0.7071068; 0.',
      'Suma 1-4-2-4-1: 0 + 2.8284271 + 2 + 2.8284271 + 0 = 7.6568542.',
      'I ≈ (π/12)·7.6568542 = 2.0045598. Error: 0.0045598 (0.228 %).',
    ],
    algoritmo: 'Dos parábolas sobre [0, π/2] y [π/2, π].',
    criterio:
      'El error es 0.228 %, unas 23 veces menor que el del trapecio con el mismo n (5.19 %).',
    conclusion:
      'El área aproximada es 2.0045598, frente a 2 exacta: 0.228 % de error. Con n = 4 el trapecio ' +
      'daba 1.8961; la parábola corrige casi todo el defecto de la recta.',
    calculo: { funcion: 'sin(x)', a: 0, b: Math.PI, n: 4, valorExacto: 2 },
    cuestionario: [
      {
        id: 'q1',
        tipo: 'opcion-multiple',
        enunciado: '¿Cuántas parábolas distintos usa Simpson con n = 4?',
        opciones: [
          { id: 'a', texto: 'Una.' },
          { id: 'b', texto: 'Dos: cada una cubre dos subintervalos.' },
          { id: 'c', texto: 'Cuatro: una por subintervalo.' },
          { id: 'd', texto: 'Ninguna: usa rectas.' },
        ],
        correcta: 'b',
        explicacion:
          'Cada parábola pasa por tres nodos consecutivos, es decir, cubre dos subintervalos. Con n = 4 hay dos parábolas.',
      },
      {
        id: 'q2',
        tipo: 'opcion-multiple',
        enunciado: 'En la suma 0 + 2.8284271 + 2 + 2.8284271 + 0, ¿de dónde sale 2.8284271?',
        opciones: [
          { id: 'a', texto: 'De 4·0.7071068, el nodo π/4 con coeficiente 4.' },
          { id: 'b', texto: 'De 2·0.7071068, el nodo π/4 con coeficiente 2.' },
          { id: 'c', texto: 'De sumar los extremos 0 y π.' },
          { id: 'd', texto: 'De multiplicar h = π/4 por el valor exacto 2.' },
        ],
        correcta: 'a',
        explicacion:
          'El patrón 1-4-2-4-1 da coeficiente 4 a los nodos π/4 y 3π/4, donde f vale 0.7071068.',
      },
      {
        id: 'q3',
        tipo: 'verdadero-falso',
        enunciado:
          'Con n = 4 el error de Simpson es 0.228 %, unas 23 veces menor que el 5.19 % del trapecio.',
        opciones: [
          { id: 'v', texto: 'Verdadero' },
          { id: 'f', texto: 'Falso' },
        ],
        correcta: 'v',
        explicacion:
          'El criterio lo afirma: con los mismos nodos, la parábola corrige casi todo el defecto de la recta.',
      },
    ],
  },
  {
    id: 'si-ej-cas-2',
    titulo: 'Ejercicio 4 · Volumen de un tanque con perfil cúbico',
    tipo: 'casuistica',
    enunciado:
      'La sección de un tanque es A(h) = 0.5h³ + 2 m² a la altura h, de 0 a 2 m. El volumen es ' +
      'V = ∫₀² (0.5h³ + 2) dh. Estimarlo con Simpson y n = 6, sabiendo que el valor exacto es 6 m³.',
    extraccion: {
      busqueda: 'Se busca el volumen total integrando el área de la sección transversal.',
      datos: [
        { simbolo: 'A(h)', valor: '0.5h³ + 2 m²', queEs: 'Área de la sección a cada altura.' },
        { simbolo: 'h', valor: 'de 0 a 2 m', queEs: 'Altura del tanque.' },
        { simbolo: 'V', valor: '∫₀² A(h) dh', queEs: 'Volumen total, en m³.' },
      ],
      formulacion:
        'El volumen es la integral del área. El integrando es un polinomio cúbico, así que Simpson ' +
        'debería dar el valor exacto.',
    },
    planteamiento: 'Aproximar V = ∫₀² (0.5h³ + 2) dh con Simpson y n = 6, y comparar con 6 m³.',
    parametros: [
      { etiqueta: 'A(h)', valor: '0.5h³ + 2' },
      { etiqueta: 'Intervalo', valor: '[0, 2] m' },
      { etiqueta: 'n', valor: '6 (par)' },
      { etiqueta: 'Valor exacto', valor: '6 m³' },
    ],
    pista: 'Es un polinomio de grado 3: Simpson lo integra sin error, incluso con n = 4.',
    interpretacion:
      'El área crece con el cubo de la altura. La parábola de Simpson reproduce exactamente ese ' +
      'crecimiento en cada bloque.',
    pasos: [
      'h = 2/6 = 1/3 ≈ 0.3333333. Nodos: 0; 1/3; 2/3; 1; 4/3; 5/3; 2.',
      'A evaluada: 2; 2.0185185; 2.1481481; 2.5; 3.1851852; 4.3148148; 6.',
      'Suma 1-4-2-4-2-4-1: 2 + 8.0740741 + 4.2962963 + 10 + 6.3703704 + 17.2592593 + 6 = 54.',
      'V ≈ (1/9)·54 = 6 m³ exactos. Error: 0.',
    ],
    algoritmo: 'Tres parábolas sobre el perfil; coeficientes 1-4-2-4-2-4-1.',
    criterio:
      'El resultado es exactamente 6 porque el integrando es cúbico. Es la comprobación práctica de ' +
      'que Simpson es exacta hasta grado 3.',
    conclusion:
      'El volumen es 6 m³, sin error de truncamiento. Para perfiles polinómicos de grado ≤ 3 no hace ' +
      'falta refinar n: el método acierta con cualquier n par. Para perfiles reales, en cambio, ' +
      'conviene duplicar n y verificar.',
    calculo: {
      funcion: '0.5*x^3 + 2',
      a: 0,
      b: 2,
      n: 6,
      valorExacto: 6,
      etiqueta: 'Volumen de tanque cúbico',
    },
    cuestionario: [
      {
        id: 'q1',
        tipo: 'opcion-multiple',
        enunciado: '¿Por qué el resultado es exacto?',
        opciones: [
          { id: 'a', texto: 'Porque n = 6 es grande.' },
          { id: 'b', texto: 'Porque el integrando es un polinomio de grado ≤ 3.' },
          { id: 'c', texto: 'Porque el volumen siempre es exacto.' },
          { id: 'd', texto: 'Porque h es pequeño.' },
        ],
        correcta: 'b',
        explicacion:
          'Simpson integra exactamente polinomios hasta grado 3, sin importar el tamaño de h.',
      },
      {
        id: 'q2',
        tipo: 'opcion-multiple',
        enunciado: 'Según los datos del problema, ¿qué se integra para obtener el volumen del tanque?',
        opciones: [
          { id: 'a', texto: 'El área de la sección A(h) a lo largo de la altura, entre 0 y 2 m.' },
          { id: 'b', texto: 'La altura h respecto del área de la sección.' },
          { id: 'c', texto: 'El caudal de entrada en el tiempo.' },
          { id: 'd', texto: 'La derivada del área respecto de la altura.' },
        ],
        correcta: 'a',
        explicacion:
          'Los datos muestran A(h) en m² integrada entre 0 y 2 m: el resultado es un volumen en m³.',
      },
      {
        id: 'q3',
        tipo: 'opcion-multiple',
        enunciado: 'La pista dice que funciona incluso con n = 4, pero el ejercicio usa n = 6. ¿Por qué sirven ambos?',
        opciones: [
          { id: 'a', texto: 'Porque ambos son pares y el integrando es de grado 3.' },
          { id: 'b', texto: 'Porque 4 y 6 son múltiplos de 3.' },
          { id: 'c', texto: 'Porque el volumen exacto es 6 m³.' },
          { id: 'd', texto: 'Porque con n = 4 el error es 0, pero con n = 6 no.' },
        ],
        correcta: 'a',
        explicacion:
          'La conclusión dice que el método acierta con cualquier n par y que no hace falta refinar un polinomio de grado ≤ 3.',
      },
    ],
  },
];
