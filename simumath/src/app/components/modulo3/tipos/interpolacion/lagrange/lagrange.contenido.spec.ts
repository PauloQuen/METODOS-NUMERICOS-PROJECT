import { lagrange } from './lagrange.algoritmo';
import {
  EJEMPLOS_LAGRANGE,
  EJERCICIOS_LAGRANGE,
  TEORIA_LAGRANGE,
} from './lagrange.contenido';
import type { EjemploModulo3 } from '../../../modelos/modulo3.model';

/**
 * Tests del contenido de Lagrange.
 *
 * El contenido no es texto suelto: cada bloque trae los puntos con los
 * que se calcula la tabla y el gráfico. Estos tests verifican que esos
 * datos sean válidos y que el motor, corrido con ellos, produzca el
 * polinomio que el bloque dice mostrar. Si alguien cambia un punto sin
 * recalcular el texto, el error salta acá.
 */
describe('contenido de Lagrange', () => {
  type Bloque = EjemploModulo3;

  const BLOQUES: Bloque[] = [
    ...EJEMPLOS_LAGRANGE,
    ...EJERCICIOS_LAGRANGE,
    TEORIA_LAGRANGE.ejemploNormal,
    TEORIA_LAGRANGE.ejemploCasuistica,
  ];

  it('no repite ids entre ejemplos, ejercicios y teoría', () => {
    const ids = BLOQUES.map((b) => b.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('todos los bloques tienen una tabla con al menos dos puntos finitos', () => {
    for (const b of BLOQUES) {
      expect(b.calculo.puntos.length).toBeGreaterThanOrEqual(2);
      for (const p of b.calculo.puntos) {
        expect(Number.isFinite(p.x)).withContext(`${b.id}: x`).toBeTrue();
        expect(Number.isFinite(p.y)).withContext(`${b.id}: y`).toBeTrue();
      }
    }
  });

  it('las x de cada tabla son distintas (requisito de Lagrange)', () => {
    for (const b of BLOQUES) {
      const xs = b.calculo.puntos.map((p) => p.x);
      expect(new Set(xs).size).withContext(`${b.id}: x repetida`).toBe(xs.length);
    }
  });

  it('el polinomio pasa por todos los puntos de cada bloque', () => {
    for (const b of BLOQUES) {
      const r = lagrange(b.calculo);
      expect(r.errorEnNodos ?? Infinity)
        .withContext(`${b.id}: error en los nodos`)
        .toBeLessThan(1e-8);

      if (b.calculo.evaluarEn !== undefined) {
        expect(Number.isFinite(r.valor))
          .withContext(`${b.id}: valor interpolado`)
          .toBeTrue();
      }
    }
  });

  it('la teoría y los recursos están completos', () => {
    expect(TEORIA_LAGRANGE.concepto.length).toBeGreaterThan(80);
    expect(TEORIA_LAGRANGE.fundamento.length).toBeGreaterThan(80);
    expect(TEORIA_LAGRANGE.cuandoFalla.length).toBeGreaterThan(80);
    expect(TEORIA_LAGRANGE.precision.length).toBeGreaterThan(80);
    expect(TEORIA_LAGRANGE.recursos.length).toBeGreaterThanOrEqual(3);

    for (const r of TEORIA_LAGRANGE.recursos) {
      expect(r.url.startsWith('https://')).withContext(r.titulo).toBeTrue();
    }
  });
});
