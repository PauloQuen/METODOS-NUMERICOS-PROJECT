import { crearBanco } from '../../../../autoevaluacion/banco';
import { PracticaM3Service } from '../../../../autoevaluacion/practica.service';
import { Component, computed, inject } from '@angular/core';
import { EJERCICIOS_MINIMOS_CUADRADOS } from '../minimos-cuadrados.contenido';
import { COLUMNAS_MINIMOS_CUADRADOS } from '../minimos-cuadrados.config';
import {
  MinimosCuadradosService,
  type MinimosCuadradosEstado,
} from '../minimos-cuadrados.service';
import { crearDibujoMinimosCuadrados } from '../minimos-cuadrados.grafico';
import { BloqueEjercicioDatos } from '../../../../shared/bloque-ejercicio-datos/bloque-ejercicio-datos';
import {
  autoevaluacionMejoradaM3,
  politicaDeMetodoM3,
} from '../../../../autoevaluacion.config';

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

  private readonly practica = inject(PracticaM3Service);
  readonly banco = crearBanco(EJERCICIOS_MINIMOS_CUADRADOS, 'minimos-cuadrados');
  readonly ejercicios = this.practica.tanda('minimos-cuadrados', this.banco);
  nuevaTanda(): void { this.practica.nuevaTanda('minimos-cuadrados', this.banco); }
  readonly columnas = COLUMNAS_MINIMOS_CUADRADOS;

  readonly mejorada = autoevaluacionMejoradaM3('ajuste', 'minimos-cuadrados');
  readonly desbloqueoBase = politicaDeMetodoM3('ajuste', 'minimos-cuadrados');

  protected readonly calculos = computed(() => this.ejercicios().map(e => this.servicio.calcularEjemplo(e)));

  private readonly funciones = computed(() => this.ejercicios().map(e => this.servicio.rectaDe(e.calculo)));
  private readonly rangos = computed(() => this.ejercicios().map(e => this.servicio.rangoPara(e.calculo)));
  private readonly dibujos = computed(() => this.ejercicios().map((e, i) =>
    crearDibujoMinimosCuadrados({
      evaluarEn: e.calculo.evaluarEn,
      prediccion: this.calculos()[i].prediccion,
    }),
  ));

  protected calculoDe(indice: number): MinimosCuadradosEstado {
    return this.calculos()[indice];
  }

  protected funcionDe(indice: number): (x: number) => number {
    return this.funciones()[indice];
  }

  protected rangoDe(indice: number): { min: number; max: number } {
    return this.rangos()[indice];
  }

  protected dibujoDe(indice: number) {
    return this.dibujos()[indice];
  }
}
