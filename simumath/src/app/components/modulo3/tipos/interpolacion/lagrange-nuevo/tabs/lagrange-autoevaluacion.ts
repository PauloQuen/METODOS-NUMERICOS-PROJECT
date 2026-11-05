import { Component, inject } from '@angular/core';
import { EJERCICIOS_LAGRANGE } from '../lagrange.contenido';
import { COLUMNAS_LAGRANGE } from '../lagrange.config';
import { LagrangeService, type LagrangeEstado } from '../lagrange.service';
import { crearDibujoLagrange } from '../lagrange.grafico';
import { BloqueEjercicioDatos } from '../../../../shared/bloque-ejercicio-datos/bloque-ejercicio-datos';
import {
  autoevaluacionMejoradaM3,
  politicaDeMetodoM3,
} from '../../../../autoevaluacion.config';

/**
 * PESTAÑA DE AUTOEVALUACIÓN de Lagrange (3 numéricos + 3 casuísticas).
 *
 * Esta pestaña solo arma los datos de cada ejercicio: el cálculo del
 * polinomio, la tabla y el gráfico. Las tres actividades (Ver solución,
 * Cuestionario y Resolución) y su estado viven en el bloque compartido
 * `app-bloque-ejercicio-datos`, que no sabe qué método está mostrando.
 *
 * El cuestionario y la respuesta verificable salen de
 * `lagrange.contenido.ts`: si un ejercicio no los define, el bloque
 * muestra únicamente "Ver solución", como antes.
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

  /** Bandera y política resueltas para este método. */
  readonly mejorada = autoevaluacionMejoradaM3('interpolacion', 'lagrange-nuevo');
  readonly desbloqueoBase = politicaDeMetodoM3('interpolacion', 'lagrange-nuevo');

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
