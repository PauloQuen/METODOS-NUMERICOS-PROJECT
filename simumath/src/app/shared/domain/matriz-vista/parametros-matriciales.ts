import { Component, computed, input } from '@angular/core';
import { GrupoMatrices, type MatrizPresentada } from './grupo-matrices';
import { separarMatrices, TextoMatricial } from './texto-matricial';

type Parametro = { etiqueta: string; valor: string };
interface GrupoParametros {
  matrices?: MatrizPresentada[];
  parametros?: Parametro[];
}

@Component({
  selector: 'app-parametros-matriciales',
  standalone: true,
  imports: [GrupoMatrices, TextoMatricial],
  template: `
    @for (grupo of grupos(); track $index) {
      @if (grupo.matrices; as matrices) {
        <app-grupo-matrices [matrices]="matrices" etiqueta="Datos del sistema: matrices y vectores" />
      }
      @if (grupo.parametros; as parametros) {
        <ul>@for (p of parametros; track $index) {
          <li><strong>{{ p.etiqueta + ': ' }}</strong><app-texto-matricial [texto]="p.valor" /></li>
        }</ul>
      }
    }
  `,
  styles: [`
    :host { display:block; min-width:0; max-width:100%; }
    ul { margin:.25rem 0; padding-left:1.25rem; line-height:1.65; }
    li + li { margin-top:.25rem; }
    li > app-texto-matricial { display:inline; }
  `],
})
export class ParametrosMatriciales {
  readonly parametros = input.required<readonly Parametro[]>();
  readonly grupos = computed(() => {
    const grupos: GrupoParametros[] = [];
    for (const p of this.parametros()) {
      const partes = separarMatrices(p.valor);
      const matrices = partes.length === 1 ? partes[0].matrices : undefined;
      const anterior = grupos[grupos.length - 1];
      if (matrices) {
        const datos = matrices.map(m => ({ ...m, titulo: p.etiqueta }));
        if (anterior?.matrices) anterior.matrices.push(...datos);
        else grupos.push({ matrices: datos });
      } else {
        if (anterior?.parametros) anterior.parametros.push(p);
        else grupos.push({ parametros: [p] });
      }
    }
    return grupos;
  });
}
