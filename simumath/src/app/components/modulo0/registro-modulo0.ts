/**
 * REGISTRO DEL MÓDULO 0 — fuente única de verdad de sus métodos.
 *
 * ── Por qué existe ───────────────────────────────────────────────────
 * Igual que en los Módulos 1, 2 y 3: se declara UNA vez cada familia y
 * cada método, y de acá se derivan la portada, la lista por familia, la
 * miga de pan, las tarjetas y las entradas del buscador. Agregar un
 * método es agregar una entrada, una carpeta con su contenido y una ruta.
 *
 * ── Por qué el módulo se numera 0 ────────────────────────────────────
 * Los errores no son un tema más: son el marco con el que se lee
 * cualquier resultado numérico. Va ANTES del Módulo 1 en la navegación y
 * en la portada, pero NO renumera nada de lo existente: las rutas y los
 * nombres públicos de los Módulos 1, 2 y 3 quedan intactos.
 *
 * ── Relación con "Teoría y errores" del Módulo 1 ─────────────────────
 * Esa página es material transversal del Módulo 1 y se conserva tal
 * cual. El Módulo 0 la enlaza desde su teoría en vez de copiarla: acá
 * se desarrolla el error con ejercicios y calculadora propios; allá
 * queda el resumen que acompañaba a los métodos de raíces.
 */

/* ------------------------------------------------------------------ */
/* Familias (submódulos)                                               */
/* ------------------------------------------------------------------ */

export type FamiliaModulo0Key = 'aritmetica' | 'medicion' | 'truncamiento' | 'propagacion';

export interface FamiliaModulo0 {
  key: FamiliaModulo0Key;
  nombre: string;
  /** El PRINCIPIO que clasifica, en una frase: es lo que el alumno elige. */
  principio: string;
  /** Qué cubre esta familia y para qué sirve. */
  descripcion: string;
}

export const FAMILIAS_MODULO0: readonly FamiliaModulo0[] = [
  {
    key: 'aritmetica',
    nombre: 'Aritmética de máquina',
    principio: 'El computador no guarda todos los reales: guarda una aproximación con cifras finitas.',
    descripcion:
      'Antes de calcular hay que decidir cuántas cifras son significativas y cómo se redondea. Acá entran el redondeo, el truncamiento, el punto flotante y el épsilon de máquina. Es la fuente de error que no viene del método, sino de la representación.',
  },
  {
    key: 'medicion',
    nombre: 'Medición del error',
    principio: 'Para decir "qué tan mal" hay que comparar contra algo: el valor verdadero o la iteración anterior.',
    descripcion:
      'Error absoluto, relativo y porcentual; error verdadero frente a error aproximado; y los criterios de parada que usan esos errores como tolerancia. Es el vocabulario mínimo para leer cualquier tabla de iteraciones.',
  },
  {
    key: 'truncamiento',
    nombre: 'Error de truncamiento',
    principio: 'Un proceso infinito cortado en un número finito de términos deja un resto.',
    descripcion:
      'Las series de Taylor son el ejemplo canónico: se corta el desarrollo en n términos y queda un resto que depende de la derivada siguiente y de h. Acá se aprende a leer y acotar ese resto, y por qué O(hⁿ) no es una etiqueta decorativa.',
  },
  {
    key: 'propagacion',
    nombre: 'Propagación y condicionamiento',
    principio: 'Los errores de las entradas se amplifican (o se amortiguan) al operar con ellas.',
    descripcion:
      'Sumar, restar, multiplicar y dividir tienen reglas distintas. La fórmula general con derivadas parciales permite estimar cuánto error llega al resultado, y el número de condición dice si el problema amplifica el error de entrada.',
  },
] as const;

/* ------------------------------------------------------------------ */
/* Métodos                                                             */
/* ------------------------------------------------------------------ */

export type MetodoModulo0Key =
  | 'cifras-significativas'
  | 'error-absoluto-relativo'
  | 'taylor'
  | 'propagacion-errores';

export interface MetodoModulo0 {
  key: MetodoModulo0Key;
  nombre: string;
  /** Segmento de URL y nombre de la carpeta, en kebab-case. */
  ruta: string;
  familia: FamiliaModulo0Key;
  /** Una frase con la que el alumno elige el método. */
  idea: string;
  /** La fórmula que se muestra en la lista. */
  formula: string;
  /** Qué mide el método para decir "el resultado está bien". */
  criterioTexto: string;
  /** Color con el que se destaca en su página. */
  color: string;
}

