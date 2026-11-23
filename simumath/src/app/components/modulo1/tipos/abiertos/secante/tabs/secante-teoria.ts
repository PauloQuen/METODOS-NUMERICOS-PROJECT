import { Component, computed, signal } from '@angular/core';
import { ejecutarSecante } from '../secante.algoritmo';
import { DemoIteracion, ResumenIteracion } from '../../shared/demo-iteracion';
import { graficaDemo } from '../../shared/demo-grafica';
import { DemoEjes } from '../../shared/demo-ejes';
import { PASOS_SECANTE } from '../secante-pasos';

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

interface ParInicial {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  xn: number | null;
}

/** Fundamentos, geometría, convergencia, algoritmo y recomendaciones de la secante. */
@Component({
  selector: 'app-secante-teoria',
  standalone: true,
  imports: [DemoIteracion, DemoEjes],
  templateUrl: './secante-teoria.html',
  styleUrl: './secante-teoria.scss',
})
export class SecanteTeoria {
  readonly tolerancia = signal(0.001);
  readonly paso = signal(0);
  readonly semilla0 = signal(2.4);
  readonly semilla1 = signal(2);
  readonly funcion = (x: number) => x ** 3 + x - 2;

  readonly resultado = computed(() => ejecutarSecante({
    f: this.funcion,
    x0: this.semilla0(),
    x1: this.semilla1(),
    tol: this.tolerancia(),
    maxIter: 30,
    criterio: 'absoluto',
  }));

  // Cada fila del motor guarda la nueva aproximación y la x que le sirvió de
  // punto actual. Reconstruimos el otro punto de la recta (la x anterior de la
  // ventana) para dibujar la secante y los dos triángulos semejantes.
  readonly filas = computed<FilaDemo[]>(() => {
    const filas: FilaDemo[] = [];
    let anterior = this.semilla0();
    for (const fila of this.resultado().filas.slice(0, this.paso())) {
      const f0 = this.funcion(anterior);
      const f1 = this.funcion(fila.xPrev);
      filas.push({
        n: fila.n,
        x0: anterior,
        f0,
        x1: fila.xPrev,
        f1,
        xn: fila.x,
        pendiente: (f1 - f0) / (fila.xPrev - anterior),
        delta: fila.delta ?? Math.abs(fila.x - fila.xPrev),
      });
      anterior = fila.xPrev;
    }
    return filas;
  });

  readonly actual = computed(() => this.filas().at(-1));
  readonly terminado = computed(() => this.paso() >= this.resultado().filas.length);

  // Los nombres x₀, x₁ y x₂ solo identifican la primera recta (iteraciones 0 y
  // 1). Después la ventana ya avanzó y esas etiquetas apuntarían a puntos que
  // ya no están en el dibujo, por eso se retiran.
  readonly parInicial = computed<ParInicial | null>(() => {
    if (this.filas().length > 1) return null;
    const fila = this.actual();
    return fila
      ? { x0: fila.x0, y0: fila.f0, x1: fila.x1, y1: fila.f1, xn: fila.xn }
      : {
          x0: this.semilla0(), y0: this.funcion(this.semilla0()),
          x1: this.semilla1(), y1: this.funcion(this.semilla1()), xn: null,
        };
  });

  readonly grafica = computed(() => graficaDemo(
    [this.semilla0(), this.semilla1(), ...this.filas().map(f => f.xn)], this.funcion));
  px(x: number): number { return this.grafica().px(x); }
  py(y: number): number { return this.grafica().py(y); }

  cambiarSemilla(event: Event, indice: number): void {
    const valor = Number((event.target as HTMLInputElement).value);
    if (!Number.isFinite(valor)) return;
    (indice === 0 ? this.semilla0 : this.semilla1).set(Math.max(-4, Math.min(4, valor)));
    this.reiniciar();
  }

  readonly resumen = computed<ResumenIteracion>(() => {
    const f = this.actual();
    const valores = [this.semilla0(), this.semilla1(), ...this.filas().map(fila => fila.xn)];
    const raiz = 1; // Raíz real de x³ + x − 2.
    return {
      n: this.filas().length,
      tendencia: f ? (Math.abs(f.xn - raiz) < Math.abs(f.x1 - raiz) ? 'se acerca' : 'se aleja') : null,
      indicadores: [
        { etiqueta: 'Aproximación xₙ₊₁', valor: f ? this.formato(f.xn) : '—' },
        { etiqueta: 'Desplazamiento |Δx|', valor: f ? this.formatoDelta(f.delta) : '—' },
        { etiqueta: 'Pendiente secante', valor: f ? this.formato(f.pendiente) : '—' },
      ],
      pasos: f ? [
        `Unimos los puntos con abscisas ${this.formato(f.x0)} y ${this.formato(f.x1)} sobre la curva.`,
        `La secante tiene pendiente ${this.formato(f.pendiente)}. Los triángulos verde y rojo son semejantes.`,
        `La recta corta el eje en ${this.formato(f.xn)}. Avanzamos la pareja a ${this.formato(f.x1)} y ${this.formato(f.xn)}.`,
      ] : [`Elige dos semillas distintas: x₀ = ${this.formato(this.semilla0())} y x₁ = ${this.formato(this.semilla1())}.`],
      secuencia: valores.map((v, n) => ({ n, valor: this.formato(v) })).slice(-6),
      mensaje: this.mensaje(),
      estado: this.terminado() ? (this.resultado().convergio ? 'exito' : 'error') : f ? 'activo' : 'inicio',
    };
  });

