import { Component, computed, signal } from '@angular/core';
import { newtonRaphson } from '../newton-raphson.algoritmo';

interface FilaDemo {
  n: number;
  x: number;
  fx: number;
  fpx: number;
  xn: number;
  delta: number;
}

/** Fundamentos, convergencia, algoritmo y recomendaciones de Newton-Raphson. */
@Component({
  selector: 'app-newton-raphson-teoria',
  standalone: true,
  templateUrl: './newton-raphson-teoria.html',
  styleUrl: './newton-raphson-teoria.scss',
})
export class NewtonRaphsonTeoria {
  readonly tolerancia = signal(0.001);
  readonly paso = signal(0);
  readonly semilla = 2.4;
  readonly funcion = (x: number) => x ** 3 - x - 2;

  readonly resultado = computed(() => newtonRaphson({
    f: this.funcion,
    x0: this.semilla,
    tol: this.tolerancia(),
    maxIter: 30,
    criterio: 'absoluto',
  }));

  // El motor guarda la aproximación NUEVA en cada fila. Para la demostración
  // necesitamos el par (xₙ, f(xₙ)) que origina la tangente, así que se
  // reconstruye a partir de la semilla y de la fila anterior.
  readonly filas = computed<FilaDemo[]>(() => {
    const filas: FilaDemo[] = [];
    let anterior = this.semilla;
    for (const fila of this.resultado().filas.slice(0, this.paso())) {
      filas.push({
        n: fila.n,
        x: anterior,
        fx: this.funcion(anterior),
        fpx: fila.fpx,
        xn: fila.x,
        delta: fila.delta ?? Math.abs(fila.x - anterior),
      });
      anterior = fila.x;
    }
    return filas;
  });

  readonly actual = computed(() => this.filas().at(-1));
  readonly terminado = computed(() => this.paso() >= this.resultado().filas.length);

  px(x: number): number { return 34 + (x - 0.6) / 2.2 * 552; }
  py(y: number): number { return 274 - (y + 4) / 20 * 260; }

  readonly curva = Array.from({ length: 161 }, (_, i) => {
    const x = 0.6 + 2.2 * i / 160;
    return `${i ? 'L' : 'M'}${this.px(x)},${this.py(this.funcion(x))}`;
  }).join(' ');

  readonly mensaje = computed(() => {
    const fila = this.actual();
    if (!fila) return 'Pulsa «Siguiente paso» para empezar.';
    if (this.terminado()) {
      const resultado = this.resultado();
      if (resultado.convergio) {
        return `Criterio |Δx| < tolerancia cumplido. Raíz ≈ ${this.formato(fila.xn)}.`;
      }
      return resultado.mensaje ?? 'No convergió dentro del máximo de iteraciones.';
    }
    return `Paso ${fila.n}: f′(xₙ) = ${this.formato(fila.fpx, 3)}. La tangente corta el eje en ${this.formato(fila.xn)}; |Δx| = ${this.formatoDelta(fila.delta)}.`;
  });

  readonly pasos = [
    ['error', 'Elige la semilla x₀', 'Es el único dato que aportas y no hay intervalo que verificar.'],
    ['error', 'Evalúa f(xₙ) y f′(xₙ)', 'Si |f′(xₙ)| es casi cero, frena: el paso se va a disparar.'],
    ['primario', 'Calcula xₙ₊₁', 'Con la fórmula xₙ₊₁ = xₙ − f(xₙ)/f′(xₙ).'],
    ['primario', 'Evalúa f(xₙ₊₁)', 'Si da cero exacto, terminó: ese punto es la raíz.'],
    ['ok', 'Mide el desplazamiento', '|Δx| = |xₙ₊₁ − xₙ|, y compáralo con la tolerancia.'],
    ['neutro', 'Corre el índice', 'Si |Δx| todavía no llega a la tolerancia, la x vieja se reemplaza por la nueva.'],
    ['neutro', 'Vuelve al paso 2', 'Si se agota el máximo de iteraciones, avisa que no convergió y devuelve el último punto.'],
  ];

  readonly criterios = [
    ['Desplazamiento |Δx|', 'El que usa por defecto', 'ok', 'Mide cuánto se movió la x entre dos iteraciones. Es invariante a la escala de f: multiplicar la función por 1000 no cambia el paso. Ojo: es una medición a posteriori; con f muy plana, un Δx chico puede esconder un error grande.'],
    ['¿Y la cota de Bolzano?', 'No existe aquí', 'error', 'Bolzano necesita un intervalo con cambio de signo y este es un método abierto: no hay intervalo ni red de seguridad. La única garantía real es verificar al final que f(raíz) ≈ 0.'],
    ['Residuo |f(x)|', 'Frágil', 'error', 'Depende de la escala: si escribes 1000·f(x), el residuo crece 1000 veces y el método para mucho antes o mucho después.'],
    ['Residuo relativo', 'Parcial', 'primario', 'Divide el residuo por una escala cerca de la raíz. Corrige en parte el problema de la escala, pero sigue midiendo la función y no la distancia real a la raíz.'],
  ];

  readonly ventajas = [
    'No necesita intervalo: con una sola semilla arranca.',
    'Convergencia cuadrática en raíces simples: duplica los decimales correctos en cada iteración.',
    'Aprovecha la derivada: para funciones suaves casi siempre hace menos iteraciones que cualquier método cerrado.',
    'Si f es lineal, llega a la raíz exacta en una sola iteración.',
    'El criterio |Δx| es invariante a la escala de f.',
  ];

  readonly limitaciones = [
    'Si la derivada queda casi en cero en la semilla, el primer paso se dispara.',
    'Sin intervalo no hay red de seguridad: una semilla mala puede hacer divergir, oscilar o salirse del dominio de f.',
    'En raíces múltiples la convergencia baja a lineal.',
    'Cada paso exige evaluar f′ a mano o con diferencias numéricas.',
  ];

  readonly recomendaciones = [
    'Elige la semilla mirando la función: graficar o evaluar f en un par de puntos cuesta un minuto.',
    'Corre SIEMPRE con tope de iteraciones: es la única defensa razonable contra una semilla pobre.',
    'Verifica al final que |f(raíz)| ≈ 0: un Δx chico no prueba nada por sí solo.',
    'Si f′ cambia de signo cerca de la semilla o el primer paso se dispara, cambia de método (bisección, secante).',
    'Con |Δx| de 10⁻⁴ a 10⁻⁶ alcanza para casi todo trabajo numérico.',
  ];

  formato(x: number, decimales = 6): string {
    return Number.isFinite(x) ? x.toFixed(decimales).replace('.', ',') : '—';
  }

  /** Decimal con coma, sin notación científica y como máximo 6 decimales. */
  formatoDelta(x: number): string {
    if (!Number.isFinite(x)) return '—';
    return x.toFixed(6).replace(/\.?0+$/, '').replace('.', ',');
  }

  siguiente(): void {
    if (!this.terminado()) this.paso.update((paso) => paso + 1);
  }

  reiniciar(): void {
    this.paso.set(0);
  }

  cambiarTolerancia(event: Event): void {
    this.tolerancia.set(Number((event.target as HTMLSelectElement).value));
    this.reiniciar();
  }
}
