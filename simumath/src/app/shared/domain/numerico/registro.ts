/**
 * REGISTRO DE MÉTODOS NUMÉRICOS — fuente única de verdad del Módulo 1.
 *
 * ── Por qué existe ─────────────────────────────────────────────────────
 * Antes, la lista de métodos estaba escrita tres veces: las tabs de
 * Calculadoras, las tabs de Gráficos y el `METODO_INFO` de Calculadoras.
 * Tres copias significan tres lugares donde olvidarse algo, y ya pasó: el
 * Gráfico de Punto Fijo anunciaba un `|g'| ≈ 0.144` que el PDF copiaba de
 * otro ejercicio, y nadie lo detectó porque nadie tenía el original al lado.
 *
 * Acá vive UNA vez cada método, con su taxonomía y sus entradas, y todo lo
 * demás lo deriva: la UI de navegación, los rótulos de la calculadora, qué
 * campos del formulario se muestran y qué columnas tiene la tabla.
 *
 * ── La taxonomía: tres familias, por principio y no por sonido ────────
 * · CERRADOS   mantienen un intervalo [a, b] que contiene la raíz. Si el
 *              método se cuelga, todavía sabés dónde está la raíz.
 * · ABIERTOS   no mantienen intervalo: solo una aproximación. Si se cuelga,
 *              no hay garantía de nada.
 * · POLINOMIOS resuelven por álgebra: no iteran, dan la respuesta exacta.
 *
 * Esa distinción NO es decorativa: es la que explica por qué un método
 * de acotación puede usar el intervalo como criterio de parada y por qué uno
 * abierto no puede. Ver `criterio.ts`.
 *
 * ── Cómo se agrega un método ───────────────────────────────────────────
 * 1. Implementá el runner en `methods.ts` con la firma cruda del método.
 * 2. Agregá una entrada en `REGISTRO` declarando entradas, columnas y
 *    teoría, y envolvé el runner en `ejecutar`.
 * 3. Nada más. La navegación, los rótulos y las columnas se actualizan
 *    solos, y `registro.spec.ts` falla si te olvidaste de algo.
 */

import {
  CRITERIO_POR_DEFECTO,
  CRITERIO_POR_DEFECTO_INTERVALO,
  type CriterioKey,
} from './criterio';
import {
  biseccion,
  newton,
  puntoFijo,
  reglaFalsa,
  secante,
  type IterRow,
  type MetodoResultado,
} from './methods';

/* ------------------------------------------------------------------ */
/* Familias                                                            */
/* ------------------------------------------------------------------ */

export type FamiliaKey = 'cerrados' | 'abiertos' | 'polinomios';

export interface FamiliaRegistrada {
  key: FamiliaKey;
  nombre: string;
  /**
   * El PRINCIPIO que clasifica, en una frase. Va en la UI porque es la idea
   * que el alumno necesita para elegir método, no una etiqueta decorativa.
   */
  principio: string;
  /** Qué garantiza y qué no garantiza esta familia. */
  descripcion: string;
}

export const FAMILIAS: readonly FamiliaRegistrada[] = [
  {
    key: 'cerrados',
    nombre: 'Métodos cerrados',
    principio: 'Acotan la raíz: mantienen vivo un intervalo [a, b] que la contiene.',
    descripcion:
      'Solo funcionan si f(a)·f(b) < 0 (Bolzano). Son lentos pero IMPARABLES: si se corta la iteración, el intervalo restante sigue conteniendo la raíz, así que siempre se puede acotar dónde está.',
  },
  {
    key: 'abiertos',
    nombre: 'Métodos abiertos',
    principio: 'No acotan: en cada paso solo conservan una aproximación.',
    descripcion:
      'Rapidísimos cuando arrancan bien, pero si la semilla es mala pueden diverger sin avisar. Regla de bolsillo: elegí la semilla cerca de la raíz y verificá que los primeros pasos se acerquen.',
  },
  {
    key: 'polinomios',
    nombre: 'Métodos analíticos',
    principio: 'Resuelven por álgebra: no iteran, entregan la raíz exacta.',
    descripcion:
      'Solo aplican a polinomios y dan la respuesta en forma cerrada. Son los más rápidos porque no improvisan: no buscan la raíz, la calculan. A cambio, no se adaptan a funciones transcendentes como eˣ o cos(x).',
  },
] as const;

