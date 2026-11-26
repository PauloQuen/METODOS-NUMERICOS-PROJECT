import {
  FAMILIAS_MODULO4,
  METODOS_MODULO4,
  metodoModulo4,
  metodosDeFamiliaModulo4,
  rutaDeFamiliaModulo4,
  rutaDeMetodoModulo4,
  validarRegistroModulo4,
} from './registro-modulo4';

/**
 * Red de seguridad del registro del Módulo 4: keys y rutas únicas,
 * familia con métodos y URLs derivadas correctamente.
 */
describe('registro del Módulo 4', () => {
  it('no tiene problemas de integridad', () => {
    expect(validarRegistroModulo4()).toEqual([]);
  });

  it('no repite keys ni rutas', () => {
    const keys = METODOS_MODULO4.map((m) => m.key);
    const rutas = METODOS_MODULO4.map((m) => m.ruta);

    expect(new Set(keys).size).toBe(keys.length);
    expect(new Set(rutas).size).toBe(rutas.length);
  });

  it('la familia Newton-Cotes contiene trapecio y Simpson, en ese orden', () => {
    expect(FAMILIAS_MODULO4.map((f) => f.key)).toEqual(['newton-cotes']);
    expect(metodosDeFamiliaModulo4('newton-cotes').map((m) => m.key)).toEqual([
      'trapecio',
      'simpson',
    ]);
  });

  it('deriva las rutas desde la familia y el nombre del método', () => {
    const trapecio = metodoModulo4('trapecio');

    expect(rutaDeFamiliaModulo4('newton-cotes')).toBe('/modulo4/tipos/newton-cotes');
    expect(rutaDeMetodoModulo4(trapecio)).toBe(
      '/modulo4/tipos/newton-cotes/trapecio/teoria',
    );
  });
});
