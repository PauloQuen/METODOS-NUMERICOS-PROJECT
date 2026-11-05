import {
  TOLERANCIA,
  formatearResiduo,
  formatearVector,
  residuo,
  type SistemaLineal,
} from '../../../../../shared/domain/numerico/matriz';
import { nombreIncognita } from '../../../../../shared/models/sistema.model';

/**
 * ELIMINACIÓN GAUSSIANA CON PIVOTEO PARCIAL.
 *
 * ── Qué resuelve ───────────────────────────────────────────────────────
 * Un sistema A·x = b. La idea es la de siempre: convertir el sistema en
 * uno triangular (resuelto por sustitución hacia atrás) usando solo
 * operaciones que NO cambian la solución.
 *
 * Las tres operaciones permitidas son:
 *   1. Cambiar dos filas de lugar.
 *   2. Multiplicar una fila por un número distinto de cero.
 *   3. Sumarle a una fila un múltiplo de otra fila.
 *
 * ── Por qué PIVOTEO PARCIAL y no pivoteo total ────────────────────────
 * El pivoteo parcial es el último refinamiento del método de Gauss: antes
 * de usar la fila k como pivote, se busca entre las filas de abajo la que
 * tenga el MAYOR valor absoluto en la columna k, y se intercambian.
 *
 * El motivo es numérico, no estético. Si el pivote es un número
 * chiquitito (0.0000001), al dividir por él los errores de redondeo se
 * amplifican y el resultado se ensucia. Con el pivoteo parcial el
 * denominador es el más grande posible, y el error se queda acotado.
 *
 * En la práctica el pivoteo parcial casi siempre da el MISMO resultado
 * que el método de Gauss sin pivoteo, y a veces da un resultado un poco
 * más feo (más decimales) que la solución exacta. Eso es normal: la
 * diferencia real aparece cuando el sistema está mal conditioning, y
 * ahí el pivoteo parcial es el que salva los resultados.
 *
 * ── Qué devuelve ───────────────────────────────────────────────────────
 * No solo la solución: también la lista de pasos, uno por fila de la
 * tabla, con el pivote, el factor y la fila que queda. Con eso el
 * componente puede narrar el paso a paso sin que el texto se escriba a
 * mano (y sin que pueda dejar de coincidir con los números).
 */

/** En qué etapa del método está un paso. */
export type EtapaGauss = 'Pivoteo' | 'Eliminación' | 'Sustitución';

/** Un paso del método, que es una fila de la tabla. */
export interface FilaGauss {
  /** Número de paso, empezando en 1. */
  n: number;
  /** En qué etapa del método está. */
  etapa: EtapaGauss;
  /** La columna del pivote (0-based). En sustitución, la incógnita que se despeja. */
  k: number;
  /** El valor del pivote que se está usando. */
  pivote: number;
  /** El multiplicador con el que se elimina, si hubo eliminación. */
  factor?: number;
  /** La fila que queda después del paso, ya formateada. */
  fila: string;
  /** La explicación del paso, en palabras. */
  detalle: string;
}

/** Lo que devuelve una corrida del método. */
export interface ResultadoGauss {
  /** ¿Se pudo resolver? */
  exito: boolean;
  /** La solución, si se resolvió. */
  solucion?: number[];
  /** Los pasos, en orden. */
  filas: FilaGauss[];
  /** El residuo ‖A·x − b‖∞: cuánto error queda. */
  residuo?: number;
  /** Cuántas filas se intercambiaron. */
  intercambios: number;
  /** Por qué no se pudo resolver, si no se pudo. */
  mensaje?: string;
}

/**
 * Resuelve A·x = b por eliminación gaussiana con pivoteo parcial.
 *
 * No muta los datos que recibe: trabaja sobre una copia de la matriz
 * aumentada, así que el sistema original queda intacto para el gráfico.
 */
