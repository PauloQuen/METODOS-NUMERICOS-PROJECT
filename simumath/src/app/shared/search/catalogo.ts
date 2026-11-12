/**
 * CATÁLOGO DE MÓDULOS PARA LA BÚSQUEDA Y LA PORTADA.
 *
 * ── Qué es y qué no es ───────────────────────────────────────────────
 * NO es un registro paralelo: es una VISTA común de los registros que ya
 * existen (`REGISTRO` del M1, `REGISTRO_MODULO2`, `METODOS_MODULO3` y
 * `METODOS_MODULO0`). Las familias y los métodos se derivan de ellos, así
 * que agregar un método en su registro lo hace aparecer en el buscador y
 * en los accesos de la portada sin tocar este archivo.
 *
 * Lo único que se declara acá son los MÓDULOS como tales (nombre,
 * subtítulo, descripción, si está disponible) y el material transversal
 * que no vive dentro de un método: son datos de portada, no de método.
 *
 * ── Los módulos 4 y 5 ───────────────────────────────────────────────
 * Están anunciados en la portada anterior como "En desarrollo" y no
 * tienen ruta todavía. Su información no se borra: entra al índice con
 * `ruta: null` y el buscador la muestra como "En desarrollo", sin
 * prometer una página que no existe.
 */

import { FAMILIAS, REGISTRO } from '../domain/numerico/registro';
import {
  FAMILIAS_MODULO2 as FAMILIAS_M2,
  REGISTRO_MODULO2,
  rutaDeFamiliaModulo2,
} from '../../components/modulo2/registro-modulo2';
import {
  FAMILIAS_MODULO3 as FAMILIAS_M3,
  METODOS_MODULO3 as METODOS_M3,
  rutaDeFamiliaModulo3,
} from '../../components/modulo3/registro-modulo3';
import {
  FAMILIAS_MODULO0 as FAMILIAS_M0,
  METODOS_MODULO0 as METODOS_M0,
  rutaDeFamiliaModulo0,
} from '../../components/modulo0/registro-modulo0';

/* ------------------------------------------------------------------ */
/* Tipos                                                               */
/* ------------------------------------------------------------------ */

export type EstadoModulo = 'disponible' | 'planificado';

export interface MetodoCatalogo {
  key: string;
  nombre: string;
  familia: string;
  idea: string;
  formula: string;
  /** Ruta base de la página del método (sin pestaña), o null si no existe. */
  rutaBase: string | null;
  estado: EstadoModulo;
}

export interface FamiliaCatalogo {
  key: string;
  nombre: string;
  principio: string;
  descripcion: string;
  /** Ruta de la lista de métodos de la familia. */
  ruta: string | null;
  metodos: MetodoCatalogo[];
}

export interface SeccionCatalogo {
  id: string;
  titulo: string;
  descripcion: string;
  ruta: string | null;
  claves: string[];
}

export interface ModuloCatalogo {
  /** Identificador corto y estable: `modulo0`, `modulo1`… */
  id: string;
  /** Etiqueta visible: "Módulo 0". */
  etiqueta: string;
  nombre: string;
  subtitulo: string;
  descripcion: string;
  ruta: string | null;
  estado: EstadoModulo;
  familias: FamiliaCatalogo[];
  /** Material general que no pertenece a un método. */
  secciones: SeccionCatalogo[];
  /** Términos con los que la gente busca este módulo. */
  claves: string[];
}

/* ------------------------------------------------------------------ */
/* Módulo 1 — derivado de su registro                                  */
/* ------------------------------------------------------------------ */

const METODOS_MODULO1: MetodoCatalogo[] = REGISTRO.map((m) => ({
  key: m.key,
  nombre: m.nombre,
  familia: m.familia,
  idea: m.idea,
  formula: m.formula,
  rutaBase: `/modulo1/tipos/${m.familia}/${m.ruta}`,
  estado: m.estado === 'implementado' ? 'disponible' : 'planificado',
}));

const FAMILIAS_MODULO1: FamiliaCatalogo[] = FAMILIAS.map((f) => ({
  key: f.key,
  nombre: f.nombre,
  principio: f.principio,
  descripcion: f.descripcion,
  ruta: `/modulo1/tipos/${f.key}`,
  metodos: METODOS_MODULO1.filter((m) => m.familia === f.key),
}));

/* ------------------------------------------------------------------ */
/* Módulo 2                                                            */
/* ------------------------------------------------------------------ */

