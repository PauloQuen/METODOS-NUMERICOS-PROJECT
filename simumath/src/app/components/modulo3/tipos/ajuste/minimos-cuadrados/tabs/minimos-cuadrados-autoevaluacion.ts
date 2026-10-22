import { Component, inject } from '@angular/core';
import { EJERCICIOS_MINIMOS_CUADRADOS } from '../minimos-cuadrados.contenido';
import { COLUMNAS_MINIMOS_CUADRADOS } from '../minimos-cuadrados.config';
import {
  MinimosCuadradosService,
  type MinimosCuadradosEstado,
} from '../minimos-cuadrados.service';
import { crearDibujoMinimosCuadrados } from '../minimos-cuadrados.grafico';
import { BloqueEjercicioDatos } from '../../../../shared/bloque-ejercicio-datos/bloque-ejercicio-datos';

/**
 * PESTAÑA DE AUTOEVALUACIÓN de Mínimos Cuadrados (3 + 3).
 *
 * El cálculo se hace acá y se le pasa resuelto al bloque de ejercicio,
 * que es genérico y no sabe qué método está mostrando.
 */
@Component({
  selector: 'app-minimos-cuadrados-autoevaluacion',
  standalone: true,
  imports: [BloqueEjercicioDatos],
  templateUrl: './minimos-cuadrados-autoevaluacion.html',
  styleUrl: '../../../../shared/estilos/lista.scss',
})
export class MinimosCuadradosAutoevaluacion {
  private readonly servicio = inject(MinimosCuadradosService);

  readonly ejercicios = EJERCICIOS_MINIMOS_CUADRADOS;
  readonly columnas = COLUMNAS_MINIMOS_CUADRADOS;

  protected readonly calculos: MinimosCuadradosEstado[] = this.ejercicios.map((e) =>
    this.servicio.calcularEjemplo(e),
  );

  private readonly funciones = this.ejercicios.map((e) => this.servicio.rectaDe(e.calculo));
  private readonly rangos = this.ejercicios.map((e) => this.servicio.rangoPara(e.calculo));
  private readonly dibujos = this.ejercicios.map((e, i) =>
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
