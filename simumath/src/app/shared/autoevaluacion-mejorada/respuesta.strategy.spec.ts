import { evaluarRespuesta, leerNumero } from './respuesta.strategy';

/**
 * Tests de la capa única de verificación. No montan componentes: son
 * funciones puras, así que se prueban por formato y con los casos que
 * el alumno escribe de verdad (coma decimal, espacios, corchetes).
 */
describe('respuesta.strategy', () => {
  it('lee números con coma o punto y rechaza unidades', () => {
    expect(leerNumero(' 1,78125 ')).toBe(1.78125);
    expect(leerNumero('2.5')).toBe(2.5);
    expect(leerNumero('-0,5')).toBe(-0.5);
    expect(leerNumero('1/2')).toBeNull();
    expect(leerNumero('2 m')).toBeNull();
    expect(leerNumero('1,2,3')).toBeNull();
  });

  it('escalar: acierto, casi e incorrecto', () => {
    const spec = { formato: 'escalar' as const, valorCorrecto: 2.325, tolerancia: 0.01 };
    expect(evaluarRespuesta('2,33', spec).estado).toBe('acierto');
    expect(evaluarRespuesta('2.4', spec).estado).toBe('casi');
    expect(evaluarRespuesta('2.5', spec).estado).toBe('incorrecto');
    expect(evaluarRespuesta('', spec).estado).toBe('invalido');
  });

  it('entero: solo acepta la igualdad exacta', () => {
    const spec = { formato: 'entero' as const, valorCorrecto: 10 };
    expect(evaluarRespuesta('10', spec).estado).toBe('acierto');
    expect(evaluarRespuesta(' 10 ', spec).estado).toBe('acierto');
    expect(evaluarRespuesta('10.0', spec).estado).toBe('invalido');
    expect(evaluarRespuesta('11', spec).estado).toBe('incorrecto');
  });

  it('vector: componentes con punto y coma y tolerancia por componente', () => {
    const spec = { formato: 'vector' as const, valorCorrecto: [2, 3], tolerancia: 0.01 };
    expect(evaluarRespuesta('2; 3', spec).estado).toBe('acierto');
    expect(evaluarRespuesta('(2; 3)', spec).estado).toBe('acierto');
    expect(evaluarRespuesta('2,0; 3,0', spec).estado).toBe('acierto');
    expect(evaluarRespuesta('2; 3.5', spec).estado).toBe('incorrecto');
    expect(evaluarRespuesta('2', spec).estado).toBe('incorrecto');
  });

  it('matriz: filas con punto y coma, columnas con espacios', () => {
    const spec = {
      formato: 'matriz' as const,
      valorCorrecto: [
        [1, 2],
        [3, 4],
      ],
      tolerancia: 0.01,
    };
    expect(evaluarRespuesta('1 2; 3 4', spec).estado).toBe('acierto');
    expect(evaluarRespuesta('[1,0 2,0; 3,0 4,0]', spec).estado).toBe('acierto');
    expect(evaluarRespuesta('1 2; 3 5', spec).estado).toBe('incorrecto');
    expect(evaluarRespuesta('1 2; 3', spec).estado).toBe('incorrecto');
  });

  it('polinomio: coeficientes de menor a mayor grado y ceros de cola', () => {
    const spec = {
      formato: 'polinomio' as const,
      valorCorrecto: [-0.5, 0.928571, 0],
      tolerancia: 0.01,
    };
    expect(evaluarRespuesta('-0,5; 0,928571', spec).estado).toBe('acierto');
    expect(evaluarRespuesta('-0.5; 0.93', spec).estado).toBe('acierto');
    expect(evaluarRespuesta('0,5; 0,928571', spec).estado).toBe('incorrecto');
  });

  it('polinomio: acepta una forma equivalente evaluada en puntos de prueba', () => {
    const spec = {
      formato: 'polinomio' as const,
      valorCorrecto: [1, 2],
      tolerancia: 0.01,
      puntosPrueba: [0, 1, 2],
    };
    // 1 + 2x escrito como 1 + 2x + 0x² ya coincide por coeficientes.
    expect(evaluarRespuesta('1; 2; 0', spec).estado).toBe('acierto');
    // Un polinomio distinto no pasa.
    expect(evaluarRespuesta('1; 3', spec).estado).toBe('incorrecto');
  });

  it('error: compara de forma relativa', () => {
    const spec = { formato: 'error' as const, valorCorrecto: 0.00092, tolerancia: 0.01 };
    expect(evaluarRespuesta('0,00092', spec).estado).toBe('acierto');
    expect(evaluarRespuesta('0.00093', spec).estado).toBe('casi');
    expect(evaluarRespuesta('0,001', spec).estado).toBe('incorrecto');
  });
});
