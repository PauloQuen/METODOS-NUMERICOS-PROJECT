import { Component, computed, input, output } from '@angular/core';
import { PanelEjercicio } from '../../../components/modulo3/shared/actividades-ejercicio/panel-ejercicio';
import { ResolucionEjercicio } from '../../../components/modulo3/shared/actividades-ejercicio/resolucion-ejercicio';
import type { EstadoActividadEjercicio } from '../../../components/modulo3/shared/actividades-ejercicio/actividades-ejercicio.service';
import type { ResolucionEjercicioM3 } from '../../../components/modulo3/modelos/modulo3.model';
import type { FormatoRespuesta } from '../respuesta.strategy';

/**
 * PANEL DE RESOLUCIÓN / RESPUESTA.
 *
 * Envuelve el panel compacto y el campo de verificación. El formato de
 * respuesta decide cómo se lee y compara lo que escribe el alumno; el
 * panel solo lo muestra.
 */
@Component({
  selector: 'app-answer-check-panel',
  standalone: true,
  imports: [PanelEjercicio, ResolucionEjercicio],
  templateUrl: './answer-check-panel.html',
})
export class AnswerCheckPanel {
  readonly ejercicioId = input.required<string>();
  readonly resolucion = input.required<ResolucionEjercicioM3>();
  readonly estado = input.required<EstadoActividadEjercicio>();
  readonly formato = input<FormatoRespuesta>('escalar');

  readonly entradaChange = output<string>();
  readonly verificar = output<void>();
  readonly alternarRespuesta = output<void>();

  protected readonly panelId = computed(() => `ae-panel-${this.ejercicioId()}-resolucion`);

  protected readonly labelledby = computed(() => `ae-btn-${this.ejercicioId()}-resolucion`);
}
