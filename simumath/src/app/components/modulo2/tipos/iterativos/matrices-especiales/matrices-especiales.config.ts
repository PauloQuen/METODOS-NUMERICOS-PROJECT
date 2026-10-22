import type { Columna } from '../../../../../shared/models/metodo.model';
import type { CampoCalculadoraM2, DatosSistema } from '../../../modelos/modulo2.model';

/**
 * IDENTIDAD Y CONFIGURACIÓN DE MATRICES ESPECIALES (GAUSS-SEIDEL).
 */

export const MATRICES_ESPECIALES = {
  key: 'matrices-especiales',
  nombre: 'Matrices especiales (Gauss-Seidel)',
  familia: 'iterativos' as const,
  resumen:
    'Resuelve sistemas con matrices diagonalmente dominantes o tridiagonales mediante iteraciones de Gauss-Seidel.',
  color: '#8a5a00',
} as const;

/** Columnas fijas para los ejemplos de 3 incógnitas. */
export const COLUMNAS_MATRICES_ESPECIALES: Columna[] = [
  { key: 'k', label: 'k', align: 'right' },
  { key: 'x1', label: 'x₁', align: 'right' },
  { key: 'x2', label: 'x₂', align: 'right' },
  { key: 'x3', label: 'x₃', align: 'right' },
  { key: 'error', label: 'Error', align: 'right' },
];

/** Columnas para un sistema de n incógnitas (calculadora). */
export function columnasGaussSeidel(n: number): Columna[] {
  const columnas: Columna[] = [{ key: 'k', label: 'k', align: 'right' }];
  for (let i = 0; i < n; i++) {
    columnas.push({ key: `x${i + 1}`, label: `x${subindice(i + 1)}`, align: 'right' });
  }
  columnas.push({ key: 'error', label: 'Error', align: 'right' });
  return columnas;
}

export const CAMPOS_CALCULADORA_MATRICES_ESPECIALES: CampoCalculadoraM2[] = [
  {
    key: 'matriz',
    etiqueta: 'Matriz A (coeficientes)',
    ayuda: 'Filas separadas por punto y coma. Para Gauss-Seidel conviene que sea diagonalmente dominante.',
    requisito: 'Ej: 10, -1, 2; 1, 10, -1; 2, -1, 10',
    valorInicial: '10, -1, 2; 1, 10, -1; 2, -1, 10',
    tipo: 'text',
    placeholder: '10, -1, 2; 1, 10, -1; 2, -1, 10',
  },
  {
    key: 'vector',
    etiqueta: 'Vector b (términos independientes)',
    ayuda: 'Un número por ecuación, separados por punto y coma o comas.',
    requisito: 'Debe tener la misma cantidad de elementos que filas tiene A.',
    valorInicial: '11; 10; 11',
    tipo: 'text',
    placeholder: '11; 10; 11',
  },
  {
    key: 'tol',
    etiqueta: 'Tolerancia',
    ayuda: 'El método se detiene cuando el cambio máximo entre iteraciones es menor que este valor.',
    requisito: 'Un número positivo, por ejemplo 0.000001.',
    valorInicial: '0.000001',
    tipo: 'number',
    placeholder: '0.000001',
  },
  {
    key: 'maxIter',
    etiqueta: 'Máximo de iteraciones',
    ayuda: 'Tope de seguridad para no iterar indefinidamente.',
    requisito: 'Un entero positivo; 100 es un valor razonable.',
    valorInicial: '100',
    tipo: 'number',
    placeholder: '100',
  },
  {
    key: 'x0',
    etiqueta: 'Aproximación inicial (opcional)',
    ayuda: 'Si se deja vacío, el método arranca con el vector cero.',
    requisito: 'Ej: 0; 0; 0',
    valorInicial: '',
    tipo: 'text',
    placeholder: '0; 0; 0',
  },
];

export const DATOS_POR_DEFECTO_MATRICES_ESPECIALES: DatosSistema = {
  A: [
    [10, -1, 2],
    [1, 10, -1],
    [2, -1, 10],
  ],
  b: [11, 10, 11],
  tol: 1e-6,
  maxIter: 100,
  etiqueta: 'Sistema diagonalmente dominante',
};

function subindice(n: number): string {
  const digitos = '₀₁₂₃₄₅₆₇₈₉';
  return String(n)
    .split('')
    .map((d) => digitos[Number(d)] ?? d)
    .join('');
}
