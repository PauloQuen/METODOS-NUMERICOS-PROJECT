import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { Modulo1 } from './components/modulo1/modulo1';
import { Teoria } from './components/modulo1/teoria/teoria';
import { Calculadoras } from './components/modulo1/calculadoras/calculadoras';
import { Ejemplos } from './components/modulo1/ejemplos/ejemplos';
import { Autoevaluacion } from './components/modulo1/autoevaluacion/autoevaluacion';
import { Integrantes } from './components/modulo1/integrantes/integrantes';
import { Graficos } from './components/modulo1/graficos/graficos';

/**
 * Rutas del portal.
 *
 * ── Por qué unas van lazy y otras no ─────────────────────────────────
 * Las del módulo 1 son pantallas viejas y planas: pesan poco y casi
 * siempre están en el bundle. `loadComponent` alcanza para ellas.
 *
 * Las de un método nuevo (Bisección y los que vengan) son `loadChildren`
 * con un archivo de rutas propio. Motivo concreto: cada método trae
 * contenido largo, un gráfico, una tabla y cuatro pestañas. Si se
 * cargaran todas eager, con veinte métodos el bundle inicial llevaría
 * veinteAlgorithms que el alumno quizá nunca abra.
 *
 * ── Las cuatro pestañas son rutas hijas ─────────────────────────────
 * No son un `@if` dentro de la página. Si fueran tabs sin ruta, al
 * cambiar de pestaña se recrearía el contenido y el cálculo del alumno
 * se perdería. Con rutas hijas el router conserva cada pestaña y el
 * servicio conserva el estado del cálculo.
 *
 * Ojo: el orden importa. La ruta de `teoria` va con `pathMatch: 'full'`
 * para que capturara el resto, y las otras son hermanos exactos.
 */
export const routes: Routes = [
  { path: 'home', component: Home },
  { path: '', redirectTo: 'home', pathMatch: 'full' },

// Módulo 1 — Ecuaciones No Lineales y Errores
  {
    path: 'modulo1',
    component: Modulo1,
    children: [
      { path: '', redirectTo: 'inicio', pathMatch: 'full' },

      // Pantalla A: elige el TIPO de método. Trae su propio hero.
      {
        path: 'inicio',
        loadComponent: () =>
          import('./components/modulo1/inicio/inicio').then((m) => m.Inicio),
      },

      // Pantallas generales (material transversal de los cinco métodos).
      { path: 'teoria-y-errores', component: Teoria },
      { path: 'calculadoras-interactivas', component: Calculadoras },
      { path: 'ejemplos-resueltos', component: Ejemplos },
      { path: 'autoevaluacion-y-recursos', component: Autoevaluacion },
      { path: 'integrantes-y-referencias', component: Integrantes },
      { path: 'graficos', component: Graficos },

      // ── Tipo → Método: pantallas nuevas, carga diferida ────────────
      // `loadChildren` devuelve el archivo de rutas del método. Así el
      // código de bisección no entra al bundle hasta que el alumno lo abre.
      // OJO con el orden: la ruta CONCRETA de cada método va ANTES de la
      // de familia, o el router leería 'cerrados' como si fuera una
      // familia y bisección quedaría inalcanzable.
      {
        path: 'tipos/cerrados/biseccion',
        loadChildren: () =>
          import('./components/modulo1/tipos/cerrados/biseccion/biseccion.routes').then(
            (m) => m.BISECCION_ROUTES,
          ),
      },
      {
        path: 'tipos/cerrados/regla-falsa',
        loadChildren: () =>
          import('./components/modulo1/tipos/cerrados/regla-falsa/regla-falsa.routes').then(
            (m) => m.REGLA_FALSA_ROUTES,
          ),
      },
      {
        path: 'tipos/abiertos/newton-raphson',
        loadChildren: () =>
          import(
            './components/modulo1/tipos/abiertos/newton-raphson/newton-raphson.routes'
          ).then((m) => m.NEWTON_RAPHSON_ROUTES),
      },
      {
        path: 'tipos/abiertos/secante',
        loadChildren: () =>
          import('./components/modulo1/tipos/abiertos/secante/secante.routes').then(
            (m) => m.SECANTE_ROUTES,
          ),
      },
      {
        path: 'tipos/abiertos/punto-fijo',
        loadChildren: () =>
          import(
            './components/modulo1/tipos/abiertos/punto-fijo/punto-fijo.routes'
          ).then((m) => m.PUNTO_FIJO_ROUTES),
      },

      // Pantalla B: la lista de métodos de una familia. Un solo componente
      // para las tres familias, ver tipo-metodos.ts para el porqué.
      {
        path: 'tipos/:familia',
        loadComponent: () =>
          import('./components/modulo1/tipos/tipo-metodos/tipo-metodos').then(
            (m) => m.TipoMetodos,
          ),
      },
    ],
  },

  // Módulo 3 — Interpolación y Ajuste de Curvas
  //
  // Misma estructura que el Módulo 1: Pantalla A (elegir familia),
  // Pantalla B (lista de métodos de una familia) y páginas de método con
  // sus cuatro pestañas. Los métodos concretos van ANTES de
  // `tipos/:familia`, o el router leería 'interpolacion/lagrange' como
  // una familia y nunca llegaría a la página del método.
  {
    path: 'modulo3',
    loadComponent: () =>
      import('./components/modulo3/modulo3').then((m) => m.Modulo3),
    children: [
      { path: '', redirectTo: 'inicio', pathMatch: 'full' },

      // Pantalla A: elige el TIPO de problema (interpolar o ajustar).
      {
        path: 'inicio',
        loadComponent: () =>
          import('./components/modulo3/inicio/inicio').then((m) => m.InicioModulo3),
      },

      // Métodos concretos: carga diferida de sus cuatro pestañas.
      {
        path: 'tipos/interpolacion/lagrange',
        loadChildren: () =>
          import(
            './components/modulo3/tipos/interpolacion/lagrange/lagrange.routes'
          ).then((m) => m.LAGRANGE_ROUTES),
      },
      {
        path: 'tipos/ajuste/minimos-cuadrados',
        loadChildren: () =>
          import(
            './components/modulo3/tipos/ajuste/minimos-cuadrados/minimos-cuadrados.routes'
          ).then((m) => m.MINIMOS_CUADRADOS_ROUTES),
      },

      // Pantalla B: lista de métodos de una familia (interpolacion | ajuste).
      {
        path: 'tipos/:familia',
        loadComponent: () =>
          import('./components/modulo3/tipos/tipo-metodos/tipo-metodos').then(
            (m) => m.TipoMetodosModulo3,
          ),
      },
    ],
  },

  // Atajos por slug histórico (data-path de las maquetas)
  { path: 'teoria-y-errores', redirectTo: 'modulo1/teoria-y-errores' },
  { path: 'calculadoras-interactivas', redirectTo: 'modulo1/calculadoras-interactivas' },
  { path: 'ejemplos-resueltos', redirectTo: 'modulo1/ejemplos-resueltos' },
  { path: 'autoevaluacion-y-recursos', redirectTo: 'modulo1/autoevaluacion-y-recursos' },
  { path: 'integrantes-y-referencias', redirectTo: 'modulo1/integrantes-y-referencias' },
  { path: 'graficos', redirectTo: 'modulo1/graficos' },

  { path: '**', redirectTo: 'home' },
];