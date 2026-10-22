import type {
  EjemploModulo3,
  EjercicioModulo3,
  TeoriaModulo3,
} from '../../../modelos/modulo3.model';

/**
 * CONTENIDO DE MÍNIMOS CUADRADOS: teoría, ejemplos y ejercicios.
 *
 * Igual que en Lagrange: acá solo hay TEXTOS Y DATOS. Las tablas y los
 * gráficos se calculan corriendo `minimos-cuadrados.algoritmo.ts` con
 * los puntos de cada ejemplo.
 *
 * La teoría es corta y apoyada en enlaces: la idea, las fórmulas y los
 * criterios de bondad acá; el desarrollo completo, en los recursos.
 */

/* ------------------------------------------------------------------ */
/* Teoría                                                              */
/* ------------------------------------------------------------------ */

export const TEORIA_MINIMOS_CUADRADOS: TeoriaModulo3 = {
  concepto:
    'Cuando los datos vienen de una medición, cada punto trae error. Obligar a una curva a pasar ' +
    'por todos (como hace la interpolación) es copiar el error del instrumento. Mínimos cuadrados ' +
    'hace lo contrario: elige la recta que pasa lo más cerca posible de todos los puntos, ' +
    'minimizando la suma de los residuos al cuadrado.',

  fundamento:
    'Se define el error total como S(a₀, a₁) = Σ(yᵢ − a₀ − a₁xᵢ)², que es una función de los dos ' +
    'coeficientes que queremos elegir. S es una parábola en (a₀, a₁) que abre hacia arriba, así que ' +
    'tiene un único mínimo. Igualar sus derivadas parciales a cero da las dos ECUACIONES NORMALES, ' +
    'y despejar de ahí produce las fórmulas cerradas de a₀ y a₁. El cuadrado es lo que hace que los ' +
    'errores por encima y por debajo no se cancelen, y lo que da más peso a los apartamientos grandes.',

  cuandoFalla:
    'Falla cuando la relación entre x e y no es lineal: una recta no puede representar una curva, ' +
    'por más que el programa la dibuje. Un solo dato atípico (outlier) mueve la recta entera, porque ' +
    'los residuos entran al cuadrado. También engaña al extrapolar lejos del rango medido, y hay que ' +
    'recordar que una correlación alta NO demuestra causalidad: r mide asociación lineal, no causa.',

  precision:
    'Tres números dicen qué tan bueno es el ajuste: r (correlación, entre −1 y 1) indica dirección e ' +
    'intensidad; r² (coeficiente de determinación) es la fracción de la variación de y que el modelo ' +
    'explica (0.95 = 95 %); y el error estándar de la estimación Sᵧ/ₓ = √(Σrᵢ²/(n−2)) da el error típico ' +
    'en las MISMAS unidades de y, que es lo más fácil de interpretar. Además hay que mirar los residuos: ' +
    'si tienen patrón (curva, embudo), el modelo lineal no corresponde aunque r² sea alto.',

  videoUrl: 'https://www.youtube.com/watch?v=S0J8yZ9-Ydg',

  recursos: [
    {
      titulo: 'Mínimos cuadrados (Wikipedia, español)',
      url: 'https://es.wikipedia.org/wiki/M%C3%ADnimos_cuadrados',
      tipo: 'lectura',
      descripcion: 'El método general, las ecuaciones normales y la deducción del mínimo.',
    },
    {
      titulo: 'Regresión lineal (Wikipedia, español)',
      url: 'https://es.wikipedia.org/wiki/Regresi%C3%B3n_lineal',
      tipo: 'lectura',
      descripcion: 'El modelo, los supuestos, los coeficientes y su interpretación estadística.',
    },
    {
      titulo: 'Least squares fitting (MathWorld)',
      url: 'https://mathworld.wolfram.com/LeastSquaresFitting.html',
      tipo: 'lectura',
      descripcion: 'Las fórmulas compactas y la relación con el ajuste polinómico.',
    },
    {
      titulo: 'Coeficiente de determinación (Wikipedia, inglés)',
      url: 'https://en.wikipedia.org/wiki/Coefficient_of_determination',
      tipo: 'lectura',
      descripcion: 'Qué es realmente r² y por qué no siempre basta para validar un modelo.',
    },
    {
      titulo: 'Least-Squares Regression (PhET, simulación)',
      url: 'https://phet.colorado.edu/es/simulations/least-squares-regression',
      tipo: 'interactivo',
      descripcion: 'Arrastrá puntos y mirá en vivo cómo se mueve la recta y cambia r².',
    },
    {
      titulo: 'Videos de repaso: regresión por mínimos cuadrados',
      url: 'https://www.youtube.com/results?search_query=regresion+lineal+minimos+cuadrados',
      tipo: 'video',
      descripcion: 'Ejemplos con tablas de sumatorias, para practicar el cálculo a mano.',
    },
  ],

  algoritmo: {
    formula:
      'a₁ = (n·Σxᵢyᵢ − Σxᵢ·Σyᵢ) / (n·Σxᵢ² − (Σxᵢ)²)      a₀ = ȳ − a₁·x̄',
    criterios: [
      {
        nombre: 'Coeficiente r',
        explicacion:
          'Entre −1 y 1. El signo dice si y sube o baja con x; el valor absoluto, qué tan cerca de una recta están los puntos.',
      },
      {
        nombre: 'Coeficiente de determinación r²',
        explicacion:
          'Fracción de la variación de y explicada por x. 0.95 significa 95 %. Cercano a 1 = buen ajuste lineal.',
      },
      {
        nombre: 'Error estándar Sᵧ/ₓ',
        explicacion:
          '√(Σrᵢ²/(n − 2)): el error típico de la predicción, en las mismas unidades que y. Es el más interpretable.',
      },
      {
        nombre: 'Residuos',
        explicacion:
          'rᵢ = yᵢ − ŷᵢ. Deben verse repartidos al azar alrededor de cero. Si hay patrón, el modelo no corresponde.',
      },
    ],
    pasos: [
      'Graficar los datos para ver si una recta es razonable (si es una curva, este método no es el indicado).',
      'Armar las columnas auxiliares: xᵢ² y xᵢ·yᵢ, y sumar cada columna.',
      'Calcular la pendiente a₁ con la fórmula de las sumatorias.',
      'Calcular la ordenada al origen a₀ con los promedios: a₀ = ȳ − a₁·x̄.',
      'Evaluar el ajuste: r, r² y error estándar; revisar los residuos.',
      'Usar la recta para predecir, con cuidado de no alejarse del rango medido.',
    ],
    ventajas: [
      'Da la mejor recta en el sentido de los cuadrados: es un óptimo demostrado, no una elección a ojo.',
      'Las fórmulas son cerradas: no se itera ni se prueba, se calcula directo.',
      'Los datos con error no "contaminan" la curva, porque la recta no está obligada a pasar por ellos.',
      'Trae medidas de bondad (r, r², error estándar) que permiten decidir si el modelo sirve.',
    ],
    limitaciones: [
      'Solo modela relaciones lineales (o linealizables): una curva no se arregla con una recta.',
      'Los outliers pesan mucho, porque el error se eleva al cuadrado.',
      'No dice nada sobre causalidad: r alto significa asociación, no causa.',
      'La extrapolación lejos del rango medido no está respaldada por los datos.',
      'Con muy pocos puntos (n ≤ 2) el ajuste no tiene valor estadístico.',
    ],
    recomendaciones: [
      'Graficá siempre los datos y los residuos antes de dar por bueno el modelo.',
      'Reportá r² y el error estándar juntos: r² puede ser alto y el error grande para datos de gran magnitud.',
      'Si los residuos forman curva, probá ajuste polinómico o una transformación (log, raíz) de los datos.',
      'Descartá o trata aparte los outliers, pero nunca los borres sin justificar.',
      'No extrapoles más allá de los datos; si hace falta, buscá un modelo físico, no estadístico.',
    ],
  },

  /* ---------------------------------------------------------------- */
  /* Ejemplo numérico                                                 */
  /* ---------------------------------------------------------------- */
  ejemploNormal: {
    id: 'mc-num-1',
    titulo: 'Recta de mínimos cuadrados para cinco mediciones',
    tipo: 'numerico',
    planteamiento:
      'Con los datos (1; 1.8), (2; 3.9), (3; 6.1), (4; 7.9) y (5; 10.2), ajustar la recta por mínimos ' +
      'cuadrados, medir la bondad del ajuste y predecir el valor en x = 6.',
    parametros: [
      { etiqueta: 'Datos', valor: '(1; 1.8), (2; 3.9), (3; 6.1), (4; 7.9), (5; 10.2)' },
      { etiqueta: 'n', valor: '5' },
      { etiqueta: 'Predecir en', valor: 'x = 6' },
    ],
    interpretacion:
      'Los puntos suben de forma casi perfectamente recta (son y ≈ 2x − 0.3 con algo de error). ' +
      'Esperamos un r² muy alto y una predicción en x = 6 que continúe la tendencia.',
    pasos: [
      'Sumatorias: Σxᵢ = 15, Σyᵢ = 29.9, Σxᵢ² = 55, Σxᵢyᵢ = 110.5. Promedios: x̄ = 3, ȳ = 5.98.',
      'Pendiente: a₁ = (5·110.5 − 15·29.9) / (5·55 − 15²) = (552.5 − 448.5) / (275 − 225) = 104/50 = 2.08.',
      'Ordenada: a₀ = ȳ − a₁·x̄ = 5.98 − 2.08·3 = 5.98 − 6.24 = −0.26.',
      'La recta es ŷ = −0.26 + 2.08x. Predicción: ŷ(6) = −0.26 + 12.48 = 12.22.',
    ],
    algoritmo:
      'Se arman las columnas xᵢ² y xᵢ·yᵢ para obtener las cuatro sumatorias, y con ellas se aplican ' +
      'las fórmulas de a₁ y a₀. La recta se evalúa en x = 6 para predecir.',
    criterio:
      'Se evalúa con r y r². Acá r = 0.9995 → casi una recta exacta, y r² = 0.99898: el 99.9 % de la ' +
      'variación de y queda explicada por x. El error estándar es 0.1211.',
    conclusion:
      'La recta ajustada es y = −0.26 + 2.08x, con r = 0.99949 y r² = 0.99898. Para x = 6 la predicción ' +
      'es ŷ ≈ 12.22. El ajuste es excelente: los residuos son todos menores que 0.2 en valor absoluto.',
    calculo: {
      puntos: [
        { x: 1, y: 1.8 },
        { x: 2, y: 3.9 },
        { x: 3, y: 6.1 },
        { x: 4, y: 7.9 },
        { x: 5, y: 10.2 },
      ],
      evaluarEn: 6,
      etiqueta: 'Cinco mediciones casi rectas',
    },
  },

  /* ---------------------------------------------------------------- */
  /* Ejemplo de casuística: ley de Hooke                              */
  /* ---------------------------------------------------------------- */
  ejemploCasuistica: {
    id: 'mc-cas-1',
    titulo: 'Constante elástica de un resorte (ley de Hooke)',
    tipo: 'casuistica',
    enunciado:
      'En el laboratorio se cuelgan pesas de un resorte y se mide el alargamiento: 2 kg → 1.4 cm; ' +
      '4 kg → 2.9 cm; 6 kg → 4.3 cm; 8 kg → 5.8 cm; y 10 kg → 7.2 cm. Hallar la recta que relaciona ' +
      'carga y alargamiento, usarla para predecir el alargamiento con 7 kg y estimar la constante elástica.',
    extraccion: {
      busqueda: 'Se busca el alargamiento Δl en función de la carga m (aplicada).',
      datos: [
        { simbolo: 'm', valor: '2, 4, 6, 8, 10 kg', queEs: 'Carga colgada (variable independiente).' },
        { simbolo: 'Δl', valor: '1.4, 2.9, 4.3, 5.8, 7.2 cm', queEs: 'Alargamiento medido (variable dependiente).' },
        { simbolo: 'm*', valor: '7 kg', queEs: 'Carga donde se predice el alargamiento.' },
      ],
      formulacion:
        'La ley de Hooke dice que el alargamiento es proporcional a la carga: Δl = (g/k)·m. ' +
        'Es una relación lineal sin término independiente, pero se ajusta con la forma completa ' +
        'Δl = a₀ + a₁·m para verificar si a₀ es despreciable (lo sería en un resorte ideal).',
    },
    planteamiento:
      'Datos (m; Δl): (2; 1.4), (4; 2.9), (6; 4.3), (8; 5.8), (10; 7.2). Ajustar Δl = a₀ + a₁·m y predecir en m = 7.',
    parametros: [
      { etiqueta: 'Datos (m; Δl)', valor: '(2; 1.4), (4; 2.9), (6; 4.3), (8; 5.8), (10; 7.2)' },
      { etiqueta: 'n', valor: '5' },
      { etiqueta: 'Predecir en', valor: 'm = 7 kg' },
    ],
    interpretacion:
      'Los puntos están prácticamente sobre una recta: el resorte es ideal en el rango medido. ' +
      'La pendiente a₁ será el alargamiento por kilogramo, y con ella se puede estimar la constante k. ' +
      'El valor a₀ debería dar cercano a 0 (resorte sin deformación inicial).',
    pasos: [
      'Sumatorias: Σm = 30, ΣΔl = 21.6, Σm² = 220, Σ(m·Δl) = 158.6. Promedios: m̄ = 6 kg, Δl̄ = 4.32 cm.',
      'Pendiente: a₁ = (5·158.6 − 30·21.6) / (5·220 − 30²) = (793 − 648) / (1100 − 900) = 145/200 = 0.725 cm/kg.',
      'Ordenada: a₀ = 4.32 − 0.725·6 = 4.32 − 4.35 = −0.03 cm.',
      'Recta: Δl = −0.03 + 0.725m. Predicción: Δl(7) = −0.03 + 5.075 = 5.045 cm.',
    ],
    algoritmo:
      'Se aplican las fórmulas de mínimos cuadrados con m como x y Δl como y, y se evalúa la recta en m = 7.',
    criterio:
      'r = 0.99993 y r² = 0.99986: la relación es lineal en el rango medido. El valor a₀ = −0.03 es ' +
      'de 0.7 % del alargamiento máximo, o sea experimentalmente despreciable (el error del instrumento es mayor).',
    conclusion:
      'La recta es Δl = −0.03 + 0.725·m, con r² = 0.99986. Con 7 kg el alargamiento esperado es 5.045 cm. ' +
      'La pendiente da la constante elástica: a₁ = Δl/m = g/k, de donde k = g/a₁ = 9.81/0.0725 m/cm → ' +
      'k ≈ 135 N/m. El término a₀ ≈ 0 confirma que el resorte se comporta como ideal en este rango.',
    calculo: {
      puntos: [
        { x: 2, y: 1.4 },
        { x: 4, y: 2.9 },
        { x: 6, y: 4.3 },
        { x: 8, y: 5.8 },
        { x: 10, y: 7.2 },
      ],
      evaluarEn: 7,
      etiqueta: 'Alargamiento de un resorte',
    },
  },
};

