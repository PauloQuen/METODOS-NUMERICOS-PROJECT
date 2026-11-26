import { rungeKutta4 } from './rk4.algoritmo';

/**
 * Red de seguridad de RK4: valor de control, pesos 1-2-2-1, orden 4,
 * estabilidad, validación y ajuste del último paso.
 */
describe('rungeKutta4', () => {
  const exacta = (t: number) => Math.exp(t);
  const crecimiento = (_t: number, y: number) => y;

  it('resuelve y′ = y con h = 0.1 hasta t = 1 (valor de control)', () => {
    const r = rungeKutta4({ f: crecimiento, t0: 0, y0: 1, h: 0.1, tFin: 1, exacta });

    expect(r.mensaje).toBeUndefined();
    expect(r.pasos).toBe(10);
    expect(r.yFinal).toBeCloseTo(2.718279744135166, 10);
    expect(r.errorFinal).toBeCloseTo(0.0000020843238792700447, 12);
    expect(r.errorRel!).toBeLessThan(0.0001);
  });

  it('usa k₁..k₄ con pesos 1-2-2-1 y deja la última fila sin pendientes', () => {
    const r = rungeKutta4({ f: (t, y) => t + y, t0: 0, y0: 1, h: 0.2, tFin: 1 });
    const fila = r.filas[0];

    // k₁ = 1, k₂ = f(0.1, 1.1), k₃ = f(0.1, 1.12), k₄ = f(0.2, 1.244)
    expect(Number(fila.k1)).toBeCloseTo(1, 12);
    expect(Number(fila.k2)).toBeCloseTo(1.2, 12);
    expect(Number(fila.k3)).toBeCloseTo(1.22, 12);
    expect(Number(fila.k4)).toBeCloseTo(1.444, 12);
    expect(Number(r.filas[1].y)).toBeCloseTo(1.2428, 12);
    expect(r.filas.at(-1)!.k4).toBe('');
  });

  it('baja el error a la dieciseisava parte al dividir h por 2 (orden 4)', () => {
    const grueso = rungeKutta4({ f: crecimiento, t0: 0, y0: 1, h: 0.1, tFin: 1, exacta });
    const fino = rungeKutta4({ f: crecimiento, t0: 0, y0: 1, h: 0.05, tFin: 1, exacta });

    // La razón exacta es 15.3482: se acerca a 16 desde abajo.
    const razon = grueso.errorFinal! / fino.errorFinal!;
    expect(razon).toBeGreaterThan(15);
    expect(razon).toBeLessThan(16);
  });

  it('respeta el límite de estabilidad |hλ| ≤ 2.78', () => {
    const estable = rungeKutta4({ f: (_t, y) => -50 * y, t0: 0, y0: 1, h: 0.05, tFin: 1 });
    const inestable = rungeKutta4({ f: (_t, y) => -50 * y, t0: 0, y0: 1, h: 0.1, tFin: 1 });

    expect(estable.yFinal).toBeCloseTo(0.0001727278847265976, 12);
    expect(Math.abs(inestable.yFinal)).toBeGreaterThan(1);
  });

  it('es exacto cuando la solución es constante', () => {
    const r = rungeKutta4({
      f: () => 0,
      t0: 0,
      y0: 3,
      h: 0.5,
      tFin: 2,
      exacta: () => 3,
    });

    expect(r.yFinal).toBe(3);
    expect(r.errorFinal).toBe(0);
  });

  it('acorta el último paso cuando h no divide el intervalo', () => {
    const r = rungeKutta4({ f: crecimiento, t0: 0, y0: 1, h: 0.3, tFin: 1 });

    expect(r.pasos).toBe(4);
    expect(r.filas.length).toBe(5);
    expect(Number(r.filas.at(-1)!.t)).toBeCloseTo(1, 12);
  });

  it('rechaza h ≤ 0 y t final ≤ t inicial con mensaje en español', () => {
    const paso = rungeKutta4({ f: crecimiento, t0: 0, y0: 1, h: 0, tFin: 1 });
    const tiempo = rungeKutta4({ f: crecimiento, t0: 1, y0: 1, h: 0.1, tFin: 1 });

    expect(paso.filas).toEqual([]);
    expect(paso.mensaje).toContain('mayor que 0');
    expect(tiempo.mensaje).toContain('mayor que t₀');
  });

  it('rechaza entradas no finitas', () => {
    const r = rungeKutta4({
      f: crecimiento,
      t0: 0,
      y0: Number.NaN,
      h: 0.1,
      tFin: 1,
    });

    expect(r.mensaje).toContain('números');
  });

  it('avisa cuando la solución se vuelve infinita', () => {
    const r = rungeKutta4({ f: (_t, y) => y * y, t0: 0, y0: 100, h: 1, tFin: 10 });

    expect(r.mensaje).toContain('diverge');
    expect(r.filas).toEqual([]);
  });

  it('avisa si hacen falta más pasos del límite permitido', () => {
    const r = rungeKutta4({ f: crecimiento, t0: 0, y0: 1, h: 1e-6, tFin: 1 });

    expect(r.mensaje).toContain('100000');
    expect(r.filas).toEqual([]);
  });

  it('no inventa un error si la solución exacta devuelve NaN', () => {
    const r = rungeKutta4({
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
