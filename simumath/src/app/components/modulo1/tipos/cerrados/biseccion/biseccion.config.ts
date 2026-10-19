import type {
  CampoCalculadora,
  Columna,
  DatosCalculo,
} from '../../../../../shared/models/metodo.model';

/**
 * CONFIGURACIÓN DE BISECCIÓN
 *
 * ── Qué hay en este archivo ───────────────────────────────────────────
 * Los datos FIJOS del método: cómo se llama, qué columnas tiene su tabla,
 * qué campos tiene su calculadora y con qué valores arranca.
 *
 * Lo que NO hay aquí, y es importante: el algoritmo. Eso vive en
 * `biseccion.algoritmo.ts`, que es una función pura sin Angular. Acá solo
 * hay declaraciones de datos. Si mañana se agrega Regla Falsa, este
 * archivo se copia y se cambia lo de Regla Falsa; no se toca Bisección.
 */

/* ------------------------------------------------------------------ */
/* Identidad del método                                                */
/* ------------------------------------------------------------------ */

export const BISECCION = {
  /** La clave con la que se la busca en el registro de métodos. */
  key: 'biseccion',
  /** El nombre que ve el alumno. */
  nombre: 'Bisección',
  /** La familia: métodos que necesitan acotar la raíz en un intervalo. */
  familia: 'cerrados' as const,
  /** Una línea para las tarjetas del índice. */
  resumen: 'Parte el intervalo a la mitad hasta hallar la raíz.' as const,
  /** El color que usa el índice y los subrayados. */
  color: '#5b7cfa',
} as const;

/* ------------------------------------------------------------------ */
/* Tabla de iteraciones                                                */
/* ------------------------------------------------------------------ */

/**
 * Las columnas del método, en orden. La clave de cada columna es el
 * nombre que el algoritmo escribe en cada fila.
 *
 * `error` es la columna clave: en bisección NO es |f(c)|, es (b − a)/2, la
 * distancia máxima entre el punto medio y la raíz. Es una cota, no una
 * medición, y por eso el método puede garantizar el error de antemano.
 */
export const COLUMNAS_BISECCION: Columna[] = [
  { key: 'n', label: 'n', align: 'right' },
  { key: 'a', label: 'a', align: 'right' },
  { key: 'b', label: 'b', align: 'right' },
  { key: 'c', label: 'c (punto medio)', align: 'right' },
  { key: 'fc', label: 'f(c)', align: 'right' },
  { key: 'error', label: 'error (b−a)/2', align: 'right' },
];

/* ------------------------------------------------------------------ */
/* Calculadora                                                         */
/* ------------------------------------------------------------------ */

/**
 * Los campos que ve el alumno en la calculadora.
 *
 * Ojo con `requisito`: el componente genérico los muestra tal cual debajo
 * del campo. Son las TRES condiciones que bisección necesita para no
 * fallar, y están escritas como las ve un alumno, no como las ve un
 * matemático.
 */
export const CAMPOS_CALCULADORA: CampoCalculadora[] = [
  {
    key: 'funcion',
    etiqueta: 'Función f(x)',
    ayuda: 'Usá x como variable. Se admiten ^ para potencias, exp(), ln(), sen(), cos(), log().',
    requisito: 'Ej: x^3 - x - 2',
    valorInicial: 'x^3 - x - 2',
    tipo: 'text',
    placeholder: 'x^3 - x - 2',
  },
  {
    key: 'a',
    etiqueta: 'Extremo izquierdo (a)',
    ayuda: 'El número más chico del intervalo donde creés que está la raíz.',
    requisito: 'Necesita f(a) y f(b) con signos distintos. Si no hay cambio de signo, bisección no puede asegurar que exista una raíz.',
    valorInicial: '1',
    tipo: 'number',
    placeholder: '1',
  },
  {
    key: 'b',
    etiqueta: 'Extremo derecho (b)',
    ayuda: 'El número más grande del intervalo. Es normal escribir a > b: el programa los ordena solo.',
    requisito: 'Tiene que ser distinto de a.',
    valorInicial: '2',
    tipo: 'number',
    placeholder: '2',
  },
  {
    key: 'tol',
    etiqueta: 'Tolerancia',
    ayuda: 'El programa para cuando el error es menor que este número. Cada dígito de más que pidas, es un paso más.',
    requisito: 'Va entre 0.000001 (6 decimales) y 0.1. Valores muy chicos como 0.0000001 dan un error de redondeo de la máquina.',
    valorInicial: '0.000001',
    tipo: 'number',
    placeholder: '0.000001',
  },
  {
    key: 'maxIter',
    etiqueta: 'Máximo de iteraciones',
    ayuda: 'Una red de seguridad para que el cálculo no se cuelgue nunca.',
    requisito: 'Entre 10 y 200.',
    valorInicial: '100',
    tipo: 'number',
    placeholder: '100',
  },
];

/* ------------------------------------------------------------------ */
/* Datos por defecto                                                   */
/* ------------------------------------------------------------------ */

/**
 * Con qué datos arranca la calculadora. Es el caso clásico del curso:
 * la raíz cúbica de 2, que aparece en la Teoría y en los Ejemplos.
 */
export const DATOS_POR_DEFECTO: DatosCalculo = {
  funcion: 'x^3 - x - 2',
  a: 1,
  b: 2,
  tol: 0.000001,
  maxIter: 100,
};

/**
 * El rango del eje X que se ve por defecto en el gráfico.
 *
 * No es un adorno: si el gráfico mostrara [0, 1] la raíz de 1.521 ni se
 * vería. El rango tiene que cubrir lo que el alumno eligió, así que la
 * calculadora lo recalcula cuando el intervalo se sale de este rango.
 */
export const RANGO_X_POR_DEFECTO = { min: 0, max: 2.5 };