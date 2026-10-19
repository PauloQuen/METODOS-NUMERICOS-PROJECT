import { ErrorExpresion, Token, TipoToken, tokenizar } from './tokenizador';

/**
 * Convierte el texto de una función en un árbol (AST) y sabe calcularlo.
 *
 * ── Por qué NO se usa eval() ni new Function() ────────────────────────
 * Esos dos ejecutan código arbitrario escrito por el usuario. Además, si
 * la app se sirve con una Content Security Policy estricta, el navegador
 * los bloquea y la calculadora deja de funcionar. Acá el texto se
 * convierte en un árbol y el árbol se recorre con un switch: lo único
 * que se puede ejecutar son las operaciones que escribimos nosotros.
 *
 * ── Precedencia (de la más fuerte a la más débil) ─────────────────────
 *   1. sin(x), sqrt(x), ...   funciones
 *   2. ^                      potencia, por la derecha: 2^3^2 = 2^(3^2)
 *   3. -x                     signo unario (se aplica DESPUÉS de ^: -2^2 = -4)
 *   4. * /                    producto
 *   5. + -                    suma
 *
 * Ojo con el punto 3: la potencia "gana" al signo, o sea que -2^2 = -4.
 * Para lograrlo, la base de la potencia se lee SIN permitir signo adelante
 * (si no, se agruparía como (-2)^2 = 4). Ver `parsearPotencia`.
 *
 * ── Multiplicación implícita ──────────────────────────────────────────
 * "2x", "3sin(x)", "(x+1)(x-2)" y "4(x+2)" son cosas que el alumno escribe
 * todo el tiempo. Se detectan acá, mirando el token siguiente al terminar
 * de leer un factor. NO se hace con replace() sobre el texto, porque eso
 * partía "sin" en "s*in" y rompía todas las funciones trigonométricas.
 *
 * ── Cómo se lee el árbol ──────────────────────────────────────────────
 * Cada función del parser es un nivel de precedencia: `parsearSuma` llama
 * a `parsearProducto`, que llama a `parsearPotencia`, y así hasta llegar
 * al factor más simple (un número, la x, o una llamada). Después se
 * recorre con `calcular`.
 */

/* ------------------------------------------------------------------ */
/* Tipos del árbol                                                      */
/* ------------------------------------------------------------------ */

export type Operador = '+' | '-' | '*' | '/' | '^';

/** Un nodo del árbol de expresiones. */
export type Nodo =
  | { tipo: 'numero'; valor: number }
  | { tipo: 'variable' }
  | { tipo: 'constante'; nombre: 'pi' | 'e' }
  | { tipo: 'unario'; operador: '-' | '+'; operando: Nodo }
  | { tipo: 'binario'; operador: Operador; izquierda: Nodo; derecha: Nodo }
  | { tipo: 'llamada'; nombre: NombreFuncion; argumento: Nodo };

/** Funciones aceptadas. La lista es cerrada a propósito. */
export type NombreFuncion =
  | 'sin' | 'cos' | 'tan'
  | 'asin' | 'acos' | 'atan'
  | 'exp' | 'ln' | 'log' | 'log10'
  | 'sqrt' | 'abs';

const FUNCIONES: Record<NombreFuncion, (v: number) => number> = {
  sin: Math.sin,
  cos: Math.cos,
  tan: Math.tan,
  asin: Math.asin,
  acos: Math.acos,
  atan: Math.atan,
  exp: Math.exp,
  ln: Math.log,
  log: Math.log10,
  log10: Math.log10,
  sqrt: Math.sqrt,
  abs: Math.abs,
};

/** Aceptamos como se escriben en español. */
const ALIAS: Record<string, NombreFuncion> = {
  sin: 'sin',
  sen: 'sin',
  cos: 'cos',
  tan: 'tan',
  tg: 'tan',
  asin: 'asin',
  acos: 'acos',
  atan: 'atan',
  exp: 'exp',
  ln: 'ln',
  log: 'log',
  log10: 'log10',
  sqrt: 'sqrt',
  raiz: 'sqrt',
  abs: 'abs',
};

/* ------------------------------------------------------------------ */
/* Parser: texto -> árbol                                               */
/* ------------------------------------------------------------------ */

