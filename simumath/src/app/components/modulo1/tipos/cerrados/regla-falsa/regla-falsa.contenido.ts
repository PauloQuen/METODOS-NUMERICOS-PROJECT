import type {
  Ejemplo,
  Ejercicio,
  ContenidoTeoria,
} from '../../../../../shared/models/metodo.model';

/**
 * CONTENIDO DE REGLA FALSA — todo el texto y los enunciados del método.
 *
 * ── El contenido no se calcula ───────────────────────────────────────
 * Los números de las tablas y de las conclusiones salieron de correr el
 * algoritmo de verdad (`regla-falsa.algoritmo.ts`) con los mismos parámetros
 * que están escritos acá. Cuando el ejemplo dice "x ≈ 1.52137677" es porque
 * el motor devolvió ese número, no porque se haya copiado de un libro. Si
 * cambia el algoritmo, hay que recalcular este archivo.
 *
 * ── Por qué los problemas son los mismos que los de Bisección ─────────
 * A propósito. El material compara los métodos sobre los MISMOS problemas
 * para que se vea la diferencia real entre las dos estrategias cerradas:
 * mismo punto de partida [a, b], misma tolerancia. Bisección parte el
 * intervalo por el medio; Regla Falsa usa la cuerda. Nada más cambia.
 */

/* ================================================================== */
/* TEORÍA                                                              */
/* ================================================================== */

