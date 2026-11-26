import { trapecioCompuesto } from './trapecio.algoritmo';

/**
 * Tests de la regla del trapecio compuesta.
 *
 * Verifican las propiedades que definen el método: exactitud en rectas,
 * coeficientes 1-2-…-2-1, orden 2 del error (al duplicar n el error
 * baja a la cuarta parte) y validaciones con mensaje claro.
 */
describe('trapecioCompuesto', () => {
  it('integra x² en [0, 1] con n = 4', () => {
    const r = trapecioCompuesto({ f: (x) => x * x, a: 0, b: 1, n: 4 });

    expect(r.mensaje).toBeUndefined();
    expect(r.h).toBeCloseTo(0.25, 12);
    expect(r.integral).toBeCloseTo(0.34375, 12);
  });

  it('usa coeficientes 1, 2, 2, …, 1 y la fila Σ', () => {
    const r = trapecioCompuesto({ f: (x) => x * x, a: 0, b: 1, n: 4 });
    const coeficientes = r.filas.slice(0, -1).map((f) => f.coef);

    expect(coeficientes).toEqual([1, 2, 2, 2, 1]);
    expect(r.filas[5].aporte).toBeCloseTo(2.75, 12);
    expect(r.filas[5].i).toBe('Σ');
  });

  it('es exacta para una función lineal', () => {
    const r = trapecioCompuesto({ f: (x) => 3 * x + 1, a: 0, b: 2, n: 3 });

    // ∫₀² (3x + 1) dx = 3·4/2 + 2 = 8
    expect(r.integral).toBeCloseTo(8, 12);
  });

  it('el error baja a la cuarta parte al duplicar n (orden h²)', () => {
    const f = (x: number) => Math.exp(x);
    const exacto = Math.E - 1;

    const n4 = trapecioCompuesto({ f, a: 0, b: 1, n: 4, valorExacto: exacto });
    const n8 = trapecioCompuesto({ f, a: 0, b: 1, n: 8, valorExacto: exacto });

    expect(n4.errorAbs! / n8.errorAbs!).toBeCloseTo(4, 1);
    expect(n4.errorRel).toBeCloseTo((n4.errorAbs! / exacto) * 100, 10);
  });

  it('calcula el error contra el valor exacto cuando se lo pasa', () => {
    const r = trapecioCompuesto({
      f: (x) => x * x,
      a: 0,
      b: 1,
      n: 4,
      valorExacto: 1 / 3,
    });

    expect(r.integral).toBeCloseTo(0.34375, 12);
    expect(r.errorAbs).toBeCloseTo(0.0104166667, 9);
    expect(r.errorRel).toBeCloseTo(3.125, 9);
  });

  it('rechaza b ≤ a', () => {
    const r = trapecioCompuesto({ f: (x) => x, a: 2, b: 2, n: 4 });
    expect(r.filas).toEqual([]);
    expect(r.mensaje).toContain('b tiene que ser mayor');
  });

  it('rechaza n no entero', () => {
    const r = trapecioCompuesto({ f: (x) => x, a: 0, b: 1, n: 2.5 });
    expect(r.mensaje).toContain('entero');
  });

  it('avisa si la función no existe en algún nodo', () => {
    const r = trapecioCompuesto({ f: (x) => Math.log(x), a: 0, b: 1, n: 4 });
    expect(r.filas).toEqual([]);
    expect(r.mensaje).toContain('no se puede evaluar');
  });
});
