import { Component, computed, input, signal } from '@angular/core';
import { UiCard } from '../../ui/ui-card/ui-card';
import { BloqueEjemplo } from '../bloque-ejemplo/bloque-ejemplo';
import type {
  Columna,
  DibujarMetodo,
  Ejemplo,
  Ejercicio,
} from '../../models/metodo.model';

/**
 * Bloque de ejercicio (Autoevaluación).
 *
 * Muestra primero SOLO el planteamiento. Al presionar "Ver solución", se
 * despliega la solución con la MISMA estructura que un Ejemplo: teoría
 * aplicada, gráfico + pasos, tabla y conclusión.
 */
@Component({
  selector: 'app-bloque-ejercicio',
  standalone: true,
  imports: [UiCard, BloqueEjemplo],
  templateUrl: './bloque-ejercicio.html',
  styleUrl: './bloque-ejercicio.scss',
})
export class BloqueEjercicio {
  /** Ejercicio a resolver. */
  readonly ejercicio = input.required<Ejercicio>();

  /** Filas calculadas de la solución. */
  readonly filas = input<Record<string, number | string>[]>([]);

  /** Columnas de la tabla. */
  readonly columnas = input<Columna[]>([]);

  /** Índice de la fila final. */
  readonly filaFinal = input<number | undefined>(undefined);

  /** Función parseada. */
  readonly funcion = input.required<(x: number) => number>();

  /** Rango x del gráfico. */
  readonly rango = input({ min: -5, max: 5 });

  /** Dibujador propio del método. */
  /**
   * Cómo dibuja el método lo suyo sobre el gráfico. Se reenvía tal cual
   * al bloque-ejemplo de la solución.
   */
  readonly dibujarMetodo = input<DibujarMetodo | undefined>(undefined);

  /** Raíz aproximada. */
  readonly raiz = input<number | undefined>(undefined);

  /** ¿Muestra la solución? */
  readonly mostrarSolucion = signal(false);

  readonly esCasuistica = computed(() => this.ejercicio().tipo === 'casuistica');

  protected alternar(): void {
    this.mostrarSolucion.update((v) => !v);
  }

  /** El ejercicio convertido a Ejemplo para reutilizar el bloque. */
  protected convertirAEjemplo(): Ejemplo {
    const e = this.ejercicio();
    return { ...e } as Ejemplo;
  }
}
