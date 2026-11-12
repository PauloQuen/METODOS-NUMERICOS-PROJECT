import type { Routes } from '@angular/router';
import { metodoModulo0 } from '../../registro-modulo0';
import { autoevaluacionMejoradaM0, politicaDeMetodoM0 } from '../../autoevaluacion.config';
import {
  CAMPOS_ERRORES,
  COLUMNAS_ERRORES,
  EJEMPLOS_ERRORES,
  EJERCICIOS_ERRORES,
  TEORIA_ERRORES,
  calcularErrorRelativo,
} from './contenido';

const TIPO = 'medicion';
const METODO = metodoModulo0('error-absoluto-relativo');

/** Rutas de Error absoluto y relativo. */
export const ERROR_ABSOLUTO_RELATIVO_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('../../pagina-metodo/pagina-metodo').then((m) => m.PaginaMetodoModulo0),
    data: {
      metodo: METODO,
      teoria: TEORIA_ERRORES,
      columnas: COLUMNAS_ERRORES,
      ejemplos: EJEMPLOS_ERRORES,
      tituloEjemplos: 'Ejemplos de errores',
      introEjemplos:
        'Comparaciones con constantes, mediciones e instrumentos. En cada una se declara cuál es el valor de referencia.',
      ejercicios: EJERCICIOS_ERRORES,
      tipoId: TIPO,
      metodoId: METODO.key,
      mejorada: autoevaluacionMejoradaM0(TIPO, METODO.key),
      desbloqueoBase: politicaDeMetodoM0(TIPO, METODO.key),
      introAutoevaluacion:
        'Antes de calcular, escribe cuál es el valor de referencia. Sin esa decisión, el error relativo no tiene una lectura única.',
      campos: CAMPOS_ERRORES,
      tituloCalculadora: 'Calculadora de errores',
      introCalculadora:
        'Compara una aproximación con un valor de referencia. Devuelve el error absoluto, el relativo y el porcentual en una sola tabla.',
      calcular: calcularErrorRelativo,
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
