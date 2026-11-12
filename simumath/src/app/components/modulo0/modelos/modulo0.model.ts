/**
 * Formas de datos del Módulo 0 — Errores numéricos.
 *
 * ── Por qué no se reutiliza el modelo del Módulo 3 ───────────────────
 * El Módulo 3 recibe TABLAS de puntos (xᵢ, yᵢ) y construye un modelo.
 * El Módulo 0 recibe ESCALARES (un valor medido, una tolerancia, un
 * número de cifras) y devuelve cuentas de error. Son problemas
 * distintos, así que las cajas de datos son distintas.
 *
 * Lo que SÍ se comparte es la presentación: `ui-card`, `iteration-table`,
 * el panel de calculadora, los paneles de cuestionario/resolución y el
 * servicio de desbloqueo de la autoevaluación mejorada. Este módulo no
 * dibuja gráficos: un error es un número, no una curva.
 */

import type { Columna } from '../../../shared/models/metodo.model';
import type {
  DesbloqueoConfig,
  PreguntaCuestionarioAuto,
  ResolucionVerificable,
  RecursoTeoria,
} from '../../../shared/models/metodo.model';
import type { FormatoRespuesta } from '../../../shared/autoevaluacion-mejorada/respuesta.strategy';

/* ------------------------------------------------------------------ */
/* Ejemplos y ejercicios                                               */
/* ------------------------------------------------------------------ */

/** Cómo se llega desde el enunciado a los datos (casuísticas). */
export interface ExtraccionDatosError {
  /** Qué se busca en el enunciado, en palabras simples. */
  busqueda: string;
  /** Los datos con sus unidades, uno por renglón. */
  datos: { simbolo: string; valor: string; queEs: string }[];
  /** Cómo se arma la cuenta a partir de esos datos. */
  formulacion: string;
}

/** Una tabla de cuentas (no de iteraciones): paso, expresión y resultado. */
export interface TablaCalculoError {
  columnas: Columna[];
  filas: Record<string, number | string>[];
}

/**
 * Un ejemplo resuelto del Módulo 0.
 *
 * `tipo` distingue el ejemplo numérico (los datos ya están dados) de la
 * casuística (hay que extraerlos del enunciado), igual que en el resto
 * del portal. La tabla se declara con el contenido para que el texto y
 * los números no puedan contradecirse.
 */
export interface EjemploError {
  id: string;
  titulo: string;
  tipo: 'numerico' | 'casuistica';

  /** Enunciado (casuística). */
  enunciado?: string;
  /** El problema, ya formulado con la notación del método. */
  planteamiento: string;
  /** Los parámetros con los que se resuelve, para que se vean. */
  parametros: { etiqueta: string; valor: string }[];

  /** Solo en casuísticas: cómo se pasa del enunciado a los datos. */
  extraccion?: ExtraccionDatosError;

  /** Qué significa el resultado antes de calcular. */
  interpretacion: string;
  /** Los pasos con las cuentas escritas. */
  pasos: string[];
  /** Cómo se ejecuta, en prosa. */
  algoritmo: string;
  /** Cómo se decide que el resultado está bien. */
  criterio: string;
  /** Cierre con la respuesta y su lectura. */
  conclusion: string;

  /** Las cuentas, ya resueltas. */
  tabla: TablaCalculoError;
}

/** Un ejercicio de autoevaluación: un ejemplo + pista + verificación. */
export interface EjercicioError extends EjemploError {
  /** Pista visible desde el inicio. */
  pista?: string;
  /** Preguntas de comprensión. */
  cuestionario?: PreguntaCuestionarioAuto[];
  /** Respuesta verificable. */
  resolucion?: ResolucionVerificable;
  /** Formato de la respuesta verificable. */
  formatoRespuesta?: FormatoRespuesta;
  /** Ajuste de la política de desbloqueo para este ejercicio. */
  desbloqueo?: DesbloqueoConfig;
}

/* ------------------------------------------------------------------ */
/* Teoría                                                              */
/* ------------------------------------------------------------------ */

/** La tarjeta del método: fórmula, criterios, pasos, pros y contras. */
export interface InfoMetodoError {
  formula: string;
  criterios: { nombre: string; explicacion: string }[];
  pasos: string[];
  ventajas: string[];
  limitaciones: string[];
  recomendaciones: string[];
}

/** La teoría completa de un método del Módulo 0. */
export interface TeoriaError {
  concepto: string;
  fundamento: string;
  cuandoFalla: string;
  precision: string;
  /** Video principal (opcional). Solo si la URL está verificada. */
  videoUrl?: string;
  recursos: RecursoTeoria[];
  algoritmo: InfoMetodoError;
  ejemploNormal: EjemploError;
  ejemploCasuistica: EjemploError;
}

/* ------------------------------------------------------------------ */
/* Calculadora                                                         */
/* ------------------------------------------------------------------ */

/**
 * Un campo de la calculadora. Misma forma que la del resto del portal
 * (`CampoCalculadora`), repetida acá para no atar el Módulo 0 a los
 * tipos de datos de otro módulo.
 */
export interface CampoCalculadoraError {
  key: string;
  etiqueta: string;
  ayuda: string;
  requisito?: string;
  valorInicial: string;
  tipo: 'text' | 'number';
  placeholder?: string;
}

/** Resultado de una calculadora del Módulo 0. */
export interface RespuestaCalculadoraError {
  exito: boolean;
  /** El resultado principal, ya formateado. */
  resultado?: string;
  /** Etiqueta del resultado ("Error absoluto"). */
  etiquetaResultado?: string;
  /** Una segunda lectura útil ("Error relativo"). */
  detalle?: string;
  /** Etiqueta del detalle. */
  etiquetaDetalle?: string;
  /** Explicación en palabras. */
  conclusion: string;
  /** Filas de la cuenta, para la tabla. */
  filas?: Record<string, number | string>[];
  /** Columnas de esa tabla. */
  columnas?: Columna[];
}
