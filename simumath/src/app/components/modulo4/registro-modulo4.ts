/**
 * REGISTRO DEL MÓDULO 4 — fuente única de verdad de sus métodos.
 *
 * ── Por qué un registro propio ───────────────────────────────────────
 * Igual que en los módulos 1, 2 y 3: el método se declara UNA vez acá y
 * la navegación, las tarjetas, las rutas y el buscador se derivan de
 * esta lista. Agregar mañana Simpson 3/8 o Gauss-Legendre es agregar una
 * entrada: no hay que tocar la pantalla de inicio ni la lista de
 * métodos.
 *
 * ── Una sola familia, dos métodos ────────────────────────────────────
 * Trapecio y Simpson comparten el mismo principio (aproximar el área
 * bajo la curva con piezas sencillas), así que viven en la familia
 * "newton-cotes". Se mantiene el flujo de tres niveles del Módulo 3
 * (familia → método → pestañas) porque deja lugar a los métodos que
 * vendrán sin reescribir la navegación.
 */

/* ------------------------------------------------------------------ */
/* Familias                                                            */
/* ------------------------------------------------------------------ */

export type FamiliaModulo4Key = 'newton-cotes';

export interface FamiliaModulo4 {
  key: FamiliaModulo4Key;
  nombre: string;
  /** El PRINCIPIO que clasifica, en una frase: es lo que el alumno elige. */
  principio: string;
  /** Qué hace y qué no hace esta familia. */
  descripcion: string;
}

export const FAMILIAS_MODULO4: readonly FamiliaModulo4[] = [
  {
    key: 'newton-cotes',
    nombre: 'Fórmulas de Newton-Cotes',
    principio: 'El área se aproxima por trozos: trapecios o parábolas entre puntos igualmente espaciados.',
    descripcion:
      'Se divide el intervalo [a, b] en n subintervalos de ancho h y se reemplaza la función por una pieza simple en cada trozo. El trapecio usa una recta entre dos puntos; Simpson, una parábola entre tres. Cuantos más trozos, más fino el resultado: el error baja como h² en trapecio y como h⁴ en Simpson.',
  },
] as const;

/* ------------------------------------------------------------------ */
/* Métodos                                                             */
/* ------------------------------------------------------------------ */

export type MetodoModulo4Key = 'trapecio' | 'simpson';

export interface MetodoModulo4 {
  key: MetodoModulo4Key;
  nombre: string;
  /** Segmento de URL y nombre de la carpeta, en kebab-case. */
  ruta: string;
  familia: FamiliaModulo4Key;
  /** Una frase con la que el alumno elige el método. */
  idea: string;
  /** La fórmula que se muestra en la tarjeta del índice. */
  formula: string;
  /** La misma fórmula en TeX, para renderizarla con KaTeX. */
  formulaTex?: string;
  /** Qué mide el método para decir "está bien". */
  criterioTexto: string;
  /** Color con el que se destaca el método en su página. */
  color: string;
}

export const METODOS_MODULO4: readonly MetodoModulo4[] = [
  {
    key: 'trapecio',
    nombre: 'Regla del trapecio compuesta',
    ruta: 'trapecio',
    familia: 'newton-cotes',
    idea: 'Une cada par de puntos consecutivos con una recta y suma el área de los trapecios.',
    formula: 'I ≈ (h/2) · [f(x₀) + 2f(x₁) + … + f(xₙ)]',
    formulaTex:
      'I \\approx \\frac{h}{2}\\left[f(x_0)+2f(x_1)+\\cdots+2f(x_{n-1})+f(x_n)\\right]',
    criterioTexto: 'Error de orden h²: al duplicar n, el error baja a la cuarta parte.',
    color: '#1b6b93',
  },
  {
    key: 'simpson',
    nombre: 'Regla de Simpson 1/3 compuesta',
    ruta: 'simpson',
    familia: 'newton-cotes',
    idea: 'Ajusta una parábola cada tres puntos y suma el área de esas parábolas.',
    formula: 'I ≈ (h/3) · [f(x₀) + 4f(x₁) + 2f(x₂) + … + f(xₙ)]',
    formulaTex:
      'I \\approx \\frac{h}{3}\\left[f(x_0)+4f(x_1)+2f(x_2)+4f(x_3)+\\cdots+f(x_n)\\right]',
    criterioTexto: 'Error de orden h⁴: al duplicar n, el error baja a la dieciseisava parte. Exige n par.',
    color: '#8a5a00',
  },
] as const;

