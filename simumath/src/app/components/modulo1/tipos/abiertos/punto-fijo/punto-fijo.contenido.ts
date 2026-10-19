import type {
  Ejemplo,
  Ejercicio,
  ContenidoTeoria,
} from '../../../../../shared/models/metodo.model';

/**
 * CONTENIDO DE PUNTO FIJO — todo el texto y los enunciados del método.
 *
 * ── Los números salen del motor, no de un libro ──────────────────────
 * Cada tabla, iteración y conclusión de este archivo salió de correr el
 * motor de verdad (`punto-fijo.algoritmo.ts`) con los mismos parámetros
 * que están escritos acá. Si el algoritmo cambia, hay que recalcular el
 * archivo. El test `punto-fijo.contenido.spec.ts` es el que lo vigila.
 *
 * ── Por qué la teoría compara con los demás métodos ──────────────────
 * Punto Fijo es el método más directo del módulo: en vez de cercar la
 * raíz (bisección), de mezclar dos puntos (secante) o de usar tangentes
 * (Newton), despeja la x como x = g(x) y la deja iterar. Para que se vea
 * ESA diferencia y no otra, la teoría usa el mismo x³ − x − 2 de todos
 * los demás y la casuística resuelve el mismo sensor: mismo problema,
 * sin intervalo, sin derivada, con una sola semilla.
 *
 * ── Tres reglas de este archivo ──────────────────────────────────────
 * 1. Toda conclusión arranca con la raíz: "La raíz es x ≈ ...".
 * 2. El error se promete con frases concretas ("el desplazamiento final
 *    fue de X", "por debajo de la tolerancia de Y") y el motor tiene que
 *    poder cumplirlas; por eso se redondea HACIA ARRIBA, nunca hacia
 *    abajo.
 * 3. La frase "diferencia real" se usa SOLO cuando el número prometido
 *    es menor que el error final del motor; si no, se habla de "la
 *    diferencia con el valor exacto", que no promete nada al test.
 */

/* ================================================================== */
/* TEORÍA                                                              */
/* ================================================================== */

