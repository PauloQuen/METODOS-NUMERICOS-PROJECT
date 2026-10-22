import { Routes } from '@angular/router';

/**
 * Rutas de Lagrange: la página del método y sus cuatro pestañas.
 *
 * Todas las pestañas son `loadComponent`, así que ni la Teoría (la más
 * larga) entra al bundle inicial. `app.routes.ts` carga este archivo con
 * `loadChildren`, y el servicio del método es `providedIn: 'any'`, o sea
 * que las cuatro pestañas comparten una misma instancia y el cálculo
 * sobrevive al cambio de pestaña.
 */
export const LAGRANGE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./lagrange').then((m) => m.Lagrange),
    children: [
      { path: '', redirectTo: 'teoria', pathMatch: 'full' },
      {
        path: 'teoria',
        loadComponent: () => import('./tabs/lagrange-teoria').then((m) => m.LagrangeTeoria),
      },
      {
        path: 'ejemplos',
        loadComponent: () => import('./tabs/lagrange-ejemplos').then((m) => m.LagrangeEjemplos),
      },
      {
        path: 'autoevaluacion',
        loadComponent: () =>
          import('./tabs/lagrange-autoevaluacion').then((m) => m.LagrangeAutoevaluacion),
      },
      {
        path: 'calculadora',
        loadComponent: () =>
          import('./tabs/lagrange-calculadora').then((m) => m.LagrangeCalculadora),
      },
    ],
  },
];
