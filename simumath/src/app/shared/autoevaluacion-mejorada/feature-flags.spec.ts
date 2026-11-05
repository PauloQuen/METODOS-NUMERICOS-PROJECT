import { FLAG_AUTOEVALUACION, resolverFlag } from './feature-flags';

describe('resolverFlag', () => {
  const contexto = {
    moduloId: 'modulo3',
    tipoId: 'interpolacion',
    metodoId: 'lagrange',
  };

  it('el módulo enciende a sus métodos', () => {
    expect(resolverFlag({ global: false, modulos: { modulo3: true } }, contexto)).toBeTrue();
  });

  it('el tipo apaga lo que el módulo encendió', () => {
    const config = {
      global: false,
      modulos: { modulo3: true },
      tipos: { 'modulo3/interpolacion': false },
    };
    expect(resolverFlag(config, contexto)).toBeFalse();
  });

  it('el método gana sobre el tipo y el módulo', () => {
    const config = {
      global: false,
      modulos: { modulo3: true },
      tipos: { 'modulo3/interpolacion': false },
      metodos: { 'modulo3/interpolacion/lagrange': true },
    };
    expect(resolverFlag(config, contexto)).toBeTrue();
  });

  it('sin coincidencias usa el valor global', () => {
    expect(resolverFlag({ global: true }, contexto)).toBeTrue();
    expect(resolverFlag({}, contexto)).toBeFalse();
  });

  it('la configuración del portal enciende los Módulos 1, 2 y 3', () => {
    expect(resolverFlag(FLAG_AUTOEVALUACION, contexto)).toBeTrue();
    expect(
      resolverFlag(FLAG_AUTOEVALUACION, {
        moduloId: 'modulo1',
        tipoId: 'cerrados',
        metodoId: 'biseccion',
      }),
    ).toBeTrue();
    expect(
      resolverFlag(FLAG_AUTOEVALUACION, {
        moduloId: 'modulo2',
        tipoId: 'directos',
        metodoId: 'gauss',
      }),
    ).toBeTrue();
    expect(
      resolverFlag(FLAG_AUTOEVALUACION, {
        moduloId: 'modulo9',
        tipoId: 'otro',
        metodoId: 'desconocido',
      }),
    ).toBeFalse();
  });
});
