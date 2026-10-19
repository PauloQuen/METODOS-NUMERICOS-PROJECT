/**
 * Formas de datos que comparten TODOS los métodos del Módulo 1.
 *
 * ── Por qué viven acá y no en la carpeta de cada método ───────────────
 * Porque son las cajas que usan los componentes genéricos de `shared/`
 * (gráfico, tabla, botones de pasos, tarjeta de ejemplo). Esos
 * componentes NO saben qué método se está mostrando: reciben estas
 * interfaces por `input()` y dibujan lo que les llega.
 *
 * Lo que SÍ es único de cada método (fórmula, texto de la teoría, su
 * función de dibujo) vive en la carpeta del método, en sus archivos
 * `*.config.ts`, `*.contenido.ts` y `*.grafico.ts`.
 */

/* ------------------------------------------------------------------ */
/* Iteraciones                                                          */
/* ------------------------------------------------------------------ */

/** Una fila de la tabla de iteraciones. */
export interface Iteracion {
  /** Número de iteración (empieza en 1). */
  n: number;
  /**
   * El resto de las columnas. La clave es el nombre que definió el
   * método en su config, y el valor ya viene formateado para mostrar.
   * Ej: { n: 1, a: '1.000000', b: '2.000000', c: '1.500000' }
   */
  [columna: string]: number | string;
}

/** Una columna de la tabla. */
export interface Columna {
  /** Clave que se busca dentro del objeto Iteracion. */
  key: string;
  /** Texto del encabezado. */
  label: string;
  align?: 'left' | 'right' | 'center';
}

/* ------------------------------------------------------------------ */
/* Ejemplos y ejercicios                                                */
/* ------------------------------------------------------------------ */

/** Datos numéricos que un ejemplo o ejercicio necesita para calcularse. */
export interface DatosCalculo {
  /** Expresión de la función, como la escribe el alumno: "x^3 - x - 2". */
  funcion: string;
  /** Extremo izquierdo del intervalo inicial (métodos cerrados). */
  a?: number;
  /** Extremo derecho del intervalo inicial (métodos cerrados). */
  b?: number;
  /** Semilla inicial (métodos abiertos). */
  x0?: number;
  /** Segunda semilla (secante). */
  x1?: number;
  /** Tolerancia pedida. */
  tol?: number;
  /** Tope de iteraciones. */
  maxIter?: number;
}

/** Cómo se llega desde el enunciado a la ecuación (casuísticas). */
export interface ExtraccionDatos {
  /** Qué se busca en el enunciado, en palabras simples. */
  busqueda: string;
  /** Los datos con sus unidades, uno por renglón. */
  datos: { simbolo: string; valor: string; queEs: string }[];
  /** Cómo se arma la ecuación a partir de esos datos. */
  formulacion: string;
}

/**
 * Un ejemplo resuelto, de la pestaña "Ejemplos".
 *
 * Ojo con la diferencia entre `numerico` y `casuistica`: el enunciado no
 * cambia, lo que cambia es que la casuística tiene que mostrar de dónde
 * salen los números. Por eso el campo `extraccion` es opcional.
 */
export interface Ejemplo {
  id: string;
  titulo: string;
  tipo: 'numerico' | 'casuistica';

  /** Enunciado (casuística) o la ecuación planteada (numérico). */
  enunciado?: string;
  /** La ecuación final, ya en forma f(x) = 0. */
  ecuacion: string;
  /** Los parámetros con los que se resuelve, para que se vean. */
  parametros: { etiqueta: string; valor: string }[];

  /** Solo en casuísticas: cómo se pasa del enunciado a la ecuación. */
  extraccion?: ExtraccionDatos;

  /** Qué significa el problema antes de calcular. */
  interpretacion: string;
  /** Las dos primeras iteraciones con las cuentas escritas. */
  pasos: string[];
  /** Cómo se ejecuta: el algoritmo en prosa. */
  algoritmo: string;
  /** Cómo se decide que ya terminó. */
  criterio: string;
  /** Cierre con la respuesta y su interpretación. */
  conclusion: string;

  /** Con qué datos se calcula la tabla y el gráfico. */
  calculo: DatosCalculo;
}

/**
 * Un ejercicio de autoevaluación. Es un Ejemplo más el "reto" de
 * resolverlo antes de ver la solución, así que hereda todo.
 */
export interface Ejercicio extends Ejemplo {
  /** Pista que se muestra junto al botón "Ver solución". */
  pista?: string;
}

/* ------------------------------------------------------------------ */
/* Teoría                                                               */
/* ------------------------------------------------------------------ */

