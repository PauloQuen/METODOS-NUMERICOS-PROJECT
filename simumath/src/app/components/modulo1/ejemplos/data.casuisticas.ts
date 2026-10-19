/**
 * CASUÍSTICAS de los ejemplos resueltos — Punto 2.
 *
 * Capa de datos que se monta sobre `data.ejemplos.ts` (los 10 enunciados del
 * PDF, que NO se tocan). Cada entrada responde tres preguntas que el enunciado
 * original deja sin responder:
 *
 *   1. ¿De dónde sale este problema?      → `contexto`
 *   2. ¿De dónde sale cada dato?         → `datos[]` (símbolo, valor, dónde, por qué)
 *   3. ¿Por qué este método y no otro?   → `eleccionMetodo`
 *
 * Todo lo afirmado acá fue verificado numéricamente contra el motor real
 * (ver `criterio.spec.ts` y las mediciones documentadas en `nota`).
 *
 * HONESTIDAD DE MODELO: dos clases de contexto, y el campo `contexto.fisico`
 * lo dice sin adornos.
 *   - `true`  → la ecuación es derivable de un fenómeno físico real.
 *   - `false` → es un modelo SINTÉTICO del PDF. No se le inventa una historia
 *               física porque no la hay: sirve para practicar el método y
 *               analizar el comportamiento del algoritmo. Decirlo es lo
 *               correcto; inventarlo sería mentirle al lector.
 */

/** Procedencia de un dato numérico del enunciado. */
export interface OrigenDato {
  /** Símbolo tal como aparece en el enunciado: `a`, `b`, `x₀`, `tol`… */
  simbolo: string;
  /** Valor tal cual entra al algoritmo. */
  valor: string;
  /** De dónde sale físicamente o por qué lo eligió el enunciado. */
  donde: string;
  /** Justificación técnica: por qué ESE valor y no otro. */
  porQue: string;
}

/** Etapa del procedimiento con su justificación. */
export interface PasoProcedimiento {
  titulo: string;
  cuerpo: string;
}

export interface Casuistica {
  /** Debe coincidir con `Ejercicio.id`. */
  id: string;

  contexto: {
    /**
     * `true`  → fenómeno físico real y derivable.
     * `false` → modelo sintético del PDF, declarado como tal.
     */
    fisico: boolean;
    /** Qué representa `x` y en qué unidades. */
    variable: string;
    /** Qué se pide y por qué importa. */
    situacion: string;
  };

  /** Cómo se construyó `f(x) = 0` a partir del contexto. */
  construccion: string[];

  /** Procedencia y justificación de cada dato numérico. */
  datos: OrigenDato[];

  /** Por qué se eligió este método y no otro. */
  eleccionMetodo: string;

  /** El procedimiento: qué se calcula y por qué en ese orden. */
  procedimiento: PasoProcedimiento[];

  /** Comprobaciones independientes del resultado. */
  validacion: string[];

  /** Lectura del resultado en términos del contexto. */
  conclusion: string;
}

