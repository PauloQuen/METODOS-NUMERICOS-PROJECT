/**
 * FÓRMULA DE CARDANO — resolución cerrada de a·x³ + b·x² + c·x + d = 0.
 *
 * ── Por qué este archivo es distinto al resto del motor ──────────────
 * Los otros cinco métodos ITERAN: arrancan de un intervalo o de una
 * semilla y se acercan paso a paso. Cardano no itera: reduce la cúbica
 * a su forma deprimida con el cambio x = t − b/(3a) y aplica la fórmula
 * de radicales — o la forma trigonométrica de Viète, cuando el
 * discriminante es negativo. Devuelve las raíces reales en un solo
 * paso: no hay tolerancia, no hay criterio de parada, no hay iteraciones.
 *
 * ── De dónde salen los coeficientes ─────────────────────────────────
 * El motor uniforme le pasa a cada método una función f evaluable, no
 * el texto ni el árbol de la expresión. Los coeficientes se recuperan
 * evaluando f en puntos fijos — f(0), f(±1), f(±2) — y resolviendo el
 * sistema 4×4 que eso plantea. Para un polinomio de grado ≤ 3 eso es
 * exacto (es la interpolación por diferencias finitas). Después se
 * VERIFICA en dos puntos extra, f(3) y f(−3): si la cúbica ajustada no
 * reproduce esos valores, la función no era un polinomio de grado ≤ 3
 * (era x⁴, eˣ, lo que sea) y se devuelve un error claro en vez de una
 * "raíz" inventada.
 *
 * ── Los tres casos del discriminante ────────────────────────────────
 * Con la cúbica deprimida t³ + p·t + q = 0, el discriminante es
 * Δ = (q/2)² + (p/3)³ y manda todo:
 *   · Δ > 0  → UNA raíz real (las otras dos son complejas conjugadas,
 *               que este método no devuelve: el módulo trabaja sobre
 *               los reales).
 *   · Δ = 0  → raíces reales con multiplicidad: una doble y una simple,
 *               o una triple cuando p = q = 0.
 *   · Δ < 0  → TRES raíces reales y distintas. Es el "caso irreducible":
 *               la fórmula de radicales se pisaría a sí misma con
 *               raíces cúbicas de números complejos, y la salida real
 *               se recupera con la forma trigonométrica de Viète.
 */

/* ------------------------------------------------------------------ */
/* Tipos                                                               */
/* ------------------------------------------------------------------ */

export interface CoeficientesCubica {
  a: number;
  b: number;
  c: number;
  d: number;
}

/** El caso del discriminante que le tocó a esta cúbica. */
export type CasoCardano = 'una-real' | 'raices-multiples' | 'tres-reales';

/** Un paso del desarrollo algebraico, fila de la tabla de la interfaz. */
export interface PasoCardano {
  paso: number;
  etapa: string;
  detalle: string;
  /**
   * Valor numérico de la fila, si lo hay. Solo lo llevan las raíces:
   * es la columna que el gráfico usa para marcar dónde están.
   */
  valor: number | null;
}

/**
 * Una raíz real y cuántas veces se repite.
 *
 * Solo el caso Δ = 0 repite una raíz (doble o triple). Internamente se
 * guardan juntas para no perder la información al ordenar; hacia
 * afuera se separan en dos listas alineadas: `raicesReales` y
 * `multiplicidades`.
 */
interface RaizConMultiplicidad {
  valor: number;
  multiplicidad: number;
}

