/**
 * VERIFICACIÓN DE RESPUESTAS POR FORMATO.
 *
 * Una sola implementación para todos los métodos. Cada formato sabe
 * interpretar el texto del alumno y compararlo con el valor correcto;
 * el método solo declara `formatoRespuesta` y `valorCorrecto`.
 *
 * ── Por qué estrategias y no un `if` por método ──────────────────────
 * Los métodos producen cosas distintas: una raíz, un vector, una matriz,
 * los coeficientes de un polinomio o un error. Si cada método comparara
 * a mano, cada uno tendría su propia tolerancia y su propia forma de
 * aceptar la coma decimal. Acá eso se resuelve una vez.
 *
 * ── Formatos ─────────────────────────────────────────────────────────
 * · escalar    → un número (con coma o punto decimal).
 * · entero     → un entero exacto (número de iteraciones, orden).
 * · vector     → componentes separadas por `;` o espacios.
 * · matriz     → filas separadas por `;`, columnas por espacios.
 * · polinomio  → coeficientes de menor a mayor grado, separados por `;`.
 * · error      → un número comparado de forma relativa.
 *
 * El valor correcto NO se muestra: esta capa solo devuelve el estado.
 */

export type FormatoRespuesta =
  | 'escalar'
  | 'entero'
  | 'vector'
  | 'matriz'
  | 'polinomio'
  | 'error';

/** Un escalar, un vector o una matriz de números. */
export type ValorCorrecto = number | number[] | number[][];

export interface EspecificacionRespuesta {
  formato: FormatoRespuesta;
  valorCorrecto: ValorCorrecto;
  /** Tolerancia absoluta (o relativa para `error`). Por defecto 0.01. */
  tolerancia?: number;
  /** Puntos donde evaluar el polinomio si los coeficientes no coinciden. */
  puntosPrueba?: number[];
}

export type EstadoRespuesta = 'acierto' | 'casi' | 'incorrecto' | 'invalido';

export interface ResultadoRespuesta {
  estado: EstadoRespuesta;
  valor?: ValorCorrecto;
}

export const TOLERANCIA_POR_DEFECTO = 0.01;

/** Margen relativo con el que se considera que el alumno "casi" acertó. */
const MARGEN_CASI = 0.05;

/* ------------------------------------------------------------------ */
/* Lectura de números                                                   */
/* ------------------------------------------------------------------ */

/**
 * Lee un número simple. Acepta coma o punto decimal y notación
 * científica. Rechaza unidades, fracciones y separadores de miles.
 */
export function leerNumero(texto: string): number | null {
  const limpio = texto.trim().replace(/\s+/g, '');
  if (limpio === '') return null;

  // Si hay más de un separador decimal, no es un número simple.
  const comas = (limpio.match(/,/g) ?? []).length;
  const puntos = (limpio.match(/\./g) ?? []).length;
  if (comas > 1 || puntos > 1) return null;

  const normalizado = limpio.replace(',', '.');
  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/.test(normalizado)) {
    return null;
  }

  const valor = Number(normalizado);
  return Number.isFinite(valor) ? valor : null;
}

/** Quita corchetes, paréntesis y llaves de los extremos. */
function sinDelimitadores(texto: string): string {
  return texto.trim().replace(/^[\[\(\{]\s*/, '').replace(/\s*[\]\)\}]\s*$/, '');
}

/**
 * Lee una lista de números. Los separadores son `;`, saltos de línea o
 * espacios. La coma queda reservada para el decimal.
 */
function leerLista(texto: string): number[] | null {
  const limpio = sinDelimitadores(texto);
  if (limpio === '') return null;

  const partes = limpio.split(/\s*;\s*|\s+|\n+/).filter((p) => p !== '');
  if (partes.length === 0) return null;

  const valores: number[] = [];
  for (const parte of partes) {
    const n = leerNumero(parte);
    if (n === null) return null;
    valores.push(n);
  }
  return valores;
}

/** Lee una matriz con filas separadas por `;` y columnas por espacios. */
function leerMatriz(texto: string): number[][] | null {
  const limpio = sinDelimitadores(texto);
  if (limpio === '') return null;

  const filas = limpio.split(/\s*;\s*|\n+/).filter((f) => f.trim() !== '');
  if (filas.length === 0) return null;

  const matriz: number[][] = [];
  for (const fila of filas) {
    const valores = leerLista(fila);
    if (valores === null || valores.length === 0) return null;
    matriz.push(valores);
  }
  return matriz;
}

/* ------------------------------------------------------------------ */
/* Comparaciones                                                        */
/* ------------------------------------------------------------------ */

function compararNumero(obtenido: number, correcto: number, tolerancia: number) {
  const diferencia = Math.abs(obtenido - correcto);
  if (diferencia <= Math.abs(tolerancia)) return 'acierto' as const;

  const relativo = correcto === 0 ? diferencia : diferencia / Math.abs(correcto);
  return relativo <= Math.max(MARGEN_CASI, Math.abs(tolerancia) * 5)
    ? ('casi' as const)
    : ('incorrecto' as const);
}

/** Combina los estados de varias componentes: gana el peor. */
function combinar(estados: EstadoRespuesta[]): EstadoRespuesta {
  if (estados.some((e) => e === 'invalido')) return 'invalido';
  if (estados.every((e) => e === 'acierto')) return 'acierto';
  if (estados.every((e) => e === 'acierto' || e === 'casi')) return 'casi';
  return 'incorrecto';
}

