import { Routes } from '@angular/router';

export const NEWTON_RAPHSON_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./newton-raphson').then((m) => m.MetodoNewtonRaphson),
    children: [
      { path: '', redirectTo: 'teoria', pathMatch: 'full' },
      {
        path: 'teoria',
        loadComponent: () =>
          import('./tabs/newton-raphson-teoria').then((m) => m.NewtonRaphsonTeoria),
      },
      {
        path: 'ejemplos',
        loadComponent: () =>
          import('./tabs/newton-raphson-ejemplos').then((m) => m.NewtonRaphsonEjemplos),
      },
      {
        path: 'autoevaluacion',
        loadComponent: () =>
          import('./tabs/newton-raphson-autoevaluacion').then(
            (m) => m.NewtonRaphsonAutoevaluacion,
          ),
      },
      {
        path: 'calculadora',
        loadComponent: () =>
          import('./tabs/newton-raphson-calculadora').then(
            (m) => m.NewtonRaphsonCalculadora,
          ),
      },
    ],
  },
];
