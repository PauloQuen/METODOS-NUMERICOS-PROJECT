import { eulerExplicito } from './euler.algoritmo';

/**
 * Red de seguridad del algoritmo de Euler explícito.
 *
 * Comprueba el valor de control y las propiedades que definen el método:
 * orden 1, inestabilidad con h grande, validación de entradas y el ajuste
 * del último paso cuando h no divide exactamente el intervalo.
 */
describe('eulerExplicito', () => {
  const exacta = (t: number) => Math.exp(t);
  const crecimiento = (_t: number, y: number) => y;

  it('resuelve y′ = y con h = 0.1 hasta t = 1 (valor de control)', () => {
    const r = eulerExplicito({
      f: crecimiento,
      t0: 0,
      y0: 1,
      h: 0.1,
      tFin: 1,
      exacta,
    });

    // 1.1^10 = 2.5937424601
    expect(r.mensaje).toBeUndefined();
    expect(r.pasos).toBe(10);
    expect(r.yFinal).toBeCloseTo(2.5937424601, 9);
    expect(r.exactaFinal).toBeCloseTo(Math.E, 12);
    expect(r.errorFinal).toBeCloseTo(0.124539368359045, 9);
    expect(r.errorRel!).toBeCloseTo((0.124539368359045 / Math.E) * 100, 8);
  });

  it('usa la pendiente del punto actual y deja la última fila sin k₁', () => {
    const r = eulerExplicito({
      f: (t, y) => t + y,
      t0: 0,
      y0: 1,
      h: 0.1,
      tFin: 0.2,
    });

    expect(r.filas[0].n).toBe(0);
    expect(Number(r.filas[0].k1)).toBeCloseTo(1, 12); // f(0, 1)
    expect(Number(r.filas[1].y)).toBeCloseTo(1.1, 12);
    expect(Number(r.filas[1].k1)).toBeCloseTo(1.2, 12); // f(0.1, 1.1)
    expect(r.filas.at(-1)!.k1).toBe('');
  });

  it('baja el error a la mitad al dividir h por 2 (orden 1)', () => {
    const grueso = eulerExplicito({ f: crecimiento, t0: 0, y0: 1, h: 0.1, tFin: 1, exacta });
    const fino = eulerExplicito({ f: crecimiento, t0: 0, y0: 1, h: 0.05, tFin: 1, exacta });

    // La razón exacta es 1.9165: se acerca a 2 desde abajo.
    const razon = grueso.errorFinal! / fino.errorFinal!;
    expect(razon).toBeGreaterThan(1.8);
    expect(razon).toBeLessThan(2);
  });

  it('es exacto cuando la solución es constante', () => {
    const r = eulerExplicito({
      f: () => 0,
      t0: 0,
      y0: 3,
      h: 0.25,
      tFin: 2,
      exacta: () => 3,
    });

    expect(r.yFinal).toBe(3);
    expect(r.errorFinal).toBe(0);
  });

  it('diverge con y′ = −50y y h = 0.05 (fuera de |1 + hλ| ≤ 1)', () => {
    const r = eulerExplicito({ f: (_t, y) => -50 * y, t0: 0, y0: 1, h: 0.05, tFin: 1 });

    expect(Math.abs(r.yFinal)).toBeGreaterThan(100);
  });

  it('acorta el último paso cuando h no divide el intervalo', () => {
    const r = eulerExplicito({ f: crecimiento, t0: 0, y0: 1, h: 0.3, tFin: 1 });

    expect(r.pasos).toBe(4);
    expect(r.filas.length).toBe(5);
    expect(Number(r.filas.at(-1)!.t)).toBeCloseTo(1, 12);
  });

  it('rechaza h ≤ 0 y t final ≤ t inicial con mensaje en español', () => {
    const paso = eulerExplicito({ f: crecimiento, t0: 0, y0: 1, h: 0, tFin: 1 });
    const tiempo = eulerExplicito({ f: crecimiento, t0: 1, y0: 1, h: 0.1, tFin: 1 });

    expect(paso.filas).toEqual([]);
    expect(paso.mensaje).toContain('mayor que 0');
    expect(tiempo.mensaje).toContain('mayor que t₀');
  });

  it('rechaza entradas no finitas', () => {
    const r = eulerExplicito({
      f: crecimiento,
      t0: 0,
      y0: Number.NaN,
      h: 0.1,
      tFin: 1,
    });

    expect(r.mensaje).toContain('números');
  });

  it('avisa cuando la solución se vuelve infinita', () => {
    const r = eulerExplicito({
      f: (_t, y) => y * y,
      t0: 0,
      y0: 100,
      h: 1,
      tFin: 10,
    });

    expect(r.mensaje).toContain('diverge');
    expect(r.filas).toEqual([]);
  });

  it('avisa si hacen falta más pasos del límite permitido', () => {
    const r = eulerExplicito({ f: crecimiento, t0: 0, y0: 1, h: 1e-6, tFin: 1 });

    expect(r.mensaje).toContain('100000');
    expect(r.filas).toEqual([]);
  });

  it('no inventa un error si la solución exacta devuelve NaN', () => {
    const r = eulerExplicito({
      f: crecimiento,
      t0: 0,
      y0: 1,
      h: 0.1,
      tFin: 0.1,
      exacta: () => Number.NaN,
    });

    expect(r.errorFinal).toBeUndefined();
    expect(r.errorRel).toBeUndefined();
  });
});
