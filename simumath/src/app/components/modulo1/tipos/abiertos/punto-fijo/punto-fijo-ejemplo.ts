import { Component, computed, input, signal } from '@angular/core';
import type { EjemploPuntoFijo } from './punto-fijo.contenido';
import { ejecutarPuntoFijo } from './punto-fijo.algoritmo';
import { PASOS_PUNTO_FIJO } from './punto-fijo-pasos';
import { DemoIteracion, type ResumenIteracion } from '../shared/demo-iteracion';
import { marcas } from '../shared/demo-grafica';

@Component({
  selector: 'app-punto-fijo-ejemplo',
  standalone: true,
  imports: [DemoIteracion],
  templateUrl: './punto-fijo-ejemplo.html',
  styleUrls: ['./tabs/punto-fijo-teoria.scss', './punto-fijo-ejemplo.scss'],
})
export class PuntoFijoEjemplo {
  readonly ejemplo = input.required<EjemploPuntoFijo>();
  readonly g = input.required<(x: number) => number>();
  readonly paso = signal(0);
  readonly pasos = PASOS_PUNTO_FIJO;
  readonly semilla = computed(() => this.ejemplo().calculo.x0 ?? 1);
  readonly tolerancia = computed(() => this.ejemplo().calculo.tol ?? 0.00001);
  readonly clipId = computed(() => `${this.ejemplo().id}-clip`);
  readonly flechaId = computed(() => `${this.ejemplo().id}-flecha`);
  readonly resultado = computed(() => ejecutarPuntoFijo({
    g: this.g(), x0: this.semilla(), tol: this.tolerancia(),
    maxIter: this.ejemplo().calculo.maxIter ?? 100, criterio: 'absoluto',
  }));
  // El motor guarda x nueva y g(x nueva). Para la telaraña necesitamos
  // el punto de partida y su imagen, no adelantar una evaluación.
  readonly filas = computed(() => {
    let anterior = this.semilla();
    return this.resultado().filas.slice(0, this.paso()).map((fila, n) => {
      const actual = { n, x: anterior, gx: fila.x, dx: fila.delta ?? Math.abs(fila.x - anterior) };
      anterior = fila.x;
      return actual;
    });
  });
  readonly actual = computed(() => this.filas().at(-1));
  readonly terminado = computed(() => this.paso() >= this.resultado().filas.length);

