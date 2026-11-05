import type { RecursoFuente, RecursoProfundizacion, RecursoVideo } from '../../../shared/recursos/recursos-section';

export interface ModuloRecursos {
  videos: RecursoVideo[];
  fuentes: RecursoFuente[];
  profundizacion: RecursoProfundizacion[];
}

export const RECURSOS_MODULO1: ModuloRecursos = {
  videos: [
    {
      id: 'm1-v1',
      titulo: 'Método de Bisección - Concepto y algoritmo',
      canal: 'Canal educativo (referencia)',
      duracion: 'Pendiente',
      descripcion: 'Idea de encierro, cambio de signo y convergencia.',
      estado: 'pendiente',
    },
    {
      id: 'm1-v2',
      titulo: 'Newton-Raphson - Derivación y ejemplos',
      canal: 'Canal educativo (referencia)',
      duracion: 'Pendiente',
      descripcion: 'Tangente, convergencia cuadrática y casos problemáticos.',
      estado: 'pendiente',
    },
  ],
  fuentes: [
    {
      id: 'm1-f1',
      titulo: 'Análisis Numérico',
      autor: 'Burden & Faires',
      tipo: 'libro',
      estado: 'pendiente',
    },
    {
      id: 'm1-f2',
      titulo: 'Métodos Numéricos para Ingenieros',
      autor: 'Chapra & Canale',
      tipo: 'libro',
      estado: 'pendiente',
    },
    {
      id: 'm1-f3',
      titulo: 'Numerical Methods (MIT OCW)',
      entidad: 'MIT OpenCourseWare',
      tipo: 'web',
      url: 'https://ocw.mit.edu/',
      estado: 'ok',
    },
  ],
  profundizacion: [
    {
      id: 'm1-p1',
      texto: 'Revisar teoría de errores en el portal',
      ruta: '/modulo1/teoria',
      estado: 'ok',
    },
    {
      id: 'm1-p2',
      texto: 'Practicar con la calculadora de Bisección',
      ruta: '/modulo1/calculadoras',
      estado: 'ok',
    },
  ],
};