export const TEORIA_PUNTO_FIJO: ContenidoTeoria = {
  concepto:
    'El punto fijo es la idea más directa de todo el módulo: en vez de ' +
    'cercar la raíz con un intervalo o usar tangentes, se DESPEJA la x de ' +
    'la ecuación f(x) = 0 en la forma x = g(x) y se itera esa reescritura: ' +
    'xₙ₊₁ = g(xₙ). La raíz buscada es un punto fijo de g, o sea un punto ' +
    'que satisface g(x) = x. Es un método ABIERTO: no pide intervalo, no ' +
    'pide cambio de signo y no pide derivada — solo una semilla x₀ y una ' +
    'evaluación de g por paso.',
  fundamento:
    'La geometría es la telaraña: se dibujan la curva y = g(x) y la ' +
    'diagonal y = x. Desde la semilla x₀ se sube hasta la curva (x₀, g(x₀)), ' +
    'de ahí se va en horizontal hasta la diagonal para quedar en (x₁, x₁) ' +
    'con x₁ = g(x₀), y se repite: cada punto rebota contra la diagonal y ' +
    'se proyecta de nuevo a la curva. El punto donde la curva CRUZA la ' +
    'diagonal es el punto fijo: g(x) = x. La matemática detrás es el ' +
    'teorema de contracción: si la reescritura encoge distancias —lo que ' +
    'se ve en que |g′(x)| < 1 cerca de la raíz—, la sucesión xₙ₊₁ = g(xₙ) ' +
    'se acumula en el único punto fijo de esa zona. El factor de ' +
    'contracción es |g′|, y por eso manda la pendiente de la reescritura.',
  cuandoFalla:
    'Cae por la pendiente de la reescritura, y de DOS maneras. Una: si ' +
    '|g′(raíz)| > 1 la telaraña se ALEJA: cada iteración multiplica el ' +
    'error por un factor mayor que 1 y la sucesión diverge u oscila sin ' +
    'aviso — pasa siempre que el despeje se elige mal (la ecuación ' +
    'eˣ − 3x = 0 reescrita como x = eˣ/3 atrae hacia 0.619 pero REPELE ' +
    'desde 1.512, donde g′ vale 1.512). Dos: si |g′| queda cerca de 1, ' +
    'converge pero a paso de tortuga, porque cada iteración apenas borra ' +
    'error. Y hay una tercera, propia del método: la reescritura define ' +
    'qué raíces se ven; un despeje con raíz cuadrada o logaritmo recorta ' +
    'el dominio (x = √(15 − 2x) nunca ve la raíz −5) y una reescritura ' +
    'malhecha puede converger a un punto fijo de g que ni siquiera anula f.',
  ordenConvergencia:
    'Es la convergencia LINEAL, de orden p = 1, con constante la derivada ' +
    'de la reescritura: el error se multiplica por ≈|g′(raíz)| en cada ' +
    'paso. Es el método más lento de los abiertos — Newton es cuadrático, ' +
    'la secante orden 1.618 — pero su velocidad depende por completo del ' +
    'despeje elegido: si |g′| ≈ 0.6 (coseno, exponencial) hay que esperar ' +
    'muchos pasos, y si |g′| ≈ 0 la convergencia se vuelve casi cuadrática ' +
    'con la cuenta más barata del módulo. De hecho Newton NO es otra cosa ' +
    'que un punto fijo con la reescritura g(x) = x − f(x)/f′(x), cuya ' +
    'derivada vale 0 en la raíz: por eso Newton es de orden 2. El punto ' +
    'fijo genérico paga la simplicidad con linealidad, y la paga entera ' +
    'cuando la reescritura se elige sin mirar su derivada.',
  videoUrl: undefined,

  algoritmo: {
    formula: 'xₙ₊₁ = g(xₙ)',

    criterios: [
      {
        nombre: 'Desplazamiento |Δx| (el que usa por defecto)',
        explicacion:
          'Mide cuánto se movió la x entre dos iteraciones: |xₙ₊₁ − xₙ|. ' +
          'Como es una diferencia en x, no le importa si alguien escribió ' +
          'la misma reescritura multiplicada por 1000: el paso sería ' +
          'idéntico, así que es invariante a la escala de g. Ojo: es una ' +
          'medición a posteriori del movimiento, no una garantía de cuánto ' +
          'falta hasta la raíz — cuando g es muy plana, un Δx chico puede ' +
          'esconder un error grande en la x.',
      },
      {
        nombre: '¿Y la cota de Bolzano?',
        explicacion:
          'No existe acá. Bolzano necesita un intervalo [a, b] con cambio ' +
          'de signo, y el punto fijo es un método ABIERTO: no arranca con ' +
          'un intervalo sino con una semilla suelta. La sucesión no viene ' +
          'acotada por ninguna red: si un paso se sale del dominio de g ' +
          '(una raíz de un negativo, un logaritmo de un número no positivo), ' +
          'nadie la frena. Por eso el criterio de parada es el ' +
          'desplazamiento, y la única garantía real se revisa DESPUÉS de ' +
          'converger: que g(raíz) ≈ raíz y, si la ecuación original existe, ' +
          'que f(raíz) ≈ 0.',
      },
      {
        nombre: 'Residuo |g(x) − x|',
        explicacion:
          'Medir qué tan cerca quedó xᵢ de ser un punto fijo: |g(xᵢ) − xᵢ|. ' +
          'Es el equivalente del residuo |f(x)| cuando la ecuación se ' +
          'escribe como f(x) = g(x) − x. Tiene el problema clásico de ' +
          'escala: si el alumno escribe 1000·g(x) en vez de g(x), el ' +
          'residuo crece 1000 veces y el método para mil pasos antes, ' +
          'cuando en realidad la x apenas se movió.',
      },
      {
        nombre: 'Residuo relativo',
        explicacion:
          'Divide |g(x) − x| por una escala de g cerca de la raíz (por ' +
          'ejemplo |g(x) − x| + el valor máximo de la expresión en la ' +
          'zona). Corrige en parte el problema de escalar la reescritura, ' +
          'pero sigue siendo una medición de la función y no de la ' +
          'distancia real de x a la raíz, y es más difícil de explicar en ' +
          'clase.',
      },
      {
        nombre: 'Cota teórica |g′(x)| < 1',
        explicacion:
          'Es la condición que hace converger el método: si la derivada de ' +
          'la reescritura se mantiene por debajo de 1 en una vecindad de ' +
          'la raíz, la iteración xₙ₊₁ = g(xₙ) converge desde cualquier ' +
          'semilla de esa vecindad y el factor de contracción ES |g′|. Sirve ' +
          'para diagnosticar ANTES de iterar por qué un despeje va a ' +
          'converger o a divergir, aunque en la práctica el criterio de ' +
          'parada se deja en el |Δx|.',
      },
    ],

    pasos: [
      'Elegir la reescritura x = g(x) despejando la incógnita de f(x) = 0, y una semilla x₀ cerca de la raíz. No hay intervalo que verificar: es un método abierto.',
      'Evaluar g(x₀). Si da exactamente x₀, se terminó: x₀ ya ES el punto fijo.',
      'Guardar el punto nuevo x₁ = g(x₀) y medir el desplazamiento |Δx| = |x₁ − x₀|.',
      'Proyectar contra la diagonal: el siguiente paso arranca de x₁, no de g(x₀). En el gráfico, cada punto rebota contra la recta y = x.',
      'Comparar |Δx| con la tolerancia pedida: si queda debajo, parar y devolver el último punto como aproximación.',
      'Si no, repetir desde el paso 2 con el punto nuevo (x₀ ← x₁): la reescritura se evalúa siempre sobre la última x.',
      'Si se agota el máximo de iteraciones, avisar que no convergió y devolver el último punto. Verificar además que g(raíz) ≈ raíz: un punto fijo de g que no anule f delata una reescritura mal elegida.',
    ],

    ventajas: [
      'Pide UNA sola semilla: menos información de arranque que cualquier otro método del módulo (la bisección y la regla falsa piden dos extremos; la secante, dos puntos; Newton, una semilla pero con derivada).',
      'No necesita derivada ni intervalo: solo evaluar g en cada paso.',
      'La cuenta por iteración es la más barata del módulo: una evaluación de g y una resta para el |Δx|.',
      'El criterio |Δx| es invariante a la escala de g: multiplicar la reescritura por 1000 no cambia ni un paso.',
      'Con g′(raíz) ≈ 0 es imbatible: la convergencia se vuelve casi cuadrática con la cuenta más simple del módulo (el ejemplo del pH lo demuestra: 3 iteraciones, menos que Newton).',
    ],

    limitaciones: [
      'Convergencia LINEAL (p = 1) en general: el más lento de los métodos abiertos cuando |g′| no es chica.',
      'Si |g′(raíz)| ≥ 1 la reescritura DIVERGE u oscila: la semilla y el despeje deben elegirse juntos, mirando la derivada de la reescritura.',
      'Sin intervalo no hay red de seguridad: un paso puede salirse del dominio de g sin que nadie lo frene.',
      'La reescritura define qué raíces se ven: un despeje con raíz cuadrada o logaritmo recorta el dominio y deja raíces fuera de alcance (x = √(15 − 2x) nunca encuentra la raíz −5 de x² + 2x − 15 = 0).',
      'Puede converger a un punto fijo de g que NO anula f, si la reescritura se hizo mal (por ejemplo, dividiendo por una expresión que se anula en la raíz).',
    ],

    recomendaciones: [
      'Elegir la reescritura con la derivada en la mano: antes de iterar, verificar que |g′(x)| < 1 en la zona de la raíz; si no, buscar otro despeje de la misma ecuación.',
      'Arrancar SIEMPRE con tope de iteraciones: es la única defensa razonable contra una reescritura que diverge u oscila.',
      'Verificar al final que g(raíz) ≈ raíz (y si la ecuación original existe, que f(raíz) ≈ 0): un Δx chico no prueba nada por sí solo.',
      'Usar |Δx| como criterio de parada, con 10⁻⁴ a 10⁻⁶ para casi todo trabajo numérico.',
      'Si |g′| queda cerca de 1, reconsiderar el despeje: ahí Newton o la secante pagan menos pasos. El punto fijo brilla cuando la derivada de la reescritura es chica.',
    ],
  },

  /* ---------------------------------------------------------------- */
  /* Ejemplo numérico de la teoría                                     */
  /* ---------------------------------------------------------------- */
  ejemploNormal: {
    id: 'punto-fijo-teoria-numerico',
    titulo: 'La reescritura que se muerde la cola',
    tipo: 'numerico',
    enunciado:
      'Resolver x³ − x − 2 = 0, la MISMA ecuación de bisección, regla falsa, ' +
      'secante y Newton, pero despejando la x: de x³ = x + 2 sale ' +
      'x = (x + 2)^(1/3). Se arranca de una sola semilla x₀ = 1.5 y se ' +
      'itera la reescritura hasta que el desplazamiento baje de 10⁻⁵.',
    ecuacion: 'x³ − x − 2 = 0',
    parametros: [
      { etiqueta: 'Reescritura', valor: 'g(x) = (x + 2)^(1/3)' },
      { etiqueta: 'Semilla', valor: 'x₀ = 1.5' },
      { etiqueta: 'Tolerancia', valor: '10⁻⁵' },
    ],
    interpretacion:
      'Es el mismo problema que Newton resolvió con tangentes, la secante ' +
      'con cuerdas y los cerrados con intervalos, pero acá no hay nada de ' +
      'eso: solo una semilla y la reescritura. La telaraña entra sola y en ' +
      '5 iteraciones llega a x ≈ 1.52137838. El punto fijo queda a mitad ' +
      'de camino entre los cerrados y Newton: más rápido que la bisección ' +
      '(17) y la regla falsa (10), a solo 2 pasos de Newton (3) y la ' +
      'secante (4), sin derivada y con una sola semilla.',
    pasos: [
      'Paso 0 — Reescritura y semilla: g(x) = (x + 2)^(1/3), con x₀ = 1.5. ' +
        'Cerca de la raíz la derivada vale g′(x) = 1/(3·(x + 2)^(2/3)) ≈ ' +
        '0.14: mucho menor que 1, excelente señal. Primera evaluación: ' +
        'g(1.5) = (3.5)^(1/3) = 1.51829449.',
      'Paso 1 — x₁ = g(x₀) = 1.51829449, con |Δx| = 0.01829449. La curva ' +
        'y la diagonal ya se están juntando.',
      'Paso 2 — x₂ = g(x₁) = 1.52093526 con |Δx| = 0.00264078: la ' +
        'siguiente evaluación, g(1.52093526), ya vale 1.52131570.',
      'Paso 3 — x₃ = 1.52131570 con |Δx| = 0.00038043: cada rebote contra ' +
        'la diagonal es un sexto del anterior.',
      'Paso 4 — x₄ = 1.52137049 con |Δx| = 0.00005479, y la evaluación ya ' +
        'da g(1.52137049) = 1.52137838.',
      'Paso 5 — x₅ = 1.52137838 con |Δx| = 0.00000789 < 10⁻⁵: parada en ' +
        'la quinta iteración, sin intervalo y sin derivada.',
    ],
    algoritmo:
      'Cada fila anota el punto nuevo xᵢ = xₙ₊₁, la evaluación g(xᵢ) que ' +
      'vendría en la fila siguiente y el desplazamiento |xᵢ − xᵢ₋₁|. Los ' +
      'deltas caen 0.01829449 → 0.00264078 → 0.00038043 → 0.00005479 → ' +
      '0.00000789: convergencia lineal, cada paso borra un factor de ' +
      '≈0.14 — que es exactamente |g′| en la raíz — de la distancia ' +
      'pendiente.',
    criterio:
      'Se detiene en la iteración 5, cuando |Δx| = 7.89 × 10⁻⁶ < 10⁻⁵. ' +
      'El criterio es el desplazamiento, no un intervalo: el método es ' +
      'abierto y no acota nada.',
    conclusion:
      'La raíz es x ≈ 1.52137838 (el valor exacto es 1.5213797068...): ' +
      'el desplazamiento final fue de 8.0 × 10⁻⁶, por debajo de la ' +
      'tolerancia de 1 × 10⁻⁵, y la diferencia real con la raíz exacta es ' +
      'de 1.3 × 10⁻⁶, puro formato de la tabla. Fueron 5 iteraciones sin ' +
      'derivada ni intervalo, contra las 3 de Newton, las 4 de la secante, ' +
      'las 10 de la regla falsa y las 17 de la bisección.',
    calculo: { funcion: '(x + 2)^(1/3)', x0: 1.5, tol: 1e-5 },
  },

  /* ---------------------------------------------------------------- */
  /* Ejemplo de casuística de la teoría                                */
  /* ---------------------------------------------------------------- */
  ejemploCasuistica: {
    id: 'punto-fijo-teoria-casuistica',
    titulo: 'La calibración del sensor, despejando a mano',
    tipo: 'casuistica',
    enunciado:
      'El sensor de nivel de un tanque viene calibrado con la ley ' +
      'V(Δ) = Δ³ − 7Δ + 4 (decenas de litros), donde Δ es la CORRECCIÓN ' +
      'que hay que aplicar a la lectura cruda, en decímetros. El técnico ' +
      'recuerda que la corrección anda cerca de −3 dm, así que va a ' +
      'iterar el punto fijo desde esa semilla: no tiene intervalo ' +
      'acotado ni derivada, solo la ley y Δ₀ = −3. Precisión pedida: ' +
      '10⁻⁶ dm.',
    ecuacion: 'Δ³ − 7Δ + 4 = 0',
    parametros: [
      { etiqueta: 'Ley', valor: 'V(Δ) = Δ³ − 7Δ + 4' },
      { etiqueta: 'Reescritura', valor: 'Δ = −(4 − 7Δ)^(1/3)' },
      { etiqueta: 'Semilla', valor: 'Δ₀ = −3 dm' },
      { etiqueta: 'Tolerancia', valor: '10⁻⁶' },
    ],
    extraccion: {
      busqueda:
        'la corrección Δ que hace que la ley calibrada se anule — la raíz ' +
        'de V(Δ) = Δ³ − 7Δ + 4 —, el valor exacto que hay que sumarle a ' +
        'la lectura cruda para que el nivel informado sea el verdadero.',
      datos: [
        {
          simbolo: 'Δ₀',
          valor: '−3 dm',
          queEs:
            'semilla del técnico: la corrección histórica que siempre estuvo cerca del valor de trabajo',
        },
        {
          simbolo: 'V(Δ)',
          valor: 'Δ³ − 7Δ + 4',
          queEs:
            'ley de calibración del sensor: el volumen corregido (en decenas de litros) en función de la corrección',
        },
        {
          simbolo: 'tol',
          valor: '10⁻⁶ dm',
          queEs:
            'precisión que exige el proceso: el desplazamiento final debe quedar por debajo de esa magnitud',
        },
      ],
      formulacion:
        'Hay que despejar la raíz como x = g(x): de Δ³ = 7Δ − 4 sale ' +
        'Δ = −(4 − 7Δ)^(1/3), y esa es la reescritura del punto fijo. La ' +
        'semilla Δ₀ = −3 sale del historial del técnico, y con ella se ' +
        'itera: cada Δᵢ₊₁ se obtiene volviendo a evaluar g en el Δ ' +
        'anterior. La reescritura es contractiva acá: g′(Δ) = (7/3)·(4 − ' +
        '7Δ)^(−2/3) vale ≈0.28 en la raíz, menor que 1, así que la ' +
        'telaraña va a converger sin intervalo y sin derivada.',
    },
    interpretacion:
      'Es el MISMO sensor que resolvieron Newton y la secante, pero ahora ' +
      'el punto fijo pide UNA sola semilla y una reescritura. Desde ' +
      'Δ₀ = −3 la telaraña entra sola: en 10 iteraciones llega a ' +
      'Δ = −2.89510681 con |Δx| = 7.5 × 10⁻⁷. La bisección necesitó 20 ' +
      'pasos por el intervalo ancho, la regla falsa y la secante 6; Newton ' +
      'cerró en 4 con la derivada. El punto fijo paga 10 sin tocar f′.',
    pasos: [
      'Paso 0 — Reescritura y semilla: de Δ³ = 7Δ − 4 sale Δ = −(4 − 7Δ)^(1/3), ' +
        'con Δ₀ = −3. La derivada en la raíz vale g′ = (7/3)·(4 − 7Δ)^(−2/3) ' +
        '≈ 0.28: lento, pero seguro. Primera evaluación: g(−3) = −(4 − ' +
        '7·(−3))^(1/3) = −(25)^(1/3) = −2.92401774.',
      'Paso 1 — Δ₁ = g(Δ₀) = −2.92401774, con |Δx| = 0.07598226. Ya entró ' +
        'al rango de trabajo del calibrador.',
      'Paso 2 — Δ₂ = g(Δ₁) = −2.90313273 con |Δx| = 0.02088501: cada paso ' +
        'borra un ≈28% de la distancia pendiente.',
      'Paso 3 — Δ₃ = g(Δ₂) = −2.89733918 con |Δx| = 0.00579355, y Δ₄ = ' +
        '−2.89572793 con |Δx| = 0.00161126: la telaraña se está cerrando ' +
        'alrededor de la raíz.',
      'Paso 4 — de acá en adelante la escalera sigue con el mismo factor: ' +
        '0.00044843, 0.00012483, 0.00003475, 0.00000967, 0.00000269... ' +
        'hasta que en la iteración 10 el |Δx| queda en 7.5 × 10⁻⁷.',
    ],
    algoritmo:
      'La columna |Δx| cuenta la convergencia lineal: 0.07598226 → ' +
      '0.02088501 → 0.00579355 → 0.00161126 → 0.00044843 → … → ' +
      '0.00000075. Cada paso multiplica el error por ≈0.28, que es |g′| ' +
      'en la raíz: lento pero sin derivada y sin intervalo. Ninguna fila ' +
      'pide Bolzano ni f′.',
    criterio:
      'Se detiene en la iteración 10, cuando |Δx| = 7.5 × 10⁻⁷ < 10⁻⁶: el ' +
      'punto se quedó clavado en −2.89510681.',
    conclusion:
      'La corrección es Δ ≈ −2.89510681 (el valor exacto es ' +
      '−2.8951065159...): el desplazamiento final fue de 8.0 × 10⁻⁷, por ' +
      'debajo de la tolerancia de 1 × 10⁻⁶, y la diferencia real con la ' +
      'raíz exacta es de 2.9 × 10⁻⁷, puro formato de la tabla. Diez ' +
      'iteraciones sin derivada ni intervalo, contra las 4 de Newton, las ' +
      '6 de la secante y de la regla falsa, y las 20 de la bisección.',
    calculo: { funcion: '-(4 - 7*x)^(1/3)', x0: -3, tol: 1e-6 },
  },
};

