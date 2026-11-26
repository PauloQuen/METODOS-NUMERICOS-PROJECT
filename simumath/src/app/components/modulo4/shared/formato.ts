/**
 * Formato de números del Módulo 4.
 *
 * Se centraliza acá para que la tabla, la respuesta de la calculadora y
 * los textos de la teoría muestren la misma cantidad de decimales. Sin
 * esto, un valor podía aparecer como "0.34375" en la tabla y "0.344" en
 * la conclusión, y el alumno no sabía cuál creer.
 */

/** Número con decimales fijos; "—" si no es finito. */
export function numero(v: number, decimales = 6): string {
  if (!Number.isFinite(v)) return '—';
  return v.toFixed(decimales);
}

/** Número corto y legible, sin ceros de cola. */
export function numeroCorto(v: number, decimales = 6): string {
  if (!Number.isFinite(v)) return '—';
  if (Number.isInteger(v)) return String(v);
  return v.toFixed(decimales).replace(/\.?0+$/, '');
}

/** Número con el signo explícito, para las cuentas de los pasos. */
export function numeroConSigno(v: number, decimales = 6): string {
  const signo = v < 0 ? '−' : '+';
  return `${signo} ${numero(Math.abs(v), decimales)}`;
}

/** Porcentaje con dos decimales y el signo de proporción. */
export function porcentaje(v: number): string {
  return `${numero(v, 2)} %`;
}
