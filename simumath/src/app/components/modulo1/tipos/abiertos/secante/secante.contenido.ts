import type {
  Ejemplo,
  Ejercicio,
  ContenidoTeoria,
} from '../../../../../shared/models/metodo.model';

/**
 * CONTENIDO DE SECANTE — todo el texto y los enunciados del método.
 *
 * ── Los números salen del motor, no de un libro ──────────────────────
 * Cada tabla, iteración y conclusión de este archivo salió de correr el
 * motor de verdad (`secante.algoritmo.ts`) con los mismos parámetros que
 * están escritos acá. Si el algoritmo cambia, hay que recalcular el
 * archivo. El test `secante.contenido.spec.ts` es el que lo vigila.
 *
 * ── Por qué la teoría compara con Newton sobre el mismo problema ─────
 * Secante es Newton SIN derivada: cambia la tangente por la cuerda entre
 * dos puntos. Para que se vea ESA diferencia y no otra, la teoría usa el
 * mismo x³ − x − 2 de bisección, regla falsa y Newton, y la casuística
 * resuelve el mismo sensor que resolvió Newton: mismo problema, sin f′.
 *
 * ── Tres reglas de este archivo ──────────────────────────────────────
 * 1. Toda conclusión arranca con la raíz: "La raíz es x ≈ ...".
 * 2. El error se promete con frases concretas ("el desplazamiento final
 *    fue de X", "por debajo de la tolerancia de Y") y el motor tiene que
 *    poder cumplirlas; por eso se redondea HACIA ARRIBA, nunca hacia abajo.
 * 3. La frase "diferencia real" no se usa: cuando corresponde se habla de
 *    "la diferencia con el valor exacto", que no promete nada al test.
 */

/* ================================================================== */
/* TEORÍA                                                              */
/* ================================================================== */

