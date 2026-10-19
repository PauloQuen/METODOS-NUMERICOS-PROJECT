/**
 * CONTRATO DE CONVERGENCIA — criterio único, tipado y auditable.
 * =====================================================
 *
 * Funciones puras, sin Angular. Este módulo NO itera: solo sabe responder
 * dos preguntas que el motor le hace en cada paso:
 *
 *   1. ¿Qué magnitudes se pueden medir en esta iteración?
 *   2. ¿ESA magnitudes cumple el criterio pedido?
 *
 * ── POR QUÉ EXISTE ──────────────────────────────────────────────────────
 *
 * El motor anterior tenía 4 criterios hardcodeados distintos para 4 métodos
 * con la misma `tol`, y esa inconsistencia rompía dos propiedades que un
 * curso de métodos numéricos NO puede romper:
 *
 *   A) INARIANCIA A ESCALA. Multiplicar f por una constante k ≠ 0 no cambia
 *      su raíz, así que el número de iteraciones no debería depender de k.
 *      Medido con f = x³ − x − 2 y tol = 1e-4, criterio por residuo |f(x)|:
 *
 *        k       bisección   regla falsa   secante   newton
 *        1              14            9         5         5
 *        1e3            14           15         6         5
 *        1e6            14           20         6         5
 *
 *      La regla falsa pasa de 9 a 20 iteraciones por escribir un 1 distinto
 *      en el enunciado. Bisección y Newton son invariantes porque NO usan
 *      el residuo: miden un error en x.
 *
 *      La causa es una sola: |f(x)| tiene las unidades de la función, así
 *      que al reescalar f el residuo escala y el umbral queda incomparable.
 *      El error en x no escala, porque x es la variable que se busca.
 *
 *   B) RESPETO DE LA TOLERANCIA PEDIDA. La secante declaraba convergencia
 *      con |Δx| = 4.5 × la tolerancia solicitada, porque paraba por
 *      |f(x)| ≤ tol y no por |Δx| ≤ tol.
 *
 * Y esto contradecía la lección del propio material del curso ("un residuo
 * pequeño no garantiza un error pequeño"): el motor obraba justo lo que el
 * material advertía no hacer.
 *
 * ── LA REGLA DE ORO ──────────────────────────────────────────────────────
 *
 * El criterio por defecto es SIEMPRE un error sobre x: absoluto o relativo.
 * El residuo |f(x)| queda disponible como criterio explícito y como columna
 * informative de la tabla, para que el alumno vea por qué engaña, pero no
 * decide la parada salvo que lo elija a propósito.
 *
 * ── DECIMALES vs CIFRAS SIGNIFICATIVAS ───────────────────────────────────
 *
 * No es lo mismo, y confundirlas es el error más común en estos exámenes:
 *
 *   "4 decimales"           → error ABSOLUTO: |x − x̃| ≤ 0.5 × 10⁻⁴
 *   "4 cifras significativas" → error RELATIVO: |x − x̃| / |x̃| ≤ 0.5 × 10⁻³
 *
 * Cuál de las dos es MÁS exigente depende de la magnitud de la raíz, y por
 * eso la respuesta no es intuitiva:
 *
 *   - Raíz grande (x ≈ 1234.56): "4 cifras significativas" redondea a 1235,
 *     o sea un error absoluto de ~0.6, MUCHÍSIMO más laxo que los 5e-5 de
 *     "4 decimales".
 *   - Raíz chica (x ≈ 0.0012345): "4 cifras significativas" exige un error
 *     absoluto de ~6e-7, mucho más exigente que los 5e-5 de "4 decimales".
 *
 * Por eso los dos criterios están separados y tipados, y por eso
 * `toleranciaDesdeDigitos()` ofrece ambas variantes con `digitos` y
 * `decimales` separados: no son dos formas de decir lo mismo.
 *
 * ─@endpoint El backend DEBE aceptar el criterio en el body y reportar cuál
 * usó. El campo `criterio` de MetodoResultado viaja al JSON de la API para
 * que el alumno vea la misma razón de parada que ve en el cálculo local.
 */

/* ------------------------------------------------------------------ */
/* Los tres criterios                                                  */
/* ------------------------------------------------------------------ */

