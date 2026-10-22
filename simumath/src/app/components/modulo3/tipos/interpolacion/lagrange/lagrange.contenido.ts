import type {
  EjemploModulo3,
  EjercicioModulo3,
  TeoriaModulo3,
} from '../../../modelos/modulo3.model';

/**
 * CONTENIDO DE LAGRANGE: teoría, ejemplos y ejercicios.
 *
 * ── Regla del módulo ─────────────────────────────────────────────────
 * Este archivo solo tiene TEXTOS Y DATOS. Ni una cuenta: cada tabla y
 * cada gráfico se calculan corriendo `lagrange.algoritmo.ts` con los
 * puntos que están acá. Si el motor cambia, los ejemplos cambian con él
 * y no pueden quedar mintiendo.
 *
 * ── La teoría es corta a propósito ───────────────────────────────────
 * El pedido es no repetir en la página lo que ya está mejor explicado
 * afuera. La teoría de acá da la idea y los criterios; el detalle está
 * en los enlaces de `recursos` y en el video.
 */

/* ------------------------------------------------------------------ */
/* Teoría                                                              */
/* ------------------------------------------------------------------ */

export const TEORIA_LAGRANGE: TeoriaModulo3 = {
  concepto:
    'Interpolar es trazar una curva que pase exactamente por todos los datos que tenemos, ' +
    'y usarla para estimar valores donde no medimos. Con n + 1 puntos, Lagrange construye un ' +
    'polinomio de grado ≤ n que los toca a todos. No es una aproximación "cercana": es el único ' +
    'polinomio de ese grado que los cumple, y pasa justo por cada punto.',

  fundamento:
    'Si tienes n + 1 puntos con x distintas, existe UN ÚNICO polinomio de grado ≤ n que pasa por ' +
    'todos. Lagrange lo consigue sin resolver sistemas: define una base Lᵢ(x) por cada punto, que ' +
    'vale 1 en su propio nodo y 0 en todos los demás. Multiplicando cada base por su yᵢ y sumando, ' +
    'en cada nodo sobrevive solo el término que le corresponde, y el polinomio toma el valor del dato. ' +
    'La unicidad se demuestra restando dos polinomios que interpolarsen los mismos puntos: la diferencia ' +
    'tendría n + 1 raíces siendo de grado ≤ n, así que es el polinomio nulo.',

  cuandoFalla:
    'Con muchos puntos y nodos muy juntos en los extremos aparece el FENÓMENO DE RUNGE: el polinomio ' +
    'empieza a oscilar con violencia entre los puntos, aunque pase por todos. También falla si hay dos ' +
    'puntos con la misma x (una base dividiría entre cero) y no sirve para EXTRAPOLAR lejos del rango ' +
    'medido: afuera de los datos el polinomio se dispara sin ninguna garantía.',

  precision:
    'En los nodos el error es cero por construcción. Entre nodos el error depende de la función real: ' +
    'error = [f⁽ⁿ⁺¹⁾(ξ)/(n+1)!] · ∏(x − xᵢ). Eso explica dos cosas: agregar puntos puede no mejorar si ' +
    'la derivada de orden alto es enorme, y el error crece al alejarse del centro del intervalo. ' +
    'Regla práctica: interpolar dentro del rango y no apostar a más decimales de los que la tabla permite.',

  videoUrl: 'https://www.youtube.com/watch?v=CeYKhxfmneI',

  recursos: [
    {
      titulo: 'Polinomio de Lagrange (Wikipedia, español)',
      url: 'https://es.wikipedia.org/wiki/Polinomio_de_Lagrange',
      tipo: 'lectura',
      descripcion: 'La definición formal, la base Lᵢ(x) y la demostración de unicidad.',
    },
    {
      titulo: 'Interpolación polinómica (Wikipedia, español)',
      url: 'https://es.wikipedia.org/wiki/Interpolaci%C3%B3n_polin%C3%B3mica',
      tipo: 'lectura',
      descripcion: 'El problema general, el error de interpolación y la comparación con otras formas.',
    },
    {
      titulo: 'Lagrange interpolating polynomial (MathWorld)',
      url: 'https://mathworld.wolfram.com/LagrangeInterpolatingPolynomial.html',
      tipo: 'lectura',
      descripcion: 'Resumen técnico y notación compacta, útil si ya entendiste la idea.',
    },
    {
      titulo: 'Fenómeno de Runge (Wikipedia, español)',
      url: 'https://es.wikipedia.org/wiki/Fen%C3%B3meno_de_Runge',
      tipo: 'lectura',
      descripcion: 'Por qué agregar puntos equidistantes puede EMPEORAR la interpolación.',
    },
    {
      titulo: 'Interpolación de Lagrange en GeoGebra',
      url: 'https://www.geogebra.org/search/lagrange',
      tipo: 'interactivo',
      descripcion: 'Construcciones listas para arrastrar los nodos y ver cómo cambia el polinomio.',
    },
    {
      titulo: 'Videos de repaso: interpolación de Lagrange',
      url: 'https://www.youtube.com/results?search_query=interpolacion+de+lagrange',
      tipo: 'video',
      descripcion: 'Ejemplos resueltos en pizarra, para seguir las cuentas paso a paso.',
    },
  ],

  algoritmo: {
    formula: 'P(x) = Σᵢ yᵢ · Lᵢ(x)   con   Lᵢ(x) = ∏ⱼ≠ᵢ (x − xⱼ) / (xᵢ − xⱼ)',
    criterios: [
      {
        nombre: 'Base Lᵢ(x)',
        explicacion:
          'Cada base vale 1 en su nodo y 0 en los demás. Es la pieza que hace que el polinomio tome exactamente el valor de cada dato.',
      },
      {
        nombre: 'Grado del polinomio',
        explicacion:
          'Con n + 1 puntos el grado es a lo sumo n. La cantidad de puntos manda, no la forma de la tabla.',
      },
      {
        nombre: 'Error en los nodos',
        explicacion:
          'Debe ser 0 (o ~1e-14 por redondeo). Es el control de que el polinomio realmente interpola: si no da 0, hay un error de cálculo.',
      },
      {
        nombre: 'Error de interpolación',
        explicacion:
          'Entre nodos depende de la función real y del producto ∏(x − xᵢ). Crece al alejarse del centro del intervalo.',
      },
    ],
    pasos: [
      'Contar los puntos y verificar que todas las x sean distintas.',
      'Para cada dato i, armar su base Lᵢ(x): el producto de (x − xⱼ) para todos los j ≠ i, dividido por el mismo producto evaluado en xᵢ.',
      'Multiplicar cada base por su yᵢ: ese es el aporte de cada dato al polinomio.',
      'Sumar todos los aportes: ahí está P(x).',
      'Reemplazar el x pedido en P(x) para estimar el valor.',
      'Verificar: P(xᵢ) debe dar yᵢ para todos los datos.',
    ],
    ventajas: [
      'No hay que resolver ningún sistema de ecuaciones: la fórmula es directa.',
      'Da el polinomio en forma cerrada, listo para evaluar en cualquier x.',
      'Pasa exactamente por los datos: si los datos son confiables, el ajuste es perfecto en los nodos.',
      'Es fácil de programar y de explicar; la base Lᵢ se arma con un doble lazo.',
    ],
    limitaciones: [
      'Cambiar o agregar un punto obliga a recalcular todas las bases (no se aprovecha nada anterior).',
      'Con muchos puntos aparecen oscilaciones (fenómeno de Runge).',
      'No admite dos puntos con la misma x.',
      'No sirve para extrapolar lejos: fuera del rango el polinomio se dispara.',
      'Si los datos tienen error de medición, obligar a pasar por todos es un error: ahí conviene mínimos cuadrados.',
    ],
    recomendaciones: [
      'Usá Lagrange cuando los datos sean exactos y pocos (3 a 6 puntos).',
      'Compará siempre con otras formas del polinomio (Newton por diferencias divididas) cuando haya muchos puntos: dan el mismo resultado con menos cuentas.',
      'Si la curva oscila, probá nodos no equidistantes (Chebyshev) o pasá a un ajuste por mínimos cuadrados.',
      'Graficá siempre: el polinomio puede pasar por los puntos y aún así ser absurdo entre ellos.',
    ],
  },

  /* ---------------------------------------------------------------- */
  /* Ejemplo numérico: interpolar ln(x)                               */
  /* ---------------------------------------------------------------- */
  ejemploNormal: {
    id: 'lagrange-num-1',
    titulo: 'Interpolar ln(x) con tres nodos y estimar ln(2.5)',
    tipo: 'numerico',
    planteamiento:
      'Se conocen los valores de ln(x) en tres puntos y se quiere estimar el valor en x = 2.5, ' +
      'que no está tabulado.',
    parametros: [
      { etiqueta: 'Datos', valor: '(1; 0), (2; 0.6931), (3; 1.0986)' },
      { etiqueta: 'Estimar en', valor: 'x = 2.5' },
      { etiqueta: 'Grado del polinomio', valor: '2 (hay 3 puntos)' },
    ],
    interpretacion:
      'ln(x) es una función suave y creciente. Con tres puntos no esperamos el valor exacto, pero sí ' +
      'una estimación razonable para un valor intermedio como 2.5. Además tenemos la ventaja de poder ' +
      'comparar contra el valor real ln(2.5) ≈ 0.91629.',
    pasos: [
      'L₁(x) = (x − 2)(x − 3) / ((1 − 2)(1 − 3)) = (x − 2)(x − 3)/2. En x = 2.5: L₁ = (−0.5)(0.5)/2 = −0.125.',
      'L₂(x) = (x − 1)(x − 3) / ((2 − 1)(2 − 3)) = (x − 1)(x − 3)/(−1). En x = 2.5: L₂ = (1.5)(−0.5)/(−1) = 0.75.',
      'L₃(x) = (x − 1)(x − 2) / ((3 − 1)(3 − 2)) = (x − 1)(x − 2)/2. En x = 2.5: L₃ = (1.5)(0.5)/2 = 0.375.',
      'P(2.5) = 0·(−0.125) + 0.6931·(0.75) + 1.0986·(0.375) = 0 + 0.5198 + 0.4120 = 0.9318.',
    ],
    algoritmo:
      'Se arman las tres bases L₁, L₂ y L₃, cada una vale 1 en su nodo y 0 en los otros dos. ' +
      'Se multiplica cada base por el yᵢ correspondiente y se suman los tres aportes. El resultado ' +
      'es un polinomio de grado 2 que pasa por los tres datos.',
    criterio:
      'En los nodos el error es exactamente 0: P(1) = 0, P(2) = 0.6931 y P(3) = 1.0986. ' +
      'Fuera de ellos no hay garantía: la única forma de juzgar es comparar contra la función real ' +
      '(acá, ln) o contra una estimación del error.',
    conclusion:
      'El polinomio de interpolación es P(x) = −0.1438x² + 1.1245x − 0.9807. Evaluado en 2.5 da ' +
      'P(2.5) ≈ 0.9318, mientras que el valor real es ln(2.5) ≈ 0.91629. El error absoluto es 0.0155 ' +
      '(1.7 %): una estimación buena para solo tres puntos, y que mejora si se acerca el punto a los nodos.',
    calculo: {
      puntos: [
        { x: 1, y: 0 },
        { x: 2, y: 0.6931 },
        { x: 3, y: 1.0986 },
      ],
      evaluarEn: 2.5,
      etiqueta: 'ln(x) en tres nodos',
    },
  },

  /* ---------------------------------------------------------------- */
  /* Ejemplo de casuística: presión de vapor del agua                 */
  /* ---------------------------------------------------------------- */
  ejemploCasuistica: {
    id: 'lagrange-cas-1',
    titulo: 'Presión de vapor del agua a 115 °C',
    tipo: 'casuistica',
    enunciado:
      'Un ingeniero de procesos necesita la presión de saturación del agua a 115 °C para diseñar un ' +
      'intercambiador. La tabla de vapor disponible solo trae valores cada 10 grados: a 100 °C la ' +
      'presión es 101.3 kPa; a 110 °C, 143.4 kPa; y a 120 °C, 198.5 kPa. Estimar la presión a 115 °C.',
    extraccion: {
      busqueda: 'Se busca la presión P (variable dependiente) en función de la temperatura T.',
      datos: [
        { simbolo: 'T₁', valor: '100 °C', queEs: 'Variable independiente (x) del primer dato.' },
        { simbolo: 'P₁', valor: '101.3 kPa', queEs: 'Variable dependiente (y) del primer dato.' },
        { simbolo: 'T₂, P₂', valor: '110 °C, 143.4 kPa', queEs: 'Segundo punto de la tabla.' },
        { simbolo: 'T₃, P₃', valor: '120 °C, 198.5 kPa', queEs: 'Tercer punto de la tabla.' },
        { simbolo: 'T*', valor: '115 °C', queEs: 'El valor donde se quiere estimar.' },
      ],
      formulacion:
        'Con los tres pares (T, P) se construye el polinomio interpolante P(T) y se evalúa en T = 115. ' +
        'La interpolación es válida porque 115 está ENTRE los datos medidos.',
    },
    planteamiento:
      'Tabla de datos: (T; P) = (100; 101.3), (110; 143.4), (120; 198.5). Se pide P(115).',
    parametros: [
      { etiqueta: 'Datos (T; P)', valor: '(100; 101.3), (110; 143.4), (120; 198.5)' },
      { etiqueta: 'Estimar en', valor: 'T = 115 °C' },
      { etiqueta: 'Grado del polinomio', valor: '2 (hay 3 puntos)' },
    ],
    interpretacion:
      'La presión de vapor crece más rápido que una recta: de 100 a 110 sube 42.1 kPa y de 110 a 120 ' +
      'sube 55.1 kPa. Un polinomio de grado 2 puede capturar esa curvatura, cosa que una regla de tres ' +
      'no hace. Es una extrapolación nula: 115 está en el medio de 110 y 120.',
    pasos: [
      'L₁(T) = (T − 110)(T − 120) / ((100 − 110)(100 − 120)) = (T − 110)(T − 120)/200. En T = 115: L₁ = (5)(−5)/200 = −0.125.',
      'L₂(T) = (T − 100)(T − 120) / ((110 − 100)(110 − 120)) = (T − 100)(T − 120)/(−100). En T = 115: L₂ = (15)(−5)/(−100) = 0.75.',
      'L₃(T) = (T − 100)(T − 110) / ((120 − 100)(120 − 110)) = (T − 100)(T − 110)/200. En T = 115: L₃ = (15)(5)/200 = 0.375.',
      'P(115) = 101.3·(−0.125) + 143.4·(0.75) + 198.5·(0.375) = −12.66 + 107.55 + 74.44 = 169.33 kPa.',
    ],
    algoritmo:
      'Se construye el polinomio de grado 2 que pasa por los tres pares (T, P) y se evalúa en T = 115. ' +
      'Los coeficientes salen de los datos, no se eligen a mano.',
    criterio:
      'El polinomio debe reproducir los tres datos exactamente (P(100) = 101.3, P(110) = 143.4, ' +
      'P(120) = 198.5). Para juzgar la estimación se compara con la tabla de vapor real.',
    conclusion:
      'El polinomio interpolante es P(T) = 0.065T² − 9.44T + 395.3, y P(115) ≈ 169.33 kPa. ' +
      'Las tablas de vapor dan ≈ 169.1 kPa a 115 °C: el error es de 0.2 kPa (0.1 %). Con solo tres ' +
      'puntos se obtuvo una precisión más que suficiente para el diseño, y el cálculo tarda segundos.',
    calculo: {
      puntos: [
        { x: 100, y: 101.3 },
        { x: 110, y: 143.4 },
        { x: 120, y: 198.5 },
      ],
      evaluarEn: 115,
      etiqueta: 'Presión de vapor P(T)',
    },
  },
};