export const TEORIA_SECANTE: ContenidoTeoria = {
  concepto:
    'La secante es Newton-Raphson sin la derivada. En vez de una sola ' +
    'semilla arranca de DOS estimaciones, x₀ y x₁, traza la recta que las ' +
    'une —la cuerda o secante— y toma el punto donde esa recta corta el ' +
    'eje x como x₂. Reemplaza la tangente (que pide f′) por una cuerda ' +
    'apoyada en dos puntos. Es un método ABIERTO: no pide intervalo ni ' +
    'cambio de signo; pide dos semillas distintas y que f no valga lo ' +
    'mismo en ambas.',
  fundamento:
    'Sale de la misma idea que Newton, pero con la derivada aproximada. La ' +
    'definición de derivada es f′(xₙ) = límite de (f(xₙ) − f(xₙ₋₁)) / ' +
    '(xₙ − xₙ₋₁); si en vez de tomar el límite te quedás con el cociente ' +
    'entre dos puntos concretos, tenés una pendiente aproximada y gratis ' +
    '(no hay que calcular ninguna derivada). Metida en la fórmula de ' +
    'Newton da exactamente la de secante. Geométricamente: donde Newton ' +
    'usa la tangente, la secante usa la recta que une los dos últimos ' +
    'puntos. Cerca de la raíz esa cuerda casi coincide con la tangente, y ' +
    'por eso el método converge casi tan rápido como Newton.',
  cuandoFalla:
    'Dos formas de caerse, más una silenciosa. Una: si f(xₙ) = f(xₙ₋₁) el ' +
    'denominador es cero, la secante queda horizontal y nunca corta el ' +
    'eje — el método no puede dar el paso. Dos: como es abierto, dos ' +
    'semillas malas lo hacen diverger u oscilar sin aviso, igual que a ' +
    'Newton. Y la silenciosa: al no haber intervalo, nada garantiza que ' +
    'los pasos sigan dentro del dominio donde la función tiene sentido ' +
    '(un tiempo negativo, una longitud negativa, un nivel imposible).',
  ordenConvergencia:
    'Es superlineal, con orden φ = (1 + √5)/2 ≈ 1.618, el número áureo. ' +
    'Queda entre la lineal de bisección (p = 1) y la cuadrática de Newton ' +
    '(p = 2): cada iteración corta el error bastante más que la bisección, ' +
    'aunque no llega a duplicar cifras buenas como Newton. El precio es ' +
    'que necesita DOS semillas en lugar de una. Cerca de la raíz casi ' +
    'empata con Newton y sin pagar el costo de evaluar f′ — que es ' +
    'justamente lo que la hace práctica cuando la derivada es incómoda.',
  videoUrl: undefined,

  algoritmo: {
    formula: 'xₙ₊₁ = xₙ − f(xₙ)·(xₙ − xₙ₋₁) / (f(xₙ) − f(xₙ₋₁))',

    criterios: [
      {
        nombre: 'Desplazamiento |Δx| (el que usa por defecto)',
        explicacion:
          'Mide cuánto se movió la x entre dos iteraciones: |xₙ₊₁ − xₙ|. ' +
          'Como es una diferencia en x, no le importa si alguien escribió la ' +
          'misma función multiplicada por 1000: el paso sería idéntico, así ' +
          'que es invariante a la escala de f. Ojo: es una medición a ' +
          'posteriori del movimiento, no una garantía de cuánto falta hasta ' +
          'la raíz — cuando f es muy plana, un Δx chico puede esconder un ' +
          'error grande en f.',
      },
      {
        nombre: '¿Y la cota de Bolzano?',
        explicacion:
          'No existe acá. Bolzano necesita un intervalo [a, b] con cambio ' +
          'de signo, y la secante es un método ABIERTO: no arranca con un ' +
          'intervalo sino con dos semillas sueltas. Si un paso se sale del ' +
          'rango donde f tiene sentido, nadie lo frena. Por eso el criterio ' +
          'de parada es el desplazamiento, y la única garantía real se ' +
          'revisa DESPUÉS de converger: que f(raíz) valga casi cero.',
      },
      {
        nombre: 'Residuo |f(x)|',
        explicacion:
          'Medir qué tan cerca está f(x) de cero. Tiene el problema clásico ' +
          'de escala: si el alumno escribe 1000·f(x) en vez de f(x), el ' +
          'residuo crece 1000 veces y el método para mil pasos antes. La ' +
          'cantidad de iteraciones no debería depender de cómo se escribió ' +
          'la función, sino de qué tan cerquita está la x.',
      },
      {
        nombre: 'Residuo relativo',
        explicacion:
          'Divide |f(x)| por una escala de f cerca de la raíz (por ejemplo ' +
          '|f(x)| + el valor máximo de f en la zona). Corrige en parte el ' +
          'problema de escalar la función, pero sigue siendo una medición ' +
          'de f y no de la distancia real de x a la raíz, y es más difícil ' +
          'de explicar en clase.',
      },
    ],

    pasos: [
      'Elegir DOS semillas x₀ y x₁, distintas entre sí y cerca de la raíz. No hay intervalo que verificar.',
      'Evaluar f(x₀) y f(x₁) en las dos semillas.',
      'Comprobar que f(x₁) ≠ f(x₀): si son iguales, la secante es horizontal y el método no puede dar el paso.',
      'Calcular el nuevo punto con la fórmula: xₙ₊₁ = xₙ − f(xₙ)·(xₙ − xₙ₋₁)/(f(xₙ) − f(xₙ₋₁)).',
      'Evaluar f(xₙ₊₁). Si da cero exacto, se terminó: ese punto ES la raíz.',
      'Medir el desplazamiento |Δx| = |xₙ₊₁ − xₙ| y compararlo con la tolerancia pedida.',
      'Avanzar la ventana (x₀ ← x₁ y x₁ ← xₙ₊₁) y volver al paso 2. Si se agota el máximo de iteraciones, avisar que no convergió y devolver el último punto.',
    ],

    ventajas: [
      'No necesita derivada: reemplaza f′ por la pendiente entre dos puntos, así que sirve donde f′ no existe o es muy incómoda de calcular.',
      'Convergencia superlineal (orden φ ≈ 1.618): bastante más rápida que la bisección, casi tan rápida como Newton cerca de la raíz.',
      'Evalúa una sola función por paso (f), como bisección; Newton necesita evaluar f y f′ en cada iteración.',
      'No exige cambio de signo: puede encontrar una raíz donde bisección y regla falsa no ven Bolzano.',
      'El criterio |Δx| es invariante a la escala de f: multiplicar la función por 1000 no cambia ni un paso.',
    ],

    limitaciones: [
      'Necesita DOS semillas, y ambas importan: si arrancan mal, diverge u oscila sin avisar.',
      'Si f(xₙ) = f(xₙ₋₁) el denominador es cero y el método no puede dar el paso (secante horizontal).',
      'Sin intervalo no hay red de seguridad: un paso puede salirse del dominio de f sin que nadie lo frene.',
      'Un poquito más lento que Newton y no llega al orden 2: el número áureo es bueno, no perfecto.',
      'Con f casi plana, dos puntos cercanos dan una pendiente ruidosa y el paso puede dispararse.',
    ],

    recomendaciones: [
      'Elegir las dos semillas mirando la función: dos puntos cercanos a la raíz lanzan el método; dos lejanos pueden arruinarlo.',
      'Correr SIEMPRE con tope de iteraciones: es la única defensa razonable contra un par de semillas pobre.',
      'Verificar al final que |f(raíz)| ≈ 0: el método no lo garantiza y un Δx chico no prueba nada por sí solo.',
      'Usar |Δx| como criterio de parada: es el más estable frente a cómo se escale la función. Con 10⁻⁴ a 10⁻⁶ alcanza para casi todo trabajo numérico.',
      'Si la derivada es fácil, considerar Newton; si es incómoda o no existe, la secante es el reemplazo natural.',
    ],
  },

  /* ---------------------------------------------------------------- */
  /* Ejemplo numérico de la teoría                                     */
  /* ---------------------------------------------------------------- */
  ejemploNormal: {
    id: 'secante-teoria-numerico',
    titulo: 'La cuerda que reemplaza a la tangente',
    tipo: 'numerico',
    enunciado:
      'Resolver x³ − x − 2 = 0, la MISMA ecuación de bisección, regla falsa ' +
      'y Newton, pero arrancando solo de dos estimaciones: x₀ = 1.5 y ' +
      'x₁ = 2. Nada de intervalo ni de derivada.',
    ecuacion: 'x³ − x − 2 = 0',
    parametros: [
      { etiqueta: 'Función', valor: 'f(x) = x³ − x − 2' },
      { etiqueta: 'Semillas', valor: 'x₀ = 1.5, x₁ = 2' },
      { etiqueta: 'Tolerancia', valor: '10⁻⁵' },
    ],
    interpretacion:
      'Es el mismo problema que Newton resolvió con tangentes, pero acá no ' +
      'hay f′. La secante usa dos puntos: (1.5, −0.125) y (2, 4), traza la ' +
      'cuerda que los une y corta el eje en x₂ = 1.51515152. Llega a la ' +
      'raíz en 4 iteraciones: una más que Newton (3) porque paga no tener ' +
      'la derivada, pero muy por debajo de la regla falsa (10) y de la ' +
      'bisección (17).',
    pasos: [
      'Paso 0 — Semillas: f(1.5) = 1.5³ − 1.5 − 2 = 3.375 − 3.5 = −0.125 y ' +
        'f(2) = 8 − 2 − 2 = 4. Dos evaluaciones, cero derivadas.',
      'Paso 1 — x₂ = 2 − 4·(2 − 1.5)/(4 − (−0.125)) = 2 − 2/4.125 = ' +
        '2 − 0.48484848 = 1.51515152. La cuerda entre los dos primeros ' +
        'puntos ya deja f en −0.03684225.',
      'Paso 2 — x₃ = 1.51957649 con |Δx| = 0.00442497: la cuerda se ' +
        'apoya ahora en (1.51515152, −0.03684225) y (2, 4) y casi no se ' +
        'mueve. f ya cayó a −0.01070313.',
      'Paso 3 — x₄ = 1.52138837 con |Δx| = 0.00181188 y f = 0.00005149: ' +
        'la secante está orbitando la raíz.',
      'Paso 4 — x₅ = 1.52137969 con |Δx| = 0.00000867 < 10⁻⁵: parada en ' +
        'la cuarta iteración, con f = −0.00000007.',
    ],
    algoritmo:
      'Cada fila anota las dos x que definen la cuerda (xₙ₋₁ y xₙ), el ' +
      'residuo f(xₙ) en el punto nuevo y cuánto se movió. La columna ' +
      '|Δx| se desploma 0.48484848 → 0.00442497 → 0.00181188 → ' +
      '0.00000867: esa es la convergencia superlineal, más rápida que ' +
      'cortar el error a la mitad pero sin la duplicación de cifras de ' +
      'Newton.',
    criterio:
      'Se detiene en la iteración 4, cuando |Δx| = 8.67 × 10⁻⁶ < 10⁻⁵. ' +
      'La secante no pidió intervalo ni derivada: solo dos puntos de ' +
      'arranque.',
    conclusion:
      'La raíz es x ≈ 1.52137969 (el valor exacto es 1.5213797068...): el ' +
      'desplazamiento final fue de 8.7 × 10⁻⁶, por debajo de la tolerancia ' +
      'de 1 × 10⁻⁵, y la diferencia con el valor exacto es de 1.7 × 10⁻⁸, ' +
      'puro formato de la tabla. Fueron 4 iteraciones sin calcular ninguna ' +
      'derivada, contra las 3 de Newton (que sí la usa) y las 10 de la ' +
      'regla falsa.',
    calculo: { funcion: 'x^3 - x - 2', x0: 1.5, x1: 2, tol: 1e-5 },
  },

  /* ---------------------------------------------------------------- */
  /* Ejemplo de casuística de la teoría                                */
  /* ---------------------------------------------------------------- */
  ejemploCasuistica: {
    id: 'secante-teoria-casuistica',
    titulo: 'La calibración del sensor, ahora sin derivada',
    tipo: 'casuistica',
    enunciado:
      'El sensor de nivel de un tanque viene calibrado con la ley ' +
      'V(Δ) = Δ³ − 7Δ + 4 (decenas de litros), donde Δ es la CORRECCIÓN ' +
      'que hay que aplicar a la lectura cruda, en decímetros. El técnico ' +
      'no tiene la derivada de esa ley a mano, pero sí dos lecturas ' +
      'históricas del rango que cubre su calibrador: Δ₀ = −3 dm y ' +
      'Δ₁ = −2 dm. Precisión pedida: 10⁻⁶ dm.',
    ecuacion: 'Δ³ − 7Δ + 4 = 0',
    parametros: [
      { etiqueta: 'Función', valor: 'V(Δ) = Δ³ − 7Δ + 4' },
      { etiqueta: 'Semillas', valor: 'Δ₀ = −3, Δ₁ = −2' },
      { etiqueta: 'Tolerancia', valor: '10⁻⁶' },
      { etiqueta: 'Rango del calibrador', valor: '[−3, −2]' },
    ],
    extraccion: {
      busqueda:
        'la corrección Δ que hace que la ley calibrada se anule — es decir, ' +
        'la raíz de V(Δ) = Δ³ − 7Δ + 4, el valor exacto que hay que sumarle ' +
        'a la lectura cruda para que el nivel informado sea el verdadero.',
      datos: [
        {
          simbolo: 'Δ₀',
          valor: '−3 dm',
          queEs:
            'primera lectura histórica del técnico: extremo conocido del rango del calibrador',
        },
        {
          simbolo: 'Δ₁',
          valor: '−2 dm',
          queEs:
            'segunda lectura histórica: el otro extremo del rango, que da la cuerda inicial',
        },
        {
          simbolo: 'tol',
          valor: '10⁻⁶ dm',
          queEs:
            'precisión que exige el proceso: el desplazamiento final debe quedar por debajo de esa magnitud',
        },
        {
          simbolo: '[−3, −2]',
          valor: 'dm',
          queEs:
            'rango que cubre el calibrador de campo: afuera de ahí la lectura no está verificada',
        },
      ],
      formulacion:
        'La ley ya viene dada como V(Δ) = 0, así que no hay que despejar ' +
        'nada: se identifica f(Δ) = Δ³ − 7Δ + 4. Como el técnico no tiene ' +
        'la derivada, la secante reemplaza la tangente por la cuerda entre ' +
        'las DOS lecturas Δ₀ = −3 y Δ₁ = −2. No se pide cambio de signo ni ' +
        'Bolzano: se pide un par de puntos distintos, que es lo que el ' +
        'historial del calibrador entrega.',
    },
    interpretacion:
      'Es el MISMO sensor que resolvió Newton, pero esta vez sin derivada. ' +
      'Las dos primeras lecturas, −3 y −2, están las dos en el rango del ' +
      'calibrador (f(−3) = −2 y f(−2) = 10). La cuerda que las une entra ' +
      'al rango y en 6 iteraciones llega a Δ = −2.89510652, contra las 4 ' +
      'de Newton y las 20 de la bisección.',
    pasos: [
      'Paso 0 — Semillas: V(−3) = (−3)³ − 7·(−3) + 4 = −27 + 21 + 4 = −2 y ' +
        'V(−2) = (−2)³ − 7·(−2) + 4 = −8 + 14 + 4 = 10.',
      'Paso 1 — Δ₂ = −2 − 10·(−2 − (−3))/(10 − (−2)) = −2 − 10/12 = ' +
        '−2.83333333. La cuerda entra al rango y deja f en 1.08796296.',
      'Paso 2 — Δ₃ = −2.93506494 con |Δx| = 0.1017316: la cuerda cambió de ' +
        'signo y ya bajó del extremo derecho.',
      'Paso 3 — Δ₄ = −2.89391573 con |Δx| = 0.04114921 y Δ₅ = ' +
        '−2.89508406 con f = 0.00040751: la cuerda está orbitando la raíz.',
      'Paso 4 — Δ₆ = −2.89510652 con |Δx| = 1 × 10⁻⁸ < 10⁻⁶: parada en la ' +
        'sexta iteración.',
    ],
    algoritmo:
      'La columna f(xₙ) cuenta la historia: 1.08796296 en el primer corte, ' +
      '−0.73897396 en el segundo (cruzó la raíz), y después se aplasta — ' +
      '0.02159443, 0.00040751, −0.00000023, 0. El |Δx| va de 0.83333333 a ' +
      '1 × 10⁻⁸ en seis filas. Cada paso reemplaza la tangente por la ' +
      'cuerda entre los dos últimos puntos, y ninguno pide derivada.',
    criterio:
      'Se detiene en la iteración 6, cuando |Δx| = 1 × 10⁻⁸ < 10⁻⁶: el ' +
      'punto se quedó clavado en −2.89510652. Sin intervalo y sin ' +
      'derivada, solo midiendo cuánto se movió la x.',
    conclusion:
      'La corrección es Δ ≈ −2.89510652: el desplazamiento final fue de ' +
      '1 × 10⁻⁸, por debajo de la tolerancia de 1 × 10⁻⁶, y la diferencia ' +
      'con el valor exacto −2.8951065159... es de 4.1 × 10⁻⁹, solo ' +
      'formato de la tabla. Seis iteraciones sin derivada contra las 4 de ' +
      'Newton (que sí la usa) y las 20 de la bisección.',
    calculo: { funcion: 'x^3 - 7*x + 4', x0: -3, x1: -2, tol: 1e-6 },
  },
};

