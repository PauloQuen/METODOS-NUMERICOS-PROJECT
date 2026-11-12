import {
  FAMILIAS_MODULO0,
  METODOS_MODULO0,
  metodoModulo0,
  metodosDeFamiliaModulo0,
  rutaDeFamiliaModulo0,
  rutaDeMetodoModulo0,
  validarRegistroModulo0,
} from './registro-modulo0';

/**
 * Red de seguridad del registro del Módulo 0. Si alguien agrega un
 * método sin familia, repite una ruta o rompe el kebab-case, estos tests
 * lo muestran antes de que el router falle.
 */
describe('registro del Módulo 0', () => {
  it('no tiene problemas de integridad', () => {
    expect(validarRegistroModulo0()).toEqual([]);
  });

  it('declara cuatro familias y cuatro métodos, uno por familia', () => {
    expect(FAMILIAS_MODULO0.length).toBe(4);
    expect(METODOS_MODULO0.length).toBe(4);

    for (const familia of FAMILIAS_MODULO0) {
      expect(metodosDeFamiliaModulo0(familia.key).length).toBe(1);
    }
  });

  it('no repite keys ni rutas', () => {
    const keys = METODOS_MODULO0.map((m) => m.key);
    const rutas = METODOS_MODULO0.map((m) => m.ruta);

    expect(new Set(keys).size).toBe(keys.length);
    expect(new Set(rutas).size).toBe(rutas.length);
  });

  it('deriva las rutas de familia y de método', () => {
    const cifras = metodoModulo0('cifras-significativas');
    const taylor = metodoModulo0('taylor');

    expect(rutaDeFamiliaModulo0('aritmetica')).toBe('/modulo0/tipos/aritmetica');
    expect(rutaDeMetodoModulo0(cifras)).toBe(
      '/modulo0/tipos/aritmetica/cifras-significativas/teoria',
    );
    expect(rutaDeMetodoModulo0(taylor)).toBe('/modulo0/tipos/truncamiento/taylor/teoria');
  });

  it('cada método tiene una idea, una fórmula y un criterio visibles', () => {
    for (const metodo of METODOS_MODULO0) {
      expect(metodo.nombre.length).toBeGreaterThan(5);
      expect(metodo.idea.length).toBeGreaterThan(20);
      expect(metodo.formula.length).toBeGreaterThan(5);
      expect(metodo.criterioTexto.length).toBeGreaterThan(20);
      expect(metodo.color).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });

  it('falla con un método que no existe', () => {
    expect(() => metodoModulo0('inexistente' as never)).toThrowError(/no registrado/);
  });
});