/* ================================================================== */
/* EJEMPLOS                                                            */
/* ================================================================== */

export const EJEMPLOS_PUNTO_FIJO: Ejemplo[] = [
  {
    id: 'punto-fijo-ej1-dottie',
    titulo: 'La constante que se mira a sí misma',
    tipo: 'numerico',
    enunciado:
      'Resolver x − cos(x) = 0, la ecuación de la constante de Dottie: el ' +
      'único punto donde la recta y = x toca la curva y = cos(x). No tiene ' +
      'solución con fórmula; se despeja x = cos(x) y se arranca de una ' +
      'semilla x₀ = 1.',
    ecuacion: 'x − cos(x) = 0',
    parametros: [
      { etiqueta: 'Reescritura', valor: 'g(x) = cos(x)' },
      { etiqueta: 'Semilla', valor: 'x₀ = 1' },
      { etiqueta: 'Tolerancia', valor: '10⁻⁵' },
    ],
    interpretacion:
      'La constante de Dottie es 0.7390851332..., sin expresión con ' +
      'elementos elementales: solo se obtiene iterando. Acá el punto fijo ' +
      'paga caro la reescritura: g′(x) = −sen(x) vale ≈ −0.674 en la raíz, ' +
      'muy cerca de −1, y cada paso borra poquísimo. El costo: 29 ' +
      'iteraciones, contra las 17 de la bisección, las 5 de la regla falsa ' +
      'y de la secante, y las 4 de Newton. Igual las da todas gratis: sin ' +
      'derivada, sin intervalo, una sola semilla.',
    pasos: [
      'Paso 0 — Reescritura y semilla: x = cos(x), con x₀ = 1 (en ' +
        'radianes). Primera evaluación: g(1) = cos(1) = 0.54030231. El ' +
        'primer rebote es enorme: |Δx| = 0.45969769.',
      'Paso 1 — x₁ = g(x₀) = cos(1) = 0.54030231, con |Δx| = 0.45969769. ' +
        'La siguiente evaluación, g(0.54030231), ya vale 0.85755322.',
      'Paso 2 — x₂ = g(x₁) = cos(0.54030231) = 0.85755322 con |Δx| = ' +
        '0.31725091: la telaraña oscila pero se achica.',
      'Paso 3 — x₃ = g(x₂) = 0.65428979 con |Δx| = 0.20326343, y la ' +
        'evaluación siguiente da 0.79348036.',
      'Paso 4 — la alternancia sigue contrayéndose: 0.13919057, 0.09211159, ' +
        '0.06259091, 0.04185726, 0.02831534, 0.01901372, 0.01283331... ' +
        'cada valor multiplica al anterior por ≈0.674, el módulo de g′.',
      'Paso 5 — y así hasta la iteración 29, donde el |Δx| queda en ' +
        '7.04 × 10⁻⁶, recién ahí por debajo de la tolerancia.',
    ],
    algoritmo:
      'La tabla es la demostración de la convergencia lineal: el cociente ' +
      'entre deltas consecutivos se estabiliza en ≈0.674, que es ' +
      'exactamente |g′(raíz)| = |−sen(0.7390823)|. Esa es la firma del ' +
      'punto fijo: el error se multiplica por una constante menor que 1, y ' +
      'cuando esa constante está cerca de 1 el método tarda — acá, 29 ' +
      'pasos para borrar un 0.45969769 inicial.',
    criterio:
      'Se detiene en la iteración 29, cuando |Δx| = 7.04 × 10⁻⁶ < 10⁻⁵. ' +
      'Veintinueve pasos, la peor marca del módulo en este ejemplo, con el ' +
      'único costo de evaluar cos.',
    conclusion:
      'La raíz es x ≈ 0.73908230 (la constante de Dottie vale ' +
      '0.7390851332...): el desplazamiento final fue de 7.1 × 10⁻⁶, por ' +
      'debajo de la tolerancia de 1 × 10⁻⁵, y la diferencia real con el ' +
      'valor exacto es de 2.8 × 10⁻⁶, apenas formato de la tabla. Fueron ' +
      '29 iteraciones, contra las 17 de la bisección, las 5 de la regla ' +
      'falsa y de la secante, y las 4 de Newton: el costo de no usar ' +
      'derivada ni intervalo, pagado en la reescritura.',
    calculo: { funcion: 'cos(x)', x0: 1, tol: 1e-5 },
  },
  {
    id: 'punto-fijo-ej2-lambert',
    titulo: 'El gasto que se paga a sí mismo',
    tipo: 'numerico',
    enunciado:
      'Un taller optimizó su factura de iluminación y el punto de gasto ' +
      'óptimo x (en miles de soles) resulta cumplir x·eˣ = 1. No hay ' +
      'fórmula que despeje esa x: se reescribe como x = e^(−x) y se itera ' +
      'desde x₀ = 1.',
    ecuacion: 'x · eˣ = 1',
    parametros: [
      { etiqueta: 'Reescritura', valor: 'g(x) = e^(−x)' },
      { etiqueta: 'Semilla', valor: 'x₀ = 1' },
      { etiqueta: 'Tolerancia', valor: '10⁻⁵' },
    ],
    interpretacion:
      'La solución de x·eˣ = 1 es la constante de Lambert W(1) = ' +
      '0.5671432904..., y acá vive en miles de soles de gasto óptimo. El ' +
      'punto fijo arranca en 1 y converge en 21 iteraciones, contra las 4 ' +
      'de Newton, las 5 de la secante, las 6 de la regla falsa y las 17 de ' +
      'la bisección. Acá g′(x) = −e^(−x) = −x, así que en la raíz |g′| ≈ ' +
      '0.567: un pelín mejor que el coseno de Dottie, y se nota en las 8 ' +
      'iteraciones de diferencia.',
    pasos: [
      'Paso 0 — Reescritura y semilla: de x·eˣ = 1 se divide por eˣ y ' +
        'queda x = e^(−x), con x₀ = 1. Primera evaluación: g(1) = e^(−1) = ' +
        '0.36787944.',
      'Paso 1 — x₁ = g(x₀) = e^(−1) = 0.36787944, con |Δx| = 0.63212056. ' +
        'El primer rebote es el más grande de toda la tabla.',
      'Paso 2 — x₂ = g(x₁) = e^(−0.36787944) = 0.69220063 con |Δx| = ' +
        '0.32432119: la telaraña se cierra de golpe.',
      'Paso 3 — x₃ = g(x₂) = e^(−0.69220063) = 0.50047350 con |Δx| = ' +
        '0.19172713.',
      'Paso 4 — x₄ = 0.60624354 con |Δx| = 0.10577003 y de ahí en más ' +
        'cada rebote multiplica el error por ≈0.567, el módulo de g′ en la ' +
        'raíz.',
      'Paso 5 — hasta que en la iteración 21 el |Δx| queda en 6.93 × ' +
        '10⁻⁶, bajo la tolerancia.',
    ],
    algoritmo:
      'Como g′(x) = −e^(−x) = −x, en la raíz |g′| = 0.567: el error se ' +
      'multiplica por 0.567 en cada paso. Del 0.63212056 inicial al ' +
      '6.93 × 10⁻⁶ final hay una escalera de 21 eslabones, todos del mismo ' +
      'factor — la firma de la convergencia lineal perfecta.',
    criterio:
      'Se detiene en la iteración 21, cuando |Δx| = 6.93 × 10⁻⁶ < 10⁻⁵.',
    conclusion:
      'La raíz es x ≈ 0.56714078 (el valor exacto es 0.5671432904...): ' +
      'el desplazamiento final fue de 7.0 × 10⁻⁶, por debajo de la ' +
      'tolerancia de 1 × 10⁻⁵, y la diferencia real con el valor exacto es ' +
      'de 2.5 × 10⁻⁶, puro formato de la tabla. Fueron 21 iteraciones ' +
      'contra las 4 de Newton, las 5 de la secante, las 6 de la regla ' +
      'falsa y las 17 de la bisección: el punto fijo no usa derivada y, ' +
      'sin embargo, paga solo convergencia lineal.',
    calculo: { funcion: 'e^(-x)', x0: 1, tol: 1e-5 },
  },
  {
    id: 'punto-fijo-ej3-puente',
    titulo: 'El cable que cuelga y el número e',
    tipo: 'casuistica',
    enunciado:
      'El cable de un puente colgante se modela con la catenaria, y la ' +
      'tracción horizontal λ (en giga-newtons) aparece en la ecuación de ' +
      'equilibrio λ·e^λ = 5, donde el 5 junta el peso por metro con la ' +
      'flecha del vano. El ingeniero no tiene más datos que la física y ' +
      'sabe que λ anda cerca de 1: reescribe λ·e^λ = 5 como λ = ln(5/λ) y ' +
      'arranca de λ₀ = 1. Precisión pedida: 10⁻⁴.',
    ecuacion: 'λ · e^λ = 5',
    parametros: [
      { etiqueta: 'Reescritura', valor: 'g(λ) = ln(5/λ)' },
      { etiqueta: 'Semilla', valor: 'λ₀ = 1' },
      { etiqueta: 'Tolerancia', valor: '10⁻⁴' },
      { etiqueta: 'Física', valor: 'λ·e^λ = 5' },
    ],
    extraccion: {
      busqueda:
        'la tracción horizontal λ del cable (en giga-newtons) que satisface ' +
        'la ecuación de equilibrio λ·e^λ = 5: la raíz de la catenaria, el ' +
        'valor que el cálculo estructural necesita para dimensionar el ' +
        'anclaje.',
      datos: [
        {
          simbolo: 'λ₀',
          valor: '1 gn',
          queEs:
            'semilla del ingeniero: el orden de magnitud de la tracción que espera el diseño',
        },
        {
          simbolo: '5',
          valor: 'gn',
          queEs:
            'carga por metro junto con la flecha del vano: el término conocido de la ecuación de equilibrio',
        },
        {
          simbolo: 'tol',
          valor: '10⁻⁴ gn',
          queEs:
            'precisión exigida por el cálculo estructural: el desplazamiento final debe quedar por debajo',
        },
      ],
      formulacion:
        'El ingeniero no va a probar valores: reescribe la ecuación como ' +
        'punto fijo. De λ·e^λ = 5 se aplica ln a ambos lados y queda ' +
        'λ = ln(5/λ) = ln(5) − ln(λ): esa es la reescritura g(λ). La ' +
        'semilla λ₀ = 1 sale de la física (la tracción es del orden de los ' +
        'giga-newtons), y con ella se itera: cada λᵢ₊₁ es ln(5/λᵢ). Ojo: ' +
        'g′(λ) = −1/λ vale −0.754 en la raíz, más cerca de 1 que en los ' +
        'otros ejemplos: va a converger, pero lento.',
    },
    interpretacion:
      'La tracción sale λ ≈ 1.32668270 gn. La reescritura logarítmica ' +
      'oscila alrededor de la raíz — los iterados saltan de 1.61 a 1.13, ' +
      'de 1.48 a 1.21... — y como |g′| = 1/λ ≈ 0.754 queda cerca de 1, ' +
      'cada rebote borra poco: 32 iteraciones. La bisección necesitó 14 y ' +
      'la regla falsa 10; Newton y la secante cerraron en 4 y 6 con su ' +
      'geometría. El punto fijo paga caro la reescritura, pero nunca pidió ' +
      'intervalo ni derivada.',
    pasos: [
      'Paso 0 — Reescritura y semilla: de λ·e^λ = 5, aplicando ln: λ = ' +
        'ln(5/λ) = ln(5) − ln(λ). Con λ₀ = 1: g(1) = ln(5/1) = ln(5) = ' +
        '1.60943791. La telaraña arranca pasándose de largo.',
      'Paso 1 — λ₁ = g(λ₀) = ln(5) = 1.60943791, con |Δx| = 0.60943791.',
      'Paso 2 — λ₂ = g(λ₁) = ln(5/1.60943791) = ln(3.10667328) = 1.13355292 ' +
        'con |Δx| = 0.47588500: ahora se pasó para el otro lado.',
      'Paso 3 — λ₃ = g(λ₂) = 1.48408104 con |Δx| = 0.35052812: la ' +
        'oscilación alrededor de la raíz sigue, pero cada salto es más ' +
        'corto.',
      'Paso 4 — λ₄ = 1.21464216 con |Δx| = 0.26943888 y λ₅ = 1.41498840 ' +
        'con |Δx| = 0.20034623: el cociente entre saltos se estabiliza en ' +
        '≈0.754, el módulo de g′.',
      'Paso 5 — de acá en adelante la alternancia continúa contrayéndose: ' +
        'a la iteración 32 el |Δλ| queda en 9.76 × 10⁻⁵, recién por debajo ' +
        'de la tolerancia.',
    ],
    algoritmo:
      'La firma de la tabla es la alternancia: positivo, negativo, ' +
      'positivo... Cada iteración invierte el lado de la raíz y encoge el ' +
      'salto por ≈1/λ = 0.754. Del 0.60943791 inicial al 9.76 × 10⁻⁵ ' +
      'final, 32 eslabones de la misma escalera.',
    criterio:
      'Se detiene en la iteración 32, cuando |Δλ| = 9.76 × 10⁻⁵ < 10⁻⁴.',
    conclusion:
      'La tracción es λ ≈ 1.32668270 (el valor exacto es 1.3267246652...): ' +
      'el desplazamiento final fue de 9.8 × 10⁻⁵, por debajo de la ' +
      'tolerancia de 1 × 10⁻⁴, y la diferencia real con el valor exacto es ' +
      'de 4.2 × 10⁻⁵, dentro del margen que pide el cálculo estructural. ' +
      'Fueron 32 iteraciones, contra las 4 de Newton, las 6 de la secante, ' +
      'las 10 de la regla falsa y las 14 de la bisección: la reescritura ' +
      'logarítmica es lenta, pero no pide nada más que una semilla.',
    calculo: { funcion: 'ln(5/x)', x0: 1, tol: 1e-4 },
  },
  {
    id: 'punto-fijo-ej4-ph',
    titulo: 'El pH que converge en tres pasos',
    tipo: 'casuistica',
    enunciado:
      'En un laboratorio se prepara ácido acético 0.1 M, con Ka = 1.8 × ' +
      '10⁻⁵. La concentración de H⁺, x (en mol/L), cumple x² = Ka·(0.1 − x), ' +
      'o sea x = √(Ka·(0.1 − x)). Se arranca de x₀ = 0.001 mol/L, un valor ' +
      'típico para un ácido débil de esa concentración, y se pide precisión ' +
      'de 10⁻⁶.',
    ecuacion: 'x² + 1.8×10⁻⁵·x − 1.8×10⁻⁶ = 0',
    parametros: [
      { etiqueta: 'Reescritura', valor: 'g(x) = √(1.8×10⁻⁵·(0.1 − x))' },
      { etiqueta: 'Semilla', valor: 'x₀ = 0.001 mol/L' },
      { etiqueta: 'Tolerancia', valor: '10⁻⁶' },
    ],
    extraccion: {
      busqueda:
        'la concentración x de H⁺ en el equilibrio del ácido débil: la raíz ' +
        'de x² = Ka·(0.1 − x), que después se convierte en pH = −log₁₀(x) ' +
        'para reportar el resultado del laboratorio.',
      datos: [
        {
          simbolo: 'x₀',
          valor: '0.001 mol/L',
          queEs:
            'semilla: valor típico de H⁺ para un ácido débil 0.1 M, el orden de magnitud correcto',
        },
        {
          simbolo: 'Ka',
          valor: '1.8 × 10⁻⁵',
          queEs:
            'constante de acidez del ácido acético, el dato de la tabla de equilibrios',
        },
        {
          simbolo: 'C',
          valor: '0.1 M',
          queEs:
            'concentración analítica inicial del ácido, la que se preparó en el laboratorio',
        },
      ],
      formulacion:
        'Se despeja la x como punto fijo: de x² = Ka·(0.1 − x) sale ' +
        'x = √(Ka·(0.1 − x)), con Ka = 1.8 × 10⁻⁵ y C = 0.1 M. La semilla ' +
        'x₀ = 0.001 mol/L es un valor típico del orden de magnitud: la ' +
        'química no necesita más que eso para arrancar. Y esta reescritura ' +
        'es una joya: g′(x) = −Ka/(2·√(Ka·(0.1 − x))) vale ≈ −0.0067 en la ' +
        'raíz, casi cero, así que el punto fijo va a converger rapidísimo.',
    },
    interpretacion:
      'Cuando |g′| es chico, el punto fijo vuela: acá g′ ≈ −0.0067, y el ' +
      'método cierra en SOLO 3 iteraciones — le gana hasta a Newton (5), a ' +
      'la secante (7), a la regla falsa (11) y a la bisección (18). En el ' +
      'laboratorio esto significa: tres cuentas de la planilla y el pH ya ' +
      'está calculado.',
    pasos: [
      'Paso 0 — Reescritura y semilla: x = √(1.8 × 10⁻⁵·(0.1 − x)), con ' +
        'x₀ = 0.001. Primera evaluación: g(0.001) = √(1.8 × 10⁻⁵·0.099) = ' +
        '√(1.782 × 10⁻⁶) = 0.00133492.',
      'Paso 1 — x₁ = g(x₀) = 0.00133492, con |Δx| = 0.00033492. El ácido ' +
        'ya ajustó la concentración en el tercer decimal.',
      'Paso 2 — x₂ = g(x₁) = 0.00133266 con |Δx| = 0.00000226: la ' +
        'siguiente evaluación, g(0.00133266), ya da 0.00133267.',
      'Paso 3 — x₃ = g(x₂) = 0.00133267 con |Δx| = 0.00000002 < 10⁻⁶: ' +
        'parada en la tercera iteración. El pH es −log₁₀(0.00133267) ≈ ' +
        '2.875.',
    ],
    algoritmo:
      'La tabla es cortísima porque la derivada de la reescritura es ' +
      'diminuta: g′(x) = −Ka/(2·g(x)) ≈ −0.0067 en la raíz. El error pasa ' +
      'de 3.3 × 10⁻⁴ a 2.3 × 10⁻⁶ y de ahí a 2 × 10⁻⁸ en tres filas: cada ' +
      'paso encoge la distancia a la raíz por el factor 0.0067, y por eso ' +
      'el punto fijo — el método «lineal» — deja atrás a Newton en este ' +
      'problema.',
    criterio:
      'Se detiene en la iteración 3, cuando |Δx| = 2 × 10⁻⁸ < 10⁻⁶. La ' +
      'reescritura con g′ casi nula es el mejor caso del punto fijo.',
    conclusion:
      'La concentración es x ≈ 0.00133267 (el valor exacto es ' +
      '0.00133267097...), o sea un pH de 2.875: el desplazamiento final ' +
      'fue de 2 × 10⁻⁸, muy por debajo de la tolerancia de 1 × 10⁻⁶, y la ' +
      'diferencia real con la raíz exacta es de 1.0 × 10⁻⁹, puro formato ' +
      'de la tabla. Fueron 3 iteraciones, contra las 5 de Newton, las 7 de ' +
      'la secante, las 11 de la regla falsa y las 18 de la bisección: el ' +
      'punto fijo acá es el método más rápido del módulo.',
    calculo: { funcion: 'sqrt(0.000018*(0.1 - x))', x0: 0.001, tol: 1e-6 },
  },
];

