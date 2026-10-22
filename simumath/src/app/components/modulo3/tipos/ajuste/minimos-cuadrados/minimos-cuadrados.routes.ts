import { Routes } from '@angular/router';

/**
 * Rutas de Mínimos Cuadrados: la página del método y sus cuatro
 * pestañas, todas con carga diferida. Ver el comentario de
 * `lagrange.routes.ts` para el porqué del patrón.
 */
export const MINIMOS_CUADRADOS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./minimos-cuadrados').then((m) => m.MinimosCuadrados),
    children: [
      { path: '', redirectTo: 'teoria', pathMatch: 'full' },
      {
        path: 'teoria',
        loadComponent: () =>
          import('./tabs/minimos-cuadrados-teoria').then((m) => m.MinimosCuadradosTeoria),
      },
      {
        path: 'ejemplos',
        loadComponent: () =>
          import('./tabs/minimos-cuadrados-ejemplos').then((m) => m.MinimosCuadradosEjemplos),
      },
      {
        path: 'autoevaluacion',
        loadComponent: () =>
          import('./tabs/minimos-cuadrados-autoevaluacion').then(
            (m) => m.MinimosCuadradosAutoevaluacion,
          ),
      },
      {
        path: 'calculadora',
        loadComponent: () =>
          import('./tabs/minimos-cuadrados-calculadora').then((m) => m.MinimosCuadradosCalculadora),
      },
    ],
  },
];