/* ------------------------------------------------------------------ */
/* Ejemplos resueltos (2 numéricos + 2 casuísticas)                    */
/* ------------------------------------------------------------------ */

export const EJEMPLOS_MINIMOS_CUADRADOS: EjemploModulo3[] = [
  {
    id: 'mc-num-2',
    titulo: 'Ajuste de cinco datos de laboratorio',
    tipo: 'numerico',
    planteamiento:
      'Con (0; 1.1), (1; 2.9), (2; 5.1), (3; 6.8) y (4; 9.2), hallar la recta de mínimos cuadrados y ' +
      'predecir en x = 2.5.',
    parametros: [
      { etiqueta: 'Datos', valor: '(0; 1.1), (1; 2.9), (2; 5.1), (3; 6.8), (4; 9.2)' },
      { etiqueta: 'n', valor: '5' },
      { etiqueta: 'Predecir en', valor: 'x = 2.5' },
    ],
    interpretacion:
      'Datos con una tendencia lineal clara pero con dispersión de hasta 0.23 unidades. Es el caso ' +
      'típico en que la interpolación sería un error y la regresión es lo correcto.',
    pasos: [
      'Sumatorias: Σxᵢ = 10, Σyᵢ = 25.1, Σxᵢ² = 30, Σxᵢyᵢ = 70.3. Promedios: x̄ = 2, ȳ = 5.02.',
      'Pendiente: a₁ = (5·70.3 − 10·25.1) / (5·30 − 10²) = (351.5 − 251)/50 = 100.5/50 = 2.01.',
      'Ordenada: a₀ = 5.02 − 2.01·2 = 5.02 − 4.02 = 1.',
      'Recta: ŷ = 1 + 2.01x. Predicción: ŷ(2.5) = 1 + 5.025 = 6.025.',
    ],
    algoritmo: 'Cuatro sumatorias, dos fórmulas, una predicción.',
    criterio: 'r = 0.99868 y r² = 0.99736. El error estándar es 0.1889, en las unidades de y.',
    conclusion:
      'La recta es y = 1 + 2.01x con r² = 0.9974 (99.7 % de la variación explicada). La predicción en ' +
      'x = 2.5 es ŷ ≈ 6.025. Los residuos (0.10, −0.11, 0.08, −0.23, 0.16) alternan de signo sin patrón: ' +
      'el modelo lineal es adecuado.',
    calculo: {
      puntos: [
        { x: 0, y: 1.1 },
        { x: 1, y: 2.9 },
        { x: 2, y: 5.1 },
        { x: 3, y: 6.8 },
        { x: 4, y: 9.2 },
      ],
      evaluarEn: 2.5,
      etiqueta: 'Cinco datos de laboratorio',
    },
  },

  {
    id: 'mc-num-3',
    titulo: 'Ajuste con pendiente casi unitaria',
    tipo: 'numerico',
    planteamiento: 'Con (1; 2.0), (2; 4.2), (3; 5.9), (4; 8.1) y (5; 10.0), ajustar la recta y predecir en x = 6.',
    parametros: [
      { etiqueta: 'Datos', valor: '(1; 2.0), (2; 4.2), (3; 5.9), (4; 8.1), (5; 10.0)' },
      { etiqueta: 'n', valor: '5' },
      { etiqueta: 'Predecir en', valor: 'x = 6' },
    ],
    interpretacion:
      'Los datos crecen casi 2 unidades por cada unidad de x. Interesa ver si el ajuste detecta ese 2.',
    pasos: [
      'Sumatorias: Σxᵢ = 15, Σyᵢ = 30.2, Σxᵢ² = 55, Σxᵢyᵢ = 110.5. Promedios: x̄ = 3, ȳ = 6.04.',
      'Pendiente: a₁ = (5·110.5 − 15·30.2)/(5·55 − 15²) = (552.5 − 453)/50 = 99.5/50 = 1.99.',
      'Ordenada: a₀ = 6.04 − 1.99·3 = 6.04 − 5.97 = 0.07.',
      'Recta: ŷ = 0.07 + 1.99x. Predicción: ŷ(6) = 0.07 + 11.94 = 12.01.',
    ],
    algoritmo: 'Aplicación directa de las fórmulas de mínimos cuadrados.',
    criterio: 'r = 0.99936, r² = 0.99871, error estándar 0.1304.',
    conclusion:
      'Recta y = 0.07 + 1.99x con r² = 0.9987. En x = 6 la predicción es 12.01. El residuo más grande ' +
      'es −0.14 en x = 3, y se reparten alternadamente: el ajuste es bueno y el modelo lineal válido.',
    calculo: {
      puntos: [
        { x: 1, y: 2 },
        { x: 2, y: 4.2 },
        { x: 3, y: 5.9 },
        { x: 4, y: 8.1 },
        { x: 5, y: 10 },
      ],
      evaluarEn: 6,
      etiqueta: 'Datos con pendiente 2',
    },
  },

  {
    id: 'mc-cas-2',
    titulo: 'Curva de calibración de un sensor',
    tipo: 'casuistica',
    enunciado:
      'Para calibrar un sensor de gas se midió su salida en milivoltios a distintas concentraciones ' +
      'conocidas: 0 ppm → 0.02 mV; 10 ppm → 1.98 mV; 20 ppm → 4.05 mV; 30 ppm → 5.97 mV; y 40 ppm → 8.02 mV. ' +
      'Obtener la recta de calibración y estimar la salida para 25 ppm.',
    extraccion: {
      busqueda: 'Se busca la salida V del sensor en función de la concentración c.',
      datos: [
        { simbolo: 'c', valor: '0, 10, 20, 30, 40 ppm', queEs: 'Concentración patrón (variable independiente).' },
        { simbolo: 'V', valor: '0.02, 1.98, 4.05, 5.97, 8.02 mV', queEs: 'Salida del sensor (variable dependiente).' },
        { simbolo: 'c*', valor: '25 ppm', queEs: 'Concentración donde se estima la salida.' },
      ],
      formulacion:
        'La calibración busca una recta V = a₀ + a₁·c. La pendiente a₁ es la sensibilidad (mV por ppm) ' +
        'y a₀ es el offset del sensor.',
    },
    planteamiento: 'Datos (c; V): (0; 0.02), (10; 1.98), (20; 4.05), (30; 5.97), (40; 8.02). Estimar V(25).',
    parametros: [
      { etiqueta: 'Datos (c; V)', valor: '(0; 0.02), (10; 1.98), (20; 4.05), (30; 5.97), (40; 8.02)' },
      { etiqueta: 'n', valor: '5' },
      { etiqueta: 'Predecir en', valor: 'c = 25 ppm' },
    ],
    interpretacion:
      'Una calibración ideal es una recta: la sensibilidad constante en todo el rango. Acá se busca ' +
      'que r² sea casi 1 para poder usar la recta como certificado de calibración.',
    pasos: [
      'Sumatorias: Σc = 100, ΣV = 20.04, Σc² = 3000, Σ(c·V) = 600.7. Promedios: c̄ = 20 ppm, V̄ = 4.008 mV.',
      'Pendiente: a₁ = (5·600.7 − 100·20.04)/(5·3000 − 100²) = (3003.5 − 2004)/(15000 − 10000) = 999.5/5000 = 0.1999 mV/ppm.',
      'Ordenada: a₀ = 4.008 − 0.1999·20 = 4.008 − 3.998 = 0.01 mV.',
      'Recta: V = 0.01 + 0.1999c. Predicción: V(25) = 0.01 + 4.9975 = 5.0075 mV.',
    ],
    algoritmo: 'Mínimos cuadrados con la concentración como x y la salida como y.',
    criterio:
      'r = 0.99995 y r² = 0.99989, con error estándar 0.0377 mV. El offset a₀ = 0.01 mV es del orden ' +
      'del error de lectura: el sensor no tiene offset apreciable.',
    conclusion:
      'La recta de calibración es V = 0.01 + 0.1999·c, o sea una sensibilidad de 0.1999 mV/ppm, con ' +
      'r² = 0.99989. Para 25 ppm se esperan 5.0075 mV. Con este ajuste se puede invertir la recta ' +
      'y usar el sensor para medir concentraciones desconocidas.',
    calculo: {
      puntos: [
        { x: 0, y: 0.02 },
        { x: 10, y: 1.98 },
        { x: 20, y: 4.05 },
        { x: 30, y: 5.97 },
        { x: 40, y: 8.02 },
      ],
      evaluarEn: 25,
      etiqueta: 'Calibración del sensor V(c)',
    },
  },

  {
    id: 'mc-cas-3',
    titulo: 'Ventas según inversión en publicidad',
    tipo: 'casuistica',
    enunciado:
      'Una empresa registró sus ventas semanales (en miles de soles) según lo invertido en publicidad ' +
      '(en miles de soles): 1 → 20; 2 → 28; 3 → 35; 4 → 45; 5 → 50. Estimar las ventas si se invierten ' +
      '6 mil soles.',
    extraccion: {
      busqueda: 'Se busca la venta S en función de la inversión publicitaria p.',
      datos: [
        { simbolo: 'p', valor: '1, 2, 3, 4, 5 mil soles', queEs: 'Inversión en publicidad (variable independiente).' },
        { simbolo: 'S', valor: '20, 28, 35, 45, 50 mil soles', queEs: 'Ventas (variable dependiente).' },
        { simbolo: 'p*', valor: '6 mil soles', queEs: 'Inversión para la que se predice.' },
      ],
      formulacion: 'Recta S = a₀ + a₁·p, donde a₁ es el aumento de ventas por cada mil soles invertido.',
    },
    planteamiento: 'Datos (p; S): (1; 20), (2; 28), (3; 35), (4; 45), (5; 50). Estimar S(6).',
    parametros: [
      { etiqueta: 'Datos (p; S)', valor: '(1; 20), (2; 28), (3; 35), (4; 45), (5; 50)' },
      { etiqueta: 'n', valor: '5' },
      { etiqueta: 'Predecir en', valor: 'p = 6' },
    ],
    interpretacion:
      'Interesa la pendiente como retorno de la inversión (cuánto suben las ventas por sol invertido). ' +
      'La predicción en p = 6 es una extrapolación leve: hay que mencionarlo.',
    pasos: [
      'Sumatorias: Σp = 15, ΣS = 178, Σp² = 55, Σ(p·S) = 611. Promedios: p̄ = 3, S̄ = 35.6.',
      'Pendiente: a₁ = (5·611 − 15·178)/(5·55 − 15²) = (3055 − 2670)/50 = 385/50 = 7.7.',
      'Ordenada: a₀ = 35.6 − 7.7·3 = 35.6 − 23.1 = 12.5.',
      'Recta: S = 12.5 + 7.7p. Predicción: S(6) = 12.5 + 46.2 = 58.7 mil soles.',
    ],
    algoritmo: 'Fórmulas de mínimos cuadrados con p como x y las ventas como y.',
    criterio: 'r = 0.99639, r² = 0.99280: el 99.3 % de la variación de ventas se asocia a la publicidad.',
    conclusion:
      'La recta es S = 12.5 + 7.7p con r² = 0.9928: cada mil soles invertidos se asocian a 7.7 mil soles ' +
      'más de venta. Con 6 mil soles se predicen 58.7 mil soles. Ojo: p = 6 está fuera del rango medido ' +
      '(1 a 5) y además correlación no implica causalidad.',
    calculo: {
      puntos: [
        { x: 1, y: 20 },
        { x: 2, y: 28 },
        { x: 3, y: 35 },
        { x: 4, y: 45 },
        { x: 5, y: 50 },
      ],
      evaluarEn: 6,
      etiqueta: 'Ventas vs publicidad',
    },
  },
];

