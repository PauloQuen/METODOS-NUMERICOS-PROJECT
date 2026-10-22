import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';
import { AppFooter } from '../../shared/layout/app-footer/app-footer';

/**
 * Módulo 2 — Sistemas de Ecuaciones Lineales.
 *
 * Layout común: la Pantalla A (inicio) trae su propio hero a todo el
 * ancho; las páginas de método y la lista por familia van dentro del
 * ancho máximo del portal.
 */
@Component({
  selector: 'app-modulo2',
  standalone: true,
  imports: [RouterOutlet, AppFooter],
  templateUrl: './modulo2.html',
  styleUrl: './modulo2.scss',
})
export class Modulo2 {
  private readonly router = inject(Router);

  private readonly urlActual = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );

  readonly libre = computed(() => (this.urlActual() ?? '').includes('/inicio'));
}
