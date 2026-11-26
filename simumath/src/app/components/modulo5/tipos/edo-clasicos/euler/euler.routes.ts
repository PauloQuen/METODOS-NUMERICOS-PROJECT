import { Routes } from '@angular/router';

/**
 * Rutas de Euler: la página del método y sus cuatro pestañas, con carga
 * diferida. Mismo patrón que los módulos anteriores.
 */
export const EULER_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./euler').then((m) => m.Euler),
    children: [
      { path: '', redirectTo: 'teoria', pathMatch: 'full' },
      {
        path: 'teoria',
        loadComponent: () => import('./tabs/euler-teoria').then((m) => m.EulerTeoria),
      },
      {
        path: 'ejemplos',
        loadComponent: () => import('./tabs/euler-ejemplos').then((m) => m.EulerEjemplos),
      },
      {
        path: 'autoevaluacion',
        loadComponent: () =>
          import('./tabs/euler-autoevaluacion').then((m) => m.EulerAutoevaluacion),
      },
      {
        path: 'calculadora',
        loadComponent: () => import('./tabs/euler-calculadora').then((m) => m.EulerCalculadora),
      },
    ],
  },
];
