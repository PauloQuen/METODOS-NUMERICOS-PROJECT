/**
 * REGISTRO DE MÉTODOS DEL MÓDULO 2 — fuente única de verdad.
 *
 * ── Por qué el Módulo 2 tiene su propio registro ─────────────────────
 * El Módulo 1 tiene el suyo (`shared/domain/numerico/registro.ts`) y no
 * se toca. No es falta de compartir: son COSAS DISTINTAS. El registro del
 * Módulo 1 resuelve "encontrar la raíz de f(x) = 0" y sus métodos se
 * distinguen por si acotan la raíz, si usan derivada y si son abiertos o
 * cerrados. El Módulo 2 resuelve "A·x = b" y sus métodos se distinguen por
 * lo único que importa acá: si TRIANGULARIZAN el sistema (directos) o si
 * van APROXIMANDO la solución paso a paso (iterativos).
 *
 * Un solo registro con los dos módulos mezclados sería un archivo con
 * media tabla vacía y tres `if` por método. Dos registros chicos valen
 * más que uno grande y confuso.
 *
 * ── Cómo se agrega un método ─────────────────────────────────────────
 * 1. Implementá el motor en la carpeta del método (`directos/lu`, etc.).
 * 2. Agregá la entrada en `REGISTRO_MODULO2` con su familia, su ruta y su
 *    fórmula.
 * 3. Registrá la ruta en `app.routes.ts` (con `loadChildren`).
 * 4. Nada más: la landing, el breadcrumb y la navegación se actualizan
 *    solos.
 */

/* ------------------------------------------------------------------ */
/* Familias                                                            */
/* ------------------------------------------------------------------ */

export type FamiliaModulo2Key = 'directos' | 'iterativos';

export interface FamiliaModulo2 {
  key: FamiliaModulo2Key;
  nombre: string;
  /**
   * El PRINCIPIO que clasifica, en una frase. Va en la UI porque es la
   * idea que el alumno necesita para elegir método, no una etiqueta.
   */
  principio: string;
  /** Qué garantiza y qué no garantiza esta familia. */
  descripcion: string;
}

export const FAMILIAS_MODULO2: readonly FamiliaModulo2[] = [
  {
    key: 'directos',
    nombre: 'Métodos directos',
    principio:
      'Resuelven de una: triangularizan el sistema y despejan, sin iterar.',
    descripcion:
      'Transforman el sistema en uno triangular usando operaciones que no ' +
      'cambian la solución, y después despejan por sustitución hacia atrás. ' +
      'El número de operaciones es fijo y se conoce de antemano: no hay ' +
      'criterio de parada porque no hay iteración. Son los que se usan en la ' +
      'práctica, y su límite es el costo: O(n³) para la eliminación.',
  },
  {
    key: 'iterativos',
    nombre: 'Métodos iterativos',
    principio:
      'Repiten un paso: van armando una aproximación de la solución.',
    descripcion:
      'Despejan una incógnita usando las demás y repiten, acercándose a la ' +
      'solución paso a paso. Son lentos, pero su costo por paso es bajísimo y ' +
      'no forma matrices: para sistemas enormes son la única opción real. A ' +
      'cambio necesitan un criterio de parada y, sobre todo, que el sistema ' +
      'esté bien elegido: con la diagonally dominante o bien condicionada, ' +
      'convergen; con cualquier otra, pueden divergir.',
  },
] as const;

/* ------------------------------------------------------------------ */
/* Métodos                                                             */
/* ------------------------------------------------------------------ */

export type MetodoModulo2Key = 'gauss' | 'lu' | 'jacobi' | 'gaussSeidel';

/**
 * `planificado` = declarado en el registro pero sin motor todavía. La UI lo
 * muestra con su familia (para que la taxonomía quede completa y se vea
 * qué falta) pero no lo deja abrir.
 */
export type EstadoMetodoModulo2 = 'implementado' | 'planificado';

export interface MetodoModulo2 {
  key: MetodoModulo2Key;
  nombre: string;
  /** Segmento de URL y carpeta del método, en minúsculas y con guiones. */
  ruta: string;
  familia: FamiliaModulo2Key;
  estado: EstadoMetodoModulo2;

