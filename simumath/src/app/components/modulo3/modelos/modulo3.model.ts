/**
 * Formas de datos que comparten los métodos del Módulo 3
 * (Interpolación y ajuste de curvas).
 *
 * ── Por qué no se reutilizan las del Módulo 1 ─────────────────────────
 * El Módulo 1 resuelve ecuaciones: recibe una función `f(x)` y devuelve
 * una raíz iterando. El Módulo 3 trabaja con TABLAS DE DATOS: recibe
 * pares (xᵢ, yᵢ) y construye un polinomio o una recta. Son problemas
 * distintos, así que las cajas de datos son distintas.
 *
 * Lo que SÍ se comparte con el Módulo 1 es la forma de presentar: los
 * componentes de `shared/ui` (tarjetas, botones, badges), la tabla de
 * iteraciones `iteration-table`, el visor de pasos `pasos-control` y el
 * gráfico `grafico-metodo`. Este módulo dibuja sobre ese mismo motor:
 * en lugar de la curva de f(x) dibuja el polinomio o la recta ajustada,
 * y en lugar de iteraciones dibuja los puntos de la tabla.
 *
 * Lo que es único de cada método (fórmula, textos, función de dibujo)
 * vive en la carpeta del método, en sus archivos `*.config.ts`,
 * `*.contenido.ts` y `*.grafico.ts`.
 */

/* ------------------------------------------------------------------ */
/* Datos de entrada                                                     */
/* ------------------------------------------------------------------ */

/** Un dato experimental: un par (x, y). */
export interface Punto {
  x: number;
  y: number;
}

/** Un par (x, y) escrito por el alumno, todavía como texto. */
export interface PuntoTexto {
  x: string;
  y: string;
}

/**
 * Datos con los que se resuelve un ejemplo o un cálculo de calculadora.
 * Es el equivalente de `DatosCalculo` del Módulo 1, pero con puntos.
 */
export interface DatosModulo3 {
  /** La tabla de datos, en orden creciente de x. */
  puntos: Punto[];
  /**
   * Valor de x donde se quiere estimar. Es el corazón del problema:
   * interpolar o predecir "qué pasa entre o fuera de los datos".
   * Opcional: si no viene, solo se construye el modelo.
   */
  evaluarEn?: number;
  /** Título corto de la tabla, para el gráfico ("Presión vs. temperatura"). */
  etiqueta?: string;
}

/* ------------------------------------------------------------------ */
/* Ejemplos y ejercicios                                                */
/* ------------------------------------------------------------------ */

/** Cómo se llega desde el enunciado a la tabla de datos (casuísticas). */
export interface ExtraccionDatos {
  /** Qué se busca en el enunciado, en palabras simples. */
  busqueda: string;
  /** Los datos con sus unidades, uno por renglón. */
  datos: { simbolo: string; valor: string; queEs: string }[];
  /** Cómo se arma la tabla a partir de esos datos. */
  formulacion: string;
}

/**
 * Un ejemplo resuelto.
 *
 * Igual que en el Módulo 1, la diferencia entre `numerico` y
 * `casuistica` no está en el cálculo, sino en que la casuística muestra
 * de dónde salen los números. Por eso `extraccion` es opcional.
 */
export interface EjemploModulo3 {
  id: string;
  titulo: string;
  tipo: 'numerico' | 'casuistica';

  /** Enunciado (casuística) o la tabla planteada (numérico). */
  enunciado?: string;
  /** Qué se pide, en una línea. */
  planteamiento: string;
  /** Los parámetros con los que se resuelve, para que se vean. */
  parametros: { etiqueta: string; valor: string }[];

  /** Solo en casuísticas: cómo se pasa del enunciado a la tabla. */
  extraccion?: ExtraccionDatos;

  /** Qué significa el problema antes de calcular. */
  interpretacion: string;
  /** Los primeros pasos con las cuentas escritas. */
  pasos: string[];
  /** Cómo se ejecuta: el algoritmo en prosa. */
  algoritmo: string;
  /** Cómo se decide que ya terminó y qué mide la bondad del ajuste. */
  criterio: string;
  /** Cierre con la respuesta y su interpretación. */
  conclusion: string;