/* ------------------------------------------------------------------ */
/* Métodos                                                             */
/* ------------------------------------------------------------------ */

export type MetodoKey =
  | 'biseccion'
  | 'reglaFalsa'
  | 'newton'
  | 'secante'
  | 'puntoFijo'
  | 'cardano';

/**
 * `planificado` = declarado en el registro pero sin runner todavía. La UI lo
 * muestra con su familia (para que la taxonomía sea completa y se vea qué
 * falta) pero no lo deja ejecutar.
 */
export type EstadoMetodo = 'implementado' | 'planificado';

/** Campos de entrada que pide cada método. */
export type EntradaKey = 'a' | 'b' | 'x0' | 'x1';

export interface EntradaMetodo {
  key: EntradaKey;
  etiqueta: string;
  /** Qué le está pidiendo el algoritmo al alumno, no solo el símbolo. */
  ayuda: string;
  /** Condición que NO puede incumplirse sin romper el método. */
  requisito?: string;
  valorSugerido: string;
}

/** Parámetros de entrada, en forma uniforme para todos los métodos. */
export interface Parametros {
  a?: number;
  b?: number;
  x0?: number;
  x1?: number;
}

export interface OpcionesEjecucion {
  tol: number;
  maxIter?: number;
  criterio?: CriterioKey;
}

/**
 * Firma uniforme para ejecutar cualquier método. Es lo que permite que la
 * calculadora y los gráficos no sepan NADA de las firmas crudas: piden
 * "corré biseccion" y listo, sin un switch por método.
 */
export type Ejecutor = (
  fn: (x: number) => number,
  p: Parametros,
  o: OpcionesEjecucion,
) => MetodoResultado;

/**
 * Ejemplo canónico del método: los datos con los que el alumno debería ver
 * funcionar al método apenas lo abre.
 *
 * ── Por qué la función está acá y no en el componente ────────────────
 * Porque "la función" NO es la misma cosa para todos los métodos. Newton y
 * Bisección resuelven f(x) = 0; Punto Fijo resuelve x = g(x), o sea una
 * REESCRITURA de la misma ecuación. Con un único campo compartido, abrir
 * Punto Fijo con `f = x³ − x − 2` es usar f como si fuera g: en la raíz
 * |g′| = |3x² − 1| ≈ 5.94 ≫ 1 y la sucesión diverge siempre. El motor lo
 * avisa bien ("oscila y no estabiliza"), pero el alumno abre la pestaña y
 * ve un error en su primer clic, sin haber hecho nada malo.
 *
 * Acá vive la respuesta correcta: la misma ecuación x³ − x − 2 = 0, escrita
 * como g(x) = ∛(x + 2), que sí contrae (|g′| ≈ 0.144).
 */
export interface EjemploMetodo {
  /** La expresión a mostrar. Es f, salvo en los métodos con `operaSobreG`. */
  funcion: string;
  x0?: string;
  x1?: string;
  /** Qué está pasando, para el pie del formulario. Opcional. */
  nota?: string;
}

export interface MetodoRegistrado {
  key: MetodoKey;
  nombre: string;
  /**
   * Segmento de URL y nombre de la carpeta del método, en minúsculas y con
   * guiones (`regla-falsa`). Vive acá —y no escrito en cada ruta— porque
   * la URL es parte de los datos del método: si mañana se renombra uno,
   * la lista, el enlace y la carpeta cambian juntos o no cambian.
   *
   * Regla: kebab-case. `validarRegistro()` la hace cumplir.
   */
  ruta: string;
  familia: FamiliaKey;
  estado: EstadoMetodo;

