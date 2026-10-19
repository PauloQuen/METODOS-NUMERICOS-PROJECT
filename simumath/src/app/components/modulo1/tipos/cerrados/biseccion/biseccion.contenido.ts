import type { Ejemplo, Ejercicio, ContenidoTeoria } from '../../../../../shared/models/metodo.model';

/**
 * CONTENIDO DE BISECCIÓN — todo el texto y los enunciados del método.
 *
 * ── El contenido no se calcula ───────────────────────────────────────
 * Los números de las tablas y de las conclusiones salieron de correr el
 * algoritmo de verdad (`biseccion.algoritmo.ts`) con los mismos parámetros
 * que están escritos acá. Cuando el ejemplo dice "x ≈ 1.5213797068" es
 * porque el motor devolvió ese número, no porque se haya copiado de un
 * libro. Si cambia el algoritmo, hay que recalcular este archivo.
 *
 * ── Por qué los intervalos son "redondos" ────────────────────────────
 * Porque un alumno tiene que poder verificar el cambio de signo a mano.
 * Un intervalo como [1.7632, 1.7633] no se puede comprobar sin calculadora
 * de raíz cúbica. Los números feos van en el resultado, no en el punto de
 * partida.
 */

/* ================================================================== */
/* TEORÍA                                                              */
/* ================================================================== */

