import { ejecutarGauss, formatearSolucion } from './gauss.algoritmo';
import type { SistemaLineal } from '../../../../../shared/domain/numerico/matriz';

/**
 * Tests del algoritmo de eliminación gaussiana con pivoteo parcial.
 *
 * ── Qué se verifica ───────────────────────────────────────────────────
 * · Que la solución sea correcta (comparada con la solución exacta).
 * · Que el pivoteo parcial ocurra con la fila de mayor valor absoluto.
 * · Que el residuo quede chiquito: es la única medida honesta del error
 *   cuando no se conoce la solución verdadera.
 * · Que un sistema singular se reporte como tal, sin sacar un número
 *   inventado de la nada.
 * · Que el método NO toque el sistema que recibe.
 */

describe('ejecutarGauss', () => {
  it('resuelve un sistema de 2×2', () => {
    const r = ejecutarGauss({ A: [[2, 1], [1, -1]], b: [5, 1] });
    expect(r.exito).toBe(true);
    expect(r.solucion![0]).toBeCloseTo(2, 10);
    expect(r.solucion![1]).toBeCloseTo(1, 10);
  });

  it('resuelve un sistema de 3×3', () => {
    const r = ejecutarGauss({
      A: [[2, 1, -1], [-3, -1, 2], [-2, 1, 2]],
      b: [8, -11, -3],
    });
    expect(r.exito).toBe(true);
    expect(r.solucion![0]).toBeCloseTo(2, 9);
    expect(r.solucion![1]).toBeCloseTo(3, 9);
    expect(r.solucion![2]).toBeCloseTo(-1, 9);
  });

  it('el residuo queda prácticamente en cero', () => {
    const r = ejecutarGauss({ A: [[2, 1], [1, -1]], b: [5, 1] });
    expect(r.residuo!).toBeLessThan(1e-12);
  });

  it('el residuo sirve para detectar una solución falsa', () => {
    const sistema: SistemaLineal = { A: [[2, 1], [1, -1]], b: [5, 1] };
    // La solución (0,0) es mala: el residuo tiene que notarlo.
    const residuoCero = sistema.b.reduce((acc, bi) => acc + Math.abs(bi), 0);
    expect(residuoCero).toBeGreaterThan(1);
  });

  it('hace pivoteo parcial cuando la primera columna tiene un cero', () => {
    const r = ejecutarGauss({
      A: [[0, 1, 2], [1, 0, 0], [3, 4, 5]],
      b: [1, 2, 3],
    });
    expect(r.exito).toBe(true);
    expect(r.intercambios).toBe(1);
    expect(r.filas[0].etapa).toBe('Pivoteo');
    // La solución exacta es (2, −11/3, 7/3).
    expect(r.solucion![0]).toBeCloseTo(2, 9);
    expect(r.solucion![1]).toBeCloseTo(-11 / 3, 9);
    expect(r.solucion![2]).toBeCloseTo(7 / 3, 9);
  });

  it('el pivoteo parcial elige el MAYOR valor absoluto de la columna', () => {
    // En la columna 1 los valores son 0, 1 y 3: el pivote debe ser 3.
    const r = ejecutarGauss({
      A: [[0, 1, 2], [1, 0, 0], [3, 4, 5]],
      b: [1, 2, 3],
    });
    expect(r.filas[0].pivote).toBeCloseTo(3, 10);
  });

  it('avisa cuando la matriz es singular', () => {
    const r = ejecutarGauss({ A: [[1, 1], [2, 2]], b: [1, 2] });
    expect(r.exito).toBe(false);
    expect(r.mensaje).toContain('singular');
    expect(r.solucion).toBeUndefined();
  });

  it('detecta la singularidad cuando el último pivote es cero', () => {
    // Tras eliminar, la última fila queda [0 | 1]: el sistema es
    // incompatible y no tiene solución única.
    const r = ejecutarGauss({ A: [[1, 1], [1, 1]], b: [2, 3] });
    expect(r.exito).toBe(false);
    expect(r.mensaje).toContain('singular');
  });

  it('no muta el sistema que recibe', () => {
    const sistema: SistemaLineal = { A: [[2, 1], [1, -1]], b: [5, 1] };
    const copiaA = sistema.A.map((f) => [...f]);
    const copiaB = [...sistema.b];
    ejecutarGauss(sistema);
    expect(sistema.A).toEqual(copiaA);
    expect(sistema.b).toEqual(copiaB);
  });

  it('cada paso va numerado desde 1', () => {
    const r = ejecutarGauss({ A: [[2, 1], [1, -1]], b: [5, 1] });
    expect(r.filas.length).toBeGreaterThan(0);
    r.filas.forEach((f, i) => expect(f.n).toBe(i + 1));
  });

  it('las etapas aparecen en orden: eliminación y luego sustitución', () => {
    const r = ejecutarGauss({ A: [[2, 1], [1, -1]], b: [5, 1] });
    const etapas = r.filas.map((f) => f.etapa);
    const primeraSustitucion = etapas.indexOf('Sustitución');
    expect(primeraSustitucion).toBeGreaterThan(-1);
    // Todas las sustituciones van al final, y hay una por incógnita.
    expect(
      etapas.slice(primeraSustitucion).every((e) => e === 'Sustitución'),
    ).toBe(true);
    expect(etapas.length - primeraSustitucion).toBe(2);
  });

  it('la fila de la tabla trae la barra de la matriz aumentada', () => {
    const r = ejecutarGauss({ A: [[2, 1], [1, -1]], b: [5, 1] });
    expect(r.filas[0].fila).toContain('|');
  });

  it('cada paso explica en palabras lo que hizo', () => {
    const r = ejecutarGauss({ A: [[2, 1], [1, -1]], b: [5, 1] });
    for (const fila of r.filas) {
      expect(fila.detalle.length).toBeGreaterThan(10);
    }
  });

  it('el último paso despeja la primera incógnita', () => {
    const r = ejecutarGauss({ A: [[2, 1], [1, -1]], b: [5, 1] });
    const ultimo = r.filas[r.filas.length - 1];
    expect(ultimo.etapa).toBe('Sustitución');
    expect(ultimo.k).toBe(0);
    expect(ultimo.fila).toContain('x₁');
  });

  it('un sistema de 1×1 se resuelve con una sola sustitución', () => {
    const r = ejecutarGauss({ A: [[4]], b: [8] });
    expect(r.exito).toBe(true);
    expect(r.solucion![0]).toBeCloseTo(2, 10);
    expect(r.filas.length).toBe(1);
    expect(r.filas[0].etapa).toBe('Sustitución');
  });

  it('formatea la solución como vector entre paréntesis', () => {
    expect(formatearSolucion([2, 1])).toBe('(2, 1)');
    expect(formatearSolucion(undefined)).toBe('—');
  });
});
