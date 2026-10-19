import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * Botón principal de acción con icono opcional.
 * Tres modos de renderizado:
 *  - `routerLink` → <a> con navegación interna (SPA);
 *  - `href`       → <a> hacia una URL externa o ancla;
 *  - por defecto  → <button> para acciones in-page ("Calcular", "Limpiar").
 */
@Component({
  selector: 'app-btn',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './btn.html',
  styleUrl: './btn.scss',
})
export class Btn {
  readonly variant = input<'primary' | 'secondary' | 'link'>('primary');
  readonly label = input.required<string>();
  readonly icon = input('');
  readonly disabled = input(false);
  /** Navegación interna (RouterLink). */
  readonly routerLink = input<string | undefined>(undefined);
  /** URL externa o ancla. */
  readonly href = input<string | undefined>(undefined);
  /** Ruta del portal (data-path) cuando se navega por enlace. */
  readonly path = input<string | undefined>(undefined);

  readonly variantClass = computed(() => {
    switch (this.variant()) {
      case 'secondary':
        return 'btn--secondary';
      case 'link':
        return 'btn--link';
      default:
        return 'btn--primary';
    }
  });
}