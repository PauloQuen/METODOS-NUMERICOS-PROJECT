import { DesarrolloVisualM3 } from "./desarrollo-visual";
import { NgTemplateOutlet } from "@angular/common";
import { Component, computed, inject, input, signal, type TemplateRef } from "@angular/core";
import type { PasoGuiadoM3 } from "./banco";
import { PracticaM3Service } from "./practica.service";
import { PreguntaCuestionarioM3 } from "../modelos/modulo3.model";

@Component({
  selector: "app-solucion-guiada-m3",
  standalone: true,
  imports: [NgTemplateOutlet, DesarrolloVisualM3],
  template: `
    <section class="guia" aria-label="Solución guiada">
      <p class="progreso" aria-live="polite">
        {{
          completada() ? "Recorrido completado" : "Paso " + (indice() + 1) + " de " + pasos().length
        }}
      </p>
      <ol class="etapas" aria-label="Etapas de la resolución">
        @for (etapa of pasos(); track $index) {
          <li
            [class.etapa-actual]="$index === indice()"
            [class.etapa-lista]="$index < indice()"
            [attr.aria-current]="$index === indice() ? 'step' : null"
            [title]="etapa.titulo"
          >
            <span>{{ $index < indice() ? "✓" : $index + 1 }}</span
            >{{ etapa.titulo }}
          </li>
        }
      </ol>
      @if (!completada()) {
        @if (actual(); as paso) {
          <h4>{{ paso.titulo }}</h4>
          <p class="explicacion">{{ paso.explicacion }}</p>
          @if (paso.visual; as visual) {
            @for (etapa of [indice()]; track etapa) {
              <app-desarrollo-visual-m3
                [visual]="visual"
                [resuelto]="acierto() || !paso.pregunta"
              />
            }
          }
          @if (paso.pregunta; as pregunta) {
            <fieldset [disabled]="acierto()">
              <legend>{{ pregunta.enunciado }}</legend>
              @for (opcion of pregunta.opciones; track opcion.id) {
                <label>
                  <input
                    type="radio"
                    [name]="'guia-' + ejercicioId() + '-' + indice()"
                    [value]="opcion.id"
                    [checked]="seleccion() === opcion.id"
                    (change)="elegir(opcion.id)"
                  />
                  {{ opcion.texto }}
                </label>
              }
            </fieldset>
            @if (!acierto()) {
              <button type="button" [disabled]="!seleccion()" (click)="comprobar()">
                Comprobar paso
              </button>
            }
            @if (comprobado()) {
              <p role="status">
                {{
                  acierto()
                    ? "¡Correcto! " + pregunta.explicacion
                    : "Revisa el procedimiento e inténtalo de nuevo. " + pregunta.explicacion
                }}
              </p>
            }
          }
          <div class="acciones">
            <button type="button" [disabled]="indice() === 0" (click)="anterior()">
              Paso anterior
            </button>
            <button type="button" [disabled]="!!paso.pregunta && !acierto()" (click)="siguiente()">
              {{ indice() === pasos().length - 1 ? "Finalizar ejercicio" : "Continuar" }}
            </button>
          </div>
        }
      } @else {
        <p>
          Has terminado las etapas. Ahora puedes consultar la tabla completa, el gráfico y la
          conclusión.
        </p>
        <button type="button" (click)="reiniciar()">Repasar desde el inicio</button>
        <ng-container [ngTemplateOutlet]="desarrollo()" />
      }
    </section>
  `,
  styles: [
    `
      .guia {
        padding: 1rem;
        border: 1px solid var(--outline-variant);
        border-radius: 12px;
      }
      .progreso {
        color: var(--primary);
        font-weight: 600;
      }
      h4 {
        font-size: 1.15rem;
        margin: 1rem 0;
      }
      .explicacion {
        white-space: pre-line;
        line-height: 1.7;
        overflow-wrap: anywhere;
      }
      fieldset {
        border: 0;
        padding: 0;
        margin: 1rem 0;
        min-width: 0;
      }
      legend {
        font-weight: 600;
        margin-bottom: 0.75rem;
      }
      label {
        display: flex;
        align-items: baseline;
        gap: 0.7rem;
        padding: 0.75rem;
        margin: 0.4rem 0;
        border: 1px solid var(--outline-variant);
        border-radius: 8px;
        cursor: pointer;
      }
      button {
        padding: 0.65rem 1rem;
        border-radius: 8px;
        border: 1px solid var(--outline-variant);
        background: var(--surface);
        color: var(--on-surface);
        cursor: pointer;
        font: inherit;
      }
      button:disabled {
        opacity: 0.5;
        cursor: default;
      }
      button:focus-visible,
      input:focus-visible {
        outline: 2px solid var(--primary);
        outline-offset: 3px;
      }
      .etapas {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        list-style: none;
        padding: 0;
        margin: 1rem 0;
      }
      .etapas li {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        padding: 0.45rem 0.6rem;
        border: 1px solid var(--outline-variant);
        border-radius: 8px;
        color: var(--on-surface-variant);
        font-size: 0.75rem;
      }
      .etapas li span {
        display: grid;
        place-items: center;
        width: 1.4rem;
        height: 1.4rem;
        border-radius: 50%;
        background: var(--surface);
        border: 1px solid var(--outline-variant);
        flex-shrink: 0;
      }
      .etapas .etapa-actual {
        border-color: var(--primary);
        color: var(--primary);
        font-weight: 600;
      }
      .etapas .etapa-lista span {
        background: var(--primary);
        color: var(--on-primary, white);
      }
      .acciones {
        display: flex;
        flex-wrap: wrap;
        gap: 0.75rem;
        margin: 1rem 0;
      }
    `,
  ],
})
export class SolucionGuiadaM3 {
  private readonly practica = inject(PracticaM3Service);
  readonly desarrollo = input.required<TemplateRef<unknown>>();
  readonly ejercicioId = input.required<string>();
  readonly pasos = input.required<PasoGuiadoM3[]>();
  readonly indice = computed(() => this.practica.pasoDe(this.ejercicioId()));
  readonly actual = computed(() => this.pasos()[this.indice()]);
  readonly completada = computed(() => this.indice() >= this.pasos().length);
  readonly seleccion = signal("");
  readonly comprobado = signal(false);
  readonly acierto = computed(
    () => this.comprobado() && this.seleccion() === this.actual()?.pregunta?.correcta,
  );
  elegir(id: string): void {
    this.seleccion.set(id);
    this.comprobado.set(false);
  }
  comprobar(): void {
    if (this.seleccion()) this.comprobado.set(true);
  }
  siguiente(): void {
    if (this.completada() || (this.actual()?.pregunta && !this.acierto())) return;
    this.mover(this.indice() + 1);
  }
  anterior(): void {
    this.mover(Math.max(0, this.indice() - 1));
  }
  reiniciar(): void {
    this.mover(0);
  }
  private mover(paso: number): void {
    this.practica.guardarPaso(this.ejercicioId(), paso);
    this.seleccion.set("");
    this.comprobado.set(false);
  }
}

export interface PasoGuia {
  titulo: string;
  explicacion: string;
  pregunta?: PreguntaCuestionarioM3;
  visual?: any; // o el tipo específico que maneje tus visuales (ej. string, object, etc.)
}