/* ------------------------------------------------------------------ */
/* Autoevaluación (3 numéricos + 3 casuísticas)                        */
/* ------------------------------------------------------------------ */

export const EJERCICIOS_MINIMOS_CUADRADOS: EjercicioModulo3[] = [
  {
    id: 'mc-ej-num-1',
    titulo: 'Ejercicio 1 · Seis mediciones',
    tipo: 'numerico',
    planteamiento: 'Ajustar la recta para (1; 0.5), (2; 1.4), (3; 2.1), (4; 3.3), (5; 4.0) y (6; 5.2), y predecir en x = 3.5.',
    parametros: [
      { etiqueta: 'Datos', valor: '(1; 0.5), (2; 1.4), (3; 2.1), (4; 3.3), (5; 4.0), (6; 5.2)' },
      { etiqueta: 'n', valor: '6' },
      { etiqueta: 'Predecir en', valor: 'x = 3.5' },
    ],
    pista: 'Con n = 6, el error estándar divide entre n − 2 = 4.',
    interpretacion: 'Ahora n = 6: las sumatorias son más grandes y conviene organizar la tabla.',
    pasos: [
      'Sumatorias: Σx = 21, Σy = 16.5, Σx² = 91, Σxy = 74. Promedios: x̄ = 3.5, ȳ = 2.75.',
      'a₁ = (6·74 − 21·16.5)/(6·91 − 21²) = (444 − 346.5)/(546 − 441) = 97.5/105 = 0.928571.',
      'a₀ = 2.75 − 0.928571·3.5 = 2.75 − 3.25 = −0.5.',
      'Recta: ŷ = −0.5 + 0.928571x. Predicción: ŷ(3.5) = −0.5 + 3.25 = 2.75.',
    ],
    algoritmo: 'Mismas fórmulas; cambia la cantidad de datos.',
    criterio: 'r = 0.99717, r² = 0.99435 y error estándar 0.1464.',
    conclusion:
      'Recta y = −0.5 + 0.9286x con r² = 0.9944. La predicción en x = 3.5 es 2.75, que coincide con el ' +
      'promedio de y porque 3.5 es justamente x̄: la recta siempre pasa por el punto (x̄, ȳ).',
    calculo: {
      puntos: [
        { x: 1, y: 0.5 },
        { x: 2, y: 1.4 },
        { x: 3, y: 2.1 },
        { x: 4, y: 3.3 },
        { x: 5, y: 4 },
        { x: 6, y: 5.2 },
      ],
      evaluarEn: 3.5,
      etiqueta: 'Seis mediciones',
    },
  },

  {
    id: 'mc-ej-num-2',
    titulo: 'Ejercicio 2 · Temperatura vs presión',
    tipo: 'numerico',
    planteamiento: 'Datos (10; 52), (20; 58), (30; 64), (40; 71) y (50; 77). Ajustar y predecir en x = 35.',
    parametros: [
      { etiqueta: 'Datos', valor: '(10; 52), (20; 58), (30; 64), (40; 71), (50; 77)' },
      { etiqueta: 'n', valor: '5' },
      { etiqueta: 'Predecir en', valor: 'x = 35' },
    ],
    pista: 'La pendiente será un número "redondo": revisá las sumatorias antes de despejar.',
    interpretacion: 'Datos con x grandes: el término Σx² crece rápido, cuidado al operar.',
    pasos: [
      'Sumatorias: Σx = 150, Σy = 322, Σx² = 5500, Σxy = 10290. Promedios: x̄ = 30, ȳ = 64.4.',
      'a₁ = (5·10290 − 150·322)/(5·5500 − 150²) = (51450 − 48300)/(27500 − 22500) = 3150/5000 = 0.63.',
      'a₀ = 64.4 − 0.63·30 = 64.4 − 18.9 = 45.5.',
      'Recta: ŷ = 45.5 + 0.63x. Predicción: ŷ(35) = 45.5 + 22.05 = 67.55.',
    ],
    algoritmo: 'Aplicación directa de las fórmulas.',
    criterio: 'r = 0.99962, r² = 0.99924, error estándar 0.3162.',
    conclusion:
      'Recta y = 45.5 + 0.63x con r² = 0.9992. La predicción en x = 35 es 67.55. Los residuos (0.2, −0.1, ' +
      '−0.4, 0.3, 0) son pequeños y sin patrón.',
    calculo: {
      puntos: [
        { x: 10, y: 52 },
        { x: 20, y: 58 },
        { x: 30, y: 64 },
        { x: 40, y: 71 },
        { x: 50, y: 77 },
      ],
      evaluarEn: 35,
      etiqueta: 'Temperatura vs presión',
    },
  },

  {
    id: 'mc-ej-num-3',
    titulo: 'Ejercicio 3 · Datos casi exactos',
    tipo: 'numerico',
    planteamiento: 'Ajustar (1; 3.1), (2; 4.0), (3; 5.2), (4; 6.1) y (5; 7.0), y predecir en x = 4.5.',
    parametros: [
      { etiqueta: 'Datos', valor: '(1; 3.1), (2; 4.0), (3; 5.2), (4; 6.1), (5; 7.0)' },
      { etiqueta: 'n', valor: '5' },
      { etiqueta: 'Predecir en', valor: 'x = 4.5' },
    ],
    pista: 'Si r² es muy alto, la predicción es confiable dentro del rango.',
    interpretacion: 'Datos muy cercanos a una recta de pendiente ≈ 1.',
    pasos: [
      'Sumatorias: Σx = 15, Σy = 25.4, Σx² = 55, Σxy = 86.1. Promedios: x̄ = 3, ȳ = 5.08.',
      'a₁ = (5·86.1 − 15·25.4)/(5·55 − 15²) = (430.5 − 381)/50 = 49.5/50 = 0.99.',
      'a₀ = 5.08 − 0.99·3 = 5.08 − 2.97 = 2.11.',
      'Recta: ŷ = 2.11 + 0.99x. Predicción: ŷ(4.5) = 2.11 + 4.455 = 6.565.',
    ],
    algoritmo: 'Fórmulas de mínimos cuadrados.',
    criterio: 'r = 0.99863, r² = 0.99725, error estándar 0.0949.',
    conclusion:
      'Recta y = 2.11 + 0.99x con r² = 0.9973. La predicción en x = 4.5 es 6.565. El error estándar ' +
      '(0.095) es del orden del error de medición, así que el modelo agota la información de los datos.',
    calculo: {
      puntos: [
        { x: 1, y: 3.1 },
        { x: 2, y: 4 },
        { x: 3, y: 5.2 },
        { x: 4, y: 6.1 },
        { x: 5, y: 7 },
      ],
      evaluarEn: 4.5,
      etiqueta: 'Datos casi exactos',
    },
  },

  {
    id: 'mc-ej-cas-1',
    titulo: 'Ejercicio 4 · Costos de producción',
    tipo: 'casuistica',
    enunciado:
      'Una planta registró el costo mensual según las unidades producidas: 100 unidades → 2400 soles; ' +
      '200 → 3200; 300 → 3900; 400 → 4700; y 500 → 5500. Estimar el costo para 350 unidades e ' +
      'interpretar la ordenada al origen como costo fijo.',
    extraccion: {
      busqueda: 'Se busca el costo C en función de las unidades producidas q.',
      datos: [
        { simbolo: 'q', valor: '100, 200, 300, 400, 500 unidades', queEs: 'Producción (variable independiente).' },
        { simbolo: 'C', valor: '2400, 3200, 3900, 4700, 5500 soles', queEs: 'Costo mensual (variable dependiente).' },
        { simbolo: 'q*', valor: '350 unidades', queEs: 'Producción donde se estima el costo.' },
      ],
      formulacion:
        'Modelo de costos C = costo fijo + costo variable por unidad · q. La ordenada a₀ es el costo ' +
        'fijo (lo que se paga aunque no se produzca nada) y a₁ el costo marginal por unidad.',
    },
    planteamiento: 'Datos (q; C): (100; 2400), (200; 3200), (300; 3900), (400; 4700), (500; 5500). Estimar C(350).',
    parametros: [
      { etiqueta: 'Datos (q; C)', valor: '(100; 2400), (200; 3200), (300; 3900), (400; 4700), (500; 5500)' },
      { etiqueta: 'n', valor: '5' },
      { etiqueta: 'Estimar en', valor: 'q = 350 unidades' },
    ],
    pista: 'La ordenada al origen tiene significado económico: es el costo fijo.',
    interpretacion:
      'La relación costo–producción es aproximadamente lineal en este rango. La pendiente es el costo ' +
      'variable por unidad y el intercepto, el costo fijo de la planta.',
    pasos: [
      'Sumatorias: Σq = 1500, ΣC = 19700, Σq² = 550000, Σ(q·C) = 6680000. Promedios: q̄ = 300, C̄ = 3940.',
      'a₁ = (5·6680000 − 1500·19700)/(5·550000 − 1500²) = (33400000 − 29550000)/(2750000 − 2250000) = 3850000/500000 = 7.7 soles/unidad.',
      'a₀ = 3940 − 7.7·300 = 3940 − 2310 = 1630 soles.',
      'Recta: C = 1630 + 7.7q. Predicción: C(350) = 1630 + 2695 = 4325 soles.',
    ],
    algoritmo: 'Mínimos cuadrados con q como x y el costo como y.',
    criterio: 'r = 0.99975, r² = 0.99949, error estándar 31.62 soles.',
    conclusion:
      'Recta C = 1630 + 7.7q con r² = 0.9995: cada unidad extra cuesta 7.7 soles y el costo fijo es 1630 soles. ' +
      'Para 350 unidades el costo estimado es 4325 soles. La interpretación económica sale directo de los ' +
      'coeficientes, que es la gran ventaja de ajustar una recta.',
    calculo: {
      puntos: [
        { x: 100, y: 2400 },
        { x: 200, y: 3200 },
        { x: 300, y: 3900 },
        { x: 400, y: 4700 },
        { x: 500, y: 5500 },
      ],
      evaluarEn: 350,
      etiqueta: 'Costo vs producción',
    },
  },

  {
    id: 'mc-ej-cas-2',
    titulo: 'Ejercicio 5 · ¿Cuándo el modelo lineal NO sirve?',
    tipo: 'casuistica',
    enunciado:
      'Se midió el consumo de combustible a distintas velocidades: 40 km/h → 12.5 L/100 km; 60 → 10.2; ' +
      '80 → 9.4; 100 → 9.8; y 120 → 11.5. Ajustar una recta, evaluar el ajuste y decidir si el modelo es válido.',
    extraccion: {
      busqueda: 'Se busca el consumo c en función de la velocidad v.',
      datos: [
        { simbolo: 'v', valor: '40, 60, 80, 100, 120 km/h', queEs: 'Velocidad (variable independiente).' },
        { simbolo: 'c', valor: '12.5, 10.2, 9.4, 9.8, 11.5 L/100 km', queEs: 'Consumo (variable dependiente).' },
      ],
      formulacion:
        'Se plantea la recta c = a₀ + a₁·v, pero los datos sugieren una curva en U (baja y vuelve a subir), ' +
        'así que el ajuste lineal servirá para MOSTRAR que no corresponde.',
    },
    planteamiento: 'Datos (v; c): (40; 12.5), (60; 10.2), (80; 9.4), (100; 9.8), (120; 11.5). Ajustar y decidir.',
    parametros: [
      { etiqueta: 'Datos (v; c)', valor: '(40; 12.5), (60; 10.2), (80; 9.4), (100; 9.8), (120; 11.5)' },
      { etiqueta: 'n', valor: '5' },
    ],
    pista: 'Mirá primero el gráfico: si los puntos bajan y vuelven a subir, ninguna recta los va a representar.',
    interpretacion:
      'El consumo real tiene un mínimo cerca de 80 km/h y crece a los dos lados. Eso es una curva, no una ' +
      'recta. La regresión lineal igual devuelve una recta: hay que juzgar si sirve.',
    pasos: [
      'Sumatorias: Σv = 400, Σc = 53.4, Σv² = 36000, Σ(v·c) = 4224. Promedios: v̄ = 80, c̄ = 10.68.',
      'a₁ = (5·4224 − 400·53.4)/(5·36000 − 400²) = (21120 − 21360)/(180000 − 160000) = −240/20000 = −0.012.',
      'a₀ = 10.68 − (−0.012)·80 = 10.68 + 0.96 = 11.64.',
      'Recta: c = 11.64 − 0.012v. Predicción: c(90) = 11.64 − 1.08 = 10.56 L/100 km.',
    ],
    algoritmo:
      'Se aplican las fórmulas igual que siempre. El resultado no se descarta: se evalúa con r² y con los residuos.',
    criterio:
      'r = −0.2948 y r² = 0.0869: el modelo explica menos del 9 % de la variación, y el signo negativo de ' +
      'la pendiente dice que el consumo baja siempre con la velocidad, lo cual es falso a alta velocidad. ' +
      'Los residuos (1.34, −0.72, −1.28, −0.64, 1.30) forman una U: patrón evidente.',
    conclusion:
      'La recta c = 11.64 − 0.012v tiene r² = 0.0869 y residuos con forma de U. Conclusión: el modelo lineal ' +
      'NO es válido acá; se necesita un ajuste polinómico (parabólico) o un modelo físico. Este ejercicio es ' +
      'el ejemplo de por qué siempre hay que mirar el gráfico de residuos y no solo r².',
    calculo: {
      puntos: [
        { x: 40, y: 12.5 },
        { x: 60, y: 10.2 },
        { x: 80, y: 9.4 },
        { x: 100, y: 9.8 },
        { x: 120, y: 11.5 },
      ],
      evaluarEn: 90,
      etiqueta: 'Consumo vs velocidad (no lineal)',
    },
  },

  {
    id: 'mc-ej-cas-3',
    titulo: 'Ejercicio 6 · Proyección de población',
    tipo: 'casuistica',
    enunciado:
      'Un distrito registró su población (en miles de habitantes) en los censos: 2010 → 15.2; 2015 → 17.1; ' +
      '2020 → 19.4; y 2025 → 21.8. Ajustar la recta y proyectar la población para 2030.',
    extraccion: {
      busqueda: 'Se busca la población P en función del año t.',
      datos: [
        { simbolo: 't', valor: '2010, 2015, 2020, 2025', queEs: 'Año del censo (variable independiente).' },
        { simbolo: 'P', valor: '15.2, 17.1, 19.4, 21.8 miles', queEs: 'Población (variable dependiente).' },
        { simbolo: 't*', valor: '2030', queEs: 'Año a proyectar.' },
      ],
      formulacion:
        'Recta P = a₀ + a₁·t, donde a₁ es el crecimiento medio anual (en miles de habitantes por año). ' +
        'La proyección a 2030 es una extrapolación de 5 años.',
    },
    planteamiento: 'Datos (t; P): (2010; 15.2), (2015; 17.1), (2020; 19.4), (2025; 21.8). Proyectar a 2030.',
    parametros: [
      { etiqueta: 'Datos (t; P)', valor: '(2010; 15.2), (2015; 17.1), (2020; 19.4), (2025; 21.8)' },
      { etiqueta: 'n', valor: '4' },
      { etiqueta: 'Proyectar a', valor: 't = 2030' },
    ],
    pista: 'Se puede trabajar con los años tal cual o restar 2000; el resultado de la pendiente es el mismo por año.',
    interpretacion:
      'El crecimiento parece sostenido. La pendiente dará el aumento anual medio, que es la cifra que ' +
      'interesa para planificar servicios.',
    pasos: [
      'Sumatorias: Σt = 8070, ΣP = 73.5, Σt² = 16281350, Σ(t·P) = 148341.5. Promedios: t̄ = 2017.5, P̄ = 18.375.',
      'a₁ = (4·148341.5 − 8070·73.5)/(4·16281350 − 8070²) = (593366 − 593145)/(65125400 − 65124900) = 221/500 = 0.442 miles/año.',
      'a₀ = 18.375 − 0.442·2017.5 = 18.375 − 891.735 = −873.36.',
      'Recta: P = −873.36 + 0.442t. Proyección: P(2030) = −873.36 + 897.26 = 23.9 miles de habitantes.',
    ],
    algoritmo: 'Mínimos cuadrados con el año como x. El intercepto no tiene sentido físico; la pendiente sí.',
    criterio: 'r = 0.99863, r² = 0.99726, error estándar 0.183 miles de habitantes.',
    conclusion:
      'Recta P = −873.36 + 0.442t con r² = 0.9973: la población crece 442 habitantes por año en promedio. ' +
      'La proyección a 2030 da 23.9 mil habitantes. Cuidado con el intercepto: a₀ = −873.36 no significa ' +
      'nada por sí solo (nadie extrapola al año 0); solo la pendiente se interpreta.',
    calculo: {
      puntos: [
        { x: 2010, y: 15.2 },
        { x: 2015, y: 17.1 },
        { x: 2020, y: 19.4 },
        { x: 2025, y: 21.8 },
      ],
      evaluarEn: 2030,
      etiqueta: 'Proyección de población',
    },
  },
];
