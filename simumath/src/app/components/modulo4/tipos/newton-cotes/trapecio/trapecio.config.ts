import type { Columna } from '../../../../../shared/models/metodo.model';
import type {
  CampoCalculadoraM4,
  DatosModulo4,
} from '../../../modelos/modulo4.model';

/**
 * CONFIGURACIÓN DEL TRAPECIO COMPUESTO.
 *
 * Datos fijos del método: identidad, columnas de la tabla de trabajo y
 * campos de la calculadora. El algoritmo está en `trapecio.algoritmo.ts`
 * y los textos en el contenido.
 */

/* ------------------------------------------------------------------ */
/* Identidad del método                                                */
/* ------------------------------------------------------------------ */

export const TRAPECIO = {
  key: 'trapecio',
  nombre: 'Regla del trapecio compuesta',
  familia: 'newton-cotes' as const,
  resumen:
    'Aproxima el área bajo la curva sumando trapecios de ancho h entre puntos consecutivos.',
  color: '#1b6b93',
} as const;

/* ------------------------------------------------------------------ */
/* Tabla de trabajo                                                    */
/* ------------------------------------------------------------------ */

/**
 * La tabla muestra el trabajo completo: cada nodo con su f(xᵢ), el
 * coeficiente que le toca (1 en los extremos, 2 en los interiores) y su
 * aporte a la suma. La última fila trae Σ, que es la que se multiplica
 * por h/2.
 */
export const COLUMNAS_TRAPECIO: Columna[] = [
  { key: 'i', label: 'i', align: 'right' },
  { key: 'xi', label: 'xᵢ', align: 'right' },
  { key: 'fxi', label: 'f(xᵢ)', align: 'right' },
  { key: 'coef', label: 'coef.', align: 'center' },
  { key: 'aporte', label: 'coef. · f(xᵢ)', align: 'right' },
];

/* ------------------------------------------------------------------ */
/* Calculadora                                                         */
/* ------------------------------------------------------------------ */

export const CAMPOS_CALCULADORA_TRAPECIO: CampoCalculadoraM4[] = [
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
    etiqueta: 'Subintervalos n',
    ayuda: 'Cantidad de trapecios. Al duplicarlo, el error baja a la cuarta parte.',
    requisito: 'Entero entre 1 y 200.',
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

/** Con qué datos abre la calculadora del trapecio. */
export const DATOS_POR_DEFECTO_TRAPECIO: DatosModulo4 = {
  funcion: 'x^2',
  a: 0,
  b: 1,
  n: 4,
  etiqueta: 'x² en [0, 1]',
};
