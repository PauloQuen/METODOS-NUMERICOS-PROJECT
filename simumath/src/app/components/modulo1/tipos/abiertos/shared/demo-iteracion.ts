import { Component, input } from '@angular/core';

export interface ResumenIteracion {
  n: number;
  tendencia?: string | null;
  pasos: string[];
  indicadores: { etiqueta: string; valor: string }[];
  secuencia: { n: number; valor: string }[];
  mensaje: string;
  estado: 'inicio' | 'activo' | 'exito' | 'error';
}

/** Panel común: geometría explicada, medidas y últimas aproximaciones. */
@Component({
  selector: 'app-demo-iteracion',
  standalone: true,
  template: `
    <section class="panel" aria-label="Detalle de la iteración" aria-live="polite">
      <header>
        <h3>{{ datos().n ? 'Iteración ' + datos().n : 'Antes de empezar' }}</h3>
        @if (datos().tendencia; as tendencia) {
          <span class="chip" [class.ok]="tendencia === 'se acerca'" [class.error]="tendencia === 'se aleja'">{{ tendencia }}</span>
        }
      </header>
      <dl>
        @for (item of datos().indicadores; track item.etiqueta) {
          <div><dt>{{ item.etiqueta }}</dt><dd>{{ item.valor }}</dd></div>
        }
      </dl>
      <ol>
        @for (paso of datos().pasos; track $index) { <li>{{ paso }}</li> }
      </ol>
      <div class="secuencia" aria-label="Últimas aproximaciones">
        @for (punto of datos().secuencia; track punto.n) {
          <span>x<sub>{{ punto.n }}</sub> = {{ punto.valor }}</span>
        }
      </div>
      @if (datos().mensaje) {
        <p class="mensaje" [class.ok]="datos().estado === 'exito'" [class.error]="datos().estado === 'error'">{{ datos().mensaje }}</p>
      }
    </section>
  `,
  styles: `
    :host { display: block; min-width: 0; }
    .panel { padding: var(--e-4); border: 1px solid var(--c-borde-suave); border-radius: var(--r-md); background: var(--c-fondo); }
    header { display: flex; flex-wrap: wrap; gap: var(--e-3); align-items: center; }
    h3, p, dl, dd { margin: 0; }
    h3 { font-size: var(--t-base); color: var(--c-texto); }
    .chip { padding: var(--e-1) var(--e-3); border-radius: var(--r-full); font-size: var(--t-xs); font-weight: 700; }
    dl { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--e-3); margin-top: var(--e-3); }
    dl div { padding: var(--e-3); border-radius: var(--r-sm); background: var(--c-superficie); }
    dt, li { color: var(--c-texto-suave); }
    dt { font-size: var(--t-xs); }
    dd { color: var(--c-primario); font-weight: 700; overflow-wrap: anywhere; font-variant-numeric: tabular-nums; }
    ol { padding-left: var(--e-5); line-height: 1.6; }
    li + li { margin-top: var(--e-2); }
    .secuencia { display: flex; flex-wrap: wrap; gap: var(--e-2); }
    .secuencia span { padding: var(--e-1) var(--e-2); border: 1px solid var(--c-acento); border-radius: var(--r-sm); background: var(--c-acento-suave); font-variant-numeric: tabular-nums; overflow-wrap: anywhere; }
    sub { font-size: .9em; }
    .mensaje { margin-top: var(--e-3); padding: var(--e-3); border-radius: var(--r-sm); background: var(--c-info-fondo); color: var(--c-info-texto); }
    .ok { background: var(--c-ok-fondo); color: var(--c-ok-texto); }
    .error { background: var(--c-error-fondo); color: var(--c-error-texto); }
    @media (max-width: 600px) { dl { grid-template-columns: minmax(0, 1fr); } }
  `,
})
export class DemoIteracion {
  readonly datos = input.required<ResumenIteracion>();
}
