import type { SistemaLineal } from '../../../modelos/modulo2.model';
import {
  esCuadrada,
  esDiagonalmenteDominante,
  sistemaValido,
} from '../../../shared/sistema';

/**
 * GAUSS-SEIDEL PARA MATRICES ESPECIALES — función pura, sin Angular.
 *
 * ── La idea en una frase ─────────────────────────────────────────────
 * Se parte de una aproximación inicial y se actualiza una incógnita por
 * vez. A diferencia de Jacobi, cada valor nuevo se usa inmediatamente
 * en las incógnitas siguientes. Para matrices diagonalmente dominantes
 * (o simétricas definidas positivas) la sucesión converge a la solución.
 *
 * ── Por qué "matrices especiales" ───────────────────────────────────
 * El método no está pensado para cualquier matriz: brilla en matrices
 * grandes, dispersas, tridiagonales o diagonalmente dominantes, donde
 * factorizar sería caro. En una matriz sin estructura puede no converger.
 */

/* ------------------------------------------------------------------ */
/* Tipos                                                               */
/* ------------------------------------------------------------------ */

export interface IteracionGaussSeidel {
  /** Número de iteración, empezando en 1. */
  k: number;
  /** Valores de las incógnitas después de la iteración. */
  x: number[];
  /** Cambio máximo respecto de la iteración anterior. */
  error: number;
}

export interface ResultadoGaussSeidel {
  /** Filas listas para la tabla: k, x₁...xₙ y error. */
  filas: Record<string, number>[];
  /** Detalle numérico de cada iteración (para pruebas y gráficos). */
  iteracionesDetalle: IteracionGaussSeidel[];
  /** Número de iteraciones realizadas. */
  iteraciones: number;
  /** Última aproximación. */
  x?: number[];
  /** Error final (norma infinito de la diferencia). */
  error?: number;
  /** ¿Se alcanzó la tolerancia? */
  convergio: boolean;
  /** ¿La matriz cumple la condición suficiente de convergencia? */
  diagonalDominante: boolean;
  /** Mensaje si no se pudo ejecutar o no convergió. */
  mensaje?: string;
}

export interface EntradaGaussSeidel {
  A: readonly (readonly number[])[];
  b: readonly number[];
  tol?: number;
  maxIter?: number;
  x0?: readonly number[];
}

/* ------------------------------------------------------------------ */
/* Algoritmo                                                           */
/* ------------------------------------------------------------------ */

export function gaussSeidel(entrada: EntradaGaussSeidel): ResultadoGaussSeidel {
  const { A, b } = entrada;
  const tol = entrada.tol ?? 1e-6;
  const maxIter = Math.max(1, Math.floor(entrada.maxIter ?? 100));

  if (!esCuadrada(A)) {
    return fallo('La matriz A debe ser cuadrada.');
  }
  if (!sistemaValido(A, b)) {
    return fallo('Revisá A y b: deben ser numéricos, cuadrados y del mismo tamaño.');
  }
  if (tol <= 0) {
    return fallo('La tolerancia debe ser mayor que cero.');
  }

  const n = A.length;
  const diagonalDominante = esDiagonalmenteDominante(A);

  for (let i = 0; i < n; i++) {
    if (Math.abs(A[i][i]) < 1e-14) {
      return fallo(
        `El elemento diagonal a${i + 1}${i + 1} es cero. ` +
          'Gauss-Seidel necesita diagonales no nulas; reordená las ecuaciones.',
      );
    }
  }

  const x = new Array<number>(n).fill(0);
  if (entrada.x0) {
    if (entrada.x0.length !== n || entrada.x0.some((v) => !Number.isFinite(v))) {
      return fallo('La aproximación inicial debe tener un valor finito por incógnita.');
    }
    for (let i = 0; i < n; i++) x[i] = entrada.x0[i];
  }

  const filas: Record<string, number>[] = [];
  const iteracionesDetalle: IteracionGaussSeidel[] = [];
  let error = Infinity;

  for (let k = 1; k <= maxIter; k++) {
    const anterior = [...x];

    for (let i = 0; i < n; i++) {
      let suma = 0;
      for (let j = 0; j < n; j++) {
        if (j === i) continue;
        suma += A[i][j] * x[j];
      }
      x[i] = (b[i] - suma) / A[i][i];
    }

    error = x.reduce((max, valor, i) => Math.max(max, Math.abs(valor - anterior[i])), 0);
    iteracionesDetalle.push({ k, x: [...x], error });

    const fila: Record<string, number> = { k, error };
    for (let i = 0; i < n; i++) fila[`x${i + 1}`] = x[i];
    filas.push(fila);

    if (error < tol) {
      return {
        filas,
        iteracionesDetalle,
        iteraciones: k,
        x: [...x],
        error,
        convergio: true,
        diagonalDominante,
      };
    }
  }

  return {
    filas,
    iteracionesDetalle,
    iteraciones: maxIter,
    x: [...x],
    error,
    convergio: false,
    diagonalDominante,
    mensaje:
      `No se alcanzó la tolerancia en ${maxIter} iteraciones. ` +
      'Probá aumentar el máximo de iteraciones o revisar la dominancia diagonal.',
  };
}

/* ------------------------------------------------------------------ */
/* Auxiliares                                                          */
/* ------------------------------------------------------------------ */

function fallo(mensaje: string): ResultadoGaussSeidel {
  return {
    filas: [],
    iteracionesDetalle: [],
    iteraciones: 0,
    convergio: false,
    diagonalDominante: false,
    mensaje,
  };
}

/** Entrada cómoda para ejemplos y tests. */
export function resolverGaussSeidel(datos: SistemaLineal & {
  tol?: number;
  maxIter?: number;
  x0?: readonly number[];
}): ResultadoGaussSeidel {
  return gaussSeidel(datos);
}
