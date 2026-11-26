import { Routes } from '@angular/router';

/**
 * Rutas del trapecio: la página del método y sus cuatro pestañas, todas
 * con carga diferida. Mismo patrón que los módulos anteriores: el código
 * de un método no entra al bundle hasta que el alumno lo abre.
 */
export const TRAPECIO_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./trapecio').then((m) => m.Trapecio),
    children: [
      { path: '', redirectTo: 'teoria', pathMatch: 'full' },
      {
        path: 'teoria',
        loadComponent: () => import('./tabs/trapecio-teoria').then((m) => m.TrapecioTeoria),
      },
      {
        path: 'ejemplos',
        loadComponent: () => import('./tabs/trapecio-ejemplos').then((m) => m.TrapecioEjemplos),
      },
      {
        path: 'autoevaluacion',
        loadComponent: () =>
          import('./tabs/trapecio-autoevaluacion').then((m) => m.TrapecioAutoevaluacion),
      },
      {
        path: 'calculadora',
        loadComponent: () =>
          import('./tabs/trapecio-calculadora').then((m) => m.TrapecioCalculadora),
      },
    ],
  },
];
