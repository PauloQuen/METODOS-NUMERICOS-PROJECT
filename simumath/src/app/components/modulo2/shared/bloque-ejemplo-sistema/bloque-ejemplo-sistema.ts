import { Component, computed, input, signal } from '@angular/core';
import { IterationTable } from '../../../../shared/domain/iteration-table/iteration-table';
import { GraficoMetodo } from '../../../../shared/domain/grafico-metodo/grafico-metodo';
import { PasosControl } from '../../../../shared/domain/pasos-control/pasos-control';
import { UiCard } from '../../../../shared/ui/ui-card/ui-card';
import type { Columna, DibujarMetodo } from '../../../../shared/models/metodo.model';
import type { EjemploModulo2 } from '../../modelos/modulo2.model';
import { formatearNumero, formatearVector, matrizAumentada } from '../sistema';

/**
 * Tarjeta de un ejemplo resuelto del Módulo 2.
 *
 * Muestra el enunciado, el sistema aumentado [A | b], los pasos y la
 * tabla de trabajo. Si el método es iterativo, además dibuja la
 * convergencia del error; si es directo, muestra la solución y el
 * residuo. La tabla y el gráfico se calculan con el motor, no se copian
 * a mano.
 */
@Component({
  selector: 'app-bloque-ejemplo-sistema',
  standalone: true,
  imports: [IterationTable, GraficoMetodo, PasosControl, UiCard],
  templateUrl: './bloque-ejemplo-sistema.html',
  styleUrl: './bloque-ejemplo-sistema.scss',
})
export class BloqueEjemploSistema {
  readonly ejemplo = input.required<EjemploModulo2>();

  readonly filas = input<Record<string, number | string>[]>([]);
  readonly columnas = input<Columna[]>([]);
  readonly filaFinal = input<number | undefined>(undefined);

  /** Solución calculada, si el método la produce. */
  readonly solucion = input<number[] | undefined>(undefined);

  /** Texto de la medida de calidad: residuo o error final. */
  readonly bondad = input('');
  readonly etiquetaBondad = input('Calidad');

  /** Pasos alternativos (por ejemplo, una línea por iteración). */
  readonly pasos = input<string[] | undefined>(undefined);

  /** Si viene, se dibuja la convergencia; si no, no hay gráfico. */
  readonly funcion = input<((x: number) => number) | undefined>(undefined);
  readonly rango = input({ min: 0, max: 1 });
  readonly rangoY = input<{ min: number; max: number } | undefined>(undefined);
  readonly dibujarMetodo = input<DibujarMetodo | undefined>(undefined);
  readonly leyenda = input('');

  readonly tituloTabla = input('Tabla de trabajo');
  readonly badgeFila = input('');
  readonly pasoActual = signal(0);

  readonly esCasuistica = computed(() => this.ejemplo().tipo === 'casuistica');

  /** Matriz aumentada [A | b] para mostrarla como tabla. */
  readonly filasAumentadas = computed(() =>
    matrizAumentada(this.ejemplo().calculo.A, this.ejemplo().calculo.b),
  );

  /** Encabezados x₁, x₂, … y la columna b. */
  readonly variables = computed(() =>
    Array.from({ length: this.ejemplo().calculo.A.length }, (_, i) => `x${subindice(i + 1)}`),
  );

  readonly solucionTexto = computed(() => {
    const x = this.solucion();
    return x && x.length > 0 ? formatearVector(x) : '';
  });

  protected formatear(v: number): string {
    return formatearNumero(v);
  }

  protected textoPaso(indice: number): string {
    const pasos = this.pasos() ?? this.ejemplo().pasos;
    if (pasos.length === 0) return '';
    return pasos[Math.min(indice, pasos.length - 1)] ?? '';
  }

  protected alCambiarPaso(nuevo: number): void {
    this.pasoActual.set(nuevo);
  }
}

/** Subíndices unicode para los nombres de las incógnitas. */
function subindice(n: number): string {
  const digitos = '₀₁₂₃₄₅₆₇₈₉';
  return String(n)
    .split('')
    .map((d) => digitos[Number(d)] ?? d)
    .join('');
}
