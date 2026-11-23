import { Component, computed, input, signal } from '@angular/core';
import type { Ejemplo } from '../../../../../shared/models/metodo.model';
import { ejecutarSecante } from './secante.algoritmo';
import { PASOS_SECANTE } from './secante-pasos';
import { DemoIteracion, type ResumenIteracion } from '../shared/demo-iteracion';
import { DemoEjes } from '../shared/demo-ejes';
import { graficaDemo } from '../shared/demo-grafica';

interface FilaDemo {
  n: number;
  x0: number;
  f0: number;
  x1: number;
  f1: number;
  xn: number;
  pendiente: number;
  delta: number;
}

/** Ejemplo con la geometría, panel y recorrido progresivo de Teoría. */
@Component({
  selector: 'app-secante-ejemplo',
  standalone: true,
  imports: [DemoIteracion, DemoEjes],
  templateUrl: './secante-ejemplo.html',
  styleUrls: ['./tabs/secante-teoria.scss', './secante-ejemplo.scss'],
})
export class SecanteEjemplo {
  readonly ejemplo = input.required<Ejemplo>();
  readonly funcion = input.required<(x: number) => number>();
  readonly paso = signal(0);
  readonly pasos = PASOS_SECANTE;
  readonly semilla0 = computed(() => this.ejemplo().calculo.x0 ?? 0);
  readonly semilla1 = computed(() => this.ejemplo().calculo.x1 ?? 1);
  readonly tolerancia = computed(() => this.ejemplo().calculo.tol ?? 0.00001);
  readonly clipId = computed(() => `${this.ejemplo().id}-secante-clip`);
  readonly resultado = computed(() => ejecutarSecante({
    f: this.funcion(), x0: this.semilla0(), x1: this.semilla1(),
    tol: this.tolerancia(), maxIter: this.ejemplo().calculo.maxIter ?? 100,
    criterio: 'absoluto',
  }));

  // Reconstruimos la pareja que originó cada recta a partir de las filas
  // del motor. No se conserva un extremo fijo como en Regla falsa.
  readonly filas = computed<FilaDemo[]>(() => {
    let anterior = this.semilla0();
    return this.resultado().filas.slice(0, this.paso()).map(fila => {
      const f0 = this.funcion()(anterior);
      const f1 = this.funcion()(fila.xPrev);
      const actual = {
        n: fila.n, x0: anterior, f0, x1: fila.xPrev, f1, xn: fila.x,
        pendiente: (f1 - f0) / (fila.xPrev - anterior),
        delta: fila.delta ?? Math.abs(fila.x - fila.xPrev),
      };
      anterior = fila.xPrev;
      return actual;
    });
  });
  readonly actual = computed(() => this.filas().at(-1));
  readonly terminado = computed(() => this.paso() >= this.resultado().filas.length);
  readonly grafica = computed(() => graficaDemo(
    [this.semilla0(), this.semilla1(), ...this.filas().map(fila => fila.xn)], this.funcion()));
  px(x: number): number { return this.grafica().px(x); }
  py(y: number): number { return this.grafica().py(y); }

  readonly parInicial = computed(() => {
    if (this.filas().length > 1) return null;
    const fila = this.actual();
    return fila
      ? { x0: fila.x0, y0: fila.f0, x1: fila.x1, y1: fila.f1, xn: fila.xn }
      : { x0: this.semilla0(), y0: this.funcion()(this.semilla0()),
          x1: this.semilla1(), y1: this.funcion()(this.semilla1()), xn: null };
  });

  puntosVerde(fila: FilaDemo): string {
    return `${this.px(fila.x1)},${this.py(fila.f1)} ${this.px(fila.x0)},${this.py(fila.f1)} ${this.px(fila.x0)},${this.py(fila.f0)}`;
  }
  puntosRojo(fila: FilaDemo): string {
    return `${this.px(fila.xn)},${this.py(0)} ${this.px(fila.x1)},${this.py(0)} ${this.px(fila.x1)},${this.py(fila.f1)}`;
  }

  readonly mensaje = computed(() => {
    const fila = this.actual();
    if (this.terminado()) {
      if (!this.resultado().convergio) return this.resultado().mensaje ?? 'No convergió dentro del máximo de iteraciones.';
      return fila
        ? `Criterio cumplido. Raíz ≈ ${this.formato(fila.xn)}; |Δx| = ${this.formato(fila.delta)}.`
        : 'Las semillas ya cumplen el criterio de parada.';
    }
    if (!fila) return 'Pulsa «Siguiente paso» para empezar.';
    return `Paso ${fila.n}: pendiente de la secante ${this.formato(fila.pendiente)}. La recta corta el eje en ${this.formato(fila.xn)}; |Δx| = ${this.formato(fila.delta)}.`;
  });

  readonly resumen = computed<ResumenIteracion>(() => {
    const fila = this.actual();
    return {
      n: this.filas().length,
      indicadores: [
        { etiqueta: 'Aproximación xₙ₊₁', valor: fila ? this.formato(fila.xn) : '—' },
        { etiqueta: 'Desplazamiento |Δx|', valor: fila ? this.formato(fila.delta) : '—' },
        { etiqueta: 'Pendiente secante', valor: fila ? this.formato(fila.pendiente) : '—' },
      ],
      pasos: fila ? [
        `Unimos los puntos con abscisas ${this.formato(fila.x0)} y ${this.formato(fila.x1)} sobre la curva.`,
        `La secante tiene pendiente ${this.formato(fila.pendiente)}. Los triángulos verde y rojo son semejantes.`,
        `La recta corta el eje en ${this.formato(fila.xn)}. Avanzamos la pareja a ${this.formato(fila.x1)} y ${this.formato(fila.xn)}.`,
      ] : [`Partimos de las semillas del enunciado x₀ = ${this.formato(this.semilla0())} y x₁ = ${this.formato(this.semilla1())}.`],
      secuencia: [this.semilla0(), this.semilla1(), ...this.filas().map(f => f.xn)]
        .map((valor, n) => ({ n, valor: this.formato(valor) })).slice(-6),
      mensaje: this.mensaje(),
      estado: this.terminado() ? (this.resultado().convergio ? 'exito' : 'error') : fila ? 'activo' : 'inicio',
    };
  });

  formato(valor: number): string {
    return Number.isFinite(valor)
      ? valor.toLocaleString('es-PE', { maximumFractionDigits: 6, useGrouping: false }) : '—';
  }
  siguiente(): void { if (!this.terminado()) this.paso.update(paso => paso + 1); }
  reiniciar(): void { this.paso.set(0); }
}
