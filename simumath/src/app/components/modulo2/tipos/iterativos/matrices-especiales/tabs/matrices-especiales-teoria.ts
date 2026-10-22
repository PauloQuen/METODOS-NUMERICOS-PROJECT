import { Component, inject, signal } from '@angular/core';
import { TEORIA_MATRICES_ESPECIALES } from '../matrices-especiales.contenido';
import {
  MatricesEspecialesService,
  type GaussSeidelEstado,
} from '../matrices-especiales.service';
import { BloqueEjemploSistema } from '../../../../shared/bloque-ejemplo-sistema/bloque-ejemplo-sistema';
import { crearDibujoConvergencia, rangoConvergencia, rangoError } from '../../../../shared/grafico-convergencia';
import { formatearNumero } from '../../../../shared/sistema';
import type { DibujarMetodo } from '../../../../../../shared/models/metodo.model';

/**
 * PESTAÑA DE TEORÍA de Matrices especiales (Gauss-Seidel).
 * Explica la estructura especial de la matriz, la fórmula iterativa y
 * muestra dos ejemplos con su gráfico de convergencia.
 */
@Component({
  selector: 'app-matrices-especiales-teoria',
  standalone: true,
  imports: [BloqueEjemploSistema],
  templateUrl: './matrices-especiales-teoria.html',
  styleUrl: '../../../../shared/estilos/teoria.scss',
})
export class MatricesEspecialesTeoria {
  private readonly servicio = inject(MatricesEspecialesService);

  readonly teoria = TEORIA_MATRICES_ESPECIALES;

  readonly abierta = signal<'fundamento' | 'falla' | 'precision' | null>('fundamento');

  protected readonly normal = this.servicio.calcularEjemplo(this.teoria.ejemploNormal);
  protected readonly casuistica = this.servicio.calcularEjemplo(this.teoria.ejemploCasuistica);

  readonly funcionCero = () => 0;
  readonly dibujo: DibujarMetodo = crearDibujoConvergencia();

  readonly rangoNormal = rangoConvergencia(this.normal.filas);
  readonly rangoYNormal = rangoError(this.normal.filas);
  readonly rangoCasuistica = rangoConvergencia(this.casuistica.filas);
  readonly rangoYCasuistica = rangoError(this.casuistica.filas);

  protected alternar(clave: 'fundamento' | 'falla' | 'precision'): void {
    this.abierta.update((actual) => (actual === clave ? null : clave));
  }

  protected errorDe(estado: GaussSeidelEstado): string {
    return estado.error !== undefined ? formatearNumero(estado.error) : '—';
  }
}
