import {
  FuncionEvaluable,
  calcular,
  parsearFuncion,
  type Nodo,
} from './evaluador-funciones';
import { ErrorExpresion, tokenizar } from './tokenizador';

/**
 * Tests del evaluador de funciones.
 *
 * La regla acá es probar contra las expresiones que el proyecto YA usa
 * (data.ejemplos.ts, data.casuisticas.ts y registro.ts) más los casos que
 * el enunciado del TP pide aceptar. Si un test falla, significa que un
 * alumno no podría escribir su propia función: eso es un bug, no un detalle.
 */

describe('tokenizar', () => {
  it('parte una expresión simple en tokens', () => {
    const tokens = tokenizar('x + 1');
    expect(tokens.map((t) => t.tipo)).toEqual([
      'variable', 'mas', 'numero', 'fin',
    ]);
  });

  it('lee números decimales', () => {
    const tokens = tokenizar('0.5');
    expect(tokens[0].numero).toBe(0.5);
  });

  it('lee notación científica', () => {
    expect(tokenizar('1e-3')[0].numero).toBe(0.001);
    expect(tokenizar('2E5')[0].numero).toBe(200000);
  });

  it('NO parte "sin" en letras sueltas', () => {
    // Este era el bug de la versión anterior: un replace() global
    // partía "sin" y la función trigonométrica quedaba rota.
    const tokens = tokenizar('sin(x)');
    expect(tokens[0].tipo).toBe('funcion');
    expect(tokens[0].texto).toBe('sin');
  });

  it('rechaza funciones desconocidas con mensaje claro', () => {
    expect(() => tokenizar('foo(x)')).toThrowError(/No conozco la función/);
  });

  it('rechaza caracteres inválidos sin ejecutar nada', () => {
    expect(() => tokenizar('x + $')).toThrowError(ErrorExpresion);
    expect(() => tokenizar('x; alert(1)')).toThrowError(/no es válido/);
  });

  it('acepta el signo menos tipográfico como operador', () => {
    // El enunciado usa "−" (Unicode) en varios textos de ejemplo.
    const tokens = tokenizar('x − 2');
    expect(tokens[1].tipo).toBe('menos');
  });
});

describe('precedencia de operadores', () => {
  const casiIgual = (a: number, b: number, precision = 10) =>
    expect(a).toBeCloseTo(b, precision);

  it('la potencia gana sobre el producto', () => {
    casiIgual(parsearFuncion('2x^2')(3), 2 * 3 ** 2);
  });

  it('el signo unario se aplica DESPUÉS de la potencia: -2^2 = -4', () => {
    // Es la convención de todas las calculadoras. Si el parser invirtiera
    // los niveles, daría +4 y el alumno aprendería la regla al revés.
    casiIgual(parsearFuncion('-2^2')(0), -4);
  });

  it('el producto gana sobre la suma', () => {
    casiIgual(parsearFuncion('2 + 3x')(2), 8);
  });

  it('la potencia asocia a la derecha: 2^3^2 = 2^9', () => {
    casiIgual(parsearFuncion('2^3^2')(0), 512);
  });

  it('acepta exponente negativo: 2^-3', () => {
    casiIgual(parsearFuncion('2^-3')(0), 0.125);
  });

  it('la resta es asociativa a la izquierda: 10-3-2 = 5', () => {
    casiIgual(parsearFuncion('10 - 3 - 2')(0), 5);
  });
});

describe('multiplicación implícita', () => {
  const casiIgual = (a: number, b: number, precision = 10) =>
    expect(a).toBeCloseTo(b, precision);

  it('acepta 2x sin asterisco', () => {
    casiIgual(parsearFuncion('2x')(3), 6);
  });

  it('acepta 2x cuando la x tiene exponente', () => {
    casiIgual(parsearFuncion('2x^2')(3), 18);
  });

  it('acepta 3sin(x)', () => {
    casiIgual(parsearFuncion('3sin(x)')(0), 0);
    casiIgual(parsearFuncion('3sin(x)')(Math.PI / 2), 3);
  });

  it('acepta 7x dentro de un polinomio: x^3 - 7x + 4', () => {
    // Expresión real del proyecto (data.ejemplos.ts, biseccionE1).
    casiIgual(parsearFuncion('x^3 - 7x + 4')(-2.5), 5.875);
  });

  it('acepta coeficiente pegado: 3x, 10x, 4x', () => {
    casiIgual(parsearFuncion('cos(x) - 3x')(0), 1);
  });

  it('acepta número por paréntesis: 4(x+2)', () => {
    casiIgual(parsearFuncion('4(x + 2)')(1), 12);
  });

  it('acepta paréntesis por paréntesis: (x+1)(x-2)', () => {
    casiIgual(parsearFuncion('(x + 1)(x - 2)')(3), 4);
  });

  it('acepta 9x^10 (exponente de dos cifras)', () => {
    casiIgual(parsearFuncion('9x^10 - 2')(1), 7);
  });
});