export interface ResultadoCardano {
  /** Los coeficientes recuperados, o null si la función no era cúbica. */
  coeficientes: CoeficientesCubica | null;
  /** El desplazamiento del cambio de variable: x = t + desplazamiento. */
  desplazamiento: number;
  /** Coeficientes de la cúbica deprimida t³ + p·t + q. */
  p: number;
  q: number;
  /** Δ = (q/2)² + (p/3)³. */
  delta: number;
  caso: CasoCardano | null;
  /** Las raíces reales, de menor a mayor. */
  raicesReales: number[];
  /**
   * La multiplicidad de cada raíz, en el MISMO orden que `raicesReales`:
   * 1 = raíz simple, 2 = raíz doble, 3 = raíz triple.
   *
   * Solo el caso Δ = 0 produce multiplicidades mayores que 1. Se guardan
   * aparte (y no repitiendo la raíz en `raicesReales`) porque la tabla
   * y el gráfico quieren UNA fila y UNA marca por raíz: repetir el
   * número dibujaría dos puntos superpuestos en el mismo lugar.
   */
  multiplicidades: number[];
  /** El desarrollo paso a paso, tal como lo muestra la tabla. */
  pasos: PasoCardano[];
  /** Presente si el método no pudo resolver (función no cúbica). */
  error?: string;
}

/* ------------------------------------------------------------------ */
/* Formateo                                                            */
/* ------------------------------------------------------------------ */

/**
 * Idéntico a `methods.ts#fmt`, copiado para no crear un ciclo de
 * imports: methods.ts importa este archivo (el wrapper público) y este
 * archivo no puede importar methods.ts de vuelta.
 */
function fmt(v: number): string {
  if (!Number.isFinite(v)) return '—';
  if (Number.isInteger(v)) return String(v);
  return v.toFixed(8).replace(/\.?0+$/, '');
}

/**
 * Escribe el cambio de variable x = t + m con el signo correcto.
 *
 * `fmt(-2)` imprime "-2", así que `t + ${fmt(-2)}` leería "t + -2":
 * feo y fácil de malinterpretar. Con m = 0 el desplazamiento no existe
 * y se muestra "t" solo.
 */
function cambioDeVariable(m: number): string {
  if (m === 0) return 't';
  return m > 0 ? `t + ${fmt(m)}` : `t − ${fmt(-m)}`;
}

/**
 * Como se anuncia una raíz que se repite.
 *
 * "x = 2" no dice si es una raíz cualquiera o la raíz doble del
 * polinomio. "x = 2 (raíz doble)" sí. El detalle de la fila de la
 * tabla es donde el alumno lee esa diferencia.
 */
function etiquetaMultiplicidad(multiplicidad: number): string {
  if (multiplicidad === 2) return ' (raíz doble)';
  if (multiplicidad === 3) return ' (raíz triple)';
  return '';
}

/* ------------------------------------------------------------------ */
/* Recuperación de coeficientes                                         */
/* ------------------------------------------------------------------ */

/**
 * Recupera (a, b, c, d) de a·x³ + b·x² + c·x + d evaluando f en puntos
 * fijos. Devuelve un error legible si f no es un polinomio de grado ≤ 3.
 */
