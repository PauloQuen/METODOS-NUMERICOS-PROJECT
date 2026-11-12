import type { Routes } from '@angular/router';
import { metodoModulo0 } from '../../registro-modulo0';
import { autoevaluacionMejoradaM0, politicaDeMetodoM0 } from '../../autoevaluacion.config';
import {
  CAMPOS_TAYLOR,
  COLUMNAS_TAYLOR,
  EJEMPLOS_TAYLOR,
  EJERCICIOS_TAYLOR,
  TEORIA_TAYLOR,
  calcularTaylor,
} from './contenido';

const TIPO = 'truncamiento';
const METODO = metodoModulo0('taylor');

/** Rutas de Series de Taylor. */
export const TAYLOR_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('../../pagina-metodo/pagina-metodo').then((m) => m.PaginaMetodoModulo0),
    data: {
      metodo: METODO,
      teoria: TEORIA_TAYLOR,
      columnas: COLUMNAS_TAYLOR,
      ejemplos: EJEMPLOS_TAYLOR,
      tituloEjemplos: 'Ejemplos de Taylor',
      introEjemplos:
        'Cuatro cortes de la serie de e^x con centros y grados distintos. Mirar la tabla término a término ayuda a ver dónde se queda el resto.',
      ejercicios: EJERCICIOS_TAYLOR,
      tipoId: TIPO,
      metodoId: METODO.key,
      mejorada: autoevaluacionMejoradaM0(TIPO, METODO.key),
      desbloqueoBase: politicaDeMetodoM0(TIPO, METODO.key),
      introAutoevaluacion:
        'La cota del resto se calcula con la derivada siguiente y el intervalo, no con el error que ya observaste en la tabla.',
      campos: CAMPOS_TAYLOR,
      tituloCalculadora: 'Calculadora de Taylor para e^x',
      introCalculadora:
        'Elige x, el centro y el grado. La tabla muestra cada término, la suma acumulada y el error frente a la referencia numérica.',
      calcular: calcularTaylor,
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
