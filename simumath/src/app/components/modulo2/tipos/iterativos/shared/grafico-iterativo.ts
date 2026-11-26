import { Component, computed, input } from '@angular/core';
import type { ResultadoIterativo } from './iterativo.algoritmo';
import { numero } from './iterativo.config';

@Component({
  selector: 'app-grafico-iterativo',
  standalone: true,
  template: `
    <figure>
      <figcaption>Convergencia del residuo relativo</figcaption>
      <svg viewBox="0 0 560 290" role="img" [attr.aria-label]="descripcion()">
        @for (tick of plano().ticks; track $index) {
          <line x1="72" x2="535" [attr.y1]="tick.y" [attr.y2]="tick.y" class="rejilla" />
          <text x="64" [attr.y]="tick.y + 4" text-anchor="end">{{tick.etiqueta}}</text>
        }
        <line x1="72" x2="535" y1="245" y2="245" class="eje" />
        <line x1="72" x2="72" y1="22" y2="245" class="eje" />
        <line x1="72" x2="535" [attr.y1]="plano().toleranciaY" [attr.y2]="plano().toleranciaY" class="tolerancia" />
        <path [attr.d]="plano().principal" class="curva" />
        @if (comparacion()) { <path [attr.d]="plano().otra" class="curva otra" /> }
        @if (plano().activa; as punto) {
          <circle [attr.cx]="punto.x" [attr.cy]="punto.y" r="5" class="actual" />
        }
        <text x="72" y="266">0</text><text x="535" y="266" text-anchor="end">{{ plano().maxK }}</text>
        <text x="300" y="285" text-anchor="middle">Número de iteración k</text>
      </svg>
      <p class="leyenda"><span>Azul: {{ nombre() }}</span>
        @if (comparacion()) { <span class="color-otra">Naranja: {{ otroNombre() }}</span> }
        <span>Discontinua: tolerancia {{ formatear(tolerancia()) }}</span>
      </p>
      <p>Escala logarítmica: cada descenso de una unidad representa dividir el residuo por diez.
        Los ceros se colocan en el borde inferior para poder representarlos.</p>
    </figure>
  `,
  styles: [`
    :host { display:block; min-width:0; }
    figure { margin:0; } figcaption { font-weight:600; margin-bottom:.5rem; }
    svg { width:100%; height:auto; overflow:visible; }
    text { font:12px sans-serif; fill:var(--c-texto-suave); }
    .rejilla { stroke:var(--c-borde-suave); } .eje { stroke:var(--c-texto-suave); }
    .curva { fill:none; stroke:#1b365d; stroke-width:2.5; stroke-linejoin:round; }
    .otra { stroke:#b45309; stroke-dasharray:5 3; } .color-otra { color:#b45309; }
    .tolerancia { stroke:var(--c-texto-suave); stroke-dasharray:3 5; }
    .actual { fill:#1b365d; stroke:var(--c-superficie); stroke-width:2; }
    p { font-size:.85rem; line-height:1.55; color:var(--c-texto-suave); }
    .leyenda { display:flex; flex-wrap:wrap; gap:.5rem 1rem; }
  `],
})
export class GraficoIterativo {
  readonly resultado = input.required<ResultadoIterativo>();
  readonly comparacion = input<ResultadoIterativo | null>(null);
  readonly paso = input(0);
  readonly tolerancia = input(1e-6);
  readonly nombre = input('Método actual');
  readonly otroNombre = input('Otro método');
  readonly formatear = numero;
  private estados(r: ResultadoIterativo) { return [...(r.inicial ? [r.inicial] : []), ...r.iteracionesDetalle]; }
  readonly descripcion = computed(() => {
    const punto = this.estados(this.resultado())[this.paso()];
    return `Residuo relativo de ${this.nombre()}. ${punto ? `Iteración ${punto.k}: ${numero(punto.residuoRelativo)}.` : 'Sin iteraciones.'} Tolerancia ${numero(this.tolerancia())}.`;
  });
  readonly plano = computed(() => {
    const principal = this.estados(this.resultado());
    const otra = this.comparacion() ? this.estados(this.comparacion()!) : [];
    const todas = [...principal, ...otra];
    const piso = Math.max(1e-300, this.tolerancia() * 1e-3);
    const logs = [...todas.map(p => Math.log10(Math.max(p.residuoRelativo, piso))), Math.log10(this.tolerancia())];
    const min = Math.floor(Math.min(...logs)) - .3;
    const max = Math.max(Math.ceil(Math.max(...logs)) + .3, min + 1);
    const maxK = Math.max(1, ...todas.map(p => p.k));
    const sx = (k: number) => 72 + 463 * k / maxK;
    const sy = (eta: number) => 245 - 223 * (Math.log10(Math.max(eta, piso)) - min) / (max - min);
    const path = (puntos: typeof principal) => puntos.map((p, i) => `${i ? 'L' : 'M'}${sx(p.k)},${sy(p.residuoRelativo)}`).join(' ');
    const activa = principal[this.paso()];
    return { maxK, principal: path(principal), otra: path(otra), toleranciaY: sy(this.tolerancia()),
      activa: activa ? { x: sx(activa.k), y: sy(activa.residuoRelativo) } : undefined,
      ticks: Array.from({ length: 5 }, (_, i) => {
        const log = max - (max - min) * i / 4;
        return { y: 22 + 223 * i / 4, etiqueta: `10^${numero(log)}` };
      }) };
  });
}
