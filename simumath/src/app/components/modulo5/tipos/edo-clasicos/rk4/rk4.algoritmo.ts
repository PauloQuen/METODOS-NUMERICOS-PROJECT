/**
 * RUNGE-KUTTA DE ORDEN 4 (RK4) — función pura.
 *
 * Resuelve y' = f(t, y), y(t₀) = y₀ con
 *
 *   k₁ = f(tₙ, yₙ)
 *   k₂ = f(tₙ + h/2, yₙ + (h/2)·k₁)
 *   k₃ = f(tₙ + h/2, yₙ + (h/2)·k₂)
 *   k₄ = f(tₙ + h,   yₙ + h·k₃)
 *   y_{n+1} = yₙ + (h/6)·(k₁ + 2k₂ + 2k₃ + k₄)
 *
 * ── La idea ──────────────────────────────────────────────────────────
 * Euler mira una sola pendiente (la del inicio del paso). RK4 mira
 * cuatro: dos en el inicio, dos en el medio (con pendientes corregidas)
 * y una al final. Después combina las cuatro con pesos 1-2-2-1. Es como
 * promediar varias estimaciones de la tangente para no quedarse corto en
 * las curvas.
 *
 * ── El error ─────────────────────────────────────────────────────────
 * Error local O(h⁵) y global O(h⁴): al dividir h por 2, el error global
 * baja a la dieciseisava parte. Cuesta cuatro evaluaciones de f por paso.
 *
 * ── Estabilidad ──────────────────────────────────────────────────────
 * En y' = λy el factor de amplificación es un polinomio de grado 4. La
 * región de estabilidad llega hasta |hλ| ≈ 2.78, bastante más amplia que
 * el 2 de Euler.
 *
 * TypeScript puro (sin Angular) para poder probarlo con un spec simple.
 */

/* ------------------------------------------------------------------ */
/* Tipos                                                               */
/* ------------------------------------------------------------------ */

/** Una fila de la tabla de pasos, con las cuatro pendientes. */
export interface FilaRk4 {
  n: number | string;
  t: number | string;
  y: number | string;
  k1: number | string;
  k2: number | string;
  k3: number | string;
  k4: number | string;
  exacta?: number | string;
  error?: number | string;
}

export interface ResultadoRk4 {
  filas: FilaRk4[];
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

export interface DatosRk4 {
  f: (t: number, y: number) => number;
  t0: number;
  y0: number;
  h: number;
  tFin: number;
  exacta?: (t: number) => number;
}

export const MAX_PASOS_EDO = 100_000;

/* ------------------------------------------------------------------ */
/* El algoritmo                                                        */
/* ------------------------------------------------------------------ */

export function rungeKutta4(datos: DatosRk4): ResultadoRk4 {
  const { f, t0, y0, h, tFin } = datos;

  const base = validar({ f, t0, y0, h, tFin });
  if (base) return base;

  const pasos = Math.ceil((tFin - t0) / h - 1e-12);
  if (pasos > MAX_PASOS_EDO) {
    return {
      ...vacio(t0, y0, h, tFin),
      mensaje: `Con h = ${h} harían falta ${pasos} pasos y el máximo es ${MAX_PASOS_EDO}. Usá un h más grande.`,
    };
  }

  const filas: FilaRk4[] = [];
  let t = t0;
  let y = y0;
  const exacta = datos.exacta;

  for (let i = 0; i <= pasos; i++) {
    const ye = exacta ? exactaSegura(exacta, t) : undefined;
    const err = ye !== undefined ? Math.abs(y - ye) : undefined;
    const esUltimo = i === pasos;

    if (esUltimo) {
      filas.push({ n: i, t, y, k1: '', k2: '', k3: '', k4: '', exacta: ye, error: err });
      break;
    }

    const hPaso = Math.min(h, tFin - t);
    const k1 = f(t, y);
    const k2 = f(t + hPaso / 2, y + (hPaso / 2) * k1);
    const k3 = f(t + hPaso / 2, y + (hPaso / 2) * k2);
    const k4 = f(t + hPaso, y + hPaso * k3);

    filas.push({ n: i, t, y, k1, k2, k3, k4, exacta: ye, error: err });

    const yNuevo = y + (hPaso / 6) * (k1 + 2 * k2 + 2 * k3 + k4);
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

function validar(datos: DatosRk4): ResultadoRk4 | null {
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

function vacio(t0: number, y0: number, h: number, tFin: number): ResultadoRk4 {
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
