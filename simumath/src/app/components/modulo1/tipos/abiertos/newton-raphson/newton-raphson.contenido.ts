import type {
  Ejemplo,
  Ejercicio,
  ContenidoTeoria,
} from '../../../../../shared/models/metodo.model';

/**
 * CONTENIDO DE NEWTON-RAPHSON — todo el texto y los enunciados del método.
 *
 * ── El contenido no se calcula ───────────────────────────────────────
 * Los números de las tablas, de las iteraciones y de las conclusiones
 * salieron de correr el motor de verdad (`newton-raphson.algoritmo.ts`)
 * con los mismos parámetros que están escritos acá. Cuando el ejemplo
 * dice "x ≈ 1.52137971" es porque el motor devolvió ese número, no
 * porque se haya copiado de un libro. Si cambia el algoritmo, hay que
 * recalcular este archivo.
 *
 * ── Por qué hay dos casos con semilla mala ───────────────────────────
 * La teoría usa el mismo problema de bisección y regla falsa (x³ − x − 2)
 * para comparar métodos sobre lo mismo, y una casuística donde el primer
 * paso SE SALE del rango que eligió el usuario: ese es el riesgo propio
 * de los métodos abiertos, que un método cerrado ni siquiera puede mostrar.
 *
 * ── Tres reglas de este archivo ──────────────────────────────────────
 * 1. Toda conclusión arranca con la raíz: "La raíz es x ≈ ...".
 * 2. El error se promete con frases concretas: "el desplazamiento final
 *    fue de X" y "por debajo de la tolerancia de Y" — y el motor tiene
 *    que poder cumplirlas.
 * 3. La frase "diferencia real" sólo aparece cuando el error del motor
 *    es mayor que cero; si la x se clavó (error 0), se habla de "la
 *    diferencia con el valor conocido" sin decir "real".
 */

/* ================================================================== */
/* TEORÍA                                                              */
/* ================================================================== */

