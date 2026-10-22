import { Component, inject, signal } from '@angular/core';
import { CAMPOS_CALCULADORA_GAUSS, COLUMNAS_GAUSS } from '../eliminacion-gauss.config';
import { EliminacionGaussService, type GaussEstado } from '../eliminacion-gauss.service';
import { PanelSistema } from '../../../../shared/panel-sistema/panel-sistema';
import { IterationTable } from '../../../../../../shared/domain/iteration-table/iteration-table';
import { UiCard } from '../../../../../../shared/ui/ui-card/ui-card';
import { formatearNumero, formatearVector } from '../../../../shared/sistema';

/**
 * PESTAÑA DE CALCULADORA de Eliminación de Gauss.
 * El panel junta A y b; el servicio resuelve y este componente reparte
 * el resultado entre el resumen y la tabla de operaciones.
 */
@Component({
  selector: 'app-eliminacion-gauss-calculadora',
  standalone: true,
  imports: [PanelSistema, IterationTable, UiCard],
  templateUrl: './eliminacion-gauss-calculadora.html',
  styleUrl: '../../../../shared/estilos/calculadora.scss',
})
export class EliminacionGaussCalculadora {
  private readonly servicio = inject(EliminacionGaussService);

  readonly campos = CAMPOS_CALCULADORA_GAUSS;
  readonly columnas = COLUMNAS_GAUSS;

  protected readonly estado = this.servicio.resultado;
  protected readonly valores = signal<Record<string, string>>({});

  protected alCalcular(escrito: Record<string, string>): void {
    this.servicio.calcularDesdeTexto({
      matrizTexto: escrito['matriz'] ?? '',
      vectorTexto: escrito['vector'] ?? '',
      etiqueta: 'Datos ingresados',
    });
  }

  protected alLimpiar(): void {
    this.servicio.limpiar();
    this.valores.set({});
  }

  protected solucionDe(e: GaussEstado): string {
    return e.x ? formatearVector(e.x) : '—';
  }

  protected residuoDe(e: GaussEstado): string {
    return e.residual !== undefined ? formatearNumero(e.residual, 8) : '—';
  }

  protected determinanteDe(e: GaussEstado): string {
    return e.determinante !== undefined ? formatearNumero(e.determinante) : '—';
  }
}
