import { Component, computed, input } from '@angular/core';

export type BadgeVariant = 'navy' | 'amber' | 'amber-solid' | 'teal' | 'outline' | 'error';

/**
 * Pill de una sola línea para metadatos:
 * fase/módulo ("Módulo 1 · Equipo 1"), estados ("FIN", "Cuadrático"),
 * tags de método ("Bisección") y avisos ("Garantía Absoluta").
 */
@Component({
  selector: 'app-badge',
  standalone: true,
  templateUrl: './badge.html',
  styleUrl: './badge.scss',
})
export class Badge {
  readonly text = input.required<string>();
  readonly variant = input<BadgeVariant>('amber');

  /** Clase de color según la variante elegida. */
  readonly variantClass = computed(
    () =>
      ({
        navy: 'badge--navy',
        amber: 'badge--amber',
        'amber-solid': 'badge--amber-solid',
        teal: 'badge--teal',
        outline: 'badge--outline',
        error: 'badge--error',
      })[this.variant()],
  );
}