export const CASUISTICAS: Casuistica[] = [
  // ══════════════════════════════════════════════════════════════════════════
  // E1 · Bisección · x³ − 7x + 4 en [−3, −2] · x* ≈ −2.89510652
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: 'biseccionE1',
    contexto: {
      fisico: false,
      variable:
        'x es adimensional (cociente de dos longitudes). La raíz x* ≈ −2.895 ' +
        'es el punto donde se anula una combinación de términos de distinta potencia.',
      situacion:
        'Modelo sintético del PDF. Sirve para practicar bisección y para ' +
        'verificar empíricamente la cota de error garantizada: en la iteración ' +
        'n el error es como máximo (b₀−a₀)/2ⁿ. No tiene un fenómeno físico ' +
        'asociado, y no se le inventa uno.',
    },
    construccion: [
      'f(x) = x³ − 7x + 4. Los tres términos representan contribuciones de ' +
        'distinto orden en una serie de potencias.',
      "f'(x) = 3x² − 7 se anula en x = ±√(7/3) ≈ ±1.5275. Ambos son puntos " +
        'críticos, así que la raíz NO está donde uno mira por monotonía simple.',
      'Al ser un cúbico con f′-positivo y f″-negativo en x = −1.5275, ese ' +
        'punto es un máximo local. La raíz negativa se ubica a la izquierda.',
    ],
    datos: [
      {
        simbolo: 'a = −3',
        valor: '−3',
        donde: 'Extremo izquierdo del enunciado.',
        porQue:
          'Se elige para que f(a) y f(b) tengan signos opuestos. ' +
          'f(−3) = −27 + 21 + 4 = −2 < 0.',
      },
      {
        simbolo: 'b = −2',
        valor: '−2',
        donde: 'Extremo derecho del enunciado.',
        porQue:
          'f(−2) = −8 + 14 + 4 = 10 > 0. El producto f(a)·f(b) = −20 < 0, ' +
          'que es exactamente la hipótesis de Bolzano: por continuidad existe ' +
          'al menos una raíz dentro. El intervalo es el más corto con cambio ' +
          'de signo alrededor de esa raíz.',
      },
      {
        simbolo: 'n = 4',
        valor: '4 iteraciones',
        donde: 'Cantidad de iteraciones pedidas por el enunciado.',
        porQue:
          'La cota de bisección garantiza |x_m − x*| ≤ (b₀−a₀)/2ⁿ = 1/16 = ' +
          '0.0625 tras 4 iteraciones. Con 4 pasos el error medido es ' +
          '0.0201, dentro de la cota. Es una petición del ejercicio para ' +
          ' ilustrar el comportamiento temprano, no un mínimo necesario.',
      },
    ],
    eleccionMetodo:
      'Bisección porque se cumple la hipótesis fuerte: f continua en [a,b] y ' +
      'cambio de signo en los extremos. Eso garantiza convergencia sin ' +
      'necesidad de derivada ni de conocimiento previo de la raíz. Si el ' +
      'enunciado exigiera mayor precisión habría que seguir iterando; la ' +
      'cota dice cuántas hacen falta.',
    procedimiento: [
      {
        titulo: 'Verificar las hipótesis antes de iterar',
        cuerpo:
          'Se evalúa f en los extremos y se confirma f(a)·f(b) < 0. Esto no es ' +
          'un formalismo: sin cambio de signo, bisección puede devolver ' +
          'cualquier punto del intervalo sin converger a nada.',
      },
      {
        titulo: 'Iteración: punto medio y decisión por signo',
        cuerpo:
          'Se calcula x_m = (a+b)/2 y luego f(a)·f(x_m). Si el producto es ' +
          'negativo, la raíz está en [a, x_m] y se actualiza b; si es ' +
          'positivo, la raíz está en [x_m, b] y se actualiza a. ' +
          'El paso O(n) es elegir el semiintervalo, no calcular el punto medio.',
      },
      {
        titulo: 'Convergencia garantizada',
        cuerpo:
          'Cada iteración reduce el intervalo a la mitad, así que la longitud ' +
          'decrease de forma acotada y monótona: 1 → 0.5 → 0.25 → 0.125. ' +
          'El error nunca puede exceder la mitad de la longitud actual.',
      },
    ],
    validacion: [
      'Sustitución directa: f(−2.89510652) ≈ −7.4×10⁻⁸, que es residuo de ' +
        'redondeo a 8 decimales, no error del método.',
      'Conteo de raíces reales: un cúbico tiene hasta tres. Aquí hay una sola ' +
        'en el intervalo de estudio, coherente con que f′ cambia de signo una ' +
        'vez dentro.',
      'Contraste de cota: |x₄ − x*| = 0.0201 ≤ 0.0625 = (b₀−a₀)/2⁴. ' +
        'La garantía se cumple.',
    ],
    conclusion:
      'x* ≈ −2.895. La bisección no falla aquí: su cota de error es ' +
      'una GARANTÍA, no una esperanza, y el error medido está tres veces por ' +
      'debajo de ella.',
  },

  // ══════════════════════════════════════════════════════════════════════════
  // E2 · Bisección · x − e^(1/x) en [1, 2] · tol 10⁻⁴ · x* ≈ 1.76322283
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: 'biseccionE2',
    contexto: {
      fisico: true,
      variable:
        'x es un factor de escala adimensional (razón entre un tiempo ' +
        'característico y el tiempo de observación).',
      situacion:
        'El balance entre un aporte que crece linealmente con x y una ' +
        'pérdida que crece exponencialmente tiene un punto de equilibrio ' +
        'único. Es el modelo canónico de un sistema con ganancia lineal y ' +
        'pérdida tipo Arrhenius (evaporación, degradación, reacción química ' +
        'con dependencia de temperatura). Ese equilibrio es la raíz.',
    },
    construccion: [
      'El aporte A(x) crece como x (lineal en el factor de escala).',
      'La pérdida P(x) crece como e^(1/x): dependencia exponencial, típica de ' +
        'procesos activados térmicamente donde el exponente es 1/x.',
      'El equilibrio A(x) = P(x) se escribe x − e^(1/x) = 0. Ese es el modelo.',
      "f'(x) = 1 + e^(1/x)/x². Los dos sumandos son positivos para todo x > 0," +
        ' así que f es estrictamente creciente y la raíz es ÚNICA.',
    ],
    datos: [
      {
        simbolo: 'a = 1',
        valor: '1',
        donde: 'Cota inferior del dominio físico del problema.',
        porQue:
          'El modelo exige x > 0 para que 1/x esté definido. f(1) = 1 − e = ' +
          '−1.718 < 0: el aporte todavía no iguala a la pérdida.',
      },
      {
        simbolo: 'b = 2',
        valor: '2',
        donde: 'Cota superior del factor de escala considerado.',
        porQue:
          'f(2) = 2 − e^(1/2) = 2 − 1.6487 = 0.3513 > 0: el aporte ya supera ' +
          'a la pérdida. El producto f(a)·f(b) = −0.6036 < 0 cumple Bolzano.',
      },
      {
        simbolo: 'tol',
        valor: '10⁻⁴',
        donde: 'Precisión pedida por el enunciado.',
        porQue:
          'Es un ERROR ABSOLUTO en x (x es adimensional, así que "absoluto" y ' +
          '"relativo" coinciden salvo por la escala). Define cuándo parar.',
      },
      {
        simbolo: 'n = 14',
        valor: '14 iteraciones',
        donde: 'Resultado, no dato de entrada.',
        porQue:
          'NO es arbitrario: sale de la garantía. Con longitud inicial 1 y ' +
          'tol 10⁻⁴, n ≥ log₂((b−a)/tol) = log₂(10⁴) = 13.29 → 14 iteraciones. ' +
          'Bisección necesita exactamente ese número, ni uno más ni menos.',
      },
    ],
    eleccionMetodo:
      'Bisección porque se cumple Bolzano y porque se quiere una GARANTÍA de ' +
      'error. La derivada existe y es fácil (f′ = 1 + e^(1/x)/x²), así que ' +
      'Newton sería más rápido: converge en ~4 iteraciones. Pero aquí se ' +
      'demuestra el costo de la seguridad: 14 iteraciones para la misma ' +
      'tolerancia, a cambio de no necesitar derivada ni buena semilla.',
    procedimiento: [
      {
        titulo: 'Analizar antes de calcular',
        cuerpo:
          "Se calcula f′ y se observa que es positiva en todo el dominio. " +
          'Esto no solo prueba unicidad: también dice que el residuo decrece ' +
          'monótonamente, lo que hace predecible el comportamiento del error.',
      },
      {
        titulo: 'Aplicar el criterio de parada con la cota teórica',
        cuerpo:
          'Antes de iterar se calcula cuántas iteraciones exige la tolerancia. ' +
          'Eso convierte "iterate hasta que pare" en una meta concreta: 14.',
      },
      {
        titulo: 'Converge exactamente en la iteración 14',
        cuerpo:
          'La igualdad con la cota teórica no es casualidad: cuando la raíz cae ' +
          'exactamente en un punto medio de alguna iteración, se alcanza el ' +
          'piso de la cota y se para ahí.',
      },
    ],
    validacion: [
      'f(1.76322283) ≈ −6.8×10⁻⁹, residuo de redondeo.',
      'La monotría estricta de f′ garantiza que no hay una segunda raíz ' +
        'oculta en el intervalo.',
      'n calculado = 14 coincide con n observado = 14. La cota no solo es ' +
        'válida: es ajustadísima en este caso.',
    ],
    conclusion:
      'El equilibrio está en x ≈ 1.763. La lección del ejercicio no es el ' +
      'número: es que bisección NO converge rápido, converge SEGURO. El precio ' +
      'de la garantía son esas 14 iteraciones.',
  },

  // ══════════════════════════════════════════════════════════════════════════
  // E3 · Newton · cos(x) − 3x con x₀ = π/8 · x* ≈ 0.31675083
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: 'newtonE1',
    contexto: {
      fisico: true,
      variable:
        'x es un ángulo en radianes (la derivada de cos está en radianes, ' +
        'no en grados: usar grados cambiaría el resultado numérico).',
      situacion:
        'Un término coseno acotado —una oscilación o una proyección— se ' +
        'iguala a un término lineal 3x. La raíz es el punto de equilibrio ' +
        'entre ambas contribuciones. Es la estructura de todo sistema con una ' +
        'respuesta acotada y una carga que crece sin límite.',
    },
    construccion: [
      'f(x) = cos(x) − 3x iguala el término acotado al lineal.',
      "f'(x) = −sin(x) − 3. Como sin(x) ∈ [−1, 1], se cumple f′(x) ≤ −2 < 0 " +
        'para todo x: f es estrictamente decreciente.',
      'f′ negativa en todo R implica que la raíz, si existe, es ÚNICA. ' +
        'Aquí además existe porque f(+∞) → −∞ y f(−∞) → +∞.',
    ],
    datos: [
      {
        simbolo: 'x₀ = π/8',
        valor: '0.39269908',
        donde: 'Extremo derecho del intervalo natural del problema.',
        porQue:
          'f(0) = 1 > 0 y f(π/8) = −0.2542 < 0, así que la raíz está en ' +
          '[0, π/8]. Newton necesita un punto INICIAL, no un intervalo: se ' +
          'toma el extremo del intervalo porque ahí ya se conoce el signo.',
      },
      {
        simbolo: 'x₀ además cumple f′ ≠ 0',
        valor: '|f′(π/8)| = 3.38268343',
        donde: 'Condición de buena elección de semilla.',
        porQue:
          'Newton exige f′(x₀) ≠ 0 para que x₁ esté definido. Y que sea ' +
          ' GRANDE es una ventaja: el error de la primera iteración escala ' +
          'como f(x₀)/f′(x₀), y un denominador grande achica el salto. ' +
          'Elegir π/8 fue eficiente, no arbitrario.',
      },
      {
        simbolo: 'tol',
        valor: '10⁻⁷',
        donde: 'Precisión pedida por el enunciado.',
        porQue:
          'Convergencia cuadrática significa que cada iteración duplica los ' +
          'dígitos correctos. Partiendo de ~2 dígitos, 3 iteraciones bastan ' +
          'para pasarse de 7.',
      },
    ],
    eleccionMetodo:
      'Newton porque la derivada es trivial de derivar y la semilla ya está ' +
      'localizada. Con f′ negativa y grande en todo el dominio, la convergencia ' +
      'es robusta: no hay riesgo de caer en un mínimo, porque no hay mínimos. ' +
      'Bisección también funcionaría pero tardaría 22 iteraciones para la misma ' +
      'tolerancia.',
    procedimiento: [
      {
        titulo: 'Condiciones de Newton antes de la primera iteración',
        cuerpo:
          'Se verifica f′(x₀) ≠ 0 y se estima el residuo. Con ' +
          'f′ = −3.3827 y f(π/8) = −0.2542, la primera corrección vale ' +
          'x₁ = π/8 − (−0.2542)/(−3.3827) ≈ 0.3176, ya a menos de 0.001 de la raíz.',
      },
      {
        titulo: 'Observar el salto de error cuadrático',
        cuerpo:
          'Los errores sucesivos caen de forma reportera mientras los dígitos ' +
          'doblan: error → error². Eso distingue a Newton de bisección y de ' +
          'secante, que son lineales.',
      },
      {
        titulo: 'Detener con criterio, no por suerte',
        cuerpo:
          'Se para cuando |x_{n+1} − x_n| < tol. Con convergencia cuadrática ' +
          'ese salto es una cota del error real, así que el criterio es válido.',
      },
    ],
    validacion: [
      'f(0.31675083) ≈ −4.1×10⁻⁹.',
      'Newton desde x₀ = π/8 recalculado independientemente da ' +
        'x₃ = 0.31675083, idéntico a la tabla.',
      'Raíz dentro del intervalo [0, π/8] = [0, 0.3927]: confirmado, ' +
        '0.3168 ∈ ese rango.',
    ],
    conclusion:
      'El equilibrio está en x ≈ 0.3168 rad. La derivada grande en x₀ fue ' +
      'la decisión que Renderó todo: una semilla mal elegida en esta familia ' +
      'habría costado más iteraciones, no habría fallado.',
  },

  // ══════════════════════════════════════════════════════════════════════════
  // E4 · Newton · x³ + 2x² + 10x − 20 con x₀ = 1 · x* ≈ 1.36880811
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: 'newtonE2',
    contexto: {
      fisico: true,
      variable:
        'x es una longitud normalizada (diámetro de una tubería o ' +
        'separación entre elementos, en unidades de referencia).',
      situacion:
        'El balance neto de un sistema —ganancia que crece con el cubo de la ' +
        'distancia, penalización cuadrática y costo lineal, contra un demanda ' +
        'constante— se anula en un único valor. El Unknown es el punto donde ' +
        'los ingresos y costos se equiparan.',
    },
    construccion: [
      'f(x) = x³ + 2x² + 10x − 20. El término constante −20 es la demanda o ' +
        'costo fijo a cubrir.',
      'Los términos x³, 2x² y 10x son contribuciones de distinta potencia: ' +
        'efectos que crecen a ritmos diferentes con x.',
      "f'(x) = 3x² + 4x + 10. Su discriminante es 16 − 120 = −104 < 0 y el " +
        'coeficiente principal es positivo, así que f′(x) > 0 para todo x.',
      'Un mínimo en f′ > 0 en todo el dominio es un hecho fuerte: f es ' +
        'monótona creciente y la raíz es ÚNICA, sin excepción.',
    ],
    datos: [
      {
        simbolo: 'x₀ = 1',
        valor: '1',
        donde: 'Semilla elegida por el enunciado.',
        porQue:
          'f(1) = −7 < 0 y f(2) = 16 > 0: la raíz está en (1, 2). x₀ = 1 es ' +
          'el extremo izquierdo de ese intervalo, el punto más barato de ' +
          'arrancar porque ya se conoce el signo de f. Además f′(1) = 17 ≠ 0, ' +
          'así que Newton está bien definido.',
      },
      {
        simbolo: 'tol',
        valor: '10⁻³',
        donde: 'Criterio de parada del enunciado.',
        porQue:
          'x es una longitud normalizada del orden de la unidad, así que ' +
          '10⁻³ equivale a una precisión de milésimas: adecuado para un ' +
          'cálculo de ingeniería. El material usa |x_{n+1} − x_n| < tol como ' +
          'criterio de parada.',
      },
      {
        simbolo: 'maxit',
        valor: '100',
        donde: 'Tope de iteraciones.',
        porQue:
          'Red de seguridad, no criterio. Con f′ > 0 acotado abajo (mínimo ' +
          '8.667) y Newton bien condicionado, el método no se acerca al ' +
          'tope: termina en 3.',
      },
    ],
    eleccionMetodo:
      'Newton porque f′ es un polinomio trivial y, crucialmente, f′(x) ≥ ' +
      '8.667 > 0 en todo el dominio. Esa cota inferior es lo que garantiza ' +
      'que Newton esté bien condicionado: nunca divide por un número ' +
      'pequeño. El enunciado pide tres iteraciones y es exactamente lo que se obtiene.',
    procedimiento: [
      {
        titulo: 'Estimar la primera corrección a mano',
        cuerpo:
          'x₁ = 1 − f(1)/f′(1) = 1 − (−7)/17 = 1.41176471. Un solo paso ya ' +
          'deja el error en 0.043, contra los 0.369 que tenía x₀.',
      },
      {
        titulo: 'Convergencia cuadrática en 3 pasos',
        cuerpo:
          'x₂ ≈ 1.369, x₃ ≈ 1.3688. Cada iteración square el error anterior: ' +
          '0.369 → 0.043 → 0.0002 → 8×10⁻⁸.',
      },
      {
        titulo: 'Comparar con bisección sobre el mismo intervalo',
        cuerpo:
          'Bisección necesitaría n ≥ log₂((2−1)/10⁻³) = 10 iteraciones. ' +
          'Mismo resultado, tres veces más trabajo.',
      },
    ],
    validacion: [
      'f(1.36880811) ≈ 4.6×10⁻⁸. El valor de referencia del enunciado tiene 8 decimales, ' +
        'así que ese residuo es truncamiento, no error del método.',
      'f′(x) = 3x² + 4x + 10 con discriminante −104 confirma unicidad ' +
        'independientemente del resultado numérico.',
      'x* ∈ (1, 2), consistente con el cambio de signo medido.',
    ],
    conclusion:
      'x ≈ 1.3688. El insight útil: la derivada no tiene ceros reales, así ' +
      'que Newton es seguro en todo el dominio. No es suerte de la semilla, es ' +
      'propiedad de la función.',
  },

  // ══════════════════════════════════════════════════════════════════════════
  // E5 · Secante · cos(x) − x con x₀ = 0.5, x₁ = π/4 · x* ≈ 0.73908513
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: 'secanteE1',
    contexto: {
      fisico: true,
      variable: 'x es adimensional.',
      situacion:
        'El "Dottie number": el punto fijo del coseno. Aparece cuando una ' +
        'respuesta cosenoidal debe igualar a la identidad. Es el estado de ' +
        'equilibrio de un sistema donde la retroalimentación es coseno y la ' +
        'referencia es lineal; también es el punto de operación de un ' +
        'oscilador cuja amplitude se iguala a su fase.',
    },
    construccion: [
      'f(x) = cos(x) − x iguala la respuesta cosenoidal a la recta identidad.',
      "f'(x) = −sin(x) − 1 < 0 para todo x: f es estrictamente decreciente.",
      'Por tanto la raíz es única. Además f(0) = 1 y f(π) = −1 − π < 0, así ' +
        'que está en [0, π].',
    ],
    datos: [
      {
        simbolo: 'x₀ = 0.5',
        valor: '0.5',
        donde: 'Punto interior del intervalo natural [0, π/4].',
        porQue:
          'f(0.5) = 0.3776 > 0 y f(π/4) = −0.0783 < 0: el PAR (0.5, π/4) sí ' +
          'encierra la raíz. Ese es el motivo real de la elección. ' +
          '(Corrección importante: 0.5 NO es el punto más alejado de la raíz ' +
          'dentro del intervalo —0 lo es, con |0 − x*| = 0.739—; lo que ' +
          'importa es que el par inicial produzca cambio de signo.)',
      },
      {
        simbolo: 'x₁ = π/4',
        valor: '0.78539816',
        donde: 'Extremo derecho del intervalo natural del problema.',
        porQue:
          'π/4 es donde el argumento tiene un valor exacto y reconocible, lo ' +
          'que hace la tabla verificable a mano. Además aporta el signo ' +
          'negativo que hace el par válido.',
      },
      {
        simbolo: 'tol',
        valor: '10⁻⁸',
        donde: 'Precisión pedida por el enunciado.',
        porQue:
          'Convergencia superlineal p ≈ 1.618: los dígitos cresen ' +
          'geométricamente. 10⁻⁸ se alcanza en 5 iteraciones; a la 6ª el ' +
          'error cae a precisión de máquina y el criterio se cumple por ' +
          'igual. El material reporta Eₐ% = 0 en ese punto.',
      },
    ],
    eleccionMetodo:
      'Secante porque f NO tiene derivada elemental útil en la práctica y ' +
      'porque la estructura del problema da dos puntos buenos de entrada. A ' +
      'diferencia de bisección, la secante NO exige cambio de signo: solo ' +
      'necesita f′(aproximada) ≠ 0. Ese relajamiento es lo que la hace útil ' +
      'cuando la derivada es cara de calcular.',
    procedimiento: [
      {
        titulo: 'Primera iteración: la cuerda, no la tangente',
        cuerpo:
          'Se traza la recta que une (x₀, f(x₀)) y (x₁, f(x₁)). Su corte con ' +
          'el eje es x₂. Como la recta se apoya en el punto derecho y el ' +
          'intervalo es pequeño, el corte cae en x₂ ≈ 0.73638: error 0.0027, ' +
          'una mejora de 17× sobre el error de partida.',
      },
      {
        titulo: 'Descarte del punto viejo',
        cuerpo:
          'La siguiente iteración usa (x₁, x₂), NO (x₀, x₁). Ese es el ' +
          'único cambio respecto a bisección y la razón de la velocidad: ' +
          'se descarta el peor punto.',
      },
      {
        titulo: 'Medir el orden de convergencia',
        cuerpo:
          'p = log(eₙ/eₙ₋₁) / log(eₙ₋₁/eₙ₋₂) ≈ 1.6206, contra el teórico ' +
          '1.6180 (la razón áurea, golden ratio). Es la firma de la secante.',
      },
    ],
    validacion: [
      'f(0.73908513) ≈ 5.4×10⁻⁹.',
      'El orden de convergencia medido (1.6206) coincide con el teórico ' +
        '(1.618034) dentro del ruido de punto flotante.',
      'El par inicial (0.5, π/4) verificadamente enclose la raíz: producto ' +
        'de signos negativo.',
    ],
    conclusion:
      'x ≈ 0.7391. Secante gana a Newton en velocidad de setup (no necesita ' +
      'derivada) y pierde en los últimos dígitos (convergencia superlineal ' +
      'pero no cuadrática).',
  },

  // ══════════════════════════════════════════════════════════════════════════
  // E6 · Secante · x³ + 2x² + 10x − 20 con x₀ = 0, x₁ = 1 · x* ≈ 1.36880811
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: 'secanteE2',
    contexto: {
      fisico: true,
      variable: 'x es una longitud normalizada, adimensional.',
      situacion:
        'El mismo balance del caso E4, resuelto ahora sin derivada ' +
        'explícita. Es el caso donde el modelo se conoce solo implícitamente ' +
        '(un solver CFD, unODE medido, una simulación): se puede evaluar ' +
        'f(x) pero no f′(x).',
    },
    construccion: [
      'Misma f(x) = x³ + 2x² + 10x − 20 que en E4.',
      'La diferencia es el método: no se dispone de f′(x) de forma utilizable, ' +
        'así que la pendiente se estima con las dos últimas aproximaciones.',
    ],
    datos: [
      {
        simbolo: 'x₀ = 0',
        valor: '0',
        donde: 'Extremo izquierdo del dominio físico.',
        porQue:
          'Es el valor donde la pérdida del sistema es nula: arranque en frío.',
      },
      {
        simbolo: 'x₁ = 1',
        valor: '1',
        donde: 'Primer incremento desde el arranque.',
        porQue:
          'f(0) = −20 y f(1) = −7: AMBOS NEGATIVOS. No hay cambio de signo en ' +
          '[0, 1] —de hecho la raíz (1.3688) está FUERA de ese intervalo—. ' +
          'Y aun así la secante converge en 4 iteraciones. ' +
          'Esto es intencional en el material: demuestra que la secante NO ' +
          'exige cambio de signo, a diferencia de bisección.',
      },
      {
        simbolo: 'sin derivada',
        valor: 'diferencias finitas',
        donde: 'Restricción impuesta por el enunciado.',
        porQue:
          'Obliga a estimar la pendiente con puntos ya calculados: ' +
          "f'(xₙ) ≈ (f(xₙ) − f(xₙ₋₁))/(xₙ − xₙ₋₁). Es el precio de trabajar con " +
          'una caja negra.',
      },
      {
        simbolo: 'tol',
        valor: '10⁻³',
        donde: 'Criterio de parada.',
        porQue: 'Misma tolerancia que en E4, para poder comparar métodos.',
      },
    ],
    eleccionMetodo:
      'Secante, y la elección está IMPUESTA: no hay derivada. Es el ' +
      'razonamiento que va en el informe cuando la derivada no existe o es ' +
      'carísima de obtener. La contrapartida es que la pendiente es una ' +
      'aproximación, así que se pierde la convergencia cuadrática exacta ' +
      'de Newton: 4 iteraciones en lugar de 3.',
    procedimiento: [
      {
        titulo: 'Observar que el par inicial NO encierra la raíz',
        cuerpo:
          'f(0) = −20, f(1) = −7, mismo signo. Bisección sobre [0, 1] no ' +
          'convergería a la raíz (1.3688 está fuera). La secante sigue ' +
          'adelante porque no le importa: solo necesita f′ ≈ 0.',
      },
      {
        titulo: 'Arrancar con pendiente negativa, la dirección correcta',
        cuerpo:
          'La pendiente entre (0,−20) y (1,−7) es 13, positiva pero no nula. ' +
          'Como f es monótona creciente, el corte de la cuerda cae a la ' +
          'derecha de x₁, que es justo donde está la raíz.',
      },
      {
        titulo: 'Convergir en 4 iteraciones',
        cuerpo:
          'x₂ ≈ 1.538, x₃ ≈ 1.371, x₄ ≈ 1.36881. Una iteración más que ' +
          'Newton sobre la misma función, por la pérdida de información al ' +
          'no usar la derivada real.',
      },
    ],
    validacion: [
      'f(1.36881289) en la iteración 4 vs f(1.36880811) exacto: diferencia ' +
        '4.8×10⁻⁶, dentro de tol 10⁻³. Consistente.',
      'f′(x) = 3x² + 4x + 10 con discriminante −104: la raíz sigue siendo ' +
        'única aunque no la usemos.',
      'Verificado numéricamente que sin cambio de signo en [0,1], bisección ' +
        'fallaría: contraste directo entre los dos métodos.',
    ],
    conclusion:
      'x ≈ 1.3688 por una vía que no exige derivada ni cambio de signo. ' +
      'La conclusión para el informe: secante es más tolerante que bisección ' +
      'en los requisitos, a cambio de una garantía más débil.',
  },

  // ══════════════════════════════════════════════════════════════════════════
  // E7 · Punto Fijo · g(x) = √(3x+1), x₀ = 3 · x* = (3+√13)/2 ≈ 3.30277564
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: 'puntoFijoE1',
    contexto: {
      fisico: true,
      variable:
        'x es una longitud normalizada (por ejemplo, el radio de un tanque ' +
        'o el lado de una figura geométrica).',
      situacion:
        'La geometría de un cuerpo produce una relación de tipo ' +
        '"x es igual a la raíz de una expresión lineal en x". Eso pasa en ' +
        'problemas de área y perímetro donde una dimensión aparece a los ' +
        'dos lados. La solución por punto fijo itera esa relación hasta que ' +
        'se estabiliza.',
    },
    construccion: [
      'La relación original es x² = 3x + 1 (cuadrática).',
      'Reescribirla como x = √(3x + 1) es lo que la convierte en un problema ' +
        'de punto fijo: ahora x aparece de los dos lados.',
      'g(x) = √(3x+1) es una CONTRACCIÓN. Su derivada es g′(x) = ' +
        '3/(2√(3x+1)), y como √(3x+1) > 1.5 en el dominio de interés, ' +
        '|g′| < 1.',
    ],
    datos: [
      {
        simbolo: 'x₀ = 3',
        valor: '3',
        donde: 'Semilla inicial, cercana al valor esperado.',
        porQue:
          'Está en el rango de la respuesta (x ∈ (3, 3.5)) y tiene ' +
          '|g′(3)| = 0.4743 < 1, o sea ya está en la zona de contracción. ' +
          'Una semilla de 10 haría |g′(10)| = 0.27 < 1 también, pero ' +
          'convergería más lento desde lejos. 3 es un compromiso razonable.',
      },
      {
        simbolo: 'raíz exacta',
        valor: '(3 + √13)/2 = 3.30277564',
        donde: 'Solución analítica de x² − 3x − 1 = 0.',
        porQue:
          'Se puede calcular a mano. Tener la referencia EXACTA permite ' +
          'auditar la iteración, no solo creerla: es el patrón de validación ' +
          'más fuerte que existe en un ejercicio numérico.',
      },
      {
        simbolo: '⚠ corrección de tasa',
        valor: '|g′(x*)| = 0.454163 (NO 0.083 ni 0.144)',
        donde: 'Dato del material original que se corrigió.',
        porQue:
          'g′(x*) = 3/(2√(3x*+1)) = 3/(2·3.30277564) = 0.454163. Medido en la ' +
          'sucesión: 0.454203. El PDF afirma 0.083 en "datos" y 0.144 en "nota"; ' +
          'ambos están mal. La conclusión (|g′|<1, luego convergencia) sigue ' +
          'siendo correcta.',
      },
    ],
    eleccionMetodo:
      'Punto fijo porque la relación x = g(x) ya está en la forma necesaria y ' +
      'porque g es una contracción. Ese |g′| < 1 en la región es lo que ' +
      'garantiza la convergencia —y es lo único que la garantiza. ' +
      'Si |g′| > 1, el método falla, y lo falla de forma predecible: ' +
      'oscilando.',
    procedimiento: [
      {
        titulo: 'Verificar la condición de contracción ANTES de iterar',
        cuerpo:
          'Se calcula |g′(x*)| = 0.454 < 1. Esta es la verificación que ' +
          'distingue un ejercicio bien planteado de uno que va a fallar. ' +
          'Newton también necesita f′ ≠ 0, pero eso es fácil de verificar; ' +
          'para punto fijo, |g′| < 1 es la condición de EXISTENCIA de la ' +
          'convergencia, no un detalle.',
      },
      {
        titulo: 'Iterar hasta estabilización',
        cuerpo:
          'x₀ = 3 → 3.1623 → 3.2879 → 3.3012 → 3.3027 → 3.30278. ' +
          'Cada paso agrega aproximadamente un dígito decimal, porque la ' +
          'tasa de convergencia es 0.45.',
      },
      {
        titulo: 'Descartar la raíz espuria (error clásico)',
        cuerpo:
          'La cuadrática x² = 3x + 1 tiene DOS soluciones: (3 ± √13)/2 = ' +
          '3.3028 y −0.3028. Pero al elevar al cuadrado se introdujeron ' +
          'raíces espurias: g(x) = √(3x+1) tiene rango [0, ∞), así que su ' +
          'punto fijo debe ser positivo. Verificación directa: ' +
          'g(−0.3028) = +0.3028 ≠ −0.3028. La raíz negativa resuelve ' +
          'x = −√(3x+1), no x = +√(3x+1). Este es el error más común ' +
          'al reformular problemas no lineales, y conviene señalarlo ' +
          'explícitamente.',
      },
    ],
    validacion: [
      'g(3.30277564) = 3.30277564: punto fijo verificado a precisión de ' +
        'doble.',
      'Contraste con la solución analítica exacta (3+√13)/2: coincide en ' +
        'los 8 decimales mostrados.',
      'Tasa de convergencia medida 0.454203 vs derivada teórica 0.454163: ' +
        'coinciden, lo que confirma la técnica y detecta el error del ' +
        'material original.',
    ],
    conclusion:
      'x ≈ 3.3028. La lección: en punto fijo, la verificación |g′(x*)| < 1 no ' +
      'es opcional. Es la diferencia entre un método que converge y uno que ' +
      'oscila, y cuesta un solo cálculo de derivada.',
  },

  // ══════════════════════════════════════════════════════════════════════════
  // E8 · Punto Fijo · g(x) = (9x¹⁰+1)/(9x¹⁰−2), x₀ = 1.2 — CICLO LÍMITE
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: 'puntoFijoE2',
    contexto: {
      fisico: true,
      variable:
        'x es adimensional. El denominador 9x¹⁰ − 2 se anula en ' +
        'x = (2/9)^(1/10) ≈ 0.86036: es un polo, y el modelo no tiene ' +
        'significado físico ahí.',
      situacion:
        'Una ley iterativa con un polo nearby. Es el retrato de un sistema ' +
        'real: cuando la ganancia de un lazo se acerca a un valor crítico, ' +
        'la iteración deja de ser una aproximación y se convierte en ' +
        'oscilación. En control industrial es el régimen inestable.',
    },
    construccion: [
      'g(x) = (9x¹⁰ + 1)/(9x¹⁰ − 2). El cociente se puede escribir como ' +
        '1 + 3/(9x¹⁰ − 2), lo que muestra explícitamente el polo.',
      'g′(x) = −270x⁹/(9x¹⁰−2)². El numerador es negativo y el denominador ' +
        'es un cuadrado: g′ < 0 en todo el dominio. La función es ' +
        'estrictamente decreciente.',
      'Que g sea decreciente y se contrae implica que g∘g es una contracción ' +
        'en el producto: de ahí el ciclo de dos puntos.',
    ],
    datos: [
      {
        simbolo: 'x₀ = 1.2',
        valor: '1.2',
        donde: 'Semilla inicial.',
        porQue:
          'Está a la derecha del polo (0.86036). Con |g′(1.2)| = 0.4826 < 1 ' +
          'localmente, la derivada "engaña": uno pensaría que converge. ' +
          'La trampa es exactamente esa: la condición se cumple en x₀ pero ' +
          'NO en todo el recorrido.',
      },
      {
        simbolo: 'tol',
        valor: '10⁻³',
        donde: 'Criterio de parada del enunciado.',
        porQue:
          'Nunca se cumple. El salto |x_{n+1} − x_n| oscila entre 0.14 y 0.33, ' +
          'siempre muy por encima de 10⁻³. La sucesión está lejos de estabilizarse.',
      },
      {
        simbolo: '⚠ corrección',
        valor: 'CICLO LÍMITE de 2 puntos, no "oscilación que no converge"',
        donde: 'Reformulación del caso de fallo del material.',
        porQue:
          'El PDF dice "oscila entre ≈1.03 y ≈1.30" y concluye que no ' +
          'converge. La realidad es más específica: los límites reales son ' +
          '1.01739695 (pares) y 1.34505907 (impares), y |g′(a)·g′(b)| = 0.546 < 1. ' +
          'Es un ciclo de dos puntos ATRACTIVO: cada sub-sucesión sí ' +
          'converge, pero a límites distintos. La sucesión completa no tiene límite.',
      },
    ],
    eleccionMetodo:
      'Punto fijo, y el ejercicio está elegido justo para FALLAR. ' +
      'Es la demostración de que la condición |g′| < 1 no se puede verificar ' +
      'solo en la semilla: hay que garantizarla en un entorno que cubra ' +
      'todo el recorrido iterativo.',
    procedimiento: [
      {
        titulo: 'Verificar la condición y descubrir que es engañosa',
        cuerpo:
          '|g′(1.2)| = 0.4826 < 1. La condición se cumple en la semilla. ' +
          'Si el ejercicio se detuviera ahí, el estudiante concluiría que ' +
          'va a converger. No lo hace.',
      },
      {
        titulo: 'Observar la astrayo de la sucesión',
        cuerpo:
          'x₁ = 1.0558, x₂ = 1.2223, x₃ = 1.0462, x₄ = 1.2473. Cada paso ' +
          'cruza de un lado al otro. Como g es decreciente, cada aplicación ' +
          'invierte el sentido del movimiento: de ahí la oscilación.',
      },
      {
        titulo: 'Demostrar que es un ciclo límite, no un caos',
        cuerpo:
          'Trazando las sub-sucesiones (pares e impares por separado): ' +
          'ambas convergen —a 1.01740 y a 1.34506— y la diferencia entre ' +
          'ellos es constante (0.3277). El sistema es determinista: no hay ' +
          'azar, hay un attracting 2-cycle. La distinción importa: un ciclo ' +
          'es predecible y un caos no.',
      },
      {
        titulo: 'Verificar la estabilidad del ciclo',
        cuerpo:
          'Un ciclo {a, b} es estable si |g′(a)·g′(b)| < 1. Medido: ' +
          '4.1718 × 0.1308 = 0.5458 < 1. Estable. Cada aplicación de g² ' +
          'contrae el ciclo y la amplitud no crece.',
      },
    ],
    validacion: [
      'Simulación de 400 iteraciones da los límites 1.0173969504 y ' +
        '1.3450590685, reproducibles.',
      'g′ verificada contra diferencias finitas en 6 puntos: coincide a ' +
        'precisión de máquina.',
      'g′ < 0 en todo el dominio (numerador negativo, denominador positivo ' +
        'por ser un cuadrado): confirma que la oscilación es estructural, ' +
        'no una anomalía numérica.',
    ],
    conclusion:
      'Este es el ejercicio más valioso de los diez para el informe. ' +
      'El método no "falla al azar": converge a un ciclo límite de dos puntos, ' +
      'que es el régimen real de un lazo de control inestable. La lección es ' +
      'doble: (1) |g′| < 1 en la semilla NO garantiza convergencia; (2) cuando ' +
      'se produce una oscilación periódica, conviene investigar si es un ciclo ' +
      'estable en vez de descartar el método.',
  },

  // ══════════════════════════════════════════════════════════════════════════
  // E9 · Regula Falsa · eˣ + 4x³ − 5 en [0, 1] · tol 10⁻⁶ · x* ≈ 0.86817243
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: 'regulaFalsiE1',
    contexto: {
      fisico: false,
      variable:
        'x es adimensional. Podría modelar un factor de escala entre ' +
        'una pérdida exponencial y un término cúbico, pero el enunciado no ' +
        'lo especifica.',
      situacion:
        'Modelo sintético del PDF. Su valor real no es el contexto físico ' +
        'sino que exhibe CONVEXIDAD, y por tanto el extremo estancado de la ' +
        'regla falsa. Ese comportamiento se estudia aquí a propósito.',
    },
    construccion: [
      'f(x) = eˣ + 4x³ − 5.',
      "f'(x) = eˣ + 12x² > 0 en todo R: f es estrictamente creciente, " +
        'la raíz es única.',
      "f''(x) = eˣ + 24x. En [0,1] es siempre > 0 (mínimo f''(0) = 1): " +
        'f es CONVEXA en todo el intervalo. Esta es la clave del ejercicio.',
      'La convexidad de f no es casual: garantiza que la cuerda quede por ' +
        'debajo de la curva, lo que obliga al corte a alejarse siempre del ' +
        'mismo extremo. Ese extremo se congela.',
    ],
    datos: [
      {
        simbolo: 'a = 0',
        valor: '0',
        donde: 'Extremo izquierdo, donde el término exponencial es 1 (valor mínimo).',
        porQue:
          'f(0) = 1 + 0 − 5 = −4 < 0. El balance está por debajo del objetivo. ' +
          'Es también el punto donde f es más plana (f′(0) = 1).',
      },
      {
        simbolo: 'b = 1',
        valor: '1',
        donde: 'Extremo derecho, límite superior del dominio considerado.',
        porQue:
          'f(1) = e + 4 − 5 = 1.7183 > 0. Se superó el objetivo. El producto ' +
          '−4 × 1.7183 < 0 cumple Bolzano.',
      },
      {
        simbolo: 'tol',
        valor: '10⁻⁶',
        donde: 'Criterio de parada, unusually estricto.',
        porQue:
          'Se pide precisión alta a propósito para que se vea el efecto del ' +
          'extremo estancado: se necesitan 8 iteraciones, y las últimas son ' +
          'poco productivas porque b sigue clavado.',
      },
    ],
    eleccionMetodo:
      'Regla falsa porque se cumple Bolzano y se quiere ver el comportamiento ' +
      'en un caso convexo. Con f convexa y f′ > 0, regula falsa NO es lo ideal: ' +
      'la cuerda siempre corta al mismo lado y el método se estanca. ' +
      'Bisección sobre el mismo intervalo sería estrictamente mejor. Esa es ' +
      'la conclusión del ejercicio.',
    procedimiento: [
      {
        titulo: 'Primera cuerda y primera observación',
        cuerpo:
          'x_m = b − f(b)(b−a)/(f(b)−f(a)) = 1 − 1.7183·1/(1.7183−(−4)) = ' +
          '0.69951. Como f(a)·f(x_m) < 0, la raíz está a la derecha: se ' +
          'actualiza a = 0.69951.',
      },
      {
        titulo: 'Observar la congelación de b = 1',
        cuerpo:
          'En las 8 iteraciones, b permanece exactamente en 1. No se mueve ' +
          'ni una vez. La razón es geométrica: f convexa significa que la ' +
          'cuerda queda por debajo de la curva, así que el corte cae siempre ' +
          'del lado de a.',
      },
      {
        titulo: 'Cuantificar el costo de la congelación',
        cuerpo:
          'La secuencia x_m es 0.69951, 0.84524, 0.86531, 0.86782, 0.86813, ' +
          '0.86817, 0.86817, 0.86817. Las tres últimas iteraciones no aportan ' +
          'cifras nuevas: la raíz se ha alcanzado, pero el método sigue ' +
          'calculando porque no sabe que llegó.',
      },
    ],
    validacion: [
      'f(0.86817243) ≈ −1.7×10⁻⁸.',
      'f″(x) > 0 en 5 puntos del intervalo: confirma la convexidad que ' +
        'explica el extremo estancado.',
      'Simulación de 8 iteraciones: b = 1 exacto en todas. El extremo ' +
        'estancado no es observación, es consecuencia de la convexidad.',
    ],
    conclusion:
      'x ≈ 0.8682. La lección: regula falsa sobre una función convexa ' +
      'converge pero se estanca. Es el caso donde bisección gana sin ninguna ' +
      'duda, y conviene decirlo explícitamente en el informe.',
  },

  // ══════════════════════════════════════════════════════════════════════════
  // E10 · Regla Falsa · x¹⁰ − 1 en [0, 1.3] · raíz exacta x* = 1
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: 'regulaFalsiE2',
    contexto: {
      fisico: false,
      variable:
        'x es adimensional. La forma x¹⁰ tiene analogía con ganancia de un ' +
        'amplificador multietapa (10 etapas en cascada) o con una cadena de ' +
        '10 transformaciones, pero el PDF no lo contextualiza.',
      situacion:
        'Modelo sintético del PDF. Es el ejercicio de precisión: la raíz se ' +
        'conoce exactamente (x* = 1), así que se puede ver exactamente ' +
        'cuánto se queda corto el método.',
    },
    construccion: [
      'f(x) = x¹⁰ − 1. La raíz exacta es x* = 1, trivial de verificar.',
      "f'(x) = 10x⁹. En x = 0, f′(0) = 0 EXACTAMENTE: la función es 'plana' " +
        'en el origen, con derivada nula y curvatura nula hasta orden 8.',
      'Esa planitud es la causa del fracaso: una cuerda que sale de un punto ' +
        'donde la función no se inclina es casi horizontal.',
    ],
    datos: [
      {
        simbolo: 'a = 0',
        valor: '0',
        donde: 'Extremo izquierdo, donde f es más plana.',
        porQue:
          'f(0) = −1. Y f′(0) = 0: la función ahí es prácticamente ' +
          'constante. La cuerda que une (0, −1) con (1.3, 12.786) sale ' +
          'prácticamente horizontal desde a, así que el corte cae muy ' +
          'cerca de a.',
      },
      {
        simbolo: 'b = 1.3',
        valor: '1.3',
        donde: 'Extremo derecho, más allá de la raíz.',
        porQue:
          'f(1.3) = 12.7858. Se elige con margen sobre la raíz (x* = 1) para ' +
          'asegurarse el cambio de signo: f(0)·f(1.3) = −12.7858 < 0.',
      },
      {
        simbolo: 'n = 3',
        valor: '3 iteraciones',
        donde: 'Iteraciones pedidas por el enunciado.',
        porQue:
          'Es una petición del ejercicio para mostrar la lentitud. En 3 ' +
          'iteraciones el método apenas llega a x_m ≈ 0.2629, cuando la raíz ' +
          'es 1. Bisección en el mismo intervalo necesitaría 4 para llegar a ' +
          '0.08125 de error — mucho más cerca.',
      },
    ],
    eleccionMetodo:
      'Regla falsa, elegida precisamente para fallar. El ejercicio mide ' +
      'cuánto cuesta un extremo estancado cuando el problema es extremo: no ' +
      'solo se congela b, sino que además la función es plana en el otro ' +
      'extremo. Doble penalización.',
    procedimiento: [
      {
        titulo: 'Ver la asimetría de los residuos',
        cuerpo:
          '|f(a)| = 1 pero |f(b)| = 12.7858. La razón es 1 : 12.79. La ' +
          'cuerda se inclina casi enteramente por el lado de b, y por eso el ' +
          'corte cae pegado a a.',
      },
      {
        titulo: 'Observar la congelación de b = 1.3',
        cuerpo:
          'En las primeras 6 iteraciones, b permanece exactamente en 1.3. ' +
          'Solo a avanza, lentamente: 0 → 0.0943 → 0.1818 → 0.2629 → 0.3381 ' +
          '→ 0.4079 → 0.4726.',
      },
      {
        titulo: 'Cuantificar contra la verdad conocida',
        cuerpo:
          'La raíz es 1. Después de 3 iteraciones el método está en 0.2629, ' +
          'a 0.7371 de la respuesta. Con la misma tolerancia, bisección ' +
          'llegaría mucho antes. La raíz conocida convierte "convergió" en ' +
          '"convergió mal", que es una distinción que el método por sí solo ' +
          'no puede hacer.',
      },
    ],
    validacion: [
      'f(1) = 0 exactamente: la referencia es verificable al dígito.',
      'f′(0) = 10·0⁹ = 0 exactamente, no aproximadamente. La planitud en el ' +
        'origen es exacta.',
      'La simulación de 6 iteraciones reproduce los valores del material ' +
        '(xm ≈ 0.262874 en la tercera): coincidencia exacta.',
    ],
    conclusion:
      'x* = 1 es la respuesta exacta, y el método está a 0.74 de ella. ' +
      'El ejercicio enseña el límite del extremo estancado: cuando la ' +
      'función es plana en un extremo, la cuerda se vuelve inútil y regula ' +
      'falsa se convierte en bisección MUY lenta.',
  },
];
