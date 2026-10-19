import { newtonRaphson } from './newton-raphson.algoritmo';

/**
 * Tests del algoritmo de Newton-Raphson.
 *
 * Es una función pura (sin Angular), así que se puede probar directo.
 * La regla de los tests: si un número del enunciado del curso no coincide
 * con lo que sale acá, hay un error. Son los mismos números que el alumno
 * ve en la pestaña de Teoría.
 *
 * ── Semántica de las filas ────────────────────────────────────────────
 * Cada fila es YA la nueva x: x = xₙ₊₁, f(x) = f(xₙ₊₁), pero f′(x) es
 * la derivada en el punto ANTERIOR (la pendiente de la tangente que se
 * dibujó), y |Δx| es el movimiento que se acabó de hacer. El error final
 * es el |Δx| de la última fila.
 */
describe('newtonRaphson', () => {
  /** Raíz verdadera de x³ − x − 2, para comparar. */
  const RAIZ_CUBICA = 1.5213797068045676;

  it('encuentra la raíz de x^3 - x - 2 desde la semilla 1.5', () => {
    // Este es el caso que pide el enunciado: ≈ 1.5214
    const r = newtonRaphson({
      f: (x) => x ** 3 - x - 2,
      x0: 1.5,
      tol: 1e-5,
    });

    expect(r.convergio).toBe(true);
    expect(r.raiz).toBeCloseTo(RAIZ_CUBICA, 6);
    expect(r.raiz).toBeCloseTo(1.5214, 4);
  });

  it('la raíz cumple f(raíz) ≈ 0', () => {
    const f = (x: number) => x ** 3 - x - 2;
    const r = newtonRaphson({ f, x0: 1.5, tol: 1e-10 });
    expect(Math.abs(f(r.raiz!))).toBeLessThan(1e-7);
  });

  it('la primera fila aplica la fórmula de Newton en la semilla', () => {
    // x₁ = x₀ − f(x₀)/f′(x₀) = 1.5 − (−0.125)/5.75 = 1.52173913...
    const r = newtonRaphson({
      f: (x) => x ** 3 - x - 2,
      x0: 1.5,
      tol: 1e-5,
    });

    expect(r.filas[0].n).toBe(1);
    expect(r.filas[0].x).toBeCloseTo(1.52173913, 7);
    // f′ de la fila es la pendiente en el punto anterior: f′(1.5) = 5.75.
    expect(r.filas[0].fpx).toBeCloseTo(5.75, 6);
    // Y fx es f del punto NUEVO: f(1.52173913) ≈ 0.00214.
    expect(r.filas[0].fx).toBeCloseTo(0.00213693, 7);
  });

  it('cada fila trae la derivada evaluada en el punto anterior', () => {
    // f′(1.52173913) = 3x² − 1 ≈ 5.94707: es la pendiente con la que
    // se dibujó la segunda tangente, no la derivada en el punto nuevo.
    const r = newtonRaphson({
      f: (x) => x ** 3 - x - 2,
      x0: 1.5,
      tol: 1e-5,
    });

    expect(r.filas[1].fpx).toBeCloseTo(5.94706994, 6);
  });

  it('el error final es el |Δx| de la última fila', () => {
    const r = newtonRaphson({
      f: (x) => x ** 3 - x - 2,
      x0: 1.5,
      tol: 1e-5,
    });

    const ultima = r.filas[r.filas.length - 1];
    expect(r.error).toBe(ultima.delta);
  });

  it('el error final es menor o igual que la tolerancia pedida', () => {
    // El contrato del método: nunca devuelve más precisión de la pedida.
    // (El motor usa <=: se detiene cuando |Δx| ≤ tol.)
    const tol = 1e-5;
    const r = newtonRaphson({ f: (x) => x ** 3 - x - 2, x0: 1.5, tol });
    expect(r.error!).toBeLessThanOrEqual(tol);
  });

  it('encuentra la raíz de x - cos(x) desde 0.5', () => {
    // La "constante de Dottie": el único punto donde x = cos(x).
    const r = newtonRaphson({
      f: (x) => x - Math.cos(x),
      x0: 0.5,
      tol: 1e-6,
    });
    expect(r.convergio).toBe(true);
    expect(r.raiz).toBeCloseTo(0.7390851332151607, 6);
  });

  it('encuentra la raíz de e^(-x) - x (la ecuación de Euler)', () => {
    // e^(−x) = x tiene raíz ≈ 0.5671: la misma de la bisección.
    const r = newtonRaphson({
      f: (x) => Math.exp(-x) - x,
      x0: 1,
      tol: 1e-6,
    });
    expect(r.convergio).toBe(true);
    expect(r.raiz).toBeCloseTo(0.5671432904097838, 6);
  });

  it('encuentra la raíz de x^2 - 3', () => {
    const r = newtonRaphson({ f: (x) => x ** 2 - 3, x0: 2, tol: 1e-6 });
    expect(r.raiz).toBeCloseTo(Math.sqrt(3), 6);
  });

  it('funciona con raíces negativas', () => {
    // x^3 - 7x + 4 tiene una raíz negativa cerca de −2.9. La semilla
    // −2.4 está DENTRO de la parábola y el primer paso se va afuera
    // del intervalo [−3, −2], pero el método igual converge.
    const r = newtonRaphson({
      f: (x) => x ** 3 - 7 * x + 4,
      x0: -2.4,
      tol: 1e-6,
    });
    expect(r.convergio).toBe(true);
    expect(r.raiz).toBeLessThan(0);
    expect(r.raiz).toBeCloseTo(-2.8951065159, 7);
  });

  it('las filas van numeradas desde 1 y en orden', () => {
    const r = newtonRaphson({ f: (x) => x ** 3 - x - 2, x0: 1.5, tol: 1e-5 });
    r.filas.forEach((fila, i) => {
      expect(fila.n).toBe(i + 1);
    });
  });

  it('más tolerancia da menos iteraciones', () => {
    const f = (x: number) => x ** 3 - x - 2;
    const fina = newtonRaphson({ f, x0: 1.5, tol: 1e-8 });
    const floja = newtonRaphson({ f, x0: 1.5, tol: 1e-2 });
    expect(floja.iteraciones).toBeLessThan(fina.iteraciones);
  });

  it('el número de iteraciones no depende de cuánto se escale f', () => {
    // Newton calcula f/f′: si la función se multiplica por 1000, la
    // derivada también, y el cociente —la iteración— no cambia.
    const f1 = (x: number) => x ** 3 - x - 2;
    const f2 = (x: number) => 1000 * (x ** 3 - x - 2);
    const r1 = newtonRaphson({ f: f1, x0: 1.5, tol: 1e-6 });
    const r2 = newtonRaphson({ f: f2, x0: 1.5, tol: 1e-6 });

    expect(r1.iteraciones).toBe(r2.iteraciones);
    expect(r2.raiz).toBeCloseTo(r1.raiz!, 8);
  });

  it('avisa si la derivada queda casi nula', () => {
    // f(x) = x² + 1 desde x₀ = 0: la derivada central da 0 y el método
    // no puede dar el paso (sería dividir por cero).
    const r = newtonRaphson({ f: (x) => x ** 2 + 1, x0: 0, tol: 1e-5 });
    expect(r.convergio).toBe(false);
    expect(r.mensaje).toContain('Derivada casi nula');
    expect(r.filas.length).toBe(0);
  });

  it('se detiene en el máximo de iteraciones si la tolerancia es imposible', () => {
    // Pedir 30 decimales en aritmética de doble precisión no se puede:
    // a partir de cierto punto la x deja de moverse y el criterio de
    // desplazamiento jamás se cumple.
    const r = newtonRaphson({
      f: (x) => x ** 2 - 2,
      x0: 1000,
      tol: 1e-30,
      maxIter: 30,
    });
    expect(r.convergio).toBe(false);
    expect(r.iteraciones).toBe(30);
    expect(r.mensaje).toContain('No convergió dentro del máximo');
  });

  it('rechaza una semilla que no es número', () => {
    const r = newtonRaphson({
      f: (x) => x ** 3 - x - 2,
      x0: NaN,
      tol: 1e-5,
    });
    expect(r.convergio).toBe(false);
    expect(r.mensaje).toContain('finito');
    expect(r.filas.length).toBe(0);
  });

  it('rechaza una tolerancia no positiva', () => {
    const r = newtonRaphson({
      f: (x) => x ** 3 - x - 2,
      x0: 1.5,
      tol: 0,
    });
    expect(r.convergio).toBe(false);
    expect(r.mensaje).toContain('positiva');
  });
});
