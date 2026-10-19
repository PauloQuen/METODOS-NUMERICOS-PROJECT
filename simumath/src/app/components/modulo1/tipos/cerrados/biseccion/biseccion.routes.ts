import { Routes } from '@angular/router';

/**
 * Rutas de Bisección: la página y sus cuatro pestañas.
 *
 * ── Por qué un archivo aparte ────────────────────────────────────────
 * Porque `app.routes.ts` lo carga con `loadChildren`. Todas las pestañas
 * son `loadComponent`, así que ni siquiera la Teoría —que es la más
 * larga— entra en el bundle inicial. Ese código se baja recién cuando
 * el alumno pide esa pestaña.
 *
 * Ojo con la diferencia entre dos campos que se parecen mucho:
 * `component` recibe una clase, y por eso solo sirve con un import
 * normal. `loadComponent` recibe una función que devuelve una promesa,
 * y eso es lo que permite el código diferido. Si se pone una función
 * flecha en `component`, el error dice que "no provee la firma new",
 * que es la forma más clara de avisar que se mezclaron los campos.
 *
 * ── Por qué cada pestaña es su propia ruta ───────────────────────────
 * Para dos cosas concretas: el botón "atrás" del navegador tiene que
 * navegar entre pestañas, y cambiar de pestaña no puede tirar abajo el
 * cálculo del alumno. Con un `@if` de cuatro bloques dentro de un solo
 * componente, las dos cosas se pierden.
 *
 * ── La redirección por defecto ───────────────────────────────────────
 * Entrar a `/tipos/cerrados/biseccion` sin pestaña manda a `teoria`.
 * Con `pathMatch: 'full'`, porque si no la ruta vacía se comería a las
 * cuatro pestañas y no se vería ninguna.
 */
export const BISECCION_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./biseccion').then((m) => m.Biseccion),
    // El servicio va con `providedIn: 'any'` (ver biseccion.service.ts),
    // no con `providers` acá: las cuatro pestañas son `loadComponent`, o
    // sea que comparten el injector de este bundle lazy y reciben la
    // misma instancia sin tener que repetir el provide.
    children: [
      { path: '', redirectTo: 'teoria', pathMatch: 'full' },
      {
        path: 'teoria',
        loadComponent: () => import('./tabs/biseccion-teoria').then((m) => m.BiseccionTeoria),
      },
      {
        path: 'ejemplos',
        loadComponent: () =>
          import('./tabs/biseccion-ejemplos').then((m) => m.BiseccionEjemplos),
      },
      {
        path: 'autoevaluacion',
        loadComponent: () =>
          import('./tabs/biseccion-autoevaluacion').then((m) => m.BiseccionAutoevaluacion),
      },
      {
        path: 'calculadora',
        loadComponent: () =>
          import('./tabs/biseccion-calculadora').then((m) => m.BiseccionCalculadora),
      },
    ],
  },
];