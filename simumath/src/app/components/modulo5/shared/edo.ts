import { FuncionEvaluable } from '../../../shared/domain/numerico/evaluador-funciones';
import { ErrorExpresion } from '../../../shared/domain/numerico/tokenizador';
import type { CampoCalculadoraM5, RespuestaCalculadoraM5 } from '../modelos/modulo5.model';
import type { FilaEuler, ResultadoEuler } from '../tipos/edo-clasicos/euler/euler.algoritmo';
import type { FilaRk4, ResultadoRk4 } from '../tipos/edo-clasicos/rk4/rk4.algoritmo';

/* ------------------------------------------------------------------ */
/* Formato                                                             */
/* ------------------------------------------------------------------ */

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

/** Porcentaje con dos decimales. */
export function porcentaje(v: number): string {
  return `${numero(v, 2)} %`;
}

/* ------------------------------------------------------------------ */
/* Compilación segura                                                  */
/* ------------------------------------------------------------------ */

/** Compila f(t, y). Devuelve el error en español si el texto no sirve. */
export function compilarF(texto: string): {
  f?: (t: number, y: number) => number;
  error?: string;
} {
  try {
    const compilada = FuncionEvaluable.compilar(texto);
    return { f: (t, y) => compilada.evaluarEn(t, y) };
  } catch (error) {
    return {
      error:
        error instanceof ErrorExpresion
          ? error.message
          : 'No se pudo interpretar f(t, y). Revisá la sintaxis.',
    };
  }
}

/** Compila la solución exacta y(t), si se escribió. */
export function compilarExacta(texto?: string): ((t: number) => number) | undefined {
  const limpio = (texto ?? '').trim();
  if (limpio === '') return undefined;
  try {
    const compilada = FuncionEvaluable.compilar(limpio);
    return (t: number) => compilada.evaluar(t);
  } catch {
    return undefined;
  }
}

/* ------------------------------------------------------------------ */
/* Filas formateadas                                                   */
/* ------------------------------------------------------------------ */

export function filasDeEuler(r: ResultadoEuler): Record<string, number | string>[] {
  return r.filas.map((fila: FilaEuler) => ({
    n: fila.n,
    t: typeof fila.t === 'number' ? numero(fila.t) : fila.t,
    y: typeof fila.y === 'number' ? numero(fila.y) : fila.y,
    k1: typeof fila.k1 === 'number' ? numero(fila.k1) : fila.k1,
    exacta: typeof fila.exacta === 'number' ? numero(fila.exacta) : '',
    error: typeof fila.error === 'number' ? numero(fila.error) : '',
  }));
}

export function filasDeRk4(r: ResultadoRk4): Record<string, number | string>[] {
  return r.filas.map((fila: FilaRk4) => ({
    n: fila.n,
    t: typeof fila.t === 'number' ? numero(fila.t) : fila.t,
    y: typeof fila.y === 'number' ? numero(fila.y) : fila.y,
    k1: typeof fila.k1 === 'number' ? numero(fila.k1) : fila.k1,
    k2: typeof fila.k2 === 'number' ? numero(fila.k2) : fila.k2,
    k3: typeof fila.k3 === 'number' ? numero(fila.k3) : fila.k3,
    k4: typeof fila.k4 === 'number' ? numero(fila.k4) : fila.k4,
    exacta: typeof fila.exacta === 'number' ? numero(fila.exacta) : '',
    error: typeof fila.error === 'number' ? numero(fila.error) : '',
  }));
}

/* ------------------------------------------------------------------ */
/* Gráfico                                                             */
/* ------------------------------------------------------------------ */

/**
 * Rango vertical para el gráfico: incluye la aproximación y la solución
 * exacta. Sin esto, cuando no hay exacta el gráfico usaría −10…10 y la
 * curva quedaría aplastada.
 */
