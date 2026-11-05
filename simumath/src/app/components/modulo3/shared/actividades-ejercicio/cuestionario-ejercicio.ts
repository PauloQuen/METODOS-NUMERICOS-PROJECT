import { Component, computed, input, output } from '@angular/core';
import type { PreguntaCuestionarioM3 } from '../../modelos/modulo3.model';
import type { EstadoActividadEjercicio } from './actividades-ejercicio.service';

/**
 * CUESTIONARIO DE COMPRENSIÓN de un ejercicio.
 *
 * Es presentacional: las respuestas y el estado de corrección los
 * recibe del bloque, que los guarda en `ActividadesEjercicioService`.
 * Así el cuestionario no se reinicia al cambiar de pestaña y el mismo
 * componente sirve para los seis ejercicios (y para otros métodos).
 */
@Component({
  selector: 'app-cuestionario-ejercicio',
  standalone: true,
  templateUrl: './cuestionario-ejercicio.html',
  styleUrl: './cuestionario-ejercicio.scss',
})
export class CuestionarioEjercicio {
  /** Id del ejercicio, para que los grupos de radios no se pisen. */
  readonly ejercicioId = input.required<string>();

  readonly preguntas = input.required<PreguntaCuestionarioM3[]>();

  readonly estado = input.required<EstadoActividadEjercicio>();

  readonly responder = output<{ preguntaId: string; opcionId: string }>();

  readonly comprobar = output<void>();

  readonly reintentar = output<void>();

  protected readonly todasRespondidas = computed(() =>
    this.preguntas().every((p) => Boolean(this.estado().respuestas[p.id])),
  );

  protected readonly puntaje = computed(
    () => this.preguntas().filter((p) => this.esCorrecta(p)).length,
  );

  protected readonly mensajePuntaje = computed(() => {
    const total = this.preguntas().length;
    const aciertos = this.puntaje();
    return aciertos === total
      ? `Puntaje: ${aciertos} de ${total}. ¡Todo correcto!`
      : `Puntaje: ${aciertos} de ${total}. Revisá las respuestas marcadas y volvé a intentar.`;
  });

  protected esCorrecta(pregunta: PreguntaCuestionarioM3): boolean {
    return this.estado().respuestas[pregunta.id] === pregunta.correcta;
  }

  protected nombreGrupo(preguntaId: string): string {
    return `ae-${this.ejercicioId()}-${preguntaId}`;
  }

  protected alResponder(preguntaId: string, opcionId: string): void {
    this.responder.emit({ preguntaId, opcionId });
  }
}