  /** La recurrencia, para mostrarla al lado del nombre. */
  formula: string;
  /** La idea en una frase, sin jerga. */
  idea: string;
  /** Qué tiene que mirar el alumno para elegir este método y no otro. */
  cuandoUsarlo: string;

  /**
   * Orden de convergencia p en |e_{n+1}| ≈ C·|e_n|^p.
   * `null` para un método exacto: no itera, así que no hay orden.
   */
  orden: number | null;
  ordenTexto: string;

  /** Exige un intervalo [a, b] vivo. */
  requiereIntervalo: boolean;
  /** Exige cambio de signo en los extremos (Bolzano). */
  requiereCambioDeSigno: boolean;
  /** Necesita f′ (la calcula numéricamente si no la tenés a mano). */
  usaDerivada: boolean;
  /** Trabaja con g en lugar de resolver f(x) = 0. */
  operaSobreG: boolean;

  /** Columnas de la tabla de iteraciones, en orden. */
  columnas: string[];
  /** La columna con la aproximación (el valor que converge a la raíz). */
  columnaValor: string;
  /**
   * Columna del residuo: cuánto vale f (o g) en la aproximación.
   * `null` si el método no expone esa magnitud.
   */
  columnaResiduo: string | null;

  entradas: EntradaMetodo[];
  /** Con qué datos el método funciona a la primera. Ver `EjemploMetodo`. */
  ejemplo: EjemploMetodo;
  /** Ausente si `estado` es `planificado`. */
  ejecutar?: Ejecutor;
}

/* ------------------------------------------------------------------ */
/* Las entradas declaradas                                             */
/* ------------------------------------------------------------------ */

const ENTRADA_A: EntradaMetodo = {
  key: 'a',
  etiqueta: 'Extremo izquierdo a',
  ayuda: 'Extremo izquierdo del intervalo inicial.',
  requisito: 'Debe cumplir f(a) · f(b) < 0 si el método es de cambio de signo.',
  valorSugerido: '1',
};

const ENTRADA_B: EntradaMetodo = {
  key: 'b',
  etiqueta: 'Extremo derecho b',
  ayuda: 'Extremo derecho del intervalo inicial.',
  requisito: 'Debe cumplir f(a) · f(b) < 0 si el método es de cambio de signo.',
  valorSugerido: '2',
};

const ENTRADA_X0: EntradaMetodo = {
  key: 'x0',
  etiqueta: 'Semilla x₀',
  ayuda: 'Primer valor de la sucesión. No es un dato: es una apuesta.',
  requisito:
    'Si exige |g′(x₀)| < 1 y no lo cumple, puede no converger.',
  valorSugerido: '1.5',
};

const ENTRADA_X1: EntradaMetodo = {
  key: 'x1',
  etiqueta: 'Segunda semilla x₁',
  ayuda:
    'Segundo valor para aproximar f′ por la secante entre ambos puntos.',
  requisito: 'Debe ser DISTINTO de x₀: si coinciden, el denominador es 0.',
  valorSugerido: '2',
};

/* ------------------------------------------------------------------ */
/* El registro                                                         */
/* ------------------------------------------------------------------ */