const METODOS_MODULO2: MetodoCatalogo[] = REGISTRO_MODULO2.map((m) => ({
  key: m.key,
  nombre: m.nombre,
  familia: m.familia,
  idea: m.idea,
  formula: m.formula,
  rutaBase: m.estado === 'implementado' ? rutaDeFamiliaModulo2(m.familia) + `/${m.ruta}` : null,
  estado: m.estado === 'implementado' ? 'disponible' : 'planificado',
}));

const CAT_FAMILIAS_M2: FamiliaCatalogo[] = FAMILIAS_M2.map((f) => ({
  key: f.key,
  nombre: f.nombre,
  principio: f.principio,
  descripcion: f.descripcion,
  ruta: rutaDeFamiliaModulo2(f.key),
  metodos: METODOS_MODULO2.filter((m) => m.familia === f.key),
}));

/* ------------------------------------------------------------------ */
/* Módulo 3                                                            */
/* ------------------------------------------------------------------ */

const CAT_METODOS_M3: MetodoCatalogo[] = METODOS_M3.map((m) => ({
  key: m.key,
  nombre: m.nombre,
  familia: m.familia,
  idea: m.idea,
  formula: m.formula,
  rutaBase: `${rutaDeFamiliaModulo3(m.familia)}/${m.ruta}`,
  estado: 'disponible',
}));

const CAT_FAMILIAS_M3: FamiliaCatalogo[] = FAMILIAS_M3.map((f) => ({
  key: f.key,
  nombre: f.nombre,
  principio: f.principio,
  descripcion: f.descripcion,
  ruta: rutaDeFamiliaModulo3(f.key),
  metodos: CAT_METODOS_M3.filter((m) => m.familia === f.key),
}));

/* ------------------------------------------------------------------ */
/* Módulo 0                                                            */
/* ------------------------------------------------------------------ */

const CAT_METODOS_M0: MetodoCatalogo[] = METODOS_M0.map((m) => ({
  key: m.key,
  nombre: m.nombre,
  familia: m.familia,
  idea: m.idea,
  formula: m.formula,
  rutaBase: `${rutaDeFamiliaModulo0(m.familia)}/${m.ruta}`,
  estado: 'disponible',
}));

const CAT_FAMILIAS_M0: FamiliaCatalogo[] = FAMILIAS_M0.map((f) => ({
  key: f.key,
  nombre: f.nombre,
  principio: f.principio,
  descripcion: f.descripcion,
  ruta: rutaDeFamiliaModulo0(f.key),
  metodos: CAT_METODOS_M0.filter((m) => m.familia === f.key),
}));

/* ------------------------------------------------------------------ */
/* Los módulos                                                         */
/* ------------------------------------------------------------------ */

