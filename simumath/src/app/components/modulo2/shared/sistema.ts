import type { SistemaLineal } from '../modelos/modulo2.model';

/**
 * Lectura y escritura de sistemas lineales.
 *
 * El alumno escribe la matriz A y el vector b en dos campos de texto.
 * El formato es amplio: filas separadas por `;` o saltos de línea, y
 * números separados por comas o espacios. Ejemplos válidos:
 *
 *   2, -1, 1; 3, 3, 9; 3, 6, 1
 *   2 -1 1
 *   3  3 9
 *   3  6 1
 *
 * Los errores se devuelven como texto, nunca como excepciones, para que
 * la calculadora pueda explicarlos en pantalla.
 */

/** Número corto y legible, sin ceros de cola. */
export function formatearNumero(v: number | undefined, decimales = 6): string {
  if (v === undefined || !Number.isFinite(v)) return '—';
  if (Math.abs(v) < 1e-12) return '0';
  if (Number.isInteger(v)) return String(v);
  // Los errores de convergencia suelen ser muy chicos: mostrarlos como
  // 0 haría creer que el método llegó a la solución exacta. La notación
  // científica conserva la magnitud.
  if (Math.abs(v) < 1e-4) {
    return v.toExponential(4).replace(/\.?0+e/, 'e');
  }
  return v.toFixed(decimales).replace(/\.?0+$/, '');
}

/** Escribe una matriz como filas separadas por `;`. */
export function formatearMatriz(A: readonly (readonly number[])[], decimales = 4): string {
  return A.map((fila) => fila.map((v) => formatearNumero(v, decimales)).join(', ')).join('; ');
}

/** Escribe un vector como `(a, b, c)`. */
export function formatearVector(x: readonly number[], decimales = 6): string {
  return `(${x.map((v) => formatearNumero(v, decimales)).join(', ')})`;
}

/** Escribe el sistema aumentado [A | b]. */
export function formatearSistema(A: readonly (readonly number[])[], b: readonly number[], decimales = 4): string {
  return A.map((fila, i) => `${fila.map((v) => formatearNumero(v, decimales)).join(', ')} | ${formatearNumero(b[i], decimales)}`).join('; ');
}

/** Filas de una matriz aumentada, con la columna b al final. */
export function matrizAumentada(
  A: readonly (readonly number[])[],
  b: readonly number[],
): number[][] {
  return A.map((fila, i) => [...fila, b[i]]);
}

/* ------------------------------------------------------------------ */
/* Parseo                                                              */
/* ------------------------------------------------------------------ */

const SEPARADOR_FILAS = /[;\n]+/;
const SEPARADOR_NUMEROS = /[,\s]+/;

/**
 * Convierte el texto de una matriz en una matriz numérica.
 * Devuelve `error` si alguna fila no tiene números o si el ancho no es
 * constante.
 */
export function parsearMatriz(texto: string): { A: number[][]; error?: string } {
  const limpio = (texto ?? '').trim();
  if (limpio === '') {
    return { A: [], error: 'Escribí la matriz A, por ejemplo: 2, -1, 1; 3, 3, 9; 3, 6, 1.' };
  }

  const normalizado = limpio
    .replace(/[\[\]{}()]/g, '')
    .replace(/[−–]/g, '-')
    // Se conservan los saltos de línea porque separan filas; solo se
    // colapsan espacios y tabuladores dentro de cada fila.
    .replace(/[^\S\n]+/g, ' ')
    .trim();

  const filasTexto = normalizado
    .split(SEPARADOR_FILAS)
    .map((f) => f.trim())
    .filter((f) => f !== '');

  if (filasTexto.length === 0) {
    return { A: [], error: 'No se encontró ninguna fila en la matriz.' };
  }

  const A: number[][] = [];
  for (let i = 0; i < filasTexto.length; i++) {
    const trozos = filasTexto[i].split(SEPARADOR_NUMEROS).filter((t) => t !== '');
    if (trozos.length === 0) {
      return { A: [], error: `La fila ${i + 1} está vacía.` };
    }

    const fila: number[] = [];
    for (const trozo of trozos) {
      const n = Number(trozo);
      if (!Number.isFinite(n)) {
        return {
          A: [],
          error: `"${trozo}" no es un número válido en la fila ${i + 1}.`,
        };
      }
      fila.push(n);
    }
    A.push(fila);
  }

  const ancho = A[0].length;
  if (A.some((fila) => fila.length !== ancho)) {
    return { A: [], error: 'Todas las filas de A deben tener la misma cantidad de columnas.' };
  }
  if (A.length !== ancho) {
    return {
      A: [],
      error: `La matriz debe ser cuadrada: tiene ${A.length} filas y ${ancho} columnas.`,
    };
  }

  return { A };
}

