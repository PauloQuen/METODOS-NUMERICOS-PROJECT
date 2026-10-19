import {
  type CriterioKey,
  CRITERIO_POR_DEFECTO_INTERVALO,
  type Magnitudes,
  type RazonParada,
  cumple,
  esRaizExacta,
  razonDeParada,
} from '../../../../../shared/domain/numerico/criterio';

/**
 * ALGORITMO DE BISECCIÓN — método cerrado por acotación.
 *
 * ── La idea en una frase ──────────────────────────────────────────────
 * Si f es continua y f(a) y f(b) tienen signos opuestos, entonces entre a
 * y b hay por lo menos una raíz. Se toma el punto medio c = (a + b)/2 y se
 * conserva la mitad donde f sigue cambiando de signo. Como el intervalo
 * se reduce a la mitad en cada paso, después de n pasos es tan angosto
 * como el ancho inicial partido por 2ⁿ.
 *
 * ── Por qué este archivo NO importa nada de otros métodos ─────────────
 * Es un requisito del proyecto: si se borra la carpeta de Newton-Raphson
 * o de Secante, este archivo tiene que seguir compilando. Por eso es
 * una función pura de TypeScript, sin Angular y sin dependencias de otros
 * métodos. Lo único que trae de afuera son los criterios de convergencia
 * (criterio.ts), que son dominio compartido, no un método en sí.
 *
 * ── El criterio por defecto y por qué ────────────────────────────────
 * Usa la cota de Bolzano: |x − c| ≤ (b − a)/2. No es un error medido
 * entre dos iteraciones, es unaGARANTÍA: la raíz está a distancia
 * (b − a)/2 del punto medio, adentro del intervalo. Se prefiere esta
 * cota y no |f(c)| porque |f(c)| depende de qué tan grande es f: si el
 * alumno escribe la misma ecuación multiplicada por 1000, el número de
 * iteraciones no debería cambiar solo por eso. El ancho del intervalo
 * no depende de f.
 */

/** Una fila de la tabla de iteraciones. */
export interface FilaBiseccion {
  /** Número de iteración, empezando en 1. */
  n: number;
  /** Extremo izquierdo del intervalo en esta iteración. */
  a: number;
  /** Extremo derecho del intervalo en esta iteración. */
  b: number;
  /** El punto medio que se evaluó. */
  c: number;
  /** f(c). */
  fc: number;
  /** La cota de error: (b − a)/2, o sea |x − c| ≤ este valor. */
  error: number;
}

/** Lo que devuelve el algoritmo. */
export interface ResultadoBiseccion {
  /** Las filas para la tabla. Si no converge, están las que hizo. */
  filas: FilaBiseccion[];
  /** ¿Llegó al criterio de parada? */
  convergio: boolean;
  /** Cuántas iteraciones hizo (aunque no haya convergido). */
  iteraciones: number;
  /** La mejor aproximación de la raíz. */
  raiz?: number;
  /** El error de esa aproximación. */
  error?: number;
  /** Un mensaje en español si algo impidió calcular. */
  mensaje?: string;
  /** Por qué se detuvo, si se detuvo. */
  parada?: RazonParada;
}

/** Los datos que hay que darle al algoritmo. */
export interface EntradaBiseccion {
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
  /** Qué error mirar para decidir si paró. */
  criterio?: CriterioKey;
}

/**
 * Corre la bisección.
 *
 * @example
 * const r = biseccion({ f: x => x**3 - x - 2, a: 1, b: 2, tol: 1e-5 });
 * r.raiz  // ≈ 1.5213797
 */
export function biseccion(entrada: EntradaBiseccion): ResultadoBiseccion {
  const {
    f,
    tol,
    maxIter = 100,
    criterio = CRITERIO_POR_DEFECTO_INTERVALO,
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

  const fa = f(a);
  const fb = f(b);

  if (!Number.isFinite(fa) || !Number.isFinite(fb)) {
    return sinResultado(
      'La función no se pudo evaluar en los extremos del intervalo. Revisá la expresión.',
    );
  }

  // ── La condición de Bolzano ─────────────────────────────────────────
  // Sin cambio de signo no se puede garantizar que haya raíz. Puede
  // haberla igual (una raíz doble), pero el método no la encontraría,
  // así que es mejor avisar.
  if (fa * fb > 0) {
    return sinResultado(
      `f(a) y f(b) tienen el mismo signo (f(a) = ${fa.toFixed(4)}, f(b) = ${fb.toFixed(4)}). ` +
        'Bisección necesita que el función cambie de signo en el intervalo.',
    );
  }

  // ── El lazo ─────────────────────────────────────────────────────────
  const filas: FilaBiseccion[] = [];
  let parada: RazonParada | undefined;

  for (let n = 1; n <= maxIter; n++) {
    const c = (a + b) / 2;
    const fc = f(c);
    const error = Math.abs((b - a) / 2); // cota de Bolzano

    filas.push({ n, a, b, c, fc, error });

    // Se decide si ya terminó, mirando la cota de error y el residuo.
    const magnitudes: Magnitudes = {
      delta: filas.length > 1 ? Math.abs(c - filas[filas.length - 2].c) : undefined,
      valor: c,
      semiancho: error,
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

    // ── Acortar el intervalo ──────────────────────────────────────────
    // Si f(a) y f(c) tienen signos opuestos, la raíz está en [a, c] y
    // se descarta la mitad derecha. Si no, está en [c, b].
    if (fa * fc < 0) {
      b = c;
    } else {
      a = c;
    }
  }

  const ultima = filas[filas.length - 1];

  if (!parada) {
    return {
      filas,
      convergio: false,
      iteraciones: filas.length,
      raiz: ultima?.c,
      error: ultima?.error,
      mensaje:
        `No se alcanzó la tolerancia ${formatearTol(tol)} en ${maxIter} iteraciones. ` +
        'Probá con un intervalo más angosto o una tolerancia menos exigente.',
    };
  }

  return {
    filas,
    convergio: true,
    iteraciones: filas.length,
    raiz: ultima.c,
    error: ultima.error,
    parada,
  };
}

function sinResultado(mensaje: string): ResultadoBiseccion {
  return { filas: [], convergio: false, iteraciones: 0, mensaje };
}

/** Muestra la tolerancia en notación científica si es muy chica. */
function formatearTol(tol: number): string {
  if (tol < 1e-4) return tol.toExponential(1);
  return String(tol);
}
