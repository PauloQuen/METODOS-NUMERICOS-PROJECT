import { Routes } from '@angular/router';

/**
 * Rutas de la factorización LU.
 *
 * Son rutas HIJAS de la página del método: cada pestaña es una URL. El
 * motivo es el mismo que en el Módulo 1: si las pestañas fueran un
 * `@if`, al cambiar de pestaña se recrearía el contenido y el cálculo
 * en curso se perdería.
 */
export const LU_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./lu').then((m) => m.MetodoLu),
    children: [
      { path: '', redirectTo: 'teoria', pathMatch: 'full' },
      {
        path: 'teoria',
        loadComponent: () => import('./tabs/lu-teoria').then((m) => m.LuTeoria),
      },
      {
        path: 'ejemplos',
        loadComponent: () => import('./tabs/lu-ejemplos').then((m) => m.LuEjemplos),
      },
      {
        path: 'autoevaluacion',
        loadComponent: () =>
          import('./tabs/lu-autoevaluacion').then((m) => m.LuAutoevaluacion),
      },
      {
        path: 'calculadora',
        loadComponent: () =>
          import('./tabs/lu-calculadora').then((m) => m.LuCalculadora),
      },
    ],
  },
];
