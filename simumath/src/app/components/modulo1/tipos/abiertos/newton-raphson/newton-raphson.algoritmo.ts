import { newton } from '../../../../../shared/domain/numerico/methods';
import type { CriterioKey } from '../../../../../shared/domain/numerico/criterio';
import { CRITERIO_POR_DEFECTO } from '../../../../../shared/domain/numerico/criterio';

export interface FilaNewton {
  n: number;
  x: number;
  fx: number;
  fpx: number;
  delta: number | undefined;
}

export interface ResultadoNewton {
  filas: FilaNewton[];
  convergio: boolean;
  iteraciones: number;
  raiz?: number;
  error?: number;
  mensaje?: string;
}

export interface EntradaNewton {
  f: (x: number) => number;
  x0: number;
  tol: number;
  maxIter?: number;
  criterio?: CriterioKey;
}

export function newtonRaphson(entrada: EntradaNewton): ResultadoNewton {
  const { f, x0, tol, maxIter = 100, criterio = CRITERIO_POR_DEFECTO } = entrada;

  if (!Number.isFinite(x0)) {
    return { filas: [], convergio: false, iteraciones: 0, mensaje: 'x₀ debe ser un número finito.' };
  }
  if (!Number.isFinite(tol) || tol <= 0) {
    return { filas: [], convergio: false, iteraciones: 0, mensaje: 'La tolerancia debe ser positiva.' };
  }

  const r = newton(f, x0, tol, maxIter, criterio);
  const filas: FilaNewton[] = (r.rows ?? []).map((row: any) => ({
    n: Number(row.i ?? row.n),
    x: Number(row['xᵢ'] ?? row.x),
    fx: Number(row['f(xᵢ)'] ?? row.fx),
    fpx: Number(row["f'(xᵢ)"] ?? row.fpx),
    delta: row['|Δx|'] === undefined || row['|Δx|'] === null ? undefined : Number(row['|Δx|']),
  }));

  const ultima = filas[filas.length - 1];
  const errorFinal = r.parada ? (r.parada.magnitud === 0 ? 0 : ultima?.delta) : ultima?.delta;
  return {
    filas,
    convergio: r.converged,
    iteraciones: r.iterations,
    raiz: ultima?.x,
    error: errorFinal,
    mensaje: r.error,
  };
}
