import type { CampoCalculadora, Columna } from '../../../../../shared/models/metodo.model';

/**
 * Configuración de la eliminación gaussiana con pivoteo parcial.
 *
 * ── Qué es "config" ────────────────────────────────────────────────────
 * Es lo que el método declara de sí mismo: cómo se llama, de qué color
 * es, cómo se llaman sus columnas y qué le pregunta al alumno. Lo que
 * el método SABE hacer (el algoritmo) vive en `gauss.algoritmo.ts`, y lo
 * que DICE (la teoría) en `gauss.contenido.ts`.
 *
 * ── Las columnas de la table ──────────────────────────────────────────
 * No son iteraciones: son PASOS. La tabla cuenta lo que hizo el método,
 * paso a paso, que es lo que el alumno tiene que reproducir en el
 * cuaderno.
 */
export const GAUSS = {
  key: 'gauss' as const,
  nombre: 'Eliminación Gaussiana',
  familia: 'directos' as const,
  resumen:
    'Convierte el sistema en uno triangular usando operaciones que no cambian ' +
    'la solución, y después despeja las incógnitas por sustitución hacia ' +
    'atrás. Con pivoteo parcial: antes de eliminar, elige la fila con el ' +
    'mayor valor absoluto para no dividir por un número diminuto.',
  color: '#1b365d',
} as const;

/**
 * Las columnas de la tabla de pasos.
 *
 * La columna `fila` va en fuente monoespaciada: es una fila de matriz y
 * sus columnas tienen que verse alineadas, como en el cuaderno.
 */
export const COLUMNAS_GAUSS: Columna[] = [
  { key: 'n', label: 'i', align: 'right' },
  { key: 'etapa', label: 'Etapa', align: 'left' },
  { key: 'pivote', label: 'Pivote', align: 'right' },
  { key: 'factor', label: 'Factor', align: 'right' },
  { key: 'fila', label: 'Fila resultante', align: 'left', monoespaciado: true },
];

/** Los campos que le pide la calculadora al alumno. */
export const CAMPOS_CALCULADORA: CampoCalculadora[] = [
  {
    key: 'matriz',
    etiqueta: 'Matriz de coeficientes A',
    ayuda:
      'Una fila por ecuación, con los coeficientes separados por espacios. ' +
      'Ejemplo: "2 1 -1" en la primera fila, "-3 -1 2" en la segunda.',
    requisito:
      'Tiene que ser cuadrada: la misma cantidad de filas que de coeficientes por fila.',
    valorInicial: '2 1 -1\n-3 -1 2\n-2 1 2',
    tipo: 'text',
    multilinea: true,
    filas: 6,
    placeholder: '2 1 -1\n-3 -1 2\n-2 1 2',
  },
  {
    key: 'ladoDerecho',
    etiqueta: 'Lado derecho b',
    ayuda:
      'Un valor por ecuación, separados por espacios o comas. ' +
      'Ejemplo: "8 -11 -3".',
    requisito: 'Tiene que tener tantos valores como filas tiene la matriz A.',
    valorInicial: '8 -11 -3',
    tipo: 'text',
    placeholder: '8 -11 -3',
  },
];

/** El sistema con el que la calculadora arranca. */
export const SISTEMA_POR_DEFECTO = {
  A: [
    [2, 1, -1],
    [-3, -1, 2],
    [-2, 1, 2],
  ],
  b: [8, -11, -3],
};