  // Mismo rango en ambos ejes para que y = x sea la diagonal. La escala
  // depende de las iteraciones reveladas y permite ver concentraciones pequeñas.
  readonly escala = computed(() => {
    const valores = [0, this.semilla(), this.g()(this.semilla()), ...this.filas().map(f => f.gx)].filter(Number.isFinite);
    const min = Math.min(...valores), max = Math.max(...valores);
    const margen = (max - min || Math.abs(max) || 1) * 0.16;
    return { min: min - margen, max: max + margen };
  });
  readonly marcas = computed(() => marcas(this.escala().min, this.escala().max));
  px(x: number): number { const e = this.escala(); return 48 + (x - e.min) / (e.max - e.min) * 502; }
  py(y: number): number { const e = this.escala(); return 250 - (y - e.min) / (e.max - e.min) * 230; }
  readonly curva = computed(() => {
    const { min, max } = this.escala();
    let curva = '', dibujando = false;
    for (let i = 0; i <= 400; i++) {
      const x = min + (max - min) * i / 400, y = this.g()(x);
      if (!Number.isFinite(y) || y < min || y > max) { dibujando = false; continue; }
      curva += `${dibujando ? 'L' : 'M'}${this.px(x)} ${this.py(y)} `;
      dibujando = true;
    }
    return curva;
  });
  readonly etiquetaG = computed(() => {
    const { min, max } = this.escala();
    for (let i = 360; i > 0; i--) {
      const x = min + (max - min) * i / 400, y = this.g()(x);
      if (Number.isFinite(y) && this.py(y) > 45 && this.py(y) < 230
        && Math.abs(this.py(y) - this.py(x)) > 20) {
        return { x: Math.min(this.px(x) + 8, 518), y: this.py(y) - 8 };
      }
    }
    return null;
  });
  readonly segmentos = computed(() => {
    const puntos: [number, number][] = [[this.semilla(), 0]];
    for (const fila of this.filas()) puntos.push([fila.x, fila.gx], [fila.gx, fila.gx]);
    return puntos.slice(1).map((p, i) => ({
      x1: this.px(puntos[i][0]), y1: this.py(puntos[i][1]), x2: this.px(p[0]), y2: this.py(p[1]),
      actual: i >= puntos.length - 3,
      flecha: Math.hypot(this.px(p[0]) - this.px(puntos[i][0]), this.py(p[1]) - this.py(puntos[i][1])) > 14,
    }));
  });
  readonly etiquetasX = computed(() => {
    const valores = [this.semilla(), ...this.filas().map(f => f.gx)];
    const etiquetas: { n: number; x: number }[] = [];
    valores.forEach((x, n) => {
      if (!etiquetas.some(e => Math.abs(this.px(e.x) - this.px(x)) < 28)) etiquetas.push({ x, n });
    });
    return etiquetas;
  });
  readonly mensaje = computed(() => {
    const fila = this.actual();
    if (this.terminado()) {
      if (!this.resultado().convergio) return this.resultado().mensaje ?? 'No convergió dentro del máximo de iteraciones.';
      return fila ? `Criterio cumplido. Punto fijo ≈ ${this.formato(fila.gx)}; |Δx| = ${this.formato(fila.dx)}.`
        : 'La semilla ya cumple el criterio de parada.';
    }
    return fila ? `Paso ${this.paso()}: el nuevo valor es ${this.formato(fila.gx)}. Volvemos a evaluar g(x) desde este punto.`
      : 'Pulsa «Siguiente paso» para empezar.';
  });
  readonly resumen = computed<ResumenIteracion>(() => {
    const fila = this.actual();
    return {
      n: this.filas().length,
      indicadores: [
        { etiqueta: 'Aproximación xₙ₊₁', valor: fila ? this.formato(fila.gx) : '—' },
        { etiqueta: 'Desplazamiento |Δx|', valor: fila ? this.formato(fila.dx) : '—' },
        { etiqueta: 'Residuo |g(xₙ₊₁) − xₙ₊₁|', valor: fila ? this.formato(Math.abs(this.g()(fila.gx) - fila.gx)) : '—' },
      ],
      pasos: fila ? [
        `Partimos de xₙ = ${this.formato(fila.x)} ${fila.n === 0 ? 'sobre el eje x' : 'sobre la diagonal'}.`,
        `Nos desplazamos verticalmente hasta la curva: g(xₙ) = ${this.formato(fila.gx)}.`,
        `Cruzamos a la diagonal: ese valor es el nuevo xₙ₊₁. Nos movimos |Δx| = ${this.formato(fila.dx)}.`,
      ] : [`Partimos de la semilla x₀ = ${this.formato(this.semilla())}, el punto azul sobre el eje.`],
      secuencia: [this.semilla(), ...this.filas().map(f => f.gx)]
        .map((valor, n) => ({ n, valor: this.formato(valor) })).slice(-6),
      mensaje: this.mensaje(),
      estado: this.terminado() ? (this.resultado().convergio ? 'exito' : 'error') : fila ? 'activo' : 'inicio',
    };
  });
  formato(valor: number): string {
    return Number.isFinite(valor)
      ? (Math.abs(valor) < 0.0000005 ? 0 : valor).toLocaleString('es-PE', { maximumFractionDigits: 6, useGrouping: false }) : '—';
  }
  siguiente(): void { if (!this.terminado()) this.paso.update(paso => paso + 1); }
  reiniciar(): void { this.paso.set(0); }
}