export const TEORIA_REGLA_FALSA: ContenidoTeoria = {
  concepto:
    'La regla falsa (regula falsi) es una bisección que no parte por el medio: ' +
    'traza la CUERDA que une los puntos (a, f(a)) y (b, f(b)) del intervalo y toma ' +
    'el punto c donde esa recta cruza el eje x. Si f es casi una recta en el ' +
    'intervalo, el cruce de la cuerda queda mucho más cerca de la raíz que el ' +
    'punto medio, y el método avanza más rápido que la bisección sin dejar de ' +
    'ser un método cerrado: sigue manteniendo un intervalo donde la raíz ' +
    'necesariamente está.',
  fundamento:
    'Se apoya en el teorema de Bolzano igual que la bisección: si f es continua ' +
    'en [a, b] y f(a) y f(b) tienen signos distintos, existe al menos una raíz en ' +
    'el intervalo. Pero en vez de promediar los extremos, aprovecha la pendiente: ' +
    'la cuerda entre (a, f(a)) y (b, f(b)) entra al eje x en un punto que se puede ' +
    'calcular por semejanza de triángulos. Si la distancia entre el cruce y el ' +
    'extremo a es (c − a), vale la proporción (c − a)/(b − a) = f(a)/(f(a) − f(b)), ' +
    'de donde c = a − f(a)·(b − a)/(f(b) − f(a)). Cuando la función se parece a ' +
    'una recta dentro del intervalo, ese cruce está mucho más cerca de la raíz ' +
    'que el promedio simple.',
  cuandoFalla:
    'Falla o anda mal en tres situaciones. Una: si f(a) y f(b) tienen el mismo ' +
    'signo, no hay cambio de signo y la cuerda puede cruzar el eje fuera del ' +
    'intervalo o no cruzar nada garantizado. Dos: si un extremo queda fijo ' +
    'durante muchas iteraciones (el clásico "extremo clavado"), la cuerda se ' +
    'apoya siempre en el mismo punto y el corte se arrastra: la convergencia se ' +
    'vuelve lineal muy lenta, peor que la bisección. Tres: si f no es continua, ' +
    'Bolzano no aplica y la cuerda puede cruzar el eje sin que haya raíz.',
  ordenConvergencia:
    'Es lineal, pero con una constante que depende de la forma de f. En el ' +
    'ejemplo canónico de esta página la cuerda reduce el error a ~30% por ' +
    'iteración, contra el 50% de la bisección: por eso hace 10 iteraciones en ' +
    'vez de 17 para la misma tolerancia. Pero si un extremo se clava, la ' +
    'constante se acerca a 1 y la convergencia se vuelve lentísima; Newton-' +
    'Raphson y Secante son de orden cuadrático y llegan al mismo error en unas ' +
    '6 o 7 iteraciones. La ventaja de la regla falsa no es la velocidad en el ' +
    'peor caso: es que casi siempre es más rápida que la bisección sin pedir la ' +
    'derivada.',
  videoUrl: undefined,

  algoritmo: {
    formula: 'c = a − f(a)·(b − a) / (f(b) − f(a))',

    criterios: [
      {
        nombre: 'Desplazamiento |Δc| (el que usa por defecto)',
        explicacion:
          'Mide cuánto se movió el corte de la cuerda entre la iteración anterior ' +
          'y la actual. Es un error sobre x, así que no depende de qué tan grande ' +
          'sea f. NO es la cota de Bolzano: es una medición a posteriori del ' +
          'movimiento, no una garantía sobre dónde está la raíz.',
      },
      {
        nombre: 'Cota de Bolzano (b − a)/2',
        explicacion:
          'En la bisección esta cota es el criterio natural porque el intervalo ' +
          'se encoge a la mitad en cada paso. En la regla falsa el intervalo no ' +
          'se encoge siempre: cuando un extremo se clava, el ancho se queda fijo ' +
          'y la cota deja de bajar aunque el corte siga avanzando. Por eso la ' +
          'regla falsa NO la usa por defecto.',
      },
      {
        nombre: 'Residuo |f(c)|',
        explicacion:
          'Medir qué tan cerca está f(c) de cero. Tiene el mismo problema que en ' +
          'la bisección: si el alumno escribe la misma ecuación multiplicada por ' +
          '1000, el residuo se multiplica por 1000 y el método para antes. La ' +
          'cantidad de iteraciones no debería depender de cómo se escribió la ' +
          'función.',
      },
      {
        nombre: 'Residuo relativo',
        explicacion:
          'Divide el residuo por el valor de f cerca de la raíz. Corrige en parte ' +
          'el problema de escalar f, pero sigue siendo una medición y no una ' +
          'garantía, y es más difícil de explicar.',
      },
    ],

    pasos: [
      'Verificar que f(a) y f(b) tienen signos distintos. Si no, avisar y terminar.',
      'Trazar la cuerda y hallar su cruce con el eje: c = a − f(a)·(b − a) / (f(b) − f(a)).',
      'Evaluar f(c). Si f(c) = 0, se terminó: c es la raíz exacta.',
      'Revisar el criterio de parada: si |cₙ − cₙ₋₁| < tolerancia, terminar y devolver c.',
      'Si f(a) y f(c) tienen signos distintos, la raíz está en [a, c]: poner b = c y f(b) = f(c).',
      'Si no, la raíz está en [c, b]: poner a = c y f(a) = f(c).',
      'Volver al paso 2. El extremo que quedó adentro del intervalo es el que se renueva.',
    ],

    ventajas: [
      'Siempre converge si f es continua y hay cambio de signo. No puede divergir ni oscilar.',
      'Suele ser más rápida que la bisección porque usa la pendiente de la función, no solo el signo.',
      'No necesita la derivada. Se puede aplicar a funciones cuya derivada no se conoce o no existe en el punto.',
      'Conserva el intervalo de acotación, así que nunca se aleja sin control de la raíz.',
      'Si f es lineal en el intervalo, acierta la raíz en una sola iteración.',
    ],

    limitaciones: [
      'El extremo clavado: un extremo puede quedar fijo muchas iteraciones y la convergencia se vuelve muy lenta.',
      'Necesita un intervalo inicial con cambio de signo, igual que la bisección.',
      'No detecta raíces dobles, porque una raíz par no cambia el signo de f.',
      'La parada por |Δc| es una medición del movimiento del corte, no una garantía sobre la distancia a la raíz: en funciones muy planas puede declarar convergencia con el valor todavía lejos.',
      'La cuerda puede ser casi horizontal (cuando f(a) ≈ f(b)), y entonces el cruce se va muy lejos del intervalo.',
    ],

    recomendaciones: [
      'Acotar bien el intervalo es MÁS importante que en la bisección: un intervalo ancho con un extremo clavado vuelve la convergencia lentísima.',
      'Revisar siempre el signo de f(a) y f(b) antes de empezar. Es el error más común, y acá la cuerda sin cambio de signo cruza donde no debe.',
      'Preferir |Δc| como criterio de parada, porque la cota de Bolzano puede quedar congelada por el extremo clavado.',
      'Si la convergencia se estanca (el corte avanza muy despacio), probar con la bisección o con la secante.',
      'Empezar con tolerancias razonables: seis decimales es más que suficiente para casi todo trabajo de ingeniería.',
    ],
  },

  /* ---------------------------------------------------------------- */
  /* Ejemplo numérico de la teoría                                     */
  /* ---------------------------------------------------------------- */
  ejemploNormal: {
    id: 'regla-falsa-teoria-numerico',
    titulo: 'La raíz cúbica de 2, pero con la cuerda',
    tipo: 'numerico',
    ecuacion: 'x³ − x − 2 = 0 en [1, 2]',
    parametros: [
      { etiqueta: 'Función', valor: 'f(x) = x³ − x − 2' },
      { etiqueta: 'Intervalo', valor: '[1, 2]' },
      { etiqueta: 'Tolerancia', valor: '10⁻⁵' },
    ],
    interpretacion:
      'El mismo ejemplo que se resolvió con bisección: x³ = x + 2 no se ' +
      'descompone en factores lineales con enteros, así que no hay fórmula ' +
      'directa. La regla falsa llega a la raíz 1.5213797068 con la misma ' +
      'tolerancia de 10⁻⁵ en 10 iteraciones, contra las 17 de la bisección. ' +
      'La cuenta es idéntica salvo por un detalle: en vez del punto medio, ' +
      'cada paso traza la cuerda y usa el cruce con el eje x.',
    pasos: [
      'Paso 0 — Condición de arranque: f(1) = 1 − 1 − 2 = −2 y f(2) = 8 − 2 − 2 = 4. ' +
        'Los signos son distintos (−2 × 4 = −8 < 0), así que por Bolzano hay una raíz dentro de [1, 2].',
      'Paso 1 — La cuerda: c = 1 − (−2)·(2 − 1) / (4 − (−2)) = 1 + 2/6 = 1.3333. ' +
        'f(1.3333) = 2.3704 − 1.3333 − 2 = −0.9630. El cruce ya está mucho más cerca ' +
        'de la raíz (1.5214) que el punto medio de la bisección (1.5).',
      'Paso 2 — f(1) = −2 y f(1.3333) = −0.9630 tienen el MISMO signo, así que la raíz no ' +
        'está en [1, 1.3333]. Se descarta esa parte: a pasa a 1.3333. El extremo b queda en 2.',
      'Paso 3 — Nueva cuerda con f(1.3333) = −0.9630 y f(2) = 4: ' +
        'c = 1.3333 − (−0.9630)·(2 − 1.3333) / (4 − (−0.9630)) = 1.4627. f(1.4627) = −0.3333.',
    ],
    algoritmo:
      'Se traza la cuerda entre los extremos del intervalo, se anota su cruce c ' +
      'con el eje y el desplazamiento |Δc| respecto del cruce anterior. Si el ' +
      'desplazamiento supera la tolerancia, se renueva un extremo y se repite. ' +
      'Mirá la columna b de la tabla: el extremo derecho se CLAVA en 2. La cuerda ' +
      'sigue apoyándose en f(2) = 4 y el corte se acerca a la raíz por la izquierda.',
    criterio:
      'Se detiene en la iteración 10, cuando |Δc| = 7.2346 × 10⁻⁶ < 10⁻⁵. ' +
      'La bisección necesitaba 17 iteraciones para la misma tolerancia.',
    conclusion:
      'La raíz es x ≈ 1.52137677, con un desplazamiento final de 7.2346 × 10⁻⁶. ' +
      'El valor exacto es 1.5213797068, así que la diferencia real es de 2.938 × 10⁻⁶, ' +
      'aun menor que el desplazamiento que disparó la parada: el criterio fue conservador ' +
      'en este caso. Con la misma tolerancia, bisección tardó 17 pasos y la regla falsa, 10.',
    calculo: { funcion: 'x^3 - x - 2', a: 1, b: 2, tol: 0.00001, maxIter: 100 },
  },

  /* ---------------------------------------------------------------- */
  /* Ejemplo de casuística de la teoría                                 */
  /* ---------------------------------------------------------------- */
  ejemploCasuistica: {
    id: 'regla-falsa-teoria-casuistica',
    titulo: 'Calibración de un tanque: extremo clavado y qué hacer con él',
    tipo: 'casuistica',
    enunciado:
      'El mismo tanque industrial del material de bisección: la corrección Δ ' +
      'al factor de pérdida obedece f(Δ) = Δ³ − 7Δ + 4 y las mediciones acotan ' +
      'el ajuste entre −3 y −2. Pero ahora el ajuste lo calcula la regla falsa, ' +
      'y conviene mirar qué hace cada extremo del intervalo a medida que itera.',
    ecuacion: 'Δ³ − 7Δ + 4 = 0 en [−3, −2]',
    parametros: [
      { etiqueta: 'Función', valor: 'f(Δ) = Δ³ − 7Δ + 4' },
      { etiqueta: 'Intervalo', valor: '[−3, −2]' },
      { etiqueta: 'Tolerancia', valor: '10⁻⁶' },
    ],
    extraccion: {
      busqueda:
        'El desplazamiento Δ que anula la pérdida: el ajuste que hace coherente ' +
        'al modelo. Es una raíz de f(Δ) = 0, y por estar acotada entre −3 y −2 ' +
        'es un problema de método cerrado.',
      datos: [
        {
          simbolo: 'a = −3',
          valor: '−3',
          queEs: 'Ajuste mínimo que consideran las mediciones.',
        },
        {
          simbolo: 'b = −2',
          valor: '−2',
          queEs: 'Ajuste máximo que consideran las mediciones.',
        },
        {
          simbolo: 'tol',
          valor: '10⁻⁶',
          queEs: 'Precisión pedida: 6 decimales sobre el desplazamiento.',
        },
      ],
      formulacion:
        'Se verifica la condición de Bolzano antes de calcular: f(−3) = −27 + 21 + 4 = −2 ' +
        'y f(−2) = −8 + 14 + 4 = 10. El producto es −20 < 0, hay cambio de signo, ' +
        'así que existe al menos una raíz en el intervalo y la regla falsa es aplicable.',
    },
    interpretacion:
      'La bisección necesitaba 20 iteraciones para llegar a 10⁻⁶ en este problema; ' +
      'la regla falsa llega en 6. Pero fijate la tabla: el extremo a = −3 queda ' +
      'CLAVADO en todas las filas, porque f(−3) = −2 es mucho más chico que f(−2) = 10 ' +
      'y la cuerda se apoya en el extremo de pendiente más suave. El método igual ' +
      'converge rápido porque la función es casi recta en esa zona; el extremo ' +
      'clavado solo es un problema cuando la convergencia se vuelve lenta.',
    pasos: [
      'Paso 0 — Condición de arranque: f(−3) = −2 y f(−2) = 10. Producto −20 < 0: ' +
        'hay cambio de signo, la raíz existe en [−3, −2].',
      'Paso 1 — La cuerda: c = −3 − (−2)·(−2 − (−3)) / (10 − (−2)) = −3 + 2/12 = −2.8333. ' +
        'f(−2.8333) = −22.7454 + 19.8333 + 4 = 1.0880.',
      'Paso 2 — f(−3) = −2 y f(−2.8333) = 1.0880 tienen signos DISTINTOS: la raíz está ' +
        'en [−3, −2.8333]. Se descarta la parte derecha: b pasa a −2.8333. El extremo a queda clavado en −3.',
      'Paso 3 — Nueva cuerda con f(−3) = −2 y f(−2.8333) = 1.0880: ' +
        'c = −3 − (−2)·(0.1667) / (1.0880 − (−2)) = −2.8921. f(−2.8921) = 0.0553.',
    ],
    algoritmo:
      'La cuerda se apoya en f(−3) = −2, que casi no cambia, y va renovando el ' +
      'extremo derecho. En 6 iteraciones el desplazamiento |Δc| queda por debajo ' +
      'de 10⁻⁶, contra las 20 que precisaba la bisección.',
    criterio:
      'Se detiene en la iteración 6, cuando |Δc| = 3.2887 × 10⁻⁷ < 10⁻⁶.',
    conclusion:
      'Δ ≈ −2.89510650, con un desplazamiento final de 3.2887 × 10⁻⁷. El valor es ' +
      'negativo, igual que con bisección: el modelo de pérdida no es admisible en ese ' +
      'rango y hay que recalibrarlo. La diferencia con la bisección es el costo: ' +
      '6 iteraciones contra 20.',
    calculo: { funcion: 'x^3 - 7*x + 4', a: -3, b: -2, tol: 0.000001, maxIter: 100 },
  },
};

