/**
 * Formas de datos del Módulo 5 — Ecuaciones diferenciales ordinarias.
 *
 * ── Qué cambia respecto del Módulo 4 ─────────────────────────────────
 * Acá no se integra una función conocida f(x): se resuelve un problema de
 * valor inicial y' = f(t, y), y(t₀) = y₀, avanzando paso a paso. Los datos
 * de cálculo son el instante inicial, el valor inicial, el paso h y el
 * instante final. La función depende de DOS variables, por eso el texto se
 * compila con `FuncionEvaluable.evaluarEn(t, y)`.
 */

import type { RecursoTeoria } from '../../../shared/models/metodo.model';

/* ------------------------------------------------------------------ */
/* Datos de entrada                                                    */
/* ------------------------------------------------------------------ */

export interface DatosModulo5 {
  /** Expresión de f(t, y), como la escribe el alumno: "t + y", "-2*y". */
  funcion: string;
  /** Instante inicial t₀. */
  t0: number;
  /** Valor inicial y(t₀) = y₀. */
  y0: number;
  /** Paso de integración. */
  h: number;
  /** Instante final. */
  tFin: number;
  /**
   * Solución exacta y(t), opcional. Es un texto porque se compila con el
   * mismo evaluador seguro; sirve para medir el error en cada paso.
   */
  exacta?: string;
  /** Título corto para el gráfico. */
  etiqueta?: string;
}

/* ------------------------------------------------------------------ */
/* Ejemplos y ejercicios                                               */
/* ------------------------------------------------------------------ */

export interface ExtraccionDatosM5 {
  busqueda: string;
  datos: { simbolo: string; valor: string; queEs: string }[];
  formulacion: string;
}

export interface EjemploModulo5 {
  id: string;
  titulo: string;
  tipo: 'numerico' | 'casuistica';

  enunciado?: string;
  planteamiento: string;
  parametros: { etiqueta: string; valor: string }[];

  extraccion?: ExtraccionDatosM5;

  interpretacion: string;
  pasos: string[];
  algoritmo: string;
  criterio: string;
  conclusion: string;

  /** Fórmula del paso, en Unicode (compatibilidad / respaldo). */
  formula?: string;
  /** Fórmula del paso en TeX, para KaTeX. */
  formulaTex?: string;

  calculo: DatosModulo5;
}

export interface OpcionCuestionarioM5 {
  id: string;
  texto: string;
}

export interface PreguntaCuestionarioM5 {
  id: string;
  tipo: 'opcion-multiple' | 'verdadero-falso';
  enunciado: string;
  opciones: OpcionCuestionarioM5[];
  correcta: string;
  explicacion: string;
}

export interface EjercicioModulo5 extends EjemploModulo5 {
  pista?: string;
  cuestionario?: PreguntaCuestionarioM5[];
}

/* ------------------------------------------------------------------ */
/* Teoría                                                              */
/* ------------------------------------------------------------------ */

export interface InfoMetodoM5 {
  formula: string;
  formulaTex?: string;
  criterios: { nombre: string; explicacion: string }[];
  pasos: string[];
  ventajas: string[];
  limitaciones: string[];
  recomendaciones: string[];
}

export interface TeoriaModulo5 {
  concepto: string;
  fundamento: string;
  cuandoFalla: string;
  /** Estabilidad y orden: la tercera idea. */
  precision: string;
  videoUrl?: string;
  recursos: RecursoTeoria[];
  algoritmo: InfoMetodoM5;
  ejemploNormal: EjemploModulo5;
  ejemploCasuistica: EjemploModulo5;
}

/* ------------------------------------------------------------------ */
/* Calculadora                                                         */
/* ------------------------------------------------------------------ */

export interface CampoCalculadoraM5 {
  key: string;
  etiqueta: string;
  ayuda: string;
  requisito?: string;
  valorInicial: string;
  tipo: 'text' | 'number';
  placeholder?: string;
}

export interface RespuestaCalculadoraM5 {
  exito: boolean;
  resultado?: string;
  etiquetaResultado?: string;
  bondad?: string;
  etiquetaBondad?: string;
  conclusion: string;
}