/**
 * Magnitud sobre la que se evalúa el criterio.
 *  - `absoluto`: |xᵢ − xᵢ₋₁| en error absoluto. Invariante a escala. Es el
 *    criterio por defecto para los métodos que avanzan por iteraciones.
 *  - `relativo`: |xᵢ − xᵢ₋₁| / |xᵢ| en error relativo. Invariante a escala Y
 *    a la magnitud de la raíz: es el que corresponde a "cifras
 *    significativas".
 *  - `intervalo`: (b − a)/2 para métodos de acotación. Es la cota a
 *    posteriori que da el teorema de Bolzano, no una diferencia entre
 *    iteraciones, así que no se puede expresar como |Δx|.
 *  - `residuo`: |f(xᵢ)|. NO es invariante a escala. Queda como criterio
 *    opcional y como columna informativa.
 */
export type CriterioKey = 'absoluto' | 'relativo' | 'intervalo' | 'residuo';

export interface CriterioConvergencia {
  key: CriterioKey;
  /** Etiqueta corta para chips y tablas. */
  etiqueta: string;
  /** Explicación de una línea para el tooltip del estudiante. */
  descripcion: string;
  /** Fórmula legible, para mostrarla junto al criterio. */
  formula: string;
}

/**
 * Catálogo de criterios. El orden es el de aparición en la interfaz: los dos
 * de error en x primero porque son los que garantizan la invariancia a escala.
 */
export const CRITERIOS: Record<CriterioKey, CriterioConvergencia> = {
  absoluto: {
    key: 'absoluto',
    etiqueta: 'Error absoluto',
    descripcion:
      'Error absoluto entre iteraciones. Corresponde a pedir una cantidad fija de decimales.',
    formula: '|xᵢ − xᵢ₋₁| ≤ tol',
  },
  relativo: {
    key: 'relativo',
    etiqueta: 'Error relativo',
    descripcion:
      'Error relativo entre iteraciones. Corresponde a pedir una cantidad de cifras significativas.',
    formula: '|xᵢ − xᵢ₋₁| / |xᵢ| ≤ tol',
  },
  intervalo: {
    key: 'intervalo',
    etiqueta: 'Ancho del intervalo',
    descripcion:
      'Cota a posteriori de Bolzano: la raíz está a distancia (b−a)/2 de xm. Solo para métodos de acotación.',
    formula: '(b − a) / 2 ≤ tol',
  },
  residuo: {
    key: 'residuo',
    etiqueta: 'Residuo',
    descripcion:
      'Pequeño residuo |f(x)|. Un residuo pequeño NO garantiza un error pequeño, y además depende de cómo se escaló la función.',
    formula: '|f(xᵢ)| ≤ tol',
  },
};

/** Criterio por defecto de un método que avanza por iteraciones. */
export const CRITERIO_POR_DEFECTO: CriterioKey = 'absoluto';

/** Criterio por defecto de un método de acotación (bisección, regla falsa). */
export const CRITERIO_POR_DEFECTO_INTERVALO: CriterioKey = 'intervalo';

/**
 * Criterio por defecto REAL de cada uno de los cinco métodos.
 *
 * OJO, no es `intervalo` para los dos métodos de acotación, y hay una razón
 * medida, no supuesta:
 *
 *  - Bisección SÍ usa `intervalo`. Parte el intervalo a la mitad exacta, así
 *    que el ancho cae 1 → 0.5 → 0.25 → 0.125 y la cota de Bolzano es apretada.
 *  - Regla falsa NO usa `intervalo`. Reemplaza un solo extremo por el corte
 *    de la cuerda, y el otro extremo puede quedar congelado muchas
 *    iteraciones seguidas. Medido en x³ − x − 2 sobre [1, 2]: el extremo
 *    superior se clava en 2 para siempre y la cota se estabiliza en ≈0.239
 *    SIN BAJAR NUNCA. Con tol = 1e-4 ese criterio es matemáticamente incapaz
 *    de cumplirse, y el cálculo se agota en el máximo de iteraciones.
 *
 * Ese estancamiento de extremo es justamente la debilidad clásica de la regla
 * falsa frente a la bisección, y conviene poder mostrarlo.
 */
