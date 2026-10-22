import { Routes } from '@angular/router';

/**
 * Rutas de Matrices especiales (Gauss-Seidel): página + cuatro pestañas.
 */
export const MATRICES_ESPECIALES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./matrices-especiales').then((m) => m.MatricesEspeciales),
    children: [
      { path: '', redirectTo: 'teoria', pathMatch: 'full' },
      {
        path: 'teoria',
        loadComponent: () =>
          import('./tabs/matrices-especiales-teoria').then((m) => m.MatricesEspecialesTeoria),
      },
      {
        path: 'ejemplos',
        loadComponent: () =>
          import('./tabs/matrices-especiales-ejemplos').then((m) => m.MatricesEspecialesEjemplos),
      },
      {
        path: 'autoevaluacion',
        loadComponent: () =>
          import('./tabs/matrices-especiales-autoevaluacion').then(
            (m) => m.MatricesEspecialesAutoevaluacion,
          ),
      },
      {
        path: 'calculadora',
        loadComponent: () =>
          import('./tabs/matrices-especiales-calculadora').then(
            (m) => m.MatricesEspecialesCalculadora,
          ),
      },
    ],
  },
];