/* ================================================================== */
/* EJEMPLOS RESUELTOS                                                  */
/* ================================================================== */

export const EJEMPLOS_REGLA_FALSA: Ejemplo[] = [
  {
    id: 'regla-falsa-ej1',
    titulo: 'x − cos(x) = 0: la ecuación del punto fijo',
    tipo: 'numerico',
    ecuacion: 'x − cos(x) = 0 en [0, 1]',
    parametros: [
      { etiqueta: 'Función', valor: 'f(x) = x − cos(x)' },
      { etiqueta: 'Intervalo', valor: '[0, 1]' },
      { etiqueta: 'Tolerancia', valor: '10⁻⁵' },
    ],
    interpretacion:
      'El mismo problema que la bisección (x = cos(x) reescrito como x − cos(x) = 0), ' +
      'pero acá la cuerda rinde muchísimo: el primer cruce ya cae en c = 0.6851, ' +
      'cuando el punto medio de la bisección arrancaba en 0.5. Con la tolerancia ' +
      'de 10⁻⁵ la regla falsa converge en 5 iteraciones; la bisección necesitaba 17.',
    pasos: [
      'Paso 0 — Condición de arranque: f(0) = 0 − 1 = −1 y f(1) = 1 − cos(1) = 0.4597. ' +
        'Producto negativo: hay cambio de signo, la raíz existe en [0, 1].',
      'Paso 1 — La cuerda: c = 0 − (−1)·(1 − 0) / (0.4597 − (−1)) = 1/1.4597 = 0.6851. ' +
        'f(0.6851) = 0.6851 − cos(0.6851) = 0.6851 − 0.7744 = −0.0893.',
      'Paso 2 — f(0) = −1 y f(0.6851) = −0.0893 tienen el MISMO signo: la raíz no está ' +
        'en [0, 0.6851]. Se descarta esa parte: a pasa a 0.6851.',
      'Paso 3 — Nueva cuerda con f(0.6851) = −0.0893 y f(1) = 0.4597: ' +
        'c = 0.6851 − (−0.0893)·(0.3149) / (0.4597 − (−0.0893)) = 0.7363. f(0.7363) = −0.0047.',
    ],
    algoritmo:
      'La cuerda entre (0, −1) y (1, 0.4597) cruza el eje en 0.6851 en el primer paso, ' +
      'y ya en el segundo el corte queda en 0.7363, a menos de 0.003 de la raíz. ' +
      'Cada paso renueva el extremo izquierdo; el extremo derecho se clava en 1.',
    criterio:
      'La parada por |Δc| < 10⁻⁵ se alcanza en la iteración 5, con ' +
      '|Δc| = 6.6516 × 10⁻⁶. La bisección necesitaba 17 iteraciones.',
    conclusion:
      'x ≈ 0.73908478, con un desplazamiento final de 6.6516 × 10⁻⁶. El valor exacto ' +
      'es 0.7390851332, así que la diferencia real (3.508 × 10⁻⁷) es menor que el ' +
      'desplazamiento que disparó la parada. Este es el punto de equilibrio entre ' +
      'la recta identidad y el coseno.',
    calculo: { funcion: 'x - cos(x)', a: 0, b: 1, tol: 0.00001, maxIter: 100 },
  },

  {
    id: 'regla-falsa-ej2',
    titulo: 'e^(−x) = x: el número de Euler invertido',
    tipo: 'numerico',
    ecuacion: 'e^(−x) − x = 0 en [0, 1]',
    parametros: [
      { etiqueta: 'Función', valor: 'f(x) = e^(−x) − x' },
      { etiqueta: 'Intervalo', valor: '[0, 1]' },
      { etiqueta: 'Tolerancia', valor: '10⁻⁵' },
    ],
    interpretacion:
      'La intersección de la exponencial decreciente con la recta y = x, el famoso ' +
      'número de Euler invertido (≈ 0.5671). Con la bisección hacían falta 17 ' +
      'iteraciones para 10⁻⁵; la regla falsa converge en 6. Acá el extremo que se ' +
      'clava es el izquierdo: f(0) = 1 queda fijo y la cuerda va renovando b.',
    pasos: [
      'Paso 0 — Condición de arranque: f(0) = e⁰ − 0 = 1 y f(1) = e⁻¹ − 1 = −0.6321. ' +
        'Signos distintos: la raíz existe en [0, 1].',
      'Paso 1 — La cuerda: c = 0 − 1·(1 − 0) / (−0.6321 − 1) = −1/−1.6321 = 0.6127. ' +
        'f(0.6127) = e^(−0.6127) − 0.6127 = 0.5419 − 0.6127 = −0.0708.',
      'Paso 2 — f(0) = 1 y f(0.6127) = −0.0708 tienen signos DISTINTOS: la raíz está ' +
        'en [0, 0.6127]. Se descarta la parte derecha: b pasa a 0.6127. El extremo a queda clavado en 0.',
      'Paso 3 — Nueva cuerda con f(0) = 1 y f(0.6127) = −0.0708: ' +
        'c = 0 − 1·(0.6127) / (−0.0708 − 1) = 0.5722. f(0.5722) = e^(−0.5722) − 0.5722 = −0.0079.',
    ],
    algoritmo:
      'La cuerda entre (0, 1) y (1, −0.6321) cruza el eje en 0.6127 en el primer ' +
      'paso y el corte se acerca a la raíz renovando siempre el extremo derecho. ' +
      'El extremo izquierdo a = 0 queda clavado durante todo el proceso, pero la ' +
      'convergencia sigue siendo rápida porque la función es casi recta.',
    criterio:
      'La parada por |Δc| < 10⁻⁵ se alcanza en la iteración 6, con |Δc| = 6.1539 × 10⁻⁶. ' +
      'La bisección necesitaba 17 iteraciones.',
    conclusion:
      'x ≈ 0.56714406, con un desplazamiento final de 6.1539 × 10⁻⁶. El valor exacto ' +
      'es 0.5671432904 (la solución de la ecuación de Lambert W), y la diferencia ' +
      'real es de 7.7 × 10⁻⁷, menor que el desplazamiento que disparó la parada.',
    calculo: { funcion: 'e^(-x) - x', a: 0, b: 1, tol: 0.00001, maxIter: 100 },
  },

  {
    id: 'regla-falsa-ej3',
    titulo: 'CASUÍSTICA: área de un terreno',
    tipo: 'casuistica',
    enunciado:
      'El mismo terreno del material de bisección: la superficie S(x) = x² − 3x + 0.5 ' +
      'tiene un mínimo donde S′(x) = 0, es decir, 2x − 3 = 0, con x entre 0 y 5 metros. ' +
      'La diferencia: esta vez se resuelve con la regla falsa.',
    ecuacion: '2x − 3 = 0 en [0, 5]',
    parametros: [
      { etiqueta: 'Función', valor: 'f(x) = 2x − 3 (derivada de S)' },
      { etiqueta: 'Intervalo', valor: '[0, 5]' },
      { etiqueta: 'Tolerancia', valor: '10⁻⁵' },
    ],
    extraccion: {
      busqueda:
        'El largo del lado menor donde la superficie es mínima. Es el punto donde ' +
        'la derivada se anula, o sea una raíz de f(x) = 2x − 3.',
      datos: [
        { simbolo: 'a = 0', valor: '0', queEs: 'Largo mínimo físico del terreno.' },
        { simbolo: 'b = 5', valor: '5', queEs: 'Ancho del terreno.' },
      ],
      formulacion:
        'Se derivó S(x) = x² − 3x + 0.5 para obtener S′(x) = 2x − 3, y se busca ' +
        'el cero de esa derivada. Se verifica Bolzano: f(0) = −3 y f(5) = 7, con ' +
        'producto −21 < 0.',
    },
    interpretacion:
      'Este es el caso más lindo de la regla falsa: como f es una RECTA, la cuerda ' +
      'ES la función, y el cruce con el eje es la raíz exacta al primer intento: ' +
      'c = 1.5 con f(1.5) = 0. La bisección necesitaba 19 iteraciones para ' +
      'acercarse a 1.5; la regla falsa lo clava en una. La moraleja sigue siendo la ' +
      'misma: para un problema exacto, ningún método iterativo le gana a despejar.',
    pasos: [
      'Paso 0 — Condición de arranque: f(0) = −3 y f(5) = 7. Producto −21 < 0: ' +
        'hay cambio de signo en [0, 5].',
      'Paso 1 — La cuerda: c = 0 − (−3)·(5 − 0) / (7 − (−3)) = 15/10 = 1.5. ' +
        'f(1.5) = 2·1.5 − 3 = 0.',
      'Paso 2 — f(c) = 0 exacto: se terminó. No hace falta tolerancia: el corte de ' +
        'la cuerda es la raíz exacta.',
      'Paso 3 — Por qué acertó: cuando f es una recta, la cuerda entre dos puntos ' +
        'de f ES la recta, así que su cruce con el eje x es exactamente el cero ' +
        'de la función. La regla falsa no itera: despeja.',
    ],
    algoritmo:
      'Se traza la cuerda entre (0, −3) y (5, 7). Como la función es lineal, la ' +
      'cuerda coincide con ella y el cruce con el eje cae en la raíz exacta: ' +
      '1 iteración y error cero.',
    criterio:
      'La parada es por raíz exacta: f(1.5) = 0. No se llegó a usar la tolerancia.',
    conclusion:
      'La raíz es x ≈ 1.5, y esta vez sin error: f(1.5) = 0 exacto. Cuando la ' +
      'función es una recta, la regla falsa resuelve en una sola iteración; la ' +
      'bisección necesitaba 19 pasos para aproximarse.',
    calculo: { funcion: '2*x - 3', a: 0, b: 5, tol: 0.00001, maxIter: 100 },
  },

  {
    id: 'regla-falsa-ej4',
    titulo: 'CASUÍSTICA: tiempo de vida media de un isótopo',
    tipo: 'casuistica',
    enunciado:
      'El mismo isótopo del material de bisección: la vida media T cumple ' +
      'e^(−T) = 1/2 (con τ = 1), o sea f(T) = e^(−T) − 0.5 = 0, con T entre 0 y 5 ' +
      'unidades de tiempo. El físico sabe que la respuesta anda cerca de ln(2) ≈ 0.6931, ' +
      'pero igual quiere ver qué tan rápido converge cada método.',
    ecuacion: 'e^(−x) − 0.5 = 0 en [0, 5]',
    parametros: [
      { etiqueta: 'Función', valor: 'f(x) = e^(−x) − 0.5' },
      { etiqueta: 'Intervalo', valor: '[0, 5]' },
      { etiqueta: 'Tolerancia', valor: '10⁻⁵' },
    ],
    extraccion: {
      busqueda: 'El tiempo T en que queda la mitad del isótopo original.',
      datos: [
        { simbolo: 'a = 0', valor: '0', queEs: 'Tiempo inicial, cuando hay 100% del isótopo.' },
        { simbolo: 'b = 5', valor: '5', queEs: 'Tiempo máximo estimado por el físico.' },
      ],
      formulacion:
        'Se despeja la ecuación exponencial y se lleva a la forma f(x) = 0. Se verifica ' +
        'Bolzano: f(0) = 0.5 y f(5) = e⁻⁵ − 0.5 = −0.4933.',
    },
    interpretacion:
      'Con un intervalo [0, 5] el extremo a = 0 se clava (f(0) = 0.5 queda fijo) y ' +
      'la cuerda va renovando b. Aun así, la regla falsa converge en 13 iteraciones ' +
      'contra las 19 de la bisección. El intervalo ancho se nota: el primer cruce de ' +
      'la cuerda cae en 2.5170, bien lejos de la raíz 0.6931, y de ahí en más el ' +
      'método corrige de a poco. Un intervalo [0, 1] habría convergido mucho antes.',
    pasos: [
      'Paso 0 — Condición de arranque: f(0) = 1 − 0.5 = 0.5 y f(5) = e⁻⁵ − 0.5 = −0.4933. ' +
        'Hay cambio de signo.',
      'Paso 1 — La cuerda: c = 0 − 0.5·(5 − 0) / (−0.4933 − 0.5) = −2.5/−0.9933 = 2.5170. ' +
        'f(2.5170) = e^(−2.5170) − 0.5 = 0.0807 − 0.5 = −0.4193.',
      'Paso 2 — f(0) = 0.5 y f(2.5170) = −0.4193 tienen signos DISTINTOS: la raíz está ' +
        'en [0, 2.5170]. Se descarta la parte derecha: b pasa a 2.5170. a queda clavado en 0.',
      'Paso 3 — Nueva cuerda con f(0) = 0.5 y f(2.5170) = −0.4193: ' +
        'c = 0 − 0.5·(2.5170) / (−0.4193 − 0.5) = 1.3690. f(1.3690) = e^(−1.3690) − 0.5 = 0.2544 − 0.5 = −0.2456.',
    ],
    algoritmo:
      'La cuerda entre (0, 0.5) y (5, −0.4933) cruza el eje en 2.5170 en el primer ' +
      'paso, lejos de la raíz por culpa del intervalo ancho; después va renovando el ' +
      'extremo derecho y el corte se aproxima a 0.6931. 13 iteraciones hasta bajar ' +
      'de 10⁻⁵.',
    criterio:
      'Se detiene en la iteración 13, cuando |Δc| = 3.9187 × 10⁻⁶ < 10⁻⁵. ' +
      'La bisección necesitaba 19 iteraciones.',
    conclusion:
      'T ≈ 0.69314892, con un desplazamiento final de 3.9187 × 10⁻⁶. El valor exacto es ' +
      'ln(2) ≈ 0.69314718, así que la diferencia real (1.735 × 10⁻⁶) es menor que el ' +
      'desplazamiento que disparó la parada. La lección práctica: acotar el intervalo ' +
      'bien ahorra iteraciones, y acá [0, 1] habría sido mucho mejor que [0, 5].',
    calculo: { funcion: 'e^(-x) - 0.5', a: 0, b: 5, tol: 0.00001, maxIter: 100 },
  },
];

