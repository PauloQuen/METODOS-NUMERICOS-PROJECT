import { Component, computed, input, signal } from '@angular/core';
import { IterationTable } from '../iteration-table/iteration-table';
import { GraficoMetodo } from '../grafico-metodo/grafico-metodo';
import { PasosControl } from '../pasos-control/pasos-control';
import { UiCard } from '../../ui/ui-card/ui-card';
import type { Columna, DibujarMetodo, Ejemplo } from '../../models/metodo.model';

/**
 * Tarjeta de un ejemplo resuelto.
 *
 * ── El bloque más repetido del portal ─────────────────────────────────
 * Aparece igual en la pestaña de Teoría, en Ejemplos y (al desplegar la
 * solución) en Autoevaluación. Por eso vive en `shared/` y recibe el
 * ejemplo por `input()`: no sabe de qué método viene ni qué significa
 * "bisección" o "secante".
 *
 * La estructura de dos columnas es fija para todos los métodos:
 *
 *   ┌─────────────────────┬──────────────────────┐
 *   │ Texto y cuentas     │  Gráfico del método  │
 *   │ (lo que hay que     │  + botones de pasos  │
 *   │  entender)          │  (lo que hay que ver)│
 *   └─────────────────────┴──────────────────────┘
 *   Conclusión en palabras
 *   Tabla de iteraciones
 *
 * ── Las cuentas y los números ─────────────────────────────────────────
 * `ejemplo()` trae el texto, pero la tabla de iteraciones y el gráfico
 * se calculan con los DATOS que trae (`calculo`), no con lo que dice el
 * texto. Así el ejemplo no puede mentir: si el algoritmo cambia, la
 * tabla cambia con él.
 */
@Component({
  selector: 'app-bloque-ejemplo',
  standalone: true,
  imports: [IterationTable, GraficoMetodo, PasosControl, UiCard],
  templateUrl: './bloque-ejemplo.html',
  styleUrl: './bloque-ejemplo.scss',
})
export class BloqueEjemplo {
  /** El ejemplo a mostrar, con su texto y sus datos de cálculo. */
  readonly ejemplo = input.required<Ejemplo>();

  /** Las filas ya calculadas por el algoritmo del método. */
  readonly filas = input<Record<string, number | string>[]>([]);

  /** Las columnas de la tabla, definidas por el método. */
  readonly columnas = input<Columna[]>([]);

  /** Índice de la fila que cumple el criterio (se resalta en dorado). */
  readonly filaFinal = input<number | undefined>(undefined);

  /** La función ya parseada, para el gráfico. */
  readonly funcion = input.required<(x: number) => number>();

  /** Rango visible del eje x. */
  readonly rango = input({ min: -5, max: 5 });

  /**
   * La raíz que encontró el método, si ya la encontró.
   *
   * Se pasa desde afuera (el padre la saca del resultado del algoritmo)
   * para que el gráfico pueda marcar la banda donde cae la raíz.
   */
  readonly raiz = input<number | undefined>(undefined);

  /**
   * Cómo dibuja ESTE método lo suyo sobre el gráfico.
   *
   * Va tipado como `DibujarMetodo` (el contrato de shared/models) y no
   * como un callback suelto: así el compilador obliga a que la función
   * tenga la firma (ctx, rect, contexto) y no se puede pasar algo
   * incompatible por error.
   */
  readonly dibujarMetodo = input<DibujarMetodo | undefined>(undefined);

  /** Qué claves de la fila usa el método para dibujar (a, b, c...). */
  readonly clavesGrafico = input<{ intervaloIzq?: string; intervaloDer?: string; punto?: string }>({});

  /** Muestra el botón "Ver video" si el contenido trae link. */
  readonly videoUrl = input<string | undefined>(undefined);

  /** Muestra el bloque de extracción de datos (solo casuísticas). */
  readonly esCasuistica = computed(() => this.ejemplo().tipo === 'casuistica');

  /** Qué iteración se está viendo. Lo mueven los botones de pasos. */
  readonly pasoActual = signal(0);

  /** La última fila, que es la que converge. */
  protected readonly ultimaFila = computed(() => {
    const f = this.filas();
    return f.length > 0 ? f[f.length - 1] : undefined;
  });

  /** La función del gráfico cambia si el ejemplo cambia. */
  protected readonly textoPaso = (indice: number): string => {
    const pasos = this.ejemplo().pasos;
    if (indice < pasos.length) return pasos[indice];
    const ultima = pasos[pasos.length - 1];
    return ultima ?? '';
  };

  /** Lo que dicen los botones de pasos. */
  protected alCambiarPaso(nuevo: number): void {
    this.pasoActual.set(nuevo);
  }
}
