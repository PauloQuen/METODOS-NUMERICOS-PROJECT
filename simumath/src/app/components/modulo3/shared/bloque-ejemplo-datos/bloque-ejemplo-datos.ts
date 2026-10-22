import { Component, computed, input, signal } from '@angular/core';
import { IterationTable } from '../../../../shared/domain/iteration-table/iteration-table';
import { GraficoMetodo } from '../../../../shared/domain/grafico-metodo/grafico-metodo';
import { PasosControl } from '../../../../shared/domain/pasos-control/pasos-control';
import { UiCard } from '../../../../shared/ui/ui-card/ui-card';
import type { Columna, DibujarMetodo } from '../../../../shared/models/metodo.model';
import type { EjemploModulo3 } from '../../modelos/modulo3.model';

/**
 * Tarjeta de un ejemplo resuelto del Módulo 3.
 *
 * ── Por qué no se reutiliza `bloque-ejemplo` del Módulo 1 ────────────
 * Porque la estructura del contenido es distinta: acá no hay función
 * `f(x)` ni iteraciones, hay una TABLA DE DATOS y un modelo. El Módulo 1
 * pinta la ecuación y las iteraciones; acá se pinta la tabla de datos,
 * los pasos del modelo y la tabla de trabajo.
 *
 * Lo que sí se reutiliza es el MOTOR de presentación: `app-grafico-metodo`
 * (ejes, cuadrícula y curva), `app-pasos-control` y `app-iteration-table`.
 * Este componente solo ordena el contenido.
 *
 * ── La tabla y el gráfico se calculan, no se copian ──────────────────
 * `ejemplo()` trae los textos y los DATOS (los puntos). Las filas de la
 * tabla y el gráfico salen de correr el algoritmo del método. Así el
 * ejemplo no puede mentir: si el motor cambia, la pantalla cambia con él.
 */
@Component({
  selector: 'app-bloque-ejemplo-datos',
  standalone: true,
  imports: [IterationTable, GraficoMetodo, PasosControl, UiCard],
  templateUrl: './bloque-ejemplo-datos.html',
  styleUrl: './bloque-ejemplo-datos.scss',
})
export class BloqueEjemploDatos {
  /** El ejemplo a mostrar, con su texto y sus datos. */
  readonly ejemplo = input.required<EjemploModulo3>();

  /** Las filas ya calculadas por el algoritmo del método. */
  readonly filas = input<Record<string, number | string>[]>([]);

  /** Las columnas de la tabla de trabajo. */
  readonly columnas = input<Columna[]>([]);

  /** Índice de la fila que cumple el criterio (se resalta). */
  readonly filaFinal = input<number | undefined>(undefined);

  /** La curva a dibujar: el polinomio interpolante o la recta ajustada. */
  readonly funcion = input.required<(x: number) => number>();

  /** Rango visible del eje x. */
  readonly rango = input({ min: -5, max: 5 });

  /** Cómo dibuja ESTE método lo suyo sobre el gráfico. */
  readonly dibujarMetodo = input<DibujarMetodo | undefined>(undefined);

  /** Texto de la leyenda del gráfico. */
  readonly leyenda = input('');

  /** Título de la tabla de trabajo ("Aportes de cada dato", "Tabla de trabajo"). */
  readonly tituloTabla = input('Tabla de trabajo');

  /** Texto del badge de la fila resaltada. */
  readonly badgeFila = input('');

  /** Qué iteración / punto se está viendo. Lo mueven los botones de pasos. */
  readonly pasoActual = signal(0);

  /** ¿Es una casuística? (para mostrar enunciado y extracción de datos). */
  readonly esCasuistica = computed(() => this.ejemplo().tipo === 'casuistica');

  /** Los puntos de la tabla de datos, en el orden del enunciado. */
  readonly puntos = computed(() => this.ejemplo().calculo.puntos ?? []);

  /** El texto del paso que se está viendo. */
  protected textoPaso(indice: number): string {
    const pasos = this.ejemplo().pasos;
    if (pasos.length === 0) return '';
    return pasos[Math.min(indice, pasos.length - 1)] ?? '';
  }

  protected alCambiarPaso(nuevo: number): void {
    this.pasoActual.set(nuevo);
  }
}
