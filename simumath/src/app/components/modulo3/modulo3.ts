import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';
import { AppFooter } from '../../shared/layout/app-footer/app-footer';

/**
 * Módulo 3 — Interpolación y Ajuste de Curvas.
 *
 * Layout común de las pantallas del módulo. A diferencia del Módulo 1,
 * acá no hay secciones generales (teoría, ejemplos, calculadoras...)
 * porque cada método trae sus propias pestañas. Por eso el layout solo
 * decide el ancho del contenido:
 *
 * · La Pantalla A (`/modulo3/inicio`) trae su propio hero navy a todo
 *   el ancho y administra su centrado interno.
 * · La página de cada método y la lista por familia se muestran dentro
 *   del ancho máximo del portal, con el padding habitual.
 */
@Component({
  selector: 'app-modulo3',
  standalone: true,
  imports: [RouterOutlet, AppFooter],
  templateUrl: './modulo3.html',
  styleUrl: './modulo3.scss',
})
export class Modulo3 {
  private readonly router = inject(Router);

  /** URL actual como señal real: `router.url` es plana y no reacciona. */
  private readonly urlActual = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );

  /** La landing trae su propio hero: el contenido va a todo el ancho. */
  readonly libre = computed(() => (this.urlActual() ?? '').includes('/inicio'));
}
