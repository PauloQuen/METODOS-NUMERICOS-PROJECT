import { Component, computed, input, signal } from '@angular/core';
import { escalaGrafico, VIEW_GRAFICO } from '../../../../../shared/domain/escala-grafico';

interface PuntosBiseccion {
  a: number;
  b: number;
  c: number;
  fc: number;
}

/** Gráfico SVG de Bisección para la pestaña de Ejemplos. */
@Component({
  selector: 'app-biseccion-grafico-svg',
  standalone: true,
  templateUrl: './biseccion-grafico-svg.html',
  styleUrl: './biseccion-grafico-svg.scss',
})
export class BiseccionGraficoSvg {
  readonly funcion = input.required<(x: number) => number>();
  readonly iteraciones = input<Record<string, number | string>[]>([]);
  readonly pasoActual = input(0);
  readonly rango = input({ min: -5, max: 5 });
  readonly leyenda = input('');
  readonly mostrarControles = input(true);
  readonly intervaloInicial = input<{ a: number; b: number }>({ a: 0, b: 1 });
  readonly intervalo = computed(() => this.actual() ?? this.intervaloInicial());

  /** Zoom y desplazamiento, para conservar los controles del gráfico anterior. */
  private readonly zoom = signal(1);
  private readonly desplazamiento = signal(0);

  private readonly rangoVisible = computed(() => {
    const r = this.rango();
    const span = r.max - r.min;
    if (!(span > 0)) return r;
    const visible = span / Math.max(0.01, this.zoom());
    const centro = (r.min + r.max) / 2 + this.desplazamiento();
    return { min: centro - visible / 2, max: centro + visible / 2 };
  });

  readonly vista = VIEW_GRAFICO;
  readonly escala = computed(() => escalaGrafico(this.funcion(), this.rangoVisible()));

  readonly actual = computed<PuntosBiseccion | null>(() => {
    const fila = this.iteraciones()[this.pasoActual()];
    if (!fila) return null;
    const puntos: PuntosBiseccion = {
      a: Number(fila['a']),
      b: Number(fila['b']),
      c: Number(fila['c']),
      fc: Number(fila['fc']),
    };
    return Object.values(puntos).every(Number.isFinite) ? puntos : null;
  });

  /** Signo de f en un extremo, con el mismo formato que la gráfica de Teoría. */
  rotuloExtremo(valor: number | string): string {
    const resultado = this.funcion()(Number(valor));
    if (!Number.isFinite(resultado) || resultado === 0) return '0';
    return resultado < 0 ? '−' : '+';
  }

  readonly descripcion = computed(() => {
    const base = `Gráfico de bisección de ${this.leyenda() || 'la función'}`;
    const puntos = this.actual();
    return puntos
      ? `${base}. Intervalo [${this.formato(puntos.a)}, ${this.formato(puntos.b)}], punto medio ${this.formato(puntos.c)}.`
      : `${base}. Intervalo inicial y curva de la función.`;
  });

  formato(valor: number | string | null | undefined): string {
    if (valor === null || valor === undefined || valor === '') return '—';
    const numero = Number(valor);
    if (!Number.isFinite(numero)) return '—';
    return numero.toLocaleString('es-PE', { maximumFractionDigits: 6, useGrouping: false });
  }

  acercar(): void {
    this.zoom.update((z) => Math.min(40, z * 1.15));
  }

  alejar(): void {
    this.zoom.update((z) => Math.max(0.25, z / 1.15));
  }

  reiniciarVista(): void {
    this.zoom.set(1);
    this.desplazamiento.set(0);
  }

  ajustarVista(): void {
    this.reiniciarVista();
  }

  alRueda(event: WheelEvent): void {
    if (!this.mostrarControles()) return;
    event.preventDefault();
    const factor = event.deltaY > 0 ? 0.9 : 1.1;
    this.zoom.update((z) => Math.max(0.25, Math.min(40, z * factor)));
  }
}
