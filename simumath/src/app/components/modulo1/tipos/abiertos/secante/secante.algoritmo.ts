import { secante } from '../../../../../shared/domain/numerico/methods';
import type { CriterioKey } from '../../../../../shared/domain/numerico/criterio';
import { CRITERIO_POR_DEFECTO } from '../../../../../shared/domain/numerico/criterio';

export interface FilaSecante {
  n: number;
  xPrev: number;
  x: number;
  fx: number;
  delta: number | undefined;
}

export interface ResultadoSecante {
  filas: FilaSecante[];
  convergio: boolean;
  iteraciones: number;
  raiz?: number;
  error?: number;
  mensaje?: string;
}

export interface EntradaSecante {
  f: (x: number) => number;
  x0: number;
  x1: number;
  tol: number;
  maxIter?: number;
  criterio?: CriterioKey;
}

export function ejecutarSecante(entrada: EntradaSecante): ResultadoSecante {
  const {
    f,
    x0,
    x1,
    tol,
    maxIter = 100,
    criterio = CRITERIO_POR_DEFECTO,
  } = entrada;

  if (!Number.isFinite(x0) || !Number.isFinite(x1)) {
    return {
      filas: [],
      convergio: false,
      iteraciones: 0,
      mensaje: 'Las semillas x₀ y x₁ deben ser números finitos.',
    };
  }
  if (Math.abs(x1 - x0) < 1e-12) {
    return {
      filas: [],
      convergio: false,
      iteraciones: 0,
      mensaje: 'x₀ y x₁ deben ser distintos.',
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

  const r = secante(f, x0, x1, tol, maxIter, criterio);
  const filas: FilaSecante[] = (r.rows ?? []).map((row: any) => ({
    n: Number(row.i ?? row.n),
    xPrev: Number(row['xᵢ₋₁'] ?? row.xPrev),
    x: Number(row['xᵢ'] ?? row.x),
    fx: Number(row['f(xᵢ)'] ?? row.fx),
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
