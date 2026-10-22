import { Routes } from '@angular/router';

/**
 * Rutas de Eliminación de Gauss: página del método + cuatro pestañas.
 * Las pestañas se cargan con `loadComponent` para no meter la teoría en
 * el bundle inicial.
 */
export const ELIMINACION_GAUSS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./eliminacion-gauss').then((m) => m.EliminacionGauss),
    children: [
      { path: '', redirectTo: 'teoria', pathMatch: 'full' },
      {
        path: 'teoria',
        loadComponent: () =>
          import('./tabs/eliminacion-gauss-teoria').then((m) => m.EliminacionGaussTeoria),
      },
      {
        path: 'ejemplos',
        loadComponent: () =>
          import('./tabs/eliminacion-gauss-ejemplos').then((m) => m.EliminacionGaussEjemplos),
      },
      {
        path: 'autoevaluacion',
        loadComponent: () =>
          import('./tabs/eliminacion-gauss-autoevaluacion').then(
            (m) => m.EliminacionGaussAutoevaluacion,
          ),
      },
      {
        path: 'calculadora',
        loadComponent: () =>
          import('./tabs/eliminacion-gauss-calculadora').then(
            (m) => m.EliminacionGaussCalculadora,
          ),
      },
    ],
  },
];
