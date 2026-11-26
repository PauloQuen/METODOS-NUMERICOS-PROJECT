import { Component, computed, input, signal } from '@angular/core';
import type { Ejemplo } from '../../../../../shared/models/metodo.model';
import { UiCard } from '../../../../../shared/ui/ui-card/ui-card';
import type { BiseccionEstado } from './biseccion.service';
import { BiseccionGraficoSvg } from './biseccion-grafico-svg';
import {
  PASOS_ALGORITMO_BISECCION,
} from './biseccion-explicacion';

interface FilaVista {
  [clave: string]: string | number;
  n: number;
  a: string;
  b: string;
  c: string;
  fc: string;
  error: string;
}

/**
 * Un ejemplo resuelto de Bisección con la MISMA estructura de la pestaña
 * Teoría: demostración (gráfico → indicadores → mensaje → historial), pasos
 * del algoritmo, criterios de parada y conclusión.
 *
 * El texto del enunciado y la explicación siguen viniendo del contenido; los
 * números salen del mismo `BiseccionEstado` que usa la calculadora.
 */
@Component({
  selector: 'app-biseccion-ejemplo',
  standalone: true,
  imports: [BiseccionGraficoSvg, UiCard],
  templateUrl: './biseccion-ejemplo.html',
  styleUrls: ['./biseccion-ejemplo.scss', '../shared/pasos-criterios.scss'],
})
export class BiseccionEjemplo {
  readonly ejemplo = input.required<Ejemplo>();
  readonly calculo = input.required<BiseccionEstado>();
  readonly funcion = input.required<(x: number) => number>();
  readonly rango = input.required<{ min: number; max: number }>();
  readonly indice = input(0);

  readonly pasosAlgoritmo = PASOS_ALGORITMO_BISECCION;

  /** Número de iteraciones reveladas, igual que en Teoría. */
  readonly paso = signal(0);

  readonly esCasuistica = computed(() => this.ejemplo().tipo === 'casuistica');

  readonly filas = computed<FilaVista[]>(() =>
    this.calculo().filas.map((f) => ({
      n: Number(f['n']),
      a: String(f['a']),
      b: String(f['b']),
      c: String(f['c']),
      fc: String(f['fc']),
      error: String(f['error']),
    })),
  );

  readonly historial = computed(() => this.filas().slice(0, this.paso()));
  readonly actual = computed<FilaVista | null>(() => this.historial().at(-1) ?? null);

  readonly terminado = computed(() => this.paso() >= this.filas().length);

  /** Gráfico, indicadores y mensaje describen el MISMO intervalo. */
  readonly intervalo = computed(() => {
    const fila = this.actual();
    return {
      a: this.numero(fila?.a) ?? this.ejemplo().calculo.a!,
      b: this.numero(fila?.b) ?? this.ejemplo().calculo.b!,
    };
  });

  readonly mensaje = computed(() => {
    const fila = this.actual();
    if (!fila) return 'Pulsa «Siguiente paso» para calcular el primer punto medio.';
    if (this.terminado() && this.calculo().convergio) {
      return `Criterio cumplido: raíz ≈ ${this.formato(fila.c)}. La cota de error es ${this.formato(fila.error)}.`;
    }
    const fa = this.funcion()(this.numero(fila.a) ?? 0);
    const fc = this.numero(fila.fc) ?? 0;
    const mitad = fa * fc < 0 ? '[a, c]' : '[c, b]';
    return `Paso ${fila.n}: f(c) = ${this.formato(fila.fc)}. En el siguiente paso conservamos ${mitad}, donde hay cambio de signo.`;
  });

  siguiente(): void {
    if (!this.terminado()) this.paso.update((paso) => paso + 1);
  }

  reiniciar(): void { this.paso.set(0); }

  /** Formato sin notación `e` y con seis decimales como máximo. */
  formato(valor: number | string | null | undefined): string {
    if (valor === null || valor === undefined || valor === '') return '—';
    const numero = typeof valor === 'number' ? valor : Number(valor);
    if (!Number.isFinite(numero)) return '—';
    return numero.toLocaleString('es-PE', {
      maximumFractionDigits: 6,
      useGrouping: false,
    });
  }

  esUltima(fila: FilaVista): boolean {
    return fila.n === this.actual()?.n;
  }

  cumpleCriterio(fila: FilaVista): boolean {
    return this.calculo().filaFinal === this.filas().indexOf(fila);
  }

  private numero(valor: number | string | null | undefined): number | null {
    if (valor === null || valor === undefined || valor === '') return null;
    const resultado = Number(valor);
    return Number.isFinite(resultado) ? resultado : null;
  }
}