class Parser {
  private indice = 0;

  constructor(private readonly tokens: Token[]) {}

  private actual(): Token {
    return this.tokens[this.indice];
  }

  private avanzar(): Token {
    const t = this.tokens[this.indice];
    this.indice++;
    return t;
  }

  private es(tipo: TipoToken): boolean {
    return this.actual().tipo === tipo;
  }

  /** Punto de entrada: arma el árbol completo. */
  parsear(): Nodo {
    const nodo = this.parsearSuma();
    if (!this.es('fin')) {
      throw new ErrorExpresion(
        `Sobró un ")" en la expresión. Revisá que los paréntesis estén balanceados.`,
      );
    }
    return nodo;
  }

  /** Nivel 5 (el más débil): suma y resta. */
  private parsearSuma(): Nodo {
    let izquierda = this.parsearProducto();
    while (this.es('mas') || this.es('menos')) {
      const operador = this.avanzar().tipo === 'mas' ? '+' : '-';
      const derecha = this.parsearProducto();
      izquierda = { tipo: 'binario', operador, izquierda, derecha };
    }
    return izquierda;
  }

  /** Nivel 4: producto y división, con multiplicación implícita. */
  private parsearProducto(): Nodo {
    let izquierda = this.parsearUnario();
    while (true) {
      if (this.es('por') || this.es('dividido')) {
        const operador = this.avanzar().tipo === 'por' ? '*' : '/';
        const derecha = this.parsearUnario();
        izquierda = { tipo: 'binario', operador, izquierda, derecha };
        continue;
      }
      // Multiplicación implícita: "2x", "3sin(x)", "(x+1)(x-2)", "4(x+2)".
      if (this.puedeEmpezarFactor()) {
        const derecha = this.parsearUnario();
        izquierda = { tipo: 'binario', operador: '*', izquierda, derecha };
        continue;
      }
      break;
    }
    return izquierda;
  }

  /** Nivel 3: potencia, asociando a la derecha (2^3^2 = 2^9).
   *
   *  La base se lee con `parsearFactor` y NO con `parsearUnario`. Esa es
   *  justamente la diferencia que hace que -2^2 valga -4 y no +4: si la
   *  base aceptara el signo, el "-2" se agruparía antes de elevar y el
   *  resultado sería (-2)^2. Al leer la base sin signo, la potencia se
   *  calcula primero y el signo se aplica encima.
   *
   *  El exponente sí puede llevar signo: 2^-3 tiene que funcionar. */
  private parsearPotencia(): Nodo {
    const base = this.parsearFactor();
    if (this.es('potencia')) {
      this.avanzar();
      const exponente = this.parsearUnario();
      return { tipo: 'binario', operador: '^', izquierda: base, derecha: exponente };
    }
    return base;
  }

  /** Nivel 2: signo unario. Se aplica DESPUÉS de la potencia. */
  private parsearUnario(): Nodo {
    if (this.es('menos')) {
      this.avanzar();
      return { tipo: 'unario', operador: '-', operando: this.parsearUnario() };
    }
    if (this.es('mas')) {
      this.avanzar();
      return { tipo: 'unario', operador: '+', operando: this.parsearUnario() };
    }
    return this.parsearPotencia();
  }

  /** Nivel 1 (el más fuerte): número, x, constante, función o paréntesis. */
  private parsearFactor(): Nodo {
    const token = this.actual();

    if (token.tipo === 'numero') {
      this.avanzar();
      return { tipo: 'numero', valor: token.numero ?? 0 };
    }

    if (token.tipo === 'variable') {
      this.avanzar();
      return { tipo: 'variable' };
    }

    if (token.tipo === 'constante') {
      this.avanzar();
      return token.texto.toLowerCase() === 'pi'
        ? { tipo: 'constante', nombre: 'pi' }
        : { tipo: 'constante', nombre: 'e' };
    }

    if (token.tipo === 'funcion') {
      this.avanzar();
      const nombre = ALIAS[token.texto.toLowerCase()];
      if (!this.es('abre')) {
        throw new ErrorExpresion(`La función ${token.texto} necesita paréntesis: escribí ${token.texto}(x).`);
      }
      this.avanzar(); // consume el "("
      const argumento = this.parsearSuma();
      if (!this.es('cierra')) {
        throw new ErrorExpresion(`Falta cerrar el paréntesis de ${token.texto}(.`);
      }
      this.avanzar(); // consume el ")"
      return { tipo: 'llamada', nombre, argumento };
    }

    if (token.tipo === 'abre') {
      this.avanzar();
      const interior = this.parsearSuma();
      if (!this.es('cierra')) {
        throw new ErrorExpresion('Falta cerrar un paréntesis "(".');
      }
      this.avanzar();
      return interior;
    }

    if (token.tipo === 'fin') {
      throw new ErrorExpresion('La expresión está incompleta: falta algo al final.');
    }

    throw new ErrorExpresion(`No esperaba "${token.texto}" en este punto de la expresión.`);
  }

