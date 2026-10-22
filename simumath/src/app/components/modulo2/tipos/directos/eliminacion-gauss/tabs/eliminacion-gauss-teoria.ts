import { Component, inject, signal } from '@angular/core';
import { TEORIA_ELIMINACION_GAUSS } from '../eliminacion-gauss.contenido';
import { COLUMNAS_GAUSS } from '../eliminacion-gauss.config';
import { EliminacionGaussService, type GaussEstado } from '../eliminacion-gauss.service';
import { BloqueEjemploSistema } from '../../../../shared/bloque-ejemplo-sistema/bloque-ejemplo-sistema';
import { formatearNumero } from '../../../../shared/sistema';

/**
 * PESTAÑA DE TEORÍA de Eliminación de Gauss.
 *
 * Sigue la estructura del Módulo 3: concepto, fundamento, cuándo falla,
 * precisión, recursos, tarjeta del método y dos ejemplos calculados con
 * el motor (uno numérico y uno de casuística).
 */
@Component({
  selector: 'app-eliminacion-gauss-teoria',
  standalone: true,
  imports: [BloqueEjemploSistema],
  templateUrl: './eliminacion-gauss-teoria.html',
  styleUrl: '../../../../shared/estilos/teoria.scss',
})
export class EliminacionGaussTeoria {
  private readonly servicio = inject(EliminacionGaussService);

  readonly teoria = TEORIA_ELIMINACION_GAUSS;
  readonly columnas = COLUMNAS_GAUSS;

  readonly abierta = signal<'fundamento' | 'falla' | 'precision' | null>('fundamento');

  protected readonly normal = this.servicio.calcularEjemplo(this.teoria.ejemploNormal);
  protected readonly casuistica = this.servicio.calcularEjemplo(this.teoria.ejemploCasuistica);

  protected alternar(clave: 'fundamento' | 'falla' | 'precision'): void {
    this.abierta.update((actual) => (actual === clave ? null : clave));
  }

  protected residuoDe(estado: GaussEstado): string {
    return estado.residual !== undefined ? formatearNumero(estado.residual, 8) : '—';
  }
}
