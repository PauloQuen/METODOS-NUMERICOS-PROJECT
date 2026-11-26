/**
 * Vista común de un cálculo de EDO.
 *
 * Euler y RK4 producen el mismo tipo de resultado (pasos, valor final y
 * error opcional). Los bloques de ejemplo y de ejercicio muestran ese
 * resultado sin saber qué método lo generó.
 */
export interface EdoVista {
  /** f(t, y) tal como se escribió. */
  funcionTexto: string;
  /** Solución exacta tal como se escribió, si hay. */
  exactaTexto?: string;
  t0: number;
  y0: number;
  h: number;
  tFin: number;
  pasos: number;
  yFinal: number;
  exactaFinal?: number;
  errorFinal?: number;
  errorRel?: number;
  /** Filas de la tabla ya formateadas (puede estar recortada). */
  filas: Record<string, number | string>[];
  /** Cuántas filas se omitieron de la tabla por ser demasiadas. */
  filasOcultas?: number;
}
