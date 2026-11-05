import { Component, inject } from '@angular/core';
import { EJEMPLOS_LAGRANGE } from '../lagrange.contenido';
import { COLUMNAS_LAGRANGE } from '../lagrange.config';
import { LagrangeService, type LagrangeEstado } from '../lagrange.service';
import { crearDibujoLagrange } from '../lagrange.grafico';
import { BloqueEjemploDatos } from '../../../../shared/bloque-ejemplo-datos/bloque-ejemplo-datos';

/**
 * PESTAÑA DE EJEMPLOS de Lagrange (2 numéricos + 2 casuísticas).
 *
 * Cada ejemplo se calcula UNA vez al construir el componente y el
 * resultado se guarda en un array. No se calcula en cada ciclo de
 * detección de cambios: con cuatro ejemplos eso serían cuatro corridas
 * del algoritmo por ciclo.
 *
 * Las tablas y los gráficos salen del motor, así que el texto de cada
 * ejemplo no puede contradecir lo que se muestra.
 */
@Component({
  selector: 'app-lagrange-ejemplos',
  standalone: true,
  imports: [BloqueEjemploDatos],
  templateUrl: './lagrange-ejemplos.html',
  styleUrl: '../../../../shared/estilos/lista.scss',
})
export class LagrangeEjemplos {
  private readonly servicio = inject(LagrangeService);

  /** Los ejemplos del contenido. */
  readonly ejemplos = EJEMPLOS_LAGRANGE;

  readonly columnas = COLUMNAS_LAGRANGE;

  /** El cálculo de cada ejemplo, hecho una vez. */
  protected readonly calculos: LagrangeEstado[] = this.ejemplos.map((e) =>
    this.servicio.calcularEjemplo(e),
  );

  /** El polinomio de cada ejemplo, para el gráfico. */
  private readonly funciones = this.ejemplos.map((e) => this.servicio.polinomioDe(e.calculo));

  /** El rango del eje x de cada ejemplo. */
  private readonly rangos = this.ejemplos.map((e) => this.servicio.rangoPara(e.calculo));

  /** El dibujo de cada ejemplo, con su punto de estimación. */
  private readonly dibujos = this.ejemplos.map((e, i) =>
    crearDibujoLagrange({ evaluarEn: e.calculo.evaluarEn, valor: this.calculos[i].valor }),
  );

  protected calculoDe(indice: number): LagrangeEstado {
    return this.calculos[indice];
  }

  protected funcionDe(indice: number): (x: number) => number {
    return this.funciones[indice];
  }

  protected rangoDe(indice: number): { min: number; max: number } {
    return this.rangos[indice];
  }

  protected dibujoDe(indice: number) {
    return this.dibujos[indice];
  }
}
