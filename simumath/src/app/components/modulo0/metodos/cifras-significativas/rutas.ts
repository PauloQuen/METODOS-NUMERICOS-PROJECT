import type { Routes } from '@angular/router';
import { metodoModulo0 } from '../../registro-modulo0';
import { autoevaluacionMejoradaM0, politicaDeMetodoM0 } from '../../autoevaluacion.config';
import {
  CAMPOS_CIFRAS,
  COLUMNAS_CIFRAS,
  EJEMPLOS_CIFRAS,
  EJERCICIOS_CIFRAS,
  TEORIA_CIFRAS,
  calcularCifras,
} from './contenido';

const TIPO = 'aritmetica';
const METODO = metodoModulo0('cifras-significativas');

/** Rutas de Cifras significativas: página del método + cuatro pestañas. */
export const CIFRAS_SIGNIFICATIVAS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('../../pagina-metodo/pagina-metodo').then((m) => m.PaginaMetodoModulo0),
    data: {
      metodo: METODO,
      teoria: TEORIA_CIFRAS,
      columnas: COLUMNAS_CIFRAS,
      ejemplos: EJEMPLOS_CIFRAS,
      tituloEjemplos: 'Ejemplos de redondeo',
      introEjemplos:
        'Cuatro casos para practicar la diferencia entre cifras significativas y decimales: dos numéricos y dos sacados de una medición.',
      ejercicios: EJERCICIOS_CIFRAS,
      tipoId: TIPO,
      metodoId: METODO.key,
      mejorada: autoevaluacionMejoradaM0(TIPO, METODO.key),
      desbloqueoBase: politicaDeMetodoM0(TIPO, METODO.key),
      introAutoevaluacion:
        'Resuelve primero con lápiz y papel. La pista y el cuestionario están para ayudarte a decidir, no para saltarte la cuenta.',
      campos: CAMPOS_CIFRAS,
      tituloCalculadora: 'Calculadora de cifras significativas',
      introCalculadora:
        'Escribe un valor y cuántas cifras quieres conservar. La calculadora redondea y muestra el error que introdujo el redondeo.',
      calcular: calcularCifras,
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