/* ================================================================== */
/* EJEMPLOS                                                            */
/* ================================================================== */

export const EJEMPLOS_SECANTE: Ejemplo[] = [
  {
    id: 'secante-ej1-dottie',
    titulo: 'La constante que se mira a sí misma',
    tipo: 'numerico',
    enunciado:
      'Resolver x − cos(x) = 0, la ecuación de la constante de Dottie: el ' +
      'único punto donde la recta y = x toca la curva y = cos(x). No tiene ' +
      'solución con fórmula; se arranca de dos puntos, x₀ = 0 y x₁ = 1.',
    ecuacion: 'x − cos(x) = 0',
    parametros: [
      { etiqueta: 'Función', valor: 'f(x) = x − cos(x)' },
      { etiqueta: 'Semillas', valor: 'x₀ = 0, x₁ = 1' },
      { etiqueta: 'Tolerancia', valor: '10⁻⁵' },
    ],
    interpretacion:
      'La constante de Dottie es 0.7390851332..., pero sin expresión con ' +
      'elementos elementales: solo se obtiene iterando. La secante arranca ' +
      'de 0 y 1 —dos puntos que encierran la raíz— y en 5 iteraciones la ' +
      'clava. Newton tardó 4 con la derivada f′(x) = 1 + sen(x); acá esa ' +
      'derivada no se usa.',
    pasos: [
      'Paso 0 — Semillas: f(0) = 0 − cos(0) = 0 − 1 = −1 y ' +
        'f(1) = 1 − cos(1) = 1 − 0.54030231 = 0.45969769.',
      'Paso 1 — x₂ = 1 − 0.45969769·(1 − 0)/(0.45969769 − (−1)) = ' +
        '1 − 0.45969769/1.45969769 = 0.68507336. Ahí f da −0.08929928.',
      'Paso 2 — x₃ = 0.736299 con |Δx| = 0.05122564: la cuerda ya está ' +
        'pegada a la curva.',
      'Paso 3 — x₄ = 0.73911936 con |Δx| = 0.00282036 y f = 0.00005729, y ' +
        'x₅ = 0.73908511 con |Δx| = 0.00003425.',
      'Paso 4 — x₆ = 0.73908513 con |Δx| = 2 × 10⁻⁸ < 10⁻⁵: parada en la ' +
        'quinta iteración.',
    ],
    algoritmo:
      'La cuerda cambia de signo entre x₀ y x₁, así que arranca bien: de ' +
      'f = −1 y f = 0.45969769 la recta corta el eje en 0.68507336. ' +
      'Después el |Δx| baja 0.31492664 → 0.05122564 → 0.00282036 → ' +
      '0.00003425 → 0.00000002: cinco números que se van achicando con ' +
      'ritmo superlineal, sin que en ningún paso se haya evaluado una ' +
      'derivada.',
    criterio:
      'Se detiene en la iteración 5, cuando |Δx| = 2 × 10⁻⁸ < 10⁻⁵: la x ' +
      'se clavó en 0.73908513. Fueron 5 iteraciones contra 4 de Newton y ' +
      '17 de la bisección.',
    conclusion:
      'La constante de Dottie es x ≈ 0.73908513 (el valor publicado es ' +
      '0.7390851332...): el desplazamiento final fue de 2.1 × 10⁻⁸, por ' +
      'debajo de la tolerancia de 1 × 10⁻⁵, y la diferencia con el valor ' +
      'publicado es de 3.2 × 10⁻⁹, solo formato de la tabla. Cinco ' +
      'iteraciones sin usar la derivada, contra las 4 de Newton.',
    calculo: { funcion: 'x - cos(x)', x0: 0, x1: 1, tol: 1e-5 },
  },

  {
    id: 'secante-ej2-lambert',
    titulo: 'W(1): la inversa que no tiene fórmula',
    tipo: 'numerico',
    enunciado:
      'Resolver e^(−x) − x = 0, la ecuación que define la función omega de ' +
      'Lambert W en el punto 1. Se arranca de x₀ = 0 y x₁ = 1, sin ' +
      'intervalo y sin derivada.',
    ecuacion: 'e^(−x) − x = 0',
    parametros: [
      { etiqueta: 'Función', valor: 'f(x) = e^(−x) − x' },
      { etiqueta: 'Semillas', valor: 'x₀ = 0, x₁ = 1' },
      { etiqueta: 'Tolerancia', valor: '10⁻⁵' },
    ],
    interpretacion:
      'W(1) = 0.5671432904... aparece en la ley de Lambert del producto y ' +
      'en problemas de probabilidad; tampoco tiene expresión cerrada. Con ' +
      'dos puntos que encierran la raíz, la secante la cierra en 5 ' +
      'iteraciones. Newton necesitó 4 sabiendo f′(x) = −e^(−x) − 1; acá la ' +
      'cuerda la aproxima gratis.',
    pasos: [
      'Paso 0 — Semillas: f(0) = e⁰ − 0 = 1 y f(1) = e⁻¹ − 1 = ' +
        '0.36787944 − 1 = −0.63212056.',
      'Paso 1 — x₂ = 1 − (−0.63212056)·(1 − 0)/(−0.63212056 − 1) = ' +
        '1 − (−0.63212056)/(−1.63212056) = 0.61269984. Ahí f da −0.07081395.',
      'Paso 2 — x₃ = 0.56383839 con |Δx| = 0.04886145: la cuerda ya cruzó ' +
        'al otro lado de la raíz.',
      'Paso 3 — x₄ = 0.56717036 con |Δx| = 0.00333197 y f = −0.00004242, y ' +
        'x₅ = 0.56714331 con |Δx| = 0.00002705.',
      'Paso 4 — x₆ = 0.56714329 con |Δx| = 2 × 10⁻⁸ < 10⁻⁵: parada en la ' +
        'quinta iteración.',
    ],
    algoritmo:
      'La cuerda entre (0, 1) y (1, −0.63212056) corta el eje en ' +
      '0.61269984, del otro lado de la raíz. El |Δx| cae 0.38730016 → ' +
      '0.04886145 → 0.00333197 → 0.00002705 → 0.00000002: la clásica ' +
      'caída superlineal. La columna f(xₙ) se aplasta todavía más rápido: ' +
      '−0.07081395 → 0.00518235 → −0.00004242 → 0 → 0.',
    criterio:
      'Se detiene en la iteración 5, cuando |Δx| = 2 × 10⁻⁸ < 10⁻⁵: el ' +
      'punto se clavó en 0.56714329. Cinco iteraciones contra 4 de Newton ' +
      'y 6 de la regla falsa, sin derivada.',
    conclusion:
      'La raíz es x ≈ 0.56714329, el valor W(1) de la omega de Lambert ' +
      '(0.5671432904...): el desplazamiento final fue de 2.1 × 10⁻⁸, por ' +
      'debajo de la tolerancia de 1 × 10⁻⁵, y la diferencia con el valor ' +
      'publicado es de 4.1 × 10⁻¹⁰. Cinco cuerdas contra 4 tangentes de ' +
      'Newton — sin decirle al método dónde estaba la raíz.',
    calculo: { funcion: 'e^(-x) - x', x0: 0, x1: 1, tol: 1e-5 },
  },

  {
    id: 'secante-ej3-puente',
    titulo: 'La carga límite sin derivada a mano',
    tipo: 'casuistica',
    enunciado:
      'El cálculo de la carga límite de un puente colgante se reduce a ' +
      'encontrar λ tal que g(λ) = λ·e^λ − 5 = 0, con λ = carga aplicada ' +
      'sobre la carga de referencia (adimensional). La derivada de esa ' +
      'función es incómoda de montar en la planilla, así que el ingeniero ' +
      'la saltea: usa dos cargas de tanteo, λ₀ = 1 y λ₁ = 2, y deja que la ' +
      'secante haga el resto. Tolerancia: 10⁻⁴.',
    ecuacion: 'λ·e^λ − 5 = 0',
    parametros: [
      { etiqueta: 'Función', valor: 'g(λ) = λ·e^λ − 5' },
      { etiqueta: 'Semillas', valor: 'λ₀ = 1, λ₁ = 2' },
      { etiqueta: 'Tolerancia', valor: '10⁻⁴' },
    ],
    extraccion: {
      busqueda:
        'el valor λ donde la función de diseño g(λ) = λ·e^λ − 5 se anula — ' +
        'el punto exacto en que la carga aplicada iguala a la demanda del ' +
        'puente y el sistema queda al límite.',
      datos: [
        {
          simbolo: 'λ₀',
          valor: '1',
          queEs:
            'primera carga de tanteo del ingeniero: es la carga de referencia, donde la demanda todavía sobra',
        },
        {
          simbolo: 'λ₁',
          valor: '2',
          queEs:
            'segunda carga de tanteo: el doble de la referencia, donde la demanda ya quedó corta',
        },
        {
          simbolo: 'tol',
          valor: '10⁻⁴',
          queEs:
            'cuánto se acepta mover la carga entre iteraciones antes de dar por cerrado el cálculo',
        },
        {
          simbolo: 'g(λ)',
          valor: 'λ·e^λ − 5',
          queEs:
            'función de demanda: cuánto falta o sobra cuando la carga aplicada vale λ',
        },
      ],
      formulacion:
        'g(λ) = λ·e^λ − 5 es trascendente: no hay despeje con fórmula ' +
        'escolar. Como su derivada g′(λ) = e^λ·(λ + 1) es engorrosa de ' +
        'cargar en la planilla, el ingeniero toma f(λ) = g(λ) y aplica la ' +
        'SECANTE, que no pide f′: solo dos SEMILLAS distintas, λ₀ = 1 y ' +
        'λ₁ = 2. Sin Bolzano que lo ampare, cualquier paso puede caer donde ' +
        'la ecuación de diseño no tiene sentido — eso se vigila después.',
    },
    interpretacion:
      'Con solo dos cargas de tanteo, 1 y 2, la secante entra directo: la ' +
      'cuerda entre (1, −2.28171817) y (2, 9.7781122) corta el eje en ' +
      '1.18919986 y en 6 iteraciones llega a λ = 1.32672467. Newton lo ' +
      'cerró en 4 con la derivada; acá la secante paga dos iteraciones ' +
      'extra por no calcularla.',
    pasos: [
      'Paso 0 — Semillas: g(1) = 1·e¹ − 5 = 2.71828183 − 5 = −2.28171817 ' +
        'y g(2) = 2·e² − 5 = 14.7781122 − 5 = 9.7781122.',
      'Paso 1 — λ₂ = 2 − 9.7781122·(2 − 1)/(9.7781122 − (−2.28171817)) = ' +
        '2 − 9.7781122/12.05983037 = 1.18919986. Ahí g da −1.09413001.',
      'Paso 2 — λ₃ = 1.27079487 con |Δx| = 0.08159502: la cuerda sigue del ' +
        'lado negativo (g = −0.47128851), pero ya mucho más cerca.',
      'Paso 3 — λ₄ = 1.33253577 (|Δx| = 0.0617409) es donde cruza de lado ' +
        '(g = 0.05116793), y λ₅ = 1.32648904 ya da g = −0.0020658: la ' +
        'cuerda orbita la raíz.',
      'Paso 4 — λ₆ = 1.32672467 con |Δx| = 9.8 × 10⁻⁷ < 10⁻⁴: parada en la ' +
        'sexta iteración.',
    ],
    algoritmo:
      'La columna g(λ) baja de −2.28171817 a −1.09413001 y −0.47128851, ' +
      'cruza a 0.05116793, y se aplasta — −0.0020658, −0.00000857, 0. El ' +
      '|Δx| recorre 0.81080014, 0.08159502, 0.0617409, 0.00604673, ' +
      '0.00023465, 0.00000098: seis filas sin una sola evaluación de ' +
      'derivada.',
    criterio:
      'Se detiene en la iteración 6, cuando |Δx| = 9.8 × 10⁻⁷ < 10⁻⁴: el ' +
      'punto se clavó en 1.32672467. Newton llegó en 4, pero calculando la ' +
      'derivada en cada paso; la secante no la tocó.',
    conclusion:
      'La carga límite es λ ≈ 1.32672467, el valor W(5) de la omega de ' +
      'Lambert: el desplazamiento final fue de 9.8 × 10⁻⁷, por debajo de ' +
      'la tolerancia de 1 × 10⁻⁴, y la diferencia con el valor publicado ' +
      '1.3267246652... es de 4.8 × 10⁻⁹. Seis iteraciones sin derivada ' +
      '—dos cargas de tanteo y nada más—, contra las 4 de Newton que sí ' +
      'la usa.',
    calculo: { funcion: 'x*e^x - 5', x0: 1, x1: 2, tol: 1e-4 },
  },

  {
    id: 'secante-ej4-semivida',
    titulo: 'La semivida a partir de dos lecturas',
    tipo: 'casuistica',
    enunciado:
      'Un laboratorio sigue el decaimiento de un isótopo con constante 1 ' +
      'por minuto: la fracción que queda tras T minutos es e^(−T). Se busca ' +
      'el instante en que queda exactamente la MITAD del material. El ' +
      'físico ya cronometró dos puntos —T = 0, con todo el material, y ' +
      'T = 2, con menos de la mitad— y no quiere derivar la exponencial: ' +
      'usa la secante. Tolerancia: 10⁻⁵ minutos.',
    ecuacion: 'e^(−T) − 0.5 = 0',
    parametros: [
      { etiqueta: 'Función', valor: 'f(T) = e^(−T) − 0.5' },
      { etiqueta: 'Semillas', valor: 'T₀ = 0, T₁ = 2' },
      { etiqueta: 'Tolerancia', valor: '10⁻⁵' },
    ],
    extraccion: {
      busqueda:
        'el instante T en que la fracción restante e^(−T) se iguala a 0.5 — ' +
        'la mitad del material —, es decir, la raíz de f(T) = e^(−T) − 0.5.',
      datos: [
        {
          simbolo: 'T₀',
          valor: '0 minutos',
          queEs:
            'primera lectura del físico: el arranque, donde queda todo el material',
        },
        {
          simbolo: 'T₁',
          valor: '2 minutos',
          queEs:
            'segunda lectura: donde ya queda menos de la mitad (e⁻² ≈ 0.135)',
        },
        {
          simbolo: 'constante',
          valor: '1 min⁻¹',
          queEs:
            'velocidad del decaimiento: la que fija que el cruce con la mitad ocurra en ln 2',
        },
        {
          simbolo: 'tol',
          valor: '10⁻⁵ min',
          queEs:
            'precisión pedida al cálculo: cuánto se acepta mover el tiempo entre iteraciones',
        },
      ],
      formulacion:
        'Despejando e^(−T) = 0.5 queda f(T) = e^(−T) − 0.5 = 0: una ' +
        'trascendente sin solución elemental. El físico no quiere derivar, ' +
        'así que toma la secante, que solo pide DOS SEMILLAS distintas ' +
        '(T₀ = 0 y T₁ = 2) y las evalúa en f. No hay cambio de signo que ' +
        'verificar ni Bolzano que invocar.',
    },
    interpretacion:
      'La cuerda entre (0, 0.5) y (2, −0.36466472) cruza el cero en ' +
      'T = 1.15651764 y da un primer rebote: la semivida está entre ese ' +
      'valor y la raíz. En 7 iteraciones —una más que Newton— la secante ' +
      'llega a ln 2 = 0.69314718, sin tocar la derivada.',
    pasos: [
      'Paso 0 — Semillas: f(0) = e⁰ − 0.5 = 0.5 y f(2) = e⁻² − 0.5 = ' +
        '0.13533528 − 0.5 = −0.36466472.',
      'Paso 1 — T₂ = 2 − (−0.36466472)·(2 − 0)/(−0.36466472 − 0.5) = ' +
        '2 − (−0.72932944)/(−0.86466472) = 1.15651764. Ahí f da −0.18542025.',
      'Paso 2 — T₃ = 0.28397355 con |Δx| = 0.8725441: la cuerda saltó al ' +
        'otro lado de la raíz, la zona más brusca.',
      'Paso 3 — T₄ = 0.78731447, T₅ = 0.71134577 y T₆ = 0.69227416: ' +
        'el |Δx| ya baja 0.50334093 → 0.0759687 → 0.01907162.',
      'Paso 4 — T₇ = 0.69314718 con |Δx| = 7.96 × 10⁻⁶ < 10⁻⁵: parada en ' +
        'la séptima iteración.',
    ],
    algoritmo:
      'La columna f(T) alterna de signo un par de veces antes de ' +
      'asentarse: 0.25278656, −0.04493475, −0.009017, 0.0004367, ' +
      '−0.00000398, 0. El |Δx| arranca en 0.84348236, sube a 0.8725441 ' +
      '(la cuerda pasó de largo) y después baja parejo hasta 0.00000796: ' +
      'siete filas sin una sola derivada.',
    criterio:
      'Se detiene en la iteración 7, cuando |Δx| = 7.96 × 10⁻⁶ < 10⁻⁵. La ' +
      'secante usó solo las dos lecturas del físico y evaluaciones de f, ' +
      'nunca de f′.',
    conclusion:
      'El periodo de semivida es T ≈ 0.69314718, que es ln 2 (el valor ' +
      'exacto es 0.6931471806...): el desplazamiento final fue de ' +
      '7.96 × 10⁻⁶, por debajo de la tolerancia de 1 × 10⁻⁵, y la ' +
      'diferencia con ln 2 es de 6 × 10⁻¹⁰. Siete iteraciones contra las ' +
      '5 de Newton, pero sin derivar la exponencial.',
    calculo: { funcion: 'e^(-x) - 0.5', x0: 0, x1: 2, tol: 1e-5 },
  },
];