export const REGISTRO: readonly MetodoRegistrado[] = [
  {
    key: 'biseccion',
    nombre: 'Bisección',
    ruta: 'biseccion',
    familia: 'cerrados',
    estado: 'implementado',
    formula: 'xm = (a + b) / 2',
    idea:
      'Corta el intervalo por la mitad y se queda con el lado donde f cambia de signo.',
    cuandoUsarlo:
      'Es el método seguro por excelencia. Si no sabés nada del problema, empezá acá: nunca diverge.',
    orden: 1,
    ordenTexto: 'lineal (p = 1)',
    requiereIntervalo: true,
    requiereCambioDeSigno: true,
    usaDerivada: false,
    operaSobreG: false,
    columnas: ['i', 'a', 'b', 'c', 'f(c)', '|Δc|'],
    columnaValor: 'c',
    columnaResiduo: 'f(c)',
    entradas: [ENTRADA_A, ENTRADA_B],
    ejemplo: {
      funcion: 'x^3 - x - 2',
      nota: 'Raíz entre 1 y 2: f(1) y f(2) tienen signo opuesto.',
    },
    ejecutar: (fn, p, o) =>
      biseccion(fn, p.a!, p.b!, o.tol, o.maxIter, o.criterio ?? CRITERIO_POR_DEFECTO_INTERVALO),
  },

  {
    key: 'reglaFalsa',
    nombre: 'Regla Falsa',
    ruta: 'regla-falsa',
    familia: 'cerrados',
    estado: 'implementado',
    formula: 'xm = b − f(b)·(b−a)/(f(b)−f(a))',
    idea:
      'En vez de la mitad, toma donde la recta que une los extremos corta el eje.',
    cuandoUsarlo:
      'Cuando la bisección desperdicia pasos. Es más rápida por paso, pero el extremo se queda clavado y puede volverse MUCHO más lenta en la práctica.',
    orden: 1,
    ordenTexto: 'lineal (p = 1)',
    requiereIntervalo: true,
    requiereCambioDeSigno: true,
    usaDerivada: false,
    operaSobreG: false,
    columnas: ['i', 'a', 'b', 'c', 'f(c)', '|Δc|'],
    columnaValor: 'c',
    columnaResiduo: 'f(c)',
    entradas: [ENTRADA_A, ENTRADA_B],
    ejemplo: {
      funcion: 'x^3 - x - 2',
      nota: 'Mismo problema, otra técnica: acá no hace falta ninguna derivada.',
    },
    ejecutar: (fn, p, o) =>
      reglaFalsa(fn, p.a!, p.b!, o.tol, o.maxIter, o.criterio ?? CRITERIO_POR_DEFECTO),
  },

  {
    key: 'newton',
    nombre: 'Newton-Raphson',
    ruta: 'newton-raphson',
    familia: 'abiertos',
    estado: 'implementado',
    formula: 'xₙ₊₁ = xₙ − f(xₙ)/f′(xₙ)',
    idea: 'Corta el eje con la recta TANGENTE en el punto actual.',
    cuandoUsarlo:
      'Cuando sabés f′ y la semilla está cerca de la raíz. Dobla las cifras buenas en cada paso: es el rey de la velocidad.',
    orden: 2,
    ordenTexto: 'cuadrática (p = 2)',
    requiereIntervalo: false,
    requiereCambioDeSigno: false,
    usaDerivada: true,
    operaSobreG: false,
    columnas: ['i', 'xᵢ', 'f(xᵢ)', "f'(xᵢ)", '|Δx|'],
    columnaValor: 'xᵢ',
    columnaResiduo: 'f(xᵢ)',
    entradas: [ENTRADA_X0],
    ejemplo: { funcion: 'x^3 - x - 2', x0: '1.5' },
    ejecutar: (fn, p, o) =>
      newton(fn, p.x0!, o.tol, o.maxIter, o.criterio ?? CRITERIO_POR_DEFECTO),
  },

  {
    key: 'secante',
    nombre: 'Secante',
    ruta: 'secante',
    familia: 'abiertos',
    estado: 'implementado',
    formula: 'xₙ₊₁ = xₙ − f(xₙ)·(xₙ−xₙ₋₁)/(f(xₙ)−f(xₙ₋₁))',
    idea:
      'Newton sin derivada: aproxima la pendiente con la secante entre los dos últimos puntos.',
    cuandoUsarlo:
      'Cuando no tenés f′ (o es muy incómoda) pero querés la velocidad de Newton. Como no exige cambio de signo, también anda donde bisección no puede.',
    orden: 1.6180339887,
    ordenTexto: 'superlineal (p = φ ≈ 1.618)',
    requiereIntervalo: false,
    requiereCambioDeSigno: false,
    usaDerivada: false,
    operaSobreG: false,
    // Orden de LECTURA, no de emisión: el runner escribe xᵢ antes que
    // xᵢ₋₁, pero mostrar primero el valor anterior deja más claro de dónde
    // sale la pendiente.
    columnas: ['i', 'xᵢ₋₁', 'xᵢ', 'f(xᵢ)', '|Δx|'],
    columnaValor: 'xᵢ',
    columnaResiduo: 'f(xᵢ)',
    entradas: [ENTRADA_X0, ENTRADA_X1],
    ejemplo: {
      funcion: 'x^3 - x - 2',
      x0: '1.5',
      x1: '2',
      nota: 'Dos semillas DISTINTAS: si coinciden, el denominador es 0.',
    },
    ejecutar: (fn, p, o) =>
      secante(fn, p.x0!, p.x1!, o.tol, o.maxIter, o.criterio ?? CRITERIO_POR_DEFECTO),
  },

  {
    key: 'puntoFijo',
    nombre: 'Punto Fijo',
    ruta: 'punto-fijo',
    familia: 'abiertos',
    estado: 'implementado',
    formula: 'xₙ₊₁ = g(xₙ)',
    idea:
      'Reescribí f(x) = 0 como x = g(x) y solo iterá. Dibuja la telaraña.',
    cuandoUsarlo:
      'Cuando la reescritura es natural y |g′(x)| < 1 en la zona. Es el método con más trampas:|g′(x₀)| < 1 NO alcanza para garantizar convergencia.',
    orden: 1,
    ordenTexto: 'lineal (p = 1)',
    requiereIntervalo: false,
    requiereCambioDeSigno: false,
    usaDerivada: false,
    operaSobreG: true,
    columnas: ['i', 'xᵢ', 'g(xᵢ)', '|Δx|'],
    columnaValor: 'xᵢ',
    columnaResiduo: 'g(xᵢ)',
    entradas: [ENTRADA_X0],
    ejemplo: {
      funcion: '(x + 2)^(1/3)',
      x0: '1.5',
      nota:
        'Es la MISMA ecuación x³ − x − 2 = 0, pero reescrita como x = g(x). Acá g entra al cubo, así que |g′| ≈ 0.144 < 1 y converge.',
    },
    ejecutar: (fn, p, o) =>
      puntoFijo(fn, p.x0!, o.tol, o.maxIter, o.criterio ?? CRITERIO_POR_DEFECTO),
  },

  {
    key: 'cardano',
    nombre: 'Fórmula de Cardano',
    ruta: 'cardano',
    familia: 'polinomios',
    estado: 'planificado',
    formula: 'x = −b/(3a) + ∛(−q/2 + √Δ) + ∛(−q/2 − √Δ)',
    idea:
      'Resuelve la cúbica completa por álgebra, sin iterar: da la raíz en forma cerrada.',
    cuandoUsarlo:
      'Cuando el polinomio es de grado ≤ 3 y querés la respuesta exacta, no una aproximación. Es instantánea, pero solo aplica a polinomios.',
    orden: null,
    ordenTexto: 'exacto (no itera)',
    requiereIntervalo: false,
    requiereCambioDeSigno: false,
    usaDerivada: false,
    operaSobreG: false,
    columnas: [],
    columnaValor: '',
    columnaResiduo: null,
    entradas: [],
    ejemplo: { funcion: 'x^3 - x - 2', nota: 'Una cúbica con coeficiente de x² = 0: ya está en forma deprimida, que es lo que Cardano necesita.' },
  },
] as const;

