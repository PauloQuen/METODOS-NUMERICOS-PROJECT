/**
 * Formato y lectura de números del Módulo 0.
 *
 * Los alumnos escriben con coma o con punto. La calculadora acepta las
 * dos, pero el contenido y las tablas siempre muestran el formato del
 * portal: punto decimal, menos tipográfico y, para magnitudes muy
 * chicas o muy grandes, notación científica legible.
 */

/** Convierte "1,25" o "1.25" en número. Devuelve null si no es válido. */
export function parsearNumero(texto: string): number | null {
  const limpio = texto.trim().replace(/\s/g, '').replace(',', '.');
  if (!/^[+-]?(\d+(\.\d*)?|\.\d+)([eE][+-]?\d+)?$/.test(limpio)) return null;
  const valor = Number(limpio);
  return Number.isFinite(valor) ? valor : null;
}

/** Convierte un texto en entero. Devuelve null si no es un entero válido. */
export function parsearEntero(texto: string): number | null {
  const valor = parsearNumero(texto);
  return valor !== null && Number.isInteger(valor) ? valor : null;
}

/**
 * Número para mostrar. Hasta `decimales` cifras, sin ceros de relleno.
 * Usa notación científica cuando el número es demasiado chico o grande.
 */
export function numero(valor: number, decimales = 6): string {
  if (!Number.isFinite(valor)) return 'No definido';
  if (Object.is(valor, -0) || valor === 0) return '0';

  const absoluto = Math.abs(valor);
  if (absoluto < 1e-4 || absoluto >= 1e7) {
    const [mantisa, exponente] = valor.toExponential(Math.min(decimales, 10)).split('e');
    const limpia = mantisa.replace(/\.?0+$/, '');
    return `${limpia.replace('-', '−')} × 10^${Number(exponente)}`;
  }

  const texto = valor.toFixed(Math.min(decimales, 12)).replace(/\.?0+$/, '');
  return texto.replace('-', '−');
}

/** Número con signo explícito, para variaciones y errores. */
export function conSigno(valor: number, decimales = 6): string {
  const texto = numero(valor, decimales);
  return valor > 0 ? `+${texto}` : texto;
}

/** Error relativo expresado en porcentaje. */
export function porcentaje(relativo: number, decimales = 4): string {
  if (!Number.isFinite(relativo)) return 'No definido (referencia 0)';
  return `${numero(relativo * 100, decimales)} %`;
}

/** Error relativo sin el signo de porcentaje, para tablas. */
export function relativoTexto(relativo: number, decimales = 6): string {
  if (!Number.isFinite(relativo)) return 'No definido';
  return numero(relativo, decimales);
}

/** Une un número con su unidad sin repetir espacios. */
export function conUnidad(valor: number, unidad: string, decimales = 6): string {
  return `${numero(valor, decimales)}${unidad ? ` ${unidad}` : ''}`;
}
