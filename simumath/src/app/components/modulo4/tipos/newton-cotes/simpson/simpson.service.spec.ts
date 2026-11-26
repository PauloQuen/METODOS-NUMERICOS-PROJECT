import { SimpsonService } from './simpson.service';

/**
 * Tests del pegamento de Simpson: texto del alumno → función compilada
 * → tabla con coeficientes 1-4-2-4-1 → respuesta de la calculadora.
 */
describe('SimpsonService', () => {
  it('calcula x² en [0, 1] de forma exacta con n = 4', () => {
    const servicio = new SimpsonService();
    const estado = servicio.calcularDesdeTexto({
      funcion: 'x^2',
      a: '0',
      b: '1',
      n: '4',
    });

    expect(estado.respuesta.exito).toBe(true);
    expect(estado.integral).toBeCloseTo(1 / 3, 12);
    expect(estado.filas.map((f) => f['coef']).slice(0, 5)).toEqual([1, 4, 2, 4, 1]);
    expect(estado.respuesta.resultado).toBe('0.333333');
  });

  it('rechaza n impar con un mensaje accionable', () => {
    const servicio = new SimpsonService();
    const estado = servicio.calcularDesdeTexto({
      funcion: 'x^2',
      a: '0',
      b: '1',
      n: '5',
    });

    expect(estado.filas).toEqual([]);
    expect(estado.respuesta.exito).toBe(false);
    expect(estado.respuesta.conclusion).toContain('PAR');
    expect(estado.respuesta.conclusion).toContain('4');
  });

  it('devuelve un mensaje claro si la función no se entiende', () => {
    const servicio = new SimpsonService();
    const estado = servicio.calcularDesdeTexto({
      funcion: 'sin(',
      a: '0',
      b: '1',
      n: '4',
    });

    expect(estado.respuesta.exito).toBe(false);
    expect(estado.respuesta.conclusion.length).toBeGreaterThan(0);
  });

  it('guarda el último resultado y lo borra con limpiar()', () => {
    const servicio = new SimpsonService();
    servicio.calcularDesdeTexto({ funcion: 'x^2', a: '0', b: '1', n: '4' });

    expect(servicio.resultado()).not.toBeNull();
    servicio.limpiar();
    expect(servicio.resultado()).toBeNull();
  });
});
