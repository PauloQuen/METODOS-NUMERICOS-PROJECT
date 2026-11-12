import { Component, computed, inject, input } from '@angular/core';
import { UiCard } from '../../../../shared/ui/ui-card/ui-card';
import type { Columna } from '../../../../shared/models/metodo.model';
import type { EjercicioError, EjemploError } from '../../modelos/modulo0.model';
import { BloqueEjemploError } from '../bloque-ejemplo-error/bloque-ejemplo-error';
import { ActividadesEjercicioService } from '../../../modulo3/shared/actividades-ejercicio/actividades-ejercicio.service';
import {
  SolutionGateService,
  POLITICA_POR_DEFECTO,
  claveDeGate,
  resolverConfig,
  type NivelDesbloqueo,
} from '../../../../shared/autoevaluacion-mejorada/solution-gate.service';
import { ExerciseActions } from '../../../../shared/autoevaluacion-mejorada/exercise-actions/exercise-actions';
import { QuizPanel } from '../../../../shared/autoevaluacion-mejorada/quiz-panel/quiz-panel';
import { AnswerCheckPanel } from '../../../../shared/autoevaluacion-mejorada/answer-check-panel/answer-check-panel';
import { SolucionGuiada } from '../../../../shared/autoevaluacion-mejorada/solucion-guiada/solucion-guiada';
import type { ResolucionEjercicioM3 } from '../../../modulo3/modelos/modulo3.model';

/**
 * BLOQUE DE EJERCICIO DEL MÓDULO 0.
 *
 * ── Qué se reutiliza y qué es propio ────────────────────────────────
 * Se reutilizan TAL CUAL las tres piezas genéricas de la autoevaluación
 * mejorada del portal: `ExerciseActions` (botones y candado),
 * `QuizPanel` (cuestionario) y `AnswerCheckPanel` (verificación con
 * tolerancia), más `SolutionGateService` y `ActividadesEjercicioService`
 * para el estado y la política de desbloqueo. Eso garantiza el mismo
 * comportamiento que el Módulo 3: umbral 2/3, pista, bloqueo de "Ver
 * solución" y salida tras N intentos.
 *
 * Lo propio del Módulo 0 es el PLANTEAMIENTO y la solución: no hay
 * polinomio ni gráfico, hay cuentas escalares. Por eso la solución usa
 * `BloqueEjemploError` en lugar del bloque de datos del M3. No se
 * modificó ni una línea del bloque del M3.
 *
 * El `id` del contenedor (`ejercicio-<id>`) es el ancla que usa el
 * buscador para abrir directamente un ejercicio.
 */
@Component({
  selector: 'app-m0-bloque-ejercicio-error',
  standalone: true,
  imports: [
    UiCard,
    BloqueEjemploError,
    ExerciseActions,
    QuizPanel,
    AnswerCheckPanel,
    SolucionGuiada,
  ],
  templateUrl: './bloque-ejercicio-error.html',
  styleUrl: './bloque-ejercicio-error.scss',
})
export class BloqueEjercicioError {
  private readonly actividades = inject(ActividadesEjercicioService);
  private readonly gate = inject(SolutionGateService);

  readonly ejercicio = input.required<EjercicioError>();
  readonly columnas = input<Columna[]>([]);

  readonly moduloId = input('modulo0');
  readonly tipoId = input('');
  readonly metodoId = input('');

  /** La autoevaluación mejorada está encendida por defecto en el M0. */
  readonly mejorada = input(true);

  readonly desbloqueoBase = input<readonly NivelDesbloqueo[]>([POLITICA_POR_DEFECTO]);

  readonly estadoActividad = computed(() => this.actividades.estadoDe(this.ejercicio().id));
  readonly panel = computed(() => this.estadoActividad().panel);

  readonly cuestionario = computed(() => this.ejercicio().cuestionario ?? []);
  readonly resolucion = computed(() => this.ejercicio().resolucion);
  readonly tieneCuestionario = computed(() => this.cuestionario().length > 0);
  readonly tieneResolucion = computed(() => this.resolucion() !== undefined);
  readonly esCasuistica = computed(() => this.ejercicio().tipo === 'casuistica');

