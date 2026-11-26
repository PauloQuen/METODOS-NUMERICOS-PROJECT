import { Component, computed, inject, input, signal } from '@angular/core';
import { UiCard } from '../../../../shared/ui/ui-card/ui-card';
import { BloqueEjemploEdo } from '../bloque-ejemplo-edo/bloque-ejemplo-edo';
import { MathTexto } from '../../../../shared/math/math-texto';
import { PanelResultado } from '../../../../shared/autoevaluacion-mejorada/panel-resultado/panel-resultado';
import { CuestionarioEstrictoService } from '../../../../shared/autoevaluacion-mejorada/cuestionario-estricto.service';
import {
  ResultadoEjercicioService,
  claveResultado,
} from '../../../../shared/autoevaluacion-mejorada/resultado-ejercicio.service';
import {
  TEXTO_BLOQUEO_ESTRICTO,
  puedeVerSolucionEstricto,
} from '../../../../shared/autoevaluacion-mejorada/gate-estricto';
import type { Columna, DibujarMetodo } from '../../../../shared/models/metodo.model';
import type { EjercicioModulo5 } from '../../modelos/modulo5.model';
import type { EdoVista } from '../edo-vista';

/**
 * Bloque de ejercicio del Módulo 5.
 *
 * Muestra primero el planteamiento y una pista. El botón «Ver solución»
 * queda BLOQUEADO hasta que TODAS las preguntas estén correctas,
 * comprobadas, y el resultado marcado como enviado. Es la misma regla
 * estricta del bloque de M4, con clave propia por módulo/tipo/método/
 * ejercicio. No hay atajo para “ver de todos modos”.
 */
@Component({
  selector: 'app-bloque-ejercicio-edo',
  standalone: true,
  imports: [UiCard, BloqueEjemploEdo, MathTexto, PanelResultado],
  templateUrl: './bloque-ejercicio-edo.html',
  styleUrl: './bloque-ejercicio-edo.scss',
})
export class BloqueEjercicioEdo {
  readonly ejercicio = input.required<EjercicioModulo5>();
  readonly estado = input.required<EdoVista>();
  readonly columnas = input<Columna[]>([]);
  readonly exacta = input<((t: number) => number) | undefined>(undefined);
  readonly rango = input({ min: -1, max: 1 });
  readonly rangoY = input<{ min: number; max: number } | undefined>(undefined);
  readonly dibujo = input<DibujarMetodo | undefined>(undefined);
  readonly leyenda = input('');
  readonly tituloTabla = input('Tabla de pasos');

  /** Para clavear el resultado por módulo/tipo/método/ejercicio. */
  readonly modulo = input.required<string>();
  readonly tipo = input.required<string>();
  readonly metodo = input.required<string>();

  private readonly resultados = inject(ResultadoEjercicioService);
  private readonly cuestionarios = inject(CuestionarioEstrictoService);

  protected readonly textoBloqueo = TEXTO_BLOQUEO_ESTRICTO;

  protected readonly clave = computed(() =>
    claveResultado(this.modulo(), this.tipo(), this.metodo(), this.ejercicio().id),
  );

  /** ¿Se pidió el desarrollo? */
  protected readonly abierta = signal(false);

  /** El desarrollo solo se ve si además sigue cumpliéndose el gate. */
  protected readonly solucionVisible = computed(() => this.abierta() && this.puedeVerSolucion());

  /** Paneles desplegables, con el mismo patrón que la autoevaluación de M3. */
  protected readonly cuestionarioAbierto = computed(
    () => this.cuestionarios.estado(this.clave()).cuestionarioAbierto,
  );
  protected readonly resultadoAbierto = computed(
    () => this.cuestionarios.estado(this.clave()).resultadoAbierto,
  );

  protected idBoton(panel: 'solucion' | 'cuestionario' | 'resultado'): string {
    return `m45-btn-${this.ejercicio().id}-${panel}`;
  }

  protected idPanel(panel: 'solucion' | 'cuestionario' | 'resultado'): string {
    return `m45-panel-${this.ejercicio().id}-${panel}`;
  }

  /** Respuestas comprobadas, por id de pregunta. Viven en el servicio root. */
  protected readonly respuestas = computed(() => this.cuestionarios.estado(this.clave()).respuestas);

  /** ¿Ya se comprobó el cuestionario? */
  protected readonly comprobado = computed(() => this.cuestionarios.estado(this.clave()).comprobado);

  protected readonly cuestionario = computed(() => this.ejercicio().cuestionario ?? []);

  /** Grupo de radios único por ejercicio (q1/q2/q3 se repiten entre ejercicios). */
  protected nombreDe(preguntaId: string): string {
    return `${this.ejercicio().id}-${preguntaId}`;
  }

  protected readonly aciertos = computed(() => {
    const elegidas = this.respuestas();
    return this.cuestionario().filter((p) => elegidas[p.id] === p.correcta).length;
  });

  /** Regla estricta: quiz completo + comprobado + resultado enviado. */
  protected readonly puedeVerSolucion = computed(() =>
    puedeVerSolucionEstricto({
      totalPreguntas: this.cuestionario().length,
      aciertos: this.aciertos(),
      comprobado: this.comprobado(),
      resultadoEnviado: this.resultados.estado(this.clave()).enviado,
    }),
  );

  protected responder(preguntaId: string, opcionId: string): void {
    this.cuestionarios.responder(this.clave(), preguntaId, opcionId);
  }

  protected comprobar(): void {
    this.cuestionarios.comprobar(this.clave());
  }

  protected alternarSolucion(): void {
    if (!this.puedeVerSolucion()) return;
    this.abierta.update((v) => !v);
  }

  protected alternarCuestionario(): void {
    this.cuestionarios.alternarPanel(this.clave(), 'cuestionario');
  }

  protected alternarResultado(): void {
    this.cuestionarios.alternarPanel(this.clave(), 'resultado');
  }
}
