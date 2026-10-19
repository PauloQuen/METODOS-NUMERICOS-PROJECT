import { ejecutarSecante } from './secante.algoritmo';

/**
 * Tests del algoritmo de la secante.
 *
 * Es una función pura (sin Angular), así que se puede probar directo.
 * La regla de los tests: si un número del enunciado del curso no coincide
 * con lo que sale acá, hay un error. Son los mismos números que el alumno
 * ve en la pestaña de Teoría.
 *
 * ── Semántica de las filas ────────────────────────────────────────────
 * Cada fila es YA el punto nuevo: x = xₙ₊₁ (el corte de la cuerda con el
 * eje), f(x) = f(xₙ₊₁) y xPrev = xₙ (el punto de la cuerda más cercano,
 * el último calculado). |Δx| = |xₙ₊₁ − xₙ| es el movimiento que se acaba
 * de hacer. El error final es el |Δx| de la última fila.
 */
describe('ejecutarSecante', () => {
  /** Raíz verdadera de x³ − x − 2, para comparar. */
  const RAIZ_CUBICA = 1.5213797068045676;

  it('encuentra la raíz de x^3 - x - 2 desde las semillas 1.5 y 2', () => {
    // Este es el caso que pide el enunciado: ≈ 1.5214
    const r = ejecutarSecante({
      f: (x) => x ** 3 - x - 2,
      x0: 1.5,
      x1: 2,
      tol: 1e-5,
    });

    expect(r.convergio).toBe(true);
    expect(r.raiz).toBeCloseTo(RAIZ_CUBICA, 6);
    expect(r.raiz).toBeCloseTo(1.5214, 4);
  });

  it('la raíz cumple f(raíz) ≈ 0', () => {
    const f = (x: number) => x ** 3 - x - 2;
    const r = ejecutarSecante({ f, x0: 1.5, x1: 2, tol: 1e-10 });
    expect(Math.abs(f(r.raiz!))).toBeLessThan(1e-7);
  });

  it('la primera fila aplica la fórmula de la secante a las dos semillas', () => {
    // x₂ = x₁ − f(x₁)·(x₁ − x₀)/(f(x₁) − f(x₀))
    //    = 2 − 4·(2 − 1.5)/(4 − (−0.125)) = 2 − 2/4.125 = 1.51515151...
    const r = ejecutarSecante({
      f: (x) => x ** 3 - x - 2,
      x0: 1.5,
      x1: 2,
      tol: 1e-5,
    });

    expect(r.filas[0].n).toBe(1);
    // xPrev es el punto "actual" de la cuerda: la segunda semilla.
    expect(r.filas[0].xPrev).toBeCloseTo(2, 8);
    expect(r.filas[0].x).toBeCloseTo(1.51515151, 7);
    // fx es f del punto NUEVO: f(1.51515151) ≈ −0.03684225.
    expect(r.filas[0].fx).toBeCloseTo(-0.03684225, 7);
    // |Δx| = |1.51515151 − 2| ≈ 0.48484848.
    expect(r.filas[0].delta).toBeCloseTo(0.48484848, 7);
  });

  it('la segunda fila se apoya en el punto anterior', () => {
    const r = ejecutarSecante({
      f: (x) => x ** 3 - x - 2,
      x0: 1.5,
      x1: 2,
      tol: 1e-5,
    });

    // La cuerda siguiente une (2, 4) con (1.51515151, −0.03684225).
    expect(r.filas[1].xPrev).toBeCloseTo(1.51515151, 7);
    expect(r.filas[1].x).toBeCloseTo(1.51957649, 7);
  });

  it('el error final es el |Δx| de la última fila', () => {
    const r = ejecutarSecante({
      f: (x) => x ** 3 - x - 2,
      x0: 1.5,
      x1: 2,
      tol: 1e-5,
    });

    const ultima = r.filas[r.filas.length - 1];
    expect(r.error).toBe(ultima.delta);
  });

  it('el error final es menor o igual que la tolerancia pedida', () => {
    // El contrato del método: nunca devuelve más precisión de la pedida.
    const tol = 1e-5;
    const r = ejecutarSecante({
      f: (x) => x ** 3 - x - 2,
      x0: 1.5,
      x1: 2,
      tol,
    });
    expect(r.error!).toBeLessThanOrEqual(tol);
  });

  it('encuentra la raíz de x - cos(x) (la constante de Dottie)', () => {
    const r = ejecutarSecante({
      f: (x) => x - Math.cos(x),
      x0: 0,
      x1: 1,
      tol: 1e-6,
    });
    expect(r.convergio).toBe(true);
    expect(r.raiz).toBeCloseTo(0.7390851332151607, 6);
  });

  it('encuentra la raíz de e^(-x) - x (la ecuación de Euler)', () => {
    const r = ejecutarSecante({
      f: (x) => Math.exp(-x) - x,
      x0: 0,
      x1: 1,
      tol: 1e-6,
    });
    expect(r.convergio).toBe(true);
    expect(r.raiz).toBeCloseTo(0.5671432904097838, 6);
  });

  it('encuentra la raíz de x^2 - 3', () => {
    const r = ejecutarSecante({ f: (x) => x ** 2 - 3, x0: 1, x1: 2, tol: 1e-6 });
    expect(r.raiz).toBeCloseTo(Math.sqrt(3), 6);
  });

  it('funciona con raíces negativas', () => {
    // x^3 - 7x + 4 tiene una raíz negativa cerca de −2.9; las dos
    // semillas −3 y −2 la encierran y la cuerda entra al rango.
    const r = ejecutarSecante({
      f: (x) => x ** 3 - 7 * x + 4,
      x0: -3,
      x1: -2,
      tol: 1e-6,
    });
    expect(r.convergio).toBe(true);
    expect(r.raiz).toBeLessThan(0);
    expect(r.raiz).toBeCloseTo(-2.8951065159, 7);
  });

  it('las filas van numeradas desde 1 y en orden', () => {
    const r = ejecutarSecante({
      f: (x) => x ** 3 - x - 2,
      x0: 1.5,
      x1: 2,
      tol: 1e-5,
    });
    r.filas.forEach((fila, i) => {
      expect(fila.n).toBe(i + 1);
    });
  });

  it('más tolerancia da menos iteraciones', () => {
    const f = (x: number) => x ** 3 - x - 2;
    const fina = ejecutarSecante({ f, x0: 1.5, x1: 2, tol: 1e-8 });
    const floja = ejecutarSecante({ f, x0: 1.5, x1: 2, tol: 1e-2 });
    expect(floja.iteraciones).toBeLessThan(fina.iteraciones);
  });

  it('el número de iteraciones no depende de cuánto se escale f', () => {
    // La secante calcula f(xₙ)/(f(xₙ) − f(xₙ₋₁)): si la función se
    // multiplica por 1000, el numerador y el denominador también, y el
    // cociente —la iteración— no cambia.
    const f1 = (x: number) => x ** 3 - x - 2;
    const f2 = (x: number) => 1000 * (x ** 3 - x - 2);
    const r1 = ejecutarSecante({ f: f1, x0: 1.5, x1: 2, tol: 1e-6 });
    const r2 = ejecutarSecante({ f: f2, x0: 1.5, x1: 2, tol: 1e-6 });

    expect(r1.iteraciones).toBe(r2.iteraciones);
    expect(r2.raiz).toBeCloseTo(r1.raiz!, 8);
  });

  it('avisa si las dos evaluaciones coinciden (secante horizontal)', () => {
    // f(x) = x² con semillas −1 y 1: f(−1) = f(1) = 1, el denominador
    // es cero y la secante no puede cortar el eje.
    const r = ejecutarSecante({
      f: (x) => x * x,
      x0: -1,
      x1: 1,
      tol: 1e-5,
    });
    expect(r.convergio).toBe(false);
    expect(r.mensaje).toContain('horizontal');
    expect(r.filas.length).toBe(0);
  });

  it('se detiene en el máximo de iteraciones si la tolerancia es imposible', () => {
    const r = ejecutarSecante({
      f: (x) => x ** 3 - x - 2,
      x0: 1.5,
      x1: 2,
      tol: 1e-5,
      maxIter: 3,
    });
    expect(r.convergio).toBe(false);
    expect(r.iteraciones).toBe(3);
    expect(r.mensaje).toContain('No convergió dentro del máximo');
  });

  it('rechaza semillas que no son números', () => {
    const r = ejecutarSecante({
      f: (x) => x ** 3 - x - 2,
      x0: NaN,
      x1: 2,
      tol: 1e-5,
    });
    expect(r.convergio).toBe(false);
    expect(r.mensaje).toContain('finitos');
    expect(r.filas.length).toBe(0);
  });

  it('rechaza dos semillas iguales', () => {
    const r = ejecutarSecante({
      f: (x) => x ** 3 - x - 2,
      x0: 1.5,
      x1: 1.5,
      tol: 1e-5,
    });
    expect(r.convergio).toBe(false);
    expect(r.mensaje).toContain('distintos');
  });

  it('rechaza una tolerancia no positiva', () => {
    const r = ejecutarSecante({
      f: (x) => x ** 3 - x - 2,
      x0: 1.5,
      x1: 2,
      tol: 0,
    });
    expect(r.convergio).toBe(false);
    expect(r.mensaje).toContain('positiva');
  });
});
