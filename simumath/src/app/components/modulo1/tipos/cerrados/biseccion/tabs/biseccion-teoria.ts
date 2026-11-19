import { Component, computed, signal } from '@angular/core';
import { biseccion } from '../biseccion.algoritmo';

/** Fundamentos, convergencia, algoritmo y recomendaciones de Bisección. */
@Component({
  selector: 'app-biseccion-teoria',
  standalone: true,
  templateUrl: './biseccion-teoria.html',
  styleUrl: './biseccion-teoria.scss',
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

  readonly pasos = [
    ['Verifica las condiciones', 'Comprueba que f sea continua en [a, b]. Si un extremo es raíz, termina; en otro caso exige f(a) · f(b) < 0.'],
    ['Calcula el punto medio', 'c = (a + b) / 2. Esta será la aproximación de la iteración.'],
    ['Evalúa la función', 'Calcula f(c). Si f(c) = 0, c es una raíz y el proceso termina.'],
    ['Comprueba la tolerancia', 'Si (b − a)/2 ≤ tolerancia, devuelve c con esa cota de error.'],
    ['Elige la mitad izquierda', 'Si f(a) y f(c) tienen signos opuestos, conserva [a, c]: sustituye b por c.'],
    ['O elige la mitad derecha', 'En caso contrario, conserva [c, b]: sustituye a por c. Solo se elige una de las dos mitades.'],
    ['Repite desde el paso 2', 'Cada reducción divide el ancho por dos. Detén también el proceso si se alcanza el máximo de iteraciones.'],
  ];

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
