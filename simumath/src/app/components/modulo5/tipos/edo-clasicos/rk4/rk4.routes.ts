import { Routes } from '@angular/router';

/** Rutas de RK4: la página del método y sus cuatro pestañas, con carga diferida. */
export const RK4_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./rk4').then((m) => m.Rk4),
    children: [
      { path: '', redirectTo: 'teoria', pathMatch: 'full' },
      {
        path: 'teoria',
        loadComponent: () => import('./tabs/rk4-teoria').then((m) => m.Rk4Teoria),
      },
      {
        path: 'ejemplos',
        loadComponent: () => import('./tabs/rk4-ejemplos').then((m) => m.Rk4Ejemplos),
      },
      {
        path: 'autoevaluacion',
        loadComponent: () =>
          import('./tabs/rk4-autoevaluacion').then((m) => m.Rk4Autoevaluacion),
      },
      {
        path: 'calculadora',
        loadComponent: () => import('./tabs/rk4-calculadora').then((m) => m.Rk4Calculadora),
      },
    ],
  },
];