/* ------------------------------------------------------------------ */
/* Consultas del registro                                              */
/* ------------------------------------------------------------------ */

/**
 * Índice por key. `satisfies` obliga al tipo: si agregás una key al union
 * `MetodoKey` y olvidás registrarla, esto deja de compilar.
 */
/** Ejemplo canónico de un método. Lanza si la key no existe. */
export function ejemploDe(key: MetodoKey): EjemploMetodo {
  return metodo(key).ejemplo;
}

export const REGISTRO_POR_KEY = REGISTRO.reduce(
  (acc, m) => {
    acc[m.key] = m;
    return acc;
  },
  {} as Record<MetodoKey, MetodoRegistrado>,
);

/** atajo seguro: devolver el método o un error que diga qué se pidió. */
export function metodo(key: MetodoKey): MetodoRegistrado {
  const m = REGISTRO_POR_KEY[key];
  if (!m) {
    throw new Error(`Método no registrado: "${key}"`);
  }
  return m;
}

/** Métodos de una familia, en el orden en que se declararon. */
export function metodosDeFamilia(familia: FamiliaKey): MetodoRegistrado[] {
  return REGISTRO.filter((m) => m.familia === familia);
}

/** Families con al menos un método, para no renderizar secciones vacías. */
export function familiasConMetodos(): FamiliaRegistrada[] {
  return FAMILIAS.filter((f) => metodosDeFamilia(f.key).length > 0);
}

