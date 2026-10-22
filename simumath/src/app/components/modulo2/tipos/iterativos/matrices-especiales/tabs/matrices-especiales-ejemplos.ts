import { Component, inject } from '@angular/core';
import { EJEMPLOS_MATRICES_ESPECIALES } from '../matrices-especiales.contenido';
import {
  MatricesEspecialesService,
  type GaussSeidelEstado,
} from '../matrices-especiales.service';
import { BloqueEjemploSistema } from '../../../../shared/bloque-ejemplo-sistema/bloque-ejemplo-sistema';
import { crearDibujoConvergencia, rangoConvergencia, rangoError } from '../../../../shared/grafico-convergencia';
import { formatearNumero } from '../../../../shared/sistema';
import type { DibujarMetodo } from '../../../../../../shared/models/metodo.model';

/**
 * PESTAÑA DE EJEMPLOS de Matrices especiales (Gauss-Seidel).
 * Cada ejemplo trae su tabla de iteraciones y su gráfico de convergencia.
 */
@Component({
  selector: 'app-matrices-especiales-ejemplos',
  standalone: true,
  imports: [BloqueEjemploSistema],
  templateUrl: './matrices-especiales-ejemplos.html',
  styleUrl: '../../../../shared/estilos/lista.scss',
})
export class MatricesEspecialesEjemplos {
  private readonly servicio = inject(MatricesEspecialesService);

  readonly ejemplos = EJEMPLOS_MATRICES_ESPECIALES;

  protected readonly calculos: GaussSeidelEstado[] = this.ejemplos.map((e) =>
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
