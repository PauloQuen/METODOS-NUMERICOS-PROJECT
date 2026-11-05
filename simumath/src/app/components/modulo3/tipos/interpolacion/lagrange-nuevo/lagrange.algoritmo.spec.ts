import {
  coeficientesLagrange,
  formatearPolinomio,
  lagrange,
  polinomioLagrange,
} from './lagrange.algoritmo';

/**
 * Tests del algoritmo de Lagrange.
 *
 * Es una función pura (sin Angular), así que se prueba directamente.
 * Los números son los mismos que el alumno ve en la teoría y en los
 * ejemplos: si el motor cambia, estos tests avisan.
 */
describe('lagrange', () => {
  it('reproduce un polinomio de grado 2 exacto (x² + 1)', () => {
    const r = lagrange({
      puntos: [
        { x: 1, y: 2 },
        { x: 2, y: 5 },
        { x: 3, y: 10 },
      ],
      evaluarEn: 2.5,
    });

    expect(r.mensaje).toBeUndefined();
    expect(r.valor).toBeCloseTo(7.25, 10);
    expect(r.polinomio).toBe('P(x) = x² + 1');
    expect(r.coeficientes).toEqual([1, 0, 1]);
  });

  it('pasa exactamente por todos los nodos', () => {
    const puntos = [
      { x: 1, y: 0 },
      { x: 2, y: 0.6931 },
      { x: 3, y: 1.0986 },
    ];
    const r = lagrange({ puntos, evaluarEn: 2.5 });
    const P = polinomioLagrange(puntos);

    for (const p of puntos) {
      expect(P(p.x)).toBeCloseTo(p.y, 10);
    }
    expect(r.errorEnNodos).toBeLessThan(1e-9);
  });

  it('estima ln(2.5) ≈ 0.9318 con tres nodos', () => {
    const r = lagrange({
      puntos: [
        { x: 1, y: 0 },
        { x: 2, y: 0.6931 },
        { x: 3, y: 1.0986 },
      ],
      evaluarEn: 2.5,
    });

    expect(r.valor).toBeCloseTo(0.9318, 4);
    expect(r.evaluadoEn).toBe(2.5);
  });

  it('las bases Lᵢ suman 1 en cualquier x', () => {
    const puntos = [
      { x: 0, y: 1 },
      { x: 1, y: 2 },
      { x: 2, y: 4 },
    ];
    const r = lagrange({ puntos, evaluarEn: 0.75 });

    const sumaBases = r.filas.reduce((s, f) => s + f.li, 0);
    expect(sumaBases).toBeCloseTo(1, 12);
  });

  it('el aporte de cada dato, sumado, da el valor del polinomio', () => {
    const r = lagrange({
      puntos: [
        { x: 1, y: 0 },
        { x: 2, y: 0.6931 },
        { x: 3, y: 1.0986 },
      ],
      evaluarEn: 2.5,
    });

    const sumaAportes = r.filas.reduce((s, f) => s + f.aporte, 0);
    expect(sumaAportes).toBeCloseTo(r.valor!, 12);
  });

  it('expande los coeficientes de mayor a menor grado', () => {
    const coefs = coeficientesLagrange([
      { x: 1, y: 2 },
      { x: 2, y: 5 },
      { x: 3, y: 10 },
    ]);

    expect(coefs).toEqual([1, 0, 1]);
    expect(formatearPolinomio(coefs)).toBe('P(x) = x² + 1');
  });

  it('avisa si hay dos puntos con la misma x', () => {
    const r = lagrange({
      puntos: [
        { x: 1, y: 2 },
        { x: 1, y: 3 },
        { x: 2, y: 5 },
      ],
      evaluarEn: 1.5,
    });

    expect(r.filas).toEqual([]);
    expect(r.mensaje).toContain('misma x');
  });

  it('avisa si hay menos de dos puntos', () => {
    const r = lagrange({ puntos: [{ x: 1, y: 2 }], evaluarEn: 1.5 });
    expect(r.filas).toEqual([]);
    expect(r.mensaje).toContain('al menos 2 puntos');
  });

  it('si no se pide evaluar, igual construye el polinomio', () => {
    const r = lagrange({
      puntos: [
        { x: 0, y: 1 },
        { x: 1, y: 3 },
      ],
    });

    expect(r.polinomio).toBe('P(x) = 2x + 1');
    expect(r.mensaje).toContain('Falta el valor de x');
  });
});
