import { Component, computed, input, signal } from '@angular/core';
import { UiCard } from '../../../../shared/ui/ui-card/ui-card';
import { BloqueEjemploDatos } from '../bloque-ejemplo-datos/bloque-ejemplo-datos';
import type { Columna, DibujarMetodo } from '../../../../shared/models/metodo.model';
import type { EjemploModulo3, EjercicioModulo3 } from '../../modelos/modulo3.model';

/**
 * Bloque de ejercicio del Módulo 3 (Autoevaluación).
 *
 * Muestra primero SOLO el planteamiento y los datos. Al presionar
 * "Ver solución" se despliega la resolución completa con la MISMA
 * estructura de un ejemplo: pasos, gráfico con botones, tabla de
 * trabajo y conclusión.
 *
 * Es genérico: no sabe si el ejercicio es de Lagrange o de mínimos
 * cuadrados. El componente del método es quien calcula las filas y le
 * pasa todo listo.
 */
@Component({
  selector: 'app-bloque-ejercicio-datos',
  standalone: true,
  imports: [UiCard, BloqueEjemploDatos],
  templateUrl: './bloque-ejercicio-datos.html',
  styleUrl: './bloque-ejercicio-datos.scss',
})
export class BloqueEjercicioDatos {
  /** Ejercicio a resolver. */
  readonly ejercicio = input.required<EjercicioModulo3>();

  /** Filas calculadas de la solución. */
  readonly filas = input<Record<string, number | string>[]>([]);

  /** Columnas de la tabla de trabajo. */
  readonly columnas = input<Columna[]>([]);

  /** Índice de la fila resaltada. */
  readonly filaFinal = input<number | undefined>(undefined);

  /** Curva a dibujar (polinomio o recta). */
  readonly funcion = input.required<(x: number) => number>();

  /** Rango x del gráfico. */
  readonly rango = input({ min: -5, max: 5 });

  /** Dibujador propio del método. */
  readonly dibujarMetodo = input<DibujarMetodo | undefined>(undefined);

  /** Leyenda del gráfico. */
  readonly leyenda = input('');

  /** Título de la tabla de trabajo. */
  readonly tituloTabla = input('Tabla de trabajo');

  /** ¿Muestra la solución? */
  readonly mostrarSolucion = signal(false);

  readonly esCasuistica = computed(() => this.ejercicio().tipo === 'casuistica');

  /** Los puntos del enunciado, para el planteamiento. */
  readonly puntos = computed(() => this.ejercicio().calculo.puntos ?? []);

  protected alternar(): void {
    this.mostrarSolucion.update((v) => !v);
  }

  /** El ejercicio convertido a Ejemplo para reutilizar el bloque. */
  protected comoEjemplo(): EjemploModulo3 {
    return { ...this.ejercicio() };
  }
}
