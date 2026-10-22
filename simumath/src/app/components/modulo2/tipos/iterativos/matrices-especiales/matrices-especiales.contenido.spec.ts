import { gaussSeidel } from './matrices-especiales.algoritmo';
import {
  EJEMPLOS_MATRICES_ESPECIALES,
  EJERCICIOS_MATRICES_ESPECIALES,
  TEORIA_MATRICES_ESPECIALES,
} from './matrices-especiales.contenido';
import type { EjemploModulo2 } from '../../../modelos/modulo2.model';

/**
 * Tests del contenido de Matrices especiales: cada bloque debe ser un
 * sistema dominante o tridiagonal que el método resuelve dentro del
 * máximo de iteraciones.
 */
describe('contenido de Matrices especiales', () => {
  type Bloque = EjemploModulo2;

  const BLOQUES: Bloque[] = [
    ...EJEMPLOS_MATRICES_ESPECIALES,
    ...EJERCICIOS_MATRICES_ESPECIALES,
    TEORIA_MATRICES_ESPECIALES.ejemploNormal,
    TEORIA_MATRICES_ESPECIALES.ejemploCasuistica,
  ];

  it('no repite ids', () => {
    const ids = BLOQUES.map((b) => b.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('todos los sistemas son cuadrados y numéricos', () => {
    for (const b of BLOQUES) {
      const n = b.calculo.A.length;
      expect(n).withContext(b.id).toBeGreaterThanOrEqual(2);
      expect(b.calculo.b.length).withContext(b.id).toBe(n);
      expect(b.calculo.A.every((fila) => fila.length === n)).withContext(b.id).toBeTrue();
    }
  });

  /** Soluciones que promete el contenido, por id. */
  const SOLUCIONES: Record<string, number[]> = {
    'seidel-teoria-numerico': [1, 1, 1],
    'seidel-teoria-casuistica': [30, 20, 40],
    'seidel-ejemplo-3x3': [2, 1, 3],
    'seidel-ejemplo-2x2': [1, 1],
    'seidel-ejemplo-produccion': [2, 3, 4],
    'seidel-ejemplo-tridiagonal': [30, 20, 40],
    'seidel-ejercicio-1': [1, 1, 1],
    'seidel-ejercicio-2': [1, 2, 3],
    'seidel-ejercicio-3': [2, 1],
    'seidel-ejercicio-4': [2, 3, 4],
    'seidel-ejercicio-5': [10, 20, 30],
    'seidel-ejercicio-6': [30, 20, 40],
  };

  it('todos los bloques convergen con la solución anunciada', () => {
    for (const b of BLOQUES) {
      const r = gaussSeidel({
        A: b.calculo.A,
        b: b.calculo.b,
        tol: b.calculo.tol ?? 1e-6,
        maxIter: b.calculo.maxIter ?? 100,
      });

      expect(r.mensaje).withContext(b.id).toBeUndefined();
      expect(r.convergio).withContext(b.id).toBeTrue();
      expect(r.x!.length).withContext(b.id).toBe(b.calculo.A.length);
      expect(r.filas.length).withContext(b.id).toBe(r.iteraciones);
      expect(r.error!).withContext(b.id).toBeLessThan(b.calculo.tol ?? 1e-6);

      const esperada = SOLUCIONES[b.id];
      expect(esperada).withContext(`${b.id}: falta la solución esperada`).toBeDefined();
      for (let i = 0; i < esperada.length; i++) {
        expect(r.x![i])
          .withContext(`${b.id}: x${i + 1}`)
          .toBeCloseTo(esperada[i], 6);
      }
    }
  });

  it('los ejemplos de la teoría son diagonalmente dominantes', () => {
    expect(
      gaussSeidel({
        A: TEORIA_MATRICES_ESPECIALES.ejemploNormal.calculo.A,
        b: TEORIA_MATRICES_ESPECIALES.ejemploNormal.calculo.b,
        tol: 1e-6,
        maxIter: 100,
      }).diagonalDominante,
    ).toBeTrue();
  });

  it('la teoría y los recursos están completos', () => {
    expect(TEORIA_MATRICES_ESPECIALES.recursos.length).toBeGreaterThanOrEqual(3);
    expect(TEORIA_MATRICES_ESPECIALES.algoritmo.pasos.length).toBeGreaterThanOrEqual(4);
    for (const r of TEORIA_MATRICES_ESPECIALES.recursos) {
      expect(r.url.startsWith('https://')).withContext(r.titulo).toBeTrue();
    }
  });
});
