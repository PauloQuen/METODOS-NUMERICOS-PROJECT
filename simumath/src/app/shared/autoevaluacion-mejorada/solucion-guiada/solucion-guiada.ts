import { ChangeDetectionStrategy, Component, OnInit, computed, inject, input } from '@angular/core';
import { ActividadesEjercicioService } from '../../../components/modulo3/shared/actividades-ejercicio/actividades-ejercicio.service';
import type { PreguntaCuestionarioAuto } from '../../models/metodo.model';
import { ordenarPorIds } from '../barajar';

/**
 * Un paso de la solución guiada.
 *
 * `explicacion` es el texto que ya escribió el método. `pregunta` es
 * opcional: cuando existe, el alumno debe responderla bien para avanzar.
 * El banco del M3 trae una pregunta por paso; en los demás módulos se
 * reutilizan las preguntas de comprensión del ejercicio.
 */
export interface PasoGuia {
  titulo?: string;
  explicacion: string;
  pregunta?: PreguntaCuestionarioAuto;
}

/**
 * SOLUCIÓN PASO A PASO.
 *
 * Se muestra cuando el alumno desbloquea "Ver solución". En lugar de
 * volcar todo el desarrollo de golpe, presenta un paso por vez, con
 * progreso y navegación anterior/siguiente. Al terminar, recién ahí
 * proyecta el desarrollo completo (tabla, gráfico y demás), para que el
 * alumno pueda contrastar el recorrido con la solución entera.
 *
 * ── Minicuestionario ─────────────────────────────────────────────────
 * Cada paso puede traer una pregunta. No se puede avanzar sin acertarla.
 * La pregunta y sus opciones se barajan una vez y el orden queda
 * guardado en el servicio, así que responder no mueve las opciones de
 * lugar. El estado también sobrevive al cambio de pestaña.
 *
 * ── Por qué es genérico ──────────────────────────────────────────────
 * Recibe los textos ya escritos por cada método. No calcula nada ni
 * inventa explicaciones. Los Módulos 0, 1, 2 y 3 ya tienen esos pasos en
 * su contenido; este componente solo cambia la forma de leerlos.
 */
