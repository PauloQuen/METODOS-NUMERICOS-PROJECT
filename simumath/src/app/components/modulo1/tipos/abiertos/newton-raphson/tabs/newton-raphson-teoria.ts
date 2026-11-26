import { Component, computed, signal } from '@angular/core';
import { newtonRaphson } from '../newton-raphson.algoritmo';
import { DemoIteracion, ResumenIteracion } from '../../shared/demo-iteracion';
import { graficaDemo } from '../../shared/demo-grafica';
import { DemoEjes } from '../../shared/demo-ejes';
import { PASOS_NEWTON } from '../newton-raphson-pasos';

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
  imports: [DemoIteracion, DemoEjes],
  templateUrl: './newton-raphson-teoria.html',
  styleUrl: './newton-raphson-teoria.scss',
})
export class NewtonRaphsonTeoria {
  readonly tolerancia = signal(0.001);
  readonly paso = signal(0);
  readonly semilla = signal(2.4);
  readonly funcion = (x: number) => x ** 3 + x - 2;

  readonly resultado = computed(() => newtonRaphson({
    f: this.funcion,
    x0: this.semilla(),
    tol: this.tolerancia(),
    maxIter: 30,
    criterio: 'absoluto',
  }));

  // El motor guarda la aproximación NUEVA en cada fila. Para la demostración
  // necesitamos el par (xₙ, f(xₙ)) que origina la tangente, así que se
  // reconstruye a partir de la semilla y de la fila anterior.
  readonly filas = computed<FilaDemo[]>(() => {
    const filas: FilaDemo[] = [];
    let anterior = this.semilla();
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

  readonly grafica = computed(() => graficaDemo(
    [this.semilla(), ...this.filas().map(f => f.xn)], this.funcion));
  px(x: number): number { return this.grafica().px(x); }
  py(y: number): number { return this.grafica().py(y); }

  cambiarSemilla(event: Event): void {
    const valor = Number((event.target as HTMLInputElement).value);
    if (!Number.isFinite(valor)) return;
    this.semilla.set(Math.max(-4, Math.min(4, valor)));
    this.reiniciar();
  }

  readonly resumen = computed<ResumenIteracion>(() => {
    const f = this.actual();
    const valores = [this.semilla(), ...this.filas().map(fila => fila.xn)];
    const raiz = 1; // Raíz real de x³ + x − 2.
    return {
      n: this.filas().length,
      tendencia: f ? (Math.abs(f.xn - raiz) < Math.abs(f.x - raiz) ? 'se acerca' : 'se aleja') : null,
      indicadores: [
        { etiqueta: 'Aproximación xₙ₊₁', valor: f ? this.formato(f.xn) : '—' },
        { etiqueta: 'Desplazamiento |Δx|', valor: f ? this.formatoDelta(f.delta) : '—' },
        { etiqueta: 'Derivada f′(xₙ)', valor: f ? this.formato(f.fpx) : '—' },
      ],
      pasos: f ? [
        `Partimos de xₙ = ${this.formato(f.x)} y evaluamos f(xₙ) = ${this.formato(f.fx)}.`,
        `Trazamos la tangente con pendiente f′(xₙ) = ${this.formato(f.fpx)}.`,
        `Su corte con el eje x es xₙ₊₁ = ${this.formato(f.xn)}; este será el punto de partida siguiente.`,
      ] : [`Elige una semilla. Partimos de x₀ = ${this.formato(this.semilla())} y trazaremos su tangente.`],
      secuencia: valores.map((v, n) => ({ n, valor: this.formato(v) })).slice(-6),
      mensaje: this.mensaje(),
      estado: this.terminado() ? (this.resultado().convergio ? 'exito' : 'error') : f ? 'activo' : 'inicio',
    };
  });

  readonly mensaje = computed(() => {
    const fila = this.actual();
    if (!fila) return this.terminado() ? this.resultado().mensaje ?? 'No se puede avanzar desde esta semilla.' : 'Pulsa «Siguiente paso» para empezar.';
    if (this.terminado()) {
      const resultado = this.resultado();
      if (resultado.convergio) {
        return `Criterio |Δx| < tolerancia cumplido. Raíz ≈ ${this.formato(fila.xn)}.`;
      }
      return resultado.mensaje ?? 'No convergió dentro del máximo de iteraciones.';
    }
    return `Paso ${fila.n}: f′(xₙ) = ${this.formato(fila.fpx, 3)}. La tangente corta el eje en ${this.formato(fila.xn)}; |Δx| = ${this.formatoDelta(fila.delta)}.`;
  });

  readonly pasos = PASOS_NEWTON;

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
