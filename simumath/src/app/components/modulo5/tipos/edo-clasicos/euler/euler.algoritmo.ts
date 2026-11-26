/**
 * MÉTODO DE EULER EXPLÍCITO — función pura.
 *
 * Resuelve el problema de valor inicial
 *
 *   y' = f(t, y),   y(t₀) = y₀
 *
 * avanzando con paso h:
 *
 *   y_{n+1} = y_n + h · f(t_n, y_n)
 *
 * ── La idea geométrica ───────────────────────────────────────────────
 * En el punto (t_n, y_n) se conoce la pendiente de la solución: es f(t_n, y_n).
 * Euler sigue la RECTA tangente durante un trecho h y usa el punto de
 * llegada como nueva aproximación. Es el método de un paso más simple
 * que existe.
 *
 * ── El error ─────────────────────────────────────────────────────────
 * El error local (un paso) es O(h²); el global (todo el intervalo) es
 * O(h). Al dividir h por 2, el error global baja a la mitad.
 *
 * ── Estabilidad ──────────────────────────────────────────────────────
 * En la ecuación de prueba y' = λy, Euler equivale a multiplicar por
 * (1 + hλ) en cada paso. La solución numérica no explota si |1 + hλ| ≤ 1,
 * es decir si h ≤ 2/|λ|. Con h mayor, el método oscila y diverge aunque
 * la solución exacta tienda a cero.
 *
 * TypeScript puro (sin Angular) para poder probarlo con un spec simple.
 */

/* ------------------------------------------------------------------ */
/* Tipos                                                               */
/* ------------------------------------------------------------------ */

/** Una fila de la tabla de pasos. La columna k1 es f(tₙ, yₙ). */
export interface FilaEuler {
  n: number | string;
  t: number | string;
  y: number | string;
  k1: number | string;
  exacta?: number | string;
  error?: number | string;
}

/** Lo que devuelve el algoritmo. */
export interface ResultadoEuler {
  filas: FilaEuler[];
  t0: number;
  y0: number;
  h: number;
  tFin: number;
  pasos: number;
  yFinal: number;
  exactaFinal?: number;
  errorFinal?: number;
  errorRel?: number;
  mensaje?: string;
}

/** Datos de entrada del PVI. */
export interface DatosEuler {
  /** f(t, y). Ya compilada: acá no se parsea texto. */
  f: (t: number, y: number) => number;
  t0: number;
  y0: number;
  h: number;
  tFin: number;
  /** Solución exacta opcional, para medir el error. */
  exacta?: (t: number) => number;
}

/**
 * Tope de pasos.
 *
 * 100 000 es el límite duro para no congelar el navegador. Para la tabla
 * visible se muestran como máximo las primeras 1 000 filas (ver el
 * servicio): el cálculo completo sí se hace, pero el DOM no se llena de
 * miles de <tr>.
 */
export const MAX_PASOS_EDO = 100_000;

/* ------------------------------------------------------------------ */
/* El algoritmo                                                        */
/* ------------------------------------------------------------------ */

export function eulerExplicito(datos: DatosEuler): ResultadoEuler {
  const { f, t0, y0, h, tFin } = datos;

  const base = validar({ f, t0, y0, h, tFin });
  if (base) return base;

  // Cantidad de pasos. Si h no divide exacto a [t0, tFin], el último paso
  // se acorta para llegar justo a tFin (decisión documentada en el informe).
  const pasos = Math.ceil((tFin - t0) / h - 1e-12);
  if (pasos > MAX_PASOS_EDO) {
    return {
      ...vacio(t0, y0, h, tFin),
      mensaje: `Con h = ${h} harían falta ${pasos} pasos y el máximo es ${MAX_PASOS_EDO}. Usá un h más grande.`,
    };
  }

  const filas: FilaEuler[] = [];
  let t = t0;
  let y = y0;

  const exacta = datos.exacta;

  for (let i = 0; i <= pasos; i++) {
    const ye = exacta ? exactaSegura(exacta, t) : undefined;
    const err = ye !== undefined ? Math.abs(y - ye) : undefined;
    const esUltimo = i === pasos;

    filas.push({
      n: i,
      t,
      y,
      k1: esUltimo ? '' : f(t, y),
      exacta: ye,
      error: err,
    });

    if (esUltimo) break;

    const hPaso = Math.min(h, tFin - t);
    const k1 = f(t, y);
    const yNuevo = y + hPaso * k1;

    if (!Number.isFinite(yNuevo)) {
      return {
        ...vacio(t0, y0, h, tFin),
        mensaje: `La solución se volvió infinita en t = ${t.toFixed(6)}. La solución diverge: probá con un h menor.`,
      };
    }

    t = t + hPaso;
    y = yNuevo;
  }

  const exactaFinal = exacta ? exactaSegura(exacta, tFin) : undefined;
  const errorFinal = exactaFinal !== undefined ? Math.abs(y - exactaFinal) : undefined;

  return {
    filas,
    t0,
    y0,
    h,
    tFin,
    pasos,
    yFinal: y,
    exactaFinal,
    errorFinal,
    errorRel:
      errorFinal !== undefined && exactaFinal !== undefined && exactaFinal !== 0
        ? (errorFinal / Math.abs(exactaFinal)) * 100
        : undefined,
  };
}

/* ------------------------------------------------------------------ */
/* Auxiliares                                                          */
/* ------------------------------------------------------------------ */

function validar(datos: DatosEuler): ResultadoEuler | null {
  const { t0, y0, h, tFin } = datos;
  if (![t0, y0, h, tFin].every((v) => Number.isFinite(v))) {
    return { ...vacio(t0, y0, h, tFin), mensaje: 't₀, y₀, h y t final tienen que ser números.' };
  }
  if (h <= 0) {
    return { ...vacio(t0, y0, h, tFin), mensaje: 'El paso h tiene que ser mayor que 0.' };
  }
  if (tFin <= t0) {
    return { ...vacio(t0, y0, h, tFin), mensaje: 'El tiempo final tiene que ser mayor que t₀.' };
  }
  return null;
}

function vacio(t0: number, y0: number, h: number, tFin: number): ResultadoEuler {
  return { filas: [], t0, y0, h, tFin, pasos: 0, yFinal: 0 };
}

function exactaSegura(exacta: (t: number) => number, t: number): number | undefined {
  try {
    const v = exacta(t);
    return Number.isFinite(v) ? v : undefined;
  } catch {
    return undefined;
  }
}
