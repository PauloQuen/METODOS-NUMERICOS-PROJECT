import type { Punto } from '../../../modelos/modulo3.model';

/**
 * ALGORITMO DE MÍNIMOS CUADRADOS (ajuste lineal) — función pura.
 *
 * ── La idea en una frase ─────────────────────────────────────────────
 * Se buscan los coeficientes a₀ y a₁ de la recta y = a₀ + a₁x que
 * minimizan la suma de los residuos al cuadrado, S = Σ(yᵢ − a₀ − a₁xᵢ)².
 * Igualar las derivadas parciales a cero lleva a un sistema de dos
 * ecuaciones lineales (las ecuaciones normales) cuya solución es la
 * fórmula que se usa acá.
 *
 * ── A diferencia de Lagrange ─────────────────────────────────────────
 * La recta NO pasa por los puntos (salvo que estén alineados): pasa lo
 * más cerca posible. Por eso hay que medir qué tan bueno es el ajuste
 * (r, r², error estándar). Ese "qué tan bueno" es parte del resultado.
 *
 * ── Sin Angular y sin otros métodos ──────────────────────────────────
 * TypeScript puro, para poder probarlo con un spec simple y para que
 * borrar Lagrange no lo rompa. Lo único compartido es el tipo `Punto`.
 */

/* ------------------------------------------------------------------ */
/* Tipos                                                                */
/* ------------------------------------------------------------------ */

/** Una fila de la tabla de trabajo. La última es la fila de sumas. */
export interface FilaMinimosCuadrados {
  /** Número del dato, empezando en 1. "Σ" en la fila de totales. */
  i: number | string;
  /** xᵢ. */
  xi: number | string;
  /** yᵢ. */
  yi: number | string;
  /** xᵢ². */
  x2: number | string;
  /** xᵢ · yᵢ. */
  xy: number | string;
  /** El valor que predice la recta: ŷᵢ. Vacío en la fila de sumas. */
  yhat: number | string;
  /** El residuo: yᵢ − ŷᵢ. Vacío en la fila de sumas. */
  residuo: number | string;
}

/** Lo que devuelve el algoritmo. */
export interface ResultadoMinimosCuadrados {
  /** Filas de la tabla, con la fila Σ al final. */
  filas: FilaMinimosCuadrados[];
  /** Cantidad de datos. */
  n: number;
  /** Σx, Σy, Σxy, Σx². */
  sumX: number;
  sumY: number;
  sumXY: number;
  sumX2: number;
  /** Promedios de x e y. */
  mediaX: number;
  mediaY: number;
  /** Ordenada al origen (a₀) y pendiente (a₁). */
  a0: number;
  a1: number;
  /** Coeficiente de correlación lineal. */
  r: number;
  /** Coeficiente de determinación. */
  r2: number;
  /**
   * Error estándar de la estimación: √(Σrᵢ² / (n − 2)).
   * Se mide en la MISMA unidad que y, por eso es el más interpretable.
   */
  errorEstandar: number;
  /** El punto donde se predijo, si se pidió. */
  evaluadoEn?: number;
  /** La predicción ŷ(x*). */
  prediccion?: number;
  /** La recta escrita como texto: "y = 1.05 + 2.3x". */
  recta: string;
  /** Un mensaje en español si algo impidió calcular. */
  mensaje?: string;
}

/* ------------------------------------------------------------------ */
/* El algoritmo                                                         */
/* ------------------------------------------------------------------ */

/**
 * Ajusta la recta y = a₀ + a₁x por mínimos cuadrados.
 *
 * @example
 * minimosCuadrados([{x:1,y:3},{x:2,y:5},{x:3,y:7}])
 * // a1 = 2, a0 = 1  → la recta y = 1 + 2x
 */