/* ------------------------------------------------------------------ */
/* Consultas                                                           */
/* ------------------------------------------------------------------ */

/** Índice por key. */
export const METODO_MODULO4_POR_KEY = METODOS_MODULO4.reduce(
  (acc, m) => {
    acc[m.key] = m;
    return acc;
  },
  {} as Record<MetodoModulo4Key, MetodoModulo4>,
);

/** El método pedido, o un error que dice cuál faltó. */
export function metodoModulo4(key: MetodoModulo4Key): MetodoModulo4 {
  const m = METODO_MODULO4_POR_KEY[key];
  if (!m) throw new Error(`Método del Módulo 4 no registrado: "${key}"`);
  return m;
}

/** La familia pedida, o undefined si la key no existe. */
export function familiaModulo4(key: string | null): FamiliaModulo4 | undefined {
  if (!key) return undefined;
  return FAMILIAS_MODULO4.find((f) => f.key === key);
}

/** Métodos de una familia, en orden de declaración. */
export function metodosDeFamiliaModulo4(familia: FamiliaModulo4Key): MetodoModulo4[] {
  return METODOS_MODULO4.filter((m) => m.familia === familia);
}

/* ------------------------------------------------------------------ */
/* Rutas — derivadas del registro, nunca escritas a mano en las vistas */
/* ------------------------------------------------------------------ */

/** Lista de métodos de una familia: `/modulo4/tipos/newton-cotes`. */
export function rutaDeFamiliaModulo4(familia: FamiliaModulo4Key): string {
  return `/modulo4/tipos/${familia}`;
}

/** Pestaña de entrada de un método (`…/trapecio/teoria`). */
export function rutaDeMetodoModulo4(m: MetodoModulo4): string {
  return `${rutaDeFamiliaModulo4(m.familia)}/${m.ruta}/teoria`;
}

/** Resumen de una línea para las tarjetas del índice. */
export function resumenDeMetodoModulo4(m: MetodoModulo4): string {
  const familia = FAMILIAS_MODULO4.find((f) => f.key === m.familia);
  return `${familia?.nombre ?? ''} · ${m.criterioTexto}`;
}

/**
 * Chequeos de integridad del registro: keys y rutas únicas, familia
 * válida y kebab-case en la ruta.
 */
export function validarRegistroModulo4(): string[] {
  const problemas: string[] = [];
  const keys = new Set<string>();
  const rutas = new Set<string>();

  for (const m of METODOS_MODULO4) {
    if (keys.has(m.key)) problemas.push(`Método duplicado en el registro del Módulo 4: "${m.key}".`);
    keys.add(m.key);

    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(m.ruta)) {
      problemas.push(`"${m.key}" declara la ruta "${m.ruta}": tiene que ser kebab-case.`);
    }
    if (rutas.has(m.ruta)) problemas.push(`Ruta duplicada en el Módulo 4: "${m.ruta}".`);
    rutas.add(m.ruta);

    if (!FAMILIAS_MODULO4.some((f) => f.key === m.familia)) {
      problemas.push(`"${m.key}" declara la familia "${m.familia}", que no existe.`);
    }
  }

  for (const f of FAMILIAS_MODULO4) {
    if (metodosDeFamiliaModulo4(f.key).length === 0) {
      problemas.push(`La familia del Módulo 4 "${f.key}" no tiene ningún método.`);
    }
  }

  return problemas;
}
