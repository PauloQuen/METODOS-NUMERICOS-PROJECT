import { minimosCuadrados } from './minimos-cuadrados.algoritmo';

/**
 * Tests del algoritmo de mínimos cuadrados.
 *
 * Verifican las propiedades que definen el método: la recta pasa por el
 * centro de los datos, los residuos suman cero y, si los datos son
 * exactamente lineales, el ajuste es perfecto (r² = 1).
 */
describe('minimosCuadrados', () => {
  it('ajusta exactamente una recta perfecta (y = 1 + 2x)', () => {
    const r = minimosCuadrados({
      puntos: [
        { x: 1, y: 3 },
        { x: 2, y: 5 },
        { x: 3, y: 7 },
      ],
      evaluarEn: 4,
    });

    expect(r.mensaje).toBeUndefined();
    expect(r.a0).toBeCloseTo(1, 12);
    expect(r.a1).toBeCloseTo(2, 12);
    expect(r.r).toBeCloseTo(1, 12);
    expect(r.r2).toBeCloseTo(1, 12);
    expect(r.prediccion).toBeCloseTo(9, 12);
    expect(r.recta).toBe('y = 1 + 2·x');
  });

  it('los residuos de la recta suman cero', () => {
    const r = minimosCuadrados({
      puntos: [
        { x: 2, y: 1.4 },
        { x: 4, y: 2.9 },
        { x: 6, y: 4.3 },
        { x: 8, y: 5.8 },
        { x: 10, y: 7.2 },
      ],
    });

    const suma = r.filas
      .filter((f) => f.i !== 'Σ')
      .reduce((s, f) => s + Number(f.residuo), 0);
    expect(suma).toBeCloseTo(0, 12);
  });

  it('la recta pasa por el punto medio (x̄, ȳ)', () => {
    const r = minimosCuadrados({
      puntos: [
        { x: 2, y: 1.4 },
        { x: 4, y: 2.9 },
        { x: 6, y: 4.3 },
        { x: 8, y: 5.8 },
        { x: 10, y: 7.2 },
      ],
    });

    expect(r.a0 + r.a1 * r.mediaX).toBeCloseTo(r.mediaY, 12);
  });

  it('agrega la fila de sumatorias al final de la tabla', () => {
    const r = minimosCuadrados({
      puntos: [
        { x: 1, y: 2 },
        { x: 2, y: 4 },
        { x: 3, y: 6 },
      ],
    });

    expect(r.filas.length).toBe(4);
    const total = r.filas[r.filas.length - 1];
    expect(total.i).toBe('Σ');
    expect(total.xi).toBe(6);
    expect(total.yi).toBe(12);
    expect(total.x2).toBe(14);
    expect(total.xy).toBe(28);
  });

  it('el coeficiente r² queda entre 0 y 1', () => {
    const r = minimosCuadrados({
      puntos: [
        { x: 1, y: 1 },
        { x: 2, y: 4 },
        { x: 3, y: 2 },
        { x: 4, y: 6 },
      ],
    });

    expect(r.r2).toBeGreaterThanOrEqual(0);
    expect(r.r2).toBeLessThanOrEqual(1);
  });

  it('avisa si hay menos de dos puntos', () => {
    const r = minimosCuadrados({ puntos: [{ x: 1, y: 2 }] });
    expect(r.filas).toEqual([]);
    expect(r.mensaje).toContain('al menos 2 puntos');
  });

  it('avisa si todas las x son iguales (pendiente indefinida)', () => {
    const r = minimosCuadrados({
      puntos: [
        { x: 2, y: 1 },
        { x: 2, y: 3 },
        { x: 2, y: 5 },
      ],
    });

    expect(r.filas).toEqual([]);
    expect(r.mensaje).toContain('Todas las x son iguales');
  });
});
