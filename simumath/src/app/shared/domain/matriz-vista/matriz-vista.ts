import { Component, input } from '@angular/core';
@Component({
  selector: 'app-matriz-vista', standalone: true,
  template: `
    <figure class="matriz-vista" [class.compacta]="compacta()">
      @if (titulo()) { <figcaption>{{ titulo() }}</figcaption> }
      <div class="matriz-scroll" tabindex="0" role="region" [attr.aria-label]="titulo() || 'Matriz'">
        <div class="corchetes">
          <table><tbody>
            @for (fila of valores(); track $index; let i = $index) {
              <tr>@for (valor of fila; track $index; let j = $index) {
                <td [class.independiente]="aumentada() && j === fila.length - 1"
                  [class.resaltada]="i === filaActiva() || j === columnaActiva()">{{ formatear(valor) }}</td>
              }</tr>
            }
          </tbody></table>
        </div>
      </div>
    </figure>
  `,
  styles: [`
    :host { display:block; min-width:0; max-width:100%; }
    .matriz-vista { margin:0; min-width:0; }
    figcaption { font-weight:600; margin-bottom:.85rem; color:var(--on-surface); }
    .matriz-scroll { max-width:100%; overflow-x:auto; padding:.4rem .3rem .65rem; }
    .corchetes { display:inline-block; position:relative; padding:.35rem .65rem; }
    .corchetes::before,.corchetes::after { content:''; position:absolute; top:0; bottom:0; width:.45rem; border-top:2px solid currentColor; border-bottom:2px solid currentColor; }
    .corchetes::before { left:0; border-left:2px solid currentColor; }
    .corchetes::after { right:0; border-right:2px solid currentColor; }
    table { border-collapse:collapse; width:max-content; font-family:'Cambria Math',Georgia,serif; font-size:clamp(1rem,1.6vw,1.3rem); line-height:1.6; font-variant-numeric:tabular-nums; }
    td { min-width:3.5rem; padding:.45rem 1rem; text-align:right; white-space:nowrap; color:var(--on-surface); }
    .independiente { border-left:2px solid var(--outline-variant); }
    .resaltada { background:color-mix(in srgb,var(--primary) 12%,var(--surface)); color:var(--primary); }
    .compacta table { font-size:1rem; } .compacta td { min-width:2.8rem; padding:.25rem .6rem; }
    [tabindex]:focus-visible { outline:2px solid var(--primary); outline-offset:2px; }
    @media(max-width:600px) { td { padding:.35rem .6rem; min-width:2.8rem; } }
  `],
})
export class MatrizVista {
  readonly valores = input.required<number[][]>();
  readonly titulo = input('');
  readonly aumentada = input(false);
  readonly filaActiva = input<number>();
  readonly columnaActiva = input<number>();
  readonly compacta = input(false);
  formatear(n: number): string {
    if (!Number.isFinite(n)) return '—';
    if (n === 0) return '0';
    return Number(n.toPrecision(9)).toString().replace('-', '−');
  }
}