/** La familia a la que pertenece un método. */
export function familiaDe(key: MetodoKey): FamiliaRegistrada {
  const f = FAMILIAS.find((x) => x.key === REGISTRO_POR_KEY[key].familia);
  if (!f) {
    throw new Error(`Familia no registrada: "${REGISTRO_POR_KEY[key].familia}"`);
  }
  return f;
}

/** ¿El método pide este campo? Lo usa la calculadora para mostrar inputs. */
export function pideEntrada(key: MetodoKey, entrada: EntradaKey): boolean {
  return REGISTRO_POR_KEY[key].entradas.some((e) => e.key === entrada);
}

/* ------------------------------------------------------------------ */
/* Rutas — derivadas del registro, nunca escritas a mano en las vistas  */
/* ------------------------------------------------------------------ */

/**
 * Pantalla que lista los métodos de una familia (`/modulo1/tipos/cerrados`).
 *
 * El segmento ES la key de la familia: así no hace falta una tabla que
 * traduzca `polinomios` a `raices-polinomios`. Un nombre, un solo lugar.
 */
export function rutaDeFamilia(familia: FamiliaKey): string {
  return `/modulo1/tipos/${familia}`;
}

/** Pestaña de entrada de un método (`/modulo1/tipos/cerrados/biseccion/teoria`). */
export function rutaDeMetodo(m: MetodoRegistrado): string {
  return `${rutaDeFamilia(m.familia)}/${m.ruta}/teoria`;
}

/**
 * Resumen de una línea con lo que decide la elección del método: orden de
 * convergencia, qué pide y qué usa.
 *
 * Se arma con los FLAGS del registro y no con texto escrito a mano, para
 * que no pueda contradecir a los datos. Vive acá (y no en cada vista) porque
 * lo usan dos pantallas distintas: la lista por familia y el árbol de
 * navegación. Duplicarlo es garantía de que en una de las dos se quede
 * viejo.
 *
 * Ojo con el switch por FAMILIA y no por flags sueltos: una versión anterior
 * le decía "arranca de una semilla" a todo lo que no fuera cerrado, y le
 * endilgó esa frase a Cardano, que no itera ni tiene semilla.
 */
export function resumenDeMetodo(m: MetodoRegistrado): string {
  const partes: string[] = [m.ordenTexto];

  switch (m.familia) {
    case 'cerrados':
      partes.push(
        m.requiereCambioDeSigno ? 'exige cambio de signo en [a, b]' : 'usa el intervalo [a, b]',
      );
      break;
    case 'abiertos':
      partes.push('arranca de una semilla');
      break;
    case 'polinomios':
      partes.push('no necesita semilla: resuelve directo');
      break;
  }

  if (m.usaDerivada) partes.push('usa f′');
  if (m.operaSobreG) partes.push('opera con g');

  return partes.join(' · ');
}

