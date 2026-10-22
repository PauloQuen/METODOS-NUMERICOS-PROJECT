import { eliminacionGauss } from './eliminacion-gauss.algoritmo';
import {
  EJEMPLOS_ELIMINACION_GAUSS,
  EJERCICIOS_ELIMINACION_GAUSS,
  TEORIA_ELIMINACION_GAUSS,
} from './eliminacion-gauss.contenido';
import type { EjemploModulo2 } from '../../../modelos/modulo2.model';

/**
 * Tests del contenido de Gauss: ids únicos, sistemas cuadrados y
 * soluciones que el motor puede reproducir sin errores.
 */
describe('contenido de Eliminación de Gauss', () => {
  type Bloque = EjemploModulo2;

  const BLOQUES: Bloque[] = [
    ...EJEMPLOS_ELIMINACION_GAUSS,
    ...EJERCICIOS_ELIMINACION_GAUSS,
    TEORIA_ELIMINACION_GAUSS.ejemploNormal,
    TEORIA_ELIMINACION_GAUSS.ejemploCasuistica,
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
      expect(
        b.calculo.A.every((fila) => fila.every((v) => Number.isFinite(v))),
      ).withContext(b.id).toBeTrue();
    }
  });

  /** Soluciones que promete el contenido, por id. */
  const SOLUCIONES: Record<string, number[]> = {
    'gauss-teoria-numerico': [2, 3, -1],
    'gauss-teoria-casuistica': [10, 5, 5],
    'gauss-ejemplo-3x3': [2, 1, 3],
    'gauss-ejemplo-2x2': [2, 4],
    'gauss-ejemplo-presupuesto': [5, 10, 15],
    'gauss-ejemplo-mezcla': [2, 3, 4],
    'gauss-ejercicio-1': [2, 1],
    'gauss-ejercicio-2': [1, 2, 3],
    'gauss-ejercicio-3': [2.5, 5, 7.5],
    'gauss-ejercicio-4': [3, 2, 4],
    'gauss-ejercicio-5': [10, 20, 30],
    'gauss-ejercicio-6': [8, 10, 12],
  };

  it('el motor resuelve todos los bloques con la solución anunciada', () => {
    for (const b of BLOQUES) {
      const r = eliminacionGauss({ A: b.calculo.A, b: b.calculo.b });
      expect(r.mensaje).withContext(b.id).toBeUndefined();
      expect(r.x!.length).withContext(b.id).toBe(b.calculo.A.length);
      expect(r.residual!).withContext(b.id).toBeLessThan(1e-8);

      const esperada = SOLUCIONES[b.id];
      expect(esperada).withContext(`${b.id}: falta la solución esperada`).toBeDefined();
      for (let i = 0; i < esperada.length; i++) {
        expect(r.x![i])
          .withContext(`${b.id}: x${i + 1}`)
          .toBeCloseTo(esperada[i], 6);
      }
    }
  });

  it('la teoría y los recursos están completos', () => {
    expect(TEORIA_ELIMINACION_GAUSS.recursos.length).toBeGreaterThanOrEqual(3);
    expect(TEORIA_ELIMINACION_GAUSS.algoritmo.pasos.length).toBeGreaterThanOrEqual(4);
    expect(TEORIA_ELIMINACION_GAUSS.algoritmo.ventajas.length).toBeGreaterThanOrEqual(3);
    for (const r of TEORIA_ELIMINACION_GAUSS.recursos) {
      expect(r.url.startsWith('https://')).withContext(r.titulo).toBeTrue();
    }
  });
});