function coeficientesPorEvaluacion(
  f: (x: number) => number,
): { coeficientes: CoeficientesCubica } | { error: string } {
  // Evaluar en 7 puntos: 5 para el sistema y 2 para la verificación.
  const puntos = [-3, -2, -1, 0, 1, 2, 3];
  const valores = new Map<number, number>();
  for (const x of puntos) {
    const y = f(x);
    if (!Number.isFinite(y)) {
      return {
        error:
          `La función no es evaluable en x = ${x}, así que no se pueden ` +
          'leer sus coeficientes. Cardano necesita un polinomio definido en todos los reales.',
      };
    }
    valores.set(x, y);
  }

  const y0 = valores.get(0)!;
  const y1 = valores.get(1)!;
  const ym1 = valores.get(-1)!;
  const y2 = valores.get(2)!;
  const ym2 = valores.get(-2)!;

  // Sistema 4×4 (interpolación por diferencias finitas, exacta para
  // polinomios de grado ≤ 3):
  //   f(0)  = d
  //   f(1) + f(−1) = 2b + 2d
  //   f(1) − f(−1) = 2a + 2c
  //   f(2) − f(−2) = 16a + 4c
  const d = y0;
  const b = (y1 + ym1) / 2 - d;
  const a = ((y2 - ym2) / 4 - (y1 - ym1) / 2) / 3;
  const c = (y1 - ym1) / 2 - a;

  // Verificación en dos puntos que NO entraron al sistema: si la cúbica
  // ajustada no pasa por (3, f(3)) y (−3, f(−3)), esto no era una
  // cúbica. La tolerancia es relativa al tamaño de los valores: una
  // cúbica con coeficientes grandes tiene residuos grandes de entrada.
  for (const x of [3, -3]) {
    const esperado = a * x ** 3 + b * x ** 2 + c * x + d;
    const observado = valores.get(x)!;
    const tolerancia = 1e-6 * Math.max(1, Math.abs(esperado));
    if (Math.abs(esperado - observado) > tolerancia) {
      return {
        error:
          'La función no es un polinomio de grado ≤ 3: no pasa por los ' +
          'puntos que una cúbica tendría que pasar. Cardano solo resuelve ' +
          'ecuaciones cúbicas de la forma a·x³ + b·x² + c·x + d = 0.',
      };
    }
  }

  // Grado menor: el término cúbico es despreciable frente al resto.
  const escala = Math.max(Math.abs(b), Math.abs(c), Math.abs(d), 1);
  if (Math.abs(a) <= 1e-12 * escala) {
    return {
      error:
        'El polinomio no es de grado 3 (el coeficiente a·x³ es nulo). ' +
        'Cardano resuelve cúbicas: para grado 2 usá la fórmula general de segundo grado.',
    };
  }

  return { coeficientes: { a, b, c, d } };
}

/* ------------------------------------------------------------------ */
/* El algoritmo                                                         */
/* ------------------------------------------------------------------ */

/**
 * Resuelve la cúbica que representa f, sin iterar.
 *
 * @param f Función evaluable. Se leen sus coeficientes cúbicos por
 *          evaluación (ver arriba); si no es una cúbica, el resultado
 *          trae `error` en vez de raíces.
 */