  /** Con qué datos se calcula la tabla y el gráfico. */
  calculo: DatosModulo3;
}

/** Un ejercicio de autoevaluación: un ejemplo + una pista. */
export interface EjercicioModulo3 extends EjemploModulo3 {
  /** Pista que se muestra junto al botón "Ver solución". */
  pista?: string;
}

/* ------------------------------------------------------------------ */
/* Recursos externos (teoría apoyada en internet)                      */
/* ------------------------------------------------------------------ */

/**
 * Un recurso de internet para ampliar la teoría.
 *
 * El pedido del curso es claro: no repetir en la página lo que ya está
 * explicado mejor afuera. La teoría de este módulo es corta a propósito;
 * el detalle vive en estos enlaces (videos y lecturas).
 */
export interface RecursoExterno {
  /** Título del recurso. */
  titulo: string;
  /** URL completa. */
  url: string;
  /** Qué es: video, lectura, herramienta interactiva... */
  tipo: 'video' | 'lectura' | 'interactivo';
  /** Por qué sirve, en una línea. */
  descripcion: string;
}

/* ------------------------------------------------------------------ */
/* Teoría                                                               */
/* ------------------------------------------------------------------ */

/** La tarjeta de información del método. */
export interface InfoMetodoM3 {
  /** La fórmula, como texto (se maqueta con HTML, sin librerías). */
  formula: string;
  /** Qué mide cada criterio de bondad / error. */
  criterios: { nombre: string; explicacion: string }[];
  /** Los pasos del algoritmo, en orden. */
  pasos: string[];
  ventajas: string[];
  limitaciones: string[];
  recomendaciones: string[];
}

/** La teoría completa de un método. */
export interface TeoriaModulo3 {
  /** Idea intuitiva, antes de la fórmula. */
  concepto: string;
  /** Por qué funciona: el resultado matemático en el que se apoya. */
  fundamento: string;
  /** Cuándo falla o da resultados engañosos. */
  cuandoFalla: string;
  /** Qué tan bueno es el resultado, en palabras simples. */
  precision: string;
  /** Video principal (opcional). */
  videoUrl?: string;
  /** Recursos de internet para ampliar. */
  recursos: RecursoExterno[];
  /** La tarjeta del método. */
  algoritmo: InfoMetodoM3;
  /** Ejemplo numérico de la teoría. */
  ejemploNormal: EjemploModulo3;
  /** Ejemplo de casuística de la teoría. */
  ejemploCasuistica: EjemploModulo3;
}

/* ------------------------------------------------------------------ */
/* Calculadora                                                          */
/* ------------------------------------------------------------------ */

/** Un campo de entrada de la calculadora. */
export interface CampoCalculadoraM3 {
  /** Identificador único dentro del método. */
  key: string;
  /** Etiqueta visible: "Puntos (x, y)". */
  etiqueta: string;
  /** Texto de ayuda: qué se espera acá. */
  ayuda: string;
  /** Condición que debe cumplirse. Opcional. */
  requisito?: string;
  /** Valor con el que arranca la calculadora. */
  valorInicial: string;
  /** Tipo del input de HTML (los mismos strings que usa el atributo). */
  tipo: 'text' | 'number';
  /** Placeholder del input. */
  placeholder?: string;
}

/** Respuesta que muestra la calculadora después de calcular. */
export interface RespuestaCalculadoraM3 {
  /** ¿Terminó bien? */
  exito: boolean;
  /** El resultado principal ya formateado (P(x*) o ŷ(x*)). */
  resultado?: string;
  /** Etiqueta del resultado ("P(2.5)", "ŷ(2.5)"). */
  etiquetaResultado?: string;
  /** Bondad del ajuste o precisión, ya formateada. */
  bondad?: string;
  /** Etiqueta de la bondad ("Error en los nodos", "Coeficiente r"). */
  etiquetaBondad?: string;
  /** Conclusión en palabras. */
  conclusion: string;
}
