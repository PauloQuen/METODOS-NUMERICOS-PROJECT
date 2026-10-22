import { Component, inject } from '@angular/core';
import { EJERCICIOS_LAGRANGE } from '../lagrange.contenido';
import { COLUMNAS_LAGRANGE } from '../lagrange.config';
import { LagrangeService, type LagrangeEstado } from '../lagrange.service';
import { crearDibujoLagrange } from '../lagrange.grafico';
import { BloqueEjercicioDatos } from '../../../../shared/bloque-ejercicio-datos/bloque-ejercicio-datos';

/**
 * PESTAÑA DE AUTOEVALUACIÓN de Lagrange (3 numéricos + 3 casuísticas).
 *
 * El bloque de ejercicio es genérico: sabe mostrar el planteamiento y
 * desplegar la solución, pero no sabe qué método es ni qué datos tiene.
 * Por eso el cálculo se hace acá y se le pasa la tabla ya lista.
 */
@Component({
  selector: 'app-lagrange-autoevaluacion',
  standalone: true,
  imports: [BloqueEjercicioDatos],
  templateUrl: './lagrange-autoevaluacion.html',
  styleUrl: '../../../../shared/estilos/lista.scss',
})
export class LagrangeAutoevaluacion {
  private readonly servicio = inject(LagrangeService);

  /** Los seis ejercicios. */
  readonly ejercicios = EJERCICIOS_LAGRANGE;

  readonly columnas = COLUMNAS_LAGRANGE;

  /** El cálculo de cada ejercicio, hecho una vez. */
  protected readonly calculos: LagrangeEstado[] = this.ejercicios.map((e) =>
    this.servicio.calcularEjemplo(e),
  );

  private readonly funciones = this.ejercicios.map((e) => this.servicio.polinomioDe(e.calculo));
  private readonly rangos = this.ejercicios.map((e) => this.servicio.rangoPara(e.calculo));
  private readonly dibujos = this.ejercicios.map((e, i) =>
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
