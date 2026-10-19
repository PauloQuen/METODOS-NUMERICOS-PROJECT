/**
 * Tokenizador: convierte el texto de una función en una lista de Tokens.
 *
 * ── Qué es un token ────────────────────────────────────────────────────
 * Es cada "pedacito" con sentido de la expresión. Por ejemplo
 * "x^3 - sin(x)" se parte en:
 *   variable(x) ^ numero(3) - funcion(sin) ( variable(x) )
 *
 * ── Multiplicación implícita ──────────────────────────────────────────
 * El alumno escribe "2x" o "3sin(x)", no "2*x". Acá NO se resuelve con
 * replace() sobre el texto (se rompería: "sin" se partiría en "s*in").
 * Se resuelve más tarde, en el parser, mirando los tokens ya separados.
 * Ver `evaluador-funciones.ts`.
 *
 * ── Números ───────────────────────────────────────────────────────────
 * Se aceptan notación científica: "1e-3" es 0.001, "2E5" es 200000.
 */

/** Tipos de token que el tokenizador puede emitir. */
export type TipoToken =
  | 'numero'
  | 'variable'
  | 'constante'
  | 'funcion'
  | 'mas'
  | 'menos'
  | 'por'
  | 'dividido'
  | 'potencia'
  | 'abre'
  | 'cierra'
  | 'fin';

export interface Token {
  tipo: TipoToken;
  /** Texto original del token (sirve para los mensajes de error). */
  texto: string;
  /** Solo en tokens de tipo 'numero'. */
  numero?: number;
}

/** Error de sintaxis, con mensaje pensado para el alumno. */
export class ErrorExpresion extends Error {
  constructor(mensaje: string) {
    super(mensaje);
    this.name = 'ErrorExpresion';
  }
}

const FUNCIONES_CONOCIDAS = new Set([
  'sin', 'cos', 'tan',
  'asin', 'acos', 'atan',
  'exp', 'ln', 'log', 'log10',
  'sqrt', 'abs',
  'sen', 'tg', 'raiz',
]);

function esDigito(c: string): boolean {
  return c >= '0' && c <= '9';
}

function esLetra(c: string): boolean {
  return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || c === '_';
}

function esAlfaNumerico(c: string): boolean {
  return esLetra(c) || esDigito(c);
}

/**
 * Convierte el texto en tokens.
 * @throws ErrorExpresion si hay un carácter que no entendemos.
 */
export function tokenizar(entrada: string): Token[] {
  // Normalizamos antes de tokenizar. Los textos de ejemplo del proyecto
  // usan el signo menos tipográfico "−" (U+2212), que NO es el guion "-"
  // del teclado. Si no lo cambiamos, el alumno ve un ejemplo con "−" y al
  // escribirlo obtiene un error de carácter inválido.
  const texto = (entrada ?? '')
    .replace(/−/g, '-')   // menos tipográfico → menos normal
    .replace(/–/g, '-')   // raya corta
    .replace(/×/g, '*')   // signo de multiplicar
    .replace(/÷/g, '/')   // signo de dividir
    .trim();

  if (texto === '') {
    throw new ErrorExpresion('Escribí la función, por ejemplo: x^3 - x - 2');
  }

  const tokens: Token[] = [];
  let i = 0;

  while (i < texto.length) {
    const c = texto[i];

    // Espacios: se ignoran.
    if (c === ' ' || c === '\t' || c === '\n' || c === '\r') {
      i++;
      continue;
    }

    // Número entero o decimal.
    if (esDigito(c) || (c === '.' && esDigito(texto[i + 1] ?? ''))) {
      let j = i;
      if (c === '.') {
        j++; // caso ".5"
      } else {
        while (j < texto.length && esDigito(texto[j])) j++;
        if (texto[j] === '.') j++; // parte decimal
      }
      while (j < texto.length && esDigito(texto[j])) j++;

      // Notación científica: 1e-3
      if (texto[j] === 'e' || texto[j] === 'E') {
        let k = j + 1;
        if (texto[k] === '+' || texto[k] === '-') k++;
        if (esDigito(texto[k] ?? '')) {
          while (k < texto.length && esDigito(texto[k])) k++;
          j = k;
        }
      }

      const pedazo = texto.slice(i, j);
      tokens.push({ tipo: 'numero', texto: pedazo, numero: Number(pedazo) });
      i = j;
      continue;
    }

    // Palabra: variable, constante o función.
    if (esLetra(c)) {
      let j = i;
      while (j < texto.length && esAlfaNumerico(texto[j])) j++;
      const palabra = texto.slice(i, j);
      const minuscula = palabra.toLowerCase();

      if (minuscula === 'x') {
        tokens.push({ tipo: 'variable', texto: palabra });
      } else if (minuscula === 'pi') {
        tokens.push({ tipo: 'constante', texto: palabra });
      } else if (minuscula === 'e') {
        // Ojo: "e" es constante, pero "e-3" dentro de un número ya se
        // leyó antes como notación científica. Solo llega acá si es suelto.
        tokens.push({ tipo: 'constante', texto: palabra });
      } else if (FUNCIONES_CONOCIDAS.has(minuscula)) {
        tokens.push({ tipo: 'funcion', texto: palabra });
      } else {
        throw new ErrorExpresion(
          `No conozco la función "${palabra}". Podés usar: sin, cos, tan, ` +
            `exp, ln, log, sqrt y abs.`,
        );
      }
      i = j;
      continue;
    }

    // Operadores y paréntesis.
    if (c === '+') { tokens.push({ tipo: 'mas', texto: c }); i++; continue; }
    if (c === '-') { tokens.push({ tipo: 'menos', texto: c }); i++; continue; }
    if (c === '*') { tokens.push({ tipo: 'por', texto: c }); i++; continue; }
    if (c === '/') { tokens.push({ tipo: 'dividido', texto: c }); i++; continue; }
    if (c === '^') { tokens.push({ tipo: 'potencia', texto: c }); i++; continue; }
    if (c === '(') { tokens.push({ tipo: 'abre', texto: c }); i++; continue; }
    if (c === ')') { tokens.push({ tipo: 'cierra', texto: c }); i++; continue; }

    // Cualquier otra cosa: error claro, no ejecución.
    throw new ErrorExpresion(
      `El carácter "${c}" no es válido. Escribí la función con números, ` +
        `x, operadores (+ - * / ^) y paréntesis.`,
    );
  }

  tokens.push({ tipo: 'fin', texto: '' });
  return tokens;
}
