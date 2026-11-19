import { Component, input } from '@angular/core';
import { MatrizVista } from './matriz-vista';

export interface MatrizPresentada {
  titulo: string;
  valores: number[][];
  aumentada?: boolean;
  fila?: number;
  columna?: number;
  operador?: string;
}

/** Mantiene juntas las matrices que el estudiante necesita comparar. */
@Component({
  selector: 'app-grupo-matrices',
  standalone: true,
  imports: [MatrizVista],
  template: `
    <div class="grupo-scroll" tabindex="0" role="region" [attr.aria-label]="etiqueta()">
      <div class="fila-matrices">
        @for (matriz of matrices(); track $index) {
          @if (matriz.operador) { <span class="operador">{{ matriz.operador }}</span> }
          <app-matriz-vista [valores]="matriz.valores" [titulo]="matriz.titulo"
            [aumentada]="matriz.aumentada ?? false" [compacta]="compacta()"
            [filaActiva]="matriz.fila" [columnaActiva]="matriz.columna" />
        }
      </div>
    </div>
  `,
  styles: [`
    :host { display:block; min-width:0; max-width:100%; }
    .grupo-scroll { max-width:100%; overflow-x:auto; padding:.25rem .15rem; scrollbar-width:thin; }
    .fila-matrices { display:flex; flex-wrap:nowrap; align-items:center; gap:1.5rem; width:max-content; min-width:100%; }
    .fila-matrices > app-matriz-vista { flex:0 0 auto; min-width:max-content; max-width:none; }
    .operador { flex:none; font:1.3em 'Cambria Math',math,serif; color:var(--on-surface); }
    .grupo-scroll:focus-visible { outline:2px solid var(--primary); outline-offset:2px; }
  `],
})
export class GrupoMatrices {
  readonly matrices = input.required<readonly MatrizPresentada[]>();
  readonly compacta = input(false);
  readonly etiqueta = input('Matrices relacionadas, dispuestas de izquierda a derecha');
}