export const TEORIA_NEWTON: ContenidoTeoria = {
  concepto:
    'Newton-Raphson no divide un intervalo: arranca de una sola estimación ' +
    'x₀, la llamada semilla, y en cada paso dibuja la TANGENTE de f en el ' +
    'punto actual. El lugar donde esa tangente cruza el eje x se convierte ' +
    'en el nuevo candidato. Si la curva se parece a una recta cerca de la ' +
    'raíz, el primer tiro ya queda pegado; si no, las tangentes siguientes ' +
    'van afinando. Es un método ABIERTO: no pide intervalo ni cambio de ' +
    'signo, pide una buena semilla y la derivada f′.',
  fundamento:
    'La justificación sale del desarrollo de Taylor en dos líneas: cerca de ' +
    'un punto a, f(x) ≈ f(a) + f′(a)·(x − a). Si igualás esa recta a cero ' +
    'y despejás x, queda x = a − f(a)/f′(a), que es exactamente el cruce de ' +
    'la tangente con el eje. Repetir el procedimiento con a = xₙ cada vez ' +
    'más cerca de la raíz es el método. Cuando la raíz es simple (f′ en la ' +
    'raíz distinto de cero) y la semilla arranca en la vecindad donde la ' +
    'aproximación lineal es buena, el error se CUADRA en cada paso: ahí ' +
    'está la ventaja enorme del método.',
  cuandoFalla:
    'Tres formas de caerse, más una silenciosa. Una: si f′(xₙ) queda casi ' +
    'en cero, el paso f(xₙ)/f′(xₙ) se dispara y el nuevo punto queda a ' +
    'miles de unidades — o el motor frena directo con "derivada casi nula". ' +
    'Dos: si la semilla está lejos o la curva se curva mucho, las tangentes ' +
    'pueden mandar el punto hacia donde f no está definida (un tiempo ' +
    'negativo, una longitud negativa) o hacerlo oscilar sin cerrar. Tres: ' +
    'en raíces múltiples f′ también se anula y la convergencia se degrada ' +
    'a lineal. Y la silenciosa: como no hay intervalo, nada garantiza que ' +
    'el primer paso siga dentro del rango donde la función tiene sentido.',
  ordenConvergencia:
    'Es cuadrática: si eₙ es el error en la iteración n, entonces ' +
    'eₙ₊₁ ≈ C·eₙ². En la práctica, la cantidad de cifras correctas se ' +
    'Duplica en cada paso — la mitad de las veces que le toca a la ' +
    'bisección (error a la mitad) o a la regla falsa (constante ~30%). ' +
    'Por eso en esta página Newton cierra en 3 o 4 iteraciones lo que a la ' +
    'bisección le tomó 17 y a la regla falsa entre 5 y 10. La letra chica: ' +
    'eso vale cerca de la raíz y con f′ distinto de cero; lejos, la ' +
    'convergencia es cualquier cosa, y con raíces dobles cae a orden 1.',
  videoUrl: undefined,

  algoritmo: {
    formula: 'xₙ₊₁ = xₙ − f(xₙ) / f′(xₙ)',

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
          'No existe acá. Bolzano necesita un intervalo [a, b] con cambio de ' +
          'signo, y Newton es un método ABIERTO: no arranca con intervalo ' +
          'sino con una semilla suelta. Si el primer paso se sale del rango ' +
          'donde f tiene sentido, nadie lo frena. Por eso el criterio de ' +
          'parada es el desplazamiento, y la única garantía real es la de ' +
          'f(raíz) ≈ 0, que se revisa DESPUÉS de converger.',
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
          '|f(x)| + |f′(x)|·|Δx|, o el valor máximo de f en la zona). ' +
          'Corrige en parte el problema de escalar la función, pero sigue ' +
          'siendo una medición de f y no de la distancia real de x a la ' +
          'raíz, y es más difícil de explicar en clase.',
      },
    ],

    pasos: [
      'Elegir la semilla x₀ con criterio: es el único dato que aporta el usuario y no hay intervalo que verificar.',
      'Evaluar f(xₙ) y f′(xₙ) en el punto actual. Si |f′(xₙ)| está casi en cero, frenar: el paso se va a disparar.',
      'Calcular el nuevo punto con la fórmula: xₙ₊₁ = xₙ − f(xₙ)/f′(xₙ).',
      'Evaluar f(xₙ₊₁). Si da cero exacto, se terminó: el punto ES la raíz.',
      'Medir el desplazamiento |Δx| = |xₙ₊₁ − xₙ| y compararlo con la tolerancia pedida.',
      'Si |Δx| todavía no llega a la tolerancia, correr el índice: la x vieja queda reemplazada por la nueva.',
      'Volver al paso 2. Si se agota el máximo de iteraciones, avisar que no convergió y devolver el último punto.',
    ],

    ventajas: [
      'No necesita intervalo: con una sola semilla arranca, mientras que bisección y regla falsa exigen acotar con cambio de signo.',
      'Convergencia cuadrática en raíces simples: duplica los decimales correctos en cada paso y cierra en muy pocas iteraciones.',
      'Aprovecha la derivada: para funciones suaves casi siempre hace menos iteraciones que cualquier método cerrado.',
      'Si f es lineal, llega a la raíz exacta en UNA sola iteración.',
      'El criterio |Δx| es invariante a la escala de f: multiplicar la función por 1000 no cambia ni un paso.',
    ],

    limitaciones: [
      'Si la derivada queda casi en cero en la semilla, el primer paso se dispara o el método directamente no puede avanzar.',
      'Sin intervalo no hay red de seguridad: una semilla mala puede hacer divergir, oscilar o salirse del dominio de f.',
      'Puede pisar el rango físico del problema (tiempo negativo, longitud negativa) sin que nadie lo avise.',
      'En raíces múltiples f′ también se anula: la convergencia baja a lineal y la parada por Δx puede engañar.',
      'Cada paso exige evaluar f′ — a mano, por diferencias numéricas o con otra fórmula; es trabajo extra que los métodos cerrados no piden.',
    ],

    recomendaciones: [
      'Elegir la semilla mirando la función: graficar o evaluar f en un par de puntos antes de arrancar cuesta un minuto.',
      'Correr SIEMPRE con tope de iteraciones: es la única defensa razonable contra una semilla pobre.',
      'Verificar al final que |f(raíz)| ≈ 0: el método no lo garantiza y un Δx chico no prueba nada por sí solo.',
      'Si f′ cambia de signo cerca de la semilla o el primer paso se dispara, cambiar de método (bisección, secante) antes de pelear con Newton.',
      'Usar |Δx| como criterio de parada: es el más estable frente a cómo se escale la función. Con 10⁻⁴ a 10⁻⁶ alcanza para casi todo trabajo numérico.',
    ],
  },

  /* ---------------------------------------------------------------- */
  /* Ejemplo numérico de la teoría                                     */
  /* ---------------------------------------------------------------- */
  ejemploNormal: {
    id: 'newton-teoria-numerico',
    titulo: 'La raíz cúbica de 2, pero con tangentes',
    tipo: 'numerico',
    enunciado:
      'Resolver x³ − x − 2 = 0, la MISMA ecuación que se resolvió con ' +
      'bisección y regla falsa, pero arrancando desde una sola estimación: ' +
      'x₀ = 1.5. No hay intervalo que verificar.',
    ecuacion: 'x³ − x − 2 = 0',
    parametros: [
      { etiqueta: 'Función', valor: 'f(x) = x³ − x − 2' },
      { etiqueta: 'Semilla', valor: 'x₀ = 1.5' },
      { etiqueta: 'Tolerancia', valor: '10⁻⁵' },
    ],
    interpretacion:
      'La misma ecuación que la bisección resolvió en 17 iteraciones y la ' +
      'regla falsa en 10: x³ = x + 2 no tiene fórmula de secundaria. La ' +
      'diferencia es el arranque: en vez de un intervalo, Newton toma la ' +
      'estimación x₀ = 1.5 y la derivada. Con tolerancia 10⁻⁵ cierra en 3 ' +
      'iteraciones, y la primera ya deja f(1.52173913) en 0.0021 — casi ' +
      'pegada a la raíz.',
    pasos: [
      'Paso 0 — Semilla: f(1.5) = 1.5³ − 1.5 − 2 = 3.375 − 3.5 = −0.125 y ' +
        'f′(1.5) = 3·1.5² − 1 = 5.75. No hay Bolzano que verificar: Newton ' +
        'arranca derecho desde la estimación.',
      'Paso 1 — x₁ = 1.5 − (−0.125)/5.75 = 1.5 + 0.02173913 = 1.52173913. ' +
        'Ahí f da 0.00213693: de −0.125 a casi cero en un solo tiro, porque ' +
        'la tangente le pega a la curva.',
      'Paso 2 — f′(1.52173913) = 5.94706994 y ' +
        'x₂ = 1.52173913 − 0.00213693/5.94706994 = 1.52137981. El ' +
        'desplazamiento ya cayó a 0.00035932 y f quedó en 0.00000059.',
      'Paso 3 — f′ = 5.94378954 y x₃ = 1.52137971 con ' +
        '|Δx| = 0.0000001 < 10⁻⁵: parada en la tercera iteración, con f = 0 ' +
        'en la tabla.',
    ],
    algoritmo:
      'Cada fila anota f y f′ en el punto actual, resta el cociente f/f′ y ' +
      'el resultado es la nueva x. Mirá la columna f′: no para de crecer ' +
      'levemente (5.75 → 5.94706994 → 5.94378954), o sea que la curva se va ' +
      'empinando y cada tangente muerde mejor. La columna |Δx| se desploma ' +
      'de 0.0217 a 0.000359 a 0.0000001: eso es la convergencia cuadrática ' +
      'en acción, el error se cuadra en cada paso.',
    criterio:
      'Se detiene en la iteración 3, cuando |Δx| = 1 × 10⁻⁷ < 10⁻⁵: el ' +
      'punto se movió una diezmillonésima. Para la misma tolerancia la ' +
      'bisección necesitó 17 iteraciones y la regla falsa 10.',
    conclusion:
      'La raíz es x ≈ 1.52137971 (el valor exacto es 1.5213797068...): el ' +
      'desplazamiento final fue de 1 × 10⁻⁷, por debajo de la tolerancia ' +
      'de 1 × 10⁻⁵. La diferencia real es de 3.2 × 10⁻⁹, puro redondeo de ' +
      'la tabla. Fueron 3 iteraciones contra 17 de la bisección y 10 de la ' +
      'regla falsa.',
    calculo: { funcion: 'x^3 - x - 2', x0: 1.5, tol: 1e-5 },
  },

  /* ---------------------------------------------------------------- */
  /* Ejemplo de casuística de la teoría                                */
  /* ---------------------------------------------------------------- */
  ejemploCasuistica: {
    id: 'newton-teoria-casuistica',
    titulo: 'La corrección del sensor que sale del rango medido',
    tipo: 'casuistica',
    enunciado:
      'El sensor de nivel de un tanque industrial viene calibrado con la ' +
      'ley V(Δ) = Δ³ − 7Δ + 4 (decenas de litros), donde Δ es la CORRECCIÓN ' +
      'que hay que aplicar a la lectura cruda, en decímetros. El técnico ' +
      'sabe por el historial que la corrección está entre −3 y −2 dm — ese ' +
      'es el rango que cubre su calibrador de campo — y estima Δ₀ = −2.4 dm ' +
      'como punto de partida. Precisión pedida: 10⁻⁶ dm.',
    ecuacion: 'Δ³ − 7Δ + 4 = 0',
    parametros: [
      { etiqueta: 'Función', valor: 'V(Δ) = Δ³ − 7Δ + 4' },
      { etiqueta: 'Semilla', valor: 'Δ₀ = −2.4' },
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
          valor: '−2.4 dm',
          queEs:
            'estimación inicial del técnico: la corrección que cree razonable antes de calcular',
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
        'nada: se identifica f(Δ) = Δ³ − 7Δ + 4. Newton no pide intervalo ' +
        'con cambio de signo ni verificación de Bolzano: pide la SEMILLA ' +
        'Δ₀ = −2.4, que el técnico elige dentro del rango que conoce. Ese ' +
        'es justamente el riesgo que se va a ver en la primera iteración: ' +
        'el método puede saltar afuera del rango sin avisar.',
    },
    interpretacion:
      'La lección de este ejemplo es que el método abierto NO respeta el ' +
      'rango que escogió el usuario. El técnico acotó [−3, −2] y la PRIMERA ' +
      'tangente se va a −3.07859922: afuera del calibrador, con la función ' +
      'en −3.62807055, un valor que en el tablero del tanque nadie midió. ' +
      'Aun así la curva lo rescata, regresa al rango y cierra en 5 ' +
      'iteraciones contra las 20 de la bisección y las 6 de la regla falsa.',
    pasos: [
      'Paso 0 — Semilla: V(−2.4) = (−2.4)³ − 7·(−2.4) + 4 = −13.824 + 16.8 ' +
        '+ 4 = 6.976 y V′(−2.4) = 3·(−2.4)² − 7 = 10.28. No se verifica ' +
        'cambio de signo: el método confía en la estimación del técnico.',
      'Paso 1 — Δ₁ = −2.4 − 6.976/10.28 = −2.4 − 0.67859922 = ' +
        '−3.07859922: ¡el primer paso SALE del rango [−3, −2] del ' +
        'calibrador! V ahí vale −3.62807055.',
      'Paso 2 — V′(−3.07859922) = 21.43331951 y ' +
        'Δ₂ = −3.07859922 + 3.62807055/21.43331951 = −2.90932677: ya ' +
        'volvió adentro del rango, con V = −0.25978462.',
      'Paso 3 — Δ₃ = −2.89520232 (|Δx| = 0.01412445) y Δ₄ = ' +
        '−2.89510652 (|Δx| = 0.0000958): la tangente casi no tiene más ' +
        'a dónde moverse y f queda en −0.00000008.',
      'Paso 4 — La quinta iteración devuelve el MISMO −2.89510652 con ' +
        '|Δx| = 0: la x se clavó.',
    ],
    algoritmo:
      'Cada fila lee el punto actual: la columna f(xᵢ) es el valor de la ' +
      'ley en la x recién calculada y f′(xᵢ) es la pendiente en el punto ' +
      'ANTERIOR, la que hizo falta para moverse. El |Δx| arranca enorme ' +
      '(0.67859922), baja a 0.16927245, después a 0.01412445, a ' +
      '0.0000958 y por fin a 0: es la cuadrática aterrizando. La fila 4 ' +
      'ya muestra −2.89510652 y la 5 repite el mismo número.',
    criterio:
      'Se detiene en la iteración 5, cuando |Δx| = 0: el punto se quedó ' +
      'clavado en −2.89510652 y f redondea a 0 con una tolerancia pedida ' +
      'de 1 × 10⁻⁶. Lejos del criterio de Bolzano: acá lo único que se ' +
      'mide es cuánto se movió la x.',
    conclusion:
      'La corrección es Δ ≈ −2.89510652: la quinta iteración repite el ' +
      'mismo punto con |Δx| = 0, muy por debajo de la tolerancia de ' +
      '1 × 10⁻⁶ (el valor conocido es −2.8951065159..., la diferencia es ' +
      'de 4.1 × 10⁻⁹, puro formato de la tabla). Newton ni siquiera usó el ' +
      'rango [−3, −2] — se salió en el primer paso — y aun así hizo falta ' +
      'menos iteraciones que a la regla falsa (6) y a la bisección (20).',
    calculo: { funcion: 'x^3 - 7*x + 4', x0: -2.4, tol: 1e-6 },
  },
};