export const TEORIA_BISECCION: ContenidoTeoria = {
  concepto:
    'Bisección es la estrategia de acotar la raíz: en vez de adivinar dónde está, ' +
    'se empieza con un intervalo que la contiene, se parte por la mitad y se ' +
    'descarta la mitad donde NO puede estar la raíz. Repetir eso achica el ' +
    'intervalo a la mitad en cada paso, así que después de n pasos es (b−a)/2ⁿ ' +
    'de ancho. Es el método más lento de los cerrados y, justo por eso, el más ' +
    'fiable: nunca falla si se cumplen las condiciones.',

  fundamento:
    'Se apoya en el teorema de Bolzano: si f es continua en [a, b] y f(a) y f(b) ' +
    'tienen signos distintos, entonces existe al menos un c dentro del intervalo ' +
    'tal que f(c) = 0. Como además f es continua, no puede "saltar" de positivo a ' +
    'negativo sin pasar por cero. El método usa el teorema dos veces: una para ' +
    'acotar la raíz entre a y b, y otra en cada paso para decidir en qué mitad ' +
    'queda.',

  cuandoFalla:
    'Falla en tres casos concretos. Uno: si f(a) y f(b) tienen el mismo signo, no hay ' +
    'cambio de signo y el teorema no garantiza que exista una raíz. La raíz puede ' +
    'estar ahí igual (una raíz doble no produce cambio de signo), pero este método ' +
    'no la encuentra, y es honesto avisarlo en vez de devolver un número sin ' +
    'respaldo. Dos: si f no es continua, el teorema no aplica aunque haya cambio de ' +
    'signo; un salto puede saltarse el cero. Tres: si f es muy plana cerca de la ' +
    'raíz, el punto medio se mueve muy despacio y hacen falta muchas iteraciones.',

  ordenConvergencia:
    'Es lineal, y de las más lentas que existen. El error se reduce a la mitad en ' +
    'cada iteración, no al cuadrado ni a una potencia. Para llegar a un error de ' +
    '10⁻¹⁰ desde un intervalo de ancho 1 hacen falta n ≥ log₂(10¹⁰) ≈ 34 pasos. ' +
    'Newton-Raphson y Secante son de orden cuadrático y llegan al mismo error en ' +
    'unas 6 o 7 iteraciones. Pero bisección nunca falla si se cumplen las ' +
    'condiciones, y eso vale dinero cuando no se conoce la raíz ni se quiere ' +
    'derivar.',

  videoUrl: undefined,

  algoritmo: {
    formula: 'c = (a + b) / 2',

    criterios: [
      {
        nombre: 'Cota de Bolzano (la que usa por defecto)',
        explicacion:
          'El error es (b − a)/2, la mitad del ancho del intervalo. No es una ' +
          'medición del error real: es una GARANTÍA de que la raíz está a distancia ' +
          'igual o menor que eso del punto medio. Es el criterio correcto para un ' +
          'método cerrado, porque no depende de qué tan grande sea f.',
      },
      {
        nombre: 'Residuo |f(c)|',
        explicacion:
          'Medir qué tan cerca está f(c) de cero. Es intuitivo, pero tiene un ' +
          'problema: si el alumno escribe la misma ecuación multiplicada por 1000, ' +
          'el residuo se multiplica por 1000 y el método para antes. La cantidad de ' +
          'iteraciones no debería depender de cómo se escribió la función.',
      },
      {
        nombre: 'Residuo relativo',
        explicacion:
          'Divide el residuo por el valor de f cerca de la raíz. Corrige en parte el ' +
          'problema de escalar f, pero sigue siendo una medición y no una garantía, ' +
          'y es más difícil de explicar.',
      },
      {
        nombre: 'Punto medio contra punto anterior',
        explicacion:
          'Compara el punto medio actual con el de la iteración anterior. Es un error ' +
          'a posteriori: sirve para verificar, no para garantizar desde el principio.',
      },
    ],

    pasos: [
      'Verificar que f(a) y f(b) tienen signos distintos. Si no, avisar y terminar.',
      'Calcular el punto medio c = (a + b) / 2.',
      'Evaluar f(c). Si f(c) = 0, se terminó: c es la raíz.',
      'Revisar el criterio de parada: si (b − a)/2 < tolerancia, terminar y devolver c.',
      'Si f(a) y f(c) tienen signos distintos, la raíz está en [a, c]: poner b = c.',
      'Si no, la raíz está en [c, b]: poner a = c.',
      'Volver al paso 2. El intervalo ya es la mitad del anterior.',
    ],

    ventajas: [
      'Siempre converge si f es continua y hay cambio de signo. No puede divergir ni oscilar.',
      'Da una garantía del error de antemano, no una medición a posteriori.',
      'No necesita la derivada. Se puede aplicar a funciones cuya derivada no se conoce o no existe en el punto.',
      'Cada iteración cuesta lo mismo: un promedio y una evaluación de f.',
      'Es la base de los métodos más complejos. Newton-Raphson usa bisección como paso de seguridad.',
    ],

    limitaciones: [
      'Muy lento: el error solo se reduce a la mitad en cada paso.',
      'Necesita un intervalo inicial con cambio de signo. Acotar la raíz es un problema aparte.',
      'No detecta raíces dobles, porque una raíz par no cambia el signo de f.',
      'Si f es constante, con f(a) = f(b) = 0, devuelve un extremo sin poder distinguir.',
    ],

    recomendaciones: [
      'Elegir el intervalo más angosto que contenga la raíz. Cada mitad que se saca del intervalo es un paso que se ahorra.',
      'Revisar siempre el signo de f(a) y f(b) antes de empezar. Es el error más común.',
      'Preferir la cota de Bolzano como criterio de parada, porque es la que garantiza.',
      'Empezar con tolerancias razonables: seis decimales es más que suficiente para casi todo trabajo de ingeniería.',
      'Si el intervalo inicial es muy ancho, conviene usar Regla Falsa: también es cerrada y tampoco necesita derivada, pero aprovecha mejor los datos.',
    ],
  },

  /* ---------------------------------------------------------------- */
  /* Ejemplo numérico de la teoría                                     */
  /* ---------------------------------------------------------------- */
  ejemploNormal: {
    id: 'biseccion-teoria-numerico',
    titulo: 'La raíz cúbica de 2',
    tipo: 'numerico',
    ecuacion: 'x³ − x − 2 = 0 en [1, 2]',
    parametros: [
      { etiqueta: 'Función', valor: 'f(x) = x³ − x − 2' },
      { etiqueta: 'Intervalo', valor: '[1, 2]' },
      { etiqueta: 'Tolerancia', valor: '10⁻⁵' },
    ],
    interpretacion:
      'Resolver x³ = x + 2 no tiene una solución "a ojo": el polinomio no se ' +
      'descompone en factores lineales con enteros, así que las fórmulas de las ' +
      'cuadráticas no alcanzan. Es el ejemplo de botón del método: se elige ' +
      'porque se evalúa sin esfuerzo y aun así exige iterar. La raíz vale ' +
      '1.5213797068, y con una tolerancia de 10⁻⁵ el método entrega 1.52138519 en ' +
      '17 iteraciones.',

    pasos: [
      'Paso 0 — Condición de arranque: f(1) = 1 − 1 − 2 = −2 y f(2) = 8 − 2 − 2 = 4. ' +
        'Los signos son distintos (−2 × 4 = −8 < 0), así que por Bolzano hay una raíz dentro de [1, 2].',
      'Paso 1 — Punto medio: c = (1 + 2)/2 = 1.5. f(1.5) = 3.375 − 1.5 − 2 = −0.125. ' +
        'El error es (2−1)/2 = 0.5, todavía lejos de 10⁻⁵.',
      'Paso 2 — f(1) = −2 y f(1.5) = −0.125 tienen el MISMO signo, así que la raíz no está en [1, 1.5]. ' +
        'Se descarta esa mitad: a pasa a 1.5.',
      'Paso 3 — c = (1.5 + 2)/2 = 1.75. f(1.75) = 5.359375 − 1.75 − 2 = 1.609375. ' +
        'Ahora f(1.5) = −0.125 y f(1.75) > 0 tienen signos distintos: la raíz está en [1.5, 1.75].',
    ],

    algoritmo:
      'Se evalúa el punto medio del intervalo, se anota f(c) y el error (b−a)/2. ' +
      'Si el error todavía supera la tolerancia, se descarta la mitad donde f no ' +
      'cambia de signo y se repite. El intervalo arranca en [1, 2] con ancho 1 y ' +
      'se va partiendo: 0.5, 0.25, 0.125…',

    criterio:
      'Se detiene cuando (b − a)/2 es menor que 10⁻⁵. Como el ancho inicial es 1, ' +
      'hacen falta 17 iteraciones para llegar a un error de 7.6294 × 10⁻⁶.',

    conclusion:
      'La raíz es x ≈ 1.52138519, con un error garantizado menor que 7.6294 × 10⁻⁶. ' +
      'El valor exacto es 1.5213797068, así que la diferencia real es de 5.486 × 10⁻⁶, ' +
      'menor que la cota: la garantía se cumple. Con 17 pasos para seis decimales, ' +
      'se ve por qué los métodos más rápidos existen.',

    calculo: { funcion: 'x^3 - x - 2', a: 1, b: 2, tol: 0.00001, maxIter: 100 },
  },

  /* ---------------------------------------------------------------- */
  /* Ejemplo de casuística de la teoría                                 */
  /* ---------------------------------------------------------------- */
  ejemploCasuistica: {
    id: 'biseccion-teoria-casuistica',
    titulo: 'Calibración de un tanque: la raíz cae fuera del rango admisible',
    tipo: 'casuistica',
    enunciado:
      'Un tanque industrial pierde volumen por una fuga cuya tasa depende del nivel ' +
      'de forma no lineal. Para ajustar el modelo, el técnico introduce un ' +
      'desplazamiento Δ (la corrección que hay que aplicar al factor de pérdida) y ' +
      'obtiene f(Δ) = Δ³ − 7Δ + 4. El ajuste es válido cuando esa expresión se ' +
      'anula, así que Δ debe ser una raíz de f(Δ) = 0. Las mediciones acotan el ' +
      'ajuste entre −3 y −2.',

    ecuacion: 'Δ³ − 7Δ + 4 = 0 en [−3, −2]',
    parametros: [
      { etiqueta: 'Función', valor: 'f(Δ) = Δ³ − 7Δ + 4' },
      { etiqueta: 'Intervalo', valor: '[−3, −2]' },
      { etiqueta: 'Tolerancia', valor: '10⁻⁶' },
    ],

    extraccion: {
      busqueda:
        'El desplazamiento Δ que anula la pérdida: el ajuste que hace coherente al ' +
        'modelo. Es una raíz de f(Δ) = 0, y por estar acotada entre −3 y −2 es un ' +
        'problema de método cerrado.',
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
        'así que existe al menos una raíz en el intervalo y bisección es aplicable.',
    },

    interpretacion:
      'El técnico necesita el valor de Δ para aplicar la corrección. Lo relevante ' +
      'acá es que la raíz es NEGATIVA: el modelo necesita un ajuste de signo ' +
      'contrario al que aumentar la presión, lo cual no es admisible para un ' +
      'depósito que solo pierde volumen. Bisección también sirve para detectar ' +
      'ese problema, no solo para dar un número.',

    pasos: [
      'Paso 0 — Condición de arranque: f(−3) = −2 y f(−2) = 10. Producto −20 < 0: ' +
        'hay cambio de signo, la raíz existe en [−3, −2].',
      'Paso 1 — c = (−3 + −2)/2 = −2.5. f(−2.5) = −15.625 + 17.5 + 4 = 5.875. ' +
        'El error es (2)/2 = 0.5.',
      'Paso 2 — f(−3) = −2 y f(−2.5) = 5.875 tienen signos distintos: la raíz está ' +
        'en [−3, −2.5]. Se descarta la mitad derecha: b pasa a −2.5.',
      'Paso 3 — c = (−3 + −2.5)/2 = −2.75. f(−2.75) = −20.796875 + 19.25 + 4 = 2.453125. ' +
        'Se mantiene el intervalo [−3, −2.75].',
    ],

    algoritmo:
      'Cada paso reduce el intervalo a la mitad descartando el lado donde f no cambia ' +
      'de signo. En 20 iteraciones el error llega a 9.5368 × 10⁻⁷.',

    criterio:
      'La cota de Bolzano (b − a)/2 se compara con 10⁻⁶. El ancho inicial es 1, ' +
      'entonces hacen falta 20 iteraciones.',

    conclusion:
      'h ≈ −2.89510632, con error garantizado menor que 9.5368 × 10⁻⁷. El valor es ' +
      'negativo: el modelo de pérdida no es admisible en ese rango y hay que ' +
      'recalibrarlo. Ese es el resultado útil del cálculo, más allá del número.',

    calculo: { funcion: 'x^3 - 7*x + 4', a: -3, b: -2, tol: 0.000001, maxIter: 100 },
  },
};