describe('funciones y constantes', () => {
  const casiIgual = (a: number, b: number, precision = 10) =>
    expect(a).toBeCloseTo(b, precision);

  it('evalúa sin, cos y tan', () => {
    casiIgual(parsearFuncion('sin(x)')(Math.PI / 2), 1);
    casiIgual(parsearFuncion('cos(x)')(0), 1);
    casiIgual(parsearFuncion('tan(x)')(0), 0);
  });

  it('evalúa exp, ln y sqrt', () => {
    casiIgual(parsearFuncion('exp(x)')(1), Math.E);
    casiIgual(parsearFuncion('ln(x)')(Math.E), 1);
    casiIgual(parsearFuncion('sqrt(x)')(9), 3);
  });

  it('log es log base 10, ln es natural', () => {
    casiIgual(parsearFuncion('log(x)')(100), 2);
    casiIgual(parsearFuncion('ln(x)')(1), 0);
  });

  it('reconoce pi y e', () => {
    casiIgual(parsearFuncion('pi')(0), Math.PI);
    casiIgual(parsearFuncion('e')(0), Math.E);
  });

  it('acepta raíz cúbica como ^(1/3)', () => {
    // Expresión real del proyecto (registro.ts, puntoFijo):
    // g(x) = (x + 2)^(1/3) debe devolver la raíz en su punto fijo.
    const g = parsearFuncion('(x + 2)^(1/3)');
    casiIgual(g(1.5213797), 1.5213797, 5);
  });

  it('acepta sqrt con expresión adentro: sqrt(3x + 1)', () => {
    // Expresión real del proyecto (data.ejemplos.ts, g(x) = √(3x + 1)).
    casiIgual(parsearFuncion('sqrt(3x + 1)')(2), Math.sqrt(7));
  });

  it('acepta alias en español: sen, tg, raiz', () => {
    casiIgual(parsearFuncion('sen(x)')(Math.PI / 2), 1);
    casiIgual(parsearFuncion('tg(x)')(0), 0);
    casiIgual(parsearFuncion('raiz(9)')(0), 3);
  });

  it('acepta nombre de función en mayúsculas: SIN(x)', () => {
    casiIgual(parsearFuncion('SIN(x)')(Math.PI / 2), 1);
  });
});

describe('expresiones reales del proyecto', () => {
  const casiIgual = (a: number, b: number, precision = 8) =>
    expect(a).toBeCloseTo(b, precision);

  // Estas son las expresiones que hoy vive en data.ejemplos.ts y
  // data.casuisticas.ts. Si el evaluador no las acepta, la página de
  // ejemplos se rompe.
  const EXPRESIONES_REALES: { expr: string; x: number; esperado: number }[] = [
    { expr: 'x^3 - x - 2', x: 2, esperado: 4 },
    { expr: 'x^3 - 7x + 4', x: -2.5, esperado: 5.875 },
    { expr: 'x - e^(1/x)', x: 1, esperado: 1 - Math.E },
    { expr: 'cos(x) - 3x', x: Math.PI / 8, esperado: Math.cos(Math.PI / 8) - 3 * Math.PI / 8 },
    { expr: 'x^3 + 2x^2 + 10x - 20', x: 1, esperado: 1 + 2 + 10 - 20 },
    { expr: 'cos(x) - x', x: 0.5, esperado: Math.cos(0.5) - 0.5 },
    { expr: 'sqrt(3x + 1)', x: 3, esperado: Math.sqrt(10) },
    { expr: '(9x^10 + 1)/(9x^10 - 2)', x: 1.2, esperado: (9 * 1.2 ** 10 + 1) / (9 * 1.2 ** 10 - 2) },
    { expr: 'e^x + 4x^3 - 5', x: 0.5, esperado: Math.E ** 0.5 + 4 * 0.125 - 5 },
    { expr: 'x^10 - 1', x: 1, esperado: 0 },
  ];

  for (const { expr, x, esperado } of EXPRESIONES_REALES) {
    it(`evalúa "${expr}" en x = ${x}`, () => {
      casiIgual(parsearFuncion(expr)(x), esperado);
    });
  }
});

