import type {
  CampoCalculadora,
  Columna,
  DatosCalculo,
} from '../../../../../shared/models/metodo.model';

export const PUNTO_FIJO = {
  key: 'puntoFijo' as const,
  nombre: 'Punto Fijo',
  familia: 'abiertos' as const,
  resumen:
    'Reescribe f(x) = 0 como x = g(x) e itera xₙ₊₁ = g(xₙ) hasta que el punto deja de moverse. El gráfico dibuja la telaraña contra la diagonal y = x.',
  color: '#f59e0b',
} as const;

export const COLUMNAS_PUNTO_FIJO: Columna[] = [
  { key: 'n', label: 'n', align: 'right' },
  { key: 'x', label: 'xᵢ', align: 'right' },
  { key: 'gx', label: 'g(xᵢ)', align: 'right' },
  { key: 'delta', label: '|Δx|', align: 'right' },
];

export const CAMPOS_CALCULADORA: CampoCalculadora[] = [
  {
    key: 'funcion',
    etiqueta: 'Función g(x)',
    ayuda:
      'La reescritura ya hecha: f(x) = 0 como x = g(x). Usá x como variable. ' +
      'Se admiten ^ para potencias, exp(), ln(), sen(), cos(), log() y sqrt().',
    requisito: 'Ej: cos(x) o (x + 2)^(1/3)',
    valorInicial: '(x + 2)^(1/3)',
    tipo: 'text',
    placeholder: '(x + 2)^(1/3)',
  },
  {
    key: 'x0',
    etiqueta: 'Semilla x₀',
    ayuda: 'Primera aproximación inicial.',
    requisito: 'Número finito.',
    valorInicial: '1.5',
    tipo: 'number',
    placeholder: '1.5',
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
    ayuda: 'Red de seguridad: una reescritura mala puede no converger nunca.',
    requisito: 'Entre 10 y 200.',
    valorInicial: '100',
    tipo: 'number',
    placeholder: '100',
  },
];

export const DATOS_POR_DEFECTO: DatosCalculo = {
  funcion: '(x + 2)^(1/3)',
  x0: 1.5,
  tol: 0.000001,
  maxIter: 100,
};

export const RANGO_X_POR_DEFECTO = { min: 0, max: 2.5 };