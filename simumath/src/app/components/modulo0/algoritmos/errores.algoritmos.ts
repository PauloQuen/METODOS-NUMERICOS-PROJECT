/**
 * Algoritmos del Módulo 0 — Errores numéricos.
 *
 * Son funciones puras: reciben números, devuelven números y no saben
 * nada de Angular. Así se pueden probar sin montar un componente y la
 * calculadora solo se ocupa de leer los campos y armar la respuesta.
 *
 * Se usan errores (`throw`) para las entradas imposibles porque la
 * calculadora ya valida antes de llamar; si algo se escapa, el mensaje
 * es concreto y en español.
 */

import { numero, porcentaje, relativoTexto } from './formato';

/* ------------------------------------------------------------------ */
/* Cifras significativas                                              */
/* ------------------------------------------------------------------ */

export interface ResultadoCifras {
  /** Valor original. */
  valor: number;
  /** Valor redondeado a n cifras significativas. */
  redondeado: number;
  cifras: number;
  errorAbsoluto: number;
  errorRelativo: number;
  errorPorcentual: number;
}

/**
 * Redondea a n cifras significativas y mide cuánto se movió el valor.
 * `toPrecision` redondea al par más cercano; para el material alcanza y
 * es el comportamiento esperado de una calculadora.
 */
export function redondearCifrasSignificativas(valor: number, cifras: number): ResultadoCifras {
  if (!Number.isFinite(valor)) throw new Error('El valor debe ser un número finito.');
  if (!Number.isInteger(cifras)) {
    throw new Error('La cantidad de cifras significativas debe ser un entero entre 1 y 15.');
  }
  if (cifras < 1 || cifras > 15) {
    throw new Error('La cantidad de cifras significativas debe estar entre 1 y 15.');
  }

  const redondeado = Number(valor.toPrecision(cifras));
  const errorAbsoluto = Math.abs(valor - redondeado);
  const errorRelativo = valor === 0 ? Number.NaN : errorAbsoluto / Math.abs(valor);

  return {
    valor,
    redondeado,
    cifras,
    errorAbsoluto,
    errorRelativo,
    errorPorcentual: errorRelativo * 100,
  };
}

/* ------------------------------------------------------------------ */
/* Error absoluto, relativo y porcentual                              */
/* ------------------------------------------------------------------ */

export interface ResultadoErrores {
  /** Valor de referencia o "verdadero". */
  verdadero: number;
  /** Valor medido o aproximado. */
  aproximado: number;
  errorAbsoluto: number;
  /** NaN cuando el valor verdadero es cero: no hay escala para normalizar. */
  errorRelativo: number;
  errorPorcentual: number;
}

/**
 * Compara una aproximación con el valor de referencia.
 *
 * El error relativo divide por |verdadero|. Si la referencia es 0, el
 * cociente no está definido y se devuelve NaN en vez de Infinity: la
 * interfaz muestra "No definido" y explica por qué.
 */
export function calcularErrores(verdadero: number, aproximado: number): ResultadoErrores {
  if (!Number.isFinite(verdadero) || !Number.isFinite(aproximado)) {
    throw new Error('Los dos valores deben ser números finitos.');
  }

  const errorAbsoluto = Math.abs(verdadero - aproximado);
  const errorRelativo = verdadero === 0 ? Number.NaN : errorAbsoluto / Math.abs(verdadero);

  return {
    verdadero,
    aproximado,
    errorAbsoluto,
    errorRelativo,
    errorPorcentual: errorRelativo * 100,
  };
}

/* ------------------------------------------------------------------ */
/* Serie de Taylor de e^x                                             */
/* ------------------------------------------------------------------ */

export interface TerminoTaylor {
  k: number;
  termino: number;
  acumulado: number;
  errorAbsoluto: number;
}

export interface ResultadoTaylor {
  x: number;
  centro: number;
  /** Grado del último término incluido: la suma va de k = 0 a n. */
  grado: number;
  suma: number;
  real: number;
  errorAbsoluto: number;
  errorRelativo: number;
  /** Cota del resto de Lagrange para e^x en el intervalo. */
  cotaResto: number;
  terminos: TerminoTaylor[];
}

function factorial(k: number): number {
  let resultado = 1;
  for (let i = 2; i <= k; i += 1) resultado *= i;
  return resultado;
}

/**
 * Aproxima e^x con el polinomio de Taylor centrado en `centro` y grado
 * `grado`, y calcula la cota de Lagrange del resto.
 *
 * Para e^x todas las derivadas son e^t; en el intervalo entre `centro`
 * y `x` el máximo de e^t está en el extremo derecho del intervalo. Por
 * eso la cota es e^max(centro,x) · |x-centro|^(n+1) / (n+1)!.
 */
