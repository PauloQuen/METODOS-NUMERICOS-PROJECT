import type {
  CampoCalculadora,
  Columna,
  DatosCalculo,
} from '../../../../../shared/models/metodo.model';

/**
 * Configuración de la FÓRMULA DE CARDANO.
 *
 * ── Lo que este método comparte y lo que no ──────────────────────────
 * Pide UN solo dato (la función), no tolerancia ni iteraciones ni
 * semilla: es una resolución cerrada. Por eso `CAMPOS_CALCULADORA` es
 * una lista de un elemento y `DATOS_POR_DEFECTO` solo trae `funcion`.
 * Los métodos iterativos necesitan tope y tolerancia; Cardano no, y
 * esconder esos campos es parte del mensaje didáctico: acá no se itera.
 *
 * ── Las columnas de la tabla ─────────────────────────────────────────
 * No son iteraciones (n, x, Δx): son los PASOS del desarrollo
 * algebraico. La última columna, `valor`, es la clave de todo el
 * sistema: el registro la declara como `columnaValor` y es donde el
 * gráfico busca las raíces (las filas sin raíz llevan '—', que el
 * dibujo ignora).
 */
export const CARDANO = {
  key: 'cardano' as const,
  nombre: 'Fórmula de Cardano',
  familia: 'polinomios' as const,
  resumen:
    'Resuelve la cúbica a·x³ + b·x² + c·x + d = 0 en forma cerrada: la ' +
    'reduce a su forma deprimida con el cambio x = t − b/(3a) y aplica la ' +
    'fórmula de radicales — o la trigonométrica de Viète cuando el ' +
    'discriminante es negativo. Cero iteraciones: la respuesta sale de ' +
    'una sola cuenta.',
  color: '#ec4899',
} as const;

export const COLUMNAS_CARDANO: Columna[] = [
  { key: 'paso', label: 'Paso', align: 'left' },
  { key: 'etapa', label: 'Etapa', align: 'left' },
  { key: 'detalle', label: 'Detalle', align: 'left' },
  { key: 'valor', label: 'Valor', align: 'right' },
];

export const CAMPOS_CALCULADORA: CampoCalculadora[] = [
  {
    key: 'funcion',
    etiqueta: 'Función f(x)',
    ayuda:
      'La cúbica igualada a cero, con x como variable. Se admiten ^ para ' +
      'potencias. Tiene que ser de grado 3: si es de grado menor, de grado ' +
      'mayor o no es polinomio (eˣ, sen(x)), el método lo detecta y avisa.',
    requisito: 'Grado 3: a·x³ + b·x² + c·x + d = 0',
    valorInicial: 'x^3 - x - 2',
    tipo: 'text',
    placeholder: 'x^3 - x - 2',
  },
];

export const DATOS_POR_DEFECTO: DatosCalculo = {
  funcion: 'x^3 - x - 2',
};

export const RANGO_X_POR_DEFECTO = { min: -1, max: 4 };
