import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * Footer institucional del portal, presente en las 5 páginas.
 * Marca, acceso rápido y meta de distribución.
 */
@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './app-footer.html',
  styleUrl: './app-footer.scss',
})
export class AppFooter {
  readonly year = input(2026);
}