/** Compara dos listas de igual longitud, componente a componente. */
function compararLista(obtenidos: number[], correctos: number[], tolerancia: number) {
  if (obtenidos.length !== correctos.length) return 'incorrecto' as const;
  return combinar(obtenidos.map((v, i) => compararNumero(v, correctos[i], tolerancia)));
}

/** Compara dos matrices elemento a elemento. */
function compararMatriz(obtenida: number[][], correcta: number[][], tolerancia: number) {
  if (obtenida.length !== correcta.length) return 'incorrecto' as const;
  const estados: EstadoRespuesta[] = [];
  for (let i = 0; i < correcta.length; i++) {
    if (obtenida[i].length !== correcta[i].length) return 'incorrecto';
    for (let j = 0; j < correcta[i].length; j++) {
      estados.push(compararNumero(obtenida[i][j], correcta[i][j], tolerancia));
    }
  }
  return combinar(estados);
}

/**
 * Compara coeficientes de polinomios. Se completan con ceros a la
 * derecha para aceptar un grado menor escrito sin los ceros de cola.
 * Si los coeficientes no coinciden y hay `puntosPrueba`, se evalúa el
 * polinomio del alumno en esos puntos y se compara con el correcto: así
 * también se acepta una forma equivalente (por ejemplo, escalada).
 */
function compararPolinomio(
  obtenidos: number[],
  correctos: number[],
  tolerancia: number,
  puntosPrueba: number[] | undefined,
) {
  const largo = Math.max(obtenidos.length, correctos.length);
  const a = [...obtenidos, ...Array(largo - obtenidos.length).fill(0)];
  const b = [...correctos, ...Array(largo - correctos.length).fill(0)];

  const porCoeficientes = compararLista(a, b, tolerancia);
  if (porCoeficientes === 'acierto') return porCoeficientes;

  if (puntosPrueba && puntosPrueba.length > 0) {
    const evaluar = (coef: number[], x: number) =>
      coef.reduce((suma, c, i) => suma + c * Math.pow(x, i), 0);

    const porPuntos = combinar(
      puntosPrueba.map((x) => compararNumero(evaluar(a, x), evaluar(b, x), tolerancia)),
    );
    if (porPuntos === 'acierto') return porPuntos;
    // Si ambos caminos fallan, se queda con el estado más benévolo.
    return porCoeficientes === 'casi' || porPuntos === 'casi' ? 'casi' : 'incorrecto';
  }

  return porCoeficientes;
}

/* ------------------------------------------------------------------ */
/* API                                                                  */
/* ------------------------------------------------------------------ */

/** Interpreta y compara la respuesta del alumno. No revela el valor. */
export function evaluarRespuesta(
  texto: string,
  especificacion: EspecificacionRespuesta,
): ResultadoRespuesta {
  const tolerancia = especificacion.tolerancia ?? TOLERANCIA_POR_DEFECTO;
  const { formato, valorCorrecto } = especificacion;

  switch (formato) {
    case 'entero': {
      if (typeof valorCorrecto !== 'number' || !Number.isInteger(valorCorrecto)) {
        return { estado: 'invalido' };
      }
      const limpio = texto.trim();
      if (!/^[+-]?\d+$/.test(limpio)) return { estado: 'invalido' };
      const valor = Number(limpio);
      return { estado: valor === valorCorrecto ? 'acierto' : 'incorrecto', valor };
    }

    case 'escalar': {
      if (typeof valorCorrecto !== 'number') return { estado: 'invalido' };
      const valor = leerNumero(texto);
      if (valor === null) return { estado: 'invalido' };
      return { estado: compararNumero(valor, valorCorrecto, tolerancia), valor };
    }

    case 'error': {
      if (typeof valorCorrecto !== 'number') return { estado: 'invalido' };
      const valor = leerNumero(texto);
      if (valor === null) return { estado: 'invalido' };
      const diferencia = Math.abs(valor - valorCorrecto);
      const relativo = valorCorrecto === 0 ? diferencia : diferencia / Math.abs(valorCorrecto);
      if (relativo <= Math.abs(tolerancia)) return { estado: 'acierto', valor };
      if (relativo <= Math.max(MARGEN_CASI, Math.abs(tolerancia) * 5)) {
        return { estado: 'casi', valor };
      }
      return { estado: 'incorrecto', valor };
    }

    case 'vector': {
      if (!Array.isArray(valorCorrecto) || valorCorrecto.some((v) => typeof v !== 'number')) {
        return { estado: 'invalido' };
      }
      const valores = leerLista(texto);
      if (valores === null) return { estado: 'invalido' };
      return {
        estado: compararLista(valores, valorCorrecto as number[], tolerancia),
        valor: valores,
      };
    }

    case 'matriz': {
      if (
        !Array.isArray(valorCorrecto) ||
        valorCorrecto.some((fila) => !Array.isArray(fila))
      ) {
        return { estado: 'invalido' };
      }
      const matriz = leerMatriz(texto);
      if (matriz === null) return { estado: 'invalido' };
      return {
        estado: compararMatriz(matriz, valorCorrecto as number[][], tolerancia),
        valor: matriz,
      };
    }

    case 'polinomio': {
      if (!Array.isArray(valorCorrecto) || valorCorrecto.some((v) => typeof v !== 'number')) {
        return { estado: 'invalido' };
      }
      const coeficientes = leerLista(texto);
      if (coeficientes === null) return { estado: 'invalido' };
      return {
        estado: compararPolinomio(
          coeficientes,
          valorCorrecto as number[],
          tolerancia,
          especificacion.puntosPrueba,
        ),
        valor: coeficientes,
      };
    }
  }
}