/* ------------------------------------------------------------------ */
/* Ejemplos resueltos (2 numéricos + 2 casuísticas)                    */
/* ------------------------------------------------------------------ */

export const EJEMPLOS_LAGRANGE: EjemploModulo3[] = [
  {
    id: 'lagrange-num-2',
    titulo: 'Interpolar la exponencial eˣ en x = 1.5',
    tipo: 'numerico',
    planteamiento:
      'Se tienen tres valores de eˣ y se pide estimar e^1.5. Comparar con el valor real e^1.5 ≈ 4.48169.',
    parametros: [
      { etiqueta: 'Datos', valor: '(0; 1), (1; 2.7183), (2; 7.3891)' },
      { etiqueta: 'Estimar en', valor: 'x = 1.5' },
      { etiqueta: 'Grado', valor: '2' },
    ],
    interpretacion:
      'La exponencial crece cada vez más rápido, así que un polinomio de grado 2 no será exacto, ' +
      'pero el error se puede medir porque conocemos la función real.',
    pasos: [
      'L₁(1.5) = (1.5 − 1)(1.5 − 2)/((0 − 1)(0 − 2)) = (0.5)(−0.5)/2 = −0.125.',
      'L₂(1.5) = (1.5 − 0)(1.5 − 2)/((1 − 0)(1 − 2)) = (1.5)(−0.5)/(−1) = 0.75.',
      'L₃(1.5) = (1.5 − 0)(1.5 − 1)/((2 − 0)(2 − 1)) = (1.5)(0.5)/2 = 0.375.',
      'P(1.5) = 1·(−0.125) + 2.7183·(0.75) + 7.3891·(0.375) = −0.125 + 2.0387 + 2.7709 = 4.6846.',
    ],
    algoritmo: 'Se arman las bases y se suman los aportes, igual que en el ejemplo de la teoría.',
    criterio: 'Pasa por los tres datos; el error se mide contra eˣ, que conocemos.',
    conclusion:
      'P(x) = 1.47625x² + 0.24205x + 1 y P(1.5) ≈ 4.6846. El valor real es e^1.5 = 4.48169, ' +
      'así que el error absoluto es 0.2029 (4.5 %). Interpolar con 3 puntos una función que crece ' +
      'tan rápido no es gratis: conviene agregar un nodo cerca de 1.5 o usar más puntos.',
    calculo: {
      puntos: [
        { x: 0, y: 1 },
        { x: 1, y: 2.7183 },
        { x: 2, y: 7.3891 },
      ],
      evaluarEn: 1.5,
      etiqueta: 'eˣ en tres nodos',
    },
  },

  {
    id: 'lagrange-num-3',
    titulo: 'Interpolar una progresión 3ˣ con cuatro nodos',
    tipo: 'numerico',
    planteamiento:
      'Se tabula y = 3ˣ en x = 0, 1, 2, 3 y se quiere estimar el valor en x = 1.5. El valor real es ' +
      '3^1.5 ≈ 5.19615.',
    parametros: [
      { etiqueta: 'Datos', valor: '(0; 1), (1; 3), (2; 9), (3; 27)' },
      { etiqueta: 'Estimar en', valor: 'x = 1.5' },
      { etiqueta: 'Grado', valor: '3' },
    ],
    interpretacion:
      'Con un punto más, el polinomio sube a grado 3. La pregunta interesante es si el error baja: ' +
      'la exponencial no es un polinomio, así que el error no desaparece, solo se redistribuye.',
    pasos: [
      'L₁(1.5) = (0.5)(−0.5)(−1.5) / ((−1)(−2)(−3)) = 0.375/(−6) = −0.0625.',
      'L₂(1.5) = (1.5)(−0.5)(−1.5) / ((1)(−1)(−2)) = 1.125/2 = 0.5625.',
      'L₃(1.5) = (1.5)(0.5)(−1.5) / ((2)(1)(−1)) = −1.125/(−2) = 0.5625.',
      'L₄(1.5) = (1.5)(0.5)(−0.5) / ((3)(2)(1)) = −0.375/6 = −0.0625.',
      'P(1.5) = 1·(−0.0625) + 3·(0.5625) + 9·(0.5625) + 27·(−0.0625) = −0.0625 + 1.6875 + 5.0625 − 1.6875 = 5.',
    ],
    algoritmo:
      'Misma receta con cuatro bases. El polinomio resultante es de grado 3 y cumple los cuatro datos.',
    criterio:
      'El error en los nodos es 0. El error de interpolación se estima con la cuarta derivada de 3ˣ ' +
      '(que es (ln3)⁴·3^ξ) y el producto de las distancias a los nodos.',
    conclusion:
      'P(x) = 1.333333x³ − 2x² + 2.666667x + 1 y P(1.5) = 5 exactamente. El valor real es 3^1.5 ≈ 5.19615, ' +
      'con un error de 0.1962 (3.8 %). Lección: agregar un punto mejora el polinomio en los nodos, pero no ' +
      'garantiza que el error entre ellos baje si la función no se parece a un polinomio.',
    calculo: {
      puntos: [
        { x: 0, y: 1 },
        { x: 1, y: 3 },
        { x: 2, y: 9 },
        { x: 3, y: 27 },
      ],
      evaluarEn: 1.5,
      etiqueta: '3ˣ en cuatro nodos',
    },
  },

  {
    id: 'lagrange-cas-2',
    titulo: 'Densidad del agua cerca de los 4 °C',
    tipo: 'casuistica',
    enunciado:
      'Un laboratorio mide la densidad del agua a distintas temperaturas para calibrar un densímetro. ' +
      'Los datos son: 0 °C → 999.87 kg/m³; 4 °C → 1000.00 kg/m³; 10 °C → 999.70 kg/m³; y 20 °C → 998.21 kg/m³. ' +
      'Se necesita la densidad a 7 °C.',
    extraccion: {
      busqueda: 'Se busca la densidad ρ en función de la temperatura T.',
      datos: [
        { simbolo: 'T', valor: '0, 4, 10, 20 °C', queEs: 'Variable independiente.' },
        { simbolo: 'ρ', valor: '999.87, 1000.00, 999.70, 998.21 kg/m³', queEs: 'Variable dependiente.' },
        { simbolo: 'T*', valor: '7 °C', queEs: 'Temperatura donde se quiere estimar.' },
      ],
      formulacion:
        'Se arma el polinomio ρ(T) de grado 3 con los cuatro pares (T, ρ) y se evalúa en T = 7 °C, ' +
        'un valor entre 4 y 10 °C.',
    },
    planteamiento: 'Datos (T; ρ): (0; 999.87), (4; 1000.00), (10; 999.70), (20; 998.21). Se pide ρ(7).',
    parametros: [
      { etiqueta: 'Datos (T; ρ)', valor: '(0; 999.87), (4; 1000), (10; 999.7), (20; 998.21)' },
      { etiqueta: 'Estimar en', valor: 'T = 7 °C' },
      { etiqueta: 'Grado', valor: '3' },
    ],
    interpretacion:
      'La densidad tiene un máximo cerca de 4 °C. Interpolar en 7 °C es delicado: el máximo está ' +
      'dentro del intervalo y el polinomio puede desplazarlo un poco. Sin embargo, 7 °C está entre ' +
      '4 y 10, así que la interpolación sigue siendo la herramienta correcta.',
    pasos: [
      'L₁(7) = (7−4)(7−10)(7−20) / ((0−4)(0−10)(0−20)) = (3)(−3)(−13)/(−800) = 117/(−800) = −0.146250.',
      'L₂(7) = (7−0)(7−10)(7−20) / ((4−0)(4−10)(4−20)) = (7)(−3)(−13)/(4·−6·−16) = 273/384 = 0.710938.',
      'L₃(7) = (7−0)(7−4)(7−20) / ((10−0)(10−4)(10−20)) = (7)(3)(−13)/(10·6·−10) = −273/(−600) = 0.455.',
      'L₄(7) = (7−0)(7−4)(7−10) / ((20−0)(20−4)(20−10)) = (7)(3)(−3)/(20·16·10) = −63/3200 = −0.019688.',
      'ρ(7) = 999.87·(−0.146250) + 1000·(0.710938) + 999.70·(0.455) + 998.21·(−0.019688) = 999.9178 kg/m³.',
    ],
    algoritmo:
      'Cuatro bases de grado 3, cada una anulada en los otros tres nodos. La suma de los aportes da ρ(T).',
    criterio:
      'Debe reproducir los cuatro datos medidos. La comparación con las tablas oficiales de densidad ' +
      'del agua (ρ(7 °C) ≈ 999.9029 kg/m³) permite cuantificar el error.',
    conclusion:
      'El polinomio interpolante es ρ(T) = 0.000103T³ − 0.009694T² + 0.069625T + 999.87 y ρ(7) ≈ 999.9178 kg/m³. ' +
      'Las tablas dan ≈ 999.9029 kg/m³; el error es 0.015 kg/m³ (0.0015 %), excelente para un densímetro. ' +
      'Para valores muy cerca del máximo conviene tabular más fino en vez de confiar en el polinomio.',
    calculo: {
      puntos: [
        { x: 0, y: 999.87 },
        { x: 4, y: 1000 },
        { x: 10, y: 999.7 },
        { x: 20, y: 998.21 },
      ],
      evaluarEn: 7,
      etiqueta: 'Densidad del agua ρ(T)',
    },
  },

  {
    id: 'lagrange-cas-3',
    titulo: 'Viscosidad del agua a 35 °C',
    tipo: 'casuistica',
    enunciado:
      'En un estudio de pérdida de carga en tuberías se conoce la viscosidad dinámica del agua a 20, 30 y 40 °C: ' +
      '1.002, 0.7978 y 0.6531 mPa·s. Se necesita el valor a 35 °C para completar una tabla.',
    extraccion: {
      busqueda: 'Se busca la viscosidad μ en función de la temperatura T.',
      datos: [
        { simbolo: 'T', valor: '20, 30, 40 °C', queEs: 'Variable independiente.' },
        { simbolo: 'μ', valor: '1.002, 0.7978, 0.6531 mPa·s', queEs: 'Variable dependiente.' },
        { simbolo: 'T*', valor: '35 °C', queEs: 'Valor donde se estima.' },
      ],
      formulacion: 'Polinomio μ(T) de grado 2 con los tres pares y evaluación en T = 35 °C.',
    },
    planteamiento: 'Datos (T; μ): (20; 1.002), (30; 0.7978), (40; 0.6531). Se pide μ(35).',
    parametros: [
      { etiqueta: 'Datos (T; μ)', valor: '(20; 1.002), (30; 0.7978), (40; 0.6531)' },
      { etiqueta: 'Estimar en', valor: 'T = 35 °C' },
      { etiqueta: 'Grado', valor: '2' },
    ],
    interpretacion:
      'La viscosidad cae rápido y de forma decreciente. Como 35 °C está entre 30 y 40, interpolar da ' +
      'una estimación fiable; extrapolar por debajo de 20 o arriba de 40 sería riesgoso.',
    pasos: [
      'L₁(35) = (35−30)(35−40) / ((20−30)(20−40)) = (5)(−5)/200 = −0.125.',
      'L₂(35) = (35−20)(35−40) / ((30−20)(30−40)) = (15)(−5)/(−100) = 0.75.',
      'L₃(35) = (35−20)(35−30) / ((40−20)(40−30)) = (15)(5)/200 = 0.375.',
      'μ(35) = 1.002·(−0.125) + 0.7978·(0.75) + 0.6531·(0.375) = −0.1253 + 0.5984 + 0.2449 = 0.7180 mPa·s.',
    ],
    algoritmo: 'Tres bases de grado 2 y suma de aportes.',
    criterio: 'Reproduce los tres datos. Se compara con la tabla real de viscosidad del agua a 35 °C (≈ 0.7194 mPa·s).',
    conclusion:
      'μ(T) = 0.000298T² − 0.035295T + 1.5889 y μ(35) ≈ 0.7180 mPa·s, frente a 0.7194 mPa·s de la tabla ' +
      'real: error de 0.0014 mPa·s (0.2 %). Suficiente para el cálculo de pérdidas de carga.',
    calculo: {
      puntos: [
        { x: 20, y: 1.002 },
        { x: 30, y: 0.7978 },
        { x: 40, y: 0.6531 },
      ],
      evaluarEn: 35,
      etiqueta: 'Viscosidad del agua μ(T)',
    },
  },
];

