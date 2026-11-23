import { Component, computed, input, signal } from '@angular/core';
import type { Ejemplo } from '../../../../../shared/models/metodo.model';
import { newtonRaphson } from './newton-raphson.algoritmo';
import { PASOS_NEWTON } from './newton-raphson-pasos';
import { DemoIteracion, type ResumenIteracion } from '../shared/demo-iteracion';
import { DemoEjes } from '../shared/demo-ejes';
import { graficaDemo } from '../shared/demo-grafica';

/** Demostración de cada ejemplo con la misma geometría y panel que Teoría. */
@Component({
  selector: 'app-newton-raphson-ejemplo',
  standalone: true,
  imports: [DemoIteracion, DemoEjes],
  templateUrl: './newton-raphson-ejemplo.html',
  styleUrls: ['./tabs/newton-raphson-teoria.scss', './newton-raphson-ejemplo.scss'],
})
export class NewtonRaphsonEjemplo {
  readonly ejemplo = input.required<Ejemplo>();
  readonly funcion = input.required<(x: number) => number>();
  readonly paso = signal(0);
  readonly pasos = PASOS_NEWTON;
  readonly semilla = computed(() => this.ejemplo().calculo.x0 ?? 1);
  readonly tolerancia = computed(() => this.ejemplo().calculo.tol ?? 0.00001);
  readonly clipId = computed(() => `${this.ejemplo().id}-tangentes-clip`);
  readonly resultado = computed(() => newtonRaphson({
    f: this.funcion(), x0: this.semilla(), tol: this.tolerancia(),
    maxIter: this.ejemplo().calculo.maxIter ?? 100, criterio: 'absoluto',
  }));

  // El motor guarda la x nueva. La tangente parte de la semilla o de la
  // aproximación anterior, como en la demostración de Teoría.
  readonly filas = computed(() => {
    let anterior = this.semilla();
    return this.resultado().filas.slice(0, this.paso()).map(fila => {
      const actual = {
        n: fila.n, x: anterior, fx: this.funcion()(anterior),
        fpx: fila.fpx, xn: fila.x,
        delta: fila.delta ?? Math.abs(fila.x - anterior),
      };
      anterior = fila.x;
      return actual;
    });
  });
  readonly actual = computed(() => this.filas().at(-1));
  readonly terminado = computed(() => this.paso() >= this.resultado().filas.length);
  readonly grafica = computed(() => graficaDemo(
    [this.semilla(), ...this.filas().map(fila => fila.xn)], this.funcion()));
  px(x: number): number { return this.grafica().px(x); }
  py(y: number): number { return this.grafica().py(y); }

  readonly mensaje = computed(() => {
    const fila = this.actual();
    if (this.terminado()) {
      if (!this.resultado().convergio) return this.resultado().mensaje ?? 'No convergió dentro del máximo de iteraciones.';
      return fila
        ? `Criterio cumplido. Raíz ≈ ${this.formato(fila.xn)}; |Δx| = ${this.formato(fila.delta)}.`
        : 'La semilla ya cumple el criterio de parada.';
    }
    if (!fila) return 'Pulsa «Siguiente paso» para empezar.';
    return `Paso ${fila.n}: f′(xₙ) = ${this.formato(fila.fpx)}. La tangente corta el eje en ${this.formato(fila.xn)}; |Δx| = ${this.formato(fila.delta)}.`;
  });

  readonly resumen = computed<ResumenIteracion>(() => {
    const fila = this.actual();
    return {
      n: this.filas().length,
      // No suponemos una raíz de referencia: cada ejemplo tiene su función.
      indicadores: [
        { etiqueta: 'Aproximación xₙ₊₁', valor: fila ? this.formato(fila.xn) : '—' },
        { etiqueta: 'Desplazamiento |Δx|', valor: fila ? this.formato(fila.delta) : '—' },
        { etiqueta: 'Derivada f′(xₙ)', valor: fila ? this.formato(fila.fpx) : '—' },
      ],
      pasos: fila ? [
        `Partimos de xₙ = ${this.formato(fila.x)} y evaluamos f(xₙ) = ${this.formato(fila.fx)}.`,
        `Trazamos la tangente con pendiente f′(xₙ) = ${this.formato(fila.fpx)}.`,
        `Su corte con el eje x es xₙ₊₁ = ${this.formato(fila.xn)}; este será el punto de partida siguiente.`,
      ] : [`Partimos de la semilla del enunciado x₀ = ${this.formato(this.semilla())} y trazaremos su tangente.`],
      secuencia: [this.semilla(), ...this.filas().map(f => f.xn)]
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
