import { eliminacionGauss } from './eliminacion-gauss.algoritmo';

/**
 * Tests de Eliminación de Gauss.
 * Es una función pura: se prueba directo, sin Angular.
 */
describe('eliminacionGauss', () => {
  it('resuelve el sistema clásico 3×3 con solución (2, 3, −1)', () => {
    const r = eliminacionGauss({
      A: [
        [2, 1, -1],
        [-3, -1, 2],
        [-2, 1, 2],
      ],
      b: [8, -11, -3],
    });

    expect(r.mensaje).toBeUndefined();
    expect(r.x![0]).toBeCloseTo(2, 10);
    expect(r.x![1]).toBeCloseTo(3, 10);
    expect(r.x![2]).toBeCloseTo(-1, 10);
    expect(r.residual!).toBeLessThan(1e-10);
  });

  it('usa pivoteo parcial cuando el primer pivote es cero', () => {
    const r = eliminacionGauss({
      A: [
        [0, 2, 1],
        [1, 1, 1],
        [2, 1, 1],
      ],
      b: [4, 6, 5],
    });

    expect(r.mensaje).toBeUndefined();
    expect(r.pivoteos).toBeGreaterThan(0);
    expect(r.x![0]).toBeCloseTo(-1, 10);
    expect(r.x![1]).toBeCloseTo(-3, 10);
    expect(r.x![2]).toBeCloseTo(10, 10);
  });

  it('deja A triangular superior y b consistente', () => {
    const r = eliminacionGauss({
      A: [
        [2, 1, -1],
        [-3, -1, 2],
        [-2, 1, 2],
      ],
      b: [8, -11, -3],
    });

    for (let i = 1; i < r.A!.length; i++) {
      for (let j = 0; j < i; j++) {
        expect(Math.abs(r.A![i][j])).toBeLessThan(1e-12);
      }
    }
    expect(r.b!.length).toBe(3);
  });

  it('el residuo mide ‖Ax − b‖∞ y es prácticamente cero', () => {
    const r = eliminacionGauss({
      A: [
        [4, -2, 1],
        [-2, 4, -2],
        [1, -2, 4],
      ],
      b: [11, -16, 17],
    });

    expect(r.residual!).toBeLessThan(1e-10);
    expect(Number.isFinite(r.determinante!)).toBeTrue();
  });

  it('avisa cuando el sistema es singular', () => {
    const r = eliminacionGauss({
      A: [
        [1, 2],
        [2, 4],
      ],
      b: [3, 6],
    });

    expect(r.x).toBeUndefined();
    expect(r.mensaje).toContain('singular');
  });

  it('avisa si A no es cuadrada', () => {
    const r = eliminacionGauss({
      A: [
        [1, 2, 3],
        [4, 5, 6],
      ],
      b: [1, 2],
    });

    expect(r.mensaje).toContain('cuadrada');
  });
});
