/**
 * MATRICES — el alfabeto del Módulo 2.
 *
 * ── Por qué este archivo existe ───────────────────────────────────────
 * El Módulo 1 hace una sola cosa: encontrar la raíz de f(x) = 0. Todo el
 * portal habla el mismo idioma: un número, una función, una aproximación.
 *
 * El Módulo 2 habla otro idioma: un sistema A·x = b. El dato de entrada ya
 * no es "la función f(x)", es una TABLA de coeficientes. Y a partir de ahí
 * todo lo demás cambia: hay que multiplicar matrices, calcular
 * determinantes, medir lo que "grande" significa en un vector, y decidir
 * si un método iterativo va a converger.
 *
 * Estas utilidades son el COMÚN de los cuatro métodos del módulo. Por eso
 * viven acá y no en la carpeta de cada método: la regla del proyecto es
 * que un método no importa nada de otro método, pero todos pueden (y
 * deben) apoyarse en lo genérico de `shared/`.
 *
 * ── Lo que NO hace este archivo ───────────────────────────────────────
 * No resuelve sistemas. Resolver es trabajo de cada método (Gauss, LU,
 * Jacobi, Gauss-Seidel), y cada uno lo hace a su manera, porque el alumno
 * tiene que poder defender su método explicando QUÉ hace. Acá solo están
 * las cuentas que son iguales para todos: sumar, multiplicar, medir.
 *
 * ── Sobre los números ─────────────────────────────────────────────────
 * Todo es `number` de JavaScript (doble precisión, ~15 dígitos). Los
 * métodos numéricos del módulo toleran eso de sobra. Donde importa
 * distinguir "casi cero" de "cero" (determinante, residuo), se usa
 * `TOLERANCIA` y no una comparación exacta: un determinante de 1e-16
 * significa "singular", no "distinto de cero".
 */

/* ------------------------------------------------------------------ */
/* Tipos                                                               */
/* ------------------------------------------------------------------ */

/** Una matriz: una lista de filas, cada fila una lista de números. */
export type Matriz = number[][];

/**
 * Un sistema lineal completo: la matriz de coeficientes y el lado derecho.
 *
 * `A` es n×n (cuadrada) y `b` tiene n elementos. El sistema que resuelve
 * este módulo es siempre A·x = b.
 */
export interface SistemaLineal {
  A: Matriz;
  b: number[];
}

/**
 * Tolerancia para decidir si un número es "cero" a efectos numéricos.
 *
 * 1e-12 es generoso para doble precisión y evita que un residuo de 1e-16
 * se reporte como "el sistema no tiene solución". Un determinante de
 * 1e-15 ES un sistema singular en la práctica: la solución existe pero
 * está a distancias que no significan nada.
 */
export const TOLERANCIA = 1e-12;

/* ------------------------------------------------------------------ */
/* Forma y tamaño                                                      */
/* ------------------------------------------------------------------ */

/** ¿Es una matriz sin filas vacías y con todas las filas del mismo largo? */
export function esMatriz(m: unknown): m is Matriz {
  if (!Array.isArray(m) || m.length === 0) return false;
  const ancho = Array.isArray(m[0]) ? m[0].length : 0;
  if (ancho === 0) return false;
  return m.every(
    (fila) => Array.isArray(fila) && fila.length === ancho && fila.every((v) => typeof v === 'number' && Number.isFinite(v)),
  );
}

/** ¿Es un vector (lista de números) no vacío? */
export function esVector(v: unknown): v is number[] {
  return (
    Array.isArray(v) &&
    v.length > 0 &&
    v.every((x) => typeof x === 'number' && Number.isFinite(x))
  );
}

/** Cantidad de filas de la matriz. */
export function filas(m: Matriz): number {
  return m.length;
}

/** Cantidad de columnas de la matriz. */
export function columnas(m: Matriz): number {
  return m.length > 0 ? m[0].length : 0;
}

/** ¿La matriz es cuadrada? */
export function esCuadrada(m: Matriz): boolean {
  return m.length > 0 && m.length === m[0].length;
}

/** Copia profunda: las matrices se modifican, y hay que poder volver atrás. */
export function copiarMatriz(m: Matriz): Matriz {
  return m.map((fila) => [...fila]);
}

/** Copia de un vector. */
export function copiarVector(v: number[]): number[] {
  return [...v];
}

/** La matriz identidad de tamaño n. */
export function identidad(n: number): Matriz {
  const m: Matriz = [];
  for (let i = 0; i < n; i++) {
    const fila: number[] = [];
    for (let j = 0; j < n; j++) fila.push(i === j ? 1 : 0);
    m.push(fila);
  }
  return m;
}

