import type {
  CampoCalculadora,
  Columna,
  DatosCalculo,
} from '../../../../../shared/models/metodo.model';

export const SECANTE = {
  key: 'secante' as const,
  nombre: 'Secante',
  familia: 'abiertos' as const,
  resumen:
    'Aproxima la derivada con dos puntos sucesivos para obtener la recta secante y su intersección con el eje X.',
  color: '#0ea5e9',
} as const;

export const COLUMNAS_SECANTE: Columna[] = [
  { key: 'n', label: 'n', align: 'right' },
  { key: 'xPrev', label: 'xₙ₋₁', align: 'right' },
  { key: 'x', label: 'xₙ', align: 'right' },
  { key: 'fx', label: 'f(xₙ)', align: 'right' },
  { key: 'delta', label: '|Δx|', align: 'right' },
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
    key: 'x0',
    etiqueta: 'Semilla x₀',
    ayuda: 'Primera aproximación inicial.',
    requisito: 'Número finito.',
    valorInicial: '1.0',
    tipo: 'number',
    placeholder: '1.0',
  },
  {
    key: 'x1',
    etiqueta: 'Semilla x₁',
    ayuda: 'Segunda aproximación inicial (distinta de x₀).',
    requisito: 'Número finito y distinto de x₀.',
    valorInicial: '2.0',
    tipo: 'number',
    placeholder: '2.0',
  },
  {
    key: 'tol',
    etiqueta: 'Tolerancia',
    ayuda: 'Para cuando |xₙ − xₙ₋₁| < tolerancia.',
    requisito: 'Entre 0.000001 y 0.1',
    valorInicial: '0.000001',
    tipo: 'number',
    placeholder: '0.000001',
  },
  {
    key: 'maxIter',
    etiqueta: 'Máximo de iteraciones',
    ayuda: 'Red de seguridad.',
    requisito: 'Entre 10 y 200.',
    valorInicial: '100',
    tipo: 'number',
    placeholder: '100',
  },
];

export const DATOS_POR_DEFECTO: DatosCalculo = {
  funcion: 'x^3 - x - 2',
  x0: 1.0,
  x1: 2.0,
  tol: 0.000001,
  maxIter: 100,
};

export const RANGO_X_POR_DEFECTO = { min: 0, max: 2.5 };
