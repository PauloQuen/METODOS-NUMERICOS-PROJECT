import { CuestionarioEstrictoService } from './cuestionario-estricto.service';
import { puedeVerSolucionEstricto } from './gate-estricto';
import {
  ResultadoEjercicioService,
  claveResultado,
} from './resultado-ejercicio.service';

describe('gate estricto de M4 y M5', () => {
  const base = {
    totalPreguntas: 3,
    aciertos: 3,
    comprobado: true,
    resultadoEnviado: true,
  };

  it('solo abre con varias preguntas, todas correctas, comprobadas y resultado enviado', () => {
    expect(puedeVerSolucionEstricto(base)).toBeTrue();
    expect(puedeVerSolucionEstricto({ ...base, totalPreguntas: 0 })).toBeFalse();
    expect(puedeVerSolucionEstricto({ ...base, comprobado: false })).toBeFalse();
    expect(puedeVerSolucionEstricto({ ...base, aciertos: 2 })).toBeFalse();
    expect(puedeVerSolucionEstricto({ ...base, resultadoEnviado: false })).toBeFalse();
  });

  it('no tiene atajo por respuesta verificada ni por rendirse', () => {
    // El gate no consume `respuestaCorrecta` ni `verSolucionForzado`:
    // esos campos viven en el gate compartido de M0–M3 y acá no se leen.
    expect(Object.keys(base).sort()).toEqual([
      'aciertos',
      'comprobado',
      'resultadoEnviado',
      'totalPreguntas',
    ]);
  });
});

describe('CuestionarioEstrictoService', () => {
  let servicio: CuestionarioEstrictoService;

  beforeEach(() => {
    servicio = new CuestionarioEstrictoService();
  });

  it('guarda respuestas por ejercicio y deshace la comprobación al cambiar una', () => {
    const a = 'modulo4/newton-cotes/trapecio/tr-ej-num-1';
    const b = 'modulo4/newton-cotes/simpson/si-ej-num-1';

    servicio.responder(a, 'q1', 'b');
    servicio.responder(a, 'q2', 'a');
    servicio.comprobar(a);
    expect(servicio.estado(a).comprobado).toBeTrue();
    expect(servicio.estado(a).respuestas).toEqual({ q1: 'b', q2: 'a' });

    servicio.responder(a, 'q2', 'c');
    expect(servicio.estado(a).comprobado).toBeFalse();
    expect(servicio.estado(b).respuestas).toEqual({});
  });

  it('abre y cierra cada panel por separado, sin tocar respuestas ni comprobación', () => {
    const clave = 'modulo4/newton-cotes/trapecio/tr-ej-num-1';
    servicio.responder(clave, 'q1', 'a');
    servicio.comprobar(clave);

    expect(servicio.estado(clave).cuestionarioAbierto).toBeFalse();
    expect(servicio.estado(clave).resultadoAbierto).toBeFalse();

    servicio.alternarPanel(clave, 'cuestionario');
    expect(servicio.estado(clave).cuestionarioAbierto).toBeTrue();
    expect(servicio.estado(clave).resultadoAbierto).toBeFalse();

    servicio.alternarPanel(clave, 'resultado');
    expect(servicio.estado(clave).resultadoAbierto).toBeTrue();
    expect(servicio.estado(clave).cuestionarioAbierto).toBeTrue();
    expect(servicio.estado(clave).comprobado).toBeTrue();
    expect(servicio.estado(clave).respuestas).toEqual({ q1: 'a' });

    servicio.alternarPanel(clave, 'resultado');
    expect(servicio.estado(clave).resultadoAbierto).toBeFalse();
  });
});

describe('ResultadoEjercicioService', () => {
  let servicio: ResultadoEjercicioService;

  beforeEach(() => {
    servicio = new ResultadoEjercicioService();
  });

  it('escribe y/o guarda un archivo sin marcarlo como enviado', () => {
    const clave = claveResultado('modulo4', 'newton-cotes', 'trapecio', 'tr-ej-num-1');
    servicio.cambiarTexto(clave, '0,34375');
    expect(servicio.estado(clave).enviado).toBeFalse();
    expect(servicio.estado(clave).texto).toBe('0,34375');

    const archivo = new File(['contenido'], 'resolucion.pdf', { type: 'application/pdf' });
    servicio.cambiarArchivo(clave, archivo);
    expect(servicio.estado(clave).enviado).toBeFalse();
    expect(servicio.estado(clave).archivo).toBe(archivo);
    expect(servicio.estado(clave).archivoNombre).toBe('resolucion.pdf');
  });

  it('marcar vacío no cuenta como enviado', () => {
    const clave = claveResultado('modulo5', 'edo-clasicos', 'euler', 'eu-ej-1');
    servicio.marcarEnviado(clave);
    expect(servicio.estado(clave).enviado).toBeFalse();
  });

  it('marcar con texto o archivo sí cuenta, y editar después lo deshace', () => {
    const clave = claveResultado('modulo5', 'edo-clasicos', 'rk4', 'rk-ej-1');
    servicio.cambiarTexto(clave, '1,105');
    servicio.marcarEnviado(clave);
    expect(servicio.estado(clave).enviado).toBeTrue();

    servicio.cambiarTexto(clave, 'otro valor');
    expect(servicio.estado(clave).enviado).toBeFalse();

    servicio.marcarEnviado(clave);
    servicio.cambiarArchivo(clave, new File(['x'], 'hoja.png', { type: 'image/png' }));
    expect(servicio.estado(clave).enviado).toBeFalse();
  });

  it('clavea por módulo/tipo/método/ejercicio sin colisionar con M3', () => {
    const m3 = claveResultado('modulo3', 'interpolacion', 'lagrange', 'q1');
    const m4 = claveResultado('modulo4', 'newton-cotes', 'trapecio', 'q1');
    expect(m3).not.toBe(m4);

    servicio.cambiarTexto(m3, 'de M3');
    expect(servicio.estado(m4).texto).toBe('');
    expect(servicio.estado(m4).enviado).toBeFalse();
  });
});