/** La matriz nula de tamaño n×n. */
export function nula(n: number): Matriz {
  return Array.from({ length: n }, () => Array<number>(n).fill(0));
}

/* ------------------------------------------------------------------ */
/* Álgebra                                                             */
/* ------------------------------------------------------------------ */

/** Transpuesta de A. */
export function transponer(m: Matriz): Matriz {
  const n = filas(m);
  const p = columnas(m);
  const t: Matriz = [];
  for (let j = 0; j < p; j++) {
    const fila: number[] = [];
    for (let i = 0; i < n; i++) fila.push(m[i][j]);
    t.push(fila);
  }
  return t;
}

/** Producto A·B. */
export function multiplicar(A: Matriz, B: Matriz): Matriz {
  const n = filas(A);
  const p = columnas(B);
  const k = columnas(A);
  const C: Matriz = [];
  for (let i = 0; i < n; i++) {
    const fila: number[] = [];
    for (let j = 0; j < p; j++) {
      let suma = 0;
      for (let l = 0; l < k; l++) suma += A[i][l] * B[l][j];
      fila.push(suma);
    }
    C.push(fila);
  }
  return C;
}

/** Producto A·x, con x vector columna. */
export function multiplicarVector(A: Matriz, x: number[]): number[] {
  return A.map((fila) => fila.reduce((s, v, j) => s + v * x[j], 0));
}

/** Producto escalar de dos vectores. */
export function productoEscalar(u: number[], v: number[]): number {
  return u.reduce((s, x, i) => s + x * v[i], 0);
}

/** Resta u − v. */
export function restarVectores(u: number[], v: number[]): number[] {
  return u.map((x, i) => x - v[i]);
}

/**
 * Determinante de una matriz cuadrada, por eliminación gaussiana con
 * pivoteo parcial.
 *
 * ── Por qué no por desarrollo de Laplace ──────────────────────────────
 * El desarrollo por cofactores multiplica el número de operaciones por
 * n! y, peor, se come la precisión rápido: para 5×5 la diferencia entre
 * el resultado "exacto" y el numérico es de varias unidades en la última
 * cifra. La eliminación con pivoteo es O(n³), estable, y además es
 * EXACTAMENTE el algoritmo que el módulo enseña. Que el módulo 1 y el
 * módulo 2 hablen el mismo idioma.
 *
 * Devuelve 0 cuando la matriz es singular (tiene una fila de ceros en la
 * eliminación), que es el caso que realmente importa.
 */
export function determinante(m: Matriz): number {
  if (!esCuadrada(m)) return Number.NaN;
  const n = m.length;
  const A = copiarMatriz(m);
  let det = 1;

  for (let k = 0; k < n; k++) {
    // Pivoteo parcial: el mayor valor absoluto de la columna.
    let filaPivote = k;
    for (let i = k + 1; i < n; i++) {
      if (Math.abs(A[i][k]) > Math.abs(A[filaPivote][k])) filaPivote = i;
    }
    if (Math.abs(A[filaPivote][k]) < TOLERANCIA) return 0;

    if (filaPivote !== k) {
      const tmp = A[k];
      A[k] = A[filaPivote];
      A[filaPivote] = tmp;
      det = -det;
    }

    det *= A[k][k];

    for (let i = k + 1; i < n; i++) {
      const factor = A[i][k] / A[k][k];
      for (let j = k; j < n; j++) A[i][j] -= factor * A[k][j];
    }
  }

  return det;
}

/** ¿La matriz es singular? (determinante prácticamente nulo). */
export function esSingular(m: Matriz): boolean {
  if (!esCuadrada(m)) return true;
  return Math.abs(determinante(m)) < TOLERANCIA;
}

/* ------------------------------------------------------------------ */
/* Medidas                                                            */
/* ------------------------------------------------------------------ */

/**
 * Norma infinita de un vector: el MAYOR valor absoluto de sus componentes.
 *
 * Es la medida de error que usa el módulo para los sistemas: "el error
 * de la solución" es ‖Ax − b‖∞, y "el cambio entre iteraciones" es
 * ‖xⁿ⁺¹ − xⁿ‖∞. Con la norma 1 o la 2 el resultado también sirve, pero
 * la ∞ es la que da cotas más conservadoras (y por lo tanto más seguras)
 * con muy poca cuenta.
 */
export function normaInfinitaVector(v: number[]): number {
  return v.reduce((max, x) => Math.max(max, Math.abs(x)), 0);
}

/**
 * Norma infinita de una matriz: el máximo de la suma de los valores
 * absolutos de cada fila.
 *
 * Se usa para el criterio de convergencia de los métodos iterativos:
 * si la matriz de iteración B cumple ‖B‖∞ < 1, la iteración converge
 * para cualquier vector inicial. Es un SUFICIENTE, no un necesario:
 * hay casos donde ‖B‖∞ ≥ 1 y el método converge igual, y otros donde
 * ‖B‖∞ < 1 pero... no, si ‖B‖∞ < 1 SIEMPRE converge. Por eso es
 * seguro usarlo como criterio.
 */
