import katex from 'katex';
import { MODULOS, moduloPorId } from '../../shared/search/catalogo';
import {
  FAMILIAS_MODULO5,
  METODOS_MODULO5,
  metodoModulo5,
  metodosDeFamiliaModulo5,
  rutaDeFamiliaModulo5,
  rutaDeMetodoModulo5,
  validarRegistroModulo5,
} from './registro-modulo5';

/**
 * Red de seguridad de la integración del Módulo 5: el registro es la fuente
 * de verdad y el catálogo (home + buscador) debe derivar de él.
 */
describe('registro del Módulo 5', () => {
  it('no tiene problemas de integridad', () => {
    expect(validarRegistroModulo5()).toEqual([]);
  });

  it('declara una sola familia con Euler y RK4', () => {
    expect(FAMILIAS_MODULO5.map((f) => f.key)).toEqual(['edo-clasicos']);
    expect(metodosDeFamiliaModulo5('edo-clasicos').map((m) => m.key)).toEqual(['euler', 'rk4']);
    expect(METODOS_MODULO5.map((m) => m.nombre)).not.toContain('Heun');
  });

  it('deriva las rutas desde la familia y el nombre del método', () => {
    expect(rutaDeFamiliaModulo5('edo-clasicos')).toBe('/modulo5/tipos/edo-clasicos');
    expect(rutaDeMetodoModulo5(metodoModulo5('euler'))).toBe(
      '/modulo5/tipos/edo-clasicos/euler/teoria',
    );
    expect(rutaDeMetodoModulo5(metodoModulo5('rk4'))).toBe(
      '/modulo5/tipos/edo-clasicos/rk4/teoria',
    );
  });

  it('renderiza con KaTeX las fórmulas del registro', () => {
    for (const m of METODOS_MODULO5) {
      expect(m.formulaTex).withContext(m.key).toBeDefined();
      expect(() =>
        katex.renderToString(m.formulaTex!, { throwOnError: true, strict: 'ignore' }),
      )
        .withContext(m.key)
        .not.toThrow();
    }
  });

  it('publica el módulo en home y buscador, sin métodos no implementados', () => {
    const modulo = moduloPorId('modulo5');
    expect(modulo).toBeDefined();
    expect(modulo!.estado).toBe('disponible');
    expect(modulo!.ruta).toBe('/modulo5');
    expect(MODULOS.filter((m) => m.id === 'modulo5')).toHaveSize(1);

    const metodos = modulo!.familias.flatMap((f) => f.metodos);
    expect(metodos.map((m) => m.key)).toEqual(['euler', 'rk4']);
    for (const metodo of metodos) {
      expect(metodo.estado).toBe('disponible');
      expect(metodo.rutaBase).toContain('/modulo5/tipos/edo-clasicos/');
    }
    expect(JSON.stringify(modulo)).not.toContain('Heun');
  });
});
