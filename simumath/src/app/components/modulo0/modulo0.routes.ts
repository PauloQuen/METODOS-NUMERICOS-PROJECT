import type { Routes } from '@angular/router';

/**
 * RUTAS DEL MÓDULO 0.
 *
 * Se declaran en su propio archivo para que `app.routes.ts` solo las
 * monte y para que las pruebas de integración puedan navegar el módulo
 * sin cargar el resto del portal. Los métodos concretos van ANTES de
 * `tipos/:familia`, o el router leería `truncamiento` como una familia y
 * nunca llegaría a Taylor.
 */
export const MODULO0_ROUTES: Routes = [
  {
    path: 'modulo0',
    loadComponent: () => import('./modulo0').then((m) => m.Modulo0),
    children: [
      { path: '', redirectTo: 'inicio', pathMatch: 'full' },
      {
        path: 'inicio',
        loadComponent: () => import('./inicio/inicio').then((m) => m.InicioModulo0),
      },
      {
        path: 'tipos/aritmetica/cifras-significativas',
        loadChildren: () =>
          import('./metodos/cifras-significativas/rutas').then(
            (m) => m.CIFRAS_SIGNIFICATIVAS_ROUTES,
          ),
      },
      {
        path: 'tipos/medicion/error-absoluto-relativo',
        loadChildren: () =>
          import('./metodos/error-absoluto-relativo/rutas').then(
            (m) => m.ERROR_ABSOLUTO_RELATIVO_ROUTES,
          ),
      },
      {
        path: 'tipos/truncamiento/taylor',
        loadChildren: () => import('./metodos/taylor/rutas').then((m) => m.TAYLOR_ROUTES),
      },
      {
        path: 'tipos/propagacion/propagacion-errores',
        loadChildren: () =>
          import('./metodos/propagacion-errores/rutas').then(
            (m) => m.PROPAGACION_ERRORES_ROUTES,
          ),
      },
      {
        path: 'tipos/:familia',
        loadComponent: () =>
          import('./tipos/tipo-metodos/tipo-metodos').then((m) => m.TipoMetodosModulo0),
      },
    ],
  },
];