/* ------------------------------------------------------------------ */
/* Autoevaluación (3 numéricos + 3 casuísticas)                        */
/* ------------------------------------------------------------------ */

export const EJERCICIOS_LAGRANGE: EjercicioModulo3[] = [
  {
    id: 'lagrange-ej-num-1',
    titulo: 'Ejercicio 1 · Raíz cuadrada',
    tipo: 'numerico',
    planteamiento: 'Con los puntos (0; 0), (1; 1) y (4; 2), estimar el valor en x = 2.25 y comparar con √2.25 = 1.5.',
    parametros: [
      { etiqueta: 'Datos', valor: '(0; 0), (1; 1), (4; 2)' },
      { etiqueta: 'Estimar en', valor: 'x = 2.25' },
    ],
    pista: 'Los nodos están separados de forma desigual (1 y 3 unidades). Las distancias entran en las bases.',
    interpretacion: 'Datos tomados de √x. Al no ser equidistantes, conviene mirar con cuidado el aporte de cada base.',
    pasos: [
      'L₁(2.25) = (2.25−1)(2.25−4) / ((0−1)(0−4)) = (1.25)(−1.75)/4 = −0.546875.',
      'L₂(2.25) = (2.25−0)(2.25−4) / ((1−0)(1−4)) = (2.25)(−1.75)/(−3) = 1.3125.',
      'L₃(2.25) = (2.25−0)(2.25−1) / ((4−0)(4−1)) = (2.25)(1.25)/12 = 0.234375.',
      'P(2.25) = 0·(−0.546875) + 1·(1.3125) + 2·(0.234375) = 0 + 1.3125 + 0.46875 = 1.78125.',
    ],
    algoritmo: 'Tres bases de grado 2, ponderadas por yᵢ y sumadas.',
    criterio: 'Error en los nodos igual a 0; comparación contra la función real √x.',
    conclusion:
      'P(x) = −0.166667x² + 1.166667x y P(2.25) = 1.78125, contra √2.25 = 1.5. El error es 0.28125 (18.8 %): ' +
      'ejemplo claro de que un polinomio puede pasar por los datos y aun así alejarse bastante de la función entre ellos.',
    calculo: {
      puntos: [
        { x: 0, y: 0 },
        { x: 1, y: 1 },
        { x: 4, y: 2 },
      ],
      evaluarEn: 2.25,
      etiqueta: '√x en tres nodos',
    },
  },

  {
    id: 'lagrange-ej-num-2',
    titulo: 'Ejercicio 2 · Polinomio exacto',
    tipo: 'numerico',
    planteamiento: 'Dados los puntos (1; 2), (2; 5) y (3; 10), estimar el valor en x = 2.5. ¿Qué polinomio se obtiene?',
    parametros: [
      { etiqueta: 'Datos', valor: '(1; 2), (2; 5), (3; 10)' },
      { etiqueta: 'Estimar en', valor: 'x = 2.5' },
    ],
    pista: 'Fijate si los datos responden a una fórmula sencilla: 1²+1, 2²+1, 3²+1…',
    interpretacion: 'Acá los datos vienen de un polinomio de grado 2, así que la interpolación lo recupera EXACTO.',
    pasos: [
      'L₁(2.5) = (2.5−2)(2.5−3) / ((1−2)(1−3)) = (0.5)(−0.5)/2 = −0.125.',
      'L₂(2.5) = (2.5−1)(2.5−3) / ((2−1)(2−3)) = (1.5)(−0.5)/(−1) = 0.75.',
      'L₃(2.5) = (2.5−1)(2.5−2) / ((3−1)(3−2)) = (1.5)(0.5)/2 = 0.375.',
      'P(2.5) = 2·(−0.125) + 5·(0.75) + 10·(0.375) = −0.25 + 3.75 + 3.75 = 7.25.',
    ],
    algoritmo: 'Tres bases y suma de aportes.',
    criterio: 'Al venir de x² + 1, el error de interpolación es 0 en todo el rango (no solo en los nodos).',
    conclusion:
      'P(x) = x² + 1 y P(2.5) = 7.25, que es exactamente 2.5² + 1. Cuando los datos son de grado ≤ n, ' +
      'la interpolación no solo acierta en los nodos: reproduce la función en todos los puntos.',
    calculo: {
      puntos: [
        { x: 1, y: 2 },
        { x: 2, y: 5 },
        { x: 3, y: 10 },
      ],
      evaluarEn: 2.5,
      etiqueta: 'x² + 1 en tres nodos',
    },
  },

  {
    id: 'lagrange-ej-num-3',
    titulo: 'Ejercicio 3 · Coseno',
    tipo: 'numerico',
    planteamiento: 'Con (0; 1), (1; 0.5403) y (2; −0.4161), estimar cos(1.5), sabiendo que el valor real es 0.07074.',
    parametros: [
      { etiqueta: 'Datos', valor: '(0; 1), (1; 0.5403), (2; −0.4161)' },
      { etiqueta: 'Estimar en', valor: 'x = 1.5' },
    ],
    pista: 'La función real pasa de crecer a decrecer: fijate si el polinomio captura ese cambio.',
    interpretacion: 'cos(x) tiene curvatura; con tres puntos el polinomio la aproxima pero no la reproduce.',
    pasos: [
      'L₁(1.5) = (1.5−1)(1.5−2) / ((0−1)(0−2)) = (0.5)(−0.5)/2 = −0.125.',
      'L₂(1.5) = (1.5−0)(1.5−2) / ((1−0)(1−2)) = (1.5)(−0.5)/(−1) = 0.75.',
      'L₃(1.5) = (1.5−0)(1.5−1) / ((2−0)(2−1)) = (1.5)(0.5)/2 = 0.375.',
      'P(1.5) = 1·(−0.125) + 0.5403·(0.75) + (−0.4161)·(0.375) = −0.125 + 0.4052 − 0.1560 = 0.1242.',
    ],
    algoritmo: 'Tres bases y suma de aportes.',
    criterio: 'Error en los nodos 0. Se compara con cos(1.5) = 0.07074.',
    conclusion:
      'P(x) = −0.24835x² − 0.21135x + 1 y P(1.5) ≈ 0.1242, contra cos(1.5) = 0.07074. ' +
      'El error es 0.0535 (76 % del valor real). Sirve para recordar que un error pequeño en valor absoluto ' +
      'puede ser enorme en términos relativos cuando el resultado verdadero está cerca de cero.',
    calculo: {
      puntos: [
        { x: 0, y: 1 },
        { x: 1, y: 0.5403 },
        { x: 2, y: -0.4161 },
      ],
      evaluarEn: 1.5,
      etiqueta: 'cos(x) en tres nodos',
    },
  },

  {
    id: 'lagrange-ej-cas-1',
    titulo: 'Ejercicio 4 · Altura de la marea',
    tipo: 'casuistica',
    enunciado:
      'La altura del agua en un muelle se midió cada 2 horas: a las 2 h, 1.2 m; a las 4 h, 2.6 m; a las 6 h, 1.4 m. ' +
      'Se quiere saber la altura a las 5 h para decidir si un bote puede amarrar.',
    extraccion: {
      busqueda: 'Se busca la altura h en función del tiempo t.',
      datos: [
        { simbolo: 't', valor: '2, 4, 6 h', queEs: 'Hora de la medición (variable independiente).' },
        { simbolo: 'h', valor: '1.2, 2.6, 1.4 m', queEs: 'Altura del agua (variable dependiente).' },
        { simbolo: 't*', valor: '5 h', queEs: 'Hora donde se necesita la altura.' },
      ],
      formulacion: 'Polinomio h(t) de grado 2 con los tres pares y evaluación en t = 5 h.',
    },
    planteamiento: 'Datos (t; h): (2; 1.2), (4; 2.6), (6; 1.4). Se pide h(5).',
    parametros: [
      { etiqueta: 'Datos (t; h)', valor: '(2; 1.2), (4; 2.6), (6; 1.4)' },
      { etiqueta: 'Estimar en', valor: 't = 5 h' },
    ],
    pista: 'La marea sube y baja: esperá una parábola con el máximo cerca de las 4 h.',
    interpretacion:
      'La marea no es lineal: hay una creciente y una bajante. El vértice del polinomio cae cerca de la ' +
      'pleamar medida a las 4 h.',
    pasos: [
      'L₁(5) = (5−4)(5−6) / ((2−4)(2−6)) = (1)(−1)/8 = −0.125.',
      'L₂(5) = (5−2)(5−6) / ((4−2)(4−6)) = (3)(−1)/(−4) = 0.75.',
      'L₃(5) = (5−2)(5−4) / ((6−2)(6−4)) = (3)(1)/8 = 0.375.',
      'h(5) = 1.2·(−0.125) + 2.6·(0.75) + 1.4·(0.375) = −0.15 + 1.95 + 0.525 = 2.325 m.',
    ],
    algoritmo: 'Tres bases y suma de aportes.',
    criterio: 'Reproduce las tres mediciones. La interpolación es válida porque 5 h está entre 4 y 6 h.',
    conclusion:
      'h(t) = −0.325t² + 2.65t − 2.8 y h(5) ≈ 2.325 m. Como la pleamar fue de 2.6 m a las 4 h, a las 5 h ' +
      'el agua ya bajó: con 2.325 m el bote amarra sin problema si necesita 2 m.',
    calculo: {
      puntos: [
        { x: 2, y: 1.2 },
        { x: 4, y: 2.6 },
        { x: 6, y: 1.4 },
      ],
      evaluarEn: 5,
      etiqueta: 'Altura de la marea h(t)',
    },
  },

  {
    id: 'lagrange-ej-cas-2',
    titulo: 'Ejercicio 5 · Consumo de combustible',
    tipo: 'casuistica',
    enunciado:
      'Un ensayo de consumo dio: a 40 km/h, 12.5 L/100 km; a 60 km/h, 10.2 L/100 km; a 80 km/h, 9.4 L/100 km. ' +
      'Se necesita el consumo estimado a 70 km/h.',
    extraccion: {
      busqueda: 'Se busca el consumo c en función de la velocidad v.',
      datos: [
        { simbolo: 'v', valor: '40, 60, 80 km/h', queEs: 'Velocidad (variable independiente).' },
        { simbolo: 'c', valor: '12.5, 10.2, 9.4 L/100 km', queEs: 'Consumo (variable dependiente).' },
        { simbolo: 'v*', valor: '70 km/h', queEs: 'Velocidad donde se estima.' },
      ],
      formulacion: 'Polinomio c(v) de grado 2 con los tres pares y evaluación en v = 70 km/h.',
    },
    planteamiento: 'Datos (v; c): (40; 12.5), (60; 10.2), (80; 9.4). Se pide c(70).',
    parametros: [
      { etiqueta: 'Datos (v; c)', valor: '(40; 12.5), (60; 10.2), (80; 9.4)' },
      { etiqueta: 'Estimar en', valor: 'v = 70 km/h' },
    ],
    pista: 'El consumo baja más rápido a baja velocidad: la parábola tiene la curvatura justa.',
    interpretacion:
      'El consumo mejora al aumentar la velocidad en este rango, pero cada vez menos. La interpolación ' +
      'permite estimar el valor exacto a 70 km/h sin volver al banco de pruebas.',
    pasos: [
      'L₁(70) = (70−60)(70−80) / ((40−60)(40−80)) = (10)(−10)/800 = −0.125.',
      'L₂(70) = (70−40)(70−80) / ((60−40)(60−80)) = (30)(−10)/(−400) = 0.75.',
      'L₃(70) = (70−40)(70−60) / ((80−40)(80−60)) = (30)(10)/800 = 0.375.',
      'c(70) = 12.5·(−0.125) + 10.2·(0.75) + 9.4·(0.375) = −1.5625 + 7.65 + 3.525 = 9.6125 L/100 km.',
    ],
    algoritmo: 'Tres bases y suma de aportes.',
    criterio: 'Reproduce los tres ensayos; 70 km/h está dentro del rango medido.',
    conclusion:
      'c(v) = 0.001875v² − 0.3025v + 21.6 y c(70) ≈ 9.61 L/100 km. Extrapolar a 120 km/h con este mismo ' +
      'polinomio daría un consumo que baja indefinidamente, lo cual es falso: fuera del rango medido el modelo deja de valer.',
    calculo: {
      puntos: [
        { x: 40, y: 12.5 },
        { x: 60, y: 10.2 },
        { x: 80, y: 9.4 },
      ],
      evaluarEn: 70,
      etiqueta: 'Consumo c(v)',
    },
  },

  {
    id: 'lagrange-ej-cas-3',
    titulo: 'Ejercicio 6 · Caudal de un río',
    tipo: 'casuistica',
    enunciado:
      'Para una estación hidrológica se conoce el caudal en función de la altura de la regla: ' +
      '1.0 m → 2.8 m³/s; 1.5 m → 5.1 m³/s; 2.0 m → 8.4 m³/s. Estimar el caudal cuando la regla marca 1.75 m.',
    extraccion: {
      busqueda: 'Se busca el caudal Q en función de la altura h.',
      datos: [
        { simbolo: 'h', valor: '1.0, 1.5, 2.0 m', queEs: 'Altura de la regla (variable independiente).' },
        { simbolo: 'Q', valor: '2.8, 5.1, 8.4 m³/s', queEs: 'Caudal (variable dependiente).' },
        { simbolo: 'h*', valor: '1.75 m', queEs: 'Altura donde se estima.' },
      ],
      formulacion: 'Polinomio Q(h) de grado 2 con los tres pares y evaluación en h = 1.75 m.',
    },
    planteamiento: 'Datos (h; Q): (1.0; 2.8), (1.5; 5.1), (2.0; 8.4). Se pide Q(1.75).',
    parametros: [
      { etiqueta: 'Datos (h; Q)', valor: '(1; 2.8), (1.5; 5.1), (2; 8.4)' },
      { etiqueta: 'Estimar en', valor: 'h = 1.75 m' },
    ],
    pista: 'El espaciado es 0.5 m. Cuidado con las distancias en las bases: 0.75 y 0.25.',
    interpretacion:
      'El caudal crece más que proporcionalmente con la altura. Un polinomio de grado 2 captura esa ' +
      'tendencia, y la interpolación es segura porque 1.75 m está entre los datos.',
    pasos: [
      'L₁(1.75) = (1.75−1.5)(1.75−2) / ((1−1.5)(1−2)) = (0.25)(−0.25)/0.5 = −0.125.',
      'L₂(1.75) = (1.75−1)(1.75−2) / ((1.5−1)(1.5−2)) = (0.75)(−0.25)/(−0.25) = 0.75.',
      'L₃(1.75) = (1.75−1)(1.75−1.5) / ((2−1)(2−1.5)) = (0.75)(0.25)/0.5 = 0.375.',
      'Q(1.75) = 2.8·(−0.125) + 5.1·(0.75) + 8.4·(0.375) = −0.35 + 3.825 + 3.15 = 6.625 m³/s.',
    ],
    algoritmo: 'Tres bases de grado 2 y suma de aportes.',
    criterio: 'Reproduce las tres mediciones; se puede validar con una medición real a 1.75 m.',
    conclusion:
      'Q(h) = 2h² − 0.4h + 1.2 y Q(1.75) ≈ 6.63 m³/s. Con esa altura la estación puede emitir el aviso ' +
      'de caudal con una precisión adecuada para la gestión del recurso.',
    calculo: {
      puntos: [
        { x: 1, y: 2.8 },
        { x: 1.5, y: 5.1 },
        { x: 2, y: 8.4 },
      ],
      evaluarEn: 1.75,
      etiqueta: 'Caudal Q(h)',
    },
  },
];
