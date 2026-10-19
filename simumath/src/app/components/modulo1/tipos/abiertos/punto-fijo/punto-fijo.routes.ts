import { Routes } from '@angular/router';

export const PUNTO_FIJO_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./punto-fijo').then((m) => m.MetodoPuntoFijo),
    children: [
      { path: '', redirectTo: 'teoria', pathMatch: 'full' },
      {
        path: 'teoria',
        loadComponent: () =>
          import('./tabs/punto-fijo-teoria').then((m) => m.PuntoFijoTeoria),
      },
      {
        path: 'ejemplos',
        loadComponent: () =>
          import('./tabs/punto-fijo-ejemplos').then((m) => m.PuntoFijoEjemplos),
      },
      {
        path: 'autoevaluacion',
        loadComponent: () =>
          import('./tabs/punto-fijo-autoevaluacion').then(
            (m) => m.PuntoFijoAutoevaluacion,
          ),
      },
      {
        path: 'calculadora',
        loadComponent: () =>
          import('./tabs/punto-fijo-calculadora').then(
            (m) => m.PuntoFijoCalculadora,
          ),
      },
    ],
  },
];