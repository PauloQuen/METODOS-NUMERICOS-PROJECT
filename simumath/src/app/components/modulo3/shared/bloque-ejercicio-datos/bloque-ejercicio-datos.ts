import { Component, computed, inject, input } from '@angular/core';
import { UiCard } from '../../../../shared/ui/ui-card/ui-card';
import { BloqueEjemploDatos } from '../bloque-ejemplo-datos/bloque-ejemplo-datos';
import type { Columna, DibujarMetodo } from '../../../../shared/models/metodo.model';
import type { EjemploModulo3, EjercicioModulo3 } from '../../modelos/modulo3.model';
import { ActividadesEjercicioService } from '../actividades-ejercicio/actividades-ejercicio.service';
import {
  SolutionGateService,
  POLITICA_POR_DEFECTO,
  claveDeGate,
  resolverConfig,
  type NivelDesbloqueo,
} from '../../../../shared/autoevaluacion-mejorada/solution-gate.service';
import type { FormatoRespuesta } from '../../../../shared/autoevaluacion-mejorada/respuesta.strategy';
import { ExerciseActions } from '../../../../shared/autoevaluacion-mejorada/exercise-actions/exercise-actions';
import { QuizPanel } from '../../../../shared/autoevaluacion-mejorada/quiz-panel/quiz-panel';
import { AnswerCheckPanel } from '../../../../shared/autoevaluacion-mejorada/answer-check-panel/answer-check-panel';

/**
 * Bloque de ejercicio del Módulo 3 (Autoevaluación).
 *
 * Muestra primero SOLO el planteamiento y los datos. Debajo, en la
 * misma fila, están los botones de las tres actividades:
 *
 * · Ver solución → el desarrollo completo (comportamiento de siempre).
 * · Cuestionario → preguntas de comprensión del ejercicio.
 * · Resolución   → verificación del resultado numérico.
 *
 * ── Un solo panel abierto por ejercicio ─────────────────────────────
 * El estado del acordeón, las respuestas y la verificación viven en
 * `ActividadesEjercicioService`, no en este componente. Así el alumno
 * puede ir a Teoría y volver sin perder nada. Los botones y paneles
 * nuevos solo aparecen si el contenido del ejercicio los define; por
 * eso los métodos que todavía no tienen cuestionario siguen mostrando
 * únicamente "Ver solución".
 *
 * ── Desbloqueo condicionado ─────────────────────────────────────────
 * "Ver solución" queda bloqueado hasta que el alumno apruebe el
 * cuestionario o verifique bien su respuesta (política heredada:
 * global → módulo → tipo → método → ejercicio). Tras N intentos
 * fallidos aparece "Ver solución de todos modos", con confirmación.
 * El valor correcto nunca se escribe en el DOM antes del desbloqueo:
 * la comparación ocurre en la capa de datos.
 *
 * Es genérico: no sabe si el ejercicio es de Lagrange o de mínimos
 * cuadrados. El componente del método es quien calcula las filas y le
 * pasa todo listo.
 */
@Component({
  selector: 'app-bloque-ejercicio-datos',
  standalone: true,
  imports: [UiCard, BloqueEjemploDatos, ExerciseActions, QuizPanel, AnswerCheckPanel],
  templateUrl: './bloque-ejercicio-datos.html',
  styleUrl: './bloque-ejercicio-datos.scss',
})
export class BloqueEjercicioDatos {
  private readonly actividades = inject(ActividadesEjercicioService);
  private readonly gate = inject(SolutionGateService);

  /** Ejercicio a resolver. */
  readonly ejercicio = input.required<EjercicioModulo3>();

  /** Filas calculadas de la solución. */
  readonly filas = input<Record<string, number | string>[]>([]);

  /** Columnas de la tabla de trabajo. */
  readonly columnas = input<Columna[]>([]);

  /** Índice de la fila resaltada. */
  readonly filaFinal = input<number | undefined>(undefined);

  /** Curva a dibujar (polinomio o recta). */
  readonly funcion = input.required<(x: number) => number>();

  /** Rango x del gráfico. */
  readonly rango = input({ min: -5, max: 5 });

  /** Dibujador propio del método. */
  readonly dibujarMetodo = input<DibujarMetodo | undefined>(undefined);

  /** Leyenda del gráfico. */
  readonly leyenda = input('');

  /** Título de la tabla de trabajo. */
  readonly tituloTabla = input('Tabla de trabajo');

  /**
   * ¿La autoevaluación mejorada está encendida para este método?
   * Por defecto sí: el bloque nació con las tres actividades. Los
   * métodos que todavía no se migraron pasan `false` explícitamente.
   */
  readonly mejorada = input(true);

  /** Contexto para la clave del gate (no se mezcla entre métodos). */
  readonly moduloId = input('modulo3');
  readonly tipoId = input('');
  readonly metodoId = input('modulo3');

  /**
   * Política heredada del módulo, el tipo y el método, de la más
   * general a la más específica. El ejercicio se agrega al final.
   */
  readonly desbloqueoBase = input<readonly NivelDesbloqueo[]>([POLITICA_POR_DEFECTO]);

  /** Estado recordado de este ejercicio (panel, respuestas, resultado). */
  readonly estadoActividad = computed(() => this.actividades.estadoDe(this.ejercicio().id));

  /** El panel abierto, o `null` si están todos cerrados. */
  readonly panel = computed(() => this.estadoActividad().panel);

  /** Preguntas del ejercicio; vacío si el contenido no las define. */
  readonly cuestionario = computed(() => this.ejercicio().cuestionario ?? []);

  /** Respuesta verificable; `undefined` si el contenido no la define. */
  readonly resolucion = computed(() => this.ejercicio().resolucion);

  readonly tieneCuestionario = computed(() => this.cuestionario().length > 0);

  readonly tieneResolucion = computed(() => this.resolucion() !== undefined);

  readonly esCasuistica = computed(() => this.ejercicio().tipo === 'casuistica');

  /** Los puntos del enunciado, para el planteamiento. */
  readonly puntos = computed(() => this.ejercicio().calculo.puntos ?? []);

  /** Formato de la respuesta; los ejercicios viejos siguen siendo escalares. */
  readonly formato = computed<FormatoRespuesta>(
    () => this.ejercicio().formatoRespuesta ?? 'escalar',
  );

  /** Clave única: incluye el método para no compartir estado entre páginas. */
  readonly claveGate = computed(() =>
    claveDeGate(this.moduloId(), this.tipoId(), this.metodoId(), this.ejercicio().id),
  );

  /** Política efectiva: base heredada + lo que declare el ejercicio. */
  readonly configGate = computed(() =>
    resolverConfig([...this.desbloqueoBase(), this.ejercicio().desbloqueo ?? {}]),
  );

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

    this.actividades.verificar(this.ejercicio().id, resolucion, this.formato());

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
  protected comoEjemplo(): EjemploModulo3 {
    return { ...this.ejercicio() };
  }
}