export const METODOS_MODULO0: readonly MetodoModulo0[] = [
  {
    key: 'cifras-significativas',
    nombre: 'Cifras significativas y redondeo',
    ruta: 'cifras-significativas',
    familia: 'aritmetica',
    idea: 'Decide cuántas cifras del número son confiables, y cómo redondear sin inventar precisión.',
    formula: 'x̃ = fl(x) · (1 + δ), |δ| ≤ u',
    criterioTexto: 'Se reportan n cifras: el error absoluto no debe superar media unidad de la última cifra.',
    color: '#1b6b93',
  },
  {
    key: 'error-absoluto-relativo',
    nombre: 'Error absoluto, relativo y porcentual',
    ruta: 'error-absoluto-relativo',
    familia: 'medicion',
    idea: 'Cuantifica la diferencia con el valor de referencia y la normaliza por su magnitud.',
    formula: 'Eₐ = |x − x̄| · Eᵣ = Eₐ/|x̄| · E% = 100·Eᵣ',
    criterioTexto: 'El error relativo permite comparar aproximaciones de magnitudes distintas.',
    color: '#8a5a00',
  },
  {
    key: 'taylor',
    nombre: 'Series de Taylor y orden O(hⁿ)',
    ruta: 'taylor',
    familia: 'truncamiento',
    idea: 'Aproxima una función por un polinomio y acota lo que queda afuera al cortar la serie.',
    formula: 'f(x) = Σₖ₌₀ⁿ f⁽ᵏ⁾(a)(x−a)ᵏ/k! + Rₙ(x)',
    criterioTexto: 'El resto Rₙ se acota con la derivada (n+1) y la distancia al centro.',
    color: '#0f6b5c',
  },
  {
    key: 'propagacion-errores',
    nombre: 'Propagación de errores',
    ruta: 'propagacion-errores',
    familia: 'propagacion',
    idea: 'Estima cuánto error de las entradas llega al resultado de una operación o una función.',
    formula: 'Δf ≈ Σᵢ |∂f/∂xᵢ| · Δxᵢ',
    criterioTexto: 'En productos y cocientes se suman los errores relativos; en sumas y restas, los absolutos.',
    color: '#7c3aed',
  },
] as const;

/* ------------------------------------------------------------------ */
/* Consultas                                                           */
/* ------------------------------------------------------------------ */

export const METODO_MODULO0_POR_KEY = METODOS_MODULO0.reduce(
  (acc, m) => {
    acc[m.key] = m;
    return acc;
  },
  {} as Record<MetodoModulo0Key, MetodoModulo0>,
);

/** El método pedido, o un error que dice cuál faltó. */
export function metodoModulo0(key: MetodoModulo0Key): MetodoModulo0 {
  const m = METODO_MODULO0_POR_KEY[key];
  if (!m) throw new Error(`Método del Módulo 0 no registrado: "${key}"`);
  return m;
}

/** La familia pedida, o undefined si la key no existe. */
export function familiaModulo0(key: string | null): FamiliaModulo0 | undefined {
  if (!key) return undefined;
  return FAMILIAS_MODULO0.find((f) => f.key === key);
}

/** Métodos de una familia, en orden de declaración. */
export function metodosDeFamiliaModulo0(familia: FamiliaModulo0Key): MetodoModulo0[] {
  return METODOS_MODULO0.filter((m) => m.familia === familia);
}

/* ------------------------------------------------------------------ */
/* Rutas — derivadas del registro                                      */
/* ------------------------------------------------------------------ */

/** Lista de métodos de una familia: `/modulo0/tipos/medicion`. */
export function rutaDeFamiliaModulo0(familia: FamiliaModulo0Key): string {
  return `/modulo0/tipos/${familia}`;
}

/** Pestaña de entrada de un método (`…/taylor/teoria`). */
export function rutaDeMetodoModulo0(m: MetodoModulo0): string {
  return `${rutaDeFamiliaModulo0(m.familia)}/${m.ruta}/teoria`;
}

/** Resumen de una línea para las tarjetas del índice. */
export function resumenDeMetodoModulo0(m: MetodoModulo0): string {
  const familia = FAMILIAS_MODULO0.find((f) => f.key === m.familia);
  return `${familia?.nombre ?? ''} · ${m.criterioTexto}`;
}

/**
 * Chequeos de integridad: keys y rutas únicas, familia válida, kebab-case
 * y una familia sin métodos.
 */
export function validarRegistroModulo0(): string[] {
  const problemas: string[] = [];
  const keys = new Set<string>();
  const rutas = new Set<string>();

  for (const m of METODOS_MODULO0) {
    if (keys.has(m.key)) problemas.push(`Método duplicado en el registro del Módulo 0: "${m.key}".`);
    keys.add(m.key);

    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(m.ruta)) {
      problemas.push(`"${m.key}" declara la ruta "${m.ruta}": tiene que ser kebab-case.`);
    }
    if (rutas.has(m.ruta)) problemas.push(`Ruta duplicada en el Módulo 0: "${m.ruta}".`);
    rutas.add(m.ruta);

    if (!FAMILIAS_MODULO0.some((f) => f.key === m.familia)) {
      problemas.push(`"${m.key}" declara la familia "${m.familia}", que no existe.`);
    }
  }

  for (const f of FAMILIAS_MODULO0) {
    if (metodosDeFamiliaModulo0(f.key).length === 0) {
      problemas.push(`La familia del Módulo 0 "${f.key}" no tiene ningún método.`);
    }
  }

  return problemas;
}