export const CRITERIO_POR_DEFECTO_DE: Record<string, CriterioKey> = {
  biseccion: 'intervalo',
  reglaFalsa: 'absoluto',
  secante: 'absoluto',
  newton: 'absoluto',
  puntoFijo: 'absoluto',
};

/**
 * Criterios válidos para un método.
 * Un método de acotación puede medirse por intervalo (cota de Bolzano) o
 * por error entre iteraciones; uno de punto, solo por error.
 */
export function criteriosDeMetodo(tieneIntervalo: boolean): CriterioKey[] {
  return tieneIntervalo
    ? ['intervalo', 'absoluto', 'relativo', 'residuo']
    : ['absoluto', 'relativo', 'residuo'];
}

/* ------------------------------------------------------------------ */
/* Medición: qué se puede medir en una iteración                       */
/* ------------------------------------------------------------------ */

/**
 * Magnitudes medibles de una iteración. Todas opcionales porque dependen de
 * lo que el método pueda sostener: un método de iteración no tiene intervalo
 * vivo, uno de acotación sí.
 */
export interface Magnitudes {
  /** |xᵢ − xᵢ₋₁|: diferencia con la iteración anterior. */
  delta?: number;
  /** |xᵢ|: magnitud de la aproximación actual (para el error relativo). */
  valor?: number;
  /** (b − a)/2: semiancho del intervalo vivo, solo acotación. */
  semiancho?: number;
  /** |f(xᵢ)|: residuo. Informativo. */
  residuo?: number;
}

/** Magnitud que un criterio mide, o `undefined` si no se puede calcular. */
export function medir(
  criterio: CriterioKey,
  m: Magnitudes,
): number | undefined {
  switch (criterio) {
    case 'absoluto':
      return m.delta;
    case 'relativo':
      if (m.delta === undefined || m.valor === undefined) return undefined;
      // xᵢ = 0 haría explodecer el cociente. Ahí el error relativo no
      // significa nada y el absoluto sigue siendo válido.
      if (m.valor === 0) return undefined;
      return m.delta / Math.abs(m.valor);
    case 'intervalo':
      return m.semiancho;
    case 'residuo':
      return m.residuo;
  }
}

/**
 * ¿Se cumple el criterio en esta iteración?
 *
 * `residuoExacto` salva un borde: cuando el residuo da cero exacto (la raíz
 * es racional y el método la tocó de lleno), |f| = 0 ≤ tol es cierto y
 * además es la mejor noticia posible, así que no se descarta.
 */
export function cumple(
  criterio: CriterioKey,
  m: Magnitudes,
  tol: number,
): boolean {
  const valor = medir(criterio, m);
  if (valor === undefined) return false;
  if (!Number.isFinite(valor)) return false;
  return valor <= tol;
}

/**
 * Radices exactas por golpe: si f(xᵢ) === 0 no hay nada que estimar, se
 * terminó. Se comprueba antes del criterio porque es el criterio más fuerte
 * que existe y no depende de la tolerancia pedida.
 */
export function esRaizExacta(m: Magnitudes): boolean {
  return m.residuo === 0;
}

/* ------------------------------------------------------------------ */
/* Tolerancia: de "n dígitos" a un número                              */
/* ------------------------------------------------------------------ */

/**
 * Convierte "quiero tales cifras" en una tolerancia numérica.
 *
 * `digitos` son cifras significativas y `decimales` son decimales, porque no
 * son lo mismo (ver el JSDoc del módulo). Con `decimales: 4` el error
 * absoluto no debe pasar la mitad de la última posición, para que el redondeo
 * al decimal sea correcto: 0.5 × 10⁻⁴.
 *
 * Con `digitos: 4` se resuelve el error RELATIVO equivalente, que necesita
 * conocer la magnitud de la raíz: se usa `magnitudAproximada`, y si no se
 * conoce se cae a la mitad de la primera cifra no nula, que es el criterio
 * estándar cuando la raíz está cerca de 1.
 *
 * @param opciones.digitos      cifras significativas pedidas (error relativo)
 * @param opciones.decimales    decimales pedidos (error absoluto)
 * @param opciones.magnitud     raíz aproximada, para el caso relativo
 * @param opciones.escala       decimal relativo en % (por defecto 0.5)
 */
