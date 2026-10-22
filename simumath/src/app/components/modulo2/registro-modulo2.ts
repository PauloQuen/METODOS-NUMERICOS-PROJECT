/**
 * REGISTRO DEL MÓDULO 2 — fuente única de verdad de sus métodos.
 *
 * Igual que en el Módulo 3, acá se escribe UNA vez cada familia y cada
 * método. La navegación, las tarjetas y las rutas se derivan de este
 * archivo, así que agregar un método nuevo no obliga a tocar las
 * pantallas una por una.
 *
 * El Módulo 2 resuelve SISTEMAS LINEALES, no ecuaciones sueltas ni
 * tablas de puntos. Por eso sus tipos y su motor son independientes de
 * los otros módulos.
 */

/* ------------------------------------------------------------------ */
/* Familias                                                            */
/* ------------------------------------------------------------------ */

export type FamiliaModulo2Key = 'directos' | 'iterativos';

export interface FamiliaModulo2 {
  key: FamiliaModulo2Key;
  nombre: string;
  /** El PRINCIPIO que clasifica: es lo que el alumno elige. */
  principio: string;
  descripcion: string;
}

export const FAMILIAS_MODULO2: readonly FamiliaModulo2[] = [
  {
    key: 'directos',
    nombre: 'Métodos directos',
    principio: 'Resuelven el sistema en un número finito de pasos, sin aproximaciones sucesivas.',
    descripcion:
      'Transforman la matriz hasta dejarla triangular o diagonal y despejan la solución exacta. ' +
      'Son la opción natural para sistemas pequeños o medianos y para comparar resultados.',
  },
  {
    key: 'iterativos',
    nombre: 'Métodos iterativos',
    principio: 'Construyen una sucesión de aproximaciones que se acerca a la solución.',
    descripcion:
      'Aprovechan matrices especiales —diagonalmente dominantes, tridiagonales o dispersas— ' +
      'para resolver sistemas grandes sin factorizar toda la matriz.',
  },
] as const;

/* ------------------------------------------------------------------ */
/* Métodos                                                             */
/* ------------------------------------------------------------------ */

export type MetodoModulo2Key = 'eliminacion-gauss' | 'matrices-especiales';

export interface MetodoModulo2 {
  key: MetodoModulo2Key;
  nombre: string;
  familia: FamiliaModulo2Key;
  /** Segmento de URL dentro de la familia. */
  ruta: string;
  resumen: string;
  idea: string;
  formula: string;
  criterioTexto: string;
  /** Color de acento del método. */
  color: string;
}

export const METODOS_MODULO2: readonly MetodoModulo2[] = [
  {
    key: 'eliminacion-gauss',
    nombre: 'Eliminación de Gauss',
    familia: 'directos',
    ruta: 'eliminacion-gauss',
    resumen:
      'Transforma el sistema en uno triangular mediante operaciones elementales y resuelve por sustitución regresiva.',
    idea:
      'Hace ceros debajo de cada pivote, con pivoteo parcial para evitar divisores pequeños, y deja el sistema listo para despejar.',
    formula: 'A x = b  →  U x = c',
    criterioTexto:
      'Termina en un número finito de pasos; el residuo máximo ‖Ax − b‖∞ mide la calidad de la solución.',
    color: '#1b5e7a',
  },
  {
    key: 'matrices-especiales',
    nombre: 'Matrices especiales (Gauss-Seidel)',
    familia: 'iterativos',
    ruta: 'matrices-especiales',
    resumen:
      'Resuelve sistemas con matrices diagonalmente dominantes o tridiagonales mediante iteraciones de Gauss-Seidel.',
    idea:
      'Aprovecha la estructura de la matriz para actualizar cada incógnita con los valores más recientes y converger sin factorizar.',
    formula: 'xᵢ⁽ᵏ⁺¹⁾ = (bᵢ − Σⱼ≠ᵢ aᵢⱼ xⱼ) / aᵢᵢ',
    criterioTexto:
      'Converge si la matriz es diagonalmente dominante; se detiene cuando la diferencia entre iteraciones baja de la tolerancia.',
    color: '#8a5a00',
  },
] as const;

/* ------------------------------------------------------------------ */
/* Derivaciones                                                        */
/* ------------------------------------------------------------------ */

export function metodosDeFamiliaModulo2(familia: FamiliaModulo2Key): MetodoModulo2[] {
  return METODOS_MODULO2.filter((m) => m.familia === familia);
}

export function metodoModulo2(key: MetodoModulo2Key): MetodoModulo2 {
  const metodo = METODOS_MODULO2.find((m) => m.key === key);
  if (!metodo) throw new Error(`Método del Módulo 2 desconocido: ${key}`);
  return metodo;
}

export function familiaModulo2(key: FamiliaModulo2Key): FamiliaModulo2 {
  const familia = FAMILIAS_MODULO2.find((f) => f.key === key);
  if (!familia) throw new Error(`Familia del Módulo 2 desconocida: ${key}`);
  return familia;
}

export function rutaDeFamiliaModulo2(familia: FamiliaModulo2Key): string {
  return `/modulo2/tipos/${familia}`;
}

export function rutaDeMetodoModulo2(metodo: MetodoModulo2): string {
  return `/modulo2/tipos/${metodo.familia}/${metodo.ruta}/teoria`;
}

export function resumenDeMetodoModulo2(metodo: MetodoModulo2): string {
  return `${familiaModulo2(metodo.familia).nombre} · ${metodo.criterioTexto}`;
}

/**
 * Validación de integridad del registro.
 * Devuelve una lista de problemas; vacía significa que todo está bien.
 */
export function validarRegistroModulo2(): string[] {
  const problemas: string[] = [];
  const keys = new Set<string>();
  const rutas = new Set<string>();

  for (const m of METODOS_MODULO2) {
    if (keys.has(m.key)) problemas.push(`Key repetida: ${m.key}`);
    keys.add(m.key);

    const rutaCompleta = `${m.familia}/${m.ruta}`;
    if (rutas.has(rutaCompleta)) problemas.push(`Ruta repetida: ${rutaCompleta}`);
    rutas.add(rutaCompleta);

    if (!FAMILIAS_MODULO2.some((f) => f.key === m.familia)) {
      problemas.push(`Familia inexistente en ${m.key}: ${m.familia}`);
    }
  }

  for (const f of FAMILIAS_MODULO2) {
    if (metodosDeFamiliaModulo2(f.key).length === 0) {
      problemas.push(`La familia ${f.key} no tiene métodos`);
    }
  }

  return problemas;
}
