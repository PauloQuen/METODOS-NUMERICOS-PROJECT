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

  it('cada ejercicio trae un cuestionario bien formado', () => {
    for (const e of EJERCICIOS_LAGRANGE) {
      expect(e.cuestionario)
        .withContext(`${e.id}: cuestionario`)
        .toBeDefined();

      const preguntas = e.cuestionario ?? [];
      expect(preguntas.length)
        .withContext(`${e.id}: cantidad de preguntas`)
        .toBeGreaterThanOrEqual(3);
      expect(preguntas.length)
        .withContext(`${e.id}: cantidad de preguntas`)
        .toBeLessThanOrEqual(4);

      for (const p of preguntas) {
        const ids = p.opciones.map((o) => o.id);
        expect(new Set(ids).size).withContext(`${e.id}/${p.id}: ids repetidos`).toBe(ids.length);
        expect(ids).withContext(`${e.id}/${p.id}: opción correcta`).toContain(p.correcta);
        expect(p.explicacion.length)
          .withContext(`${e.id}/${p.id}: explicación`)
          .toBeGreaterThan(25);

        // Los dos tipos que admite el componente: 4 opciones o V/F.
        expect(p.opciones.length)
          .withContext(`${e.id}/${p.id}: cantidad de opciones`)
          .toBe(p.tipo === 'verdadero-falso' ? 2 : 4);
      }
    }
  });

  it('el valor correcto de cada resolución coincide con el polinomio calculado', () => {
    for (const e of EJERCICIOS_LAGRANGE) {
      expect(e.resolucion)
        .withContext(`${e.id}: resolución`)
        .toBeDefined();

      const calculado = lagrange(e.calculo).valor;
      expect(Number.isFinite(calculado))
        .withContext(`${e.id}: el motor no devolvió un valor`)
        .toBeTrue();

      const valorDeclarado = e.resolucion?.valorCorrecto;
      expect(typeof valorDeclarado)
        .withContext(`${e.id}: el formato escalar exige un número`)
        .toBe('number');

      expect(Math.abs((valorDeclarado as number) - (calculado as number)))
        .withContext(`${e.id}: valorCorrecto no coincide con P(x*)`)
        .toBeLessThan(1e-9);

      expect(e.resolucion?.respuestaFinalTexto.length ?? 0)
        .withContext(`${e.id}: respuesta final`)
        .toBeGreaterThan(20);
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