export function ejecutarGauss(sistema: SistemaLineal): ResultadoGauss {
  const n = sistema.A.length;
  const filas: FilaGauss[] = [];
  let paso = 0;
  let intercambios = 0;

  if (n === 0) {
    return { exito: false, filas, intercambios: 0, mensaje: 'El sistema está vacío.' };
  }

  // La matriz aumentada: [A | b]. Se opera sobre ella, no sobre A.
  const M: number[][] = sistema.A.map((fila, i) => [...fila, sistema.b[i]]);

  /* ---------------------------------------------------------------- */
  /* Eliminación hacia adelante: dejar el sistema triangular superior  */
  /* ---------------------------------------------------------------- */
  for (let k = 0; k < n - 1; k++) {
    // Pivoteo parcial: la fila con el mayor valor absoluto en la columna k.
    let p = k;
    for (let i = k + 1; i < n; i++) {
      if (Math.abs(M[i][k]) > Math.abs(M[p][k])) {
        p = i;
      }
    }

    if (p !== k) {
      const temp = M[k];
      M[k] = M[p];
      M[p] = temp;
      intercambios++;
      paso++;
      filas.push({
        n: paso,
        etapa: 'Pivoteo',
        k,
        pivote: M[k][k],
        fila: formatearFila(M[k], n),
        detalle:
          `Se intercambian las filas ${k + 1} y ${p + 1}: el pivote de la ` +
          `columna ${k + 1} pasa a ser ${numero(M[k][k])}.`,
      });
    }

    if (Math.abs(M[k][k]) < TOLERANCIA) {
      return {
        exito: false,
        filas,
        intercambios,
        mensaje:
          `La matriz es singular: el pivote de la columna ${k + 1} es cero. ` +
          `El sistema no tiene solución única.`,
      };
    }

    // Eliminación: por cada fila de abajo, se anula el coeficiente de la columna k.
    for (let i = k + 1; i < n; i++) {
      if (Math.abs(M[i][k]) < TOLERANCIA) {
        // Ya es cero: no hay nada que eliminar y no se anota un paso vacío.
        continue;
      }

      const factor = M[i][k] / M[k][k];
      for (let j = k; j <= n; j++) {
        M[i][j] -= factor * M[k][j];
      }
      // Los residuos de redondeo se limpian a cero exacto.
      for (let j = k; j <= n; j++) {
        if (Math.abs(M[i][j]) < TOLERANCIA) {
          M[i][j] = 0;
        }
      }

      paso++;
      filas.push({
        n: paso,
        etapa: 'Eliminación',
        k,
        pivote: M[k][k],
        factor,
        fila: formatearFila(M[i], n),
        detalle:
          `Se anula el coeficiente de ${nombreIncognita(k)} en la fila ${i + 1} ` +
          `con el factor ${numero(factor)}.`,
      });
    }
  }

  // El último pivote (el de la última fila) también puede ser cero.
  if (Math.abs(M[n - 1][n - 1]) < TOLERANCIA) {
    return {
      exito: false,
      filas,
      intercambios,
      mensaje:
        'La matriz es singular: el último pivote es cero. ' +
        'El sistema no tiene solución única.',
    };
  }

  /* ---------------------------------------------------------------- */
  /* Sustitución hacia atrás: despejar las incógnitas                 */
  /* ---------------------------------------------------------------- */
  const x: number[] = new Array(n).fill(0);

  for (let i = n - 1; i >= 0; i--) {
    let acumulado = M[i][n];
    for (let j = i + 1; j < n; j++) {
      acumulado -= M[i][j] * x[j];
    }
    x[i] = acumulado / M[i][i];

    paso++;
    filas.push({
      n: paso,
      etapa: 'Sustitución',
      k: i,
      pivote: M[i][i],
      fila: `${nombreIncognita(i)} = ${numero(x[i])}`,
      detalle:
        `Se despeja ${nombreIncognita(i)} dividiendo ${numero(acumulado)} ` +
        `entre ${numero(M[i][i])}.`,
    });
  }

  return {
    exito: true,
    solucion: x,
    filas,
    residuo: residuo(sistema.A, x, sistema.b),
    intercambios,
  };
}

/* ------------------------------------------------------------------ */
/* Formato                                                             */
/* ------------------------------------------------------------------ */

/** Ancho de cada número en la fila, para que las columnas calcen. */
const ANCHO = 9;

/** Un número con 4 decimales, para las filas de la matriz. */
function numero(v: number): string {
  if (!Number.isFinite(v)) return '—';
  const s = v.toFixed(4);
  // -0.0000 se muestra como 0.0000: el signo negativo de un cero no dice nada.
  return Number(s) === 0 ? (0).toFixed(4) : s;
}

/**
 * La fila de la matriz aumentada, formateada y alineada.
 *
 * La barra vertical separa los coeficientes del lado derecho, que es
 * como se escribe la matriz aumentada en el cuaderno.
 */
function formatearFila(fila: number[], n: number): string {
  const partes: string[] = [];
  for (let j = 0; j < n; j++) {
    partes.push(numero(fila[j]).padStart(ANCHO, ' '));
  }
  return partes.join('') + ' | ' + numero(fila[n]).padStart(ANCHO, ' ');
}

/*
 * El formateo de la solución y del residuo NO vive acá: es la misma
 * medida para todos los métodos del módulo, así que está en
 * `shared/domain/numerico/matriz.ts`. Lo que queda en este archivo es
 * solo el formato de las FILAS DE MATRIZ, que es particular de la
 * eliminación gaussiana.
 *
 * Se reexporta el residuo para que quien use este motor no tenga que
 * saber en qué archivo compartido vive cada cosa.
 */
export { formatearResiduo };

/**
 * La solución, en forma de texto: "(2, 3)".
 *
 * Usa el formateo compartido, que muestra los enteros sin decimales de
 * relleno: en un sistema lineal casi todos los coeficientes son enteros
 * y ver "2.000000" esconde que son enteros.
 */
export function formatearSolucion(x: number[] | undefined): string {
  if (!x) return '—';
  return formatearVector(x);
}