/* ================================================================== */
/* EJEMPLOS RESUELTOS                                                  */
/* ================================================================== */

export const EJEMPLOS_BISECCION: Ejemplo[] = [
  {
    id: 'biseccion-ej1',
    titulo: 'x − cos(x) = 0: la ecuación del punto fijo',
    tipo: 'numerico',
    ecuacion: 'x − cos(x) = 0 en [0, 1]',
    parametros: [
      { etiqueta: 'Función', valor: 'f(x) = x − cos(x)' },
      { etiqueta: 'Intervalo', valor: '[0, 1]' },
      { etiqueta: 'Tolerancia', valor: '10⁻⁵' },
    ],
    interpretacion:
      'Resolver x = cos(x) es el ejemplo clásico de punto fijo, pero reescrito como ' +
      'x − cos(x) = 0 se convierte en un problema de raíz muy bien comportado: ' +
      'f es continua, tiene pendiente f′ = 1 + sin(x) > 0 siempre, así que es ' +
      'monótona creciente y la raíz es única. La solución x ≈ 0.7390851332 es el ' +
      'punto donde la recta y = x cruza la curva de coseno.',

    pasos: [
      'Paso 0 — Condición de arranque: f(0) = −1 y f(1) = 1 − cos(1) = 0.4597. ' +
        'Producto negativo: hay cambio de signo, la raíz existe en [0, 1].',
      'Paso 1 — c = 0.5. f(0.5) = 0.5 − cos(0.5) = −0.3776. Error 0.5.',
      'Paso 2 — f(0) = −1 y f(0.5) = −0.3776 tienen el mismo signo: la raíz no está ' +
        'en [0, 0.5]. a pasa a 0.5.',
      'Paso 3 — c = 0.75. f(0.75) = 0.75 − cos(0.75) = 0.0183. Ahora f(0.5) < 0 y ' +
        'f(0.75) > 0: la raíz está en [0.5, 0.75].',
    ],

    algoritmo:
      'Se parte el intervalo [0, 1] por la mitad hasta llegar a una tolerancia de ' +
      '10⁻⁵, descartando siempre la mitad donde f no cambia de signo.',

    criterio:
      'Cota de Bolzano: se detiene cuando (b − a)/2 < 10⁻⁵, lo que ocurre en la ' +
      'iteración 17 con un error de 7.6294 × 10⁻⁶.',

    conclusion:
      'x ≈ 0.73908234, con error garantizado menor que 7.6294 × 10⁻⁶. El valor exacto ' +
      'es 0.7390851332, así que la diferencia real (2.797 × 10⁻⁶) es menor que la cota. ' +
      'Este es el punto de equilibrio entre la recta identidad y el coseno.',

    calculo: { funcion: 'x - cos(x)', a: 0, b: 1, tol: 0.00001, maxIter: 100 },
  },

  {
    id: 'biseccion-ej2',
    titulo: 'e^(−x) = x: el número de Euler invertido',
    tipo: 'numerico',
    ecuacion: 'e^(−x) − x = 0 en [0, 1]',
    parametros: [
      { etiqueta: 'Función', valor: 'f(x) = e^(−x) − x' },
      { etiqueta: 'Intervalo', valor: '[0, 1]' },
      { etiqueta: 'Tolerancia', valor: '10⁻⁵' },
    ],
    interpretacion:
      'La intersección de la exponencial decreciente e^(−x) con la recta y = x. ' +
      'Es el número de Euler invertido: el valor x para el cual el crecimiento ' +
      'exponencial y el lineal se equiparan. Aparece en física en los modelos de ' +
      'decaimiento radiactivo y en economía en los modelos de interés continuo.',

    pasos: [
      'Paso 0 — Condición de arranque: f(0) = 1 y f(1) = e⁻¹ − 1 = −0.6321. ' +
        'Signos distintos: la raíz existe en [0, 1].',
      'Paso 1 — c = 0.5. f(0.5) = e^(−0.5) − 0.5 = 0.1065. Error 0.5.',
      'Paso 2 — f(0) = 1 y f(0.5) = 0.1065 tienen el mismo signo: la raíz está en ' +
        '[0.5, 1]. a pasa a 0.5.',
      'Paso 3 — c = 0.75. f(0.75) = e^(−0.75) − 0.75 = −0.2776. Ahora f(0.5) > 0 y ' +
        'f(0.75) < 0: la raíz está en [0.5, 0.75].',
    ],

    algoritmo:
      'Bisección clásica sobre el intervalo [0, 1], partiendo el intervalo a la mitad ' +
      'en cada paso hasta que la cota de error (b − a)/2 sea menor que 10⁻⁵.',

    criterio: 'Cota de Bolzano (b − a)/2 < 10⁻⁵, alcanzada en la iteración 17.',

    conclusion:
      'x ≈ 0.5671463, con error garantizado menor que 7.6294 × 10⁻⁶. El valor exacto ' +
      'es 0.5671432904 (la solución de la ecuación de Lambert W), y la diferencia ' +
      'real es de 3.011 × 10⁻⁶.',

    calculo: { funcion: 'e^(-x) - x', a: 0, b: 1, tol: 0.00001, maxIter: 100 },
  },

  {
    id: 'biseccion-ej3',
    titulo: 'CASUÍSTICA: área de un terreno',
    tipo: 'casuistica',
    enunciado:
      'Un agrimensor quiere rectangularizar un terreno cuya superficie está modelada ' +
      'por S(x) = x² − 3x + 0.5, donde x es el largo del lado menor en metros. El ' +
      'terreno tiene un mínimo de superficie en un punto, y el ancho del terreno es ' +
      'de 5 metros. La condición de mínimo es S′(x) = 0, es decir, 2x − 3 = 0.',

    ecuacion: '2x − 3 = 0 en [0, 5]',
    parametros: [
      { etiqueta: 'Función', valor: 'f(x) = 2x − 3 (derivada de S)' },
      { etiqueta: 'Intervalo', valor: '[0, 5]' },
      { etiqueta: 'Tolerancia', valor: '10⁻⁵' },
    ],

    extraccion: {
      busqueda:
        'El largo del lado menor donde la superficie es mínima. Es el punto donde la ' +
        'derivada se anula, o sea una raíz de f(x) = 2x − 3.',
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
      'Para una función cuadrática, encontrar el mínimo con derivada es innecesario: ' +
      'x = 3/2 exacto. Bisección da 1.5000000000 porque el método no sabe que la ' +
      'solución es racional. Es un buen recordatorio de que usar un método de ' +
      'iteración para algo que se puede hacer exacto tiene un costo real.',

    pasos: [
      'Paso 0 — Condición de arranque: f(0) = −3 y f(5) = 7. Producto −21 < 0: ' +
        'hay cambio de signo en [0, 5].',
      'Paso 1 — c = 2.5. f(2.5) = 5 − 3 = 2. Error 2.5.',
      'Paso 2 — f(0) = −3 y f(2.5) = 2 tienen signos distintos: la raíz está en ' +
        '[0, 2.5]. b pasa a 2.5.',
      'Paso 3 — c = 1.25. f(1.25) = 2.5 − 3 = −0.5. Ahora f(1.25) < 0 y f(2.5) > 0: ' +
        'la raíz está en [1.25, 2.5].',
    ],

    algoritmo:
      'Bisección sobre el intervalo [0, 5], partiéndolo a la mitad en cada ' +
      'paso hasta que la cota de error (b − a)/2 sea menor que 10⁻⁵.',

    criterio:
      'Cota de Bolzano (b − a)/2 < 10⁻⁵, alcanzada en la iteración 19. Ojo: el intervalo ' +
      'arranca en [0, 5], de ancho 5, así que hacen falta 19 pasos y no 17.',

    conclusion:
      'x ≈ 1.50000572, con error garantizado menor que 9.5368 × 10⁻⁶. La solución exacta ' +
      'es 1.5. Bisección se queda a 5.7 × 10⁻⁶ de la respuesta, dentro de la cota. ' +
      'error menor que 7.6294 × 10⁻⁶. Para este problema, derivar directamente ' +
      'era mejor: cero iteraciones y resultado exacto.',

    calculo: { funcion: '2*x - 3', a: 0, b: 5, tol: 0.00001, maxIter: 100 },
  },

  {
    id: 'biseccion-ej4',
    titulo: 'CASUÍSTICA: tiempo de vida media de un isótopo',
    tipo: 'casuistica',
    enunciado:
      'Un isótopo radiactivo tiene una vida media T que cumple e^(−T/τ) = 1/2, donde ' +
      'τ es la constante de decaimiento. Reescribiendo, la búsqueda del tiempo se ' +
      'convierte en encontrar el cero de f(T) = e^(−T) − 0.5 para τ = 1. El físico ' +
      'estima que T está entre 0 y 5 unidades de tiempo.',

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
      'La vida media es el tiempo en que queda la mitad. En un isótopo real, τ puede ' +
      'estar en años o en milisegundos: bisección lo maneja igual porque solo necesita ' +
      'que f sea continua y cambie de signo.',

    pasos: [
      'Paso 0 — Condición de arranque: f(0) = 0.5 y f(5) = −0.4933. Hay cambio de signo.',
      'Paso 1 — c = 2.5. f(2.5) = e^(−2.5) − 0.5 = −0.4179. Error 2.5.',
      'Paso 2 — f(0) = 0.5 y f(2.5) = −0.4179 tienen signos distintos: la raíz está ' +
        'en [0, 2.5]. b pasa a 2.5.',
      'Paso 3 — c = 1.25. f(1.25) = e^(−1.25) − 0.5 = −0.2135. Ahora f(0) = 0.5 > 0 y ' +
        'f(1.25) < 0: la raíz está en [0, 1.25]. b pasa a 1.25.',
    ],

    algoritmo:
      'Bisección sobre el intervalo [0, 5], partiéndolo a la mitad en cada ' +
      'paso hasta que la cota de error (b − a)/2 sea menor que 10⁻⁵.',

    criterio:
      'Cota de Bolzano (b − a)/2 < 10⁻⁵. El intervalo [0, 5] tiene ancho 5, así que ' +
      'hacen falta 19 iteraciones.',

    conclusion:
      'T ≈ 0.69314003, con error garantizado menor que 9.5368 × 10⁻⁶. El valor exacto es ' +
      'ln(2) ≈ 0.69314718, así que la diferencia real (7.2 × 10⁻⁶) es menor que la cota. ' +
      'Nótese que ln(2) se conoce exacto, pero bisección igual lo aproxima bien: ' +
      'el método no necesita saber la forma de la solución.',

    calculo: { funcion: 'e^(-x) - 0.5', a: 0, b: 5, tol: 0.00001, maxIter: 100 },
  },
];

/* ================================================================== */
/* AUTOEVALUACIÓN                                                      */
/* ================================================================== */

export const EJERCICIOS_BISECCION: Ejercicio[] = [
  {
    id: 'biseccion-ejercicio-1',
    titulo: 'Resolver x² + 2x − 15 = 0 por bisección',
    tipo: 'numerico',
    ecuacion: 'x² + 2x − 15 = 0 en [0, 5]',
    parametros: [
      { etiqueta: 'Función', valor: 'f(x) = x² + 2x − 15' },
      { etiqueta: 'Intervalo', valor: '[0, 5]' },
      { etiqueta: 'Tolerancia', valor: '10⁻⁴' },
    ],
    interpretacion:
      'Un problema de raíces cuadráticas, resuelto por bisección. La raíz positiva ' +
      'es x = 3 y la negativa es x = −5, pero solo la positiva cae en [0, 5]. ' +
      'Buen ejercicio para ver cómo el método maneja un intervalo asimétrico.',

    pasos: [
      'Paso 0 — Condición de arranque: f(0) = −15 y f(5) = 25 + 10 − 15 = 20. ' +
        'Producto −300 < 0: hay cambio de signo.',
      'Paso 1 — c = 2.5. f(2.5) = 6.25 + 5 − 15 = −3.75. Error 2.5.',
      'Paso 2 — f(0) = −15 y f(2.5) = −3.75 tienen el mismo signo: la raíz está en ' +
        '[2.5, 5]. a pasa a 2.5.',
      'Paso 3 — c = 3.75. f(3.75) = 14.0625 + 7.5 − 15 = 6.5625. La raíz está en [2.5, 3.75].',
    ],

    algoritmo:
      'Bisección sobre el intervalo [0, 5], partiéndolo a la mitad en cada ' +
      'paso hasta que la cota de error (b − a)/2 sea menor que 10⁻⁴.',

    criterio: 'Cota de Bolzano (b − a)/2 < 10⁻⁴ en 16 iteraciones.',

    conclusion:
      'x ≈ 2.99995422, con error garantizado menor que 7.6294 × 10⁻⁵. La raíz exacta ' +
      'es 3: el método se acerca pero nunca la alcanza exactamente porque trabaja con ' +
      'puntos medios de números binarios.',

    calculo: { funcion: 'x^2 + 2*x - 15', a: 0, b: 5, tol: 0.0001, maxIter: 100 },

    pista:
      'f(0) y f(5) tienen que tener signos distintos para que el método funcione. ' +
      'Verificá eso antes de empezar: f(0) = −15 (negativo) y f(5) = 20 (positivo).',
  },

  {
    id: 'biseccion-ejercicio-2',
    titulo: 'Encontrar dónde ln(x+1) = 3',
    tipo: 'numerico',
    ecuacion: 'ln(x+1) − 3 = 0 en [1, 20]',
    parametros: [
      { etiqueta: 'Función', valor: 'f(x) = ln(x+1) − 3' },
      { etiqueta: 'Intervalo', valor: '[1, 20]' },
      { etiqueta: 'Tolerancia', valor: '10⁻⁴' },
    ],
    interpretacion:
      'Despejando, x = e³ − 1 ≈ 19.0855. El ejercicio pide aplicar bisección a ' +
      'una función logarítmica, que es creciente y suave: ideal para el método. ' +
      'El intervalo [1, 20] fue elegido porque e³ − 1 cae justo adentro, y eso hay ' +
      'que comprobarlo antes de empezar.',

    pasos: [
      'Paso 0 — Condición de arranque: f(1) = ln(2) − 3 = −2.3069 y f(20) = ln(21) − 3 = 0.0445. ' +
        'Producto negativo: hay cambio de signo.',
      'Paso 1 — c = 10.5. f(10.5) = ln(11.5) − 3 = −0.5297. Error 9.5.',
      'Paso 2 — f(1) < 0 y f(10.5) < 0 tienen el mismo signo: la raíz está en [10.5, 20]. ' +
        'a pasa a 10.5.',
      'Paso 3 — c = 15.25. f(15.25) = ln(16.25) − 3 = −0.1372. La raíz está en [15.25, 20].',
    ],

    algoritmo:
      'Bisección sobre el intervalo [1, 20], partiéndolo a la mitad en cada ' +
      'paso hasta que la cota de error (b − a)/2 sea menor que 10⁻⁴.',

    criterio: 'Cota de Bolzano (b − a)/2 < 10⁻⁴ en 18 iteraciones.',

    conclusion:
      'x ≈ 19.08552933, con error garantizado menor que 7.2480 × 10⁻⁵. La solución ' +
      'exacta es e³ − 1 ≈ 19.0855. La diferencia real (7.596 × 10⁻⁶) es mucho menor ' +
      'que la cota, porque f es muy plana cerca de la raíz.',

    calculo: { funcion: 'ln(x+1) - 3', a: 1, b: 20, tol: 0.0001, maxIter: 100 },

    pista:
      'El logaritmo necesita x > −1. Con a = 1 no hay problema, pero si eligieras ' +
      'a = −2, la función no estaría definida y el cálculo fallaría.',
  },

  {
    id: 'biseccion-ejercicio-3',
    titulo: 'CASUÍSTICA: el factor de carga de un puente',
    tipo: 'casuistica',
    enunciado:
      'El factor de carga λ de un puente se modela por g(λ) = λ·e^λ − 5, donde λ es la ' +
      'relación entre la carga real y la carga de diseño. El ingeniero busca el ' +
      'λ donde g(λ) = 0, que es donde el puente opera al límite. Sabe que λ está ' +
      'entre 0 y 5.',

    ecuacion: 'λ·e^λ − 5 = 0 en [0, 5]',
    parametros: [
      { etiqueta: 'Función', valor: 'f(x) = x·e^x − 5' },
      { etiqueta: 'Intervalo', valor: '[0, 5]' },
      { etiqueta: 'Tolerancia', valor: '10⁻⁴' },
    ],

    extraccion: {
      busqueda:
        'El factor de carga λ en el punto de equilibrio, donde g(λ) = 0.',
      datos: [
        { simbolo: 'a = 0', valor: '0', queEs: 'Carga nula: no hay puente en uso.' },
        { simbolo: 'b = 5', valor: '5', queEs: 'Máxima relación de carga considerada.' },
      ],
      formulacion:
        'Se verifica Bolzano: f(0) = −5 y f(5) = 5e⁵ − 5 ≈ 737. Producto negativo, ' +
        'hay cambio de signo en [0, 5].',
    },

    interpretacion:
      'La raíz λ ≈ 1.3267 dice que el puente opera al límite cuando la carga real es ' +
      '1.33 veces la de diseño. Como el factor de seguridad típico es 1.5, un margen ' +
      'adicional del 13% sería razonable, pero eso ya es decisión de ingeniería, no de ' +
      'la matemática.',

    pasos: [
      'Paso 0 — Condición de arranque: f(0) = −5 y f(5) ≈ 737. Signos distintos.',
      'Paso 1 — c = 2.5. f(2.5) = 2.5·e^2.5 − 5 = 26.36. Error 2.5.',
      'Paso 2 — f(0) = −5 y f(2.5) = 26.36 tienen signos distintos: la raíz está en ' +
        '[0, 2.5]. b pasa a 2.5.',
      'Paso 3 — c = 1.25. f(1.25) = 1.25·e^1.25 − 5 = −0.7025. La raíz está en [1.25, 2.5].',
    ],

    algoritmo:
      'Bisección sobre el intervalo [0, 5], partiéndolo a la mitad en cada ' +
      'paso hasta que la cota de error (b − a)/2 sea menor que 10⁻⁴.',

    criterio: 'Cota de Bolzano (b − a)/2 < 10⁻⁴ en 16 iteraciones.',

    conclusion:
      'λ ≈ 1.32667542, con error garantizado menor que 7.6294 × 10⁻⁵. Es un buen ' +
      'caso para ver que bisección funciona igual de bien con funciones que tienen ' +
      'exponenciales, siempre que sean continuas.',

    calculo: { funcion: 'x*e^x - 5', a: 0, b: 5, tol: 0.0001, maxIter: 100 },

    pista:
      'f(0) = −5 y f(5) ≈ 737: signos clarísimos. El ejercicio es ver cómo el ' +
      'método maneja una función que crece muy rápido, donde el residuo |f(c)| ' +
      'sería un criterio pésimo: la primera iteración ya da un residuo enorme.',
  },
];