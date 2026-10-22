import {
  FAMILIAS_MODULO2,
  METODOS_MODULO2,
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
    const keys = METODOS_MODULO2.map((m) => m.key);
    const rutas = METODOS_MODULO2.map((m) => `${m.familia}/${m.ruta}`);
    expect(new Set(keys).size).toBe(keys.length);
    expect(new Set(rutas).size).toBe(rutas.length);
  });

  it('cada familia tiene al menos un método', () => {
    for (const f of FAMILIAS_MODULO2) {
      expect(metodosDeFamiliaModulo2(f.key).length).toBeGreaterThan(0);
    }
  });

  it('directos contiene Gauss y iterativos contiene matrices especiales', () => {
    expect(metodosDeFamiliaModulo2('directos').map((m) => m.key)).toEqual([
      'eliminacion-gauss',
    ]);
    expect(metodosDeFamiliaModulo2('iterativos').map((m) => m.key)).toEqual([
      'matrices-especiales',
    ]);
  });

  it('deriva las rutas de familia y de método', () => {
    expect(rutaDeFamiliaModulo2('directos')).toBe('/modulo2/tipos/directos');
    expect(rutaDeMetodoModulo2(metodoModulo2('eliminacion-gauss'))).toBe(
      '/modulo2/tipos/directos/eliminacion-gauss/teoria',
    );
    expect(rutaDeMetodoModulo2(metodoModulo2('matrices-especiales'))).toBe(
      '/modulo2/tipos/iterativos/matrices-especiales/teoria',
    );
  });
});