/* ================================================================== */
/* EJERCICIOS                                                          */
/* ================================================================== */

export const EJERCICIOS_PUNTO_FIJO: Ejercicio[] = [
  {
    id: 'punto-fijo-ejercicio-1',
    titulo: 'Dos raíces, una sola se ve',
    tipo: 'numerico',
    enunciado:
      'Resolver x² + 2x − 15 = 0 con el punto fijo, despejando ' +
      'x = √(15 − 2x) y arrancando de x₀ = 4. La ecuación tiene DOS raíces ' +
      '(3 y −5): la reescritura con la raíz cuadrada solo puede alcanzar ' +
      'una. Tolerancia: 10⁻⁴.',
    ecuacion: 'x² + 2x − 15 = 0',
    parametros: [
      { etiqueta: 'Reescritura', valor: 'g(x) = √(15 − 2x)' },
      { etiqueta: 'Semilla', valor: 'x₀ = 4' },
      { etiqueta: 'Tolerancia', valor: '10⁻⁴' },
    ],
    pista:
      'Antes de iterar, mirá qué obliga el dominio: √(15 − 2x) exige ' +
      '15 − 2x ≥ 0, o sea x ≤ 7.5. La raíz −5 queda fuera de cualquier ' +
      'camino posible: el punto fijo con este despeje solo puede bajar ' +
      'hacia +3.',
    interpretacion:
      'Del punto de partida x₀ = 4, el punto fijo baja en 10 iteraciones ' +
      'hasta x ≈ 3.00001774. La bisección necesitó 16, la regla falsa 8, ' +
      'la secante 5 y Newton 4: este método lineal queda en el medio, sin ' +
      'derivada, y con el costo de que la otra raíz (−5) es invisible para ' +
      'esta reescritura. La lección: el punto fijo no busca raíces, ' +
      'persigue al punto fijo de LA reescritura que elegiste.',
    pasos: [
      'Paso 0 — Reescritura y semilla: de x² = 15 − 2x sale x = √(15 − 2x), ' +
        'con x₀ = 4. Primera evaluación: g(4) = √(15 − 8) = √7 = ' +
        '2.64575131. El salto es enorme: |Δx| = 1.35424869.',
      'Paso 1 — x₁ = g(x₀) = √7 = 2.64575131, con |Δx| = 1.35424869.',
      'Paso 2 — x₂ = g(x₁) = √(15 − 5.29150262) = √9.70849738 = 3.11584617 ' +
        'con |Δx| = 0.47009486.',
      'Paso 3 — x₃ = g(x₂) = 2.96113283 con |Δx| = 0.15471334: la telaraña ' +
        'ya se acomodó alrededor de 3.',
      'Paso 4 — x₄ = 3.01292787 con |Δx| = 0.05179503 y de ahí el patrón ' +
        'lineal: 0.01724026, 0.00574951, 0.00191620... hasta 0.00007097 en ' +
        'la iteración 10.',
    ],
    algoritmo:
      'La reescritura √(15 − 2x) tiene g′ = −1/√(15 − 2x) = −1/x en la ' +
      'raíz: en x = 3 vale −1/3 ≈ −0.333, así que el error se multiplica ' +
      'por 0.333 por paso. La tabla lo muestra: 1.35424869, 0.47009486, ' +
      '0.15471334, 0.05179503, 0.01724026... cada salto es un tercio del ' +
      'anterior.',
    criterio:
      'Se detiene en la iteración 10, cuando |Δx| = 7.10 × 10⁻⁵ < 10⁻⁴.',
    conclusion:
      'La raíz es x ≈ 3.00001774 (la ecuación también tiene la raíz −5, ' +
      'que esta reescritura no puede alcanzar): el desplazamiento final fue ' +
      'de 7.1 × 10⁻⁵, por debajo de la tolerancia de 1 × 10⁻⁴, y la ' +
      'diferencia real con la raíz exacta es de 1.8 × 10⁻⁵, el costo del ' +
      'formato de la tabla. Fueron 10 iteraciones, contra las 4 de Newton, ' +
      'las 5 de la secante, las 8 de la regla falsa y las 16 de la ' +
      'bisección.',
    calculo: { funcion: 'sqrt(15 - 2*x)', x0: 4, tol: 1e-4 },
  },
  {
    id: 'punto-fijo-ejercicio-2',
    titulo: 'Una raíz que atrae, otra que escapa',
    tipo: 'numerico',
    enunciado:
      'Resolver eˣ − 3x = 0, que tiene DOS raíces (0.619... y 1.512...). ' +
      'Se reescribe como x = eˣ/3 y se arranca de x₀ = 0.5. Tolerancia: ' +
      '10⁻⁴.',
    ecuacion: 'eˣ − 3x = 0',
    parametros: [
      { etiqueta: 'Reescritura', valor: 'g(x) = eˣ/3' },
      { etiqueta: 'Semilla', valor: 'x₀ = 0.5' },
      { etiqueta: 'Tolerancia', valor: '10⁻⁴' },
    ],
    pista:
      'Mirá la derivada de la reescritura: g′(x) = eˣ/3 = g(x). En la raíz ' +
      'chica vale 0.619 (< 1: atrae); en la grande vale 1.512 (> 1: ' +
      'repele). El punto fijo solo puede converger hacia donde |g′| < 1 — ' +
      'por eso esta reescritura alcanza una raíz y no la otra.',
    interpretacion:
      'Con g′ = eˣ/3 = g(x), el punto fijo se comporta distinto en cada ' +
      'raíz: cerca de 0.619 el factor es 0.619 y todo converge; cerca de ' +
      '1.512 el factor es 1.512 y cualquier semilla huye. Desde x₀ = 0.5 ' +
      'la telaraña baja a 0.619 en 14 iteraciones. La bisección necesitó ' +
      '12, la regla falsa 5, la secante 3 y Newton 3: el punto fijo es el ' +
      'más lento acá, y la lección es por qué: orden 1 con un factor 0.619, ' +
      'contra el orden 1.618 de la secante y el 2 de Newton.',
    pasos: [
      'Paso 0 — Reescritura y semilla: de eˣ = 3x sale x = eˣ/3, con ' +
        'x₀ = 0.5. Primera evaluación: g(0.5) = e^(0.5)/3 = 1.64872127/3 = ' +
        '0.54957376.',
      'Paso 1 — x₁ = g(x₀) = 0.54957376, con |Δx| = 0.04957376.',
      'Paso 2 — x₂ = g(x₁) = e^(0.54957376)/3 = 1.73251440/3 = 0.57750480 ' +
        'con |Δx| = 0.02793104.',
      'Paso 3 — x₃ = g(x₂) = 0.59386249 con |Δx| = 0.01635769.',
      'Paso 4 — x₄ = 0.60365659 con |Δx| = 0.00979410: cada salto ya es ' +
        '≈0.62 del anterior.',
      'Paso 5 — y así hasta la iteración 14: 0.00594132, 0.00363260, ' +
        '0.00223167, 0.00137504... hasta el 7.68 × 10⁻⁵ final. La otra ' +
        'raíz, 1.512, no aparece: con esta reescritura, desde esta zona ' +
        'nunca se acerca.',
    ],
    algoritmo:
      'La derivada ES la reescritura: g′(x) = eˣ/3 = g(x). En la tabla se ' +
      've el cociente entre deltas estabilizándose en ≈0.619, que es g′ en ' +
      'la raíz: el factor de contracción de una convergencia lineal ' +
      'perfecta. Frente a Newton (3) y la secante (3), el punto fijo paga ' +
      '14 — pero a cambio, la cuenta por paso es una sola evaluación de eˣ.',
    criterio:
      'Se detiene en la iteración 14, cuando |Δx| = 7.68 × 10⁻⁵ < 10⁻⁴.',
    conclusion:
      'La raíz es x ≈ 0.61893645 (el valor exacto es 0.6190612867...): el ' +
      'desplazamiento final fue de 7.7 × 10⁻⁵, por debajo de la tolerancia ' +
      'de 1 × 10⁻⁴. La otra raíz, 1.512, queda fuera de alcance: en esa ' +
      'zona g′ = 1.512 > 1 y el punto fijo repele. Fueron 14 iteraciones, ' +
      'contra las 3 de Newton y de la secante, las 5 de la regla falsa y ' +
      'las 12 de la bisección: la diferencia con el valor exacto queda ' +
      'dentro del margen de la tabla, y el método sigue sin pedir derivada ' +
      'ni intervalo.',
    calculo: { funcion: 'e^(x)/3', x0: 0.5, tol: 1e-4 },
  },
  {
    id: 'punto-fijo-ejercicio-3',
    titulo: 'El equilibrio que se dimeriza',
    tipo: 'casuistica',
    enunciado:
      'En un reactor se dimeriza A: 2A ⇌ A₂, con K = [A₂]/[A]² = 1 L/mol. ' +
      'La concentración total de A (libre o dimerizado) es C = 2 mol/L. Si ' +
      'x = [A] en el equilibrio (en mol/L), el balance da [A₂] = (2 − x)/2 ' +
      'y la ley de equilibrio obliga 2x² + x − 2 = 0. Se reescribe ' +
      'x = √(0.5·(2 − x)) y se itera desde x₀ = 1 mol/L. Tolerancia: 10⁻⁴.',
    ecuacion: '2x² + x − 2 = 0',
    parametros: [
      { etiqueta: 'Reescritura', valor: 'g(x) = √(0.5·(2 − x))' },
      { etiqueta: 'Semilla', valor: 'x₀ = 1 mol/L' },
      { etiqueta: 'Tolerancia', valor: '10⁻⁴' },
      { etiqueta: 'K', valor: '1 L/mol' },
    ],
    pista:
      'Antes de iterar, fijate en la derivada de la reescritura: de ' +
      'x² = 0.5·(2 − x) sale g′ = −0.5/(2·g(x)) = −0.25/g(x). Como g(x) es ' +
      'una raíz, siempre es positiva: el módulo es menor que 1 mientras ' +
      'g(x) > 0.25, y la telaraña converge desde cualquier semilla del ' +
      'rango físico (0, 2).',
    extraccion: {
      busqueda:
        'la concentración x de A libre en el equilibrio del reactor: la ' +
        'raíz de 2x² + x − 2 = 0 que el operador necesita para saber cuánto ' +
        'monómero queda sin dimerizar.',
      datos: [
        {
          simbolo: 'K',
          valor: '1 L/mol',
          queEs:
            'constante de equilibrio de la dimerización 2A ⇌ A₂, el dato termodinámico del proceso',
        },
        {
          simbolo: 'C',
          valor: '2 mol/L',
          queEs:
            'concentración total de A — libre o dimerizado — que se cargó al reactor',
        },
        {
          simbolo: 'x₀',
          valor: '1 mol/L',
          queEs:
            'semilla: como la concentración de A no puede pasar de 2 (todo libre), 1 es un punto medio razonable',
        },
      ],
      formulacion:
        'Se plantea la ley de equilibrio y se despeja la x como punto fijo: ' +
        'con x = [A], el balance de masa da [A₂] = (2 − x)/2, y K = ' +
        '[A₂]/[A]² = 1 lleva a (2 − x)/2 = x², es decir 2x² + x − 2 = 0. La ' +
        'reescritura x = √(0.5·(2 − x)) sale de despejar x² = (2 − x)/2 y ' +
        'tomar la raíz. La semilla x₀ = 1 es el punto medio del rango ' +
        'físico (0 ≤ x ≤ 2), y con ella se itera hasta que el ' +
        'desplazamiento baje de 10⁻⁴.',
    },
    interpretacion:
      'Desde x₀ = 1 el punto fijo baja hasta x ≈ 0.78076836 en 9 ' +
      'iteraciones. El rango físico (0 ≤ x ≤ 2) queda respetado en toda la ' +
      'tabla porque la reescritura √(0.5·(2 − x)) obliga x ≤ 2. La ' +
      'bisección necesitó 14, la regla falsa 5, la secante 4 y Newton 4: el ' +
      'punto fijo queda en el medio, sin derivada y con la cuenta más ' +
      'simple del módulo.',
    pasos: [
      'Paso 0 — Reescritura y semilla: de 2x² + x − 2 = 0 sale x² = ' +
        '(2 − x)/2, o sea x = √(0.5·(2 − x)), con x₀ = 1. Primera ' +
        'evaluación: g(1) = √(0.5·1) = √0.5 = 0.70710678.',
      'Paso 1 — x₁ = g(x₀) = √0.5 = 0.70710678, con |Δx| = 0.29289322.',
      'Paso 2 — x₂ = g(x₁) = √(0.5·(2 − 0.70710678)) = √0.64644661 = ' +
        '0.80401904 con |Δx| = 0.09691225.',
      'Paso 3 — x₃ = g(x₂) = 0.77329844 con |Δx| = 0.03072059: la telaraña ' +
        'ya se enrosca alrededor de 0.78.',
      'Paso 4 — x₄ = 0.78316715 con |Δx| = 0.00986870 y de ahí: ' +
        '0.78001053, 0.78102160, 0.78069789, 0.78080155... hasta ' +
        '0.78076836 en la iteración 9.',
    ],
    algoritmo:
      'La reescritura tiene g′ = −0.25/g(x) — derivando x² = 0.5·(2 − x) ' +
      'queda 2x·x′ = −0.5 — y en la raíz vale −0.32: cada paso encoge el ' +
      'error por ≈0.32. Los deltas lo muestran: 0.29289322, 0.09691225, ' +
      '0.03072059, 0.00986870, 0.00315662... el cociente se estabiliza en ' +
      '≈0.32, convergencia lineal parecida a la cuadrática, solo que más ' +
      'lenta.',
    criterio:
      'Se detiene en la iteración 9, cuando |Δx| = 3.32 × 10⁻⁵ < 10⁻⁴.',
    conclusion:
      'La concentración es x ≈ 0.78076836 (el valor exacto es ' +
      '0.7807764064...): el desplazamiento final fue de 3.4 × 10⁻⁵, por ' +
      'debajo de la tolerancia de 1 × 10⁻⁴, y la diferencia real con la ' +
      'raíz exacta es de 8.1 × 10⁻⁶, apenas formato de la tabla. Fueron 9 ' +
      'iteraciones, contra las 4 de Newton y de la secante, las 5 de la ' +
      'regla falsa y las 14 de la bisección: el punto fijo ganó sin ' +
      'derivada y sin intervalo, solo con la reescritura y una semilla.',
    calculo: { funcion: 'sqrt(0.5*(2 - x))', x0: 1, tol: 1e-4 },
  },
];