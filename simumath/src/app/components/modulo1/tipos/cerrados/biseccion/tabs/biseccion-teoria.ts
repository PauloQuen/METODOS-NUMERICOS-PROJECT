import { Component, computed, signal } from '@angular/core';
import { biseccion } from '../biseccion.algoritmo';
import {
  CONVERGENCIA_BISECCION,
  CRITERIOS_PARADA_BISECCION,
  PASOS_ALGORITMO_BISECCION,
} from '../biseccion-explicacion';

/** Fundamentos, convergencia, algoritmo y recomendaciones de Bisección. */
@Component({
  selector: 'app-biseccion-teoria',
  standalone: true,
  templateUrl: './biseccion-teoria.html',
  styleUrls: ['./biseccion-teoria.scss', '../../shared/pasos-criterios.scss'],
})
export class BiseccionTeoria {
  readonly tolerancia = signal(0.001);
  readonly paso = signal(0);
  readonly funcion = (x: number) => x ** 3 - x - 2;
  readonly resultado = computed(() => biseccion({
    f: this.funcion, a: 1, b: 2, tol: this.tolerancia(), maxIter: 100,
  }));
  readonly filas = computed(() => this.resultado().filas.slice(0, this.paso()));
  readonly actual = computed(() => this.filas().at(-1));
  readonly terminado = computed(() => this.paso() >= this.resultado().filas.length);
  // Gráfica, indicadores y tabla describen el mismo intervalo evaluado.
  readonly intervalo = computed(() => {
    const fila = this.actual();
    return { a: fila?.a ?? 1, b: fila?.b ?? 2 };
  });
  readonly curva = Array.from({ length: 121 }, (_, i) => {
    const x = 0.8 + 1.4 * i / 120;
    return `${i ? 'L' : 'M'}${this.px(x)},${this.py(this.funcion(x))}`;
  }).join(' ');
  readonly mensaje = computed(() => {
    const fila = this.actual();
    if (!fila) return 'Pulsa «Siguiente paso» para calcular el primer punto medio.';
    if (this.terminado()) return `Criterio cumplido: raíz ≈ ${this.formato(fila.c)}. La cota de error es ${this.formato(fila.error)}.`;
    const mitad = this.funcion(fila.a) * fila.fc < 0 ? '[a, c]' : '[c, b]';
    return `Paso ${fila.n}: f(c) = ${this.formato(fila.fc)}. En el siguiente paso conservamos ${mitad}, donde hay cambio de signo.`;
  });

  readonly pasos = PASOS_ALGORITMO_BISECCION;
  readonly criterios = CRITERIOS_PARADA_BISECCION;
  readonly convergencia = CONVERGENCIA_BISECCION;

  px(x: number): number { return 40 + (x - 0.8) / 1.4 * 540; }
  py(y: number): number { return 270 - (y + 3) / 9.6 * 250; }
  formato(x: number): string {
    return x.toLocaleString('es-PE', { maximumFractionDigits: 8 });
  }
  siguiente(): void {
    if (!this.terminado()) this.paso.update((paso) => paso + 1);
  }
  reiniciar(): void { this.paso.set(0); }
  cambiarTolerancia(event: Event): void {
    this.tolerancia.set(Number((event.target as HTMLSelectElement).value));
    this.reiniciar();
  }
}
