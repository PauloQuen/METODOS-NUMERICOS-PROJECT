/**
 * Formas de datos del Módulo 2: sistemas de ecuaciones lineales.
 *
 * ── El paralelo con el Módulo 1 ───────────────────────────────────────
 * `metodo.model.ts` describe cómo es un ejemplo cuando el problema es
 * "encontrar la raíz de f(x) = 0". Este archivo describe cómo es un
 * ejemplo cuando el problema es "resolver A·x = b".
 *
 * La diferencia de fondo: en el Módulo 1 el dato de cálculo es una
 * FUNCIÓN (texto que se parsea y se evalúa). En el Módulo 2 el dato de
 * cálculo es una MATRIZ y un vector, que se leen de un texto pero ya
 * nacen structured: no hay tokenizador de expresiones acá, hay un
 * parser de filas y columnas.
 *
 * Todo lo demás (el texto del ejemplo, los pasos, el algoritmo, el
 * criterio) se apoya en `EjemploBase`, que es común a los dos módulos.
 */

import type { Matriz, SistemaLineal } from '../domain/numerico/matriz';
import type {
  ContenidoTeoria,
  EjemploBase,
  EjercicioBase,
  Rectangulo,
} from './metodo.model';

/* ------------------------------------------------------------------ */
/* Datos de cálculo                                                    */
/* ------------------------------------------------------------------ */

/**
 * Los datos con los que se resuelve un ejemplo o ejercicio del módulo.
 *
 * `x0` solo lo usan los métodos iterativos (Jacobi y Gauss-Seidel): es
 * la semilla desde la que arrancan. Los directos (Gauss y LU) la
 * ignoran, igual que la tolerancia y el tope de iteraciones.
 */
export interface DatosSistema {
  /** Matriz de coeficientes, n×n. */
  A: Matriz;
  /** Lado derecho, con n elementos. */
  b: number[];
  /** Semilla inicial, para los métodos iterativos. */
  x0?: number[];
  /** Tolerancia de parada. */
  tol?: number;
  /** Tope de iteraciones. */
  maxIter?: number;
}

/**
 * Un ejemplo resuelto del Módulo 2.
 *
 * Es un `EjemploBase` (el texto es el mismo en todos los módulos) más
 * los datos con los que se calcula, que acá son una matriz.
 */
export interface EjemploSistema extends EjemploBase {
  calculo: DatosSistema;
}

/** Un ejercicio de autoevaluación del Módulo 2. */
export interface EjercicioSistema extends EjemploSistema, EjercicioBase {
  /** Pista que se muestra junto al botón "Ver solución". */
  pista?: string;
}

/**
 * La teoría completa de un método del Módulo 2.
 *
 * Es la misma de `ContenidoTeoria` pero con los ejemplos del tipo que
 * corresponde: acá los ejemplos se calculan con una MATRIZ, no con una
 * función. Por eso el tipo se deriva del del Módulo 1 en vez de
 * duplicarlo entero: si la teoría cambiara un campo, los dos módulos
 * cambiarían juntos.
 */
export interface ContenidoTeoriaSistema
  extends Omit<ContenidoTeoria, 'ejemploNormal' | 'ejemploCasuistica'> {
  /** Ejemplo numérico de la teoría. */
  ejemploNormal: EjemploSistema;
  /** Ejemplo de casuística de la teoría. */
  ejemploCasuistica: EjemploSistema;
}

/* ------------------------------------------------------------------ */
/* Calculadora                                                         */
/* ------------------------------------------------------------------ */

/** Respuesta que muestra la calculadora de un sistema. */
export interface RespuestaCalculadoraSistema {
  /** ¿Terminó bien? */
  exito: boolean;
  /** La solución, componente por componente. */
  solucion?: number[];
  /** Cuántos pasos o iteraciones hizo. */
  iteraciones?: number;
  /** El error que se logró (el residuo, o el cambio entre iteraciones). */
  error?: string;
  /** Conclusión en palabras. */
  conclusion: string;
}

/* ------------------------------------------------------------------ */
/* Gráfico                                                             */
/* ------------------------------------------------------------------ */

/**
 * Lo que el componente `grafico-sistema` le pasa a la función de dibujo
 * del método.
 *
 * ── El camino de las iteradas ─────────────────────────────────────────
 * Las coordenadas de la iterada NO llegan en un campo propio: se leen
 * de la tabla, de las columnas `x1` y `x2`. Es a propósito, porque así
 * el gráfico y la tabla NUNCA pueden mostrar números distintos: si la
 * tabla dice 1.5, el punto está en 1.5.
 */
export interface ContextoGraficoSistema {
  /** Convierte x del dominio a píxeles horizontales. */
  aX: (x: number) => number;
  /** Convierte y del dominio a píxeles verticales. */
  aY: (y: number) => number;
  /** El sistema que se está resolviendo. */
  sistema: SistemaLineal;
  /** Las filas de la tabla del método. */
  iteraciones: Record<string, number | string>[];
  /** Qué índice se está mostrando (el de los botones de pasos). */
  pasoActual: number;
  /**
   * Rango visible en los dos ejes.
   *
   * Trae los cuatro límites y no solo dos porque la vista es CUADRADA:
   * el eje vertical va de `minY` a `maxY`, que no son `min` y `max`. Un
   * dibujador que quiera colocar una recta o una etiqueta tiene que
   * conocer los cuatro, si no la coloca fuera del recuadro.
   */
  rango: { min: number; max: number; minY: number; maxY: number };
  /** La solución, si ya se encontró. */
  solucion?: number[];
  /**
   * Sistemas EXTRA que el método dibuja encima del plano.
   *
   * ── Para qué existe ──────────────────────────────────────────────────
   * Un método puede necesitar mostrar un sistema que NO es el original:
   * la descomposición LU produce un sistema triangular U·x = y que tiene
   * las MISMAS soluciones pero rectas DISTINTAS. Verlo es lo que hace
   * entender qué hizo la eliminación.
   *
   * Se pasan aparte porque el componente `grafico-sistema` los dibuja con
   * trazo atenuado (son un apoyo, no el objeto principal), y porque así
   * el dibujo propio del método puede usarlos también.
   */
  sistemasExtra?: SistemaLineal[];
  /** Rectángulo donde se dibuja, en píxeles. */
  rect: Rectangulo;
}

/**
 * Cómo dibuja UN método lo suyo sobre el gráfico del sistema.
 *
 * El componente `grafico-sistema` dibuja el plano, la cuadrícula, las
 * rectas de las ecuaciones y el punto solución — que son iguales para
 * todos los métodos. Después llama a esta función, que es lo ÚNICO que
 * sabe del método concreto.
 *
 * Gauss dibuja el pivote que se está usando. Jacobi y Gauss-Seidel
 * dibujan el camino que recorren las iteradas hasta llegar al punto.
 */
export type DibujarSistema = (
  ctx: CanvasRenderingContext2D,
  rect: Rectangulo,
  contexto: ContextoGraficoSistema,
) => void;

/* ------------------------------------------------------------------ */
/* Etiquetas                                                           */
/* ------------------------------------------------------------------ */

/** Los nombres de las incógnitas, para los rótulos del gráfico. */
export const NOMBRES_INCOGNITAS = ['x₁', 'x₂', 'x₃', 'x₄', 'x₅'];

/** El nombre de la incógnita número i (1-based). */
export function nombreIncognita(i: number): string {
  return NOMBRES_INCOGNITAS[i] ?? `x${i + 1}`;
}

/** El nombre del lado derecho: b₁, b₂, ... */
export function nombreLadoDerecho(i: number): string {
  return `b${i + 1}`;
}
