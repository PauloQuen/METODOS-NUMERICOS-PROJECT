import { rangoConvergencia } from './grafico-convergencia';
import {
  esDiagonalmenteDominante,
  formatearNumero,
  parsearMatriz,
  parsearSistema,
  parsearVector,
  residuoMaximo,
} from './sistema';

describe('utilidades de sistemas lineales', () => {
  it('parsea matrices con filas separadas por ; o saltos de línea', () => {
    expect(parsearMatriz('2, -1, 1; 3, 3, 9; 3, 6, 1').A).toEqual([
      [2, -1, 1],
      [3, 3, 9],
      [3, 6, 1],
    ]);
    expect(parsearMatriz('1 2\n3 4').A).toEqual([
      [1, 2],
      [3, 4],
    ]);
  });

  it('rechaza matrices no cuadradas o con filas de distinto ancho', () => {
    expect(parsearMatriz('1, 2, 3; 4, 5, 6').error).toContain('cuadrada');
    expect(parsearMatriz('1, 2; 3').A).toEqual([]);
  });

  it('parsea el vector b con punto y coma, coma o espacios', () => {
    expect(parsearVector('8; -11; -3').b).toEqual([8, -11, -3]);
    expect(parsearVector('8, -11, -3').b).toEqual([8, -11, -3]);
    expect(parsearVector('8 -11 -3').b).toEqual([8, -11, -3]);
    expect(parsearVector('8; −11; −3').b).toEqual([8, -11, -3]);
  });

  it('parsea el sistema completo y valida tamaños', () => {
    const ok = parsearSistema('2, 1; 1, 3', '5; 7');
    expect(ok.error).toBeUndefined();
    expect(ok.sistema!.A.length).toBe(2);
    expect(ok.sistema!.b).toEqual([5, 7]);

    const mal = parsearSistema('2, 1; 1, 3', '5');
    expect(mal.error).toContain('Deben coincidir');
  });

  it('detecta dominancia diagonal estricta', () => {
    expect(
      esDiagonalmenteDominante([
        [10, -1, 2],
        [1, 10, -1],
        [2, -1, 10],
      ]),
    ).toBeTrue();
    expect(
      esDiagonalmenteDominante([
        [1, 2],
        [3, 1],
      ]),
    ).toBeFalse();
  });

  it('calcula el residuo máximo', () => {
    const r = residuoMaximo(
      [
        [2, 1],
        [1, -1],
      ],
      [3, 0],
      [1, 1],
    );
    expect(r).toBeLessThan(1e-12);
  });

  it('muestra errores chicos en notación científica, no como 0', () => {
    expect(formatearNumero(4.6253e-7)).toBe('4.6253e-7');
    expect(formatearNumero(0)).toBe('0');
    expect(formatearNumero(1.5)).toBe('1.5');
  });
});

describe('rango del gráfico de convergencia', () => {
  it('incluye la última iteración en el eje x', () => {
    expect(rangoConvergencia([{ k: 1 }, { k: 6 }])).toEqual({ min: 0, max: 6 });
  });
});
