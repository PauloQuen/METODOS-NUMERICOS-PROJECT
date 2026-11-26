/**
 * REGISTRO DEL MÓDULO 5 — fuente única de verdad de sus métodos.
 *
 * Misma idea que en los módulos anteriores: el método se declara una vez
 * acá y la navegación, las tarjetas, las rutas y el buscador se derivan
 * de esta lista.
 */

export type FamiliaModulo5Key = 'edo-clasicos';

export interface FamiliaModulo5 {
  key: FamiliaModulo5Key;
  nombre: string;
  principio: string;
  descripcion: string;
}

export const FAMILIAS_MODULO5: readonly FamiliaModulo5[] = [
  {
    key: 'edo-clasicos',
    nombre: 'Métodos de un paso',
    principio:
      'Desde un punto conocido (tₙ, yₙ) se estima la pendiente y se avanza un paso h hasta el punto siguiente.',
    descripcion:
      'Resuelven un problema de valor inicial y′ = f(t, y), y(t₀) = y₀. Euler usa una sola pendiente y es de orden 1; RK4 combina cuatro pendientes y es de orden 4. La diferencia se ve en la calculadora: con el mismo h, RK4 comete un error muchísimo menor.',
  },
] as const;

export type MetodoModulo5Key = 'euler' | 'rk4';

export interface MetodoModulo5 {
  key: MetodoModulo5Key;
  nombre: string;
  ruta: string;
  familia: FamiliaModulo5Key;
  idea: string;
  formula: string;
  formulaTex?: string;
  criterioTexto: string;
  color: string;
}

export const METODOS_MODULO5: readonly MetodoModulo5[] = [
  {
    key: 'euler',
    nombre: 'Euler explícito',
    ruta: 'euler',
    familia: 'edo-clasicos',
    idea: 'Avanza en línea recta con la pendiente del punto actual.',
    formula: 'yₙ₊₁ = yₙ + h · f(tₙ, yₙ)',
    formulaTex: 'y_{n+1} = y_n + h\\,f(t_n, y_n)',
    criterioTexto: 'Orden 1: al dividir h por 2, el error global baja a la mitad. Estable si h ≤ 2/|λ|.',
    color: '#1b6b93',
  },
  {
    key: 'rk4',
    nombre: 'Runge-Kutta de orden 4 (RK4)',
    ruta: 'rk4',
    familia: 'edo-clasicos',
    idea: 'Combina cuatro pendientes dentro del paso con pesos 1-2-2-1.',
    formula: 'yₙ₊₁ = yₙ + (h/6)(k₁ + 2k₂ + 2k₃ + k₄)',
    formulaTex: 'y_{n+1} = y_n + \\frac{h}{6}\\left(k_1 + 2k_2 + 2k_3 + k_4\\right)',
    criterioTexto: 'Orden 4: al dividir h por 2, el error global baja a la dieciseisava parte.',
    color: '#8a5a00',
  },
] as const;

export const METODO_MODULO5_POR_KEY = METODOS_MODULO5.reduce(
  (acc, m) => {
    acc[m.key] = m;
    return acc;
  },
  {} as Record<MetodoModulo5Key, MetodoModulo5>,
);

export function metodoModulo5(key: MetodoModulo5Key): MetodoModulo5 {
  const m = METODO_MODULO5_POR_KEY[key];
  if (!m) throw new Error(`Método del Módulo 5 no registrado: "${key}"`);
  return m;
}

export function familiaModulo5(key: string | null): FamiliaModulo5 | undefined {
  if (!key) return undefined;
  return FAMILIAS_MODULO5.find((f) => f.key === key);
}

export function metodosDeFamiliaModulo5(familia: FamiliaModulo5Key): MetodoModulo5[] {
  return METODOS_MODULO5.filter((m) => m.familia === familia);
}

export function rutaDeFamiliaModulo5(familia: FamiliaModulo5Key): string {
  return `/modulo5/tipos/${familia}`;
}

export function rutaDeMetodoModulo5(m: MetodoModulo5): string {
  return `${rutaDeFamiliaModulo5(m.familia)}/${m.ruta}/teoria`;
}

export function resumenDeMetodoModulo5(m: MetodoModulo5): string {
  const familia = FAMILIAS_MODULO5.find((f) => f.key === m.familia);
  return `${familia?.nombre ?? ''} · ${m.criterioTexto}`;
}

export function validarRegistroModulo5(): string[] {
  const problemas: string[] = [];
  const keys = new Set<string>();
  const rutas = new Set<string>();

  for (const m of METODOS_MODULO5) {
    if (keys.has(m.key)) problemas.push(`Método duplicado en el registro del Módulo 5: "${m.key}".`);
    keys.add(m.key);

    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(m.ruta)) {
      problemas.push(`"${m.key}" declara la ruta "${m.ruta}": tiene que ser kebab-case.`);
    }
    if (rutas.has(m.ruta)) problemas.push(`Ruta duplicada en el Módulo 5: "${m.ruta}".`);
    rutas.add(m.ruta);

    if (!FAMILIAS_MODULO5.some((f) => f.key === m.familia)) {
      problemas.push(`"${m.key}" declara la familia "${m.familia}", que no existe.`);
    }
  }

  for (const f of FAMILIAS_MODULO5) {
    if (metodosDeFamiliaModulo5(f.key).length === 0) {
      problemas.push(`La familia del Módulo 5 "${f.key}" no tiene ningún método.`);
    }
  }

  return problemas;
}
