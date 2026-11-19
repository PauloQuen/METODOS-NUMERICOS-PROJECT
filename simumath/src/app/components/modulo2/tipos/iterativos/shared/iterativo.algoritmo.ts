export type MetodoIterativo = 'jacobi' | 'gauss-seidel';
export const MAX_ITERACIONES = 5000;

export interface EntradaIterativa {
  A: readonly (readonly number[])[];
  b: readonly number[];
  x0?: readonly number[];
  tol?: number;
  maxIter?: number;
}

export interface IteracionSistema {
  k: number;
  x: number[];
  cambio: number;
  cambioRelativo: number;
  residuo: number;
  residuoRelativo: number;
}

export interface ResultadoIterativo {
  estado: 'convergencia' | 'limite' | 'entrada-invalida' | 'no-finito' | 'estancamiento';
  convergio: boolean;
  mensaje: string;
  iteraciones: number;
  iteracionesDetalle: IteracionSistema[];
  inicial?: IteracionSistema;
  aproximacion?: number[];
  solucion?: number[];
  diagonalDominante: boolean;
}

export const normaInfinito = (v: readonly number[]): number => v.reduce((m, x) => Math.max(m, Math.abs(x)), 0);
export const residuos = (A: readonly (readonly number[])[], b: readonly number[], x: readonly number[]): number[] =>
  A.map((fila, i) => fila.reduce((s, a, j) => s + a * x[j], 0) - b[i]);

export function validarEntrada(entrada: EntradaIterativa): string | undefined {
  const { A, b, x0 } = entrada;
  const n = A.length;
  if (!n || A.some(f => f.length !== n)) return 'La matriz A debe ser cuadrada y tener al menos una fila.';
  if (b.length !== n) return 'El vector b debe tener un componente por ecuación.';
  if (A.some(f => f.some(a => !Number.isFinite(a))) || b.some(v => !Number.isFinite(v)))
    return 'Los coeficientes de A y b deben ser números finitos.';
  if (x0 && (x0.length !== n || x0.some(v => !Number.isFinite(v))))
    return 'El vector inicial debe tener un número finito por incógnita.';
  const tol = entrada.tol ?? 1e-6;
  const maxIter = entrada.maxIter ?? 200;
  if (!Number.isFinite(tol) || tol <= 0) return 'La tolerancia debe ser un número finito mayor que cero.';
  if (!Number.isInteger(maxIter) || maxIter < 1 || maxIter > MAX_ITERACIONES)
    return `El máximo de iteraciones debe ser un entero entre 1 y ${MAX_ITERACIONES}.`;
  for (let i = 0; i < n; i++) {
    if (A[i][i] === 0) return `La entrada diagonal a${i + 1}${i + 1} es cero. Reordena las ecuaciones antes de iterar.`;
  }
  return undefined;
}

/** Una barrida. Jacobi conserva el vector anterior; Seidel reutiliza solo los índices ya actualizados. */
export function actualizarVector(A: EntradaIterativa['A'], b: EntradaIterativa['b'], anterior: readonly number[], metodo: MetodoIterativo): number[] {
  const nuevo = [...anterior];
  for (let i = 0; i < A.length; i++) {
    let suma = 0;
    for (let j = 0; j < A.length; j++) {
      if (i !== j) suma += A[i][j] * (metodo === 'gauss-seidel' && j < i ? nuevo[j] : anterior[j]);
    }
    nuevo[i] = (b[i] - suma) / A[i][i];
  }
  return nuevo;
}

/** Motor puro: no modifica A, b ni x0 y nunca presenta un resultado no convergente como solución. */
export function resolverIterativo(entrada: EntradaIterativa, metodo: MetodoIterativo): ResultadoIterativo {
  const error = validarEntrada(entrada);
  if (error) return { estado: 'entrada-invalida', convergio: false, mensaje: error, iteraciones: 0,
    iteracionesDetalle: [], diagonalDominante: false };
  const { A, b } = entrada;
  const tol = entrada.tol ?? 1e-6;
  const maxIter = entrada.maxIter ?? 200;
  const diagonalDominante = A.every((fila, i) => Math.abs(fila[i]) > fila.reduce((s, a, j) => s + (i === j ? 0 : Math.abs(a)), 0));
  const normaA = Math.max(...A.map(f => f.reduce((s, a) => s + Math.abs(a), 0)));
  const normaB = normaInfinito(b);
  // Si b es cero se escala por A, de modo que multiplicar todo el sistema por una constante no cambie el criterio.
  const escalaResiduo = normaB || normaA;
  const evaluar = (x: number[]) => {
    const residuo = normaInfinito(residuos(A, b, x));
    return { residuo, residuoRelativo: residuo / escalaResiduo };
  };
  const semilla = [...(entrada.x0 ?? A.map(() => 0))];
  const valoresIniciales = evaluar(semilla);
  if (![normaA, escalaResiduo, valoresIniciales.residuo, valoresIniciales.residuoRelativo].every(Number.isFinite))
    return { estado: 'no-finito', convergio: false, mensaje: 'La escala de los datos excede el rango numérico. Reescala las ecuaciones o el vector inicial.',
      iteraciones: 0, iteracionesDetalle: [], diagonalDominante };
  const inicial: IteracionSistema = { k: 0, x: semilla, cambio: 0, cambioRelativo: 0, ...valoresIniciales };
  const iteracionesDetalle: IteracionSistema[] = [];
  let ultima = inicial;
  const terminar = (estado: ResultadoIterativo['estado'], mensaje: string): ResultadoIterativo => ({
    estado, mensaje, convergio: estado === 'convergencia', inicial, diagonalDominante,
    iteraciones: iteracionesDetalle.length, iteracionesDetalle,
    aproximacion: [...ultima.x], solucion: estado === 'convergencia' ? [...ultima.x] : undefined,
  });
  if (inicial.residuoRelativo <= tol)
    return terminar('convergencia', 'El vector inicial ya satisface la tolerancia del residuo; no fue necesario iterar.');

  for (let k = 1; k <= maxIter; k++) {
    const x = actualizarVector(A, b, ultima.x, metodo);
    const cambio = normaInfinito(x.map((v, i) => v - ultima.x[i]));
    const cambioRelativo = cambio / Math.max(1, normaInfinito(x));
    const medidas = evaluar(x);
    if (![...x, cambio, cambioRelativo, medidas.residuo, medidas.residuoRelativo].every(Number.isFinite))
      return terminar('no-finito', `La actualización ${k} produjo valores fuera del rango numérico. Se conserva la última aproximación finita; revisa la escala y la convergencia.`);
    ultima = { k, x, cambio, cambioRelativo, ...medidas };
    iteracionesDetalle.push(ultima);
    if (cambioRelativo <= tol && medidas.residuoRelativo <= tol)
      return terminar('convergencia', `Se cumplieron los criterios de cambio y residuo en ${k} iteraciones.`);
    if (cambio === 0)
      return terminar('estancamiento', 'El vector dejó de cambiar, pero el residuo no cumple la tolerancia. Revisa el escalado y la precisión solicitada.');
  }
  return terminar('limite', `Se alcanzó el límite de ${maxIter} iteraciones sin cumplir ambos criterios. La última aproximación no se considera una solución validada.`);
}
