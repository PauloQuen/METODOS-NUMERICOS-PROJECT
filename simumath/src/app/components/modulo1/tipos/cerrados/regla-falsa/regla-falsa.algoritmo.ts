import {
  type CriterioKey,
  type Magnitudes,
  type RazonParada,
  CRITERIO_POR_DEFECTO,
  cumple,
  esRaizExacta,
  razonDeParada,
} from '../../../../../shared/domain/numerico/criterio';

/**
 * ALGORITMO DE REGLA FALSA (regula falsi) — método cerrado por interpolación.
 *
 * ── La idea en una frase ──────────────────────────────────────────────
 * Igual que la bisección, necesita un intervalo [a, b] donde f cambie de
 * signo. Pero en vez de partir el intervalo por el punto medio, traza la
 * cuerda que une (a, f(a)) con (b, f(b)) y toma el punto c donde esa cuerda
 * cruza el eje x. Si la función es aproximadamente recta en el intervalo,
 * el cruce queda muy cerca de la raíz y se avanza más rápido que bisección.
 *
 * ── Por qué este archivo NO importa nada de otros métodos ─────────────
 * Es un requisito del proyecto: si se borra la carpeta de Bisección o de
 * Secante, este archivo tiene que seguir compilando. Por eso es una
 * función pura de TypeScript, sin Angular. Lo único que trae de afuera
 * son los criterios de convergencia (criterio.ts), dominio compartido.
 *
 * ── El criterio por defecto y por qué ─────────────────────────────────
 * NO usa la cota de intervalo (b − a)/2, y hay una razón medida en el
 * proyecto: la regla falsa reemplaza un solo extremo por el corte de la
 * cuerda, y el otro extremo puede quedar congelado durante muchísimas
 * iteraciones. Medido sobre x³ − x − 2 en [1, 2], el extremo superior se
 * clava en 2 y la cota se estabiliza en ≈0.239 SIN BAJAR NUNCA: con
 * tol = 1e-4 ese criterio es matemáticamente incapaz de cumplirse.
 *
 * Por eso el criterio por defecto es el ABSOLUTO |cₙ − cₙ₋₁|: el
 * desplazamiento del corte de la cuerda entre iteraciones, que sí baja
 * (aunque con la lentitud lineal típica del método cuando un extremo se
 * estanca). Es un error sobre x, así que es invariante a la escala de f:
 * multiplicar la ecuación por 1000 no cambia el número de iteraciones.
 *
 * ── La fórmula de la cuerda ──────────────────────────────────────────
 * La recta que une (a, f(a)) con (b, f(b)) cruza el eje x en
 *
 *   c = a − f(a) · (b − a) / (f(b) − f(a))
 *
 * que es la misma cuenta, reordenada, que "b − f(b)·(b−a)/(f(b)−f(a))".
 * El denominador es f(b) − f(a): si f(a) y f(b) tienen signos opuestos
 * (condición de Bolzano estricta), los dos valores nunca son iguales y la
 * cuerda siempre cruza el eje.
 */

/** Una fila de la tabla de iteraciones. */
export interface FilaReglaFalsa {
  /** Número de iteración, empezando en 1. */
  n: number;
  /** Extremo izquierdo del intervalo en esta iteración. */
  a: number;
  /** Extremo derecho del intervalo en esta iteración. */
  b: number;
  /** El corte de la cuerda con el eje x, que es la aproximación nueva. */
  c: number;
  /** f(c). */
  fc: number;
  /** |cₙ − cₙ₋₁|: cuánto se desplazó el corte respecto de la iteración anterior. */
  delta: number | undefined;
}

/** Lo que devuelve el algoritmo. */
export interface ResultadoReglaFalsa {
  /** Las filas para la tabla. Si no converge, están las que hizo. */
  filas: FilaReglaFalsa[];
  /** ¿Llegó al criterio de parada? */
  convergio: boolean;
  /** Cuántas iteraciones hizo (aunque no haya convergido). */
  iteraciones: number;
  /** La mejor aproximación de la raíz. */
  raiz?: number;
  /** El error de esa aproximación: el |Δc| de la última iteración. */
  error?: number;
  /** Un mensaje en español si algo impidió calcular. */
  mensaje?: string;
  /** Por qué se detuvo, si se detuvo. */
  parada?: RazonParada;
}

/** Los datos que hay que darle al algoritmo. */
export interface EntradaReglaFalsa {
  /** La función f ya parseada. */
  f: (x: number) => number;
  /** Extremo izquierdo del intervalo inicial. */
  a: number;
  /** Extremo derecho del intervalo inicial. */
  b: number;
  /** Tolerancia: parar cuando el error sea menor que esto. */
  tol: number;
  /** Tope de iteraciones, para no quedar en un lazo infinito. */
  maxIter?: number;
  /** Qué error mirar para decidir si paró. Por defecto, |Δc| absoluto. */
  criterio?: CriterioKey;
}

