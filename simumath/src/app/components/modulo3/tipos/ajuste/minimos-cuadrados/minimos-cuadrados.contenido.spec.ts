import { minimosCuadrados } from './minimos-cuadrados.algoritmo';
import {
  EJEMPLOS_MINIMOS_CUADRADOS,
  EJERCICIOS_MINIMOS_CUADRADOS,
  TEORIA_MINIMOS_CUADRADOS,
} from './minimos-cuadrados.contenido';
import type { EjemploModulo3 } from '../../../modelos/modulo3.model';

/**
 * Tests del contenido de Mínimos Cuadrados.
 *
 * Cada bloque trae una tabla experimental; el motor debe poder ajustarla
 * sin errores y devolver una recta con coeficientes finitos y un r²
 * interpretable. También se verifica que las tablas no tengan todas las
 * x iguales, porque en ese caso no hay pendiente posible.
 */
describe('contenido de Mínimos Cuadrados', () => {
  type Bloque = EjemploModulo3;

  const BLOQUES: Bloque[] = [
    ...EJEMPLOS_MINIMOS_CUADRADOS,
    ...EJERCICIOS_MINIMOS_CUADRADOS,
    TEORIA_MINIMOS_CUADRADOS.ejemploNormal,
    TEORIA_MINIMOS_CUADRADOS.ejemploCasuistica,
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

  it('cada tabla tiene al menos dos valores distintos de x', () => {
    for (const b of BLOQUES) {
      const xs = new Set(b.calculo.puntos.map((p) => p.x));
      expect(xs.size).withContext(`${b.id}: x constantes`).toBeGreaterThanOrEqual(2);
    }
  });

  it('el motor ajusta todos los bloques y la tabla incluye la fila Σ', () => {
    for (const b of BLOQUES) {
      const r = minimosCuadrados(b.calculo);

      expect(r.mensaje).withContext(b.id).toBeUndefined();
      expect(Number.isFinite(r.a0)).withContext(`${b.id}: a0`).toBeTrue();
      expect(Number.isFinite(r.a1)).withContext(`${b.id}: a1`).toBeTrue();
      expect(Number.isFinite(r.errorEstandar))
        .withContext(`${b.id}: error estándar`)
        .toBeTrue();
      expect(r.r2).withContext(`${b.id}: r²`).toBeGreaterThanOrEqual(0);
      expect(r.r2).withContext(`${b.id}: r²`).toBeLessThanOrEqual(1);
      expect(r.filas.length).withContext(`${b.id}: filas`).toBe(b.calculo.puntos.length + 1);
      expect(r.filas[r.filas.length - 1].i).withContext(`${b.id}: fila Σ`).toBe('Σ');
    }
  });

  it('predice en x cuando el bloque lo pide', () => {
    for (const b of BLOQUES) {
      if (b.calculo.evaluarEn === undefined) continue;
      const r = minimosCuadrados(b.calculo);
      expect(Number.isFinite(r.prediccion))
        .withContext(`${b.id}: predicción`)
        .toBeTrue();
    }
  });

  it('cada resolución es escalar y coincide con la predicción del motor', () => {
    for (const ejercicio of EJERCICIOS_MINIMOS_CUADRADOS) {
      expect(ejercicio.resolucion)
        .withContext(`${ejercicio.id}: resolución`)
        .toBeDefined();
      expect(ejercicio.formatoRespuesta ?? 'escalar')
        .withContext(`${ejercicio.id}: formato`)
        .toBe('escalar');

      const declarado = ejercicio.resolucion?.valorCorrecto;
      expect(typeof declarado)
        .withContext(`${ejercicio.id}: el formato escalar exige un número`)
        .toBe('number');

      const calculado = minimosCuadrados(ejercicio.calculo);
      expect(Number.isFinite(calculado.prediccion))
        .withContext(`${ejercicio.id}: el motor no predijo`)
        .toBeTrue();
      expect(Math.abs((declarado as number) - (calculado.prediccion as number)))
        .withContext(`${ejercicio.id}: valorCorrecto no coincide con ŷ(x*)`)
        .toBeLessThan(1e-9);

      expect(ejercicio.resolucion?.respuestaFinalTexto.length ?? 0)
        .withContext(`${ejercicio.id}: respuesta final`)
        .toBeGreaterThan(20);
    }
  });

  it('cada cuestionario tiene tres preguntas con una respuesta válida', () => {
    for (const ejercicio of EJERCICIOS_MINIMOS_CUADRADOS) {
      const preguntas = ejercicio.cuestionario ?? [];
      expect(preguntas.length).withContext(`${ejercicio.id}: preguntas`).toBe(3);

      for (const pregunta of preguntas) {
        const ids = pregunta.opciones.map((o) => o.id);
        expect(new Set(ids).size).withContext(`${pregunta.id}: ids repetidos`).toBe(ids.length);
        expect(ids).withContext(`${pregunta.id}: opción correcta`).toContain(pregunta.correcta);
        expect(pregunta.opciones.length)
          .withContext(`${pregunta.id}: cantidad de opciones`)
          .toBe(pregunta.tipo === 'verdadero-falso' ? 2 : 4);
        expect(pregunta.explicacion.length)
          .withContext(`${pregunta.id}: explicación`)
          .toBeGreaterThan(25);
      }
    }
  });

  it('la teoría y los recursos están completos', () => {
    expect(TEORIA_MINIMOS_CUADRADOS.concepto.length).toBeGreaterThan(80);
    expect(TEORIA_MINIMOS_CUADRADOS.fundamento.length).toBeGreaterThan(80);
    expect(TEORIA_MINIMOS_CUADRADOS.cuandoFalla.length).toBeGreaterThan(80);
    expect(TEORIA_MINIMOS_CUADRADOS.precision.length).toBeGreaterThan(80);
    expect(TEORIA_MINIMOS_CUADRADOS.recursos.length).toBeGreaterThanOrEqual(3);

    for (const r of TEORIA_MINIMOS_CUADRADOS.recursos) {
      expect(r.url.startsWith('https://')).withContext(r.titulo).toBeTrue();
    }
  });
});