  /** La recurrencia o la operación central, para mostrarla al lado del nombre. */
  formula: string;
  /** La idea en una frase, sin jerga. */
  idea: string;
  /** Qué tiene que mirar el alumno para elegir este método y no otro. */
  cuandoUsarlo: string;

  /**
   * ¿El método ITERA?
   *
   * Es la diferencia que más se nota en la pantalla: un método iterativo
   * tiene tabla de iteraciones con columnas `x1` y `x2` (de ahí sale el
   * camino que se dibuja en el gráfico) y un criterio de parada. Un
   * método directo muestra los PASOS que hizo y nada más.
   */
  iterativo: boolean;
}

/**
 * Los métodos del Módulo 2.
 *
 * El ORDEN importa: es el orden en que aparecen en la landing y el que
 * ve el alumno. Primero los directos (que son los que se usan de verdad),
 * después los iterativos.
 */
export const REGISTRO_MODULO2: readonly MetodoModulo2[] = [
  {
    key: 'gauss',
    nombre: 'Eliminación Gaussiana',
    ruta: 'gauss',
    familia: 'directos',
    estado: 'implementado',
    formula: 'mᵢₖ = aᵢₖ / aₖₖ   ·   Rᵢ ← Rᵢ − mᵢₖ · Rₖ',
    idea:
      'Triangulariza el sistema con operaciones que no cambian la solución, y después despeja por sustitución hacia atrás.',
    cuandoUsarlo:
      'Es el método por defecto: resuelve cualquier sistema en un número fijo de pasos y no necesita ninguna condición previa. Con pivoteo parcial, además, es numéricamente estable.',
    iterativo: false,
  },
  {
    key: 'lu',
    nombre: 'Factorización LU',
    ruta: 'lu',
    familia: 'directos',
    estado: 'implementado',
    formula: 'A = L · U   ·   L·y = b   →   U·x = y',
    idea:
      'La eliminación gaussiana, pero guardada: la triangularización se hace una sola vez y cada sistema nuevo se resuelve con dos sustituciones.',
    cuandoUsarlo:
      'Cuando el mismo sistema (o la misma matriz A) se va a resolver muchas veces con distintos lados derechos. Es la base de los resolutores reales.',
    iterativo: false,
  },
  {
    key: 'jacobi',
    nombre: 'Jacobi',
    ruta: 'jacobi',
    familia: 'iterativos',
    estado: 'planificado',
    formula: 'xᵢ⁽ᵏ⁺¹⁾ = (bᵢ − Σⱼ≠ᵢ aᵢⱼ xⱼ⁽ᵏ⁾) / aᵢᵢ',
    idea:
      'Despeja cada incógnita usando el valor VIEJO de las demás, todas a la vez.',
    cuandoUsarlo:
      'Es el iterativo más simple de entender y de programar. Converge si la matriz es diagonalmente dominante; si no, puede oscilar o divergir.',
    iterativo: true,
  },
  {
    key: 'gaussSeidel',
    nombre: 'Gauss-Seidel',
    ruta: 'gauss-seidel',
    familia: 'iterativos',
    estado: 'planificado',
    formula: 'xᵢ⁽ᵏ⁺¹⁾ = (bᵢ − Σⱼ≠ᵢ aᵢⱼ xⱼ⁽ᵏ⁺¹⁾) / aᵢᵢ',
    idea:
      'Igual que Jacobi, pero usa el valor NUEVO de las incógnitas que ya resolvió.',
    cuandoUsarlo:
      'Cuando Jacobi converge pero despacio: Gauss-Seidel suele necesitar la mitad de iteraciones, porque la información nueva se usa de inmediato.',
    iterativo: true,
  },
] as const;

/* ------------------------------------------------------------------ */
/* Consultas del registro                                              */
/* ------------------------------------------------------------------ */

/** Índice por key. */
export const REGISTRO_MODULO2_POR_KEY = REGISTRO_MODULO2.reduce(
  (acc, m) => {
    acc[m.key] = m;
    return acc;
  },
  {} as Record<MetodoModulo2Key, MetodoModulo2>,
);

