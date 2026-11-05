import { Component, input } from '@angular/core';

/**
 * Caja desplegable reutilizable de la Autoevaluación del Módulo 3.
 *
 * No decide cuándo se abre: el bloque de ejercicio la renderiza solo si
 * su panel está activo. Así el mismo componente sirve para el
 * cuestionario (grande) y para la resolución (compacto), y el estado
 * del acordeón vive en un único lugar.
 */
@Component({
  selector: 'app-panel-ejercicio',
  standalone: true,
  templateUrl: './panel-ejercicio.html',
  styleUrl: './panel-ejercicio.scss',
})
export class PanelEjercicio {
  /** Id del panel, para el `aria-controls` del botón que lo abre. */
  readonly panelId = input.required<string>();

  /** Id del botón que nombra la región. */
  readonly labelledby = input.required<string>();

  readonly titulo = input.required<string>();

  readonly subtitulo = input('');

  /** `grande` ocupa el ancho de la tarjeta; `compacto` se limita a 38rem. */
  readonly tamano = input<'grande' | 'compacto'>('grande');
}