/* ================================================================== */
/* EJERCICIOS                                                          */
/* ================================================================== */

export const EJERCICIOS_SECANTE: Ejercicio[] = [
  {
    id: 'secante-ejercicio-1',
    titulo: 'Dos puntos a la derecha de la raíz',
    tipo: 'numerico',
    enunciado:
      'Resolver x² + 2x − 15 = 0 con la secante, arrancando de dos puntos ' +
      'que están LOS DOS a la derecha de la raíz: x₀ = 4 y x₁ = 5. ' +
      'Tolerancia 10⁻⁴. La ecuación tiene dos raíces (3 y −5); estos dos ' +
      'puntos solo van a ver una.',
    ecuacion: 'x² + 2x − 15 = 0',
    parametros: [
      { etiqueta: 'Función', valor: 'f(x) = x² + 2x − 15' },
      { etiqueta: 'Semillas', valor: 'x₀ = 4, x₁ = 5' },
      { etiqueta: 'Tolerancia', valor: '10⁻⁴' },
    ],
    interpretacion:
      'Ninguno de los dos puntos tiene cambio de signo (f(4) = 9 y ' +
      'f(5) = 20, los dos positivos): aun así la secante funciona, porque ' +
      'es un método abierto y no exige Bolzano. La cuerda entre 4 y 5 ' +
      'corta el eje en 3.18181818 y en 5 iteraciones llega a la raíz 3. ' +
      'Bisección habría fallado acá de entrada: pide signo opuesto en los ' +
      'extremos.',
    pasos: [
      'Paso 0 — Semillas: f(4) = 16 + 8 − 15 = 9 y f(5) = 25 + 10 − 15 = 20. ' +
        'Los dos del mismo signo.',
      'Paso 1 — x₂ = 5 − 20·(5 − 4)/(20 − 9) = 5 − 20/11 = 3.18181818. Ahí ' +
        'f da 1.48760331: la cuerda ya cruzó la raíz.',
      'Paso 2 — x₃ = 3.03571429 con |Δx| = 0.1461039: la cuerda se acercó ' +
        'mucho.',
      'Paso 3 — x₄ = 3.0007902 con |Δx| = 0.03492408 y x₅ = 3.00000351 con ' +
        '|Δx| = 0.00078669.',
      'Paso 4 — x₆ = 3 con |Δx| = 0.00000351 < 10⁻⁴: parada en la quinta ' +
        'iteración, con f = 0.',
    ],
    algoritmo:
      'La columna f(xₙ) empieza en 1.48760331 (la cuerda cortó donde f ' +
      'todavía valía positivo) y cae a 0.2869898, 0.00632224, 0.00002809, ' +
      '0. El |Δx| va 1.81818182 → 0.1461039 → 0.03492408 → 0.00078669 → ' +
      '0.00000351: la raíz exacta 3 atrapada en cinco pasos.',
    criterio:
      'Se detiene en la iteración 5, cuando |Δx| = 3.51 × 10⁻⁶ < 10⁻⁴. ' +
      'Ningún punto del arranque tenía cambio de signo: bisección no ' +
      'hubiera arrancado.',
    conclusion:
      'La raíz es x ≈ 3 (la otra, −5, queda fuera de estas semillas): el ' +
      'desplazamiento final fue de 3.51 × 10⁻⁶, por debajo de la ' +
      'tolerancia de 1 × 10⁻⁴, y en la tabla el punto ya se escribe como 3 ' +
      'exacto. Cinco iteraciones sin cambio de signo ni derivada.',
    pista:
      'Mirá los signos: f(4) = 9 y f(5) = 20, los dos positivos. La ' +
      'secante no necesita Bolzano, así que igual arranca. La cuerda entre ' +
      '(4, 9) y (5, 20) es casi vertical (pendiente 11), así que su corte ' +
      'con el eje cae bien cerca de 3: x₂ = 5 − 20/11 = 3.18181818. La ' +
      'otra raíz, −5, es invisible para estas dos semillas.',
    calculo: { funcion: 'x^2 + 2*x - 15', x0: 4, x1: 5, tol: 1e-4 },
  },

  {
    id: 'secante-ejercicio-2',
    titulo: 'El logaritmo resuelto con dos puntos vecinos',
    tipo: 'numerico',
    enunciado:
      'Resolver ln(x + 1) − 3 = 0 con la secante desde x₀ = 18 y x₁ = 20, ' +
      'tolerancia 10⁻⁴. Es el mismo problema de la regla falsa (donde la ' +
      'cuerda se clavaba) y de Newton (donde la derivada chica aceleraba), ' +
      'pero acá sin derivada y con dos puntos.',
    ecuacion: 'ln(x + 1) − 3 = 0',
    parametros: [
      { etiqueta: 'Función', valor: 'f(x) = ln(x + 1) − 3' },
      { etiqueta: 'Semillas', valor: 'x₀ = 18, x₁ = 20' },
      { etiqueta: 'Tolerancia', valor: '10⁻⁴' },
    ],
    interpretacion:
      'La raíz es e³ − 1 = 19.08553692..., que con dos puntos vecinos ' +
      'alrededor (18 y 20) queda atrapada en solo 4 iteraciones. Cerca de ' +
      'la raíz la función es casi plana (f′ = 1/(x + 1) ≈ 0.05), así que ' +
      'la cuerda también lo es — pero como los dos puntos ya flanquean la ' +
      'raíz, la secante no sufre. La bisección necesitó 15 para lo mismo, ' +
      'y la regla falsa también llegó en 4.',
    pasos: [
      'Paso 0 — Semillas: f(18) = ln(19) − 3 = 2.94443898 − 3 = −0.05556102 ' +
        'y f(20) = ln(21) − 3 = 3.04452244 − 3 = 0.04452244.',
      'Paso 1 — x₂ = 20 − 0.04452244·(20 − 18)/(0.04452244 − (−0.05556102)) ' +
        '= 20 − 0.08904488/0.10008346 = 19.11029378. Ahí f da 0.00123181.',
      'Paso 2 — x₃ = 19.08497765 con |Δx| = 0.02531613: la cuerda ya está ' +
        'pegada a la raíz.',
      'Paso 3 — x₄ = 19.08553727 con |Δx| = 0.00055962 y f = 2 × 10⁻⁸.',
      'Paso 4 — x₅ = 19.08553692 con |Δx| = 3.4 × 10⁻⁷ < 10⁻⁴: parada en ' +
        'la cuarta iteración.',
    ],
    algoritmo:
      'Con los dos puntos tan cerca, la columna |Δx| arranca chica — ' +
      '0.88970622 — y se derrumba rápido: 0.02531613, 0.00055962, ' +
      '0.00000034. La columna f(xₙ) pasa de 0.00123181 a −0.00002784 y ' +
      'luego a 2 × 10⁻⁸ y 0. Cuatro filas, ninguna derivada.',
    criterio:
      'Se detiene en la iteración 4, cuando |Δx| = 3.4 × 10⁻⁷ < 10⁻⁴. La ' +
      'bisección necesitó 15; la regla falsa llegó en 4, empatando con la ' +
      'secante — las dos sin derivada.',
    conclusion:
      'La raíz es x ≈ 19.08553692 (= e³ − 1, con e³ − 1 = ' +
      '19.0855369232...): el desplazamiento final fue de 3.4 × 10⁻⁷, por ' +
      'debajo de la tolerancia de 1 × 10⁻⁴, y la diferencia con el valor ' +
      'exacto es de 3.2 × 10⁻⁹, solo formato de la tabla. Cuatro ' +
      'iteraciones, contra 3 de Newton (que usa la derivada) y 15 de la ' +
      'bisección; la regla falsa también llegó en 4.',
    pista:
      'Los dos puntos 18 y 20 ya encierran la raíz e³ − 1 ≈ 19.0855, así ' +
      'que la cuerda entre (18, −0.05556) y (20, 0.04452) corta el eje casi ' +
      'en el medio: x₂ = 20 − 0.04452·2/0.10008 = 19.1103. Como la función ' +
      'es plana en esa zona, conviene arrancar con puntos cercanos a la ' +
      'raíz, no lejanos.',
    calculo: { funcion: 'ln(x+1) - 3', x0: 18, x1: 20, tol: 1e-4 },
  },

  {
    id: 'secante-ejercicio-3',
    titulo: 'Dos equilibrios y una planilla sin derivadas',
    tipo: 'casuistica',
    enunciado:
      'La ganancia de una pyme, en miles de pesos, depende de la producción ' +
      'x (en miles de unidades) según π(x) = 60x − 0.05x³ − 8x² − 100. La ' +
      'gerencia quiere el punto de equilibrio (donde la ganancia se anula) ' +
      'y su analista llenó una planilla con la función pero no con la ' +
      'derivada. Prueba dos niveles de producción cercanos al que busca: ' +
      'x₀ = 2 y x₁ = 3. Tolerancia: 10⁻⁴ miles de unidades.',
    ecuacion: '60x − 0.05x³ − 8x² − 100 = 0',
    parametros: [
      { etiqueta: 'Función', valor: 'π(x) = 60x − 0.05x³ − 8x² − 100' },
      { etiqueta: 'Semillas', valor: 'x₀ = 2, x₁ = 3' },
      { etiqueta: 'Tolerancia', valor: '10⁻⁴' },
    ],
    extraccion: {
      busqueda:
        'el nivel de producción x donde la ganancia π(x) = 60x − 0.05x³ − ' +
        '8x² − 100 se anula: el equilibrio que hay que alcanzar para no ' +
        'perder plata.',
      datos: [
        {
          simbolo: 'x₀',
          valor: '2 (mil unidades)',
          queEs:
            'primer nivel de tanteo del analista: una producción baja, todavía en pérdida',
        },
        {
          simbolo: 'x₁',
          valor: '3 (mil unidades)',
          queEs:
            'segundo nivel de tanteo: una producción mayor, ya con ganancia',
        },
        {
          simbolo: 'tol',
          valor: '10⁻⁴ miles de unidades',
          queEs:
            'precisión aceptada para declarar el equilibrio cerrado',
        },
        {
          simbolo: 'π(x)',
          valor: '60x − 0.05x³ − 8x² − 100',
          queEs:
            'función de ganancia en miles de pesos: ingreso menos costos fijos y variables',
        },
      ],
      formulacion:
        'La ganancia se anula cuando 60x − 0.05x³ − 8x² − 100 = 0: una ' +
        'cúbica que no conviene atacar con fórmula. El analista tiene la ' +
        'función en la planilla pero no su derivada, así que usa la secante, ' +
        'que solo pide DOS SEMILLAS distintas: x₀ = 2 y x₁ = 3. No hay ' +
        'Bolzano ni intervalo que verificar; el modelo tiene DOS raíces, y ' +
        'estos dos puntos apuntan a la primera.',
    },
    interpretacion:
      'El modelo tiene dos equilibrios (2.54174959 y 4.70478842). Con los ' +
      'dos puntos de tanteo 2 y 3 —que encierran el primero— la secante ' +
      'cae en 2.54174959 en 5 iteraciones, sin usar la derivada. Newton ' +
      'tardó 4 con ella; bisección y regla falsa no pueden mostrar que hay ' +
      'dos raíces: un intervalo con cambio de signo solo acota una.',
    pasos: [
      'Paso 0 — Semillas: π(2) = 120 − 0.4 − 32 − 100 = −12.4 (pérdida) y ' +
        'π(3) = 180 − 1.35 − 72 − 100 = 6.65 (ganancia).',
      'Paso 1 — x₂ = 3 − 6.65·(3 − 2)/(6.65 − (−12.4)) = 3 − 6.65/19.05 = ' +
        '2.65091864. Ahí π da 1.90471198: la cuerda ya cruzó el cero.',
      'Paso 2 — x₃ = 2.51080081 con |Δx| = 0.14011783: la cuerda se pasó un ' +
        'poco al otro lado de la raíz.',
      'Paso 3 — x₄ = 2.54334956 con |Δx| = 0.03254876 y x₅ = 2.54177189 ' +
        'con π = 0.00040946.',
      'Paso 4 — x₆ = 2.54174957 con |Δx| = 2.231 × 10⁻⁵ < 10⁻⁴: parada en ' +
        'la quinta iteración.',
    ],
    algoritmo:
      'La columna π(xₙ) cruza el cero entre la primera y la segunda fila ' +
      '(1.90471198 → −0.5763367) y después se aplasta: 0.02935878, ' +
      '0.00040946, −0.0000003. El |Δx| baja de 0.34908136 a 0.00002231 en ' +
      'cinco filas. Ojo con la semilla: con x₀ = 3 y x₁ = 4, la secante ' +
      'cae en la OTRA raíz, 4.70478842.',
    criterio:
      'Se detiene en la iteración 5, cuando |Δx| = 2.231 × 10⁻⁵ < 10⁻⁴. Y ' +
      'el modelo tiene DOS equilibrios: cambiando las semillas a x₀ = 3 y ' +
      'x₁ = 4, la secante devuelve 4.70478842.',
    conclusion:
      'El primer punto de equilibrio es x ≈ 2.54174957 (mil unidades): el ' +
      'desplazamiento final fue de 2.3 × 10⁻⁵, por debajo de la tolerancia ' +
      'de 1 × 10⁻⁴, y la diferencia con la raíz verdadera ' +
      '2.5417495868... es de 1.7 × 10⁻⁸. Pero el modelo tiene DOS ' +
      'equilibrios: cambiando las semillas a 3 y 4, la secante devuelve ' +
      '4.70478842. Las semillas eligen a qué raíz te acercás.',
    pista:
      'Mirá que π(2) = −12.4 y π(3) = 6.65: los dos puntos encierran la ' +
      'primera raíz, así que la cuerda corta el eje enseguida: x₂ = ' +
      '3 − 6.65/19.05 = 2.65091864. Para ver la SEGUNDA raíz (4.70478842) ' +
      'probá en la calculadora con las semillas x₀ = 3 y x₁ = 4.',
    calculo: {
      funcion: '60*x - 0.05*x^3 - 8*x^2 - 100',
      x0: 2,
      x1: 3,
      tol: 1e-4,
    },
  },
];
