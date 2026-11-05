import type { CampoCalculadora, Columna } from '../../../../../shared/models/metodo.model';

/**
 * Configuración de la factorización LU (Doolittle).
 *
 * ── Qué es "config" ────────────────────────────────────────────────────
 * Es lo que el método declara de sí mismo: cómo se llama, de qué color
 * es, cómo se llaman sus columnas y qué le pregunta al alumno. Lo que
 * el método SABE hacer (el algoritmo) vive en `lu.algoritmo.ts`, y lo que
 * DICE (la teoría) en `lu.contenido.ts`.
 *
 * ── Las columnas de la tabla ──────────────────────────────────────────
 * No son iteraciones: son PASOS. La tabla cuenta lo que hizo el método,
 * paso a paso, que es lo que el alumno tiene que reproducir en el
 * cuaderno. Tres etapas: la descomposición (con sus multiplicadores) y
 * las dos sustituciones.
 */
export const LU = {
  key: 'lu' as const,
  nombre: 'Factorización LU',
  familia: 'directos' as const,
  resumen:
    'La eliminación gaussiana, pero guardada: la triangularización se hace ' +
    'una sola vez y se guarda en dos matrices, L y U. Después cada sistema ' +
    'nuevo con la misma A se resuelve con dos sustituciones, sin volver a ' +
    'eliminar.',
  color: '#7a3b8f',
} as const;

/**
 * Las columnas de la tabla de pasos.
 *
 * La columna `fila` va en fuente monoespaciada: es una fila de matriz y
 * sus columnas tienen que verse alineadas, como en el cuaderno.
 */
export const COLUMNAS_LU: Columna[] = [
  { key: 'n', label: 'i', align: 'right' },
  { key: 'etapa', label: 'Etapa', align: 'left' },
  { key: 'multiplicador', label: 'Multiplicador', align: 'right' },
  { key: 'fila', label: 'Fila resultante', align: 'left', monoespaciado: true },
];

/** Los campos que le pide la calculadora al alumno. */
export const CAMPOS_CALCULADORA: CampoCalculadora[] = [
  {
    key: 'matriz',
    etiqueta: 'Matriz de coeficientes A',
    ayuda:
      'Una fila por ecuación, con los coeficientes separados por espacios. ' +
      'Ejemplo: "3 1" en la primera fila, "1 2" en la segunda.',
    requisito:
      'Tiene que ser cuadrada: la misma cantidad de filas que de coeficientes por fila.',
    valorInicial: '3 1\n1 2',
    tipo: 'text',
    multilinea: true,
    filas: 6,
    placeholder: '3 1\n1 2',
  },
  {
    key: 'ladoDerecho',
    etiqueta: 'Lado derecho b',
    ayuda:
      'Un valor por ecuación, separados por espacios o comas. ' +
      'Ejemplo: "9 8".',
    requisito: 'Tiene que tener tantos valores como filas tiene la matriz A.',
    valorInicial: '9 8',
    tipo: 'text',
    placeholder: '9 8',
  },
];

/** El sistema con el que la calculadora arranca. */
export const SISTEMA_POR_DEFECTO = {
  A: [
    [3, 1],
    [1, 2],
  ],
  b: [9, 8],
};
