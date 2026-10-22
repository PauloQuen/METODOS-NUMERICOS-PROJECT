import { Component, inject } from '@angular/core';
import { EJERCICIOS_ELIMINACION_GAUSS } from '../eliminacion-gauss.contenido';
import { COLUMNAS_GAUSS } from '../eliminacion-gauss.config';
import { EliminacionGaussService, type GaussEstado } from '../eliminacion-gauss.service';
import { BloqueEjercicioSistema } from '../../../../shared/bloque-ejercicio-sistema/bloque-ejercicio-sistema';
import { formatearNumero } from '../../../../shared/sistema';

/**
 * PESTAÑA DE AUTOEVALUACIÓN de Eliminación de Gauss.
 * Seis ejercicios; la solución completa se calcula al construir la vista.
 */
@Component({
  selector: 'app-eliminacion-gauss-autoevaluacion',
  standalone: true,
  imports: [BloqueEjercicioSistema],
  templateUrl: './eliminacion-gauss-autoevaluacion.html',
  styleUrl: '../../../../shared/estilos/lista.scss',
})
export class EliminacionGaussAutoevaluacion {
  private readonly servicio = inject(EliminacionGaussService);

  readonly ejercicios = EJERCICIOS_ELIMINACION_GAUSS;
  readonly columnas = COLUMNAS_GAUSS;

  protected readonly calculos: GaussEstado[] = this.ejercicios.map((e) =>
    this.servicio.calcularEjemplo(e),
  );

  protected calculoDe(indice: number): GaussEstado {
    return this.calculos[indice];
  }

  protected residuoDe(indice: number): string {
    const r = this.calculos[indice].residual;
    return r !== undefined ? formatearNumero(r, 8) : '—';
  }
}