export function normaInfinitaMatriz(m: Matriz): number {
  return m.reduce(
    (max, fila) => Math.max(max, fila.reduce((s, v) => s + Math.abs(v), 0)),
    0,
  );
}

/** Norma 1 de una matriz: el máximo de la suma de los absolutos por columna. */
export function normaUnoMatriz(m: Matriz): number {
  const n = filas(m);
  const p = columnas(m);
  let max = 0;
  for (let j = 0; j < p; j++) {
    let suma = 0;
    for (let i = 0; i < n; i++) suma += Math.abs(m[i][j]);
    max = Math.max(max, suma);
  }
  return max;
}

/**
 * Residuo del sistema: ‖Ax − b‖∞.
 *
 * Es la medida honesta del error de una solución: no necesita la
 * solución verdadera, solo la que se propone. Si el residuo es
 * chiquito, la solución es buena.
 */
export function residuo(A: Matriz, x: number[], b: number[]): number {
  return normaInfinitaVector(restarVectores(multiplicarVector(A, x), b));
}

/* ------------------------------------------------------------------ */
/* Condiciones para que los iterativos converjan                       */
/* ------------------------------------------------------------------ */

/**
 * ¿La matriz es DIAGONALMENTE DOMINANTE?
 *
 * |aᵢᵢ| ≥ Σⱼ≠ᵢ |aᵢⱼ| para toda fila i.
 *
 * Si lo es, TODOS los métodos iterativos (Jacobi y Gauss-Seidel) convergen
 * desde cualquier vector inicial. Es la condición que se enseña en la
 * carrera porque es barata de verificar: se mira la diagonal de cada
 * fila y se compara con el resto de la fila.
 */
export function esDiagonalmenteDominante(m: Matriz): boolean {
  for (let i = 0; i < m.length; i++) {
    let suma = 0;
    for (let j = 0; j < m[i].length; j++) {
      if (i !== j) suma += Math.abs(m[i][j]);
    }
    if (Math.abs(m[i][i]) <= suma) return false;
  }
  return true;
}

/** ¿La matriz es SIMÉTRICA? (m = mᵀ) */
export function esSimetrica(m: Matriz): boolean {
  if (!esCuadrada(m)) return false;
  const n = m.length;
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (Math.abs(m[i][j] - m[j][i]) > TOLERANCIA) return false;
    }
  }
  return true;
}

/**
 * ¿La matriz es DEFINIDA POSITIVA?
 *
 * Para una matriz simétrica: todos los determinantes de las matrices
 * principales (las que salen de la esquina superior izquierda) son
 * positivos. Es el criterio de Sylvester, y es lo que hace válida la
 * factorización de Cholesky.
 */
export function esDefinidaPositiva(m: Matriz): boolean {
  if (!esSimetrica(m)) return false;
  const n = m.length;
  for (let k = 1; k <= n; k++) {
    const principal = m.slice(0, k).map((fila) => fila.slice(0, k));
    if (determinante(principal) <= 0) return false;
  }
  return true;
}

/* ------------------------------------------------------------------ */
/* Lectura y escritura                                                */
/* ------------------------------------------------------------------ */

/**
 * Convierte texto en una matriz.
 *
 * ── El formato, y por qué es este ────────────────────────────────────
 * El alumno escribe las filas separadas por salto de línea y los
 * números separados por espacio o coma:
 *
 *     3 1 2
 *     1 -1 1
 *
 * Es lo más parecido a cómo se escribe un sistema en un cuaderno, y
 * evita las comas de laTeX que el parser de expresiones del Módulo 1
 * usa como separador de argumentos (misma razón por la que acá NO se
 * acepta "2x" ni "x": los coeficientes se escriben con el número solo).
 *
 * Devuelve un mensaje de error en ESPAÑOL y legible cuando algo no
 * cierra, porque este texto lo escribe una persona a mano.
 */
export function parsearMatriz(texto: string): { matriz: Matriz } | { error: string } {
  const lineas = texto
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lineas.length === 0) {
    return { error: 'Escribí la matriz: al menos una fila.' };
  }

  const matriz: Matriz = [];
  const ancho = lineas[0]
    .split(/[\s,]+/)
    .filter((t) => t.length > 0).length;

  for (let i = 0; i < lineas.length; i++) {
    const partes = lineas[i].split(/[\s,]+/).filter((t) => t.length > 0);
    if (partes.length !== ancho) {
      return {
        error:
          `La fila ${i + 1} tiene ${partes.length} número(s) y la primera tiene ${ancho}. ` +
          'Todas las filas deben tener la misma cantidad de coeficientes.',
      };
    }
    const fila: number[] = [];
    for (const parte of partes) {
      const valor = Number(parte);
      if (!Number.isFinite(valor)) {
        return {
          error: `"${parte}" no es un número. En la fila ${i + 1} escribí solo coeficientes numéricos.`,
        };
      }
      fila.push(valor);
    }
    matriz.push(fila);
  }

  return { matriz };
}