/**
 * Convierte el texto de un vector b. Acepta `9, 0, 8`, `9; 0; 8` o
 * `[9 0 8]`.
 */
export function parsearVector(texto: string): { b: number[]; error?: string } {
  const limpio = (texto ?? '').trim();
  if (limpio === '') {
    return { b: [], error: 'Escribí el vector b, por ejemplo: 9; 0; 8.' };
  }

  const normalizado = limpio
    .replace(/[\[\]{}()]/g, '')
    .replace(/[−–]/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
  const trozos = normalizado.split(/[;,\s]+/).filter((t) => t !== '');
  const b: number[] = [];
  for (const trozo of trozos) {
    const n = Number(trozo);
    if (!Number.isFinite(n)) {
      return { b: [], error: `"${trozo}" no es un número válido en b.` };
    }
    b.push(n);
  }

  if (b.length === 0) {
    return { b: [], error: 'El vector b no puede estar vacío.' };
  }
  return { b };
}

/** Parsea A y b y comprueba que sus tamaños sean compatibles. */
export function parsearSistema(
  matrizTexto: string,
  vectorTexto: string,
): { sistema: SistemaLineal | null; error?: string } {
  const { A, error: errorA } = parsearMatriz(matrizTexto);
  if (errorA) return { sistema: null, error: errorA };

  const { b, error: errorB } = parsearVector(vectorTexto);
  if (errorB) return { sistema: null, error: errorB };

  if (A.length !== b.length) {
    return {
      sistema: null,
      error: `A tiene ${A.length} ecuaciones pero b tiene ${b.length} términos. Deben coincidir.`,
    };
  }

  return { sistema: { A, b } };
}

/* ------------------------------------------------------------------ */
/* Ayudas numéricas                                                    */
/* ------------------------------------------------------------------ */

/** ¿La matriz es cuadrada? */
export function esCuadrada(A: readonly (readonly number[])[]): boolean {
  return A.length > 0 && A.every((fila) => fila.length === A.length);
}

/**
 * ¿La matriz es estrictamente diagonalmente dominante?
 * Es la condición suficiente clásica para que Gauss-Seidel converja.
 */
export function esDiagonalmenteDominante(A: readonly (readonly number[])[]): boolean {
  if (!esCuadrada(A)) return false;
  return A.every((fila, i) => {
    const diagonal = Math.abs(fila[i]);
    const suma = fila.reduce((s, v, j) => (j === i ? s : s + Math.abs(v)), 0);
    return diagonal > suma;
  });
}

/** Norma infinito de un vector. */
export function normaInfinito(x: readonly number[]): number {
  return x.reduce((max, v) => Math.max(max, Math.abs(v)), 0);
}

/** Residuo máximo de una solución: ‖Ax − b‖∞. */
export function residuoMaximo(
  A: readonly (readonly number[])[],
  b: readonly number[],
  x: readonly number[],
): number {
  let max = 0;
  for (let i = 0; i < A.length; i++) {
    const suma = A[i].reduce((s, aij, j) => s + aij * (x[j] ?? 0), 0);
    max = Math.max(max, Math.abs(suma - b[i]));
  }
  return max;
}

/** ¿Todos los elementos son finitos y la matriz es cuadrada? */
export function sistemaValido(A: readonly (readonly number[])[], b: readonly number[]): boolean {
  return (
    esCuadrada(A) &&
    b.length === A.length &&
    A.every((fila) => fila.every((v) => Number.isFinite(v))) &&
    b.every((v) => Number.isFinite(v))
  );
}
