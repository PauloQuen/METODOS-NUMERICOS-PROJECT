import { Component, inject } from '@angular/core';
import { EJERCICIOS_MATRICES_ESPECIALES } from '../matrices-especiales.contenido';
import {
  MatricesEspecialesService,
  type GaussSeidelEstado,
} from '../matrices-especiales.service';
import { BloqueEjercicioSistema } from '../../../../shared/bloque-ejercicio-sistema/bloque-ejercicio-sistema';
import { crearDibujoConvergencia, rangoConvergencia, rangoError } from '../../../../shared/grafico-convergencia';
import { formatearNumero } from '../../../../shared/sistema';
import type { DibujarMetodo } from '../../../../../../shared/models/metodo.model';

/**
 * PESTAÑA DE AUTOEVALUACIÓN de Matrices especiales (Gauss-Seidel).
 * Seis ejercicios con solución desplegable, tabla y gráfico de error.
 */
@Component({
  selector: 'app-matrices-especiales-autoevaluacion',
  standalone: true,
  imports: [BloqueEjercicioSistema],
  templateUrl: './matrices-especiales-autoevaluacion.html',
  styleUrl: '../../../../shared/estilos/lista.scss',
})
export class MatricesEspecialesAutoevaluacion {
  private readonly servicio = inject(MatricesEspecialesService);

  readonly ejercicios = EJERCICIOS_MATRICES_ESPECIALES;

  protected readonly calculos: GaussSeidelEstado[] = this.ejercicios.map((e) =>
    this.servicio.calcularEjemplo(e),
  );

  readonly funcionCero = () => 0;
  readonly dibujo: DibujarMetodo = crearDibujoConvergencia();

  protected calculoDe(indice: number): GaussSeidelEstado {
    return this.calculos[indice];
  }

  protected rangoDe(indice: number): { min: number; max: number } {
    return rangoConvergencia(this.calculos[indice].filas);
  }

  protected rangoYDe(indice: number): { min: number; max: number } {
    return rangoError(this.calculos[indice].filas);
  }

  protected errorDe(indice: number): string {
    const e = this.calculos[indice].error;
    return e !== undefined ? formatearNumero(e) : '—';
  }
}
