import {
  TOLERANCIA,
  residuo,
  formatearResiduo,
  formatearVector,
  type Matriz,
  type SistemaLineal,
} from '../../../../../shared/domain/numerico/matriz';
import { nombreIncognita } from '../../../../../shared/models/sistema.model';

/**
 * FACTORIZACIÓN LU (DOOLITTLE).
 *
 * ── Qué resuelve ───────────────────────────────────────────────────────
 * Un sistema A·x = b. Igual que la eliminación gaussiana, pero guardando
 * el trabajo: en vez de triangularizar A y descartar lo que se hizo, se
 * guarda en DOS matrices.
 *
 * El resultado es que A = L·U, donde:
 *   · L es triangular INFERIOR con 1 en la diagonal (matriz unidad abajo),
 *   · U es triangular SUPERIOR.
 *
 * Con esa factorización el sistema se resuelve en dos sustituciones:
 *   1. L·y = b   (sustitución hacia adelante)
 *   2. U·x = y   (sustitución hacia atrás)
 *
 * ── Por qué Doolittle y no Crout ───────────────────────────────────────
 * Las dos son factorizaciones LU legítimas: Doolittle pone los 1 en la
 * diagonal de L, Crout los pone en la de U. Se elige Doolittle porque
 * hace que L sea la matriz UNIDAD ABAJO, y con eso la sustitución hacia
 * adelante es todavía más simple: no hay que dividir por nada, porque el
 * coeficiente de la diagonal es 1.
 *
 * ── La diferencia con Gauss, que es TODO el punto ─────────────────────
 * Gauss tira la eliminación: al terminar, la matriz que quedó solo sirve
 * para ese sistema con ese lado derecho. LU la GUARDA.
 *
 * Si hay que resolver el mismo A con 1000 lados derechos distintos:
 *   · con Gauss: 1000 eliminaciones completas (1000 × n³/3 operaciones);
 *   · con LU:   UNA descomposición (n³/3 operaciones) y después 1000
 *                pares de sustituciones (1000 × n² operaciones).
 *
 * Eso es lo que hacen los resolutores de verdad: factorizan una vez y
 * resuelven muchas veces.
 *
 * ── Por qué acá NO hay pivoteo ─────────────────────────────────────────
 * El pivoteo se puede meter (la forma completa es PA = LU, con una
 * matriz de permutación P adelante), pero rompe la Factorización LU
 * "limpia": el producto deja de ser A = L·U y pasa a ser PA = L·U, y la
 * sustitución tiene que permutar también el lado derecho.
 *
 * Además, el pivoteo parcial NO SIRVE para LU sin más: no basta con
 * intercambiar filas, porque al intercambiar hay que intercambiar los
 * multiplicadores ya calculados en L, o L y U dejan de multiplicar a la
 * matriz original. Por eso el LU que se estudia a mano es sin pivoteo, y
 * su condición es que los pivotes principales sean no nulos.
 *
 * Cuando un pivote sale cero (que es raro, pero pasa), este método
 * avisa y dice qué hacer: reordenar las filas del sistema o usar
 * LU con pivoteo. Un método que avisa es infinitamente más útil que uno
 * que divide por cero.
 *
 * ── Qué devuelve ───────────────────────────────────────────────────────
 * La solución, los pasos (uno por fila de la tabla), las matrices L y U,
 * el vector y de la sustitución adelante y el residuo. Con eso el
 * componente puede narrar el paso a paso sin escribir los textos a mano
 * (y sin que puedan dejar de coincidir con los números).
 */

/** En qué etapa del método está un paso. */
export type EtapaLu = 'Descomposición' | 'Sustitución adelante' | 'Sustitución atrás';

/** Un paso del método, que es una fila de la tabla. */
export interface FilaLu {
  /** Número de paso, empezando en 1. */
  n: number;
  /** En qué etapa del método está. */
  etapa: EtapaLu;
  /** La columna en la que se está trabajando (0-based). */
  k: number;
  /** El pivote que se está usando, si la etapa lo tiene. */
  pivote?: number;
  /** El multiplicador mᵢₖ, si el paso fue una eliminación. */
  multiplicador?: number;
  /** La fila que queda después del paso, ya formateada. */
  fila: string;
  /** La explicación del paso, en palabras. */
  detalle: string;
}

