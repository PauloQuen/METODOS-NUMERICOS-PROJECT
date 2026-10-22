/**
 * Formas de datos del Módulo 2 — Sistemas de Ecuaciones Lineales.
 *
 * Un sistema se representa con la matriz de coeficientes A y el vector
 * de términos independientes b. Los ejemplos y ejercicios guardan esos
 * datos; las tablas y resultados se calculan con el motor del método,
 * nunca se copian a mano.
 */

/** Un sistema lineal A·x = b. */
export interface SistemaLineal {
  A: number[][];
  b: number[];
}

/** Datos con los que se resuelve un ejemplo o una calculadora. */
export interface DatosSistema {
  A: number[][];
  b: number[];
  /** Tolerancia para métodos iterativos. */
  tol?: number;
  /** Máximo de iteraciones para métodos iterativos. */
  maxIter?: number;
  /** Aproximación inicial; si no viene, se usa el vector cero. */
  x0?: number[];
  /** Título corto del sistema, para tablas y gráficos. */
  etiqueta?: string;
}

/* ------------------------------------------------------------------ */
/* Ejemplos y ejercicios                                                */
/* ------------------------------------------------------------------ */

export interface ExtraccionDatosM2 {
  /** Qué se busca en el enunciado, en palabras simples. */
  busqueda: string;
  /** Los datos con sus unidades, uno por renglón. */
  datos: { simbolo: string; valor: string; queEs: string }[];
  /** Cómo se arma el sistema a partir de esos datos. */
  formulacion: string;
}

export interface EjemploModulo2 {
  id: string;
  titulo: string;
  tipo: 'numerico' | 'casuistica';

  /** Enunciado (casuística) o el sistema planteado (numérico). */
  enunciado?: string;
  /** Qué se pide, en una línea. */
  planteamiento: string;
  /** Los parámetros con los que se resuelve, para que se vean. */
  parametros: { etiqueta: string; valor: string }[];

  /** Solo en casuísticas: cómo se pasa del enunciado al sistema. */
  extraccion?: ExtraccionDatosM2;

  interpretacion: string;
  pasos: string[];
  algoritmo: string;
  criterio: string;
  conclusion: string;

  /** Con qué datos se calcula la tabla y el resultado. */
  calculo: DatosSistema;
}

export interface EjercicioModulo2 extends EjemploModulo2 {
  pista?: string;
}

/* ------------------------------------------------------------------ */
/* Recursos y teoría                                                    */
/* ------------------------------------------------------------------ */

export interface RecursoExternoM2 {
  titulo: string;
  url: string;
  tipo: 'video' | 'lectura' | 'interactivo';
  descripcion: string;
}

export interface InfoMetodoM2 {
  formula: string;
  criterios: { nombre: string; explicacion: string }[];
  pasos: string[];
  ventajas: string[];
  limitaciones: string[];
}

export interface TeoriaModulo2 {
  concepto: string;
  fundamento: string;
  cuandoFalla: string;
  precision: string;
  videoUrl?: string;
  recursos: RecursoExternoM2[];
  algoritmo: InfoMetodoM2;
  ejemploNormal: EjemploModulo2;
  ejemploCasuistica: EjemploModulo2;
}

/* ------------------------------------------------------------------ */
/* Calculadora                                                          */
/* ------------------------------------------------------------------ */

export interface CampoCalculadoraM2 {
  key: string;
  etiqueta: string;
  ayuda: string;
  requisito?: string;
  valorInicial: string;
  tipo: 'text' | 'number';
  placeholder?: string;
}

export interface RespuestaCalculadoraM2 {
  exito: boolean;
  etiquetaResultado?: string;
  resultado?: string;
  etiquetaBondad?: string;
  bondad?: string;
  conclusion: string;
}
