import { ejecutarLu, formatearSolucion } from './lu.algoritmo';
import type { SistemaLineal } from '../../../../../shared/domain/numerico/matriz';

/**
 * Tests del algoritmo de factorización LU (Doolittle).
 *
 * ── Qué se verifica ───────────────────────────────────────────────────
 * · Que la solución sea correcta (comparada con la solución exacta).
 * · Que la descomposición produzca L y U tales que A = L·U.
 * · Que el vector y de la sustitución adelante sea correcto.
 * · Que el residuo quede chiquito: es la única medida honesta del error
 *   cuando no se conoce la solución verdadera.
 * · Que un sistema singular o con pivote nulo se reporte como tal.
 * · Que el método NO toque el sistema que recibe.
 */

describe('ejecutarLu', () => {
  it('resuelve un sistema de 2×2', () => {
    const r = ejecutarLu({ A: [[4, 1], [2, 2]], b: [10, 8] });
    expect(r.exito).toBe(true);
    expect(r.solucion![0]).toBeCloseTo(2, 10);
    expect(r.solucion![1]).toBeCloseTo(2, 10);
  });

  it('resuelve un sistema de 3×3', () => {
    const r = ejecutarLu({
      A: [[2, 1, -1], [-3, -1, 2], [-2, 1, 2]],
      b: [8, -11, -3],
    });
    expect(r.exito).toBe(true);
    expect(r.solucion![0]).toBeCloseTo(2, 9);
    expect(r.solucion![1]).toBeCloseTo(3, 9);
    expect(r.solucion![2]).toBeCloseTo(-1, 9);
  });

  it('el residuo queda prácticamente en cero', () => {
    const r = ejecutarLu({ A: [[4, 1], [2, 2]], b: [10, 8] });
    expect(r.residuo!).toBeLessThan(1e-12);
  });

  it('la descomposición cumple A = L·U', () => {
    const sistema: SistemaLineal = { A: [[4, 1], [2, 2]], b: [10, 8] };
    const r = ejecutarLu(sistema);
    expect(r.exito).toBe(true);
    expect(r.L).toBeDefined();
    expect(r.U).toBeDefined();

    // Verificar L·U = A (aproximadamente)
    const L = r.L!;
    const U = r.U!;
    const n = L.length;
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        let suma = 0;
        for (let k = 0; k < n; k++) {
          suma += L[i][k] * U[k][j];
        }
        expect(suma).toBeCloseTo(sistema.A[i][j], 9);
      }
    }
  });

  it('L es triangular inferior con unos en la diagonal', () => {
    const r = ejecutarLu({ A: [[2, 1, -1], [-3, -1, 2], [-2, 1, 2]], b: [8, -11, -3] });
    expect(r.exito).toBe(true);
    const L = r.L!;
    const n = L.length;
    for (let i = 0; i < n; i++) {
      expect(L[i][i]).toBeCloseTo(1, 10);
      for (let j = i + 1; j < n; j++) {
        expect(L[i][j]).toBeCloseTo(0, 10);
      }
    }
  });

  it('U es triangular superior', () => {
    const r = ejecutarLu({ A: [[4, 1], [2, 2]], b: [10, 8] });
    expect(r.exito).toBe(true);
    const U = r.U!;
    const n = U.length;
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < i; j++) {
        expect(U[i][j]).toBeCloseTo(0, 10);
      }
    }
  });

  it('el vector y de la sustitución adelante es correcto', () => {
    const r = ejecutarLu({ A: [[4, 1], [2, 2]], b: [10, 8] });
    expect(r.exito).toBe(true);
    expect(r.y).toBeDefined();
    // L·y = b
    const L = r.L!;
    const y = r.y!;
    const b = [10, 8];
    for (let i = 0; i < 2; i++) {
      let suma = 0;
      for (let j = 0; j <= i; j++) {
        suma += L[i][j] * y[j];
      }
      expect(suma).toBeCloseTo(b[i], 9);
    }
  });

  it('el sistema triangular U·x = y tiene la misma solución', () => {
    const r = ejecutarLu({ A: [[4, 1], [2, 2]], b: [10, 8] });
    expect(r.exito).toBe(true);
    expect(r.sistemaTriangular).toBeDefined();
    // U·x = y
    const U = r.U!;
    const x = r.solucion!;
    const y = r.y!;
    for (let i = 0; i < 2; i++) {
      let suma = 0;
      for (let j = i; j < 2; j++) {
        suma += U[i][j] * x[j];
      }
      expect(suma).toBeCloseTo(y[i], 9);
    }
  });

  it('avisa cuando la matriz es singular (pivote nulo)', () => {
    const r = ejecutarLu({ A: [[1, 1], [2, 2]], b: [1, 2] });
    expect(r.exito).toBe(false);
    expect(r.mensaje).toContain('singular');
    expect(r.solucion).toBeUndefined();
  });

  it('avisa cuando el último pivote es cero', () => {
    // Tras la descomposición, la última fila de U queda [0, 0]
    const r = ejecutarLu({ A: [[1, 1], [1, 1]], b: [2, 3] });
    expect(r.exito).toBe(false);
    expect(r.mensaje).toContain('singular');
  });

  it('avisa cuando el pivote es cero pero la columna tiene coeficientes no nulos (necesita permutación)', () => {
    // La primera columna tiene cero en la diagonal pero 1 abajo
    // LU sin pivoteo no puede descomponer esto
    const r = ejecutarLu({ A: [[0, 1], [1, 0]], b: [1, 2] });
    expect(r.exito).toBe(false);
    expect(r.mensaje).toContain('pivote');
  });

  it('no muta el sistema que recibe', () => {
    const sistema: SistemaLineal = { A: [[4, 1], [2, 2]], b: [10, 8] };
    const copiaA = sistema.A.map((f) => [...f]);
    const copiaB = [...sistema.b];
    ejecutarLu(sistema);
    expect(sistema.A).toEqual(copiaA);
    expect(sistema.b).toEqual(copiaB);
  });

  it('cada paso va numerado desde 1', () => {
    const r = ejecutarLu({ A: [[4, 1], [2, 2]], b: [10, 8] });
    expect(r.filas.length).toBeGreaterThan(0);
    r.filas.forEach((f, i) => expect(f.n).toBe(i + 1));
  });

  it('las etapas aparecen en orden: descomposición, sustitución adelante, sustitución atrás', () => {
    const r = ejecutarLu({ A: [[2, 1, -1], [-3, -1, 2], [-2, 1, 2]], b: [8, -11, -3] });
    const etapas = r.filas.map((f) => f.etapa);
    const idxDescomp = etapas.indexOf('Descomposición');
    const idxAdelante = etapas.indexOf('Sustitución adelante');
    const idxAtras = etapas.indexOf('Sustitución atrás');
    expect(idxDescomp).toBeGreaterThan(-1);
    expect(idxAdelante).toBeGreaterThan(idxDescomp);
    expect(idxAtras).toBeGreaterThan(idxAdelante);
  });

  it('los pasos de descomposición traen el pivote y el multiplicador', () => {
    const r = ejecutarLu({ A: [[4, 1], [2, 2]], b: [10, 8] });
    const pasoDescomp = r.filas.find((f) => f.etapa === 'Descomposición');
    expect(pasoDescomp).toBeDefined();
    expect(pasoDescomp!.pivote).toBeCloseTo(4, 10);
    expect(pasoDescomp!.multiplicador).toBeCloseTo(0.5, 10);
  });

  it('los pasos de sustitución adelante traen la forma y_i = ...', () => {
    const r = ejecutarLu({ A: [[4, 1], [2, 2]], b: [10, 8] });
    const pasoAdelante = r.filas.find((f) => f.etapa === 'Sustitución adelante');
    expect(pasoAdelante).toBeDefined();
    expect(pasoAdelante!.fila).toContain('y');
  });

  it('los pasos de sustitución atrás traen la forma x_i = ...', () => {
    const r = ejecutarLu({ A: [[4, 1], [2, 2]], b: [10, 8] });
    const pasoAtras = r.filas.find((f) => f.etapa === 'Sustitución atrás');
    expect(pasoAtras).toBeDefined();
    expect(pasoAtras!.fila).toContain('x');
  });

  it('cada paso explica en palabras lo que hizo', () => {
    const r = ejecutarLu({ A: [[4, 1], [2, 2]], b: [10, 8] });
    for (const fila of r.filas) {
      expect(fila.detalle.length).toBeGreaterThan(10);
    }
  });

  it('un sistema de 1×1 se resuelve con sustituciones', () => {
    const r = ejecutarLu({ A: [[4]], b: [8] });
    expect(r.exito).toBe(true);
    expect(r.solucion![0]).toBeCloseTo(2, 10);
    expect(r.filas.length).toBe(2); // y1 + x1
  });

  it('formatea la solución como vector entre paréntesis', () => {
    expect(formatearSolucion([2, 1])).toBe('(2, 1)');
    expect(formatearSolucion(undefined)).toBe('—');
  });
});