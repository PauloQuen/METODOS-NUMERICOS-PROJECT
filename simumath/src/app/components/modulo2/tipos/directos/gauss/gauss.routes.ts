import { Routes } from '@angular/router';

/**
 * Rutas de la eliminación gaussiana.
 *
 * Son rutas HIJAS de la página del método: cada pestaña es una URL. El
 * motivo es el mismo que en el Módulo 1: si las pestañas fueran un
 * `@if`, al cambiar de pestaña se recrearía el contenido y el cálculo
 * en curso se perdería.
 */
export const GAUSS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./gauss').then((m) => m.MetodoGauss),
    children: [
      { path: '', redirectTo: 'teoria', pathMatch: 'full' },
      {
        path: 'teoria',
        loadComponent: () => import('./tabs/gauss-teoria').then((m) => m.GaussTeoria),
      },
      {
        path: 'ejemplos',
        loadComponent: () => import('./tabs/gauss-ejemplos').then((m) => m.GaussEjemplos),
      },
      {
        path: 'autoevaluacion',
        loadComponent: () =>
          import('./tabs/gauss-autoevaluacion').then((m) => m.GaussAutoevaluacion),
      },
      {
        path: 'calculadora',
        loadComponent: () =>
          import('./tabs/gauss-calculadora').then((m) => m.GaussCalculadora),
      },
    ],
  },
];