@Component({
  selector: 'app-solucion-guiada',
  standalone: true,
  templateUrl: './solucion-guiada.html',
  styleUrl: './solucion-guiada.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SolucionGuiada implements OnInit {
  private readonly actividades = inject(ActividadesEjercicioService);

  /** Id del ejercicio; se usa para guardar el avance sin mezclar métodos. */
  readonly ejercicioId = input.required<string>();

  /** Pasos ya redactados por el contenido del método. */
  readonly pasos = input<readonly string[]>([]);

  /**
   * Guía con títulos y preguntas por paso. Tiene prioridad sobre
   * `pasos`; el banco del M3 la usa para su recorrido completo.
   */
  readonly guia = input<readonly PasoGuia[]>([]);

  /** Preguntas de comprensión, para los módulos que no tienen guía propia. */
  readonly cuestionario = input<readonly PreguntaCuestionarioAuto[]>([]);

  /** Cierre opcional, visible al completar el recorrido. */
  readonly conclusion = input('');

  readonly titulo = input('Resolución paso a paso');
  readonly etiquetaPaso = input('Paso');

  /** Si los pasos vienen con HTML ya redactado (autoevaluación transversal). */
  readonly interpretarHtml = input(false);

  /**
   * Guía efectiva. Si el método no define una guía, se usan sus pasos y
   * se reparten sus preguntas de comprensión a lo largo del recorrido.
   * No se inventan preguntas: si no hay cuestionario, no hay miniquiz.
   */
  readonly guiaEfectiva = computed<readonly PasoGuia[]>(() => {
    if (this.guia().length > 0) return this.guia();

    const pasos = this.pasos();
    const preguntas = this.cuestionario();
    if (preguntas.length === 0 || pasos.length === 0) {
      return pasos.map((explicacion) => ({ explicacion }));
    }

    const cantidad = Math.min(preguntas.length, pasos.length);
    const asignadas = new Map<number, PreguntaCuestionarioAuto>();
    for (let i = 0; i < cantidad; i++) {
      const indice = Math.floor((i * pasos.length) / cantidad);
      asignadas.set(indice, preguntas[i]);
    }

    return pasos.map((explicacion, indice) => ({
      explicacion,
      pregunta: asignadas.get(indice),
    }));
  });

  /** Posición guardada; puede quedar fuera de rango si el contenido cambia. */
  private readonly guardado = computed(() =>
    this.actividades.pasoGuiaDe(this.ejercicioId()),
  );

  readonly total = computed(() => this.guiaEfectiva().length);

  readonly indice = computed(() =>
    Math.min(this.guardado(), Math.max(this.total() - 1, 0)),
  );

  readonly completada = computed(
    () => this.total() === 0 || this.guardado() >= this.total(),
  );

  readonly pasoActual = computed<PasoGuia | undefined>(
    () => this.guiaEfectiva()[this.indice()],
  );

  /** Pregunta del paso actual, si el contenido la define. */
  readonly preguntaActual = computed(() => this.pasoActual()?.pregunta);

  /** Clave estable de la pregunta dentro del ejercicio. */
  readonly claveActual = computed(() => {
    const pregunta = this.preguntaActual();
    return pregunta ? this.actividades.claveGuia(this.indice(), pregunta.id) : '';
  });

  readonly seleccionActual = computed(() => {
    const pregunta = this.preguntaActual();
    if (!pregunta) return '';
    return this.actividades.respuestaGuiaDe(this.ejercicioId(), this.claveActual());
  });

  readonly comprobadoActual = computed(() => {
    if (!this.preguntaActual()) return false;
    return this.actividades.guiaComprobadaDe(this.ejercicioId(), this.claveActual());
  });

  readonly aciertoActual = computed(
    () =>
      this.comprobadoActual() &&
      this.seleccionActual() === this.preguntaActual()?.correcta,
  );

  readonly opcionesActuales = computed(() => {
    const pregunta = this.preguntaActual();
    if (!pregunta) return [];
    return ordenarPorIds(
      pregunta.opciones,
      this.actividades.opcionesGuiaDe(this.ejercicioId(), this.claveActual()),
    );
  });

  readonly esUltimo = computed(() => this.total() > 0 && this.indice() >= this.total() - 1);

  readonly progreso = computed(() => {
    if (this.total() === 0) return 100;
    const recorridos = this.completada() ? this.total() : this.indice();
    return Math.round((recorridos / this.total()) * 100);
  });

  readonly etiquetaSiguiente = computed(() =>
    this.esUltimo() ? 'Finalizar y ver desarrollo' : 'Siguiente',
  );

  readonly anuncio = computed(() =>
    this.completada()
      ? 'Recorrido completado. Ya puedes ver el desarrollo completo.'
      : `Paso ${this.indice() + 1} de ${this.total()}.`,
  );

  ngOnInit(): void {
    this.prepararOpciones();
  }

  protected elegir(opcionId: string): void {
    this.actividades.responderGuia(this.ejercicioId(), this.claveActual(), opcionId);
  }

  protected comprobarPaso(): void {
    this.actividades.comprobarGuia(this.ejercicioId(), this.claveActual());
  }

  protected anterior(): void {
    if (this.indice() === 0) return;
    this.actividades.guardarPasoGuia(this.ejercicioId(), this.indice() - 1);
  }

  protected siguiente(): void {
    if (this.completada()) return;
    if (this.preguntaActual() && !this.aciertoActual()) return;
    const destino = this.esUltimo() ? this.total() : this.indice() + 1;
    this.actividades.guardarPasoGuia(this.ejercicioId(), destino);
  }

  protected reiniciar(): void {
    this.actividades.reiniciarGuia(this.ejercicioId());
    this.prepararOpciones();
  }

  /** Baraja las opciones de todas las preguntas una vez por recorrido. */
  private prepararOpciones(): void {
    this.guiaEfectiva().forEach((paso, indice) => {
      if (!paso.pregunta) return;
      const clave = this.actividades.claveGuia(indice, paso.pregunta.id);
      this.actividades.prepararOpcionesGuia(
        this.ejercicioId(),
        clave,
        paso.pregunta.opciones,
      );
    });
  }
}
