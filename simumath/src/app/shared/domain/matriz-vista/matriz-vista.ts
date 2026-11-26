import { Component, computed, effect, ElementRef, inject, input, PendingTasks, viewChild } from '@angular/core';
@Component({
  selector: 'app-matriz-vista', standalone: true,
  template: `
    <figure class="matriz-vista" [class.compacta]="compacta()">
      @if (titulo()) { <figcaption>{{ titulo() }}</figcaption> }
      <div class="matriz-scroll" tabindex="0" role="region" [attr.aria-label]="etiqueta()">
        <span #contenido></span>
      </div>
    </figure>
  `,
  styles: [`
    :host { display:block; min-width:0; max-width:100%; }
    .matriz-vista { margin:0; min-width:0; color:var(--on-surface); }
    figcaption { font-weight:600; margin-bottom:.5rem; }
    .matriz-scroll { max-width:100%; overflow-x:auto; padding:.55rem .25rem .8rem; font-size:clamp(1rem,1.3vw,1.15rem); }
    .compacta .matriz-scroll { font-size:.9rem; padding:.25rem .15rem .45rem; }
    [tabindex]:focus-visible { outline:2px solid var(--primary); outline-offset:2px; }
  `],
})
export class MatrizVista {
  readonly valores = input.required<number[][]>();
  readonly titulo = input('');
  readonly aumentada = input(false);
  readonly filaActiva = input<number>();
  readonly columnaActiva = input<number>();
  readonly compacta = input(false);
  private readonly contenido = viewChild<ElementRef<HTMLElement>>('contenido');
  private readonly tareas = inject(PendingTasks);

  readonly etiqueta = computed(() => {
    const filas = this.valores();
    return `${this.titulo() || 'Matriz'}: ${filas.length} filas y ${filas[0]?.length ?? 0} columnas${this.aumentada() ? ', última columna de términos independientes' : ''}`;
  });

  readonly formula = computed(() => {
    const valores = this.valores();
    const ancho = valores[0]?.length ?? 0;
    if (!ancho) return String.raw`\text{Matriz vacía}`;
    const columnas = this.aumentada() && ancho > 1 ? 'r'.repeat(ancho - 1) + '|r' : 'r'.repeat(ancho);
    const filas = valores.map((fila, i) => fila.map((valor, j) => {
      const numero = this.numeroLatex(valor);
      return i === this.filaActiva() || j === this.columnaActiva()
        ? `\\boxed{${numero}}` : numero;
    }).join(' & ')).join(String.raw` \\ `);
    return `\\def\\arraystretch{1.3}\\left[\\begin{array}{${columnas}}${filas}\\end{array}\\right]`;
  });

  private readonly renderizar = effect((alLimpiar) => {
    const destino = this.contenido()?.nativeElement;
    if (!destino) return;
    const formula = this.formula();
    let vigente = true;
    alLimpiar(() => { vigente = false; });
    // El motor se descarga solo al encontrar una matriz. Evita cargarlo en la portada.
    void this.tareas.run(async () => {
      const { render } = await import('katex');
      if (!vigente) return;
      render(formula, destino, {
        displayMode: false,
        output: 'htmlAndMathml',
        throwOnError: false,
        trust: false,
        strict: 'error',
      });
    });
  });
  formatear(n: number): string {
    if (!Number.isFinite(n)) return '—';
    if (n === 0) return '0';
    return Number(n.toPrecision(9)).toString().replace('-', '−');
  }

  private numeroLatex(n: number): string {
    if (!Number.isFinite(n)) return String.raw`\text{—}`;
    const texto = this.formatear(n).replace('−', '-');
    const [mantisa, exponente] = texto.split('e');
    return exponente === undefined ? mantisa : `${mantisa}\\times 10^{${Number(exponente)}}`;
  }
}
