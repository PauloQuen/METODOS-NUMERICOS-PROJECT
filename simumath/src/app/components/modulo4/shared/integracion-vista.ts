/**
 * Vista común de un cálculo de integración.
 *
 * Trapecio y Simpson producen el mismo tipo de resultado (filas de tabla,
 * h, integral y error opcional). Los bloques de ejemplo y de ejercicio
 * muestran ese resultado sin saber qué método lo generó: reciben esta
 * interfaz. Cada servicio del método la implementa con su propio estado.
 */
export interface IntegracionVista {
  /** La función tal como se escribió (para compilarla en el gráfico). */
  funcionTexto: string;
  /** Intervalo. */
  a: number;
  b: number;
  /** Subintervalos y ancho de cada uno. */
  n: number;
  h: number;
  /** Integral aproximada. */
  integral: number;
  /** Valor exacto, si el contenido lo conoce. */
  exacto?: number;
  /** Error absoluto y relativo (%), si hay valor exacto. */
  errorAbs?: number;
  errorRel?: number;
  /** Filas de la tabla ya formateadas, con la fila Σ al final. */
  filas: Record<string, number | string>[];
}
