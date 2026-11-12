import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';
import { AppFooter } from '../../shared/layout/app-footer/app-footer';

/**
 * Módulo 0 — Errores numéricos.
 *
 * Layout común de sus pantallas, igual que el Módulo 3: la portada trae
 * su propio hero a todo el ancho y el resto vive dentro del ancho
 * máximo del portal. El módulo NO renumera nada: convive con los
 * Módulos 1, 2 y 3 tal como están.
 */
@Component({
  selector: 'app-modulo0',
  standalone: true,
  imports: [RouterOutlet, AppFooter],
  templateUrl: './modulo0.html',
  styleUrl: './modulo0.scss',
})
export class Modulo0 {
  private readonly router = inject(Router);

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
