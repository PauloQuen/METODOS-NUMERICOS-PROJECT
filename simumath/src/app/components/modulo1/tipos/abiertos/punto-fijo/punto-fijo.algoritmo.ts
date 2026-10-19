import { puntoFijo } from '../../../../../shared/domain/numerico/methods';
import type { CriterioKey } from '../../../../../shared/domain/numerico/criterio';
import { CRITERIO_POR_DEFECTO } from '../../../../../shared/domain/numerico/criterio';

export interface FilaPuntoFijo {
  n: number;
  x: number;
  gx: number;
  delta: number | undefined;
}

export interface ResultadoPuntoFijo {
  filas: FilaPuntoFijo[];
  convergio: boolean;
  iteraciones: number;
  raiz?: number;
  error?: number;
  mensaje?: string;
}

export interface EntradaPuntoFijo {
  g: (x: number) => number;
  x0: number;
  tol: number;
  maxIter?: number;
  criterio?: CriterioKey;
}

/**
 * Ejecuta el Punto Fijo sobre la reescritura x = g(x).
 *
 * ── Semántica de las filas ────────────────────────────────────────────
 * Cada fila es YA el punto nuevo: x = xₙ₊₁ = g(xₙ). g(x) = g(xₙ₊₁) es la
 * siguiente evaluación (lo que vendría en la fila que sigue) y
 * |Δx| = |xₙ₊₁ − xₙ| es el movimiento que se acaba de hacer. El error
 * final es el |Δx| de la última fila.
 */
export function ejecutarPuntoFijo(entrada: EntradaPuntoFijo): ResultadoPuntoFijo {
  const {
    g,
    x0,
    tol,
    maxIter = 100,
    criterio = CRITERIO_POR_DEFECTO,
  } = entrada;

  if (!Number.isFinite(x0)) {
    return {
      filas: [],
      convergio: false,
      iteraciones: 0,
      mensaje: 'La semilla x₀ debe ser un número finito.',
    };
  }
  if (!Number.isFinite(tol) || tol <= 0) {
    return {
      filas: [],
      convergio: false,
      iteraciones: 0,
      mensaje: 'La tolerancia debe ser positiva.',
    };
  }

  const r = puntoFijo(g, x0, tol, maxIter, criterio);
  const filas: FilaPuntoFijo[] = (r.rows ?? []).map((row: any) => ({
    n: Number(row.i ?? row.n),
    x: Number(row['xᵢ'] ?? row.x),
    gx: Number(row['g(xᵢ)'] ?? row.gx),
    delta:
      row['|Δx|'] === undefined || row['|Δx|'] === null
        ? undefined
        : Number(row['|Δx|']),
  }));

  const ultima = filas[filas.length - 1];
  const errorFinal = r.parada
    ? r.parada.magnitud === 0
      ? 0
      : ultima?.delta
    : ultima?.delta;

  return {
    filas,
    convergio: r.converged,
    iteraciones: r.iterations,
    raiz: ultima?.x,
    error: errorFinal,
    mensaje: r.error,
  };
}