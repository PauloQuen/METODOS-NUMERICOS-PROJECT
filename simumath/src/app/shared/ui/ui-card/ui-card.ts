import { Component, input } from '@angular/core';

/**
 * Cascarón de tarjeta con elevación configurable.
 * El contenido se proyecta con <ng-content>.
 */
@Component({
  selector: 'ui-card',
  standalone: true,
  templateUrl: './ui-card.html',
  styleUrl: './ui-card.scss',
})
export class UiCard {
  /** Elevación: 'sm' (contenido estático) o 'md' (elementos interactivos). */
  readonly elevation = input<'sm' | 'md'>('sm');

  /** Padding interno (semántico: sm | md | lg | xl). */
  readonly padding = input<'sm' | 'md' | 'lg' | 'xl'>('lg');
}