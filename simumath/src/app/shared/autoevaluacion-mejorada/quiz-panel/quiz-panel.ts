import { Component, computed, input, output } from '@angular/core';
import { PanelEjercicio } from '../../../components/modulo3/shared/actividades-ejercicio/panel-ejercicio';
import { CuestionarioEjercicio } from '../../../components/modulo3/shared/actividades-ejercicio/cuestionario-ejercicio';
import type { EstadoActividadEjercicio } from '../../../components/modulo3/shared/actividades-ejercicio/actividades-ejercicio.service';
import type { PreguntaCuestionarioM3 } from '../../../components/modulo3/modelos/modulo3.model';

/**
 * PANEL DE CUESTIONARIO.
 *
 * Envuelve el panel desplegable y el cuestionario que ya existían, para
 * que la Autoevaluación de cualquier método lo use sin repetir ids,
 * títulos ni el cableado de eventos.
 */
@Component({
  selector: 'app-quiz-panel',
  standalone: true,
  imports: [PanelEjercicio, CuestionarioEjercicio],
  templateUrl: './quiz-panel.html',
})
export class QuizPanel {
  readonly ejercicioId = input.required<string>();
  readonly preguntas = input.required<PreguntaCuestionarioM3[]>();
  readonly estado = input.required<EstadoActividadEjercicio>();

  readonly titulo = input('Cuestionario');
  readonly subtitulo = input('Comprobá lo que entendiste de este ejercicio.');

  readonly responder = output<{ preguntaId: string; opcionId: string }>();
  readonly comprobar = output<void>();
  readonly reintentar = output<void>();

  protected readonly panelId = computed(() => `ae-panel-${this.ejercicioId()}-cuestionario`);

  protected readonly labelledby = computed(() => `ae-btn-${this.ejercicioId()}-cuestionario`);
}