/** Atajo seguro: devolver el método o un error que diga qué se pasó. */
export function metodoModulo2(key: MetodoModulo2Key): MetodoModulo2 {
  const m = REGISTRO_MODULO2_POR_KEY[key];
  if (!m) {
    throw new Error(`Método del Módulo 2 no registrado: "${key}".`);
  }
  return m;
}

/** Métodos de una familia, en el orden en que se declararon. */
export function metodosDeFamiliaModulo2(
  familia: FamiliaModulo2Key,
): MetodoModulo2[] {
  return REGISTRO_MODULO2.filter((m) => m.familia === familia);
}

/** La familia a la que pertenece un método. */
export function familiaDeModulo2(key: MetodoModulo2Key): FamiliaModulo2 {
  const metodo = REGISTRO_MODULO2_POR_KEY[key];
  const f = FAMILIAS_MODULO2.find((x) => x.key === metodo.familia);
  if (!f) {
    throw new Error(`Familia del Módulo 2 no registrada: "${metodo.familia}".`);
  }
  return f;
}

/* ------------------------------------------------------------------ */
/* Rutas — derivadas del registro, nunca escritas a mano en las vistas  */
/* ------------------------------------------------------------------ */

/** Pantalla que lista los métodos de una familia (`/modulo2/tipos/directos`). */
export function rutaDeFamiliaModulo2(familia: FamiliaModulo2Key): string {
  return `/modulo2/tipos/${familia}`;
}

/** Pestaña de entrada de un método (`/modulo2/tipos/directos/gauss/teoria`). */
export function rutaDeMetodoModulo2(m: MetodoModulo2): string {
  return `${rutaDeFamiliaModulo2(m.familia)}/${m.ruta}/teoria`;
}

/**
 * Resumen de una línea con lo que decide la elección del método.
 *
 * Se arma con los DATOS del registro y no con texto escrito a mano, para
 * que no pueda contradecir a los datos.
 */
export function resumenDeMetodoModulo2(m: MetodoModulo2): string {
  return m.iterativo
    ? 'itera: tabla de iteraciones y criterio de parada'
    : 'pasos fijos: no itera y no tiene criterio de parada';
}

/* ------------------------------------------------------------------ */
/* Validación del registro                                              */
/* ------------------------------------------------------------------ */

/**
 * Chequeos de integridad. Devuelve los problemas encontrados en vez de
 * lanzar, para que en desarrollo aparezcan TODOS juntos.
 */
export function validarRegistroModulo2(): string[] {
  const problemas: string[] = [];

  const vistos = new Set<string>();
  const rutas = new Set<string>();

  for (const m of REGISTRO_MODULO2) {
    if (vistos.has(m.key)) {
      problemas.push(`Método duplicado en el registro del Módulo 2: "${m.key}".`);
    }
    vistos.add(m.key);

    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(m.ruta)) {
      problemas.push(
        `"${m.key}" declara la ruta "${m.ruta}": tiene que ser minúsculas con guiones, ej. "gauss-seidel".`,
      );
    }
    if (rutas.has(m.ruta)) {
      problemas.push(`Ruta duplicada en el registro del Módulo 2: "${m.ruta}".`);
    }
    rutas.add(m.ruta);

    if (!FAMILIAS_MODULO2.some((f) => f.key === m.familia)) {
      problemas.push(`"${m.key}" declara la familia "${m.familia}", que no existe.`);
    }

    if (m.idea.length < 20) {
      problemas.push(
        `"${m.key}" tiene una idea demasiado corta: la idea es lo que lee el alumno.`,
      );
    }
    if (m.cuandoUsarlo.length < 40) {
      problemas.push(`"${m.key}" no explica cuándo usarlo.`);
    }
  }

  for (const f of FAMILIAS_MODULO2) {
    if (metodosDeFamiliaModulo2(f.key).length === 0) {
      problemas.push(
        `La familia "${f.key}" no tiene ningún método: quitala o agregale uno.`,
      );
    }
  }

  return problemas;
}
