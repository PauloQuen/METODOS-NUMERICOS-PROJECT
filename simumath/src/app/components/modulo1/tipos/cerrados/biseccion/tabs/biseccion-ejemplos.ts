import { Component, inject } from '@angular/core';
import { EJEMPLOS_BISECCION } from '../biseccion.contenido';
import { BiseccionService, type BiseccionEstado } from '../biseccion.service';
import { BiseccionEjemplo } from '../biseccion-ejemplo';

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
 * ── Misma estructura que Teoría ──────────────────────────────────────
 * El layout de cada ejemplo (gráfico, indicadores, mensaje, historial,
 * pasos del algoritmo, criterios de parada y conclusión) vive en
 * `BiseccionEjemplo`, que comparte los textos con la pestaña Teoría.
 */
@Component({
  selector: 'app-biseccion-ejemplos',
  standalone: true,
  imports: [BiseccionEjemplo],
  templateUrl: './biseccion-ejemplos.html',
  styleUrl: './biseccion-ejemplos.scss',
})
export class BiseccionEjemplos {
  private readonly servicio = inject(BiseccionService);

  /** Los ejemplos del contenido: 2 numéricos y 2 casuísticas. */
  readonly ejemplos = EJEMPLOS_BISECCION;

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

  /** Funciones ya parseadas y rangos, estables para no recalcular la escala del SVG en cada ciclo. */
  protected readonly funciones = this.ejemplos.map((e) => this.servicio.funcionDeEjemplo(e));
  protected readonly rangos = this.ejemplos.map((e) => this.servicio.rangoPara(e.calculo));
}
