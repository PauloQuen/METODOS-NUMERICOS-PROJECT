import { Component, computed, input, signal } from '@angular/core';
import type { VisualPasoM3 } from './desarrollo-visual.data';

@Component({
  selector: 'app-desarrollo-visual-m3',
  standalone: true,
  templateUrl: './desarrollo-visual.html',
  styleUrl: './desarrollo-visual.scss',
})
export class DesarrolloVisualM3 {
  readonly visual = input.required<VisualPasoM3>();
  readonly resuelto = input(false);
  readonly visibles = signal(1);
  readonly repeticion = signal(0);
  readonly operaciones = computed(() => this.visual().operaciones.slice(0, this.visibles()));
  readonly completo = computed(() => this.visibles() >= this.visual().operaciones.length);
  readonly plano = computed(() => {
    const g = this.visual().grafico;
    const todos = [...g.puntos, ...(g.curva ?? []), ...(g.estimacion ? [g.estimacion] : [])];
    const xs = todos.map(p => p.x);
    const ys = todos.map(p => p.y);
    const xmin = Math.min(...xs), xmax = Math.max(...xs);
    const ymin = Math.min(...ys), ymax = Math.max(...ys);
    const margenY = Math.max((ymax - ymin) * 0.15, 0.5);
    const margenX = Math.max((xmax - xmin) * 0.08, 0.1);
    const sx = (x: number) => 50 + 320 * (x - xmin + margenX) / (xmax - xmin + 2 * margenX);
    const sy = (y: number) => 215 - 185 * (y - ymin + margenY) / (ymax - ymin + 2 * margenY);
    return {
      xmin, xmax, ymin, ymax,
      limites: { xmin: sx(xmin), xmax: sx(xmax), ymin: sy(ymin), ymax: sy(ymax) },
      puntos: g.puntos.map((p, i) => ({ ...p, cx: sx(p.x), cy: sy(p.y), i: i + 1 })),
      curva: (g.curva ?? []).map((p, i) => `${i ? 'L' : 'M'}${sx(p.x)},${sy(p.y)}`).join(' '),
      estimacion: g.estimacion ? { cx: sx(g.estimacion.x), cy: sy(g.estimacion.y) } : undefined,
      residuos: (g.residuos ?? []).map(r => ({ x: sx(r.x), y1: sy(r.observado), y2: sy(r.estimado) })),
    };
  });
  mostrarSiguiente(): void {
    this.visibles.update(n => Math.min(n + 1, this.visual().operaciones.length));
  }
  repetir(): void { this.visibles.set(1); this.repeticion.update(n => n + 1); }
}
