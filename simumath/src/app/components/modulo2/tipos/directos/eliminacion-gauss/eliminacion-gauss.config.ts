import type { Columna } from '../../../../../shared/models/metodo.model';
import type { CampoCalculadoraM2, DatosSistema } from '../../../modelos/modulo2.model';

/**
 * IDENTIDAD Y CONFIGURACIÓN DE ELIMINACIÓN DE GAUSS.
 * Los textos y ejemplos viven en `eliminacion-gauss.contenido.ts`; acá
 * están las columnas de la tabla y los campos de la calculadora.
 */

export const ELIMINACION_GAUSS = {
  key: 'eliminacion-gauss',
  nombre: 'Eliminación de Gauss',
  familia: 'directos' as const,
  resumen:
    'Transforma el sistema en uno triangular mediante operaciones elementales y resuelve por sustitución regresiva.',
  color: '#1b5e7a',
} as const;

export const COLUMNAS_GAUSS: Columna[] = [
  { key: 'paso', label: 'Paso', align: 'right' },
  { key: 'pivote', label: 'Pivote', align: 'right' },
  { key: 'fila', label: 'Fila', align: 'left' },
  { key: 'operacion', label: 'Operación', align: 'left' },
  { key: 'matriz', label: 'Matriz A', align: 'left' },
  { key: 'termino', label: 'b', align: 'left' },
];

export const CAMPOS_CALCULADORA_GAUSS: CampoCalculadoraM2[] = [
  {
    key: 'matriz',
    etiqueta: 'Matriz A (coeficientes)',
    ayuda: 'Filas separadas por punto y coma. Cada fila con sus coeficientes separados por comas.',
    requisito: 'Ej: 2, 1, -1; -3, -1, 2; -2, 1, 2',
    valorInicial: '2, 1, -1; -3, -1, 2; -2, 1, 2',
    tipo: 'text',
    placeholder: '2, 1, -1; -3, -1, 2; -2, 1, 2',
  },
  {
    key: 'vector',
    etiqueta: 'Vector b (términos independientes)',
    ayuda: 'Un número por ecuación, separados por punto y coma o comas.',
    requisito: 'Debe tener la misma cantidad de elementos que filas tiene A.',
    valorInicial: '8; -11; -3',
    tipo: 'text',
    placeholder: '8; -11; -3',
  },
];

export const DATOS_POR_DEFECTO_GAUSS: DatosSistema = {
  A: [
    [2, 1, -1],
    [-3, -1, 2],
    [-2, 1, 2],
  ],
  b: [8, -11, -3],
  etiqueta: 'Sistema clásico 3×3',
};