export function minimosCuadrados(datos: {
  puntos: readonly Punto[];
  evaluarEn?: number;
}): ResultadoMinimosCuadrados {
  const puntos = datos.puntos;

  // ── Validaciones ────────────────────────────────────────────────────
  if (!puntos || puntos.length < 2) {
    return sinResultado('Se necesitan al menos 2 puntos para ajustar una recta.');
  }
  if (puntos.some((p) => !Number.isFinite(p.x) || !Number.isFinite(p.y))) {
    return sinResultado('Todos los puntos deben tener x e y numéricos.');
  }

  const n = puntos.length;
  const sumX = sumar(puntos, (p) => p.x);
  const sumY = sumar(puntos, (p) => p.y);
  const sumXY = sumar(puntos, (p) => p.x * p.y);
  const sumX2 = sumar(puntos, (p) => p.x * p.x);
  const sumY2 = sumar(puntos, (p) => p.y * p.y);

  // El denominador es n·Σx² − (Σx)². Vale la dispersión de las x: si
  // todas las x son iguales, vale 0 y la pendiente no existe.
  const denominador = n * sumX2 - sumX * sumX;
  if (Math.abs(denominador) < 1e-12) {
    return sinResultado(
      'Todas las x son iguales: con esos datos no se puede ajustar una recta ' +
        '(no hay forma de saber cómo cambia y).',
    );
  }

  const a1 = (n * sumXY - sumX * sumY) / denominador;
  const a0 = (sumY - a1 * sumX) / n;

  const mediaX = sumX / n;
  const mediaY = sumY / n;

  // ── Bondad del ajuste ───────────────────────────────────────────────
  const r = correlacion(n, sumX, sumY, sumXY, sumX2, sumY2);
  const r2 = r * r;

  const sumaResiduos = puntos.reduce((s, p) => {
    const yhat = a0 + a1 * p.x;
    return s + (p.y - yhat) * (p.y - yhat);
  }, 0);
  const errorEstandar = n > 2 ? Math.sqrt(sumaResiduos / (n - 2)) : 0;

  // ── Filas de la tabla de trabajo ────────────────────────────────────
  const filas: FilaMinimosCuadrados[] = puntos.map((p, indice) => {
    const yhat = a0 + a1 * p.x;
    return {
      i: indice + 1,
      xi: p.x,
      yi: p.y,
      x2: p.x * p.x,
      xy: p.x * p.y,
      yhat,
      residuo: p.y - yhat,
    };
  });

  filas.push({
    i: 'Σ',
    xi: sumX,
    yi: sumY,
    x2: sumX2,
    xy: sumXY,
    yhat: '',
    residuo: '',
  });

  // ── Predicción, si se pidió ─────────────────────────────────────────
  const evaluadoEn = datos.evaluarEn;
  const tienePunto = evaluadoEn !== undefined && Number.isFinite(evaluadoEn);

  return {
    filas,
    n,
    sumX,
    sumY,
    sumXY,
    sumX2,
    mediaX,
    mediaY,
    a0,
    a1,
    r,
    r2,
    errorEstandar,
    evaluadoEn: tienePunto ? evaluadoEn : undefined,
    prediccion: tienePunto ? a0 + a1 * (evaluadoEn as number) : undefined,
    recta: formatearRecta(a0, a1),
  };
}

/* ------------------------------------------------------------------ */
/* Auxiliares                                                           */
/* ------------------------------------------------------------------ */

function sumar(puntos: readonly Punto[], valor: (p: Punto) => number): number {
  return puntos.reduce((s, p) => s + valor(p), 0);
}

/** Coeficiente de correlación lineal de Pearson. */
function correlacion(
  n: number,
  sumX: number,
  sumY: number,
  sumXY: number,
  sumX2: number,
  sumY2: number,
): number {
  const numerador = n * sumXY - sumX * sumY;
  const raizX = n * sumX2 - sumX * sumX;
  const raizY = n * sumY2 - sumY * sumY;
  if (raizX <= 0 || raizY <= 0) return 0;
  return numerador / Math.sqrt(raizX * raizY);
}

/** Escribe la recta de forma legible: "y = 1.05 + 2.3·x". */
function formatearRecta(a0: number, a1: number): string {
  const signo = a1 < 0 ? '−' : '+';
  return `y = ${formatearNumero(a0)} ${signo} ${formatearNumero(Math.abs(a1))}·x`;
}

function sinResultado(mensaje: string): ResultadoMinimosCuadrados {
  return {
    filas: [],
    n: 0,
    sumX: 0,
    sumY: 0,
    sumXY: 0,
    sumX2: 0,
    mediaX: 0,
    mediaY: 0,
    a0: 0,
    a1: 0,
    r: 0,
    r2: 0,
    errorEstandar: 0,
    recta: '',
    mensaje,
  };
}

/** Número corto y legible, con hasta 6 decimales y sin ceros de cola. */
function formatearNumero(v: number): string {
  if (Number.isInteger(v)) return String(v);
  return v.toFixed(6).replace(/\.?0+$/, '');
}
