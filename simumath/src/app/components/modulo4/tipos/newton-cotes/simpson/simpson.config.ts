import type { Columna } from '../../../../../shared/models/metodo.model';
import type {
  CampoCalculadoraM4,
  DatosModulo4,
} from '../../../modelos/modulo4.model';

/**
 * CONFIGURACIÓN DE SIMPSON 1/3 COMPUESTO.
 *
 * Datos fijos del método: identidad, columnas de la tabla de trabajo y
 * campos de la calculadora. El algoritmo está en `simpson.algoritmo.ts`
 * y los textos en el contenido.
 */

/* ------------------------------------------------------------------ */
/* Identidad del método                                                */
/* ------------------------------------------------------------------ */

export const SIMPSON = {
  key: 'simpson',
  nombre: 'Regla de Simpson 1/3 compuesta',
  familia: 'newton-cotes' as const,
  resumen:
    'Aproxima el área ajustando una parábola cada dos subintervalos, con n par obligatorio.',
  color: '#8a5a00',
} as const;

/* ------------------------------------------------------------------ */
/* Tabla de trabajo                                                    */
/* ------------------------------------------------------------------ */

/**
 * Misma tabla que el trapecio, con otros coeficientes: 1 en los
 * extremos, 4 en los nodos impares y 2 en los pares interiores. Esa
 * alternancia 1-4-2-4-…-1 es la firma de Simpson y conviene verla.
 */
export const COLUMNAS_SIMPSON: Columna[] = [
  { key: 'i', label: 'i', align: 'right' },
  { key: 'xi', label: 'xᵢ', align: 'right' },
  { key: 'fxi', label: 'f(xᵢ)', align: 'right' },
  { key: 'coef', label: 'coef.', align: 'center' },
  { key: 'aporte', label: 'coef. · f(xᵢ)', align: 'right' },
];

/* ------------------------------------------------------------------ */
/* Calculadora                                                         */
/* ------------------------------------------------------------------ */

export const CAMPOS_CALCULADORA_SIMPSON: CampoCalculadoraM4[] = [
  {
    key: 'funcion',
    etiqueta: 'Función f(x)',
    ayuda: 'Se escribe con x, + − * / ^ y funciones: sin, cos, tan, exp, ln, log, sqrt, abs.',
    requisito: 'Ej: x^2, 1/x, exp(-x^2), sin(x)',
    valorInicial: 'x^2',
    tipo: 'text',
    placeholder: 'x^2',
  },
  {
    key: 'a',
    etiqueta: 'Extremo inferior a',
    ayuda: 'Inicio del intervalo de integración.',
    valorInicial: '0',
    tipo: 'number',
    placeholder: '0',
  },
  {
    key: 'b',
    etiqueta: 'Extremo superior b',
    ayuda: 'Fin del intervalo. Tiene que ser mayor que a.',
    valorInicial: '1',
    tipo: 'number',
    placeholder: '1',
  },
  {
    key: 'n',
    etiqueta: 'Subintervalos n (par)',
    ayuda: 'Cada parábola cubre dos subintervalos, así que n debe ser par.',
    requisito: 'Par, entre 2 y 200.',
    valorInicial: '4',
    tipo: 'number',
    placeholder: '4',
  },
  {
    key: 'valorExacto',
    etiqueta: 'Valor exacto (opcional)',
    ayuda: 'Si lo conocés, se muestra el error absoluto y relativo del resultado.',
    requisito: 'Dejalo vacío si no lo sabés.',
    valorInicial: '',
    tipo: 'number',
    placeholder: '0.333333',
  },
];

/** Con qué datos abre la calculadora de Simpson. */
export const DATOS_POR_DEFECTO_SIMPSON: DatosModulo4 = {
  funcion: 'x^2',
  a: 0,
  b: 1,
  n: 4,
  etiqueta: 'x² en [0, 1]',
};
