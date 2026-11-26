import { Component, inject } from '@angular/core';
import { EJEMPLOS_SIMPSON } from '../simpson.contenido';
import { COLUMNAS_SIMPSON } from '../simpson.config';
import { SimpsonService, type SimpsonEstado } from '../simpson.service';
import { crearDibujoSimpson } from '../simpson.grafico';
import { BloqueEjemploIntegracion } from '../../../../shared/bloque-ejemplo-integracion/bloque-ejemplo-integracion';

/**
 * PESTAÑA DE EJEMPLOS de Simpson (2 numéricos + 2 casuísticas).
 * Cada ejemplo se calcula una sola vez al construir el componente.
 */
@Component({
  selector: 'app-simpson-ejemplos',
  standalone: true,
  imports: [BloqueEjemploIntegracion],
  templateUrl: './simpson-ejemplos.html',
  styleUrl: '../../../../shared/estilos/lista.scss',
})
export class SimpsonEjemplos {
  private readonly servicio = inject(SimpsonService);

  readonly ejemplos = EJEMPLOS_SIMPSON;
  readonly columnas = COLUMNAS_SIMPSON;

  private readonly calculos: SimpsonEstado[] = this.ejemplos.map((e) =>
    this.servicio.calcularEjemplo(e),
  );

  private readonly funciones = this.ejemplos.map((e) => this.servicio.funcionDe(e.calculo));
  private readonly rangos = this.ejemplos.map((e) => this.servicio.rangoPara(e.calculo));
  private readonly dibujos = this.ejemplos.map(() => crearDibujoSimpson());

  protected calculoDe(indice: number): SimpsonEstado {
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
