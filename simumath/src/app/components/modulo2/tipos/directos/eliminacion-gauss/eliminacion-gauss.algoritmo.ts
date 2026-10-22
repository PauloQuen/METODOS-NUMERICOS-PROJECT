import type { SistemaLineal } from '../../../modelos/modulo2.model';
import {
  esCuadrada,
  formatearMatriz,
  formatearNumero,
  formatearVector,
  matrizAumentada,
  residuoMaximo,
  sistemaValido,
} from '../../../shared/sistema';

/**
 * ELIMINACIÓN DE GAUSS — función pura, sin Angular.
 *
 * ── La idea en una frase ─────────────────────────────────────────────
 * Se hacen ceros debajo de cada pivote con operaciones elementales de
 * fila. La matriz queda triangular superior y la solución se obtiene
 * despejando desde la última ecuación hacia arriba.
 *
 * ── Pivoteo parcial ─────────────────────────────────────────────────
 * En cada columna se busca la fila con el mayor valor absoluto y se
 * intercambia con la fila del pivote. Eso no cambia la solución y evita
 * dividir por números muy chicos, que amplifican el error de redondeo.
 *
 * ── Sin Angular y sin otros métodos ─────────────────────────────────
 * TypeScript puro: se puede probar directo y no depende de la UI.
 */

/* ------------------------------------------------------------------ */
/* Tipos                                                               */
/* ------------------------------------------------------------------ */

export interface FilaGauss {
  /** Número de etapa de eliminación, empezando en 1. */
  paso: number;
  /** Valor del pivote usado en esa etapa. */
  pivote: string;
  /** Fila que se modifica (o "intercambio"). */
  fila: string;
  /** Operación elemental aplicada. */
  operacion: string;
  /** Matriz A después de la operación. */
  matriz: string;
  /** Vector b después de la operación. */
  termino: string;
}

export interface ResultadoGauss {
  filas: FilaGauss[];
  /** Solución, si se pudo calcular. */
  x?: number[];
  /** Determinante de A (con el signo de los intercambios). */
  determinante?: number;
  /** ‖Ax − b‖∞ con la solución calculada. */
  residual?: number;
  /** Cuántos intercambios de fila hizo el pivoteo parcial. */
  pivoteos: number;
  /** Matriz triangular final (sin la columna b). */
  A?: number[][];
  /** Vector b triangular final. */
  b?: number[];
  /** Mensaje si el sistema no se pudo resolver. */
  mensaje?: string;
}

/** Datos de entrada del método. */
export interface EntradaGauss {
  A: readonly (readonly number[])[];
  b: readonly number[];
  /** Tolerancia para considerar un pivote nulo. */
  tol?: number;
}

/* ------------------------------------------------------------------ */
/* Algoritmo                                                           */
/* ------------------------------------------------------------------ */

export function eliminacionGauss(entrada: EntradaGauss): ResultadoGauss {
  const { A, b } = entrada;
  const tol = entrada.tol ?? 1e-12;

  if (!esCuadrada(A)) {
    return fallo('La matriz A debe ser cuadrada.');
  }
  if (!sistemaValido(A, b)) {
    return fallo('Revisá A y b: deben ser numéricos, cuadrados y del mismo tamaño.');
  }

  const n = A.length;
  const M = matrizAumentada(A, b);
  const AOriginal = A.map((fila) => [...fila]);
  const bOriginal = [...b];
  const filas: FilaGauss[] = [];
  let signo = 1;
  let pivoteos = 0;

  // ── Eliminación hacia adelante con pivoteo parcial ─────────────────
  for (let k = 0; k < n; k++) {
    let p = k;
    for (let i = k + 1; i < n; i++) {
      if (Math.abs(M[i][k]) > Math.abs(M[p][k])) p = i;
    }

    if (Math.abs(M[p][k]) < tol) {
      return {
        ...fallo(
          `El pivote de la columna ${k + 1} es prácticamente cero. ` +
            'El sistema puede ser singular o no tener solución única.',
        ),
        filas,
        pivoteos,
      };
    }

    if (p !== k) {
      const aux = M[p];
      M[p] = M[k];
      M[k] = aux;
      signo *= -1;
      pivoteos++;
      filas.push({
        paso: k + 1,
        pivote: formatearNumero(M[k][k]),
        fila: 'intercambio',
        operacion: `F${k + 1} ↔ F${p + 1}`,
        matriz: formatearMatriz(M.map((fila) => fila.slice(0, n))),
        termino: formatearVector(M.map((fila) => fila[n])),
      });
    }

    const pivote = M[k][k];
    for (let i = k + 1; i < n; i++) {
      const factor = M[i][k] / pivote;
      if (Math.abs(factor) < 1e-15) {
        M[i][k] = 0;
        continue;
      }

      for (let j = k; j <= n; j++) {
        M[i][j] -= factor * M[k][j];
      }

      filas.push({
        paso: k + 1,
        pivote: formatearNumero(pivote),
        fila: `F${i + 1}`,
        operacion: `F${i + 1} ← F${i + 1} − (${formatearNumero(factor)})·F${k + 1}`,
        matriz: formatearMatriz(M.map((fila) => fila.slice(0, n))),
        termino: formatearVector(M.map((fila) => fila[n])),
      });
    }
  }

  // ── Sustitución regresiva ───────────────────────────────────────────
  const x = new Array<number>(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    if (Math.abs(M[i][i]) < tol) {
      return {
        ...fallo('Apareció un cero en la diagonal al despejar: el sistema es singular.'),
        filas,
        pivoteos,
      };
    }

    let suma = M[i][n];
    for (let j = i + 1; j < n; j++) {
      suma -= M[i][j] * x[j];
    }
    x[i] = suma / M[i][i];
  }

  const determinante = signo * M.reduce((producto, fila, i) => producto * fila[i], 1);
  const residual = residuoMaximo(AOriginal, bOriginal, x);

  return {
    filas,
    x,
    determinante,
    residual,
    pivoteos,
    A: M.map((fila) => fila.slice(0, n)),
    b: M.map((fila) => fila[n]),
  };
}

/* ------------------------------------------------------------------ */
/* Auxiliares                                                          */
/* ------------------------------------------------------------------ */

function fallo(mensaje: string): ResultadoGauss {
  return { filas: [], pivoteos: 0, mensaje };
}

/** Entrada cómoda para ejemplos y tests. */
export function resolverSistema({ A, b }: SistemaLineal): ResultadoGauss {
  return eliminacionGauss({ A, b });
}
