/**
 * ALGORITMO DE LA REGLA DEL TRAPECIO COMPUESTA — función pura.
 *
 * ── La idea en una frase ─────────────────────────────────────────────
 * Se parte [a, b] en n trozos iguales de ancho h y, en cada trozo, se
 * reemplaza la curva por la RECTA que une los extremos. El área de cada
 * trozo es entonces la de un trapecio: (h/2)·(f izquierda + f derecha).
 * Al sumar todos los trapecios, los nodos interiores aparecen dos veces
 * (son el borde derecho de un trozo y el izquierdo del siguiente) y los
 * extremos una sola vez. Eso da la fórmula:
 *
 *   I ≈ (h/2) · [f(x₀) + 2f(x₁) + 2f(x₂) + … + 2f(xₙ₋₁) + f(xₙ)]
 *
 * ── De dónde sale el error ───────────────────────────────────────────
 * El error de un trapecio es −(h³/12)·f''(ξ). Al sumar n trozos, se
 * acumula como −(b − a)·h²·f''(ξ)/12: es decir, de orden h². Si se
 * duplica n (h se parte a la mitad), el error se reduce a la CUARTA
 * parte. Es la propiedad que el alumno puede verificar en la calculadora.
 *
 * ── Sin Angular y sin otros métodos ──────────────────────────────────
 * TypeScript puro, para poder probarlo con un spec simple. La función
 * f llega ya compilada: acá no se parsea texto.
 */

/* ------------------------------------------------------------------ */
/* Tipos                                                               */
/* ------------------------------------------------------------------ */

/** Una fila de la tabla de trabajo. La última es la fila de sumas. */
export interface FilaTrapecio {
  /** Número del nodo, empezando en 0. "Σ" en la fila de totales. */
  i: number | string;
  /** xᵢ. */
  xi: number | string;
  /** f(xᵢ). */
  fxi: number | string;
  /** Coeficiente del nodo: 1 en los extremos, 2 en los interiores. */
  coef: number | string;
  /** Aporte a la suma: coeficiente · f(xᵢ). */
  aporte: number | string;
}

/** Lo que devuelve el algoritmo. */
export interface ResultadoTrapecio {
  /** Filas de la tabla, con la fila Σ al final. */
  filas: FilaTrapecio[];
  /** Cantidad de subintervalos. */
  n: number;
  /** Ancho de cada subintervalo. */
  h: number;
  /** Suma ponderada Σ coeficiente · f(xᵢ). */
  suma: number;
  /** La integral aproximada. */
  integral: number;
  /** Valor exacto, si se pasó. */
  exacto?: number;
  /** Error absoluto |I − exacto|. */
  errorAbs?: number;
  /** Error relativo porcentual. */
  errorRel?: number;
  /** Un mensaje en español si algo impidió calcular. */
  mensaje?: string;
}

/**
 * Tope de subintervalos.
 *
 * Con n = 200 la tabla tiene 201 filas y el gráfico 200 trapecios: más
 * que suficiente para mostrar cómo baja el error, y todavía usable en
 * pantalla y en el celular. Un n enorme no enseña nada nuevo y bloquea
 * el navegador.
 */
export const MAX_SUBINTERVALOS = 200;

/* ------------------------------------------------------------------ */
/* El algoritmo                                                        */
/* ------------------------------------------------------------------ */

/**
 * Integra f en [a, b] con la regla del trapecio compuesta.
 *
 * @example
 * trapecioCompuesto({ f: (x) => x * x, a: 0, b: 1, n: 4 })
 * // integral = 0.34375 (el exacto es 1/3)
 */
export function trapecioCompuesto(datos: {
  f: (x: number) => number;
  a: number;
  b: number;
  n: number;
  valorExacto?: number;
}): ResultadoTrapecio {
  const { f, a, b, n } = datos;

  // ── Validaciones ────────────────────────────────────────────────────
  if (![a, b, n].every((v) => Number.isFinite(v))) {
    return sinResultado('a, b y n tienen que ser números.');
  }
  if (!Number.isInteger(n) || n < 1) {
    return sinResultado('n tiene que ser un entero mayor o igual que 1.');
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
  // Antes de armar la tabla se evalúa f en todos los nodos. Si en alguno
  // no existe (ln de negativo, división por cero), se avisa con el x
  // exacto en vez de devolver una tabla llena de NaN.
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
  const filas: FilaTrapecio[] = [];
  let suma = 0;

  for (let i = 0; i <= n; i++) {
    const coef = i === 0 || i === n ? 1 : 2;
    const aporte = coef * valores[i];
    suma += aporte;
    filas.push({ i, xi: a + i * h, fxi: valores[i], coef, aporte });
  }

  filas.push({
    i: 'Σ',
    xi: '',
    fxi: '',
    coef: '',
    aporte: suma,
  });

  const integral = (h / 2) * suma;

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

function sinResultado(mensaje: string): ResultadoTrapecio {
  return { filas: [], n: 0, h: 0, suma: 0, integral: 0, mensaje };
}
