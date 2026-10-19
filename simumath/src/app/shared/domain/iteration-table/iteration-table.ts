import { Component, input } from '@angular/core';
import { Badge } from '../../ui/badge/badge';

export interface IterationColumn {
  /** Clave de la fila a mostrar. */
  key: string;
  label: string;
  align?: 'left' | 'right' | 'center';
}

/**
 * Tabla de iteraciones numéricas (Bisección, Newton-Raphson, etc.).
 * Reproduce el estilo de las maquetas: header navy, celdas en serif,
 * fila de convergencia resaltada con badge.
 */
@Component({
  selector: 'app-iteration-table',
  standalone: true,
  imports: [Badge],
  templateUrl: './iteration-table.html',
  styleUrl: './iteration-table.scss',
})
export class IterationTable {
  readonly columns = input<IterationColumn[]>([]);
  readonly rows = input<Record<string, string | number>[]>([]);
  /** Índice de la fila que alcanza el criterio (se resalta). */
  readonly highlightRowIndex = input<number | undefined>(undefined);
  /** Texto del badge de la fila resaltada. */
  readonly highlightBadge = input('');

  /** Alineación de celda según columna. */
  cellAlign(col: IterationColumn): string {
    return col.align === 'left'
      ? 'cell--left'
      : col.align === 'center'
        ? 'cell--center'
        : 'cell--right';
  }
}