/** La tarjeta ancha de información del algoritmo (Bloque 2 de Teoría). */
export interface InfoAlgoritmo {
  /** La fórmula, grande y visible. Texto plano, se maqueta con HTML. */
  formula: string;
  /** Qué significa cada criterio de convergencia. */
  criterios: { nombre: string; explicacion: string }[];
  /** Los pasos, en orden. */
  pasos: string[];
  ventajas: string[];
  limitaciones: string[];
  recomendaciones: string[];
}

/** La teoría completa de un método. */
export interface ContenidoTeoria {
  /** Idea intuitiva, antes de la fórmula. */
  concepto: string;
  /** Por qué funciona: el teorema en el que se apoya. */
  fundamento: string;
  /** Cuándo falla. */
  cuandoFalla: string;
  /** Orden de convergencia explicado en palabras simples. */
  ordenConvergencia: string;
  /** Link del video (opcional). */
  videoUrl?: string;
  /** La tarjeta de algoritmo. */
  algoritmo: InfoAlgoritmo;
  /** Ejemplo numérico de la teoría. */
  ejemploNormal: Ejemplo;
  /** Ejemplo de casuística de la teoría. */
  ejemploCasuistica: Ejemplo;
}

/* ------------------------------------------------------------------ */
/* Calculadora                                                          */
/* ------------------------------------------------------------------ */

/** Un campo de entrada de la calculadora. */
export interface CampoCalculadora {
  /** Identificador único dentro del método. */
  key: string;
  /** Etiqueta visible: "Función f(x)". */
  etiqueta: string;
  /** Texto de ayuda: qué se espera acá. */
  ayuda: string;
  /** Condición que debe cumplirse. Opcional. */
  requisito?: string;
  /** Valor con el que arranca la calculadora. */
  valorInicial: string;
  /**
   * Tipo del input de HTML.
   *
   * Ojo con los nombres: son los de HTML (`text` y `number`), no
   * `texto`/`numero`. Es el mismo string que acepta el atributo `type`,
   * y así el componente genérico lo pasa directo sin traducir.
   *
   * Aunque el input sea `number`, el motor recibe el VALOR COMO STRING
   * (porque así viene del input) y lo convierte internamente. El tipo
   * HTML es solo la ayuda visual del navegador.
   */
  tipo: 'text' | 'number';
  /** Placeholder del input. */
  placeholder?: string;
}

/** Respuesta que muestra la calculadora después de calcular. */
export interface RespuestaCalculadora {
  /** ¿Terminó bien? */
  exito: boolean;
  /** La raíz aproximada, formateada. */
  raiz?: string;
  /** Cuántas iteraciones hizo. */
  iteraciones?: number;
  /** El error que se logró. */
  error?: string;
  /** Conclusión en palabras. */
  conclusion: string;
}

/* ------------------------------------------------------------------ */
/* Gráfico                                                              */
/* ------------------------------------------------------------------ */

/** El rectángulo donde se dibuja, en coordenadas de pantalla. */
export interface Rectangulo {
  x: number;
  y: number;
  ancho: number;
  alto: number;
}

/**
 * Cómo dibuja UN método lo suyo sobre el gráfico.
 *
 * Este es el punto clave de la separación: el componente `grafico-metodo`
 * dibuja los ejes, la cuadrícula y la curva de f(x) — que son iguales para
 * todos los métodos. Después llama a esta función, que es lo ÚNICO que
 * sabe del método concreto.
 *
 * Bisección dibuja el intervalo y el punto medio. Newton dibuja la
 * tangente. Punto Fijo dibuja la telaraña. Cada uno con su archivo.
 */
export type DibujarMetodo = (
  ctx: CanvasRenderingContext2D,
  rect: Rectangulo,
  contexto: ContextoGrafico,
) => void;

/** Lo que el componente le pasa a la función de dibujo del método. */
export interface ContextoGrafico {
  /** Convierte x del dominio a píxeles horizontales. */
  aX: (x: number) => number;
  /** Convierte y del dominio a píxeles verticales. */
  aY: (y: number) => number;
  /** La función ya evaluable. */
  funcion: (x: number) => number;
  /** Filas de la tabla del método. */
  iteraciones: Record<string, number | string>[];
  /** Qué índice se está mostrando (el de los botones de pasos). */
  pasoActual: number;
  /** Rango visible en el eje x. */
  rango: { min: number; max: number };
  /** La raíz encontrada, si ya se encontró. */
  raiz?: number;
}