  /** La resolución con la forma que espera el panel compartido. */
  readonly resolucionParaPanel = computed<ResolucionEjercicioM3 | undefined>(() => {
    const r = this.resolucion();
    return r ? { ...r, respuestaFinalTexto: r.respuestaFinalTexto ?? '' } : undefined;
  });

  readonly claveGate = computed(() =>
    claveDeGate(this.moduloId(), this.tipoId(), this.metodoId(), this.ejercicio().id),
  );

  readonly configGate = computed(() =>
    resolverConfig([...this.desbloqueoBase(), this.ejercicio().desbloqueo ?? {}]),
  );

  readonly puedeVerSolucion = computed(() => {
    if (!this.mejorada()) return true;
    if (!this.tieneCuestionario() && !this.tieneResolucion()) return true;
    return this.gate.puedeDesbloquear(this.claveGate(), this.configGate());
  });

  readonly textoBloqueado = computed(() => {
    if (!this.mejorada() || this.puedeVerSolucion()) return '';
    return this.gate.textoQueFalta(this.claveGate(), this.configGate());
  });

  readonly mostrarRendirse = computed(() =>
    this.mejorada() ? this.gate.debeMostrarRendirse(this.claveGate(), this.configGate()) : false,
  );

  /** El ejercicio convertido a Ejemplo para reutilizar la tarjeta. */
  readonly comoEjemplo = computed<EjemploError>(() => ({ ...this.ejercicio() }));

  protected alternarSolucion(): void {
    if (!this.puedeVerSolucion()) return;
    this.actividades.alternarPanel(this.ejercicio().id, 'solucion');
  }

  protected alternarCuestionario(): void {
    this.actividades.alternarPanel(this.ejercicio().id, 'cuestionario');
  }

  protected alternarResolucion(): void {
    this.actividades.alternarPanel(this.ejercicio().id, 'resolucion');
  }

  protected responder(preguntaId: string, opcionId: string): void {
    this.actividades.responder(this.ejercicio().id, preguntaId, opcionId);
  }

  protected comprobarCuestionario(): void {
    this.actividades.comprobar(this.ejercicio().id);

    const total = this.cuestionario().length;
    if (total === 0) return;

    const estado = this.actividades.estadoDe(this.ejercicio().id);
    let correctas = 0;
    for (const pregunta of this.cuestionario()) {
      if (estado.respuestas[pregunta.id] === pregunta.correcta) correctas++;
    }

    const aprobado = correctas / total >= this.configGate().umbralCuestionario;
    const clave = this.claveGate();
    const intentos = this.gate.estadoDe(clave).intentosRespuesta;

    this.gate.actualizar(clave, {
      cuestionarioAprobado: aprobado,
      respuestasCorrectas: correctas,
      totalPreguntas: total,
      intentosRespuesta: aprobado ? intentos : intentos + 1,
    });
  }

  protected reintentarCuestionario(): void {
    this.actividades.reintentar(this.ejercicio().id, this.cuestionario());
  }

  protected actualizarEntrada(entrada: string): void {
    this.actividades.actualizarEntrada(this.ejercicio().id, entrada);
  }

  protected verificarResolucion(): void {
    const resolucion = this.resolucion();
    if (!resolucion) return;

    this.actividades.verificar(
      this.ejercicio().id,
      resolucion,
      this.ejercicio().formatoRespuesta ?? 'escalar',
    );

    const clave = this.claveGate();
    const estado = this.actividades.estadoDe(this.ejercicio().id);
    const intentos = this.gate.estadoDe(clave).intentosRespuesta;

    if (estado.verificacion === 'acierto') {
      this.gate.actualizar(clave, { respuestaCorrecta: true });
    } else {
      this.gate.actualizar(clave, { intentosRespuesta: intentos + 1 });
    }
  }

  protected alternarRespuesta(): void {
    this.actividades.alternarRespuesta(this.ejercicio().id);
  }

  protected rendirse(): void {
    this.gate.actualizar(this.claveGate(), { verSolucionForzado: true });
  }
}
