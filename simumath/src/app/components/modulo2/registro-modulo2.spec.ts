import {
  FAMILIAS_MODULO2,
  REGISTRO_MODULO2,
  metodoModulo2,
  metodosDeFamiliaModulo2,
  rutaDeFamiliaModulo2,
  rutaDeMetodoModulo2,
  validarRegistroModulo2,
} from './registro-modulo2';

describe('registro del Módulo 2', () => {
  it('no tiene problemas de integridad', () => {
    expect(validarRegistroModulo2()).toEqual([]);
  });

  it('no repite keys ni rutas', () => {
    const keys = REGISTRO_MODULO2.map((m) => m.key);
    const rutas = REGISTRO_MODULO2.map((m) => `${m.familia}/${m.ruta}`);
    expect(new Set(keys).size).toBe(keys.length);
    expect(new Set(rutas).size).toBe(rutas.length);
  });

  it('cada familia tiene al menos un método', () => {
    for (const f of FAMILIAS_MODULO2) {
      expect(metodosDeFamiliaModulo2(f.key).length).toBeGreaterThan(0);
    }
  });

  it('clasifica los cuatro métodos implementados en sus familias', () => {
    expect(metodosDeFamiliaModulo2('directos').map((m) => m.key)).toEqual([
      'gauss', 'lu',
    ]);
    expect(metodosDeFamiliaModulo2('iterativos').map((m) => m.key)).toEqual([
      'jacobi', 'gaussSeidel',
    ]);
    expect(REGISTRO_MODULO2.every(m => m.estado === 'implementado')).toBeTrue();
  });

  it('deriva las rutas de familia y de método', () => {
    expect(rutaDeFamiliaModulo2('directos')).toBe('/modulo2/tipos/directos');
    expect(rutaDeMetodoModulo2(metodoModulo2('gauss'))).toBe(
      '/modulo2/tipos/directos/gauss/teoria',
    );
    expect(rutaDeMetodoModulo2(metodoModulo2('jacobi'))).toBe(
      '/modulo2/tipos/iterativos/jacobi/teoria',
    );
    expect(rutaDeMetodoModulo2(metodoModulo2('gaussSeidel'))).toBe('/modulo2/tipos/iterativos/gauss-seidel/teoria');
  });
});
