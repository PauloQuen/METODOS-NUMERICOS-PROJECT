import { Component, computed, signal } from '@angular/core';
import { reglaFalsa } from '../regla-falsa.algoritmo';

@Component({
  selector: 'app-regla-falsa-teoria',
  standalone: true,
  templateUrl: './regla-falsa-teoria.html',
  styleUrl: './regla-falsa-teoria.scss',
})
export class ReglaFalsaTeoria {
  readonly tolerancia = signal(0.001);
  readonly paso = signal(0);
  readonly funcion = (x: number) => x ** 3 - x - 2;
  readonly resultado = computed(() => reglaFalsa({
    f: this.funcion, a: 1, b: 2, tol: this.tolerancia(), maxIter: 100,
    criterio: 'absoluto',
  }));
  readonly filas = computed(() => this.resultado().filas.slice(0, this.paso()));
  readonly actual = computed(() => this.filas().at(-1));
  readonly terminado = computed(() => this.paso() >= this.resultado().filas.length);
  readonly errorAbsoluto = computed(() => this.actual()?.delta);
  readonly extremoFijo = computed(() => {
    const filas = this.filas();
    if (filas.length < 2) return undefined;
    const actual = filas.at(-1)!;
    const anterior = filas.at(-2)!;
    const extremoIzquierdoFijo = actual.a === anterior.a;
    const extremoDerechoFijo = actual.b === anterior.b;
    if (extremoIzquierdoFijo && !extremoDerechoFijo) return 'a';
    if (extremoDerechoFijo && !extremoIzquierdoFijo) return 'b';
    return undefined;
  });
  // La cuerda corresponde al intervalo que produjo c, no a la siguiente iteración.
  readonly intervalo = computed(() => {
    const fila = this.actual();
    return { a: fila?.a ?? 1, b: fila?.b ?? 2 };
  });
  readonly erroresPorIteracion = computed(() =>
    this.filas()
      .filter((fila) => fila.delta !== undefined)
      .map((fila) => ({ n: fila.n, error: fila.delta as number })),
  );
  readonly maximoErrorGrafico = computed(() => {
    const errores = this.erroresPorIteracion().map((item) => item.error);
    return Math.max(this.tolerancia(), ...errores, 0.0000001);
  });
  readonly rangoGrafico = computed(() => {
    if (this.tolerancia() === 0.000001) {
      return { superior: -3, inferior: -7 };
    }
    return { superior: -1, inferior: -6 };
  });

  readonly yError = (error: number): number => {
    if (!Number.isFinite(error) || error <= 0) return 112;

    const rango = this.rangoGrafico();
    const exponente = Math.log10(error);
    const fraccion = (exponente - rango.superior) / (rango.inferior - rango.superior);
    const y = 112 - ((1 - fraccion) * 82);
    return Math.max(30, Math.min(112, y));
  };
  readonly alturaError = (error: number): number => {
    const y = this.yError(error);
    return Math.max(112 - y, 1);
  };
  readonly xError = (indice: number, total: number): number => {
    const ancho = Math.min(36, 520 / total - 6);
    return 36 + indice * (ancho + 6) + ancho / 2;
  };
  readonly anchoError = (total: number): number =>
    total <= 1 ? 36 : Math.max(10, Math.min(36, 520 / total - 6));
  readonly yTolerancia = computed(() => {
    const rango = this.rangoGrafico();
    const exponente = Math.log10(this.tolerancia());
    const fraccion = (exponente - rango.superior) / (rango.inferior - rango.superior);
    const y = 112 - ((1 - fraccion) * 82);
    return Math.max(30, Math.min(112, y));
  });
  readonly curva = Array.from({ length: 121 }, (_, i) => {
    const x = 0.8 + 1.4 * i / 120;
    return `${i ? 'L' : 'M'}${this.px(x)},${this.py(this.funcion(x))}`;
  }).join(' ');
  readonly mensaje = computed(() => {
    const fila = this.actual();
    if (!fila) return 'Pulsa «Siguiente paso» para encontrar el primer cruce de la cuerda con el eje x.';
    if (this.terminado()) {
      if (!this.resultado().convergio) return 'Se alcanzó el límite de iteraciones sin cumplir el criterio.';
      if (fila.fc === 0) return `f(c) = 0: raíz encontrada en c = ${this.formato(fila.c)}.`;
      return `Criterio cumplido: raíz aproximada ≈ ${this.formato(fila.c)}; cambio absoluto ${this.formato(fila.delta)}.`;
    }
    const mitad = this.funcion(fila.a) * fila.fc < 0 ? '[a, c]' : '[c, b]';
    return `Paso ${fila.n}: f(c) = ${this.formato(fila.fc)}. Conservamos ${mitad} en la siguiente iteración.${fila.delta === undefined ? ' Aún no hay una aproximación anterior para comparar.' : ''}`;
  });
  readonly pasos = [
    ['Verifica las condiciones', 'Comprueba la continuidad en [a, b]. Si un extremo es raíz, termina; en otro caso exige f(a) · f(b) < 0.'],
    ['Calcula c', 'Une (a, f(a)) con (b, f(b)). Su cruce con el eje x es c = b − f(b)·(b − a)/(f(b) − f(a)).'],
    ['Evalúa la nueva aproximación', 'Calcula f(c). Si f(c) = 0, c es una raíz y el proceso termina.'],
    ['Comprueba la tolerancia', 'Desde la segunda iteración, compara |cₙ − cₙ₋₁| con la tolerancia absoluta. Es un indicador a posteriori, no una garantía del error real.'],
    ['Conserva el intervalo izquierdo', 'Si f(a) y f(c) tienen signos opuestos, sustituye b por c y f(b) por f(c).'],
    ['O conserva el intervalo derecho', 'En caso contrario, sustituye a por c y f(a) por f(c). Solo se conserva uno de los dos intervalos.'],
    ['Construye la siguiente cuerda', 'Repite desde el paso 2 con los extremos actualizados. Un extremo puede permanecer fijo; establece un máximo de iteraciones.'],
  ];

  px(x: number): number { return 40 + (x - 0.8) / 1.4 * 540; }
  py(y: number): number { return 270 - (y + 3) / 9.6 * 250; }
  formato(x: number | null | undefined): string {
    return x == null ? '—' : x.toLocaleString('es-PE', { maximumFractionDigits: 8 });
  }
  readonly valorAbsoluto = Math.abs;
  readonly esFinito = Number.isFinite;
  formatoPorcentaje(x: number | null | undefined): string {
    if (x == null || !Number.isFinite(x)) return '—';
    return x.toLocaleString('es-PE', { style: 'percent', maximumFractionDigits: 6 });
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
