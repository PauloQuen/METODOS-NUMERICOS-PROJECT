import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';
import { AppFooter } from '../../shared/layout/app-footer/app-footer';
import { Badge } from '../../shared/ui/badge/badge';
import { Btn } from '../../shared/ui/btn/btn';
import { Breadcrumb, type TramoBreadcrumb } from '../../shared/layout/breadcrumb/breadcrumb';

/**
 * Módulo 2 — Sistemas de Ecuaciones Lineales.
 *
 * ── Por qué este layout es más simple que el del Módulo 1 ─────────────
 * El Módulo 1 tiene secciones transversales (Teoría y Errores, Ejemplos,
 * Autoevaluación, Calculadoras, Gráficos) que son las mismas para los
 * cinco métodos, y por eso su layout tiene un `app-tab-nav` arriba.
 *
 * El Módulo 2 es al revés: cada MÉTODO trae sus propias cuatro pestañas
 * (Teoría, Ejemplos, Autoevaluación, Calculadora) porque su teoría, sus
 * ejemplos y su tabla son distintos. Entonces este layout NO lleva
 * pestañas: solo arma el marco —encabezado del módulo, hueco de contenido
 * y pie— y deja que cada pantalla se administre su propio encabezado.
 *
 * ── Los tres modos ────────────────────────────────────────────────────
 * · 'landing' → `/modulo2/inicio`: la pantalla de entrada.
 * · 'familia' → `/modulo2/tipos/directos`: la lista de métodos de una
 *   familia. Trae su propio encabezado con el nombre de la familia.
 * · 'metodo'  → `/modulo2/tipos/directos/gauss/teoria`: la página del
 *   método, que trae encabezado, migas y sus cuatro pestañas.
 *
 * En los dos primeros modos este layout pinta el encabezado del módulo.
 * En el último NO lo pinta: el método ya tiene el suyo y dos encabezados
 * apilados se verían como un error de maquetación.
 */
@Component({
  selector: 'app-modulo2',
  imports: [RouterOutlet, Badge, Btn, AppFooter, Breadcrumb],
  templateUrl: './modulo2.html',
  styleUrl: './modulo2.scss',
})
export class Modulo2 {
  private readonly router = inject(Router);

  /**
   * URL actual como señal real.
   *
   * `router.url` es una propiedad plana: si se leyera dentro de un
   * `computed`, la señal quedaría cacheada y el estado de navegación NUNCA
   * se movería al navegar dentro del SPA. Por eso se escucha el evento.
   */
  private readonly urlActual = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );

  /**
   * En qué pantalla estamos, deducido de la URL.
   *
   * Se deduce de la URL y no de un servicio, porque la URL es la fuente
   * de verdad: el router ya sabe dónde está, y duplicar ese estado en
   * una señal obliga a mantenerlo sincronizado a mano.
   */
  readonly modo = computed<'landing' | 'familia' | 'metodo'>(() => {
    const url = this.urlActual() ?? '';
    if (url.includes('/inicio')) return 'landing';

    // /modulo2/tipos/<familia>            → 4 segmentos
    // /modulo2/tipos/<familia>/<metodo>   → 5 segmentos o más
    const segmentos = url.split('/').filter(Boolean);
    if (segmentos[1] === 'tipos') {
      return segmentos.length >= 4 ? 'metodo' : 'familia';
    }
    return 'landing';
  });

  /** ¿El layout tiene que pintar su propio encabezado? */
  readonly conEncabezado = computed(() => this.modo() !== 'metodo');

  readonly miga = computed<TramoBreadcrumb[]>(() => [
    { texto: 'Portal', ruta: '/home' },
    { texto: 'Módulo 2' },
  ]);
}