/**
 * Corre la regla falsa.
 *
 * @example
 * const r = reglaFalsa({ f: x => x**3 - x - 2, a: 1, b: 2, tol: 1e-5 });
 * r.raiz  // ≈ 1.5213797
 */
export function reglaFalsa(entrada: EntradaReglaFalsa): ResultadoReglaFalsa {
  const {
    f,
    tol,
    maxIter = 100,
    criterio = CRITERIO_POR_DEFECTO,
  } = entrada;

  let a = entrada.a;
  let b = entrada.b;

  // ── Validaciones, antes de hacer nada ───────────────────────────────
  if (!Number.isFinite(a) || !Number.isFinite(b)) {
    return sinResultado('Los extremos del intervalo deben ser números.');
  }
  if (a === b) {
    return sinResultado('El intervalo no puede tener a = b: no tiene ancho.');
  }

  // El algoritmo necesita a < b. Si el alumno los dio al revés, se
  // ordenan solos en vez de devolver un error.
  if (a > b) {
    [a, b] = [b, a];
  }

  let fa = f(a);
  let fb = f(b);

  if (!Number.isFinite(fa) || !Number.isFinite(fb)) {
    return sinResultado(
      'La función no se pudo evaluar en los extremos del intervalo. Revisá la expresión.',
    );
  }

  // ── La condición de Bolzano ─────────────────────────────────────────
  // Sin cambio de signo la cuerda puede no cruzar el eje entre a y b, y
  // entonces la regla falsa no tiene raíz garantizada que perseguir.
  if (fa * fb > 0) {
    return sinResultado(
      `f(a) y f(b) tienen el mismo signo (f(a) = ${fa.toFixed(4)}, f(b) = ${fb.toFixed(4)}). ` +
        'La regla falsa necesita que la función cambie de signo en el intervalo.',
    );
  }

  // ── El lazo ─────────────────────────────────────────────────────────
  const filas: FilaReglaFalsa[] = [];
  let parada: RazonParada | undefined;

  for (let n = 1; n <= maxIter; n++) {
    // Corte de la cuerda con el eje x. Con cambio de signo estricto el
    // denominador nunca es cero: f(a) y f(b) no pueden ser iguales.
    const denominador = fb - fa;
    if (denominador === 0) {
      return sinResultado(
        'La cuerda es horizontal: f(a) = f(b). La regla falsa no puede avanzar.',
      );
    }

    const c = a - (fa * (b - a)) / denominador;
    const fc = f(c);
    // |Δc|: el desplazamiento del corte respecto del corte ANTERIOR.
    // En la iteración 1 no hay anterior (undefined); desde la 2 en adelante
    // se compara contra la ÚLTIMA fila, que es el c de la iteración previa.
    const delta =
      filas.length >= 1 ? Math.abs(c - filas[filas.length - 1].c) : undefined;

    filas.push({ n, a, b, c, fc, delta });

    // Se decide si ya terminó, mirando el criterio (por defecto |Δc|) y
    // el residuo.
    const magnitudes: Magnitudes = {
      delta,
      valor: c,
      semiancho: Math.abs((b - a) / 2),
      residuo: Math.abs(fc),
    };

    if (esRaizExacta(magnitudes)) {
      parada = razonDeParada(criterio, magnitudes, tol, true);
      break;
    }
    if (cumple(criterio, magnitudes, tol)) {
      parada = razonDeParada(criterio, magnitudes, tol, false);
      break;
    }

    // ── Encoger el intervalo ──────────────────────────────────────────
    // Si f(a) y f(c) tienen signos opuestos, la raíz está en [a, c] y se
    // descarta la derecha; si no, está en [c, b]. A diferencia de la
    // bisección, acá hay que actualizar el VALOR de fa o fb, no solo el
    // extremo: la cuerda de la próxima iteración se apoya en ellos.
    if (fa * fc < 0) {
      b = c;
      fb = fc;
    } else {
      a = c;
      fa = fc;
    }
  }

  const ultima = filas[filas.length - 1];

  if (!parada) {
    return {
      filas,
      convergio: false,
      iteraciones: filas.length,
      raiz: ultima?.c,
      error: ultima?.delta,
      mensaje:
        `No se alcanzó la tolerancia ${formatearTol(tol)} en ${maxIter} iteraciones. ` +
        'Probá con un intervalo más angosto o una tolerancia menos exigente.',
    };
  }

  // Si la parada fue por raíz exacta, el corte dio f(c) = 0: el error real
  // es cero, aunque en esa fila no haya delta (no existe el c anterior).
  const error =
    parada.magnitud === 0 ? 0 : ultima.delta;

  return {
    filas,
    convergio: true,
    iteraciones: filas.length,
    raiz: ultima.c,
    error,
    parada,
  };
}

function sinResultado(mensaje: string): ResultadoReglaFalsa {
  return { filas: [], convergio: false, iteraciones: 0, mensaje };
}

/** Muestra la tolerancia en notación científica si es muy chica. */
function formatearTol(tol: number): string {
  if (tol < 1e-4) return tol.toExponential(1);
  return String(tol);
}