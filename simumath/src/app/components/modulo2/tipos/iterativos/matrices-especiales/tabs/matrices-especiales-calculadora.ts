import { Component, computed, inject, signal } from '@angular/core';
import {
  CAMPOS_CALCULADORA_MATRICES_ESPECIALES,
  COLUMNAS_MATRICES_ESPECIALES,
} from '../matrices-especiales.config';
import {
  MatricesEspecialesService,
  type GaussSeidelEstado,
} from '../matrices-especiales.service';
import { PanelSistema } from '../../../../shared/panel-sistema/panel-sistema';
import { IterationTable } from '../../../../../../shared/domain/iteration-table/iteration-table';
import { PasosControl } from '../../../../../../shared/domain/pasos-control/pasos-control';
import { GraficoMetodo } from '../../../../../../shared/domain/grafico-metodo/grafico-metodo';
import { UiCard } from '../../../../../../shared/ui/ui-card/ui-card';
import { crearDibujoConvergencia, rangoConvergencia, rangoError } from '../../../../shared/grafico-convergencia';
import { formatearNumero, formatearVector } from '../../../../shared/sistema';
import type { DibujarMetodo } from '../../../../../../shared/models/metodo.model';

/**
 * PESTAÑA DE CALCULADORA de Matrices especiales (Gauss-Seidel).
 * Muestra la tabla de iteraciones, el gráfico del error y los botones
 * para recorrer las iteraciones.
 */
@Component({
  selector: 'app-matrices-especiales-calculadora',
  standalone: true,
  imports: [PanelSistema, IterationTable, PasosControl, GraficoMetodo, UiCard],
  templateUrl: './matrices-especiales-calculadora.html',
  styleUrl: '../../../../shared/estilos/calculadora.scss',
})
export class MatricesEspecialesCalculadora {
  private readonly servicio = inject(MatricesEspecialesService);

  readonly campos = CAMPOS_CALCULADORA_MATRICES_ESPECIALES;

  protected readonly estado = this.servicio.resultado;
  protected readonly valores = signal<Record<string, string>>({});
  protected readonly paso = signal(0);

  readonly funcionCero = () => 0;
  readonly dibujo: DibujarMetodo = crearDibujoConvergencia();

  protected readonly columnas = computed(
    () => this.estado()?.columnas ?? COLUMNAS_MATRICES_ESPECIALES,
  );

  protected readonly total = computed(() => this.estado()?.filas.length ?? 0);

  protected readonly rango = computed(() => {
    const e = this.estado();
    return e ? rangoConvergencia(e.filas) : { min: 0, max: 1 };
  });

  protected readonly rangoY = computed(() => {
    const e = this.estado();
    return e ? rangoError(e.filas) : { min: 0, max: 1 };
  });

  protected readonly textoDelPaso = computed(() => {
    const e = this.estado();
    if (!e) return '';
    return e.pasos[this.paso()] ?? '';
  });

  protected alCalcular(escrito: Record<string, string>): void {
    this.servicio.calcularDesdeTexto({
      matrizTexto: escrito['matriz'] ?? '',
      vectorTexto: escrito['vector'] ?? '',
      tolTexto: escrito['tol'] ?? '',
      maxIterTexto: escrito['maxIter'] ?? '',
      x0Texto: escrito['x0'] ?? '',
      etiqueta: 'Datos ingresados',
    });
    this.paso.set(0);
  }

  protected alCambiarPaso(paso: number): void {
    this.paso.set(paso);
  }

  protected alLimpiar(): void {
    this.servicio.limpiar();
    this.valores.set({});
    this.paso.set(0);
  }

  protected solucionDe(e: GaussSeidelEstado): string {
    return e.x ? formatearVector(e.x) : '—';
  }

  protected errorDe(e: GaussSeidelEstado): string {
    return e.error !== undefined ? formatearNumero(e.error) : '—';
  }

  protected residuoDe(e: GaussSeidelEstado): string {
    return e.residual !== undefined ? formatearNumero(e.residual) : '—';
  }
}
