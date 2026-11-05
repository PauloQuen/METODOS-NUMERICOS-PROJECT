import {
  POLITICA_POR_DEFECTO,
  claveDeGate,
  resolverConfig,
} from './solution-gate.service';

/**
 * La política se hereda: global → módulo → tipo → método → ejercicio.
 * Cada campo definido pisa al anterior; los que faltan conservan el
 * valor heredado.
 */
describe('resolverConfig', () => {
  it('sin niveles devuelve la política por defecto', () => {
    expect(resolverConfig([])).toEqual(POLITICA_POR_DEFECTO);
  });

  it('el módulo pisa al global y el ejercicio pisa al método', () => {
    const config = resolverConfig([
      { politica: 'cuestionario', umbralCuestionario: 0.5 },
      { umbralCuestionario: 0.75 },
      { politica: 'ambos' },
      { intentosParaRendirse: 5 },
      { politica: 'respuesta' },
    ]);

    expect(config).toEqual({
      politica: 'respuesta',
      umbralCuestionario: 0.75,
      intentosParaRendirse: 5,
    });
  });

  it('un nivel vacío no borra lo heredado', () => {
    const config = resolverConfig([
      { politica: 'ambos', umbralCuestionario: 0.8, intentosParaRendirse: 4 },
      {},
      {},
    ]);

    expect(config).toEqual({
      politica: 'ambos',
      umbralCuestionario: 0.8,
      intentosParaRendirse: 4,
    });
  });
});

describe('claveDeGate', () => {
  it('incluye módulo, tipo, método y ejercicio para no mezclar estados', () => {
    expect(claveDeGate('modulo3', 'interpolacion', 'lagrange', 'ej-1')).toBe(
      'modulo3/interpolacion/lagrange/ej-1',
    );
    expect(claveDeGate('modulo3', 'interpolacion', 'lagrange', 'ej-1')).not.toBe(
      claveDeGate('modulo3', 'interpolacion', 'lagrange-nuevo', 'ej-1'),
    );
  });
});
