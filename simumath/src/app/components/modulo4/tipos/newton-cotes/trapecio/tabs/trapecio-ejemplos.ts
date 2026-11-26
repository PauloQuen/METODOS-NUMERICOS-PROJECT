import { Component, inject } from '@angular/core';
import { EJEMPLOS_TRAPECIO } from '../trapecio.contenido';
import { COLUMNAS_TRAPECIO } from '../trapecio.config';
import { TrapecioService, type TrapecioEstado } from '../trapecio.service';
import { crearDibujoTrapecio } from '../trapecio.grafico';
import { BloqueEjemploIntegracion } from '../../../../shared/bloque-ejemplo-integracion/bloque-ejemplo-integracion';

/**
 * PESTAÑA DE EJEMPLOS del trapecio (2 numéricos + 2 casuísticas).
 * Cada ejemplo se calcula una sola vez al construir el componente.
 */
@Component({
  selector: 'app-trapecio-ejemplos',
  standalone: true,
  imports: [BloqueEjemploIntegracion],
  templateUrl: './trapecio-ejemplos.html',
  styleUrl: '../../../../shared/estilos/lista.scss',
})
export class TrapecioEjemplos {
  private readonly servicio = inject(TrapecioService);

  readonly ejemplos = EJEMPLOS_TRAPECIO;
  readonly columnas = COLUMNAS_TRAPECIO;

  private readonly calculos: TrapecioEstado[] = this.ejemplos.map((e) =>
    this.servicio.calcularEjemplo(e),
  );

  private readonly funciones = this.ejemplos.map((e) => this.servicio.funcionDe(e.calculo));
  private readonly rangos = this.ejemplos.map((e) => this.servicio.rangoPara(e.calculo));
  private readonly dibujos = this.ejemplos.map(() => crearDibujoTrapecio());

  protected calculoDe(indice: number): TrapecioEstado {
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
