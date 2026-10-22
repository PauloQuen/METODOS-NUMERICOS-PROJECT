/**
 * REGISTRO DEL MÓDULO 3 — fuente única de verdad de sus métodos.
 *
 * ── Por qué hay un registro aparte del Módulo 1 ───────────────────────
 * El registro del Módulo 1 está atado a su taxonomía (cerrados /
 * abiertos / analíticos) y a su motor (`methods.ts`, con `f(x) = 0`).
 * Acá el problema es otro: hay una tabla de datos y hay que construir un
 * modelo. Meterlos en el mismo registro obligaría a llenar de campos
 * vacíos los métodos de ambos módulos.
 *
 * Lo que se copia es la IDEA, no el archivo: UNA vez cada método, con su
 * familia y sus datos, y todo lo demás (navegación, tarjetas, rutas) se
 * deriva de acá. Así, si mañana se agrega "Splines cúbicos", se agrega
 * una entrada y aparece solo en todas las pantallas.
 */

/* ------------------------------------------------------------------ */
/* Familias                                                            */
/* ------------------------------------------------------------------ */

export type FamiliaModulo3Key = 'interpolacion' | 'ajuste';

export interface FamiliaModulo3 {
  key: FamiliaModulo3Key;
  nombre: string;
  /** El PRINCIPIO que clasifica, en una frase: es lo que el alumno elige. */
  principio: string;
  /** Qué hace y qué no hace esta familia. */
  descripcion: string;
}

export const FAMILIAS_MODULO3: readonly FamiliaModulo3[] = [
  {
    key: 'interpolacion',
    nombre: 'Interpolación',
    principio: 'El modelo PASA EXACTAMENTE por todos los puntos de la tabla.',
    descripcion:
      'Con n + 1 puntos se construye un polinomio único de grado ≤ n que los toca a todos. Sirve cuando los datos son exactos (tablas de laboratorio, funciones conocidas) y se quiere el valor en un punto intermedio.',
  },
  {
    key: 'ajuste',
    nombre: 'Ajuste de curvas',
    principio: 'El modelo NO pasa por los puntos: pasa lo más CERCA posible.',
    descripcion:
      'Cuando los datos traen error de medición, obligar a la curva a tocar cada punto es un error. Acá se elige una forma (una recta) y se busca la que minimiza la suma de los errores al cuadrado. Es el método de los mínimos cuadrados.',
  },
] as const;

/* ------------------------------------------------------------------ */
/* Métodos                                                             */
/* ------------------------------------------------------------------ */

export type MetodoModulo3Key = 'lagrange' | 'minimos-cuadrados';

export interface MetodoModulo3 {
  key: MetodoModulo3Key;
  nombre: string;
  /**
   * Segmento de URL y nombre de la carpeta, en kebab-case. Vive acá
   * porque la URL es parte de los datos del método.
   */
  ruta: string;
  familia: FamiliaModulo3Key;
  /** Una frase con la que el alumno elige el método. */
  idea: string;
  /** La fórmula que se muestra en la tarjeta del índice. */
  formula: string;
  /** Qué mide el método para decir "está bien". */
  criterioTexto: string;
  /** Color con el que se destaca el método en su página. */
  color: string;
}

export const METODOS_MODULO3: readonly MetodoModulo3[] = [
  {
    key: 'lagrange',
    nombre: 'Interpolación de Lagrange',
    ruta: 'lagrange',
    familia: 'interpolacion',
    idea: 'Construye un polinomio que pasa por todos los puntos, como suma de bases Lᵢ(x).',
    formula: 'P(x) = Σ yᵢ · Lᵢ(x)',
    criterioTexto: 'Pasa exacto por los n + 1 puntos; el error depende de la función real.',
    color: '#1b6b93',
  },
  {
    key: 'minimos-cuadrados',
    nombre: 'Mínimos cuadrados',
    ruta: 'minimos-cuadrados',
    familia: 'ajuste',
    idea: 'Ajusta una recta a datos con error, minimizando la suma de los residuos al cuadrado.',
    formula: 'y = a₀ + a₁·x',
    criterioTexto: 'Coeficiente de determinación r² cercano a 1 y residuos sin patrón.',
    color: '#8a5a00',
  },
] as const;

/* ------------------------------------------------------------------ */
/* Consultas                                                           */
/* ------------------------------------------------------------------ */

/** Índice por key. */
export const METODO_MODULO3_POR_KEY = METODOS_MODULO3.reduce(
  (acc, m) => {
    acc[m.key] = m;
    return acc;
  },
  {} as Record<MetodoModulo3Key, MetodoModulo3>,
);

/** El método pedido, o un error que dice cuál faltó. */
export function metodoModulo3(key: MetodoModulo3Key): MetodoModulo3 {
  const m = METODO_MODULO3_POR_KEY[key];
  if (!m) throw new Error(`Método del Módulo 3 no registrado: "${key}"`);
  return m;
}

/** La familia pedida, o undefined si la key no existe. */
export function familiaModulo3(key: string | null): FamiliaModulo3 | undefined {
  if (!key) return undefined;
  return FAMILIAS_MODULO3.find((f) => f.key === key);
}

/** Métodos de una familia, en orden de declaración. */
export function metodosDeFamiliaModulo3(familia: FamiliaModulo3Key): MetodoModulo3[] {
  return METODOS_MODULO3.filter((m) => m.familia === familia);
}

/* ------------------------------------------------------------------ */
/* Rutas — derivadas del registro, nunca escritas a mano en las vistas  */
/* ------------------------------------------------------------------ */

/** Lista de métodos de una familia: `/modulo3/tipos/interpolacion`. */
export function rutaDeFamiliaModulo3(familia: FamiliaModulo3Key): string {
  return `/modulo3/tipos/${familia}`;
}

/** Pestaña de entrada de un método (`…/lagrange/teoria`). */
export function rutaDeMetodoModulo3(m: MetodoModulo3): string {
  return `${rutaDeFamiliaModulo3(m.familia)}/${m.ruta}/teoria`;
}

/** Resumen de una línea para las tarjetas del índice. */
export function resumenDeMetodoModulo3(m: MetodoModulo3): string {
  const familia = FAMILIAS_MODULO3.find((f) => f.key === m.familia);
  return `${familia?.nombre ?? ''} · ${m.criterioTexto}`;
}

/**
 * Chequeos de integridad del registro, igual que en el Módulo 1:
 * keys y rutas únicas, familia válida y kebab-case en la ruta.
 */
export function validarRegistroModulo3(): string[] {
  const problemas: string[] = [];
  const keys = new Set<string>();
  const rutas = new Set<string>();

  for (const m of METODOS_MODULO3) {
    if (keys.has(m.key)) problemas.push(`Método duplicado en el registro del Módulo 3: "${m.key}".`);
    keys.add(m.key);

    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(m.ruta)) {
      problemas.push(`"${m.key}" declara la ruta "${m.ruta}": tiene que ser kebab-case.`);
    }
    if (rutas.has(m.ruta)) problemas.push(`Ruta duplicada en el Módulo 3: "${m.ruta}".`);
    rutas.add(m.ruta);

    if (!FAMILIAS_MODULO3.some((f) => f.key === m.familia)) {
      problemas.push(`"${m.key}" declara la familia "${m.familia}", que no existe.`);
    }
  }

  for (const f of FAMILIAS_MODULO3) {
    if (metodosDeFamiliaModulo3(f.key).length === 0) {
      problemas.push(`La familia del Módulo 3 "${f.key}" no tiene ningún método.`);
    }
  }

  return problemas;
}
