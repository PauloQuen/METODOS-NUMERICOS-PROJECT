import {
  Component,
  OnDestroy,
  computed,
  effect,
  input,
  output,
  signal,
} from '@angular/core';

/**
 * Botones para recorrer las iteraciones de un método paso a paso.
 *
 * ── Qué sabe y qué no sabe ───────────────────────────────────────────
 * Sabe cuántas iteraciones hay y cuál se está viendo. NO sabe qué método
 * es, ni qué función se está graficando, ni qué significa la iteración 3.
 * Eso lo decide el componente que lo usa, que le pasa el total y escucha
 * el cambio de paso.
 *
 * Es el control que hace que el alumno vea el método "andar": intervalo
 * que se achica, tangente que se acerca, telaraña que se enrolla.
 *
 * ── Reproducción automática ───────────────────────────────────────────
 * El botón ▶ Reproducir avanza sola a velocidad fija. Se detiene sola al
 * llegar a la última iteración, para que no quede el botón en "Pausar"
 * cuando ya no hay nada más que mostrar.
 */
@Component({
  selector: 'app-pasos-control',
  standalone: true,
  templateUrl: './pasos-control.html',
  styleUrl: './pasos-control.scss',
})
export class PasosControl implements OnDestroy {
  /** Cuántas iteraciones hay en total. */
  readonly total = input(0);

  /** Índice de la iteración visible (0 = primera). */
  readonly paso = input(0);

  /** Texto de la iteración actual, para leerla mientras avanza. */
  readonly texto = input('');

  /** Emite el nuevo índice cuando el alumno cambia de paso. */
  readonly pasoCambiado = output<number>();

  /** Emite true/false cuando arranca o frena la reproducción. */
  readonly reproduccionCambiada = output<boolean>();

  /** Milisegundos entre paso y paso en reproducción automática. */
  readonly velocidad = input(900);

  /** ¿Está corriendo la reproducción automática? */
  readonly reproduciendo = signal(false);

  private readonly temporizador = signal<ReturnType<typeof setInterval> | null>(null);

  /** "Iteración 3 de 12" */
  readonly etiqueta = computed(() => {
    const total = this.total();
    if (total === 0) return 'Sin iteraciones';
    return `Iteración ${this.paso() + 1} de ${total}`;
  });

  readonly enInicio = computed(() => this.paso() <= 0);
  readonly enFinal = computed(() => this.paso() >= this.total() - 1);
  readonly hayPasos = computed(() => this.total() > 1);

  /**
   * Si el padre cambia el total (por ejemplo, el alumno apretó "Calcular"
   * de nuevo), el índice puede quedar fuera de rango. Este efecto lo
   * corrige en vez de dejar un gráfico showing un paso inexistente.
   */
  private readonly ajustarAlTotal = effect(() => {
    const total = this.total();
    if (total > 0 && this.paso() >= total) {
      this.pasoCambiado.emit(total - 1);
    }
  });

  irAlInicio(): void {
    this.frenar();
    this.pasoCambiado.emit(0);
  }

  irAlAnterior(): void {
    this.frenar();
    this.pasoCambiado.emit(Math.max(0, this.paso() - 1));
  }

  irAlSiguiente(): void {
    this.frenar();
    this.pasoCambiado.emit(Math.min(this.total() - 1, this.paso() + 1));
  }

  irAlFinal(): void {
    this.frenar();
    this.pasoCambiado.emit(Math.max(0, this.total() - 1));
  }

  /** Arranca o frena la reproducción automática. */
  alternarReproduccion(): void {
    if (this.reproduciendo()) {
      this.frenar();
      return;
    }
    if (!this.hayPasos()) return;

    this.reproduciendo.set(true);
    this.reproduccionCambiada.emit(true);
    this.temporizador.set(
      setInterval(() => this.avanzarEnReproduccion(), this.velocidad()),
    );
  }

  private avanzarEnReproduccion(): void {
    const siguiente = this.paso() + 1;
    if (siguiente >= this.total()) {
      // Llegó al final: se frena sola y se queda mostrando la última.
      this.frenar();
      return;
    }
    this.pasoCambiado.emit(siguiente);
  }

  /** Frena la reproducción. No emite cambio de paso. */
  private frenar(): void {
    const t = this.temporizador();
    if (t !== null) {
      clearInterval(t);
      this.temporizador.set(null);
    }
    if (this.reproduciendo()) {
      this.reproduciendo.set(false);
      this.reproduccionCambiada.emit(false);
    }
  }

  /**
   * Si el componente se destruye con la reproducción corriendo, el
   * intervalo seguiría vivo y seguiría emitiendo. Por eso se limpia.
   */
  ngOnDestroy(): void {
    const t = this.temporizador();
    if (t !== null) clearInterval(t);
  }
}
