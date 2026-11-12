import { Component, computed, inject, signal } from '@angular/core';
import { EJEMPLOS_GAUSS } from '../gauss.contenido';
import { COLUMNAS_GAUSS } from '../gauss.config';
import { GaussService } from '../gauss.service';
import { dibujarGauss } from '../gauss.grafico';
import { BloqueEjemplo } from '../../../../../../shared/domain/bloque-ejemplo/bloque-ejemplo';

/**
 * Pestaña de EJEMPLOS de la eliminación gaussiana.
 *
 * Tres ejemplos resueltos, cada uno con su gráfico y su tabla de pasos.
 *
 * ── Un vector de pasos en vez de tres signals ─────────────────────────
 * Cada bloque tiene su propio índice de paso, y hay tres bloques. Con
 * tres signals separados el template se llena de `paso0()`, `paso1()`,
 * `paso2()` y cualquier cambio de cantidad obliga a tocar el HTML. Con
 * un vector, el template es el mismo para cualquier cantidad de
 * ejemplos: se itera sobre el índice.
 */
@Component({
  selector: 'app-gauss-ejemplos',
  standalone: true,
  imports: [BloqueEjemplo],
  templateUrl: './gauss-ejemplos.html',
  styleUrl: './gauss-ejemplos.scss',
})
export class GaussEjemplos {
  readonly ejemplos = EJEMPLOS_GAUSS;
  readonly columnas = COLUMNAS_GAUSS;
  readonly dibujar = dibujarGauss;

  private readonly servicio = inject(GaussService);

  /** El estado calculado de cada ejemplo, en el mismo orden. */
  readonly estados = signal(this.ejemplos.map((e) => this.servicio.calcularEjemplo(e)));

  /** El paso actual de cada ejemplo, en el mismo orden. */
  readonly pasos = signal<number[]>(this.ejemplos.map(() => 0));

  /** El rango del gráfico de cada ejemplo. */
  readonly rangos = computed(() =>
    this.estados().map((e) => this.servicio.rangoPara(e.sistema, e.solucion)),
  );

  /** Avisa que el alumno cambió de paso en el ejemplo `indice`. */
  alCambiarPaso(indice: number, nuevo: number): void {
    this.pasos.update((todos) => {
      const copia = [...todos];
      copia[indice] = nuevo;
      return copia;
    });
  }

  /** El paso actual de un ejemplo. */
  pasoDe(indice: number): number {
    return this.pasos()[indice] ?? 0;
  }
}
