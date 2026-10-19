import { Component, computed, input } from '@angular/core';

/**
 * Indicador compacto: icono circular + label + valor destacado (+ caption).
 * Se usa para parámetros del problema ("Función", "Intervalo", "Tolerancia").
 */
@Component({
  selector: 'app-stat-chip',
  standalone: true,
  templateUrl: './stat-chip.html',
  styleUrl: './stat-chip.scss',
})
export class StatChip {
  readonly icon = input.required<string>();
  readonly label = input.required<string>();
  readonly value = input.required<string>();
  readonly caption = input('');

  /** Tonalidad del círculo del icono. */
  readonly iconBg = input<'navy' | 'amber' | 'neutral'>('navy');

  readonly iconClass = computed(
    () =>
      ({
        navy: 'stat-chip__icon--navy',
        amber: 'stat-chip__icon--amber',
        neutral: 'stat-chip__icon--neutral',
      })[this.iconBg()],
  );
}