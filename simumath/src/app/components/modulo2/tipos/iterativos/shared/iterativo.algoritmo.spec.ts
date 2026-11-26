import { ejecutarJacobi } from '../jacobi/jacobi.algoritmo';
import { ejecutarGaussSeidel } from '../gauss-seidel/gauss-seidel.algoritmo';
import { normaInfinito, residuos, resolverIterativo, type EntradaIterativa, type MetodoIterativo } from './iterativo.algoritmo';

const simple: EntradaIterativa = { A: [[4, 1], [2, 3]], b: [6, 8], x0: [0, 0], tol: 1e-9, maxIter: 500 };

describe('Jacobi y Gauss-Seidel', () => {
  it('distingue la actualización simultánea de la sucesiva en las dos primeras barridas', () => {
    const j = ejecutarJacobi(simple).iteracionesDetalle;
    const g = ejecutarGaussSeidel(simple).iteracionesDetalle;
    expect(j[0].x).toEqual([1.5, 8 / 3]);
    expect(g[0].x).toEqual([1.5, 5 / 3]);
    expect(j[1].x[0]).toBeCloseTo(5 / 6, 12);
    expect(j[1].x[1]).toBeCloseTo(5 / 3, 12);
    expect(g[1].x[0]).toBeCloseTo(13 / 12, 12);
    expect(g[1].x[1]).toBeCloseTo(35 / 18, 12);
  });

  for (const metodo of ['jacobi', 'gauss-seidel'] as const) describe(metodo, () => {
    it('converge y calcula el cambio y residuo con los datos de cada barrida', () => {
      const r = resolverIterativo(simple, metodo);
      expect(r.convergio).toBeTrue();
      expect(r.diagonalDominante).toBeTrue();
      expect(r.solucion![0]).toBeCloseTo(1, 8);
      expect(r.solucion![1]).toBeCloseTo(2, 8);
      let previo = r.inicial!;
      for (const fila of r.iteracionesDetalle) {
        const residuo = normaInfinito(residuos(simple.A, simple.b, fila.x));
        const cambio = normaInfinito(fila.x.map((v, i) => v - previo.x[i]));
        expect(fila.residuo).toBe(residuo);
        expect(fila.residuoRelativo).toBe(residuo / 8);
        expect(fila.cambio).toBe(cambio);
        expect(fila.cambioRelativo).toBe(cambio / Math.max(1, normaInfinito(fila.x)));
        previo = fila;
      }
      expect(previo.cambioRelativo).toBeLessThanOrEqual(simple.tol!);
      expect(previo.residuoRelativo).toBeLessThanOrEqual(simple.tol!);
    });

    it('resuelve sistemas de distintas dimensiones y conserva los datos originales', () => {
      for (const n of [1, 3, 4, 8]) {
        const A = Array.from({ length: n }, (_, i) => Object.freeze(Array.from({ length: n }, (_, j) => i === j ? n + 3 : 1)));
        const x = Array.from({ length: n }, (_, i) => i - 2);
        const b = Object.freeze(A.map(f => f.reduce((s, a, j) => s + a * x[j], 0)));
        const x0 = Object.freeze(Array(n).fill(1));
        const entrada = Object.freeze({ A: Object.freeze(A), b, x0, tol: 1e-10, maxIter: 500 });
        const antes = JSON.stringify(entrada);
        const r = resolverIterativo(entrada, metodo);
        expect(r.convergio).withContext(`${metodo}, n=${n}`).toBeTrue();
        r.solucion!.forEach((v, i) => expect(v).toBeCloseTo(x[i], 8));
        expect(JSON.stringify(entrada)).toBe(antes);
      }
    });

    it('reconoce una semilla que ya satisface el sistema y el caso b = 0', () => {
      const r = resolverIterativo({ ...simple, x0: [1, 2] }, metodo);
      expect(r.iteraciones).toBe(0);
      expect(r.solucion).toEqual([1, 2]);
      expect(resolverIterativo({ ...simple, b: [0, 0] }, metodo).solucion).toEqual([0, 0]);
      const homogeneo = resolverIterativo({ ...simple, b: [0, 0], x0: [2, -1] }, metodo);
      expect(homogeneo.convergio).toBeTrue();
      expect(normaInfinito(homogeneo.solucion!)).toBeLessThan(1e-8);
    });

    it('no acepta un cambio pequeño si todavía queda un residuo grande', () => {
      const r = resolverIterativo({ A: [[1e20, 5e19], [5e19, 1e20]], b: [1, 1], maxIter: 1, tol: 1e-6 }, metodo);
      expect(r.iteracionesDetalle[0].cambioRelativo).toBeLessThan(1e-6);
      expect(r.iteracionesDetalle[0].residuoRelativo).toBeGreaterThan(1e-6);
      expect(r.convergio).toBeFalse();
      expect(r.solucion).toBeUndefined();
      expect(r.estado).toBe('limite');
    });

    it('no confunde falta de dominancia con falta de convergencia', () => {
      const r = resolverIterativo({ A: [[1, 2], [.1, 1]], b: [5, 2.1], tol: 1e-9, maxIter: 200 }, metodo);
      expect(r.diagonalDominante).toBeFalse();
      expect(r.convergio).toBeTrue();
      expect(r.solucion![0]).toBeCloseTo(1, 7);
      expect(r.solucion![1]).toBeCloseTo(2, 7);
    });

    it('es invariante ante escalas pequeñas o grandes de todas las ecuaciones', () => {
      for (const escala of [1e-20, 1, 1e20]) {
        const r = resolverIterativo({ ...simple, A: simple.A.map(f => f.map(a => a * escala)), b: simple.b.map(b => b * escala) }, metodo);
        expect(r.convergio).toBeTrue();
        expect(r.solucion![0]).toBeCloseTo(1, 8);
        expect(r.solucion![1]).toBeCloseTo(2, 8);
      }
    });

    it('conserva solo aproximaciones finitas al desbordar y distingue un límite sin convergencia', () => {
      const limite = resolverIterativo({ A: [[1, 2], [2, 1]], b: [3, 3], maxIter: 12 }, metodo);
      expect(limite.convergio).toBeFalse();
      expect(limite.estado).toBe('limite');
      expect(limite.iteraciones).toBe(12);
      expect(limite.aproximacion).toBeDefined();
      expect(limite.solucion).toBeUndefined();
      const grande = resolverIterativo({ A: [[1, 1e308], [1e308, 1]], b: [1, 1], maxIter: 5 }, metodo);
      expect(grande.estado).toBe('no-finito');
      expect(grande.solucion).toBeUndefined();
      grande.iteracionesDetalle.forEach(f => expect([...f.x, f.cambio, f.residuo, f.residuoRelativo].every(Number.isFinite)).toBeTrue());
    });
  });

  it('distingue la garantía de matrices simétricas definidas positivas entre los dos métodos', () => {
    const entrada = { A: [[1, .75, .75], [.75, 1, .75], [.75, .75, 1]], b: [2.5, 2.5, 2.5], maxIter: 300 };
    expect(ejecutarJacobi(entrada).convergio).toBeFalse();
    const g = ejecutarGaussSeidel(entrada);
    expect(g.convergio).toBeTrue();
    expect(g.diagonalDominante).toBeFalse();
    g.solucion!.forEach(x => expect(x).toBeCloseTo(1, 5));
  });

  const invalidas: Partial<EntradaIterativa>[] = [
    { A: [] }, { A: [[1, 2], [3]] }, { A: [[0, 1], [1, 2]] }, { A: [[1, NaN], [2, 3]] },
    { b: [1] }, { b: [Infinity, 2] }, { x0: [] }, { x0: [NaN, 0] },
    { tol: 0 }, { tol: -1 }, { tol: Infinity }, { tol: NaN },
    { maxIter: 0 }, { maxIter: -2 }, { maxIter: 1.5 }, { maxIter: Infinity }, { maxIter: 5001 },
  ];
  for (const metodo of ['jacobi', 'gauss-seidel'] as MetodoIterativo[]) {
    invalidas.forEach((datos, i) => it(`${metodo} rechaza la entrada inválida ${i + 1}`, () => {
      const r = resolverIterativo({ ...simple, ...datos }, metodo);
      expect(r.estado).toBe('entrada-invalida');
      expect(r.mensaje.length).toBeGreaterThan(10);
      expect(r.iteracionesDetalle).toEqual([]);
      expect(r.solucion).toBeUndefined();
    }));
  }
});
