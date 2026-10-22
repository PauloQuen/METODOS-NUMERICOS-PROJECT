import type { Punto } from '../../../modelos/modulo3.model';

/**
 * ALGORITMO DE INTERPOLACIÓN DE LAGRANGE — función pura, sin Angular.
 *
 * ── La idea en una frase ─────────────────────────────────────────────
 * Con n + 1 puntos distintos hay UN solo polinomio de grado ≤ n que
 * pasa por todos. Lagrange lo escribe sin resolver ningún sistema:
 * suma "bases" Lᵢ(x) que valen 1 en su propio punto y 0 en todos los
 * demás. Multiplicar cada base por yᵢ y sumar da el polinomio.
 *
 * ── Por qué este archivo no importa nada de otro método ──────────────
 * Es requisito del proyecto: si se borra la carpeta de Mínimos
 * Cuadrados, esto tiene que seguir compilando. Por eso es TypeScript
 * puro y lo único que trae de afuera es el tipo `Punto`, que es
 * dominio compartido del módulo, no un método.
 */

/* ------------------------------------------------------------------ */
/* Tipos de retorno                                                     */
/* ------------------------------------------------------------------ */

/** Una fila de la tabla de Lagrange: el aporte de cada dato. */
export interface FilaLagrange {
  /** Índice del punto, empezando en 1. */
  i: number;
  /** El dato: xᵢ. */
  xi: number;
  /** El dato: yᵢ. */
  yi: number;
  /** El valor de la base Lᵢ en el punto de evaluación. */
  li: number;
  /** El aporte de este dato al polinomio: yᵢ · Lᵢ(x*). */
  aporte: number;
}

/** Lo que devuelve el algoritmo. */
export interface ResultadoLagrange {
  /** Las filas para la tabla, una por dato. */
  filas: FilaLagrange[];
  /** Valor de P(x*) o que devuelve la suma de los aportes. */
  valor?: number;
  /** El punto x donde se evaluó. */
  evaluadoEn?: number;
  /** Coeficientes del polinomio, de mayor a menor grado. */
  coeficientes?: number[];
  /** El polinomio escrito como texto ("P(x) = 0.5x² − 1.5x + 2"). */
  polinomio?: string;
  /** El mayor |P(xᵢ) − yᵢ| sobre los datos. Debe ser ~0 (control). */
  errorEnNodos?: number;
  /** Un mensaje en español si algo impidió calcular. */
  mensaje?: string;
}

/* ------------------------------------------------------------------ */
/* Evaluación: el polinomio como función                                */
/* ------------------------------------------------------------------ */

/**
 * Devuelve P(x) como función, evaluando la forma de Lagrange.
 *
 * No expande el polinomio: evalúa la suma de bases para el x pedido.
 * Es más estable numéricamente que expandir y usar Horner cuando hay
 * muchos puntos con x muy separadas.
 */
export function polinomioLagrange(puntos: readonly Punto[]): (x: number) => number {
  return (x: number) => {
    let suma = 0;
    for (let i = 0; i < puntos.length; i++) {
      let base = 1;
      for (let j = 0; j < puntos.length; j++) {
        if (j === i) continue;
        const denominador = puntos[i].x - puntos[j].x;
        if (denominador === 0) continue;
        base *= (x - puntos[j].x) / denominador;
      }
      suma += puntos[i].y * base;
    }
    return suma;
  };
}

/**
 * Expande el polinomio a sus coeficientes, de MAYOR a menor grado.
 *
 * Sirve para mostrar el polinomio construido ("el resultado"), que es
 * lo que el alumno espera ver escrito en x, no en Lᵢ.
 * Coeficiente[0] es el de xⁿ, coeficiente[k] el de x^(n−k).
 */
export function coeficientesLagrange(puntos: readonly Punto[]): number[] {
  const n = puntos.length;
  let acumulado = new Array<number>(n).fill(0); // grado ≤ n−1

  for (let i = 0; i < n; i++) {
    // Se arma el producto ∏ (x − xⱼ) para j ≠ i, empezando en el
    // polinomio "1".
    let producto: number[] = [1];
    let divisor = 1;
    for (let j = 0; j < n; j++) {
      if (j === i) continue;
      producto = multiplicarPorLineal(producto, -puntos[j].x);
      divisor *= puntos[i].x - puntos[j].x;
    }
    const factor = puntos[i].y / divisor;
    for (let k = 0; k < producto.length; k++) {
      // `producto` viene de MENOR a mayor grado; `acumulado` de mayor a
      // menor, así que se alinea por el final.
      acumulado[n - 1 - k] += factor * producto[k];
    }
  }

  // Redondeo de la paja numérica: 1e-12 en vez de 2.7e-14.
  return acumulado.map((c) => (Math.abs(c) < 1e-12 ? 0 : c));
}