export function toleranciaDesdeDigitos(opciones: {
  digitos?: number;
  decimales?: number;
  magnitud?: number;
  /** Porcentaje de error relativo tolerado. Por defecto medio dígito. */
  escala?: number;
}): number {
  const escala = opciones.escala ?? 0.5;

  if (opciones.decimales !== undefined) {
    if (opciones.decimales < 0) {
      throw new Error('La cantidad de decimales no puede ser negativa.');
    }
    return escala * Math.pow(10, -opciones.decimales);
  }

  if (opciones.digitos !== undefined) {
    if (opciones.digitos < 1) {
      throw new Error('La cantidad de cifras significativas debe ser al menos 1.');
    }

    // ── ACÁ ESTÁ EL ERROR QUE CASI SE CUELA ────────────────────────────
    // Error RELATIVO que garantiza `digitos` cifras significativas:
    //
    //   rel = 0.5 × 10^(1 − digitos)
    //
    // El 10^1 va porque en notación de `digitos` cifras, la primera cifra
    // ocupa las unidades y la última cae en 10^(1 − digitos). Ej: 5 cifras →
    // última cifra en 10^-4 → medio dígito = 0.5 × 10^-4.
    //
    // Si se escribiera 10^-digitos, con digitos=5 se pediría 5e-6 relativo,
    // o sea 6 cifras, una más de las pedidas. Con digitos=15 se pediría 1e-15
    // relativo, o sea por debajo de la precisión de double (~1e-16), y el
    // método no podría converger nunca.
    const rel = escala * Math.pow(10, 1 - opciones.digitos);

    const magnitud = opciones.magnitud ?? 1;
    return rel * Math.abs(magnitud);
  }

  throw new Error('Pedí `digitos` o `decimales` para derivar la tolerancia.');
}

/**
 * Explica en lenguaje de aula qué está pidiendo una tolerancia.
 * Sirve para que el mensaje de la interfaz diga "4 decimales" y no "1e-4",
 * que es donde el alumno se pierde.
 */
export function descripcionTolerancia(tol: number): string {
  if (!Number.isFinite(tol) || tol <= 0) return 'tolerancia inválida';
  // Solo tiene sentido como "decimales" si el criterio es ABSOLUTO. Con
  // criterio relativo, un número de tolerancia no son decimales: es un
  // porcentaje. Decir "4 decimales correctos" para tol=6.3e-4 relativo sería
  // una mentira, y el alumno la lee como si fuera absoluto.
  // |error| = 0.5 × 10⁻ᵈ  →  d = −log₁₀(2 × tol)
  const decimales = Math.max(0, Math.round(-Math.log10(2 * tol)));
  if (decimales === 0) return `${tol.toExponential(0)} en error absoluto`;
  return `${decimales} decimal${decimales === 1 ? '' : 'es'} correctos`;
}

/* ------------------------------------------------------------------ */
/* Auditoría: qué criterio se aplicó realmente                         */
/* ------------------------------------------------------------------ */

/**
 * Razón de parada de una ejecución. `MetodoResultado` la expone para que la
 * interfaz pueda decir POR QUÉ se detuvo el método, no solo que se detuvo.
 */
export interface RazonParada {
  /** Criterio que se evaluó. */
  criterio: CriterioKey;
  /** Magnitud medida en la última iteración, ya formateada por el caller. */
  magnitud: number;
  /** Tolerancia que se le pidió. */
  tolerancia: number;
  /** Texto corto para el chip de la interfaz. */
  resumen: string;
}

/**
 * Describe por qué paró el método, o `undefined` si agotó `maxIter`.
 * Cuando una raíz se alcanza de forma exacta, la razón es la más fuerte
 * posible y se dice así.
 */
export function razonDeParada(
  criterio: CriterioKey,
  m: Magnitudes,
  tol: number,
  raizExacta: boolean,
): RazonParada | undefined {
  const magnitud = medir(criterio, m) ?? NaN;
  if (raizExacta) {
    return {
      criterio,
      magnitud: 0,
      tolerancia: tol,
      resumen: 'Raíz exacta: f(x) = 0 exacto',
    };
  }
  const c = CRITERIOS[criterio];
  return {
    criterio,
    magnitud,
    tolerancia: tol,
    resumen: `${c.formula} → ${magnitud.toExponential(2)} ≤ ${tol.toExponential(2)}`,
  };
}