import type { Routes } from '@angular/router';
import { metodoModulo0 } from '../../registro-modulo0';
import { autoevaluacionMejoradaM0, politicaDeMetodoM0 } from '../../autoevaluacion.config';
import {
  CAMPOS_PROPAGACION,
  COLUMNAS_PROPAGACION,
  EJEMPLOS_PROPAGACION,
  EJERCICIOS_PROPAGACION,
  TEORIA_PROPAGACION,
  calcularPropagacion,
} from './contenido';

const TIPO = 'propagacion';
const METODO = metodoModulo0('propagacion-errores');

/** Rutas de Propagación de errores. */
export const PROPAGACION_ERRORES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('../../pagina-metodo/pagina-metodo').then((m) => m.PaginaMetodoModulo0),
    data: {
      metodo: METODO,
      teoria: TEORIA_PROPAGACION,
      columnas: COLUMNAS_PROPAGACION,
      ejemplos: EJEMPLOS_PROPAGACION,
      tituloEjemplos: 'Ejemplos de propagación',
      introEjemplos:
        'Sumas, productos y cocientes con sus errores. La tabla separa la contribución de cada entrada para mostrar cuál pesa más.',
      ejercicios: EJERCICIOS_PROPAGACION,
      tipoId: TIPO,
      metodoId: METODO.key,
      mejorada: autoevaluacionMejoradaM0(TIPO, METODO.key),
      desbloqueoBase: politicaDeMetodoM0(TIPO, METODO.key),
      introAutoevaluacion:
        'Identifica primero la operación: en sumas se combinan errores absolutos; en productos y cocientes, relativos.',
      campos: CAMPOS_PROPAGACION,
      tituloCalculadora: 'Calculadora de propagación',
      introCalculadora:
        'Propaga los errores de dos entradas en una suma, un producto o un cociente. La tabla muestra cómo contribuye cada una.',
      calcular: calcularPropagacion,
    },
    children: [
      { path: '', redirectTo: 'teoria', pathMatch: 'full' },
      {
        path: 'teoria',
        loadComponent: () =>
          import('../../tabs/tab-teoria').then((m) => m.TabTeoriaModulo0),
      },
      {
        path: 'ejemplos',
        loadComponent: () =>
          import('../../tabs/tab-ejemplos').then((m) => m.TabEjemplosModulo0),
      },
      {
        path: 'autoevaluacion',
        loadComponent: () =>
          import('../../tabs/tab-autoevaluacion').then((m) => m.TabAutoevaluacionModulo0),
      },
      {
        path: 'calculadora',
        loadComponent: () =>
          import('../../tabs/tab-calculadora').then((m) => m.TabCalculadoraModulo0),
      },
    ],
  },
];
