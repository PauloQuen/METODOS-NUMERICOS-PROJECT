import { Routes } from '@angular/router';

export const SECANTE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./secante').then((m) => m.MetodoSecante),
    children: [
      { path: '', redirectTo: 'teoria', pathMatch: 'full' },
      {
        path: 'teoria',
        loadComponent: () =>
          import('./tabs/secante-teoria').then((m) => m.SecanteTeoria),
      },
      {
        path: 'ejemplos',
        loadComponent: () =>
          import('./tabs/secante-ejemplos').then((m) => m.SecanteEjemplos),
      },
      {
        path: 'autoevaluacion',
        loadComponent: () =>
          import('./tabs/secante-autoevaluacion').then(
            (m) => m.SecanteAutoevaluacion,
          ),
      },
      {
        path: 'calculadora',
        loadComponent: () =>
          import('./tabs/secante-calculadora').then((m) => m.SecanteCalculadora),
      },
    ],
  },
];