/** Lo que devuelve una corrida del método. */
export interface ResultadoLu {
  /** ¿Se pudo resolver? */
  exito: boolean;
  /** La solución, si se resolvió. */
  solucion?: number[];
  /** Los pasos, en orden. */
  filas: FilaLu[];
  /** La matriz L (triangular inferior, con 1 en la diagonal). */
  L?: Matriz;
  /** La matriz U (triangular superior). */
  U?: Matriz;
  /** El vector y de la sustitución hacia adelante: L·y = b. */
  y?: number[];
  /** El sistema triangular U·x = y, para dibujarlo sobre el plano. */
  sistemaTriangular?: SistemaLineal;
  /** El residuo ‖A·x − b‖∞: cuánto error queda. */
  residuo?: number;
  /** Por qué no se pudo resolver, si no se pudo. */
  mensaje?: string;
}

/**
 * Resuelve A·x = b con la factorización LU de Doolittle.
 *
 * No muta los datos que recibe: trabaja sobre copias, así que el sistema
 * original queda intacto para el gráfico.
 */
export function ejecutarLu(sistema: SistemaLineal): ResultadoLu {
  const n = sistema.A.length;
  const filas: FilaLu[] = [];
  let paso = 0;

  if (n === 0) {
    return { exito: false, filas, mensaje: 'El sistema está vacío.' };
  }

  // U es una copia de A: se va triangularizando encima.
  const U: Matriz = sistema.A.map((fila) => [...fila]);
  // L arranca como la identidad y se le van guardando los multiplicadores.
  const L: Matriz = identidad(n);

  /* ---------------------------------------------------------------- */
  /* Descomposición: U = L⁻¹·A, calculada fila por fila                 */
  /* ---------------------------------------------------------------- */
  for (let k = 0; k < n - 1; k++) {
    const pivote = U[k][k];

    if (Math.abs(pivote) < TOLERANCIA) {
      return {
        exito: false,
        filas,
        L,
        U,
        mensaje:
          `El pivote de la columna ${k + 1} es cero: la descomposición LU ` +
          'sin pivoteo no se puede aplicar. Hay que reordenar las filas del ' +
          'sistema (por ejemplo, poner arriba la ecuación que empieza con un ' +
          'coeficiente grande) o usar la factorización LU con pivoteo (PA = LU).',
      };
    }

    for (let i = k + 1; i < n; i++) {
      const valor = U[i][k];

      // Si ya es cero no hay nada que eliminar: no se anota un paso vacío.
      if (Math.abs(valor) < TOLERANCIA) {
        continue;
      }

      const multiplicador = valor / pivote;
      L[i][k] = multiplicador;

      for (let j = k; j < n; j++) {
        U[i][j] -= multiplicador * U[k][j];
      }
      // Los residuos de redondeo se limpian a cero exacto.
      for (let j = k; j < n; j++) {
        if (Math.abs(U[i][j]) < TOLERANCIA) {
          U[i][j] = 0;
        }
      }

      paso++;
      filas.push({
        n: paso,
        etapa: 'Descomposición',
        k,
        pivote,
        multiplicador,
        fila: formatearFila(U[i]),
        detalle:
          `En la columna ${k + 1} se calcula el multiplicador ` +
          `m${i + 1}${k + 1} = ${corto(valor)} / ${corto(pivote)} = ` +
          `${corto(multiplicador)} y la fila ${i + 1} de U queda ` +
          `${formatearFila(U[i])}.`,
      });
    }
  }

  // El último pivote también puede ser cero: la matriz es singular.
  if (Math.abs(U[n - 1][n - 1]) < TOLERANCIA) {
    return {
      exito: false,
      filas,
      L,
      U,
      mensaje:
        'La matriz es singular: el último pivote es cero. ' +
        'El sistema no tiene solución única.',
    };
  }

  /* ---------------------------------------------------------------- */
  /* Sustitución hacia adelante: L·y = b                                */
  /* ---------------------------------------------------------------- */
  const y: number[] = new Array(n).fill(0);

  for (let i = 0; i < n; i++) {
    let acumulado = sistema.b[i];
    const terminos: string[] = [];

    for (let k = 0; k < i; k++) {
      if (Math.abs(L[i][k]) < TOLERANCIA) continue;
      acumulado -= L[i][k] * y[k];
      terminos.push(`${corto(L[i][k])} · ${corto(y[k])}`);
    }

    // La diagonal de L es 1, así que no hay división.
    y[i] = acumulado;

    paso++;
    filas.push({
      n: paso,
      etapa: 'Sustitución adelante',
      k: i,
      fila: `y${i + 1} = ${corto(y[i])}`,
      detalle:
        `En la sustitución hacia adelante se despeja y${i + 1} = ` +
        `${corto(sistema.b[i])}` +
        (terminos.length > 0 ? ` − ${terminos.join(' − ')}` : '') +
        ` = ${corto(y[i])}.`,
    });
  }

  /* ---------------------------------------------------------------- */
  /* Sustitución hacia atrás: U·x = y                                   */
  /* ---------------------------------------------------------------- */
  const x: number[] = new Array(n).fill(0);

  for (let i = n - 1; i >= 0; i--) {
    let acumulado = y[i];
    const terminos: string[] = [];

    for (let k = i + 1; k < n; k++) {
      if (Math.abs(U[i][k]) < TOLERANCIA) continue;
      acumulado -= U[i][k] * x[k];
      terminos.push(`${corto(U[i][k])} · ${corto(x[k])}`);
    }

    x[i] = acumulado / U[i][i];

    paso++;
    filas.push({
      n: paso,
      etapa: 'Sustitución atrás',
      k: i,
      pivote: U[i][i],
      fila: `${nombreIncognita(i)} = ${corto(x[i])}`,
      detalle:
        `En la sustitución hacia atrás se despeja ${nombreIncognita(i)} = ` +
        (terminos.length > 0
          ? `(${corto(y[i])} − ${terminos.join(' − ')}) / ${corto(U[i][i])}`
          : `${corto(y[i])} / ${corto(U[i][i])}`) +
        ` = ${corto(x[i])}.`,
    });
  }

  return {
    exito: true,
    solucion: x,
    filas,
    L,
    U,
    y,
    sistemaTriangular: { A: U, b: [...y] },
    residuo: residuo(sistema.A, x, sistema.b),
  };
}