export const MODULOS: readonly ModuloCatalogo[] = [
  {
    id: 'modulo0',
    etiqueta: 'Módulo 0',
    nombre: 'Errores numéricos',
    subtitulo: 'Fase 0 · errores y precisión',
    descripcion:
      'Cifras significativas, medición del error, truncamiento y propagación. Es el marco con el que se lee cualquier resultado numérico, antes de resolver una ecuación.',
    ruta: '/modulo0',
    estado: 'disponible',
    familias: CAT_FAMILIAS_M0,
    secciones: [],
    claves: [
      'fase 0',
      'errores',
      'error numerico',
      'aritmetica de maquina',
      'redondeo',
      'taylor',
      'propagacion',
    ],
  },
  {
    id: 'modulo1',
    etiqueta: 'Módulo 1',
    nombre: 'Ecuaciones no lineales',
    subtitulo: 'Fase 1 · raíces de f(x) = 0',
    descripcion:
      'Bisección, Regla Falsa, Newton-Raphson, Secante, Punto Fijo y Cardano, con análisis de errores, cifras significativas y criterios de parada.',
    ruta: '/modulo1',
    estado: 'disponible',
    familias: FAMILIAS_MODULO1,
    secciones: [
      {
        id: 'm1-teoria-errores',
        titulo: 'Teoría y errores',
        descripcion:
          'Definiciones, criterios de convergencia y errores numéricos con ejemplos.',
        ruta: '/modulo1/teoria-y-errores',
        claves: ['teoria', 'errores', 'criterios de parada', 'conceptos'],
      },
      {
        id: 'm1-calculadoras',
        titulo: 'Calculadoras interactivas',
        descripcion:
          'Bisección, Newton-Raphson, Secante, Punto Fijo y Regla Falsa con iteración paso a paso y criterio de parada.',
        ruta: '/modulo1/calculadoras-interactivas',
        claves: ['calculadora', 'biseccion', 'newton', 'secante', 'punto fijo', 'regla falsa'],
      },
      {
        id: 'm1-ejemplos',
        titulo: 'Ejemplos resueltos',
        descripcion:
          'Problemas desarrollados con tablas de iteración y análisis de convergencia.',
        ruta: '/modulo1/ejemplos-resueltos',
        claves: ['ejemplos', 'problemas resueltos', 'iteraciones'],
      },
      {
        id: 'm1-graficos',
        titulo: 'Gráficos',
        descripcion: 'Visualiza funciones, intervalos y convergencia de cada método.',
        ruta: '/modulo1/graficos',
        claves: ['graficos', 'grafica', 'convergencia', 'curvas'],
      },
      {
        id: 'm1-autoevaluacion',
        titulo: 'Autoevaluación y recursos',
        descripcion: 'Ejercicios con solución desplegable para verificar tu avance.',
        ruta: '/modulo1/autoevaluacion-y-recursos',
        claves: ['autoevaluacion', 'ejercicios', 'recursos'],
      },
    ],
    claves: ['fase 1', 'ecuaciones no lineales', 'raices', 'errores'],
  },
  {
    id: 'modulo2',
    etiqueta: 'Módulo 2',
    nombre: 'Sistemas de ecuaciones lineales',
    subtitulo: 'Fase 2 · A·x = b',
    descripcion:
      'Eliminación gaussiana con pivoteo parcial, factorización LU y convergencia de Jacobi y Gauss-Seidel.',
    ruta: '/modulo2',
    estado: 'disponible',
    familias: CAT_FAMILIAS_M2,
    secciones: [],
    claves: ['fase 2', 'sistemas', 'matrices', 'algebra lineal'],
  },
  {
    id: 'modulo3',
    etiqueta: 'Módulo 3',
    nombre: 'Interpolación y ajuste de curvas',
    subtitulo: 'Fase 3 · datos experimentales',
    descripcion:
      'Polinomio interpolante de Lagrange y ajuste de datos experimentales por mínimos cuadrados, con teoría, ejemplos, autoevaluación y calculadoras interactivas.',
    ruta: '/modulo3',
    estado: 'disponible',
    familias: CAT_FAMILIAS_M3,
    secciones: [],
    claves: ['fase 3', 'interpolacion', 'ajuste', 'curvas', 'datos'],
  },
  {
    id: 'modulo4',
    etiqueta: 'Módulo 4',
    nombre: 'Diferenciación e integración numérica',
    subtitulo: 'Fase 4 · en desarrollo',
    descripcion:
      'Diferencias finitas, Regla del Trapecio, Simpson 1/3 y 3/8, y Cuadratura de Gauss-Legendre.',
    ruta: null,
    estado: 'planificado',
    familias: [],
    secciones: [],
    claves: ['fase 4', 'simpson', 'trapecio', 'integracion', 'derivacion', 'gauss legendre'],
  },
  {
    id: 'modulo5',
    etiqueta: 'Módulo 5',
    nombre: 'Ecuaciones diferenciales ordinarias',
    subtitulo: 'Fase 5 · en desarrollo',
    descripcion:
      'Problemas de valor inicial mediante Euler, Euler Mejorado (Heun) y Runge-Kutta de 4to orden (RK4).',
    ruta: null,
    estado: 'planificado',
    familias: [],
    secciones: [],
    claves: ['fase 5', 'edo', 'euler', 'heun', 'runge kutta', 'rk4'],
  },
] as const;

/** Módulos con página propia, en el orden en que se muestran. */
export const MODULOS_DISPONIBLES = MODULOS.filter((m) => m.estado === 'disponible');

/** El módulo por id, o undefined. */
export function moduloPorId(id: string): ModuloCatalogo | undefined {
  return MODULOS.find((m) => m.id === id);
}

/** Los cuatro nombres de pestaña, iguales en todos los métodos. */
export const PESTANAS_METODO = [
  { ruta: 'teoria', texto: 'Teoría' },
  { ruta: 'ejemplos', texto: 'Ejemplos' },
  { ruta: 'autoevaluacion', texto: 'Autoevaluación' },
  { ruta: 'calculadora', texto: 'Calculadora' },
] as const;