export function resolverCardano(f: (x: number) => number): ResultadoCardano {
  const vacio: Omit<ResultadoCardano, 'coeficientes'> = {
    desplazamiento: Number.NaN,
    p: Number.NaN,
    q: Number.NaN,
    delta: Number.NaN,
    caso: null,
    raicesReales: [],
    multiplicidades: [],
    pasos: [],
  };

  const leidos = coeficientesPorEvaluacion(f);
  if ('error' in leidos) {
    return { ...vacio, coeficientes: null, error: leidos.error };
  }
  const { a, b, c, d } = leidos.coeficientes;

  // Cambio de variable x = t − b/(3a) = t + m: elimina el término
  // cuadrado y deja la cúbica deprimida t³ + p·t + q = 0.
  const m = -b / (3 * a);
  const p = (3 * a * c - b * b) / (3 * a * a);
  const q = (2 * b ** 3 - 9 * a * b * c + 27 * a * a * d) / (27 * a ** 3);
  const delta = (q / 2) ** 2 + (p / 3) ** 3;

  const pasos: PasoCardano[] = [
    {
      paso: 1,
      etapa: 'Coeficientes',
      detalle: `a = ${fmt(a)}, b = ${fmt(b)}, c = ${fmt(c)}, d = ${fmt(d)}`,
      valor: null,
    },
    {
      paso: 2,
      etapa: 'Desplazamiento',
      detalle: `x = t − b/(3a) = ${cambioDeVariable(m)}`,
      valor: null,
    },
    {
      paso: 3,
      etapa: 'Cúbica deprimida',
      detalle: `t³ + p·t + q con p = ${fmt(p)}, q = ${fmt(q)}`,
      valor: null,
    },
    {
      paso: 4,
      etapa: 'Discriminante',
      detalle: `Δ = (q/2)² + (p/3)³ = ${fmt(delta)}`,
      valor: null,
    },
  ];

  // Escala con la que se decide si Δ es "cero" de verdad. Un umbral
  // absoluto fallaría con coeficientes grandes (Δ tendría su propio
  // ruido de redondeo) y con coeficientes chicos (Δ real sería menor
  // que el umbral); por eso es relativo a los dos sumandos de Δ.
  const escalaDelta = (q / 2) ** 2 + Math.abs(p / 3) ** 3;
  const esCero = Math.abs(delta) <= 1e-12 * Math.max(escalaDelta, 1);

  const raices: RaizConMultiplicidad[] = [];
  let caso: CasoCardano;
  let textoCaso: string;

  if (!esCero && delta > 0) {
    // Δ > 0: una raíz real. Las dos restantes son complejas conjugadas,
    // que este módulo no maneja. Math.cbrt sí acepta negativos, así que
    // la segunda raíz cúbica no necesita números complejos.
    caso = 'una-real';
    textoCaso = 'Δ > 0: una sola raíz real (las otras dos son complejas conjugadas).';
    const raiz = Math.cbrt(-q / 2 + Math.sqrt(delta)) + Math.cbrt(-q / 2 - Math.sqrt(delta));
    raices.push({ valor: raiz + m, multiplicidad: 1 });
  } else if (!esCero && delta < 0) {
    // Δ < 0: caso irreducible. La fórmula de radicales exigiría ∛ de
    // números complejos, pero las TRES raíces son reales: se recuperan
    // con la forma trigonométrica de Viète.
    caso = 'tres-reales';
    textoCaso = 'Δ < 0: tres raíces reales y distintas (caso irreducible; forma de Viète).';
    const radio = 2 * Math.sqrt(-p / 3);
    // El argumento del arco coseno es (3q/2p)·√(−3/p). Matemáticamente
    // está en [−1, 1] cuando Δ < 0; el recorte protege del ruido de
    // punto flotante en los casos casi-límite.
    const argumento = Math.max(-1, Math.min(1, ((3 * q) / (2 * p)) * Math.sqrt(-3 / p)));
    const phi = Math.acos(argumento) / 3;
    for (let k = 0; k < 3; k++) {
      raices.push({
        valor: radio * Math.cos(phi - (2 * Math.PI * k) / 3) + m,
        multiplicidad: 1,
      });
    }
  } else {
    // Δ = 0: raíces con multiplicidad.
    caso = 'raices-multiples';
    if (Math.abs(p) <= 1e-12 && Math.abs(q) <= 1e-12) {
      // p = q = 0: la deprimida es t³ = 0 → raíz triple t = 0.
      textoCaso = 'Δ = 0 con p = q = 0: raíz triple en x = −b/(3a).';
      raices.push({ valor: m, multiplicidad: 3 });
    } else {
      // (t − r)²·(t − s) desplegado da p = −3r² y q = 2r³, de donde
      // r (la doble) = −3q/(2p) y s (la simple) = 3q/p.
      const doble = (-3 * q) / (2 * p);
      const simple = (3 * q) / p;
      textoCaso = 'Δ = 0: una raíz doble y una simple.';
      raices.push({ valor: doble + m, multiplicidad: 2 });
      raices.push({ valor: simple + m, multiplicidad: 1 });
    }
  }

  raices.sort((x, y) => x.valor - y.valor);

  pasos.push({
    paso: 5,
    etapa: 'Caso',
    detalle: textoCaso,
    valor: null,
  });
  raices.forEach((raiz, i) => {
    pasos.push({
      paso: 6 + i,
      etapa: 'Raíz real',
      detalle:
        `x = ${cambioDeVariable(m)} = ${fmt(raiz.valor)}` +
        etiquetaMultiplicidad(raiz.multiplicidad),
      valor: raiz.valor,
    });
  });

  return {
    coeficientes: { a, b, c, d },
    desplazamiento: m,
    p,
    q,
    delta,
    caso,
    raicesReales: raices.map((r) => r.valor),
    multiplicidades: raices.map((r) => r.multiplicidad),
    pasos,
  };
}
