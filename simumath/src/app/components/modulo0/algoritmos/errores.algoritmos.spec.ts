import {
  calcularErrores,
  parsearOperacion,
  propagarError,
  redondearCifrasSignificativas,
  taylorExp,
} from './errores.algoritmos';
import { parsearNumero, porcentaje } from './formato';

/**
 * Los algoritmos del Módulo 0 son funciones puras: se prueban sin
 * Angular. Los valores son los mismos que aparecen en la teoría y en
 * las tablas de los ejemplos.
 */
describe('algoritmos del Módulo 0', () => {
  describe('cifras significativas', () => {
    it('redondea 123,456789 a cuatro cifras y mide el error', () => {
      const r = redondearCifrasSignificativas(123.456789, 4);

      expect(r.redondeado).toBe(123.5);
      expect(r.errorAbsoluto).toBeCloseTo(0.043211, 10);
      expect(r.errorRelativo).toBeCloseTo(0.000350, 6);
      expect(r.errorPorcentual).toBeCloseTo(0.0350, 4);
    });

    it('conserva el orden de magnitud de un número pequeño', () => {
      const r = redondearCifrasSignificativas(0.00314159, 3);

      expect(r.redondeado).toBe(0.00314);
      expect(r.errorAbsoluto).toBeCloseTo(0.00000159, 12);
      expect(r.errorRelativo).toBeCloseTo(0.000506, 6);
    });

    it('no define el error relativo cuando el valor es cero', () => {
      const r = redondearCifrasSignificativas(0, 3);

      expect(r.redondeado).toBe(0);
      expect(r.errorAbsoluto).toBe(0);
      expect(Number.isNaN(r.errorRelativo)).toBeTrue();
    });

    it('rechaza cantidades de cifras fuera del rango', () => {
      expect(() => redondearCifrasSignificativas(1.23, 0)).toThrowError(/entre 1 y 15/);
      expect(() => redondearCifrasSignificativas(1.23, 16)).toThrowError(/entre 1 y 15/);
      expect(() => redondearCifrasSignificativas(1.23, 2.5)).toThrowError(/entero/);
    });
  });

  describe('error absoluto, relativo y porcentual', () => {
    it('compara π con 3,14', () => {
      const r = calcularErrores(Math.PI, 3.14);

      expect(r.errorAbsoluto).toBeCloseTo(0.0015926536, 10);
      expect(r.errorRelativo).toBeCloseTo(0.000506957, 8);
      expect(r.errorPorcentual).toBeCloseTo(0.0506957, 6);
    });

    it('no define el relativo con referencia cero', () => {
      const r = calcularErrores(0, 0.01);

      expect(r.errorAbsoluto).toBe(0.01);
      expect(Number.isNaN(r.errorRelativo)).toBeTrue();
      expect(porcentaje(r.errorRelativo)).toContain('No definido');
    });

    it('toma el valor absoluto del error aunque la referencia sea negativa', () => {
      const r = calcularErrores(-10, -9.5);

      expect(r.errorAbsoluto).toBeCloseTo(0.5, 12);
      expect(r.errorRelativo).toBeCloseTo(0.05, 12);
    });

    it('rechaza valores no finitos', () => {
      expect(() => calcularErrores(Number.NaN, 1)).toThrowError(/finitos/);
    });
  });

  describe('Taylor de e^x', () => {
    it('aproxima e¹ con grado 4 y acota el resto', () => {
      const r = taylorExp(1, 0, 4);

      expect(r.suma).toBeCloseTo(2.7083333, 7);
      expect(r.real).toBeCloseTo(Math.E, 12);
      expect(r.errorAbsoluto).toBeCloseTo(0.0099485, 7);
      expect(r.cotaResto).toBeCloseTo(Math.E / 120, 10);
      expect(r.errorAbsoluto).toBeLessThanOrEqual(r.cotaResto);
    });

    it('suma n + 1 términos, desde k = 0', () => {
      const r = taylorExp(1, 0, 4);

      expect(r.terminos.length).toBe(5);
      expect(r.terminos[0].k).toBe(0);
      expect(r.terminos[0].termino).toBe(1);
      expect(r.terminos[4].k).toBe(4);
      expect(r.terminos[4].termino).toBeCloseTo(1 / 24, 12);
    });

    it('maneja x negativo y conserva la cota por encima del error', () => {
      const r = taylorExp(-1, 0, 4);

      expect(r.suma).toBeCloseTo(0.375, 12);
      expect(r.real).toBeCloseTo(Math.exp(-1), 12);
      expect(r.errorAbsoluto).toBeCloseTo(0.00712056, 7);
      expect(r.cotaResto).toBeCloseTo(1 / 120, 12);
      expect(r.errorAbsoluto).toBeLessThanOrEqual(r.cotaResto);
    });

    it('rechaza grados fuera del rango', () => {
      expect(() => taylorExp(1, 0, -1)).toThrowError(/entre 0 y 12/);
      expect(() => taylorExp(1, 0, 13)).toThrowError(/entre 0 y 12/);
    });
  });

  describe('propagación de errores', () => {
    it('suma errores absolutos en una suma', () => {
      const r = propagarError('suma', 100, 2, 220, 5);

      expect(r.f).toBe(320);
      expect(r.errorAbsoluto).toBe(7);
      expect(r.errorRelativo).toBeCloseTo(0.021875, 12);
    });

    it('propaga un producto de 12,5 ± 0,1 por 4 ± 0,05', () => {
      const r = propagarError('producto', 12.5, 0.1, 4, 0.05);

      expect(r.f).toBe(50);
      expect(r.errorAbsoluto).toBeCloseTo(1.025, 12);
      expect(r.errorRelativo).toBeCloseTo(0.0205, 12);
    });

    it('propaga un cociente de 25 ± 0,1 entre 10 ± 0,1', () => {
      const r = propagarError('cociente', 25, 0.1, 10, 0.1);

      expect(r.f).toBe(2.5);
      expect(r.errorAbsoluto).toBeCloseTo(0.035, 12);
      expect(r.errorRelativo).toBeCloseTo(0.014, 12);
    });

    it('rechaza la división por cero y los errores negativos', () => {
      expect(() => propagarError('cociente', 1, 0.1, 0, 0.1)).toThrowError(/dividir por cero/);
      expect(() => propagarError('suma', 1, -0.1, 2, 0.1)).toThrowError(/no pueden ser negativos/);
    });

    it('interpreta las palabras y los símbolos de la operación', () => {
      expect(parsearOperacion('SUMA')).toBe('suma');
      expect(parsearOperacion('+')).toBe('suma');
      expect(parsearOperacion('multiplicación')).toBe('producto');
      expect(parsearOperacion('×')).toBe('producto');
      expect(parsearOperacion('dividir')).toBe('cociente');
      expect(parsearOperacion('/')).toBe('cociente');
      expect(parsearOperacion('potencia')).toBeNull();
    });
  });

  describe('formato', () => {
    it('acepta coma y punto decimal', () => {
      expect(parsearNumero('1,25')).toBe(1.25);
      expect(parsearNumero('1.25')).toBe(1.25);
      expect(parsearNumero('  -2,5e-3 ')).toBe(-0.0025);
      expect(parsearNumero('1,2,3')).toBeNull();
    });

    it('muestra el error relativo como porcentaje', () => {
      expect(porcentaje(0.025)).toBe('2.5 %');
    });
  });
});