/* ------------------------------------------------------------------ */
/* Formato                                                             */
/* ------------------------------------------------------------------ */

/** Ancho de cada número en la fila, para que las columnas calcen. */
const ANCHO = 9;

/** La matriz identidad de tamaño n. */
function identidad(n: number): Matriz {
  const m: Matriz = [];
  for (let i = 0; i < n; i++) {
    const fila: number[] = [];
    for (let j = 0; j < n; j++) fila.push(i === j ? 1 : 0);
    m.push(fila);
  }
  return m;
}

/** Un número con 4 decimales, para las filas de la matriz. */
function numero(v: number): string {
  if (!Number.isFinite(v)) return '—';
  const s = v.toFixed(4);
  // -0.0000 se muestra como 0.0000: el signo negativo de un cero no dice nada.
  return Number(s) === 0 ? (0).toFixed(4) : s;
}

/** Un número con la cifra de adelante, como "2" o "-1.5". */
function corto(v: number): string {
  if (!Number.isFinite(v)) return '—';
  if (Number.isInteger(v)) return String(v);
  return String(Number(v.toFixed(6)));
}

/**
 * La fila de la matriz U, formateada y alineada.
 *
 * U NO lleva barra vertical: la barra separa los coeficientes del lado
 * derecho, y U no tiene lado derecho (ese rol lo cumple el vector y).
 */
function formatearFila(fila: number[]): string {
  const partes: string[] = [];
  for (const v of fila) {
    partes.push(numero(v).padStart(ANCHO, ' '));
  }
  return partes.join('');
}

/**
 * La solución, en forma de texto: "(2, 3)".
 *
 * Usa el formateo compartido, que muestra los enteros sin decimales de
 * relleno: en un sistema lineal casi todos los coeficientes son enteros
 * y ver "2.000000" esconde que son enteros.
 */
export function formatearSolucion(x: number[] | undefined): string {
  if (!x) return '—';
  return formatearVector(x);
}

export { formatearResiduo };