export function rangoYDe(
  filas: Record<string, number | string>[],
  exacta?: (t: number) => number,
): { min: number; max: number } {
  let min = Infinity;
  let max = -Infinity;
  const considerar = (v: number) => {
    if (!Number.isFinite(v) || Math.abs(v) > 1e12) return;
    if (v < min) min = v;
    if (v > max) max = v;
  };

  for (const fila of filas) {
    considerar(Number(fila['y']));
    considerar(Number(fila['exacta']));
  }

  // Muestreo de la exacta entre el primer y el último t, para que la curva
  // no se salga del recuadro.
  if (exacta && filas.length > 1) {
    const t0 = Number(filas[0]['t']);
    const t1 = Number(filas[filas.length - 1]['t']);
    for (let i = 0; i <= 60; i++) {
      const t = t0 + ((t1 - t0) * i) / 60;
      considerar(exacta(t));
    }
  }

  if (!Number.isFinite(min) || !Number.isFinite(max)) return { min: -10, max: 10 };
  if (min === max) return { min: min - 1, max: max + 1 };
  const margen = (max - min) * 0.12;
  return { min: min - margen, max: max + margen };
}

/* ------------------------------------------------------------------ */
/* Respuesta de la calculadora                                         */
/* ------------------------------------------------------------------ */

export function armarRespuestaEdo(
  metodo: 'Euler' | 'RK4',
  datos: { t0: number; tFin: number; h: number },
  r: { pasos: number; yFinal: number; exactaFinal?: number; errorFinal?: number; errorRel?: number },
): RespuestaCalculadoraM5 {
  const tieneExacta = r.exactaFinal !== undefined && r.errorFinal !== undefined;

  const conclusion =
    `${metodo}: en ${r.pasos} pasos de h = ${numero(datos.h, 6)} se llega a t = ${numero(datos.tFin, 6)} ` +
    `con y ≈ ${numero(r.yFinal, 8)}.` +
    (tieneExacta
      ? ` La solución exacta vale ${numero(r.exactaFinal!, 8)}: error absoluto ${numero(r.errorFinal!, 8)} ` +
        `(${porcentaje(r.errorRel ?? 0)}).`
      : ' Ingresá la solución exacta si querés medir el error.');

  return {
    exito: true,
    etiquetaResultado: 'y(t final) ≈',
    resultado: numero(r.yFinal, 8),
    etiquetaBondad: tieneExacta ? 'Error absoluto' : 'Cantidad de pasos',
    bondad: tieneExacta ? `${numero(r.errorFinal!, 8)} (${porcentaje(r.errorRel ?? 0)})` : String(r.pasos),
    conclusion,
  };
}

/* ------------------------------------------------------------------ */
/* Campos comunes de la calculadora                                    */
/* ------------------------------------------------------------------ */

export function camposEdo(valores: {
  funcion: string;
  t0: string;
  y0: string;
  h: string;
  tFin: string;
}): CampoCalculadoraM5[] {
  return [
    {
      key: 'funcion',
      etiqueta: 'Función f(t, y)',
      ayuda: 'Usá t e y: t + y, -2*y, y*cos(t), t^2 - y. Funciones: sin, cos, exp, ln, sqrt.',
      requisito: 'Ej: t + y, -2*y, y',
      valorInicial: valores.funcion,
      tipo: 'text',
      placeholder: 't + y',
    },
    {
      key: 't0',
      etiqueta: 'Instante inicial t₀',
      ayuda: 'Dónde arranca la solución.',
      valorInicial: valores.t0,
      tipo: 'number',
      placeholder: '0',
    },
    {
      key: 'y0',
      etiqueta: 'Valor inicial y₀ = y(t₀)',
      ayuda: 'Condición inicial del problema.',
      valorInicial: valores.y0,
      tipo: 'number',
      placeholder: '1',
    },
    {
      key: 'h',
      etiqueta: 'Paso h',
      ayuda: 'Distancia entre pasos. Más chico = más preciso, pero más lento.',
      requisito: 'Mayor que 0.',
      valorInicial: valores.h,
      tipo: 'number',
      placeholder: '0.1',
    },
    {
      key: 'tFin',
      etiqueta: 'Instante final',
      ayuda: 'Hasta dónde integrar. Tiene que ser mayor que t₀.',
      valorInicial: valores.tFin,
      tipo: 'number',
      placeholder: '1',
    },
    {
      key: 'exacta',
      etiqueta: 'Solución exacta y(t) (opcional)',
      ayuda: 'Si la conocés, se calcula el error en cada paso y la convergencia.',
      requisito: 'Dejala vacía si no la conocés.',
      valorInicial: '',
      tipo: 'text',
      placeholder: 'exp(t)',
    },
  ];
}
