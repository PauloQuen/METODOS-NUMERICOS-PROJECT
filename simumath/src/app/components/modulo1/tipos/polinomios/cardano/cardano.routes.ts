import { Routes } from '@angular/router';

export const CARDANO_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./cardano').then((m) => m.MetodoCardano),
    children: [
      { path: '', redirectTo: 'teoria', pathMatch: 'full' },
      {
        path: 'teoria',
        loadComponent: () => import('./tabs/cardano-teoria').then((m) => m.CardanoTeoria),
      },
      {
        path: 'ejemplos',
        loadComponent: () => import('./tabs/cardano-ejemplos').then((m) => m.CardanoEjemplos),
      },
      {
        path: 'autoevaluacion',
        loadComponent: () =>
          import('./tabs/cardano-autoevaluacion').then((m) => m.CardanoAutoevaluacion),
      },
      {
        path: 'calculadora',
        loadComponent: () => import('./tabs/cardano-calculadora').then((m) => m.CardanoCalculadora),
      },
    ],
  },
];
