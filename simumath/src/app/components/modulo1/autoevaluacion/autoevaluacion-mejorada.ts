import { Component, inject } from '@angular/core';
import { UiCard } from '../../../shared/ui/ui-card/ui-card';
import { Badge } from '../../../shared/ui/badge/badge';
import { ExerciseActions } from '../../../shared/autoevaluacion-mejorada/exercise-actions/exercise-actions';
import { QuizPanel } from '../../../shared/autoevaluacion-mejorada/quiz-panel/quiz-panel';
import { AnswerCheckPanel } from '../../../shared/autoevaluacion-mejorada/answer-check-panel/answer-check-panel';
import { ActividadesEjercicioService } from '../../modulo3/shared/actividades-ejercicio/actividades-ejercicio.service';
import {
  SolutionGateService,
  POLITICA_POR_DEFECTO,
  claveDeGate,
  resolverConfig,
} from '../../../shared/autoevaluacion-mejorada/solution-gate.service';
import { DESBLOQUEO_MODULO1, DESBLOQUEO_TIPOS_MODULO1 } from '../autoevaluacion.config';
import { EJERCICIOS_AUTO_MEJORADOS } from './datos/modulo1-autoevaluacion.data';

/**
 * AUTOEVALUACIÓN TRANSVERSAL DEL MÓDULO 1.
 *
 * Un ejercicio por método del módulo. Usa exactamente los mismos
 * componentes y la misma política que la autoevaluación de cada método:
 * Ver solución, Cuestionario y Resolución, con desbloqueo condicionado.
 *
 * El estado se guarda en `ActividadesEjercicioService` y la clave del
 * gate incluye `modulo1/transversal`, así que no se mezcla con las
 * pestañas de Bisección, Newton o el resto.
 */
@Component({
  selector: 'app-autoevaluacion-mejorada',
  imports: [UiCard, Badge, ExerciseActions, QuizPanel, AnswerCheckPanel],
  templateUrl: './autoevaluacion-mejorada.html',
  styleUrl: './autoevaluacion-mejorada.scss',
})
export class AutoevaluacionMejorada {
  readonly ejercicios = EJERCICIOS_AUTO_MEJORADOS;
  readonly actividades = inject(ActividadesEjercicioService);
  private readonly gate = inject(SolutionGateService);

  private readonly config = resolverConfig([
    POLITICA_POR_DEFECTO,
    DESBLOQUEO_MODULO1,
    DESBLOQUEO_TIPOS_MODULO1['transversal'] ?? {},
  ]);

  private clave(ejercicioId: string): string {
    return claveDeGate('modulo1', 'transversal', 'transversal', ejercicioId);
  }

  estadoDe(ejercicioId: string) {
    return this.actividades.estadoDe(ejercicioId);
  }

  panelDe(ejercicioId: string) {
    return this.actividades.estadoDe(ejercicioId).panel;
  }

  estaAbierto(
    ejercicioId: string,
    panel: 'solucion' | 'cuestionario' | 'resolucion',
  ): boolean {
    return this.panelDe(ejercicioId) === panel;
  }

  puedeVerSolucion(ejercicioId: string): boolean {
    return this.gate.puedeDesbloquear(this.clave(ejercicioId), this.config);
  }

  textoBloqueado(ejercicioId: string): string {
    return this.gate.textoQueFalta(this.clave(ejercicioId), this.config);
  }

  mostrarRendirse(ejercicioId: string): boolean {
    return this.gate.debeMostrarRendirse(this.clave(ejercicioId), this.config);
  }

  mostrarPanel(ejercicioId: string, panel: string): string {
    return `ae-panel-${ejercicioId}-${panel}`;
  }

  alternarSolucion(ejercicioId: string): void {
    if (!this.puedeVerSolucion(ejercicioId)) return;
    this.actividades.alternarPanel(ejercicioId, 'solucion');
  }

  alternarCuestionario(ejercicioId: string): void {
    this.actividades.alternarPanel(ejercicioId, 'cuestionario');
  }

  alternarResolucion(ejercicioId: string): void {
    this.actividades.alternarPanel(ejercicioId, 'resolucion');
  }

  responder(ejercicioId: string, preguntaId: string, opcionId: string): void {
    this.actividades.responder(ejercicioId, preguntaId, opcionId);
  }

  reintentar(ejercicioId: string): void {
    this.actividades.reintentar(ejercicioId);
  }

  actualizarEntrada(ejercicioId: string, entrada: string): void {
    this.actividades.actualizarEntrada(ejercicioId, entrada);
  }

  alternarRespuesta(ejercicioId: string): void {
    this.actividades.alternarRespuesta(ejercicioId);
  }

  rendirse(ejercicioId: string): void {
    this.gate.actualizar(this.clave(ejercicioId), { verSolucionForzado: true });
  }

  alComprobarCuestionario(ejercicioId: string): void {
    this.actividades.comprobar(ejercicioId);

    const ejercicio = this.ejercicios.find((e) => e.id === ejercicioId);
    const total = ejercicio?.cuestionario?.length ?? 0;
    if (total === 0) return;

    const estado = this.actividades.estadoDe(ejercicioId);
    let correctas = 0;
    for (const pregunta of ejercicio?.cuestionario ?? []) {
      if (estado.respuestas[pregunta.id] === pregunta.correcta) correctas++;
    }

    const aprobado = correctas / total >= this.config.umbralCuestionario;
    const clave = this.clave(ejercicioId);
    const intentos = this.gate.estadoDe(clave).intentosRespuesta;

    this.gate.actualizar(clave, {
      cuestionarioAprobado: aprobado,
      respuestasCorrectas: correctas,
      totalPreguntas: total,
      intentosRespuesta: aprobado ? intentos : intentos + 1,
    });
  }

  alVerificarResolucion(ejercicioId: string): void {
    const ejercicio = this.ejercicios.find((e) => e.id === ejercicioId);
    if (!ejercicio?.resolucion) return;

    this.actividades.verificar(
      ejercicioId,
      ejercicio.resolucion,
      ejercicio.formatoRespuesta ?? 'escalar',
    );

    const clave = this.clave(ejercicioId);
    const estado = this.actividades.estadoDe(ejercicioId);
    const intentos = this.gate.estadoDe(clave).intentosRespuesta;

    if (estado.verificacion === 'acierto') {
      this.gate.actualizar(clave, { respuestaCorrecta: true });
    } else {
      this.gate.actualizar(clave, { intentosRespuesta: intentos + 1 });
    }
  }
}
