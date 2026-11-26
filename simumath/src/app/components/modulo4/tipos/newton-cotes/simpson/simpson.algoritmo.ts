/**
 * ALGORITMO DE LA REGLA DE SIMPSON 1/3 COMPUESTA — función pura.
 *
 * ── La idea en una frase ─────────────────────────────────────────────
 * En vez de unir dos puntos con una recta, se toman TRES puntos
 * consecutivos y se hace pasar por ellos una parábola. El área bajo esa
 * parábola, entre el primero y el tercero, resulta:
 *
 *   (h/3) · [f(x₀) + 4f(x₁) + f(x₂)]
 *
 * Al encadenar estos bloques de dos subintervalos, los extremos pesan 1,
 * los nodos impares pesan 4 y los nodos pares interiores pesan 2:
 *
 *   I ≈ (h/3) · [f(x₀) + 4f(x₁) + 2f(x₂) + 4f(x₃) + … + f(xₙ)]
 *
 * ── Por qué exige n par ──────────────────────────────────────────────
 * Cada parábola cubre DOS subintervalos. Si n es impar, el último trozo
 * queda sin pareja y la fórmula no se puede aplicar tal cual. En vez de
 * "arreglarlo" en silencio (por ejemplo, agregando un trapecio al final),
 * el algoritmo lo rechaza con un mensaje: el método es claro y el alumno
 * tiene que elegir un n que corresponda.
 *
 * ── De dónde sale la precisión ───────────────────────────────────────
 * La parábola reproduce exactamente polinomios de grado ≤ 3 (por eso
 * Simpson acierta x³, que el trapecio no). El término de error es
 * −(b − a)·h⁴·f⁗(ξ)/180: de orden h⁴. Al duplicar n, el error baja a la
 * DIECISEISAVA parte. Esa es la ventaja concreta frente al trapecio.
 *
 * ── Sin Angular y sin otros métodos ──────────────────────────────────
 * TypeScript puro, para poder probarlo con un spec simple. La función f
 * llega ya compilada: acá no se parsea texto.
 */

/* ------------------------------------------------------------------ */
/* Tipos                                                               */
/* ------------------------------------------------------------------ */

/** Una fila de la tabla de trabajo. La última es la fila de sumas. */
export interface FilaSimpson {
  /** Número del nodo, empezando en 0. "Σ" en la fila de totales. */
  i: number | string;
  /** xᵢ. */
  xi: number | string;
  /** f(xᵢ). */
  fxi: number | string;
  /** Coeficiente: 1 en los extremos, 4 en los impares, 2 en los pares interiores. */
  coef: number | string;
  /** Aporte a la suma: coeficiente · f(xᵢ). */
  aporte: number | string;
}

/** Lo que devuelve el algoritmo. */
export interface ResultadoSimpson {
  filas: FilaSimpson[];
  n: number;
  h: number;
  suma: number;
  integral: number;
  exacto?: number;
  errorAbs?: number;
  errorRel?: number;
  mensaje?: string;
}

/** Mismo tope que el trapecio, por la misma razón: tabla usable. */
export const MAX_SUBINTERVALOS = 200;

/* ------------------------------------------------------------------ */
/* El algoritmo                                                        */
/* ------------------------------------------------------------------ */

/**
 * Integra f en [a, b] con Simpson 1/3 compuesto.
 *
 * @example
 * simpsonCompuesto({ f: (x) => x * x, a: 0, b: 1, n: 4 })
 * // integral = 1/3 exacto: Simpson reproduce polinomios de grado ≤ 3
 */
export function simpsonCompuesto(datos: {
  f: (x: number) => number;
  a: number;
  b: number;
  n: number;
  valorExacto?: number;
}): ResultadoSimpson {
  const { f, a, b, n } = datos;

  // ── Validaciones ────────────────────────────────────────────────────
  if (![a, b, n].every((v) => Number.isFinite(v))) {
    return sinResultado('a, b y n tienen que ser números.');
  }
  if (!Number.isInteger(n) || n < 2) {
    return sinResultado('n tiene que ser un entero mayor o igual que 2.');
  }
  if (n % 2 !== 0) {
    return sinResultado(
      `Simpson necesita un n PAR, y escribiste ${n}. Cada parábola cubre dos subintervalos: ` +
        `probá con ${n - 1} o con ${n + 1}.`,
    );
  }
  if (n > MAX_SUBINTERVALOS) {
    return sinResultado(
      `n no puede superar ${MAX_SUBINTERVALOS}. Con tantos trozos la tabla deja de ser útil: ` +
        'probá con 8, 16 o 32 para ver cómo baja el error.',
    );
  }
  if (b <= a) {
    return sinResultado('El extremo b tiene que ser mayor que a.');
  }

  const h = (b - a) / n;

  // ── Muestreo previo ─────────────────────────────────────────────────
  const valores: number[] = [];
  for (let i = 0; i <= n; i++) {
    const x = a + i * h;
    const y = f(x);
    if (!Number.isFinite(y)) {
      return sinResultado(
        `La función no se puede evaluar en x = ${x.toFixed(6)}. ` +
          'Revisá que esté definida en todo el intervalo [a, b].',
      );
    }
    valores.push(y);
  }

  // ── Tabla de trabajo ────────────────────────────────────────────────
  const filas: FilaSimpson[] = [];
  let suma = 0;

  for (let i = 0; i <= n; i++) {
    const coef = i === 0 || i === n ? 1 : i % 2 === 1 ? 4 : 2;
    const aporte = coef * valores[i];
    suma += aporte;
    filas.push({ i, xi: a + i * h, fxi: valores[i], coef, aporte });
  }

  filas.push({ i: 'Σ', xi: '', fxi: '', coef: '', aporte: suma });

  const integral = (h / 3) * suma;

  // ── Error, si se conoce el valor exacto ─────────────────────────────
  const exacto = datos.valorExacto;
  const tieneExacto = exacto !== undefined && Number.isFinite(exacto);
  const errorAbs = tieneExacto ? Math.abs(integral - (exacto as number)) : undefined;
  const errorRel =
    tieneExacto && exacto !== 0 ? (errorAbs! / Math.abs(exacto as number)) * 100 : undefined;

  return {
    filas,
    n,
    h,
    suma,
    integral,
    exacto: tieneExacto ? exacto : undefined,
    errorAbs,
    errorRel,
  };
}

/* ------------------------------------------------------------------ */
/* Auxiliares                                                          */
/* ------------------------------------------------------------------ */

function sinResultado(mensaje: string): ResultadoSimpson {
  return { filas: [], n: 0, h: 0, suma: 0, integral: 0, mensaje };
}