/**
 * Convierte texto en un vector (el lado derecho b).
 *
 * Acepta una línea por componente ("5\n2\n9") o todos separados por
 * espacios o comas ("5 2 9"), que es como lo escribe la mayoría.
 */
export function parsearVector(texto: string): { vector: number[] } | { error: string } {
  const partes = texto
    .split(/[\s,]+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 0);

  if (partes.length === 0) {
    return { error: 'Escribí el lado derecho del sistema.' };
  }

  const vector: number[] = [];
  for (const parte of partes) {
    const valor = Number(parte);
    if (!Number.isFinite(valor)) {
      return { error: `"${parte}" no es un número.` };
    }
    vector.push(valor);
  }
  return { vector };
}

/**
 * Formatea un número para mostrarlo en una tabla.
 *
 * Los enteros se muestran sin decimales ("3" y no "3.00000000") porque
 * en un sistema lineal casi todos los coeficientes son enteros y verse
 * como "3.00000000" esconde que son enteros. Los demás, con 6 decimales
 * y sin ceros de relleno.
 */
export function formatearNumero(v: number, decimales = 6): string {
  if (!Number.isFinite(v)) return '—';
  if (Object.is(v, -0)) return '0';
  if (Number.isInteger(v)) return String(v);
  return v.toFixed(decimales).replace(/\.?0+$/, '');
}

/**
 * Formatea una matriz como filas de números, para las tablas.
 *
 * `separador` permite poner " | " antes de la última columna, que es
 * como se escribe la matriz AUMENTADA: la barra separa los coeficientes
 * del lado derecho.
 */
export function formatearMatriz(m: Matriz, separador = ''): string[] {
  return m.map((fila) => {
    const textos = fila.map((v) => formatearNumero(v));
    if (separador && textos.length > 0) {
      textos[textos.length - 1] = `${separador}${textos[textos.length - 1]}`;
    }
    return textos.join('  ');
  });
}

/**
 * Formatea un vector como texto: "(2, 3)".
 */
export function formatearVector(v: number[]): string {
  return `(${v.map((x) => formatearNumero(x)).join(', ')})`;
}

/**
 * Formatea el residuo ‖Ax − b‖∞ para la respuesta de la calculadora.
 *
 * Vive acá y no en el motor de cada método porque es la MISMA medida para
 * todos: un residuo de 0 se muestra como "0" (no como "0.00000000") y
 * uno chiquito se muestra en notación científica, porque es la única
 * forma de leer un número como 3.4e-14 sin perder la magnitud.
 *
 * Un residuo exacto de cero y uno de 1e-16 se muestran igual: para el
 * alumno significan lo mismo ("la solución cumple el sistema").
 */
export function formatearResiduo(r: number | undefined): string {
  if (r === undefined) return '—';
  if (r === 0 || Math.abs(r) < 1e-12) return '0';
  return r.toExponential(2);
}

/**
 * Formatea el sistema completo en notación de matriz aumentada:
 *
 *     ⎡ 3  1  2 |  5 ⎤
 *     ⎣ 1 -1  1 |  2 ⎦
 */
export function formatearSistema(A: Matriz, b: number[]): string {
  const filasTexto = A.map((fila, i) => {
    const izquierda = fila.map((v) => formatearNumero(v).padStart(3, ' ')).join(' ');
    const derecha = formatearNumero(b[i] ?? 0).padStart(3, ' ');
    return `[ ${izquierda} | ${derecha} ]`;
  });
  return filasTexto.join('\n');
}

/**
 * Construye la matriz AUMENTADA [A | b] como una matriz normal.
 *
 * Se usa para mostrar la eliminación paso a paso: la última columna es
 * el lado derecho y se dibuja separada por la barra.
 */
export function matrizAumentada(A: Matriz, b: number[]): Matriz {
  return A.map((fila, i) => [...fila, b[i] ?? 0]);
}

/**
 * Separa una matriz aumentada en la matriz de coeficientes y el vector.
 * (La operación inversa de `matrizAumentada`.)
 */
export function separarAumentada(m: Matriz): { A: Matriz; b: number[] } {
  return {
    A: m.map((fila) => fila.slice(0, -1)),
    b: m.map((fila) => fila[fila.length - 1]),
  };
}
