import { Component, OnDestroy, computed, effect, input, output, signal } from "@angular/core";

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
  selector: "app-pasos-control",
  standalone: true,
  templateUrl: "./pasos-control.html",
  styleUrl: "./pasos-control.scss",
})
export class PasosControl implements OnDestroy {
  readonly formatoMatricial = input<boolean>(false);
  /** Cuántas iteraciones hay en total. */
  readonly total = input(0);

  /** Índice de la iteración visible (0 = primera). */
  readonly paso = input(0);

  /** Texto de la iteración actual, para leerla mientras avanza. */
  readonly texto = input("");

  /**
   * Cómo se llama a una "unidad" del método: "Iteración" para los que
   * iteran, "Paso" para Cardano, que resuelve de forma cerrada y no
   * cuenta iteraciones. Con eso sale "Paso 3 de 6" en vez de
   * "Iteración 3 de 6", sin que este componente sepa de qué método es.
   */
  readonly etiquetaDePaso = input("Iteración");

  /** Emite el nuevo índice cuando el alumno cambia de paso. */
  readonly pasoCambiado = output<number>();

  /** Emite true/false cuando arranca o frena la reproducción. */
  readonly reproduccionCambiada = output<boolean>();

  /** Milisegundos entre paso y paso en reproducción automática. */
  readonly velocidad = input(900);

  /** ¿Está corriendo la reproducción automática? */
  readonly reproduciendo = signal(false);

  private readonly temporizador = signal<ReturnType<typeof setInterval> | null>(null);

  /** "Iteración 3 de 12" (o "Paso 3 de 6" cuando el método no itera). */
  readonly etiqueta = computed(() => {
    const total = this.total();
    if (total === 0) return `Sin ${plural(this.etiquetaDePaso())}`;
    return `${this.etiquetaDePaso()} ${this.paso() + 1} de ${total}`;
  });

  readonly enInicio = computed(() => this.paso() <= 0);
  readonly enFinal = computed(() => this.paso() >= this.total() - 1);
  readonly hayPasos = computed(() => this.total() > 1);

  /*
   * ── Los textos de los botones también se parametrizan ──────────────
   * El contador ya decía "Paso 1 de 6" para los métodos directos, pero
   * los `aria-label` seguían diciendo "Iteración anterior". Un lector de
   * pantalla leía "Iteración anterior" sobre un control que da pasos:
   * el mensaje no correspondía a lo que el botón hacía.
   *
   * ── Por qué "Ir al inicio" y no "Ir al primer paso" ─────────────────
   * El artículo y el adjetivo tienen que concordar con el sustantivo:
   * "el primer paso" pero "la primera iteración". Adivinar el género
   * desde la palabra es fragile ("monitor" es masculino, "función" es
   * femenino). Por eso los dos botones de extremos NO llevan artículo:
   * "Ir al inicio" y "Ir al final" son correctos siempre, y el grupo
   * ("Controles de paso") ya da el contexto de qué se está recorriendo.
   */
  private readonly etiquetaBaja = computed(() => this.etiquetaDePaso().toLowerCase());

  readonly ariaGrupo = computed(() => `Controles de ${this.etiquetaBaja()}`);
  readonly ariaInicio = computed(() => "Ir al inicio");
  readonly ariaAnterior = computed(() => `${this.etiquetaDePaso()} anterior`);
  readonly ariaSiguiente = computed(() => `${this.etiquetaDePaso()} siguiente`);
  readonly ariaFinal = computed(() => "Ir al final");

  /**
   * Si el padre cambia el total (por ejemplo, el alumno apretó "Calcular"
   * de nuevo), el índice puede quedar fuera de rango. Este efecto lo
   * corrige en vez de dejar un gráfico mostrando un paso inexistente.
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
    this.temporizador.set(setInterval(() => this.avanzarEnReproduccion(), this.velocidad()));
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

/**
 * Plural de la etiqueta, para el mensaje cuando no hay pasos.
 *
 * No hace falta una lista de plurales: en este vocabulario solo entran
 * dos casos. Terminada en vocal, el plural agrega "s" ("paso" →
 * "pasos"); terminada en "-ón", pierde el acento y suma "es"
 * ("iteración" → "iteraciones"). Con "Iteración" y "Paso" alcanza.
 */
function plural(etiqueta: string): string {
  const baja = etiqueta.toLowerCase();
  return baja.endsWith("ón") ? `${baja.slice(0, -2)}ones` : `${baja}s`;
}
