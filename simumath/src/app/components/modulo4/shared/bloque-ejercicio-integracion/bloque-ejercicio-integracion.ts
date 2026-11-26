import { Component, computed, inject, input, signal } from '@angular/core';
import { UiCard } from '../../../../shared/ui/ui-card/ui-card';
import { BloqueEjemploIntegracion } from '../bloque-ejemplo-integracion/bloque-ejemplo-integracion';
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
import type { EjercicioModulo4 } from '../../modelos/modulo4.model';
import type { IntegracionVista } from '../integracion-vista';

/**
 * Bloque de ejercicio del Módulo 4.
 *
 * Muestra primero SOLO el planteamiento y la pista. Recién cuando el
 * alumno pide la solución se calcula y se despliega el desarrollo
 * completo, con la tabla, el área sombreada y la conclusión.
 *
 * ── Por qué no se reutiliza el bloque del Módulo 3 ───────────────────
 * Aquel bloque está atado a los datos del Módulo 3 (puntos x, y) y a un
 * panel de verificación numérica pensado para polinomios. Acá el
 * ejercicio es una integral y lo que conviene comprobar es la
 * COMPRENSIÓN: por eso trae una pregunta de opción múltiple con su
 * explicación, y el desarrollo completo queda detrás del botón.
 *
 * Regla estricta (M4/M5, distinta de M0–M3): «Ver solución» solo se abre
 * con TODAS las preguntas bien, comprobadas y el resultado marcado como
 * enviado. No hay botón de “ver de todos modos”. El estado del resultado
 * se guarda en el navegador y se comparte con el bloque de M5 mediante el
 * servicio `ResultadoEjercicioService`, claveado por módulo/tipo/método/
 * ejercicio para que no colisionen.
 */
@Component({
  selector: 'app-bloque-ejercicio-integracion',
  standalone: true,
  imports: [UiCard, BloqueEjemploIntegracion, PanelResultado],
  templateUrl: './bloque-ejercicio-integracion.html',
  styleUrl: './bloque-ejercicio-integracion.scss',
})
export class BloqueEjercicioIntegracion {
  readonly ejercicio = input.required<EjercicioModulo4>();
  readonly estado = input.required<IntegracionVista>();
  readonly columnas = input<Columna[]>([]);
  readonly funcion = input.required<(x: number) => number>();
  readonly rango = input({ min: -5, max: 5 });
  readonly dibujarAntes = input<DibujarMetodo | undefined>(undefined);
  readonly dibujarMetodo = input<DibujarMetodo | undefined>(undefined);
  readonly leyenda = input('');
  readonly tituloTabla = input('Tabla de trabajo');

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

  /** Aciertos del cuestionario, para el mensaje de resultado. */
  protected readonly aciertos = computed(() => {
    const elegidas = this.respuestas();
    return this.cuestionario().filter((p) => elegidas[p.id] === p.correcta).length;
  });

  protected responder(preguntaId: string, opcionId: string): void {
    this.cuestionarios.responder(this.clave(), preguntaId, opcionId);
  }

  protected comprobar(): void {
    this.cuestionarios.comprobar(this.clave());
  }

  protected readonly puedeVerSolucion = computed(() =>
    puedeVerSolucionEstricto({
      totalPreguntas: this.cuestionario().length,
      aciertos: this.aciertos(),
      comprobado: this.comprobado(),
      resultadoEnviado: this.resultados.estado(this.clave()).enviado,
    }),
  );

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
