import { Component, computed, inject, signal } from '@angular/core';
import { EJEMPLOS_LU } from '../lu.contenido';
import { COLUMNAS_LU } from '../lu.config';
import { LuService } from '../lu.service';
import { dibujarLu } from '../lu.grafico';
import { BloqueEjemplo } from '../../../../../../shared/domain/bloque-ejemplo/bloque-ejemplo';
import { GraficoSistema } from '../../../../../../shared/domain/grafico-sistema/grafico-sistema';

/**
 * Pestaña de EJEMPLOS de la factorización LU.
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
  selector: 'app-lu-ejemplos',
  standalone: true,
  imports: [BloqueEjemplo, GraficoSistema],
  templateUrl: './lu-ejemplos.html',
  styleUrl: './lu-ejemplos.scss',
})
export class LuEjemplos {
  readonly ejemplos = EJEMPLOS_LU;
  readonly columnas = COLUMNAS_LU;
  readonly dibujar = dibujarLu;

  private readonly servicio = inject(LuService);

  /** El estado calculado de cada ejemplo, en el mismo orden. */
  readonly estados = signal(this.ejemplos.map((e) => this.servicio.calcularEjemplo(e)));

  /** El paso actual de cada ejemplo, en el mismo orden. */
  readonly pasos = signal<number[]>(this.ejemplos.map(() => 0));

  /** El rango del gráfico de cada ejemplo. */
  readonly rangos = computed(() =>
    this.estados().map((e) => this.servicio.rangoPara(e.sistema, e.solucion)),
  );

  /**
   * El sistema triangular de cada ejemplo, para el paso en que está.
   *
   * Solo se muestra durante la descomposición: después el triangular ya
   * hizo su trabajo y lo que se construye es la solución.
   */
  readonly extras = computed(() =>
    this.estados().map((e, i) => this.servicio.sistemasExtraDe(e, this.pasoDe(i))),
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
