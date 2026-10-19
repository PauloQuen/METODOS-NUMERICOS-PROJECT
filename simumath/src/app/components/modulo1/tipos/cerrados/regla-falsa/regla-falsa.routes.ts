import { Routes } from '@angular/router';

export const REGLA_FALSA_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./regla-falsa').then((m) => m.ReglaFalsa),
    children: [
      { path: '', redirectTo: 'teoria', pathMatch: 'full' },
      {
        path: 'teoria',
        loadComponent: () => import('./tabs/regla-falsa-teoria').then((m) => m.ReglaFalsaTeoria),
      },
      {
        path: 'ejemplos',
        loadComponent: () => import('./tabs/regla-falsa-ejemplos').then((m) => m.ReglaFalsaEjemplos),
      },
      {
        path: 'autoevaluacion',
        loadComponent: () =>
          import('./tabs/regla-falsa-autoevaluacion').then((m) => m.ReglaFalsaAutoevaluacion),
      },
      {
        path: 'calculadora',
        loadComponent: () =>
          import('./tabs/regla-falsa-calculadora').then((m) => m.ReglaFalsaCalculadora),
      },
    ],
  },
];
