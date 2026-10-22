import type { Punto } from '../modelos/modulo3.model';

/**
 * Lectura y escritura de la tabla de datos como texto.
 *
 * ── Por qué los puntos se escriben en un solo campo ──────────────────
 * La calculadora necesita pares (x, y) y la cantidad la decide el alumno:
 * pueden ser 3 o 12. Un formulario con cantidad fija de casillas no
 * sirve, y uno dinámico agrega mucha interfaz para algo que se resuelve
 * escribiendo.
 *
 * El formato que acepta `parsearPuntos` es amplio a propósito, porque el
 * alumno va a pegar datos de cualquier lado:
 *
 *   "1,0; 2,0.6931; 3,1.0986"
 *   "1 0\n2 0.6931\n3 1.0986"
 *   "(1, 0), (2, 0.6931), (3, 1.0986)"
 *
 * Siempre se lee con mensajes en español: si algo no se entiende, se
 * devuelve `error` en vez de lanzar, para que la calculadora explique
 * el problema en pantalla.
 */

/** Separadores entre pares: punto y coma, salto de línea o un nuevo "(". */
const SEPARADOR_PARES = /[;\n]+|\)\s*,?\s*\(/;

/** Separa la x de la y dentro de un par: coma, espacio o tabulador. */
const SEPARADOR_XY = /[,\s]+/;

/**
 * Convierte el texto del alumno en una lista de puntos.
 * Devuelve `error` (texto) si algo no se pudo leer.
 */
export function parsearPuntos(texto: string): { puntos: Punto[]; error?: string } {
  const limpio = (texto ?? '').trim();
  if (limpio === '') {
    return { puntos: [], error: 'Escribí al menos 2 puntos con el formato x, y.' };
  }

  // Se sacan los paréntesis de los extremos para no depender de ellos.
  const normalizado = limpio.replace(/[()]/g, '').replace(/\s+/g, ' ').trim();
  const partes = normalizado.split(SEPARADOR_PARES).map((p) => p.trim()).filter((p) => p !== '');

  const puntos: Punto[] = [];
  for (const parte of partes) {
    const trozos = parte.split(SEPARADOR_XY).filter((t) => t !== '');
    if (trozos.length !== 2) {
      return {
        puntos: [],
        error: `No entendí el par "${parte}". Escribí cada punto como x, y (por ejemplo 2, 5).`,
      };
    }
    const x = Number(trozos[0]);
    const y = Number(trozos[1]);
    if (!Number.isFinite(x) || !Number.isFinite(y)) {
      return {
        puntos: [],
        error: `"${parte}" no tiene dos números válidos. Revisá los puntos.`,
      };
    }
    puntos.push({ x, y });
  }

  if (puntos.length < 2) {
    return { puntos: [], error: 'Se necesitan al menos 2 puntos.' };
  }

  return { puntos };
}

/** Escribe la tabla como texto, para precargar el campo de la calculadora. */
export function formatearPuntos(puntos: readonly Punto[]): string {
  return puntos
    .map((p) => `${formatearNumero(p.x)}, ${formatearNumero(p.y)}`)
    .join('; ');
}

/** Número corto y legible, sin ceros de cola. */
export function formatearNumero(v: number): string {
  if (!Number.isFinite(v)) return '—';
  if (Number.isInteger(v)) return String(v);
  return v.toFixed(6).replace(/\.?0+$/, '');
}

/**
 * Rango del eje x que conviene mostrar para un conjunto de puntos:
 * el mínimo y el máximo con un margen, y siempre incluyendo el punto de
 * evaluación si cae afuera (caso de una extrapolación).
 */
export function rangoParaPuntos(
  puntos: readonly Punto[],
  evaluarEn?: number,
): { min: number; max: number } {
  if (puntos.length === 0) return { min: -5, max: 5 };

  const xs = puntos.map((p) => p.x);
  if (evaluarEn !== undefined && Number.isFinite(evaluarEn)) xs.push(evaluarEn);

  let min = Math.min(...xs);
  let max = Math.max(...xs);
  if (min === max) {
    min -= 1;
    max += 1;
  }
  const margen = (max - min) * 0.15;
  return { min: min - margen, max: max + margen };
}