describe('errores con mensaje en español', () => {
  it('avisa si falta un paréntesis', () => {
    expect(() => parsearFuncion('(x + 1')).toThrowError(/Falta cerrar/);
  });

  it('avisa si sobra un paréntesis', () => {
    expect(() => parsearFuncion('x + 1)')).toThrowError(/balanceados|Sobró/);
  });

  it('avisa si falta el paréntesis de una función', () => {
    expect(() => parsearFuncion('sin x')).toThrowError(/necesita paréntesis/);
  });

  it('avisa si la expresión está vacía', () => {
    expect(() => parsearFuncion('   ')).toThrowError(/Escribí la función/);
  });

  it('avisa si la expresión está incompleta', () => {
    expect(() => parsearFuncion('x +')).toThrowError(/incompleta/);
  });

  it('devuelve NaN (no explota) fuera del dominio de sqrt', () => {
    // Importante para el gráfico: la curva tiene que poder "cortarse"
    // donde la función no existe, en vez de romper el dibujado.
    expect(parsearFuncion('sqrt(x)')(-4)).toBeNaN();
  });

  it('devuelve NaN (no explota) fuera del dominio de ln', () => {
    expect(parsearFuncion('ln(x)')(-1)).toBeNaN();
  });
});

describe('FuncionEvaluable', () => {
  it('reutiliza la misma función muchas veces sin recompilar', () => {
    const f = FuncionEvaluable.compilar('x^2 - 2');
    // Bisección llama f() cientos de veces: tiene que ser estable.
    expect(f.evaluar(1)).toBeCloseTo(-1, 10);
    expect(f.evaluar(2)).toBeCloseTo(2, 10);
    expect(f.evaluar(3)).toBeCloseTo(7, 10);
  });

  it('calcula la derivada numérica de forma coherente', () => {
    // f(x) = x^3 - x - 2  →  f'(x) = 3x^2 - 1
    const f = FuncionEvaluable.compilar('x^3 - x - 2');
    expect(f.derivadaNumerica(2)).toBeCloseTo(3 * 4 - 1, 5);
    expect(f.derivadaNumerica(0)).toBeCloseTo(-1, 5);
  });

  it('la derivada numérica de x^2 en x=3 da 6', () => {
    const f = FuncionEvaluable.compilar('x^2');
    expect(f.derivadaNumerica(3)).toBeCloseTo(6, 5);
  });
});

describe('el texto se convierte en un árbol, no en código', () => {
  it('tokenizar produce objetos inspeccionables, no código compilado', () => {
    // Esta es la diferencia clave contra eval(): el texto del alumno
    // queda como una lista de datos (tokens) que se puede mostrar,
    // depurar y recorrer, nunca como código ejecutable.
    const tokens = tokenizar('x^2 + 1');
    expect(tokens.length).toBe(6);
    expect(tokens[0]).toEqual({ tipo: 'variable', texto: 'x' });
    expect(tokens[1]).toEqual({ tipo: 'potencia', texto: '^' });
  });

  it('el árbol se puede recorrer con calcular sin tocar eval', () => {
    // construir el árbol a mano y calcularlo: el árbol es un dato
    // que cualquier componente puede leer (el gráfico lo usa para
    // decidir dónde dibujar, por ejemplo).
    const arbol: Nodo = {
      tipo: 'binario',
      operador: '+',
      izquierda: { tipo: 'variable' },
      derecha: { tipo: 'numero', valor: 1 },
    };
    expect(calcular(arbol, 4)).toBe(5);
  });
});