/**
 * Ejecuta un método registrado por su key, sin que el llamador conozca la
 * firma cruda. `throw` si el método no está implementado: es un error de
 * programación, no una condición de ejecución, así que no se degrada en
 * silencio.
 */
export function ejecutarMetodo(
  key: MetodoKey,
  fn: (x: number) => number,
  p: Parametros,
  o: OpcionesEjecucion,
): MetodoResultado {
  const m = metodo(key);
  if (!m.ejecutar) {
    throw new Error(`El método "${m.nombre}" está declarado pero no implementado todavía.`);
  }
  for (const e of m.entradas) {
    if (p[e.key] === undefined || Number.isNaN(p[e.key])) {
      throw new Error(`Falta la entrada "${e.etiqueta}" para ${m.nombre}.`);
    }
  }
  return m.ejecutar(fn, p, o);
}

/* ------------------------------------------------------------------ */
/* Validación del registro                                              */
/* ------------------------------------------------------------------ */

/**
 * Chequeos de integridad. Devuelve los problemas encontrados en vez de
 * lanzar, para que en desarrollo aparezcan TODOS juntos y no de a uno.
 *
 * Esto existe porque el registro se escribe a mano: una key repetida, una
 * familia mal escrita o una columna que el runner no emite son errores que
 * aparecen en pantalla como una tabla vacía, tres páginas más abajo, y son
 * imposibles de rastrear de vuelta.
 */
export function validarRegistro(): string[] {
  const problemas: string[] = [];

  const vistos = new Set<string>();
  const rutas = new Set<string>();
  for (const m of REGISTRO) {
    if (vistos.has(m.key)) {
      problemas.push(`Método duplicado en el registro: "${m.key}".`);
    }
    vistos.add(m.key);

    // La ruta es un segmento de URL: si tiene mayúsculas, espacios o barras,
    // el enlace se rompe en silencio y solo se entera quien lo toque.
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(m.ruta)) {
      problemas.push(
        `"${m.key}" declara la ruta "${m.ruta}": tiene que ser minúsculas con guiones, ej. "regla-falsa".`,
      );
    }
    if (rutas.has(m.ruta)) {
      problemas.push(`Ruta duplicada en el registro: "${m.ruta}".`);
    }
    rutas.add(m.ruta);

    if (!FAMILIAS.some((f) => f.key === m.familia)) {
      problemas.push(`"${m.key}" declara la familia "${m.familia}", que no existe en FAMILIAS.`);
    }

    if (m.estado === 'implementado' && !m.ejecutar) {
      problemas.push(`"${m.key}" está implementado pero no tiene función ejecutar.`);
    }
    if (m.estado === 'planificado' && m.ejecutar) {
      problemas.push(`"${m.key}" está planificado pero trae ejecutar: marcá uno u otro.`);
    }

    if (m.estado === 'implementado') {
      if (m.columnas.length === 0) {
        problemas.push(`"${m.key}" no declara columnas, pero se implementa.`);
      }
      if (m.columnaValor && !m.columnas.includes(m.columnaValor)) {
        problemas.push(
          `"${m.key}" apunta a la columna de valor "${m.columnaValor}", que no está en sus columnas.`,
        );
      }
      if (m.columnaResiduo && !m.columnas.includes(m.columnaResiduo)) {
        problemas.push(
          `"${m.key}" apunta a la columna de residuo "${m.columnaResiduo}", que no está en sus columnas.`,
        );
      }
      const claves = m.entradas.map((e) => e.key);
      if (new Set(claves).size !== claves.length) {
        problemas.push(`"${m.key}" declara la misma entrada dos veces.`);
      }
    }

    // Coherencia de la familia con las propiedades del método.
    if (m.familia === 'cerrados' && !m.requiereIntervalo) {
      problemas.push(`"${m.key}" es de familia cerrada pero no requiere intervalo.`);
    }
    if (m.familia === 'abiertos' && m.requiereIntervalo) {
      problemas.push(`"${m.key}" es de familia abierta pero requiere intervalo.`);
    }
    if (m.usaDerivada && m.familia === 'cerrados') {
      problemas.push(`"${m.key}" es cerrado y usa derivada: no encaja en la taxonomía.`);
    }
  }

  for (const f of FAMILIAS) {
    if (metodosDeFamilia(f.key).length === 0) {
      problemas.push(`La familia "${f.key}" no tiene ningún método: quitala o agregale uno.`);
    }
  }

  return problemas;
}

