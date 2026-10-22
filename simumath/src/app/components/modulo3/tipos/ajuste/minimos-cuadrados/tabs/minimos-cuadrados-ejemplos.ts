import { Component, inject } from '@angular/core';
import { EJEMPLOS_MINIMOS_CUADRADOS } from '../minimos-cuadrados.contenido';
import { COLUMNAS_MINIMOS_CUADRADOS } from '../minimos-cuadrados.config';
import {
  MinimosCuadradosService,
  type MinimosCuadradosEstado,
} from '../minimos-cuadrados.service';
import { crearDibujoMinimosCuadrados } from '../minimos-cuadrados.grafico';
import { BloqueEjemploDatos } from '../../../../shared/bloque-ejemplo-datos/bloque-ejemplo-datos';

/**
 * PESTAÑA DE EJEMPLOS de Mínimos Cuadrados (2 numéricos + 2 casuísticas).
 * Cada ejemplo se calcula una sola vez al construir el componente.
 */
@Component({
  selector: 'app-minimos-cuadrados-ejemplos',
  standalone: true,
  imports: [BloqueEjemploDatos],
  templateUrl: './minimos-cuadrados-ejemplos.html',
  styleUrl: '../../../../shared/estilos/lista.scss',
})
export class MinimosCuadradosEjemplos {
  private readonly servicio = inject(MinimosCuadradosService);

  readonly ejemplos = EJEMPLOS_MINIMOS_CUADRADOS;
  readonly columnas = COLUMNAS_MINIMOS_CUADRADOS;

  protected readonly calculos: MinimosCuadradosEstado[] = this.ejemplos.map((e) =>
    this.servicio.calcularEjemplo(e),
  );

  private readonly funciones = this.ejemplos.map((e) => this.servicio.rectaDe(e.calculo));
  private readonly rangos = this.ejemplos.map((e) => this.servicio.rangoPara(e.calculo));
  private readonly dibujos = this.ejemplos.map((e, i) =>
    crearDibujoMinimosCuadrados({
      evaluarEn: e.calculo.evaluarEn,
      prediccion: this.calculos[i].prediccion,
    }),
  );

  protected calculoDe(indice: number): MinimosCuadradosEstado {
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
