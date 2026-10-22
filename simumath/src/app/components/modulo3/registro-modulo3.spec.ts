import {
  FAMILIAS_MODULO3,
  METODOS_MODULO3,
  metodoModulo3,
  metodosDeFamiliaModulo3,
  rutaDeFamiliaModulo3,
  rutaDeMetodoModulo3,
  validarRegistroModulo3,
} from './registro-modulo3';

/**
 * Red de seguridad del registro del Módulo 3: keys y rutas únicas,
 * familias con métodos y URLs derivadas correctamente.
 */
describe('registro del Módulo 3', () => {
  it('no tiene problemas de integridad', () => {
    expect(validarRegistroModulo3()).toEqual([]);
  });

  it('no repite keys ni rutas', () => {
    const keys = METODOS_MODULO3.map((m) => m.key);
    const rutas = METODOS_MODULO3.map((m) => m.ruta);

    expect(new Set(keys).size).toBe(keys.length);
    expect(new Set(rutas).size).toBe(rutas.length);
  });

  it('cada familia declarada tiene al menos un método', () => {
    for (const f of FAMILIAS_MODULO3) {
      expect(metodosDeFamiliaModulo3(f.key).length).toBeGreaterThan(0);
    }
  });

  it('la familia de interpolación contiene a Lagrange y la de ajuste a mínimos cuadrados', () => {
    expect(metodosDeFamiliaModulo3('interpolacion').map((m) => m.key)).toEqual(['lagrange']);
    expect(metodosDeFamiliaModulo3('ajuste').map((m) => m.key)).toEqual(['minimos-cuadrados']);
  });

  it('deriva las rutas desde la familia y el nombre del método', () => {
    const lagrange = metodoModulo3('lagrange');
    const minimos = metodoModulo3('minimos-cuadrados');

    expect(rutaDeFamiliaModulo3('interpolacion')).toBe('/modulo3/tipos/interpolacion');
    expect(rutaDeMetodoModulo3(lagrange)).toBe(
      '/modulo3/tipos/interpolacion/lagrange/teoria',
    );
    expect(rutaDeMetodoModulo3(minimos)).toBe('/modulo3/tipos/ajuste/minimos-cuadrados/teoria');
  });
});
