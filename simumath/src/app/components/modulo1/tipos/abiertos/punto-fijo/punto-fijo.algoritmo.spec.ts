import { ejecutarPuntoFijo } from './punto-fijo.algoritmo';

/**
 * Tests del algoritmo de Punto Fijo.
 *
 * ── Semántica de las filas ────────────────────────────────────────────
 * Cada fila guarda el punto NUEVO: x = xₙ₊₁ = g(xₙ). La fila 1 es
 * x₁ = g(x₀); g(x) es la evaluación sobre ese punto nuevo (lo que
 * vendría en la fila siguiente) y |Δx| es |xₙ₊₁ − xₙ|. El raiz del
 * resultado es la x de la última fila y el error es su |Δx|.
 */

describe('ejecutarPuntoFijo', () => {
  it('resuelve x³ − x − 2 = 0 con la reescritura (x + 2)^(1/3)', () => {
    const g = (x: number) => (x + 2) ** (1 / 3);
    const r = ejecutarPuntoFijo({ g, x0: 1.5, tol: 1e-6 });
    expect(r.convergio).toBe(true);
    expect(r.raiz!).toBeCloseTo(1.5213797068045676, 5);
  });

  it('la primera fila aplica g a la semilla: x₁ = g(x₀)', () => {
    const g = (x: number) => (x + 2) ** (1 / 3);
    const r = ejecutarPuntoFijo({ g, x0: 1.5, tol: 1e-8 });
    expect(r.filas[0].x).toBeCloseTo(g(1.5), 8);
    // La fila guarda el punto NUEVO, no la semilla.
    expect(r.filas[0].x).not.toBeCloseTo(1.5, 8);
  });

  it('cada fila siguiente es g de la anterior', () => {
    const g = (x: number) => Math.cos(x);
    const r = ejecutarPuntoFijo({ g, x0: 1, tol: 1e-8 });
    for (let i = 1; i < r.filas.length; i++) {
      expect(r.filas[i].x).toBeCloseTo(g(r.filas[i - 1].x), 6);
    }
  });

  it('el error final es el |Δx| de la última fila', () => {
    const g = (x: number) => Math.cos(x);
    const r = ejecutarPuntoFijo({ g, x0: 1, tol: 1e-8 });
    const ultima = r.filas[r.filas.length - 1];
    expect(r.error).toBe(ultima.delta);
  });

  it('la raíz devuelta es un punto fijo de g: g(raíz) ≈ raíz', () => {
    const g = (x: number) => (x + 2) ** (1 / 3);
    const r = ejecutarPuntoFijo({ g, x0: 1.5, tol: 1e-10 });
    expect(Math.abs(g(r.raiz!) - r.raiz!)).toBeLessThan(1e-6);
  });

  it('una tolerancia floja converge en menos pasos que una fina', () => {
    const g = (x: number) => (x + 2) ** (1 / 3);
    const floja = ejecutarPuntoFijo({ g, x0: 1.5, tol: 1e-2 });
    const fina = ejecutarPuntoFijo({ g, x0: 1.5, tol: 1e-8 });
    expect(fina.iteraciones).toBeGreaterThan(floja.iteraciones);
  });

  it('avisa si la semilla no es un número finito', () => {
    const r = ejecutarPuntoFijo({
      g: (x: number) => x + 1,
      x0: Number.NaN,
      tol: 1e-6,
    });
    expect(r.convergio).toBe(false);
    expect(r.filas.length).toBe(0);
    expect(r.mensaje).toContain('semilla');
  });

  it('avisa si la tolerancia no es positiva', () => {
    const r1 = ejecutarPuntoFijo({ g: (x: number) => x, x0: 1, tol: 0 });
    expect(r1.convergio).toBe(false);
    expect(r1.mensaje).toContain('tolerancia');

    const r2 = ejecutarPuntoFijo({ g: (x: number) => x, x0: 1, tol: -1 });
    expect(r2.convergio).toBe(false);
    expect(r2.mensaje).toContain('tolerancia');
  });

  it('avisa si g(x₀) no es evaluable', () => {
    const r = ejecutarPuntoFijo({
      g: (x: number) => (x < 0 ? Number.NaN : Math.sqrt(x)),
      x0: -2,
      tol: 1e-6,
    });
    expect(r.convergio).toBe(false);
    expect(r.filas.length).toBe(0);
    expect(r.mensaje).toContain('g(x₀)');
  });

  it('no converge con g(x) = x + 1 y respeta el tope de iteraciones', () => {
    // Cada iteración se aleja una unidad: el |Δx| nunca baja de 1.
    const maxIter = 20;
    const r = ejecutarPuntoFijo({
      g: (x: number) => x + 1,
      x0: 0,
      tol: 1e-6,
      maxIter,
    });
    expect(r.convergio).toBe(false);
    expect(r.iteraciones).toBe(maxIter);
    expect(r.filas.length).toBe(maxIter);
  });

  it('la secuencia xₙ₊₁ = 2xₙ desde x₀ = 1 diverge sin aviso', () => {
    const r = ejecutarPuntoFijo({ g: (x: number) => 2 * x, x0: 1, tol: 1e-6, maxIter: 30 });
    expect(r.convergio).toBe(false);
  });
});