/** Multiplica un polinomio (menor→mayor grado) por (x + b). */
function multiplicarPorLineal(polinomio: number[], b: number): number[] {
  const resultado = new Array<number>(polinomio.length + 1).fill(0);
  for (let k = 0; k < polinomio.length; k++) {
    resultado[k] += polinomio[k] * b; // término de grado k
    resultado[k + 1] += polinomio[k]; // término de grado k+1
  }
  return resultado;
}

/** Escribe el polinomio con coeficientes de mayor a menor grado. */
export function formatearPolinomio(coeficientes: readonly number[]): string {
  const partes: string[] = [];
  const grado = coeficientes.length - 1;

  coeficientes.forEach((c, k) => {
    const potencia = grado - k;
    if (Math.abs(c) < 1e-12) return;

    const signo = c < 0 ? '−' : partes.length > 0 ? '+ ' : '';
    const magnitud = formatearNumero(Math.abs(c));
    let termino: string;

    if (potencia === 0) {
      termino = magnitud;
    } else if (potencia === 1) {
      termino = `${magnitud === '1' ? '' : magnitud}x`;
    } else {
      termino = `${magnitud === '1' ? '' : magnitud}x${superindice(potencia)}`;
    }

    partes.push(`${signo}${termino}`);
  });

  if (partes.length === 0) return 'P(x) = 0';
  return `P(x) = ${partes.join(' ')}`;
}

/* ------------------------------------------------------------------ */
/* El algoritmo                                                         */
/* ------------------------------------------------------------------ */

/**
 * Construye el polinomio de Lagrange y lo evalúa en x*.
 *
 * @example
 * lagrange({ puntos: [{x:1,y:1},{x:2,y:4},{x:3,y:9}], evaluarEn: 2.5 })
 * // valor ≈ 6.25  (es el polinomio x²)
 */
export function lagrange(datos: {
  puntos: readonly Punto[];
  evaluarEn?: number;
}): ResultadoLagrange {
  const puntos = datos.puntos;

  // ── Validaciones, antes de calcular ─────────────────────────────────
  if (!puntos || puntos.length < 2) {
    return sinResultado('Se necesitan al menos 2 puntos para interpolar.');
  }
  if (puntos.some((p) => !Number.isFinite(p.x) || !Number.isFinite(p.y))) {
    return sinResultado('Todos los puntos deben tener x e y numéricos.');
  }
  const xs = puntos.map((p) => p.x);
  if (new Set(xs).size !== xs.length) {
    return sinResultado(
      'Hay dos puntos con la misma x. Lagrange necesita x distintas: ' +
        'con x repetida, la base Lᵢ(x) divide entre cero.',
    );
  }

  const P = polinomioLagrange(puntos);
  const coeficientes = coeficientesLagrange(puntos);
  const polinomio = formatearPolinomio(coeficientes);

  // ── Control: el polinomio tiene que pasar por los datos ──────────────
  const errorEnNodos = puntos.reduce(
    (mayor, p) => Math.max(mayor, Math.abs(P(p.x) - p.y)),
    0,
  );

  // ── Evaluación en x*, si se pidió ───────────────────────────────────
  const evaluadoEn = datos.evaluarEn;
  const tienePunto = evaluadoEn !== undefined && Number.isFinite(evaluadoEn);

  const filas: FilaLagrange[] = puntos.map((p, indice) => {
    const li = tienePunto ? baseLagrange(puntos, indice, evaluadoEn as number) : NaN;
    return {
      i: indice + 1,
      xi: p.x,
      yi: p.y,
      li,
      aporte: tienePunto ? p.y * li : NaN,
    };
  });

  if (!tienePunto) {
    return {
      filas,
      coeficientes,
      polinomio,
      errorEnNodos,
      mensaje: 'Falta el valor de x donde se quiere estimar.',
    };
  }

  const valor = P(evaluadoEn as number);

  return {
    filas,
    valor,
    evaluadoEn,
    coeficientes,
    polinomio,
    errorEnNodos,
  };
}

/** Valor de la base Lᵢ en un x dado. */
export function baseLagrange(puntos: readonly Punto[], i: number, x: number): number {
  let base = 1;
  for (let j = 0; j < puntos.length; j++) {
    if (j === i) continue;
    const denominador = puntos[i].x - puntos[j].x;
    if (denominador === 0) continue;
    base *= (x - puntos[j].x) / denominador;
  }
  return base;
}

function sinResultado(mensaje: string): ResultadoLagrange {
  return { filas: [], mensaje };
}

/** Número corto y legible, con hasta 4 decimales y sin ceros de cola. */
function formatearNumero(v: number): string {
  if (Number.isInteger(v)) return String(v);
  return v.toFixed(4).replace(/\.?0+$/, '');
}

/** Convierte un exponente en superíndice para mostrarlo en HTML. */
function superindice(n: number): string {
  const mapa = '⁰¹²³⁴⁵⁶⁷⁸⁹';
  return String(n)
    .split('')
    .map((d) => mapa[Number(d)] ?? d)
    .join('');
}
