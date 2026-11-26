import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';
import { AppFooter } from '../../shared/layout/app-footer/app-footer';

/**
 * Módulo 5 — Ecuaciones diferenciales ordinarias.
 *
 * Layout común. Igual que en el Módulo 4, la landing trae su propio hero a
 * todo el ancho y las páginas de método usan el ancho máximo del portal.
 */
@Component({
  selector: 'app-modulo5',
  standalone: true,
  imports: [RouterOutlet, AppFooter],
  templateUrl: './modulo5.html',
  styleUrl: './modulo5.scss',
})
export class Modulo5 {
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
