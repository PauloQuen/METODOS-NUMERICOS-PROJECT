import { simpsonCompuesto } from './simpson.algoritmo';

/**
 * Tests de Simpson 1/3 compuesto.
 *
 * Verifican lo que define al método: coeficientes 1-4-2-4-1, exactitud
 * para polinomios hasta grado 3, orden 4 del error y rechazo de n impar.
 */
describe('simpsonCompuesto', () => {
  it('integra x² en [0, 1] de forma exacta con n = 2', () => {
    const r = simpsonCompuesto({ f: (x) => x * x, a: 0, b: 1, n: 2 });

    expect(r.mensaje).toBeUndefined();
    expect(r.h).toBeCloseTo(0.5, 12);
    expect(r.integral).toBeCloseTo(1 / 3, 12);
  });

  it('usa coeficientes 1, 4, 2, 4, 1 y la fila Σ', () => {
    const r = simpsonCompuesto({ f: (x) => x * x, a: 0, b: 1, n: 4 });
    const coeficientes = r.filas.slice(0, -1).map((f) => f.coef);

    expect(coeficientes).toEqual([1, 4, 2, 4, 1]);
    expect(r.filas[5].i).toBe('Σ');
  });

  it('es exacta para un polinomio de grado 3 (∫₀² x³ dx = 4)', () => {
    const r = simpsonCompuesto({ f: (x) => x * x * x, a: 0, b: 2, n: 2 });
    expect(r.integral).toBeCloseTo(4, 12);
  });

  it('el error baja a la dieciseisava parte al duplicar n (orden h⁴)', () => {
    const f = (x: number) => Math.exp(x);
    const exacto = Math.E - 1;

    const n4 = simpsonCompuesto({ f, a: 0, b: 1, n: 4, valorExacto: exacto });
    const n8 = simpsonCompuesto({ f, a: 0, b: 1, n: 8, valorExacto: exacto });

    expect(n4.errorAbs! / n8.errorAbs!).toBeGreaterThan(14);
    expect(n4.errorAbs! / n8.errorAbs!).toBeLessThan(18);
  });

  it('rechaza n impar con un mensaje que sugiere el par más cercano', () => {
    const r = simpsonCompuesto({ f: (x) => x * x, a: 0, b: 1, n: 5 });

    expect(r.filas).toEqual([]);
    expect(r.mensaje).toContain('PAR');
    expect(r.mensaje).toContain('4');
    expect(r.mensaje).toContain('6');
  });

  it('rechaza n menor que 2', () => {
    const r = simpsonCompuesto({ f: (x) => x, a: 0, b: 1, n: 0 });
    expect(r.mensaje).toContain('mayor o igual que 2');
  });

  it('avisa si la función no existe en algún nodo', () => {
    const r = simpsonCompuesto({ f: (x) => Math.sqrt(x - 1), a: 0, b: 2, n: 4 });
    expect(r.filas).toEqual([]);
    expect(r.mensaje).toContain('no se puede evaluar');
  });
});
