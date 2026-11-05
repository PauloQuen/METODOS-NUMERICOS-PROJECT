import { Component, computed, input, output, signal } from '@angular/core';

/** Panel abierto en la tarjeta; `null` = todos cerrados. */
export type PanelEjercicioActivo = 'solucion' | 'cuestionario' | 'resolucion' | null;

/**
 * FILA DE ACCIONES DE UN EJERCICIO.
 *
 * Es la misma fila de tres botones que ya usa la Autoevaluación de
 * Lagrange: "Ver solución" (primario), "Cuestionario" y "Resolución"
 * (secundarios). La diferencia es que acá vive también el estado de
 * bloqueo: el botón primario queda deshabilitado, con candado, texto de
 * ayuda y el atajo de rendición.
 *
 * No decide la política: recibe `puedeVerSolucion` y `textoBloqueado`
 * ya resueltos por el bloque. Así el mismo componente sirve para
 * cualquier método y cualquier formato de respuesta.
 */
@Component({
  selector: 'app-exercise-actions',
  standalone: true,
  templateUrl: './exercise-actions.html',
  styleUrl: './exercise-actions.scss',
})
export class ExerciseActions {
  readonly ejercicioId = input.required<string>();

  readonly panel = input<PanelEjercicioActivo>(null);

  readonly tieneCuestionario = input(false);
  readonly tieneResolucion = input(false);

  readonly puedeVerSolucion = input(true);
  readonly textoBloqueado = input('');

  readonly mostrarRendirse = input(false);

  readonly alternarSolucion = output<void>();
  readonly alternarCuestionario = output<void>();
  readonly alternarResolucion = output<void>();
  readonly rendirse = output<void>();

  protected readonly confirmando = signal(false);

  /** Se anuncia cuando el ejercicio pasa a estar desbloqueado. */
  protected readonly anuncio = computed(() =>
    this.puedeVerSolucion() && (this.tieneCuestionario() || this.tieneResolucion())
      ? 'Solución desbloqueada.'
      : '',
  );

  protected readonly ayudaId = computed(() => `ae-ayuda-${this.ejercicioId()}`);

  protected idBoton(panel: Exclude<PanelEjercicioActivo, null>): string {
    return `ae-btn-${this.ejercicioId()}-${panel}`;
  }

  protected confirmarRendirse(): void {
    this.confirmando.set(false);
    this.rendirse.emit();
  }
}