/* ================================================================== */
/* EJEMPLOS                                                            */
/* ================================================================== */

export const EJEMPLOS_NEWTON: Ejemplo[] = [
  {
    id: 'newton-ej1-dottie',
    titulo: 'La constante que se mira a sí misma',
    tipo: 'numerico',
    enunciado:
      'Resolver x − cos(x) = 0, la ecuación de la constante de Dottie: el ' +
      'único punto donde la recta y = x toca la curva y = cos(x). No tiene ' +
      'solución con fórmula, sólo se puede calcular iterando.',
    ecuacion: 'x − cos(x) = 0',
    parametros: [
      { etiqueta: 'Función', valor: 'f(x) = x − cos(x)' },
      { etiqueta: 'Semilla', valor: 'x₀ = 0.5' },
      { etiqueta: 'Tolerancia', valor: '10⁻⁵' },
    ],
    interpretacion:
      'La constante de Dottie existe y es 0.7390851332..., pero no tiene ' +
      'expresión con elementos elementales: sólo se la puede obtener ' +
      'iterando. Newton arranca en 0.5, a mitad de camino entre 0 y 1, y en ' +
      '4 iteraciones la tiene clavada. Para la misma tolerancia la bisección ' +
      'necesitó 17 iteraciones y la regla falsa 5.',
    pasos: [
      'Paso 0 — Semilla: f(0.5) = 0.5 − cos(0.5) = 0.5 − 0.87758256 = ' +
        '−0.37758256 y f′(0.5) = 1 + sen(0.5) = 1.47942554.',
      'Paso 1 — x₁ = 0.5 − (−0.37758256)/1.47942554 = 0.5 + 0.25522242 = ' +
        '0.75522242. Ahí f da 0.02710331: ya está a centésimas de la raíz.',
      'Paso 2 — f(0.75522242) = 0.02710331 y f′(0.75522242) = 1.68545063, ' +
        'así que x₂ = 0.75522242 − 0.01608075 = 0.73914167: a una ' +
        'cincuentésima de la constante.',
      'Paso 3 — x₃ = 0.73908513 con |Δx| = 0.00005653, y la iteración 4 ' +
        'devuelve el MISMO 0.73908513 con |Δx| = 0: la x dejó de moverse.',
    ],
    algoritmo:
      'Con f(x) = x − cos(x) la derivada es f′(x) = 1 + sen(x), que la tabla ' +
      'muestra subiendo de 1.47942554 a 1.67361203: la curva se va ' +
      'empinando y cada tangente muerde mejor. El |Δx| baja de 0.25522242 a ' +
      '0.01608075, después a 0.00005653 y por fin a 0. La columna f se ' +
      'aplasta todavía más rápido: 0.0271 → 0.0000946 → 0 → 0.',
    criterio:
      'Se detiene en la iteración 4, cuando |Δx| = 0 con la tolerancia ' +
      'pedida de 1 × 10⁻⁵: la x se quedó clavada en 0.73908513. La ' +
      'bisección hizo 17 y la regla falsa 5 para el mismo caso.',
    conclusion:
      'La constante de Dottie es x ≈ 0.73908513 (el valor publicado es ' +
      '0.7390851332...): en la cuarta iteración la x ya no se movía y f ' +
      'redondea a 0, muy por debajo de la tolerancia de 1 × 10⁻⁵; la ' +
      'diferencia con el valor publicado es de 3.2 × 10⁻⁹, sólo formato ' +
      'de la tabla. Cuatro iteraciones contra 17 de la bisección.',
    calculo: { funcion: 'x - cos(x)', x0: 0.5, tol: 1e-5 },
  },

  {
    id: 'newton-ej2-lambert',
    titulo: 'W(1): la inversa que no tiene fórmula',
    tipo: 'numerico',
    enunciado:
      'Resolver e^(−x) − x = 0, la ecuación que define la función omega de ' +
      'Lambert W en el punto 1. Se escribe así para que sea f(x) = 0 y se ' +
      'arraanca desde x₀ = 1, sin intervalo.',
    ecuacion: 'e^(−x) − x = 0',
    parametros: [
      { etiqueta: 'Función', valor: 'f(x) = e^(−x) − x' },
      { etiqueta: 'Semilla', valor: 'x₀ = 1' },
      { etiqueta: 'Tolerancia', valor: '10⁻⁵' },
    ],
    interpretacion:
      'W(1) = 0.5671432904... aparece en la ley de Lambert del producto y ' +
      'en problemas de probabilidad; tampoco tiene expresión cerrada. Es el ' +
      'mismo problema que la regla falsa resolvió en 6 iteraciones con el ' +
      'intervalo [0, 1] acotado a mano: Newton lo cierra en 4 sin pedir ' +
      'intervalo ninguno.',
    pasos: [
      'Paso 0 — Semilla: f(1) = e⁻¹ − 1 = 0.36787944 − 1 = −0.63212056 y ' +
        'f′(1) = −e⁻¹ − 1 = −1.36787944.',
      'Paso 1 — x₁ = 1 − (−0.63212056)/(−1.36787944) = 1 − 0.46211716 = ' +
        '0.53788284: f y f′ tenían el MISMO signo, así que el cociente ya ' +
        'venía negativo y el paso se resta igual.',
      'Paso 2 — f(0.53788284) = 0.04610049 y f′ = −1.58398333, así que ' +
        'x₂ = 0.53788284 + 0.02910415 = 0.56698699, a 0.00016 de la ' +
        'raíz.',
      'Paso 3 — x₃ = 0.56714329 con |Δx| = 0.00015629 y f = 0.00000001; ' +
        'la iteración 4 repite 0.56714329 con |Δx| = 0 y f = 0: parada.',
    ],
    algoritmo:
      'La derivada f′(x) = −e^(−x) − 1 es negativa en todo el recorrido: ' +
      'la columna f′ va de −1.36787944 a −1.58398333 y termina en ' +
      '−1.56714329, justo lo que vale en la raíz. Como f y f′ son del ' +
      'mismo signo en la semilla, el primer paso se RESTA de largo (1 − ' +
      '0.46211716); después los signos cambian y la cuenta suma. El |Δx| ' +
      'cae de 0.46211716 a 0.02910415, a 0.00015629 y a 0.',
    criterio:
      'Se detiene en la iteración 4, cuando |Δx| = 0 con tolerancia ' +
      '1 × 10⁻⁵: el punto se clavó en 0.56714329 y f da 0 en la tabla. ' +
      'Fueron 4 iteraciones contra 17 de la bisección y 6 de la regla ' +
      'falsa.',
    conclusion:
      'La raíz es x ≈ 0.56714329, el valor W(1) de la omega de Lambert ' +
      '(0.5671432904...): la cuarta iteración repite la x con |Δx| = 0, ' +
      'muy por debajo de la tolerancia de 1 × 10⁻⁵, y la diferencia con ' +
      'el valor publicado es de 4.1 × 10⁻¹⁰. Cuatro tangentes contra 17 ' +
      'pasos de bisección y 6 de regla falsa — sin decirle al método ' +
      'dónde estaba la raíz.',
    calculo: { funcion: 'e^(-x) - x', x0: 1, tol: 1e-5 },
  },

  {
    id: 'newton-ej3-isotopo',
    titulo: 'La semivida que arranca en tiempo negativo',
    tipo: 'casuistica',
    enunciado:
      'Un laboratorio sigue el decaimiento de un isótopo con constante 1 ' +
      'por minuto: la fracción de material que queda después de T minutos ' +
      'es e^(−T). Se busca el instante en que queda exactamente la MITAD del ' +
      'material inicial. El cronómetro del laboratorio llega cómodo hasta ' +
      'T = 2 (y ahí ya sólo queda 0.135, menos que la mitad), así que el ' +
      'físico toma T₀ = 2 como semilla del cálculo, con tolerancia de ' +
      '10⁻⁵ minutos.',
    ecuacion: 'e^(−T) − 0.5 = 0',
    parametros: [
      { etiqueta: 'Función', valor: 'f(T) = e^(−T) − 0.5' },
      { etiqueta: 'Semilla', valor: 'T₀ = 2' },
      { etiqueta: 'Tolerancia', valor: '10⁻⁵' },
    ],
    extraccion: {
      busqueda:
        'el instante T en que la fracción restante e^(−T) se iguala a 0.5 — ' +
        'la mitad del material —, es decir, la raíz de f(T) = e^(−T) − 0.5.',
      datos: [
        {
          simbolo: 'T₀',
          valor: '2 minutos',
          queEs:
            'semilla del físico: el mayor tiempo que alcanzó a cronometrar, donde ya quedaba menos de la mitad',
        },
        {
          simbolo: 'constante',
          valor: '1 min⁻¹',
          queEs:
            'velocidad del decaimiento: la que fija que el cruce con la mitad ocurre en ln 2',
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
        'trascendente sin solución elemental, así que toca iterar. Newton ' +
        'no pide intervalo con cambio de signo ni verificación de Bolzano: ' +
        'pide la SEMILLA T₀ = 2, que el físico justifica con su propio ' +
        'cronómetro. Nada garantiza que el primer paso siga en tiempos ' +
        'positivos — y en este ejemplo no lo hace.',
    },
    interpretacion:
      'El ejemplo muestra el riesgo típico del método abierto: la primera ' +
      'tangente salta a T₁ = −0.69452805, un tiempo NEGATIVO donde ' +
      'e^(−T) devuelve 1.50276365 — más material del que había, ' +
      'físicamente imposible. La curva lo rescata igual y a la séptima ' +
      'iteración está en 0.69314718 = ln 2. Para la misma tolerancia la ' +
      'bisección necesitó 19 iteraciones y la regla falsa 13.',
    pasos: [
      'Paso 0 — Semilla: f(2) = e⁻² − 0.5 = 0.13533528 − 0.5 = ' +
        '−0.36466472 y f′(2) = −e⁻² = −0.13533528. La pendiente es CHICA: ' +
        'la curva está casi plana en esa zona.',
      'Paso 1 — T₁ = 2 − (−0.36466472)/(−0.13533528) = 2 − 2.69452805 = ' +
        '−0.69452805. ¡Tiempo negativo! Con f′ casi cero el paso se le ' +
        'fue de largo hacia atrás.',
      'Paso 2 — f(−0.69452805) = e^(0.69452805) − 0.5 = 1.50276365 y ' +
        'f′ = −2.00276365: T₂ = −0.69452805 + 1.50276365/2.00276365 = ' +
        '0.05581693, otra vez tiempo positivo.',
      'Paso 3 — T₃ = 0.52711489 con |Δx| = 0.47129796: el algoritmo ya ' +
        'volvió al rango razonable y encadena pasos cada vez más cortos ' +
        '— 0.68009601, 0.69306238, 0.69314718.',
      'Paso 4 — La séptima iteración devuelve otra vez 0.69314718 con ' +
        '|Δx| = 0: el tiempo se clavó en ln 2.',
    ],
    algoritmo:
      'La columna f′ cuenta la historia: −0.13533528 en la semilla (casi ' +
      'plano, paso salvaje), −2.00276365 en el tiempo negativo (la curva se ' +
      'empina del otro lado), y después se acerca a −0.5, que es lo que ' +
      'vale la derivada justo en la raíz. El |Δx| arranca en 2.69452805, ' +
      'pasa por 0.75034498, 0.47129796, 0.15298112, 0.01296638, ' +
      '0.00008479 y termina en 0: siete números que se van cuadrando.',
    criterio:
      'Se detiene en la iteración 7, cuando |Δx| = 0 y f redondea a 0, con ' +
      'la tolerancia pedida de 1 × 10⁻⁵. El método ni se enteró de que el ' +
      'primer paso había salido del dominio físico: nada lo frenó hasta que ' +
      'la propia curva lo devolvió.',
    conclusion:
      'El periodo de semivida es T ≈ 0.69314718, que es ln 2 (el valor ' +
      'exacto es 0.6931471806...): en la séptima iteración la x ya no se ' +
      'movía y f daba 0 en la tabla, muy por debajo de la tolerancia de ' +
      '1 × 10⁻⁵; la diferencia con ln 2 es de 5.6 × 10⁻¹⁰. Siete ' +
      'iteraciones contra 19 de la bisección y 13 de la regla falsa, ' +
      'incluso arrancando en −0.69 minutos.',
    calculo: { funcion: 'e^(-x) - 0.5', x0: 2, tol: 1e-5 },
  },

  {
    id: 'newton-ej4-puente',
    titulo: 'La carga que no se acotó a mano',
    tipo: 'casuistica',
    enunciado:
      'El cálculo de la carga límite de un puente colgante se reduce a ' +
      'encontrar λ tal que g(λ) = λ·e^λ − 5 = 0, con λ = carga aplicada ' +
      'sobre la carga de referencia (adimensional). La regla falsa resolvió ' +
      'este mismo caso sólo porque se le acotó a mano el intervalo [1, 2]; ' +
      'con [0, 5] no convergía. Acá el ingeniero ni siquiera acota: estima ' +
      'a ojo λ₀ = 0.5, la mitad de la carga de diseño, con tolerancia de ' +
      '10⁻⁴.',
    ecuacion: 'λ·e^λ − 5 = 0',
    parametros: [
      { etiqueta: 'Función', valor: 'g(λ) = λ·e^λ − 5' },
      { etiqueta: 'Semilla', valor: 'λ₀ = 0.5' },
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
          valor: '0.5',
          queEs:
            'estimación de partida del ingeniero: probar primero con la mitad de la carga de diseño',
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
        'escolar que dé la solución. Se toma f(λ) = g(λ) y se aplica ' +
        'Newton, que NO pide intervalo ni cambio de signo: sólo la ' +
        'SEMILLA λ₀ = 0.5, la primera suposición del ingeniero. Sin ' +
        'Bolzano que lo ampare, cualquier paso intermedio puede caer donde ' +
        'la ecuación de diseño no tiene sentido — eso se vigila después, ' +
        'con la mirada del que calcula.',
    },
    interpretacion:
      'La semilla reemplaza al intervalo, pero NO lo protege: de 0.5 la ' +
      'primera tangente se va a λ₁ = 2.18843553, PASANDO de largo la ' +
      'raíz (1.3267), y recién en la segunda vuelta la pendiente fuerte ' +
      'la devuelve. Cierra en 6 iteraciones con |Δx| = 9.7 × 10⁻⁶, ' +
      'contra las 10 que la regla falsa tardó con el intervalo [1, 2] ' +
      'acotado a mano.',
    pasos: [
      'Paso 0 — Semilla: g(0.5) = 0.5·e^0.5 − 5 = 0.82436064 − 5 = ' +
        '−4.17563936 y g′(0.5) = e^0.5·(0.5 + 1) = 2.47308191.',
      'Paso 1 — λ₁ = 0.5 − (−4.17563936)/2.47308191 = 0.5 + 1.68843553 = ' +
        '2.18843553: pasa de largo la raíz y queda con g = 14.52356997.',
      'Paso 2 — g′(2.18843553) = 28.44481516 y λ₂ = 2.18843553 − ' +
        '14.52356997/28.44481516 = 1.67784793: la pendiente la devuelve ' +
        'hacia atrás.',
      'Paso 3 — λ₃ = 1.40002392 (|Δx| = 0.27782401) y λ₄ = 1.3304127 ' +
        '(|Δx| = 0.06961122): ya está flanqueando la raíz.',
      'Paso 4 — λ₅ = 1.32673437 con |Δx| = 0.00367833 y λ₆ = ' +
        '1.32672467 con |Δx| = 0.0000097 < 10⁻⁴: parada en la sexta ' +
        'iteración.',
    ],
    algoritmo:
      'La columna f′ arranca en 2.47308191, salta a 28.44481516 cuando el ' +
      'paso se va lejos (la exponencial se dispara), y después baja ' +
      'parejo — 14.33725495, 9.73280977, 8.81502875, 8.76880112 — hasta ' +
      'el valor de la pendiente en la raíz. El |Δx| hace el mismo ' +
      'recorrido: 1.68843553, 0.5105876, 0.27782401, 0.06961122, ' +
      '0.00367833, 0.0000097. El paso 1 pasó de largo y las cinco filas ' +
      'siguientes son el viaje de vuelta.',
    criterio:
      'Se detiene en la iteración 6, cuando |Δx| = 9.7 × 10⁻⁶ < 10⁻⁴. ' +
      'La regla falsa, con el intervalo [1, 2] acotado a mano, necesitó ' +
      '10 iteraciones para la misma tolerancia.',
    conclusion:
      'La carga límite es λ ≈ 1.32672467 — el valor W(5) de la omega de ' +
      'Lambert: el desplazamiento final fue de 9.7 × 10⁻⁶, por debajo de ' +
      'la tolerancia de 1 × 10⁻⁴, y la diferencia con el valor publicado ' +
      '1.3267246652... es de 4.8 × 10⁻⁹. Seis iteraciones sin acotar ' +
      'intervalo — pero tampoco nadie garantizó que λ₁ = 2.188 tuviera ' +
      'sentido físico. Esa la mira el ingeniero.',
    calculo: { funcion: 'x*e^x - 5', x0: 0.5, tol: 1e-4 },
  },
];

/* ================================================================== */
/* EJERCICIOS                                                          */
/* ================================================================== */

export const EJERCICIOS_NEWTON: Ejercicio[] = [
  {
    id: 'newton-ejercicio-1',
    titulo: 'Una semilla en cero y la raíz a siete y medio',
    tipo: 'numerico',
    enunciado:
      'Resolver x² + 2x − 15 = 0 con Newton, arrancando de la semilla más ' +
      'tonta posible: x₀ = 0, donde la pendiente vale apenas 2. Tolerancia ' +
      '10⁻⁴.',
    ecuacion: 'x² + 2x − 15 = 0',
    parametros: [
      { etiqueta: 'Función', valor: 'f(x) = x² + 2x − 15' },
      { etiqueta: 'Semilla', valor: 'x₀ = 0' },
      { etiqueta: 'Tolerancia', valor: '10⁻⁴' },
    ],
    interpretacion:
      'La ecuación tiene dos raíces (3 y −5) pero una semilla sólo ve una: ' +
      'desde x₀ = 0 la tangente se dispara hasta x₁ = 7.5, lejísimos de la ' +
      '3, y recién ahí la pendiente creciente (f′ = 2x + 2) va frenando el ' +
      'paso: 7.5 → 4.19 → 3.14 → 3.002 → 3.00000064 → 3. Seis ' +
      'iteraciones contra 16 de la bisección y 8 de la regla falsa.',
    pasos: [
      'Paso 0 — Semilla: f(0) = 0 + 0 − 15 = −15 y f′(0) = 2·0 + 2 = 2. ' +
        'Pendiente plana, así que el primer paso va a ser largo.',
      'Paso 1 — x₁ = 0 − (−15)/2 = 7.5: el primer salto queda LEJÍSIMOS ' +
        'de la raíz 3. F(7.5) = 56.24999998, hasta el signo cambió.',
      'Paso 2 — f′(7.5) = 17 y x₂ = 7.5 − 56.24999998/17 = 4.19117647: ' +
        'la pendiente ya es grande y el paso se corta a la mitad.',
      'Paso 3 — x₃ = 3.13666472 (|Δx| = 1.05451175) y x₄ = 3.00225752 ' +
        '(|Δx| = 0.1344072): el algoritmo ya está orbitando la raíz.',
      'Paso 4 — x₅ = 3.00000064 con |Δx| = 0.00225689 y x₆ = 3 con ' +
        '|Δx| = 0.00000064 < 10⁻⁴: parada en la sexta iteración.',
    ],
    algoritmo:
      'La columna f′ es la que va domando el caballo: 2 en la semilla (un ' +
      'paso de 7.5), 17, 10.38, 8.27, 8.00... — a medida que la x se ' +
      'acerca a 3, f′ converge a 2·3 + 2 = 8 y los pasos se achican. La ' +
      'columna f pasa de 56.25 a 10.95, 1.11, 0.018, 0.00000509 y 0: seis ' +
      'filas desde el disparate hasta el número exacto.',
    criterio:
      'Se detiene en la iteración 6, cuando |Δx| = 6.4 × 10⁻⁷ < 10⁻⁴. ' +
      'La bisección necesitó 16 iteraciones y la regla falsa 8 con el ' +
      'mismo criterio.',
    conclusion:
      'La raíz es x ≈ 3 (la otra, −5, queda fuera del alcance de esta ' +
      'semilla): el desplazamiento final fue de 6.4 × 10⁻⁷, por debajo ' +
      'de la tolerancia de 1 × 10⁻⁴, y en la tabla el punto ya se ' +
      'escribe como 3 exacto. Seis iteraciones contra 16 de la bisección ' +
      'y 8 de la regla falsa, pese a que el primer paso fue hasta 7.5.',
    pista:
      'Fijate en la semilla: f(0) = −15 con f′(0) = 2, así que x₁ = 0 + ' +
      '15/2 = 7.5. La derivada chiquita dispara el primer paso; después ' +
      'f′ crece con x y el algoritmo frena solo. Las dos raíces son 3 y ' +
      '−5: ¿por qué crees que esta semilla nunca va a ver la −5?',
    calculo: { funcion: 'x^2 + 2*x - 15', x0: 0, tol: 1e-4 },
  },

  {
    id: 'newton-ejercicio-2',
    titulo: 'El logaritmo que acelera donde la cuerda frenaba',
    tipo: 'numerico',
    enunciado:
      'Resolver ln(x + 1) − 3 = 0 con Newton desde x₀ = 1, tolerancia ' +
      '10⁻⁴. Es el mismo problema de regla falsa — allá la cuerda quedaba ' +
      'casi horizontal y eso la frenaba.',
    ecuacion: 'ln(x + 1) − 3 = 0',
    parametros: [
      { etiqueta: 'Función', valor: 'f(x) = ln(x + 1) − 3' },
      { etiqueta: 'Semilla', valor: 'x₀ = 1' },
      { etiqueta: 'Tolerancia', valor: '10⁻⁴' },
    ],
    interpretacion:
      'La raíz es e³ − 1 = 19.08553692..., lejísima de la semilla. La ' +
      'trampa es la derivada: f′(x) = 1/(x + 1) vale apenas 0.5 en x₀ = 1, ' +
      'y una pendiente chica es un paso LARGO. Newton sube de golpe: +4.6, ' +
      '+7.3, +5.1... y igual cierra en 6 iteraciones. La misma planitud ' +
      'que dejó tirada a la regla falsa durante 18 iteraciones (la cuerda ' +
      'casi no cortaba el eje) acá lo impulsa: 6 contra 16 de la ' +
      'bisección.',
    pasos: [
      'Paso 0 — Semilla: f(1) = ln(2) − 3 = 0.69314718 − 3 = ' +
        '−2.30685282 y f′(1) = 1/(1 + 1) = 0.5.',
      'Paso 1 — x₁ = 1 − (−2.30685282)/0.5 = 1 + 4.61370564 = ' +
        '5.61370564. La pendiente chica dispara el paso: 4.6 de un saque.',
      'Paso 2 — f(5.61370564) = −1.11085589 y f′(5.61370564) = ' +
        '0.15120117, así que x₂ = 5.61370564 + 7.34687388 = ' +
        '12.96057952: otro salto enorme.',
      'Paso 3 — x₃ = 18.0389133 (|Δx| = 5.07833378) y x₄ = ' +
        '19.05778164 (|Δx| = 1.01886834): la función ya casi no queda ' +
        'negativa y el paso empieza a cortarse.',
      'Paso 4 — x₅ = 19.08551774 con |Δx| = 0.0277361 y x₆ = ' +
        '19.08553692 con |Δx| = 0.00001919 < 10⁻⁴: parada en la sexta ' +
        'iteración.',
    ],
    algoritmo:
      'La columna f′ baja sin parar — 0.5, 0.15120117, 0.07163026, ' +
      '0.05252401, 0.04985596, 0.04978712 — porque 1/(x + 1) se achica ' +
      'mientras la x sube; eso hace que cada paso sea más largo de lo que ' +
      'parecería. Lo que frena el algoritmo es la columna f, que se ' +
      'aplasta: −2.30685282, −1.11085589, −0.36376239, −0.05351505, ' +
      '−0.00138281, −0.00000096 y 0.',
    criterio:
      'Se detiene en la iteración 6, cuando |Δx| = 1.919 × 10⁻⁵ < ' +
      '10⁻⁴. La bisección hizo 16 y la regla falsa 18: la misma ' +
      'derivada chica que a la cuerda la frenó, a la tangente la acelera.',
    conclusion:
      'La raíz es x ≈ 19.08553692 (= e³ − 1, con e³ − 1 = ' +
      '19.0855369232...): el desplazamiento final fue de 1.919 × 10⁻⁵, ' +
      'por debajo de la tolerancia de 1 × 10⁻⁴. La diferencia real es ' +
      'de 3.2 × 10⁻⁹, sólo formato de la tabla. Seis iteraciones contra ' +
      'las 18 de la regla falsa y las 16 de la bisección.',
    pista:
      'La clave es f′(x) = 1/(x + 1): en la semilla x₀ = 1 vale 0.5, ' +
      'así que x₁ = 1 − (−2.3069)/0.5 = 5.6137. El paso es grande ' +
      'PRECISAMENTE porque la pendiente es chica. La raíz exacta es ' +
      'e³ − 1 ≈ 19.0855: conviene estimarla a mano antes de correr el ' +
      'método.',
    calculo: { funcion: 'ln(x+1) - 3', x0: 1, tol: 1e-4 },
  },

  {
    id: 'newton-ejercicio-3',
    titulo: 'Dos equilibrios: la semilla elige a cuál te acercás',
    tipo: 'casuistica',
    enunciado:
      'La ganancia de una pyme, en miles de pesos, depende de la producción ' +
      'x (en miles de unidades) según π(x) = 60x − 0.05x³ − 8x² − 100. La ' +
      'gerencia quiere saber en QUÉ nivel de producción la ganancia se ' +
      'anula — el punto de equilibrio — antes de subir la línea. El ' +
      'gerente estima que su empresa arranca produciendo cerca de mil ' +
      'unidades y toma x₀ = 1 como semilla. Tolerancia: 10⁻⁴ miles de ' +
      'unidades.',
    ecuacion: '60x − 0.05x³ − 8x² − 100 = 0',
    parametros: [
      { etiqueta: 'Función', valor: 'π(x) = 60x − 0.05x³ − 8x² − 100' },
      { etiqueta: 'Semilla', valor: 'x₀ = 1' },
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
          valor: '1 (mil unidades)',
          queEs:
            'semilla del gerente: su estimación de partida, producir cerca de mil unidades',
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
        'cúbica que no conviene atacar con fórmula. Se toma f(x) = π(x) y ' +
        'se aplica Newton, que no pide intervalo con cambio de signo ni ' +
        'Bolzano: pide la SEMILLA x₀ = 1, que el gerente justifica con su ' +
        'estimación de partida. Lo que NO le pide a ningún método es a ' +
        'cuál de las raíces quiere llegar — eso se decide eligiendo.',
    },
    interpretacion:
      'El modelo tiene DOS equilibrios: π sube, toca un máximo y cruza el ' +
      'cero en 2.54174959, y vuelve a cruzar en 4.70478842 (con el máximo ' +
      'en el medio, la empresa está en zona de ganancia). Desde x₀ = 1 ' +
      'Newton cae en el primero, en 5 iteraciones. Con la semilla x₀ = 5 ' +
      '— probalo en la calculadora — cae en el segundo, en 4. Bisección y ' +
      'regla falsa no pueden mostrar esto: un intervalo con cambio de ' +
      'signo sólo acota UNA raíz.',
    pasos: [
      'Paso 0 — Semilla: π(1) = 60 − 0.05 − 8 − 100 = −48.05 (¡pérdida!) ' +
        'y π′(1) = 60 − 0.15 − 16 = 43.85.',
      'Paso 1 — x₁ = 1 − (−48.05)/43.85 = 1 + 1.09578107 = 2.09578107: ' +
        'la tangente apunta a la derecha y casi dobla la producción de ' +
        'un salto.',
      'Paso 2 — π(2.09578107) = −9.85178688 y π′ = 25.80865811, así que ' +
        'x₂ = 2.09578107 + 0.3817241 = 2.47750518: la pérdida ya es ' +
        'ocho veces menor.',
      'Paso 3 — x₃ = 2.53997144 (|Δx| = 0.06246626) y x₄ = 2.54174815 ' +
        '(|Δx| = 0.00177671): la pendiente la frena justo antes del ' +
        'cero.',
      'Paso 4 — x₅ = 2.54174959 con |Δx| = 0.00000144 < 10⁻⁴: parada ' +
        'en la quinta iteración.',
    ],
    algoritmo:
      'La columna π′ cae de 43.85 (pendiente en la semilla) a ' +
      '25.80865811, 19.43921241, 18.39273879 y 18.36295712: se va ' +
      'estabilizando en el valor de la pendiente justo en la raíz. La ' +
      'columna π (que la tabla muestra como f) va de −48.05 a −9.85, ' +
      '−1.21, −0.033, −0.000026 y 0 — la clásica caída cuadrática. Ojo: ' +
      'f′ en la fila 1 es la pendiente en el punto ANTERIOR (x₀ = 1), ' +
      'esa es la convención de la tabla.',
    criterio:
      'Se detiene en la iteración 5, cuando |Δx| = 1.44 × 10⁻⁶ < ' +
      '10⁻⁴. Y ojo con la semilla: con x₀ = 5 el MISMO modelo cae en ' +
      'la OTRA raíz, 4.70478842, en 4 iteraciones.',
    conclusion:
      'El primer punto de equilibrio es x ≈ 2.54174959 (mil unidades): ' +
      'el desplazamiento final fue de 1.44 × 10⁻⁶, por debajo de la ' +
      'tolerancia de 1 × 10⁻⁴, y la diferencia con la raíz verdadera ' +
      '2.5417495868... es de 3.2 × 10⁻⁹. Pero el modelo tiene DOS ' +
      'equilibrios: cambiando la semilla a x₀ = 5, Newton devuelve ' +
      '4.70478842 en 4 iteraciones. La semilla elige a qué raíz te ' +
      'acercás — con métodos abiertos, esa decisión es del alumno.',
    pista:
      'Mirá la función y su derivada en la semilla: π(1) = −48.05 y ' +
      'π′(1) = 43.85, así que x₁ = 1 + 48.05/43.85 = 2.0958: el primer ' +
      'paso sale de la tabla. Después probá la calculadora con la ' +
      'semilla x₀ = 5 y mirá a qué otra raíz cae: 4.70478842.',
    calculo: {
      funcion: '60*x - 0.05*x^3 - 8*x^2 - 100',
      x0: 1,
      tol: 1e-4,
    },
  },
];
