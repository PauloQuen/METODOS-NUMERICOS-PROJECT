import { TrapecioService } from './trapecio.service';

/**
 * Tests del pegamento del trapecio: texto del alumno → función compilada
 * → tabla formateada → respuesta de la calculadora. Es el camino que usa
 * la pestaña Calculadora, así que un error acá no lo cubre el spec del
 * algoritmo.
 */
describe('TrapecioService', () => {
  it('calcula x² en [0, 1] con n = 4 desde texto', () => {
    const servicio = new TrapecioService();
    const estado = servicio.calcularDesdeTexto({
      funcion: 'x^2',
      a: '0',
      b: '1',
      n: '4',
    });

    expect(estado.respuesta.exito).toBe(true);
    expect(estado.filas.length).toBe(6);
    expect(estado.filas[5]['i']).toBe('Σ');
    expect(estado.filas[0]['xi']).toBe('0.000000');
    expect(estado.integral).toBeCloseTo(0.34375, 12);
    expect(estado.respuesta.resultado).toBe('0.343750');
    expect(estado.respuesta.conclusion).toContain('n = 4');
  });

  it('mide el error si se ingresa el valor exacto', () => {
    const servicio = new TrapecioService();
    const estado = servicio.calcularDesdeTexto({
      funcion: 'x^2',
      a: '0',
      b: '1',
      n: '4',
      valorExacto: '0.3333333333',
    });

    expect(estado.errorAbs).toBeCloseTo(0.0104167, 6);
    expect(estado.respuesta.etiquetaBondad).toBe('Error absoluto');
  });

  it('devuelve un mensaje claro si la función no se entiende', () => {
    const servicio = new TrapecioService();
    const estado = servicio.calcularDesdeTexto({
      funcion: 'x^',
      a: '0',
      b: '1',
      n: '4',
    });

    expect(estado.filas).toEqual([]);
    expect(estado.respuesta.exito).toBe(false);
    expect(estado.respuesta.conclusion.length).toBeGreaterThan(0);
  });

  it('devuelve un mensaje claro si n no es un entero válido', () => {
    const servicio = new TrapecioService();
    const estado = servicio.calcularDesdeTexto({
      funcion: 'x^2',
      a: '0',
      b: '1',
      n: '2.5',
    });

    expect(estado.respuesta.exito).toBe(false);
    expect(estado.respuesta.conclusion).toContain('entero');
  });

  it('guarda el último resultado y lo borra con limpiar()', () => {
    const servicio = new TrapecioService();
    servicio.calcularDesdeTexto({ funcion: 'x^2', a: '0', b: '1', n: '4' });

    expect(servicio.resultado()).not.toBeNull();
    servicio.limpiar();
    expect(servicio.resultado()).toBeNull();
  });
});