/* ================================================================== */
/* AUTOEVALUACIÓN                                                      */
/* ================================================================== */

export const EJERCICIOS_REGLA_FALSA: Ejercicio[] = [
  {
    id: 'regla-falsa-ejercicio-1',
    titulo: 'Resolver x² + 2x − 15 = 0 por regla falsa',
    tipo: 'numerico',
    ecuacion: 'x² + 2x − 15 = 0 en [0, 5]',
    parametros: [
      { etiqueta: 'Función', valor: 'f(x) = x² + 2x − 15' },
      { etiqueta: 'Intervalo', valor: '[0, 5]' },
      { etiqueta: 'Tolerancia', valor: '10⁻⁴' },
    ],
    interpretacion:
      'El mismo ejercicio de la bisección (la raíz positiva de la cuadrática es 3), ' +
      'pero ahora con la cuerda. La regla falsa converge en 8 iteraciones; la ' +
      'bisección necesitaba 16. El extremo b = 5 se clava (f(5) = 20 es grande) y el ' +
      'corte se acerca a 3 renovando siempre el extremo izquierdo.',
    pasos: [
      'Paso 0 — Condición de arranque: f(0) = −15 y f(5) = 25 + 10 − 15 = 20. ' +
        'Producto −300 < 0: hay cambio de signo.',
      'Paso 1 — La cuerda: c = 0 − (−15)·(5 − 0) / (20 − (−15)) = 75/35 = 2.1429. ' +
        'f(2.1429) = 4.592 + 4.286 − 15 = −6.122.',
      'Paso 2 — f(0) = −15 y f(2.1429) = −6.122 tienen el MISMO signo: la raíz está ' +
        'en [2.1429, 5]. a pasa a 2.1429.',
      'Paso 3 — Nueva cuerda con f(2.1429) = −6.122 y f(5) = 20: ' +
        'c = 2.1429 − (−6.122)·(2.8571) / (20 − (−6.122)) = 2.8125. f(2.8125) = −1.4648.',
    ],
    algoritmo:
      'La cuerda arranca en 2.1429 (el punto medio de la bisección iba a 2.5), y en ' +
      'el segundo corte ya está en 2.8125. El extremo derecho se clava en 5 y el ' +
      'corte se acerca a 3 renovando el izquierdo. 8 iteraciones hasta bajar de 10⁻⁴.',
    criterio:
      'Se detiene en la iteración 8, cuando |Δc| = 4.9152 × 10⁻⁵ < 10⁻⁴. ' +
      'La bisección necesitaba 16 iteraciones.',
    conclusion:
      'x ≈ 2.99998771, con un desplazamiento final de 4.9152 × 10⁻⁵. La raíz exacta ' +
      'es 3, y la diferencia real (1.229 × 10⁻⁵) es menor que el desplazamiento que ' +
      'disparó la parada.',
    calculo: { funcion: 'x^2 + 2*x - 15', a: 0, b: 5, tol: 0.0001, maxIter: 100 },

    pista:
      'f(0) = −15 (negativo) y f(5) = 20 (positivo): hay cambio de signo y la ' +
      'cuerda cruza el eje dentro del intervalo. El corte de la primera cuerda cae ' +
      'en 2.1429 = 75/35: fijate cómo ese número sale de la fórmula ' +
      'c = a − f(a)·(b − a)/(f(b) − f(a)).',
  },

  {
    id: 'regla-falsa-ejercicio-2',
    titulo: 'Encontrar dónde ln(x+1) = 3',
    tipo: 'numerico',
    ecuacion: 'ln(x+1) − 3 = 0 en [1, 20]',
    parametros: [
      { etiqueta: 'Función', valor: 'f(x) = ln(x+1) − 3' },
      { etiqueta: 'Intervalo', valor: '[1, 20]' },
      { etiqueta: 'Tolerancia', valor: '10⁻⁴' },
    ],
    interpretacion:
      'El mismo ejercicio de la bisección (la raíz es e³ − 1 ≈ 19.0855), resuelto ' +
      'con la cuerda. Acá la sorpresa: la regla falsa tarda 18 iteraciones, las ' +
      'mismas que la bisección, porque el extremo a = 1 se clava y la función es ' +
      'muy plana cerca de la raíz: la cuerda es casi horizontal y avanza de a poco. ' +
      'Es el caso donde la ventaja de la regla falsa desaparece y conviene mirar ' +
      'la diferencia con la bisección para entender por qué.',
    pasos: [
      'Paso 0 — Condición de arranque: f(1) = ln(2) − 3 = −2.3069 y f(20) = ln(21) − 3 = 0.0445. ' +
        'Producto negativo: hay cambio de signo.',
      'Paso 1 — La cuerda: c = 1 − (−2.3069)·(20 − 1) / (0.0445 − (−2.3069)) = 1 + 43.831/2.3514 = 19.6402. ' +
        'f(19.6402) = ln(20.6402) − 3 = 0.0272.',
      'Paso 2 — f(1) = −2.3069 y f(19.6402) = 0.0272 tienen signos DISTINTOS: la raíz ' +
        'está en [1, 19.6402]. b pasa a 19.6402. El extremo a queda clavado en 1.',
      'Paso 3 — Nueva cuerda con f(1) = −2.3069 y f(19.6402) = 0.0272: ' +
        'c = 1 − (−2.3069)·(18.6402) / (0.0272 − (−2.3069)) ≈ 19.4227. f(19.4227) = 0.0166.',
    ],
    algoritmo:
      'El primer corte de la cuerda cae en 19.6402, lejísimos de la raíz, porque ' +
      'f(20) = 0.0445 es casi cero y la cuerda es casi horizontal en el extremo. ' +
      'Después la cuerda se apoya en f(1) = −2.3069, que no cambia, y va renovando ' +
      'b: 18 iteraciones para bajar de 10⁻⁴, igual que la bisección.',
    criterio:
      'Se detiene en la iteración 18, cuando |Δc| = 7.8271 × 10⁻⁵ < 10⁻⁴.',
    conclusion:
      'x ≈ 19.08566, con un desplazamiento final de 7.8271 × 10⁻⁵. La solución ' +
      'exacta es e³ − 1 ≈ 19.0855. La lección: con un extremo clavado y una ' +
      'fórmula plana, la regla falsa pierde su ventaja y empata con la bisección; ' +
      'el desplazamiento |Δc| mide el avance del corte, no la distancia a la raíz.',
    calculo: { funcion: 'ln(x+1) - 3', a: 1, b: 20, tol: 0.0001, maxIter: 100 },

    pista:
      'f(1) = ln(2) − 3 es negativo y f(20) = ln(21) − 3 es positivo. El primer ' +
      'corte de la cuerda cae cerca de 19.64 porque f(20) ≈ 0.0445 es casi cero: ' +
      'la cuerda es casi horizontal ahí. La raíz exacta es e³ − 1 ≈ 19.0855.',
  },

  {
    id: 'regla-falsa-ejercicio-3',
    titulo: 'CASUÍSTICA: el factor de carga de un puente, bien acotado',
    tipo: 'casuistica',
    enunciado:
      'El factor de carga λ de un puente se modela por g(λ) = λ·e^λ − 5, donde λ es ' +
      'la relación entre la carga real y la carga de diseño. El ingeniero busca el ' +
      'λ donde g(λ) = 0, que es donde el puente opera al límite. Sabe que λ está ' +
      'entre 1 y 2, porque la carga real siempre supera a la de diseño pero nunca ' +
      'la triplica.',
    ecuacion: 'λ·e^λ − 5 = 0 en [1, 2]',
    parametros: [
      { etiqueta: 'Función', valor: 'f(x) = x·e^x − 5' },
      { etiqueta: 'Intervalo', valor: '[1, 2]' },
      { etiqueta: 'Tolerancia', valor: '10⁻⁴' },
    ],
    extraccion: {
      busqueda:
        'El factor de carga λ en el punto de equilibrio, donde g(λ) = 0.',
      datos: [
        { simbolo: 'a = 1', valor: '1', queEs: 'Carga real igual a la de diseño: el límite inferior del factor.' },
        { simbolo: 'b = 2', valor: '2', queEs: 'Doble de la carga de diseño: el límite superior razonable.' },
      ],
      formulacion:
        'Se verifica Bolzano: f(1) = e − 5 = −2.2817 y f(2) = 2e² − 5 = 9.7781. ' +
        'Producto negativo, hay cambio de signo en [1, 2].',
    },
    interpretacion:
      'Acá la acotación no es un detalle: es el punto del ejercicio. Si el ingeniero ' +
      'hubiera usado [0, 5] (el intervalo de la bisección), la regla falsa se ' +
      'clavaría en b = 5 y no convergería ni en 100 iteraciones, porque f(5) = 735 ' +
      'le da a la cuerda una pendiente casi vertical que la obliga a arrastrarse. ' +
      'Con [1, 2], el mismo método converge en 10 iteraciones. Lección: en la regla ' +
      'falsa, acotar bien el intervalo ES parte del método.',
    pasos: [
      'Paso 0 — Condición de arranque: f(1) = e − 5 = −2.2817 y f(2) = 2e² − 5 = 9.7781. ' +
        'Signos distintos: hay cambio de signo en [1, 2].',
      'Paso 1 — La cuerda: c = 1 − (−2.2817)·(2 − 1) / (9.7781 − (−2.2817)) = 1 + 2.2817/12.0598 = 1.1892. ' +
        'f(1.1892) = 1.1892·e^1.1892 − 5 = 3.9059 − 5 = −1.0941.',
      'Paso 2 — f(1) = −2.2817 y f(1.1892) = −1.0941 tienen el MISMO signo: la raíz ' +
        'está en [1.1892, 2]. a pasa a 1.1892.',
      'Paso 3 — Nueva cuerda con f(1.1892) = −1.0941 y f(2) = 9.7781: ' +
        'c = 1.1892 − (−1.0941)·(0.8108) / (9.7781 − (−1.0941)) = 1.2708. f(1.2708) = −0.4713.',
    ],
    algoritmo:
      'La cuerda entre (1, −2.2817) y (2, 9.7781) cruza el eje en 1.1892 y el corte ' +
      'se va acercando a la raíz renovando el extremo izquierdo; b = 2 queda ' +
      'clavado. 10 iteraciones para bajar de 10⁻⁴.',
    criterio:
      'Se detiene en la iteración 10, cuando |Δc| = 5.2708 × 10⁻⁵ < 10⁻⁴.',
    conclusion:
      'λ ≈ 1.32669007, con un desplazamiento final de 5.2708 × 10⁻⁵. La diferencia ' +
      'real con la raíz (≈ 1.3267) es de 3.459 × 10⁻⁵, menor que el desplazamiento ' +
      'que disparó la parada. La moraleja operativa: con [0, 5] este problema no ' +
      'convergería; con [1, 2] converge en 10 pasos.',
    calculo: { funcion: 'x*e^x - 5', a: 1, b: 2, tol: 0.0001, maxIter: 100 },

    pista:
      'Verificá Bolzano: f(1) = e − 5 ≈ −2.28 (negativo) y f(2) = 2e² − 5 ≈ 9.78 ' +
      '(positivo). Y probá qué pasa si cambiás el intervalo a [0, 5]: el extremo b ' +
      'se clava y el método no llega a converger. La elección del intervalo es la ' +
      'parte más importante de este ejercicio.',
  },
];