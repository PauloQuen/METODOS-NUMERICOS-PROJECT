import { Routes } from '@angular/router';

/**
 * Rutas de Simpson: la página del método y sus cuatro pestañas, todas
 * con carga diferida. El código no entra al bundle hasta que se abre.
 */
export const SIMPSON_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./simpson').then((m) => m.Simpson),
    children: [
      { path: '', redirectTo: 'teoria', pathMatch: 'full' },
      {
        path: 'teoria',
        loadComponent: () => import('./tabs/simpson-teoria').then((m) => m.SimpsonTeoria),
      },
      {
        path: 'ejemplos',
        loadComponent: () => import('./tabs/simpson-ejemplos').then((m) => m.SimpsonEjemplos),
      },
      {
        path: 'autoevaluacion',
        loadComponent: () =>
          import('./tabs/simpson-autoevaluacion').then((m) => m.SimpsonAutoevaluacion),
      },
      {
        path: 'calculadora',
        loadComponent: () =>
          import('./tabs/simpson-calculadora').then((m) => m.SimpsonCalculadora),
      },
    ],
  },
];
