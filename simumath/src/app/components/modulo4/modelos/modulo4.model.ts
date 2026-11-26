/**
 * Formas de datos que comparten los métodos del Módulo 4
 * (Integración numérica).
 *
 * ── En qué se diferencia del Módulo 3 ────────────────────────────────
 * El Módulo 3 recibe una TABLA de puntos (xᵢ, yᵢ). Acá se recibe una
 * FUNCIÓN f(x) escrita como texto y un intervalo [a, b] partido en n
 * trozos. Por eso los datos de cálculo son otros, aunque la forma de
 * presentarlos (teoría, ejemplos, autoevaluación, calculadora) sea la
 * misma.
 *
 * Lo genérico se sigue reutilizando: `iteration-table`, `grafico-metodo`,
 * `pasos-control`, `teoria-contenido` y los componentes de `shared/ui`.
 */

import type { RecursoTeoria } from '../../../shared/models/metodo.model';

/* ------------------------------------------------------------------ */
/* Datos de entrada                                                    */
/* ------------------------------------------------------------------ */

/**
 * Con qué se resuelve un ejemplo o un cálculo de calculadora.
 *
 * `funcion` es texto porque es lo que escribe el alumno; se compila con
 * `FuncionEvaluable`, nunca con `eval`. En los ejemplos va siempre una
 * expresión válida.
 */
export interface DatosModulo4 {
  /** Expresión de f(x), como la escribe el alumno: "x^2", "sin(x)/x". */
  funcion: string;
  /** Extremo izquierdo del intervalo. */
  a: number;
  /** Extremo derecho del intervalo. */
  b: number;
  /** Cantidad de subintervalos (Simpson exige que sea par). */
  n: number;
  /** Valor exacto de la integral, si se conoce: sirve para medir el error. */
  valorExacto?: number;
  /** Título corto para el gráfico ("Trabajo de una fuerza variable"). */
  etiqueta?: string;
}

/* ------------------------------------------------------------------ */
/* Ejemplos y ejercicios                                               */
/* ------------------------------------------------------------------ */

/** Cómo se llega desde el enunciado a la integral (casuísticas). */
export interface ExtraccionDatosM4 {
  /** Qué se busca en el enunciado, en palabras simples. */
  busqueda: string;
  /** Los datos con sus unidades, uno por renglón. */
  datos: { simbolo: string; valor: string; queEs: string }[];
  /** Cómo se arma la integral a partir de esos datos. */
  formulacion: string;
}

/**
 * Un ejemplo resuelto.
 *
 * La diferencia entre `numerico` y `casuistica` no está en el cálculo,
 * sino en que la casuística muestra de dónde salen los números. Por eso
 * `extraccion` es opcional.
 */
export interface EjemploModulo4 {
  id: string;
  titulo: string;
  tipo: 'numerico' | 'casuistica';

  /** Enunciado (casuística) o la integral planteada (numérico). */
  enunciado?: string;
  /** Qué se pide, en una línea. */
  planteamiento: string;
  /** Los parámetros con los que se resuelve, para que se vean. */
  parametros: { etiqueta: string; valor: string }[];

  /** Solo en casuísticas: cómo se pasa del enunciado a la integral. */
  extraccion?: ExtraccionDatosM4;

  /** Qué significa el problema antes de calcular. */
  interpretacion: string;
  /** Los primeros pasos con las cuentas escritas. */
  pasos: string[];
  /** Cómo se ejecuta: el algoritmo en prosa. */
  algoritmo: string;
  /** Cómo se decide que el resultado es bueno. */
  criterio: string;
  /** Cierre con la respuesta y su interpretación. */
  conclusion: string;

  /**
   * Fórmula del método para este ejemplo, en notación Unicode.
   * Se muestra con el componente de fórmulas (MathML), no como texto con
   * guiones bajos.
   */
  formula?: string;

  /**
   * La misma fórmula en TeX, para renderizarla con KaTeX. Tiene prioridad
   * sobre `formula` cuando está presente.
   */
  formulaTex?: string;

  /** Con qué datos se calcula la tabla y el gráfico. */
  calculo: DatosModulo4;
}

/** Una opción de una pregunta del cuestionario de autoevaluación. */
export interface OpcionCuestionarioM4 {
  /** Identificador corto dentro de la pregunta ("a", "b", "v", "f"). */
  id: string;
  /** Texto visible de la opción. */
  texto: string;
}

/** Una pregunta de comprensión ligada a UN ejercicio. */
export interface PreguntaCuestionarioM4 {
  id: string;
  tipo: 'opcion-multiple' | 'verdadero-falso';
  enunciado: string;
  opciones: OpcionCuestionarioM4[];
  /** `id` de la opción correcta. */
  correcta: string;
  /** Explicación breve que se muestra después de comprobar. */
  explicacion: string;
}

/** Un ejercicio de autoevaluación: un ejemplo + una pista. */
export interface EjercicioModulo4 extends EjemploModulo4 {
  /** Pista que se muestra antes de revelar el desarrollo. */
  pista?: string;
  /** Pregunta de comprensión. Si falta, el ejercicio no muestra el botón. */
  cuestionario?: PreguntaCuestionarioM4[];
}

/* ------------------------------------------------------------------ */
/* Teoría                                                              */
/* ------------------------------------------------------------------ */

/** La tarjeta de información del método. */
export interface InfoMetodoM4 {
  /** La fórmula principal, en texto Unicode (sin guiones bajos). */
  formula: string;
  /** La fórmula principal en TeX, para KaTeX. Tiene prioridad si existe. */
  formulaTex?: string;
  /** Qué mide cada criterio de error / calidad. */
  criterios: { nombre: string; explicacion: string }[];
  /** Los pasos del algoritmo, en orden. */
  pasos: string[];
  ventajas: string[];
  limitaciones: string[];
  recomendaciones: string[];
}

/** La teoría completa de un método. */
export interface TeoriaModulo4 {
  concepto: string;
  fundamento: string;
  cuandoFalla: string;
  precision: string;
  videoUrl?: string;
  recursos: RecursoTeoria[];
  algoritmo: InfoMetodoM4;
  ejemploNormal: EjemploModulo4;
  ejemploCasuistica: EjemploModulo4;
}

/* ------------------------------------------------------------------ */
/* Calculadora                                                         */
/* ------------------------------------------------------------------ */

/** Un campo de entrada de la calculadora. */
export interface CampoCalculadoraM4 {
  key: string;
  etiqueta: string;
  ayuda: string;
  requisito?: string;
  valorInicial: string;
  tipo: 'text' | 'number';
  placeholder?: string;
}

/** Respuesta que muestra la calculadora después de calcular. */
export interface RespuestaCalculadoraM4 {
  exito: boolean;
  /** La integral aproximada, ya formateada. */
  resultado?: string;
  /** Etiqueta del resultado ("I ≈", "Área ≈"). */
  etiquetaResultado?: string;
  /** Bondad / error, ya formateado. */
  bondad?: string;
  /** Etiqueta de la bondad ("Error absoluto", "Error relativo"). */
  etiquetaBondad?: string;
  /** Conclusión en palabras. */
  conclusion: string;
}
