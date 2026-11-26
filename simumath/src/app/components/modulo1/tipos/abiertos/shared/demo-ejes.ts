import { Component, input } from '@angular/core';
import { graficaDemo } from './demo-grafica';

@Component({
  selector: 'g[app-demo-ejes]',
  standalone: true,
  template: `
    @for (v of escala().marcasX; track v) {
      <svg:line class="rejilla" [attr.x1]="escala().px(v)" [attr.x2]="escala().px(v)" y1="20" y2="250" />
      <svg:text [attr.x]="escala().px(v)" y="274" text-anchor="middle">{{ formato(v) }}</svg:text>
    }
    @for (v of escala().marcasY; track v) {
      <svg:line class="rejilla" x1="48" x2="550" [attr.y1]="escala().py(v)" [attr.y2]="escala().py(v)" />
      <svg:text x="40" [attr.y]="escala().py(v) + 4" text-anchor="end">{{ formato(v) }}</svg:text>
    }
    <svg:line class="eje" x1="48" x2="550" [attr.y1]="escala().py(0)" [attr.y2]="escala().py(0)" />
    <svg:line class="eje" [attr.x1]="escala().px(0)" [attr.x2]="escala().px(0)" y1="20" y2="250" />
    <svg:text x="566" [attr.y]="escala().py(0) + 4">x</svg:text>
    <svg:text [attr.x]="escala().px(0) + 8" y="14">y</svg:text>
  `,
  styles: `
    text { fill: var(--c-texto-suave); font: 12px var(--c-fuente); }
    .rejilla { stroke: var(--c-borde-suave); stroke-dasharray: 3 4; }
    .eje { stroke: var(--c-borde); stroke-width: 1.5; }
  `,
})
export class DemoEjes {
  readonly escala = input.required<ReturnType<typeof graficaDemo>>();
  formato(v: number): string {
    return v.toLocaleString('es-PE', { maximumFractionDigits: 6, useGrouping: false });
  }
}
