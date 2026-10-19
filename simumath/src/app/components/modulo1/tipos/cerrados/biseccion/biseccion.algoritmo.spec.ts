import { biseccion } from './biseccion.algoritmo';

/**
 * Tests del algoritmo de Bisección.
 *
 * Es una función pura (sin Angular), así que se puede probar directo.
 * La regla de los tests: si un número del enunciado del curso no coincide
 * con lo que sale acá, hay un error. Son los mismos números que el alumno
 * ve en la pestaña de Teoría.
 */
describe('biseccion', () => {
  /** Raíz verdadera de x³ − x − 2, para comparar. */
  const RAIZ_CUBICA = 1.5213797068045676;

  it('encuentra la raíz de x^3 - x - 2 en [1, 2]', () => {
    // Este es el caso que pide el enunciado: ≈ 1.5214
    const r = biseccion({
      f: (x) => x ** 3 - x - 2,
      a: 1,
      b: 2,
      tol: 1e-5,
    });

    expect(r.convergio).toBe(true);
    expect(r.raiz).toBeCloseTo(RAIZ_CUBICA, 4);
    expect(r.raiz).toBeCloseTo(1.5214, 4);
  });

  it('la raíz cumple f(raíz) ≈ 0', () => {
    const f = (x: number) => x ** 3 - x - 2;
    const r = biseccion({ f, a: 1, b: 2, tol: 1e-10 });
    expect(f(r.raiz!)).toBeCloseTo(0, 9);
  });

  it('el intervalo se reduce a la mitad en cada paso', () => {
    // Es la definición del método: biseca, no acota por residuo.
    const r = biseccion({ f: (x) => x ** 3 - x - 2, a: 1, b: 2, tol: 1e-5 });

    expect(r.filas[0].error).toBeCloseTo(0.5, 10); // (2-1)/2
    expect(r.filas[1].error).toBeCloseTo(0.25, 10);
    expect(r.filas[2].error).toBeCloseTo(0.125, 10);
    expect(r.filas[3].error).toBeCloseTo(0.0625, 10);
  });

  it('el error final es menor que la tolerancia pedida', () => {
    const tol = 1e-5;
    const r = biseccion({ f: (x) => x ** 3 - x - 2, a: 1, b: 2, tol });
    expect(r.error).toBeLessThan(tol);
  });

  it('la primera iteración usa el punto medio del intervalo inicial', () => {
    const r = biseccion({ f: (x) => x ** 3 - x - 2, a: 1, b: 2, tol: 1e-5 });
    expect(r.filas[0].c).toBeCloseTo(1.5, 10);
    expect(r.filas[0].n).toBe(1);
  });

  it('encuentra la raíz de x - cos(x) en [0, 1]', () => {
    const r = biseccion({ f: (x) => x - Math.cos(x), a: 0, b: 1, tol: 1e-6 });
    expect(r.convergio).toBe(true);
    expect(r.raiz).toBeCloseTo(0.7390851332151607, 5);
  });

  it('encuentra la raíz de x^2 - 3 en [1, 2]', () => {
    const r = biseccion({ f: (x) => x ** 2 - 3, a: 1, b: 2, tol: 1e-6 });
    expect(r.raiz).toBeCloseTo(Math.sqrt(3), 6);
  });

  it('encuentra la raíz de e^(-x) - x en [0, 1]', () => {
    // La "ecuación del dinero" de Euler: e^(-x) = x tiene raíz ≈ 0.5671.
    const r = biseccion({ f: (x) => Math.exp(-x) - x, a: 0, b: 1, tol: 1e-6 });
    expect(r.raiz).toBeCloseTo(0.5671432904097838, 5);
  });

  it('funciona con raíces negativas', () => {
    // x^3 - 7x + 4 tiene una raíz negativa entre -3 y -2.
    // La tolerancia manda sobre la respuesta: con tol = 1e-10 se puede
    // pedir 8 decimales, porque bisección reduce el error a la mitad
    // en cada paso. Pedir más decimales que la tolerancia es un error
    // del test, no del algoritmo.
    const r = biseccion({ f: (x) => x ** 3 - 7 * x + 4, a: -3, b: -2, tol: 1e-10 });
    expect(r.convergio).toBe(true);
    expect(r.raiz).toBeLessThan(0);
    // f(-3) = -2 y f(-2) = 10: hay cambio de signo, la raíz está en el medio.
    expect(r.raiz).toBeCloseTo(-2.8951065159, 8);
  });

  it('con una tolerancia floja, el error final respeta esa tolerancia', () => {
    // El contrato del método: nunca devuelve más precisión de la pedida.
    const r = biseccion({ f: (x) => x ** 3 - 7 * x + 4, a: -3, b: -2, tol: 1e-6 });
    expect(r.error).toBeLessThanOrEqual(1e-6);
    // Por eso acá no se puede comparar con 8 decimales.
    expect(Math.abs(r.raiz! - -2.8951065159)).toBeLessThan(1e-6);
  });

  it('ordena los extremos si el alumno los dio al revés', () => {
    const r = biseccion({ f: (x) => x ** 3 - x - 2, a: 2, b: 1, tol: 1e-5 });
    expect(r.convergio).toBe(true);
    expect(r.raiz).toBeCloseTo(RAIZ_CUBICA, 4);
  });

  it('avisa si no hay cambio de signo en el intervalo', () => {
    // f(x) = x² + 1 nunca es negativa: no hay raíz real y el método
    // no puede inventar una.
    const r = biseccion({ f: (x) => x ** 2 + 1, a: -2, b: 2, tol: 1e-5 });
    expect(r.convergio).toBe(false);
    expect(r.mensaje).toContain('mismo signo');
    expect(r.filas.length).toBe(0);
  });

  it('avisa si a = b, porque el intervalo no tiene ancho', () => {
    const r = biseccion({ f: (x) => x ** 3 - x - 2, a: 1, b: 1, tol: 1e-5 });
    expect(r.convergio).toBe(false);
    expect(r.mensaje).toContain('a = b');
  });

  it('avisa si la función no se puede evaluar en los extremos', () => {
    // sqrt(x) no existe para x < 0.
    const r = biseccion({ f: (x) => Math.sqrt(x), a: -4, b: 4, tol: 1e-5 });
    expect(r.convergio).toBe(false);
    expect(r.mensaje).toContain('no se pudo evaluar');
  });

  it('se detiene en el máximo de iteraciones si la tolerancia es imposible', () => {
    // Tolerancia absurda para un método que solo reduce a la mitad.
    const r = biseccion({ f: (x) => x ** 3 - x - 2, a: 1, b: 2, tol: 1e-30, maxIter: 10 });
    expect(r.convergio).toBe(false);
    expect(r.iteraciones).toBe(10);
    expect(r.mensaje).toContain('No se alcanzó');
  });

  it('el número de iteraciones no depende de cuánto se escale f', () => {
    // Esta es la propiedad que justifica usar la cota de Bolzano en vez
    // de |f(c)|: si el alumno escribe la misma ecuación por 1000, el
    // método tiene que hacer exactamente lo mismo.
    const f1 = (x: number) => x ** 3 - x - 2;
    const f2 = (x: number) => 1000 * (x ** 3 - x - 2);
    const r1 = biseccion({ f: f1, a: 1, b: 2, tol: 1e-6 });
    const r2 = biseccion({ f: f2, a: 1, b: 2, tol: 1e-6 });

    expect(r1.iteraciones).toBe(r2.iteraciones);
    expect(r2.raiz).toBeCloseTo(r1.raiz!, 10);
  });

  it('más tolerancia da menos iteraciones', () => {
    const f = (x: number) => x ** 3 - x - 2;
    const fina = biseccion({ f, a: 1, b: 2, tol: 1e-8 });
    const floja = biseccion({ f, a: 1, b: 2, tol: 1e-2 });
    expect(floja.iteraciones).toBeLessThan(fina.iteraciones);
  });

  it('las filas van numeradas desde 1 y en orden', () => {
    const r = biseccion({ f: (x) => x ** 3 - x - 2, a: 1, b: 2, tol: 1e-5 });
    r.filas.forEach((fila, i) => {
      expect(fila.n).toBe(i + 1);
    });
  });

  it('el intervalo de cada fila contiene siempre a la anterior por un lado', () => {
    const r = biseccion({ f: (x) => x ** 3 - x - 2, a: 1, b: 2, tol: 1e-5 });
    for (let i = 1; i < r.filas.length; i++) {
      const anterior = r.filas[i - 1];
      const actual = r.filas[i];
      // Un extremo se mantiene y el otro se reemplaza por el punto medio.
      expect(actual.a === anterior.a || actual.b === anterior.b).toBe(true);
      // El ancho se reduce a la mitad.
      expect(actual.error).toBeCloseTo(anterior.error / 2, 12);
    }
  });
});
