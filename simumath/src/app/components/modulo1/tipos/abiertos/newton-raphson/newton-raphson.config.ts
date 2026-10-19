import type {
  CampoCalculadora,
  Columna,
  DatosCalculo,
} from '../../../../../shared/models/metodo.model';

export const NEWTON_RAPHSON = {
  key: 'newton' as const,
  nombre: 'Newton-Raphson',
  familia: 'abiertos' as const,
  resumen: 'Usa la tangente en xₙ para aproximar la raíz en xₙ₊₁.',
  color: '#22c55e',
} as const;

export const COLUMNAS_NEWTON: Columna[] = [
  { key: 'n', label: 'n', align: 'right' },
  { key: 'x', label: 'xᵢ', align: 'right' },
  { key: 'fx', label: 'f(xᵢ)', align: 'right' },
  { key: 'fpx', label: "f'(xᵢ)", align: 'right' },
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
    ayuda: 'Valor inicial. Cuanto más cerca de la raíz, más rápido converge.',
    requisito: 'Número finito. Cerca de la raíz para asegurar convergencia.',
    valorInicial: '1.5',
    tipo: 'number',
    placeholder: '1.5',
  },
  {
    key: 'tol',
    etiqueta: 'Tolerancia',
    ayuda: 'Para cuando |xₙ₊₁ − xₙ| < tolerancia.',
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
  x0: 1.5,
  tol: 0.000001,
  maxIter: 100,
};

export const RANGO_X_POR_DEFECTO = { min: 0, max: 2.5 };