  /** ¿El token siguiente puede iniciar un factor? Sirve para la
   *  multiplicación implícita. */
  private puedeEmpezarFactor(): boolean {
    const t = this.actual().tipo;
    return t === 'numero' || t === 'variable' || t === 'constante'
      || t === 'funcion' || t === 'abre';
  }
}

/* ------------------------------------------------------------------ */
/* Evaluador: árbol -> número                                           */
/* ------------------------------------------------------------------ */

/** Calcula el valor de un nodo para una x dada. */
export function calcular(nodo: Nodo, x: number): number {
  switch (nodo.tipo) {
    case 'numero':
      return nodo.valor;

    case 'variable':
      return x;

    case 'constante':
      return nodo.nombre === 'pi' ? Math.PI : Math.E;

    case 'unario': {
      const valor = calcular(nodo.operando, x);
      return nodo.operador === '-' ? -valor : valor;
    }

    case 'binario': {
      const a = calcular(nodo.izquierda, x);
      const b = calcular(nodo.derecha, x);
      switch (nodo.operador) {
        case '+': return a + b;
        case '-': return a - b;
        case '*': return a * b;
        case '/': return a / b;
        case '^': return Math.pow(a, b);
      }
      return NaN;
    }

    case 'llamada':
      return FUNCIONES[nodo.nombre](calcular(nodo.argumento, x));
  }
}

/* ------------------------------------------------------------------ */
/* API pública                                                          */
/* ------------------------------------------------------------------ */

/**
 * Función evaluable a partir de texto.
 *
 * Se compila una sola vez y después se puede llamar muchas veces, que es
 * lo que hacen los algoritmos numéricos (miles de llamadas porBisección).
 */
export class FuncionEvaluable {
  private readonly arbol: Nodo;

  private constructor(arbol: Nodo) {
    this.arbol = arbol;
  }

  /**
   * Compila el texto. Lanza ErrorExpresion si la sintaxis está mal.
   * @param expr Texto de la función, por ejemplo "x^3 - x - 2".
   */
  static compilar(expr: string): FuncionEvaluable {
    const tokens = tokenizar(expr);
    const arbol = new Parser(tokens).parsear();

    // Comprobación de humo: si el árbol explota en x = 1, la expresión
    // tenía un problema. Ojo: una función puede ser válida solo en un
    // dominio (ln(x) en x > 0), así que un NaN acá NO es error de
    // sintaxis. Por eso solo miramos que no se rompa el árbol.
    const funcion = new FuncionEvaluable(arbol);
    try {
      funcion.evaluar(1);
    } catch {
      throw new ErrorExpresion('La función no se pudo evaluar. Revisá la sintaxis.');
    }
    return funcion;
  }

  /** Evalúa la función en x. */
  evaluar(x: number): number {
    return calcular(this.arbol, x);
  }

  /**
   * Derivada numérica por diferencia central.
   * Se usa cuando el alumno no escribe f'(x). No es exacta, pero para
   * Newton-Raphson alcanza y sobra.
   */
  derivadaNumerica(x: number, h = 1e-6): number {
    return (this.evaluar(x + h) - this.evaluar(x - h)) / (2 * h);
  }
}

/**
 * Atajo: compila y devuelve la función en un solo paso.
 * @throws ErrorExpresion si la sintaxis está mal.
 */
export function parsearFuncion(expr: string): (x: number) => number {
  const compilada = FuncionEvaluable.compilar(expr);
  return (x: number) => compilada.evaluar(x);
}