/* ------------------------------------------------------------------ */
/* Lectura numérica de las filas de un runner                          */
/* ------------------------------------------------------------------ */

/** Un punto de la poligonal que se dibuja sobre el gráfico. */
export interface PuntoGrafico {
  x: number;
  y: number;
}

/**
 * Lee un valor de una fila de iteración COMO NÚMERO.
 *
 * ── Por qué no alcanza con `typeof v === 'number'` ────────────────────
 * Este es el bug más caro que viviría acá si nadie lo tipara: los runners
 * escriben cada valor con `fmt()`, que devuelve STRING ('-2.5', '3.16227766',
 * o '—' cuando no hay número). Una función que solo aceptaba `number`
 * devolvía NaN en TODAS las filas, sin lanzar ningún error: el gráfico se
 * dibujaba igual, pero sin puntos de iteración ni marcador de raíz. Cero
 * excepciones, cero consola roja, y un bug invisible para el usuario.
 *
 * Por eso `puntosDeIteracion` vive acá y no en el componente: es contrato
 * entre el runner y la pintura, y un contrato se testea solo.
 */
export function valorNumericoDe(fila: IterRow, clave: string): number {
  const v = (fila as Record<string, unknown>)[clave];
  if (typeof v === 'number') return Number.isFinite(v) ? v : NaN;
  if (typeof v === 'string') {
    // `fmt` nunca emite separadores de miles ni unidades, así que parseFloat
    // alcanza. '—' y '' caen en NaN, que es justo lo que el dibujo necesita.
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : NaN;
  }
  return NaN;
}

/** Primer valor numérico finito presente entre las claves dadas. */
export function primerValorFinito(fila: IterRow, claves: readonly string[]): number {
  for (const k of claves) {
    const v = valorNumericoDe(fila, k);
    if (Number.isFinite(v)) return v;
  }
  return NaN;
}

/**
 * Puntos (valor, residuo) de cada iteración, para dibujar la poligonal.
 *
 * Usa `columnaValor`/`columnaResiduo` del registro, así que no hay mapa de
 * métodos que mantener: cuando se agregó `puntoFijo` al registro, sus puntos
 * aparecieron solos. Si el método no declara residuo (un método cerrado
 * exacto, p. ej.), devuelve lista vacía en vez de inventar una columna.
 */
export function puntosDeIteracion(
  m: MetodoRegistrado,
  rows: readonly IterRow[],
): PuntoGrafico[] {
  const valor = m.columnaValor;
  const residuo = m.columnaResiduo;
  if (!valor || !residuo) return [];
  return rows.map((f) => ({ x: valorNumericoDe(f, valor), y: valorNumericoDe(f, residuo) }));
}

/**
 * Coordenada X de la raíz que el método reporta en su última fila.
 *
 * Antes esta lista de claves estaba hardcodeada en el componente
 * (['c','xm','xᵢ','x0']), o sea una copia más del conocimiento del runner.
 * Ahora sale de `columnaValor`: una sola fuente.
 */
export function coordenadaRaiz(m: MetodoRegistrado, fila: IterRow): number {
  return valorNumericoDe(fila, m.columnaValor);
}