  puntosVerde(fila: FilaDemo): string {
    return `${this.px(fila.x1)},${this.py(fila.f1)} ${this.px(fila.x0)},${this.py(fila.f1)} ${this.px(fila.x0)},${this.py(fila.f0)}`;
  }

  puntosRojo(fila: FilaDemo): string {
    return `${this.px(fila.xn)},${this.py(0)} ${this.px(fila.x1)},${this.py(0)} ${this.px(fila.x1)},${this.py(fila.f1)}`;
  }

  readonly mensaje = computed(() => {
    const fila = this.actual();
    if (!fila) {
      if (this.terminado() && this.resultado().mensaje) return this.resultado().mensaje!;
      return 'Pulsa «Siguiente paso» para empezar.';
    }
    if (this.terminado()) {
      if (this.resultado().convergio) {
        return `Criterio |Δx| < tolerancia cumplido. Raíz ≈ ${this.formato(fila.xn)}.`;
      }
      return this.resultado().mensaje ?? 'No convergió dentro del máximo de iteraciones.';
    }
    return `Paso ${fila.n}: pendiente de la secante ${this.formato(fila.pendiente, 3)}. La recta corta el eje en ${this.formato(fila.xn)}; |Δx| = ${this.formatoDelta(fila.delta)}.`;
  });

  readonly pasos = PASOS_SECANTE;

  readonly criterios = [
    ['Desplazamiento |Δx|', 'El que usa por defecto', 'ok', 'Mide cuánto se movió la x entre dos iteraciones. Es invariante a la escala de f: multiplicar la función por 1000 no cambia el paso. Ojo: es una medición a posteriori; con f muy plana, un Δx chico puede esconder un error grande.'],
    ['¿Y la cota de Bolzano?', 'No existe aquí', 'error', 'Bolzano necesita un intervalo con cambio de signo y este es un método abierto: no hay intervalo ni red de seguridad. La única garantía real es verificar al final que f(raíz) ≈ 0.'],
    ['Residuo |f(x)|', 'Frágil', 'error', 'Depende de la escala: si escribes 1000·f(x), el residuo crece 1000 veces y el método para mucho antes o mucho después.'],
    ['Residuo relativo', 'Parcial', 'primario', 'Divide el residuo por una escala cerca de la raíz. Corrige en parte el problema de la escala, pero sigue midiendo la función y no la distancia real a la raíz.'],
  ];

  readonly ventajas = [
    'No necesita derivada: reemplaza f′ por la pendiente entre dos puntos, útil donde f′ no existe o es incómoda.',
    'Convergencia superlineal (orden φ ≈ 1,618): casi tan rápida como Newton cerca de la raíz.',
    'Evalúa una sola función por paso (f), como bisección.',
    'No exige cambio de signo: puede encontrar una raíz donde bisección y regla falsa no ven Bolzano.',
  ];

  readonly limitaciones = [
    'Necesita DOS semillas, y ambas importan.',
    'Si f(xₙ) = f(xₙ₋₁) el denominador es cero y no hay paso.',
    'Sin intervalo no hay red de seguridad: un paso puede salirse del dominio de f.',
    'Un poquito más lenta que Newton y llega al orden 2: no es perfecta.',
    'Con f casi plana, dos puntos cercanos dan una pendiente ruidosa.',
  ];

  readonly recomendaciones = [
    'Elige las dos semillas mirando la función: dos puntos cercanos a la raíz lanzan bien el método.',
    'Corre SIEMPRE con tope de iteraciones.',
    'Verifica al final |f(raíz)| ≈ 0: un Δx chico no prueba nada por sí solo.',
    'Usa |Δx| como criterio de parada, con 10⁻⁴ a 10⁻⁶.',
    'Si la derivada es fácil, considera Newton; si es incómoda, la secante es el reemplazo natural.',
  ];

  /** Decimal con coma, sin notación científica y como máximo 6 decimales. */
  formato(x: number, decimales = 6): string {
    return Number.isFinite(x) ? x.toFixed(decimales).replace('.', ',') : '—';
  }

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
