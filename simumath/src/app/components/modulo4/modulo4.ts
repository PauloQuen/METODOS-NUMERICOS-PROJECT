import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';
import { AppFooter } from '../../shared/layout/app-footer/app-footer';

/**
 * Módulo 4 — Integración numérica.
 *
 * Layout común de las pantallas del módulo. Igual que en el Módulo 3, no
 * hay secciones generales: cada método trae sus propias pestañas. El
 * layout solo decide el ancho del contenido:
 *
 * · La Pantalla A (`/modulo4/inicio`) trae su propio hero navy a todo el
 *   ancho y administra su centrado interno.
 * · La página de cada método y la lista por familia se muestran dentro
 *   del ancho máximo del portal, con el padding habitual.
 */
@Component({
  selector: 'app-modulo4',
  standalone: true,
  imports: [RouterOutlet, AppFooter],
  templateUrl: './modulo4.html',
  styleUrl: './modulo4.scss',
})
export class Modulo4 {
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
