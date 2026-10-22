import { gaussSeidel } from './matrices-especiales.algoritmo';

/**
 * Tests de Gauss-Seidel para matrices especiales.
 * Verifican convergencia, dominancia diagonal y el criterio de parada.
 */
describe('gaussSeidel', () => {
  it('converge al vector (1, 1, 1) en un sistema dominante', () => {
    const r = gaussSeidel({
      A: [
        [10, -1, 2],
        [1, 10, -1],
        [2, -1, 10],
      ],
      b: [11, 10, 11],
      tol: 1e-8,
      maxIter: 100,
    });

    expect(r.mensaje).toBeUndefined();
    expect(r.convergio).toBeTrue();
    expect(r.diagonalDominante).toBeTrue();
    expect(r.x![0]).toBeCloseTo(1, 6);
    expect(r.x![1]).toBeCloseTo(1, 6);
    expect(r.x![2]).toBeCloseTo(1, 6);
    expect(r.error!).toBeLessThan(1e-8);
  });

  it('converge al vector (2, 1, 3)', () => {
    const r = gaussSeidel({
      A: [
        [8, -1, 2],
        [1, 7, -1],
        [2, -1, 9],
      ],
      b: [21, 6, 30],
      tol: 1e-8,
      maxIter: 100,
    });

    expect(r.convergio).toBeTrue();
    expect(r.x![0]).toBeCloseTo(2, 6);
    expect(r.x![1]).toBeCloseTo(1, 6);
    expect(r.x![2]).toBeCloseTo(3, 6);
  });

  it('resuelve un sistema tridiagonal (matriz especial)', () => {
    const r = gaussSeidel({
      A: [
        [4, -1, 0],
        [-1, 4, -1],
        [0, -1, 4],
      ],
      b: [100, 0, 100],
      tol: 1e-6,
      maxIter: 200,
    });

    expect(r.convergio).toBeTrue();
    expect(r.x![0]).toBeCloseTo(200 / 7, 4);
    expect(r.x![1]).toBeCloseTo(100 / 7, 4);
    expect(r.x![2]).toBeCloseTo(200 / 7, 4);
  });

  it('cada fila de la tabla tiene k, las incógnitas y el error', () => {
    const r = gaussSeidel({
      A: [
        [10, -1, 2],
        [1, 10, -1],
        [2, -1, 10],
      ],
      b: [11, 10, 11],
      tol: 1e-8,
    });

    expect(r.filas.length).toBe(r.iteraciones);
    const primera = r.filas[0];
    expect(primera['k']).toBe(1);
    expect(Number.isFinite(primera['x1'])).toBeTrue();
    expect(Number.isFinite(primera['x2'])).toBeTrue();
    expect(Number.isFinite(primera['x3'])).toBeTrue();
    expect(Number.isFinite(primera['error'])).toBeTrue();
  });

  it('avisa cuando no converge dentro del máximo de iteraciones', () => {
    const r = gaussSeidel({
      A: [
        [1, 2],
        [3, 1],
      ],
      b: [1, 1],
      tol: 1e-12,
      maxIter: 1,
    });

    expect(r.convergio).toBeFalse();
    expect(r.mensaje).toContain('No se alcanzó');
  });

  it('rechaza una diagonal con ceros', () => {
    const r = gaussSeidel({
      A: [
        [0, 1],
        [1, 0],
      ],
      b: [1, 1],
    });

    expect(r.mensaje).toContain('diagonal');
    expect(r.filas).toEqual([]);
  });

  it('usa la aproximación inicial si se la pasan', () => {
    const r = gaussSeidel({
      A: [
        [10, -1, 2],
        [1, 10, -1],
        [2, -1, 10],
      ],
      b: [11, 10, 11],
      x0: [1, 1, 1],
      tol: 1e-10,
    });

    expect(r.convergio).toBeTrue();
    expect(r.iteraciones).toBe(1);
  });
});