export function taylorExp(x: number, centro: number, grado: number): ResultadoTaylor {
  if (!Number.isFinite(x) || !Number.isFinite(centro)) {
    throw new Error('x y el centro deben ser números finitos.');
  }
  if (!Number.isInteger(grado) || grado < 0 || grado > 12) {
    throw new Error('El grado debe ser un entero entre 0 y 12.');
  }

  const h = x - centro;
  const terminos: TerminoTaylor[] = [];
  let termino = 1;
  let suma = 1;

  for (let k = 0; k <= grado; k += 1) {
    if (k > 0) {
      termino *= h / k;
      suma += termino;
    }
    terminos.push({
      k,
      termino,
      acumulado: suma,
      errorAbsoluto: Math.abs(Math.exp(x) - suma),
    });
  }

  const real = Math.exp(x);
  const errorAbsoluto = Math.abs(real - suma);
  const errorRelativo = errorAbsoluto / Math.abs(real);
  const cotaResto =
    (Math.exp(Math.max(x, centro)) * Math.pow(Math.abs(h), grado + 1)) / factorial(grado + 1);

  return {
    x,
    centro,
    grado,
    suma,
    real,
    errorAbsoluto,
    errorRelativo,
    cotaResto,
    terminos,
  };
}

/* ------------------------------------------------------------------ */
/* Propagación de errores                                             */
/* ------------------------------------------------------------------ */

export type OperacionPropagacion = 'suma' | 'producto' | 'cociente';

export interface ResultadoPropagacion {
  operacion: OperacionPropagacion;
  x: number;
  dx: number;
  y: number;
  dy: number;
  /** Resultado de la operación con los valores centrales. */
  f: number;
  errorAbsoluto: number;
  errorRelativo: number;
  errorPorcentual: number;
}

/** Acepta las palabras que un alumno puede escribir en el campo. */
export function parsearOperacion(texto: string): OperacionPropagacion | null {
  const limpio = texto.trim().toLowerCase();
  if (['suma', 'sumar', '+', 'resta', 'restar', '−', '-'].includes(limpio)) return 'suma';
  if (['producto', 'multiplicacion', 'multiplicación', 'multiplicar', '×', '*'].includes(limpio)) {
    return 'producto';
  }
  if (['cociente', 'division', 'división', 'dividir', '÷', '/'].includes(limpio)) return 'cociente';
  return null;
}

/**
 * Propagación de primer orden con derivadas parciales.
 *
 * - suma:     f = x + y,  Δf = Δx + Δy
 * - producto: f = x · y,  Δf = |y|Δx + |x|Δy
 * - cociente: f = x / y,  Δf = Δx/|y| + |x|Δy/y²
 *
 * Los errores de entrada se toman como cotas positivas. La resta se
 * agrupa con la suma porque su derivada parcial también vale 1 (y el
 * error absoluto no resta: se suma).
 */
export function propagarError(
  operacion: OperacionPropagacion,
  x: number,
  dx: number,
  y: number,
  dy: number,
): ResultadoPropagacion {
  if (![x, dx, y, dy].every(Number.isFinite)) {
    throw new Error('Los valores y sus errores deben ser números finitos.');
  }
  if (dx < 0 || dy < 0) throw new Error('Los errores absolutos no pueden ser negativos.');

  let f: number;
  let errorAbsoluto: number;

  if (operacion === 'suma') {
    f = x + y;
    errorAbsoluto = dx + dy;
  } else if (operacion === 'producto') {
    f = x * y;
    errorAbsoluto = Math.abs(y) * dx + Math.abs(x) * dy;
  } else {
    if (y === 0) throw new Error('No se puede dividir por cero: y debe ser distinto de 0.');
    f = x / y;
    errorAbsoluto = dx / Math.abs(y) + (Math.abs(x) / (y * y)) * dy;
  }

  const errorRelativo = f === 0 ? Number.NaN : errorAbsoluto / Math.abs(f);

  return {
    operacion,
    x,
    dx,
    y,
    dy,
    f,
    errorAbsoluto,
    errorRelativo,
    errorPorcentual: errorRelativo * 100,
  };
}

/** Texto corto de la operación, para conclusiones y tablas. */
export function nombreOperacion(operacion: OperacionPropagacion): string {
  if (operacion === 'suma') return 'suma';
  if (operacion === 'producto') return 'producto';
  return 'cociente';
}

/** Resultado principal y detalle listos para el panel de calculadora. */
export function lecturaDeError(relativo: number): string {
  return Number.isFinite(relativo)
    ? `${porcentaje(relativo)} de error relativo (${relativoTexto(relativo)}).`
    : 'El error relativo no está definido porque el valor de referencia es 0.';
}

/** Ayuda para armar una tabla de una sola fila sin repetir el formato. */
export function filaDeError(
  etiqueta: string,
  valor: number,
  errorAbsoluto: number,
  errorRelativo: number,
  unidad = '',
): Record<string, number | string> {
  return {
    magnitud: etiqueta,
    valor: `${numero(valor)}${unidad ? ` ${unidad}` : ''}`,
    errorAbs: `${numero(errorAbsoluto)}${unidad ? ` ${unidad}` : ''}`,
    errorRel: relativoTexto(errorRelativo),
  };
}
