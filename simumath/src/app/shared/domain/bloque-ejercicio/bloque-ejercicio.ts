import { Component, computed, inject, input, output, signal } from '@angular/core';
import { UiCard } from '../../ui/ui-card/ui-card';
import { BloqueEjemplo } from '../bloque-ejemplo/bloque-ejemplo';
import type {
  Columna,
  DibujarMetodo,
  EjemploBase,
  EjercicioBase,
} from '../../models/metodo.model';
import type { ResolucionEjercicioM3 } from '../../../components/modulo3/modelos/modulo3.model';
import { ActividadesEjercicioService } from '../../../components/modulo3/shared/actividades-ejercicio/actividades-ejercicio.service';
import {
  SolutionGateService,
  POLITICA_POR_DEFECTO,
  claveDeGate,
  resolverConfig,
  type NivelDesbloqueo,
} from '../../autoevaluacion-mejorada/solution-gate.service';
import { ExerciseActions } from '../../autoevaluacion-mejorada/exercise-actions/exercise-actions';
import { QuizPanel } from '../../autoevaluacion-mejorada/quiz-panel/quiz-panel';
import { AnswerCheckPanel } from '../../autoevaluacion-mejorada/answer-check-panel/answer-check-panel';

/**
 * Bloque de ejercicio (Autoevaluación) — mismo modelo que el Módulo 3.
 *
 * Muestra el planteamiento y, debajo, las tres actividades:
 *
 * · Ver solución → desarrollo completo (BloqueEjemplo).
 * · Cuestionario → preguntas de comprensión del ejercicio.
 * · Resolución   → verificación del resultado numérico.
 *
 * ── Aditivo ──────────────────────────────────────────────────────────
 * Con `mejorada` en `false` se renderiza el botón único de siempre y
 * nada más: las páginas que todavía no se migraron no cambian. Con la
 * bandera encendida, el desbloqueo se resuelve con la política heredada
 * (global → módulo → tipo → método → ejercicio) y el valor correcto
 * nunca se escribe en el DOM antes de desbloquear.
 *
 * El estado del acordeón, las respuestas y la verificación viven en
 * `ActividadesEjercicioService`, así que sobreviven al cambio de
 * pestaña.
 */
@Component({
  selector: 'app-bloque-ejercicio',
  standalone: true,
  imports: [UiCard, BloqueEjemplo, ExerciseActions, QuizPanel, AnswerCheckPanel],
  templateUrl: './bloque-ejercicio.html',
  styleUrl: './bloque-ejercicio.scss',
})
export class BloqueEjercicio {
  /** Ejercicio a resolver. */
  readonly ejercicio = input.required<EjercicioBase>();

  /** Filas calculadas de la solución. */
  readonly filas = input<Record<string, number | string>[]>([]);

  /** Columnas de la tabla. */
  readonly columnas = input<Columna[]>([]);

  /** Índice de la fila final. */
  readonly filaFinal = input<number | undefined>(undefined);

  /** Texto del badge de la fila resaltada. */
  readonly highlightBadge = input('Cumple criterio');

  readonly funcion = input<(x: number) => number>(() => 0);

  /** Rango x del gráfico. */
  readonly rango = input({ min: -5, max: 5 });

  readonly dibujarMetodo = input<DibujarMetodo | undefined>(undefined);

  /** Raíz aproximada. */
  readonly raiz = input<number | undefined>(undefined);

  readonly textosPasos = input<string[] | undefined>(undefined);

  readonly tituloPasos = input('Pasos (iteraciones a mano)');
  readonly etiquetaPaso = input('Iteración');
  readonly tituloCriterio = input('Criterio de convergencia');

  /**
   * ¿La autoevaluación mejorada está encendida para este método?
   * Por defecto no: cada página la enciende explícitamente.
   */
  readonly mejorada = input(false);

  /** Contexto para la clave del gate (no se mezcla entre métodos). */
  readonly moduloId = input('modulo1');
  readonly tipoId = input('');
  readonly metodoId = input('');

  /** Política heredada, de la más general a la más específica. */
  readonly desbloqueoBase = input<readonly NivelDesbloqueo[]>([POLITICA_POR_DEFECTO]);

  /** ¿Muestra la solución en el modo histórico? */
  readonly mostrarSolucion = signal(false);

  readonly pasoCambiado = output<number>();

  private readonly actividades = inject(ActividadesEjercicioService);
  private readonly gate = inject(SolutionGateService);

  readonly estadoActividad = computed(() => this.actividades.estadoDe(this.ejercicio().id));
  readonly panel = computed(() => this.estadoActividad().panel);

  readonly cuestionario = computed(() => this.ejercicio().cuestionario ?? []);
  readonly resolucion = computed(() => this.ejercicio().resolucion);
  readonly tieneCuestionario = computed(() => this.cuestionario().length > 0);
  readonly tieneResolucion = computed(() => this.resolucion() !== undefined);

  readonly esCasuistica = computed(() => this.ejercicio().tipo === 'casuistica');

  /** Clave única: incluye el método para no compartir estado entre páginas. */
  readonly claveGate = computed(() =>
    claveDeGate(this.moduloId(), this.tipoId(), this.metodoId(), this.ejercicio().id),
  );

  /** Política efectiva: base heredada + lo que declare el ejercicio. */
  readonly configGate = computed(() =>
    resolverConfig([...this.desbloqueoBase(), this.ejercicio().desbloqueo ?? {}]),
  );

  /** La resolución con la forma que espera el panel compartido. */
  readonly resolucionParaPanel = computed<ResolucionEjercicioM3 | undefined>(() => {
    const r = this.resolucion();
    return r ? { ...r, respuestaFinalTexto: r.respuestaFinalTexto ?? '' } : undefined;
  });

  /** ¿Se puede abrir el desarrollo completo? */
  readonly puedeVerSolucion = computed(() => {
    if (!this.mejorada()) return true;
    if (!this.tieneCuestionario() && !this.tieneResolucion()) return true;
    return this.gate.puedeDesbloquear(this.claveGate(), this.configGate());
  });

  /** Qué le falta al alumno, en una línea. */
  readonly textoBloqueado = computed(() => {
    if (!this.mejorada() || this.puedeVerSolucion()) return '';
    return this.gate.textoQueFalta(this.claveGate(), this.configGate());
  });

  /** ¿Ya falló lo suficiente como para ofrecer la salida? */
  readonly mostrarRendirse = computed(() =>
    this.mejorada() ? this.gate.debeMostrarRendirse(this.claveGate(), this.configGate()) : false,
  );

  protected alternar(): void {
    this.mostrarSolucion.update((v) => !v);
  }

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
      // Un cuestionario desaprobado también cuenta como intento serio.
      intentosRespuesta: aprobado ? intentos : intentos + 1,
    });
  }

  protected reintentarCuestionario(): void {
    this.actividades.reintentar(this.ejercicio().id);
  }

  protected actualizarEntrada(entrada: string): void {
    this.actividades.actualizarEntrada(this.ejercicio().id, entrada);
  }

  protected verificarResolucion(): void {
    const resolucion = this.resolucion();
    if (!resolucion) return;

    const formato = this.ejercicio().formatoRespuesta ?? 'escalar';
    this.actividades.verificar(this.ejercicio().id, resolucion, formato);

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

  /** El ejercicio convertido a Ejemplo para reutilizar el bloque. */
  protected convertirAEjemplo(): EjemploBase {
    return { ...this.ejercicio() } as EjemploBase;
  }
}
