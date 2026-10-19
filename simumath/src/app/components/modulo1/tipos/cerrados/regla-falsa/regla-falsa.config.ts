import type {
  CampoCalculadora,
  Columna,
  DatosCalculo,
} from '../../../../../shared/models/metodo.model';

/**
 * CONFIGURACIÓN DE REGLA FALSA
 *
 * ── Qué hay en este archivo ───────────────────────────────────────────
 * Los datos FIJOS del método: cómo se llama, qué columnas tiene su tabla,
 * qué campos tiene su calculadora y con qué valores arranca.
 *
 * Lo que NO hay aquí, y es importante: el algoritmo. Eso vive en
 * `regla-falsa.algoritmo.ts`, que es una función pura sin Angular. Acá solo
 * hay declaraciones de datos.
 */

export const REGLA_FALSA = {
  /** La clave con la que se la busca en el registro de métodos. */
  key: 'reglaFalsa',
  /** El nombre que ve el alumno. */
  nombre: 'Regla Falsa',
  /** La familia: métodos que necesitan acotar la raíz en un intervalo. */
  familia: 'cerrados' as const,
  /** Una línea para las tarjetas del índice. */
  resumen: 'Usa una cuerda (secante) para aproximar la raíz en cada paso.' as const,
  /** El color que usa el índice y los subrayados. */
  color: '#8b5cf6',
} as const;

export const COLUMNAS_REGLA_FALSA: Columna[] = [
  { key: 'n', label: 'n', align: 'right' },
  { key: 'a', label: 'a', align: 'right' },
  { key: 'b', label: 'b', align: 'right' },
  { key: 'c', label: 'c (intersección)', align: 'right' },
  { key: 'fc', label: 'f(c)', align: 'right' },
  { key: 'delta', label: '|Δc|', align: 'right' },
];

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
    requisito: 'Necesita f(a) y f(b) con signos distintos. Si no hay cambio de signo, el método puede fallar en este criterio.',
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
    ayuda: 'El programa para cuando el desplazamiento |c_{n} − c_{n−1}| es menor que este número.',
    requisito: 'Va entre 0.000001 (6 decimales) y 0.1.',
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

export const DATOS_POR_DEFECTO: DatosCalculo = {
  funcion: 'x^3 - x - 2',
  a: 1,
  b: 2,
  tol: 0.000001,
  maxIter: 100,
};

export const RANGO_X_POR_DEFECTO = { min: 0, max: 2.5 };
