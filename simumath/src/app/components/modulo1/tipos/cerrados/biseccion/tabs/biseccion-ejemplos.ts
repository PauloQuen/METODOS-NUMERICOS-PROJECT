import { Component, inject } from '@angular/core';
import { EJEMPLOS_BISECCION } from '../biseccion.contenido';
import { COLUMNAS_BISECCION } from '../biseccion.config';
import { BiseccionService, type BiseccionEstado } from '../biseccion.service';
import { dibujarBiseccion } from '../biseccion.grafico';
import { BloqueEjemplo } from '../../../../../../shared/domain/bloque-ejemplo/bloque-ejemplo';

/**
 * PESTAÑA DE EJEMPLOS de Bisección.
 *
 * ── Por qué calcula todo al construir ────────────────────────────────
 * Cada ejemplo viene del contenido con sus datos. El componente corre
 * el algoritmo una vez por ejemplo al construirse y guarda el resultado
 * en un array. No calcula en cada cambio del template: eso haría que
 * con 4 ejemplos se corra el algoritmo 4 veces por ciclo de detección
 * de cambios, y con más ejemplos se nota.
 *
 * Los datos del ejemplo están verificados en los tests, así que si el
 * cálculo falla, es que alguien cambió el contenido sin recalcular.
 */
@Component({
  selector: 'app-biseccion-ejemplos',
  standalone: true,
  imports: [BloqueEjemplo],
  templateUrl: './biseccion-ejemplos.html',
  styleUrl: './biseccion-ejemplos.scss',
})
export class BiseccionEjemplos {
  private readonly servicio = inject(BiseccionService);

  /** Los ejemplos del contenido: 2 numéricos y 2 casuísticas. */
  readonly ejemplos = EJEMPLOS_BISECCION;

  readonly columnas = COLUMNAS_BISECCION;
  readonly dibujar = dibujarBiseccion;

  /**
   * El cálculo de cada ejemplo, ya hecho.
   *
   * El índice coincide con el de `ejemplos`: el primero es su tabla, el
   * segundo su gráfico, y así. Al no cambiar nunca, puede ser un array
   * normal en vez de un signal.
   */
  protected readonly calculos: BiseccionEstado[] = this.ejemplos.map((e) =>
    this.servicio.calcularEjemplo(e),
  );

  /** El cálculo del ejemplo de ese índice. */
  protected calculoDe(indice: number): BiseccionEstado {
    return this.calculos[indice];
  }

  /** La función ya parseada de ese ejemplo, para el gráfico. */
  protected funcionDe(indice: number): (x: number) => number {
    return this.servicio.funcionDeEjemplo(this.ejemplos[indice]);
  }

  /** El rango del eje X de ese ejemplo. */
  protected rangoDe(indice: number): { min: number; max: number } {
    return this.servicio.rangoPara(this.ejemplos[indice].calculo);
  }

  /** Las claves del gráfico: bisección usa a, b y c. */
}