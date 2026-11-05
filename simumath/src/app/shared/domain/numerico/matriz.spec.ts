import {
  determinante,
  esDefinidaPositiva,
  esDiagonalmenteDominante,
  esSimetrica,
  esSingular,
  formatearMatriz,
  formatearNumero,
  formatearSistema,
  formatearVector,
  identidad,
  matrizAumentada,
  multiplicar,
  multiplicarVector,
  normaInfinitaMatriz,
  normaInfinitaVector,
  nula,
  parsearMatriz,
  parsearVector,
  residuo,
  separarAumentada,
  transponer,
} from './matriz';

describe('matriz', () => {
  describe('determinante', () => {
    it('de la identidad vale 1', () => {
      expect(determinante(identidad(4))).toBe(1);
    });

    it('de la matriz nula vale 0', () => {
      expect(determinante(nula(3))).toBe(0);
    });

    it('de una matriz 2x2 vale ad - bc', () => {
      // OJO: se compara con tolerancia, no con igualdad exacta. La
      // eliminación trabaja con divisiones y el resultado tiene las
      // últimas cifras de la coma flotante (10.000000000000002).
      expect(determinante([[3, 1], [2, 4]])).toBeCloseTo(10, 10);
    });

    it('de una matriz 3x3 conocida', () => {
      // | 2 1 1 ; 1 3 2 ; 1 0 0 | = -1
      expect(determinante([[2, 1, 1], [1, 3, 2], [1, 0, 0]])).toBeCloseTo(-1, 10);
    });

    it('detecta singularidad cuando hay una fila de ceros', () => {
      expect(esSingular([[1, 2], [2, 4]])).toBe(true);
    });

    it('no marca singular una matriz con determinante normal', () => {
      expect(esSingular([[1, 2], [3, 4]])).toBe(false);
    });
  });

  describe('álgebra', () => {
    it('la transpuesta invierte filas y columnas', () => {
      expect(transponer([[1, 2, 3], [4, 5, 6]])).toEqual([[1, 4], [2, 5], [3, 6]]);
    });

    it('multiplica matrices', () => {
      const A = [[1, 2], [3, 4]];
      const B = [[5, 6], [7, 8]];
      expect(multiplicar(A, B)).toEqual([[19, 22], [43, 50]]);
    });

    it('multiplica una matriz por un vector', () => {
      expect(multiplicarVector([[2, 1], [1, 3]], [1, 2])).toEqual([4, 7]);
    });
  });

  describe('normas y residuo', () => {
    it('la norma infinita de un vector es el mayor valor absoluto', () => {
      expect(normaInfinitaVector([1, -5, 3])).toBe(5);
    });

    it('la norma infinita de una matriz es el máximo de la suma por fila', () => {
      // Filas: |1|+|-2| = 3 y |3|+|4| = 7. Gana la segunda.
      expect(normaInfinitaMatriz([[1, -2], [3, 4]])).toBe(7);
    });

    it('el residuo de la solución exacta es cero', () => {
      const A = [[2, 1], [1, 3]];
      const b = [5, 10];
      const x = [1, 3];
      expect(residuo(A, x, b)).toBeCloseTo(0, 12);
    });
  });

  describe('condiciones de convergencia', () => {
    it('reconoce una matriz diagonalmente dominante', () => {
      expect(esDiagonalmenteDominante([[4, 1], [2, 5]])).toBe(true);
    });

    it('rechaza una matriz que no es diagonalmente dominante', () => {
      expect(esDiagonalmenteDominante([[1, 2], [2, 5]])).toBe(false);
    });

    it('reconoce una matriz simétrica', () => {
      expect(esSimetrica([[2, 1], [1, 3]])).toBe(true);
    });

    it('reconoce una matriz definida positiva', () => {
      expect(esDefinidaPositiva([[2, 1], [1, 3]])).toBe(true);
    });

    it('rechaza una matriz definida positiva que no lo es', () => {
      expect(esDefinidaPositiva([[-2, 0], [0, -3]])).toBe(false);
    });
  });

  describe('parseo', () => {
    it('lee una matriz con espacios', () => {
      const r = parsearMatriz('3 1 2\n1 -1 1');
      expect(r).toEqual({ matriz: [[3, 1, 2], [1, -1, 1]] });
    });

    it('lee una matriz con comas', () => {
      const r = parsearMatriz('3, 1\n-1, 4');
      expect(r).toEqual({ matriz: [[3, 1], [-1, 4]] });
    });

    it('avisa cuando las filas tienen distinto largo', () => {
      const r = parsearMatriz('1 2 3\n4 5');
      expect('error' in r).toBe(true);
    });

    it('avisa cuando hay un valor que no es número', () => {
      const r = parsearMatriz('1 2\n3 x');
      expect('error' in r).toBe(true);
    });

    it('lee un vector en una línea', () => {
      expect(parsearVector('5 2 9')).toEqual({ vector: [5, 2, 9] });
    });

    it('lee un vector con saltos de línea', () => {
      expect(parsearVector('5\n2\n9')).toEqual({ vector: [5, 2, 9] });
    });
  });

  describe('formato', () => {
    it('muestra los enteros sin decimales', () => {
      expect(formatearNumero(3)).toBe('3');
      expect(formatearNumero(-0)).toBe('0');
    });

    it('muestra los decimales sin ceros de relleno', () => {
      expect(formatearNumero(1.5)).toBe('1.5');
      expect(formatearNumero(0.25)).toBe('0.25');
    });

    it('muestra el vector entre paréntesis', () => {
      expect(formatearVector([1, 2.5])).toBe('(1, 2.5)');
    });

    it('muestra la matriz con la barra del lado derecho', () => {
      const filas = formatearMatriz([[1, 2, 3]], ' | ');
      expect(filas[0]).toContain('|');
    });

    it('muestra el sistema con corchetes y barra', () => {
      const texto = formatearSistema([[1, 2], [3, 4]], [5, 6]);
      expect(texto).toContain('|');
      expect(texto.split('\n').length).toBe(2);
    });
  });

  describe('matriz aumentada', () => {
    it('agrega el lado derecho como última columna', () => {
      expect(matrizAumentada([[1, 2]], [3])).toEqual([[1, 2, 3]]);
    });

    it('es la inversa de separarAumentada', () => {
      const A = [[1, 2], [3, 4]];
      const b = [5, 6];
      expect(separarAumentada(matrizAumentada(A, b))).toEqual({ A, b });
    });
  });
});
