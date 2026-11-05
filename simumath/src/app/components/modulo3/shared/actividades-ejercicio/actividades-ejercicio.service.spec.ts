import {
  ActividadesEjercicioService,
  evaluarResolucion,
} from './actividades-ejercicio.service';

/**
 * Tests de la lógica pura de las actividades: comparación del resultado
 * (con coma o punto) y estado del acordeón. No montan componentes.
 */
describe('evaluarResolucion', () => {
  it('acepta coma y punto decimal, y espacios alrededor', () => {
    expect(evaluarResolucion(' 2,325 ', 2.325, 0.01).estado).toBe('acierto');
    expect(evaluarResolucion('2.325', 2.325, 0.01).estado).toBe('acierto');
    expect(evaluarResolucion('-0,5', -0.5, 0.01).estado).toBe('acierto');
  });

  it('marca acierto dentro de la tolerancia', () => {
    expect(evaluarResolucion('2.33', 2.325, 0.01).estado).toBe('acierto');
    expect(evaluarResolucion('2.32', 2.325, 0.01).estado).toBe('acierto');
  });

  it('marca casi cuando el error relativo no supera el 5 %', () => {
    expect(evaluarResolucion('2.4', 2.325, 0.01).estado).toBe('casi');
  });

  it('marca incorrecto cuando se aleja más del 5 %', () => {
    expect(evaluarResolucion('2.5', 2.325, 0.01).estado).toBe('incorrecto');
  });

  it('marca inválido un texto que no es un número', () => {
    expect(evaluarResolucion('', 2.325, 0.01).estado).toBe('invalido');
    expect(evaluarResolucion('2,3,4', 2.325, 0.01).estado).toBe('invalido');
    expect(evaluarResolucion('2 m', 2.325, 0.01).estado).toBe('invalido');
    expect(evaluarResolucion('abc', 2.325, 0.01).estado).toBe('invalido');
  });
});

describe('ActividadesEjercicioService', () => {
  it('mantiene un solo panel abierto y lo cierra al repetir el botón', () => {
    const servicio = new ActividadesEjercicioService();

    servicio.alternarPanel('ejercicio-1', 'cuestionario');
    expect(servicio.estadoDe('ejercicio-1').panel).toBe('cuestionario');

    servicio.alternarPanel('ejercicio-1', 'resolucion');
    expect(servicio.estadoDe('ejercicio-1').panel).toBe('resolucion');

    servicio.alternarPanel('ejercicio-1', 'resolucion');
    expect(servicio.estadoDe('ejercicio-1').panel).toBeNull();
  });

  it('conserva respuestas y verificación por ejercicio', () => {
    const servicio = new ActividadesEjercicioService();

    servicio.responder('ejercicio-1', 'base', 'b');
    servicio.comprobar('ejercicio-1');
    servicio.actualizarEntrada('ejercicio-1', '1,78125');

    expect(servicio.estadoDe('ejercicio-1').respuestas['base']).toBe('b');
    expect(servicio.estadoDe('ejercicio-1').comprobado).toBeTrue();
    expect(servicio.estadoDe('ejercicio-1').entrada).toBe('1,78125');

    // Otro id arranca limpio.
    expect(servicio.estadoDe('ejercicio-2').panel).toBeNull();
    expect(servicio.estadoDe('ejercicio-2').comprobado).toBeFalse();
  });
});
