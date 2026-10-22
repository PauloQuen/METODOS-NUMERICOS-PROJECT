import { Component, inject } from '@angular/core';
import { EJEMPLOS_ELIMINACION_GAUSS } from '../eliminacion-gauss.contenido';
import { COLUMNAS_GAUSS } from '../eliminacion-gauss.config';
import { EliminacionGaussService, type GaussEstado } from '../eliminacion-gauss.service';
import { BloqueEjemploSistema } from '../../../../shared/bloque-ejemplo-sistema/bloque-ejemplo-sistema';
import { formatearNumero } from '../../../../shared/sistema';

/**
 * PESTAÑA DE EJEMPLOS de Eliminación de Gauss.
 * Cada ejemplo se calcula una vez al construir el componente.
 */
@Component({
  selector: 'app-eliminacion-gauss-ejemplos',
  standalone: true,
  imports: [BloqueEjemploSistema],
  templateUrl: './eliminacion-gauss-ejemplos.html',
  styleUrl: '../../../../shared/estilos/lista.scss',
})
export class EliminacionGaussEjemplos {
  private readonly servicio = inject(EliminacionGaussService);

  readonly ejemplos = EJEMPLOS_ELIMINACION_GAUSS;
  readonly columnas = COLUMNAS_GAUSS;

  protected readonly calculos: GaussEstado[] = this.ejemplos.map((e) =>
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
