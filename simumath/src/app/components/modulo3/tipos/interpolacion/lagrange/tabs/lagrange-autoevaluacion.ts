import { Component, computed, inject } from '@angular/core';
import { EJERCICIOS_LAGRANGE } from '../lagrange.contenido';
import { COLUMNAS_LAGRANGE } from '../lagrange.config';
import { LagrangeService, type LagrangeEstado } from '../lagrange.service';
import { crearDibujoLagrange } from '../lagrange.grafico';
import { BloqueEjercicioDatos } from '../../../../shared/bloque-ejercicio-datos/bloque-ejercicio-datos';
import { crearBanco } from '../../../../autoevaluacion/banco';
import { PracticaM3Service } from '../../../../autoevaluacion/practica.service';
import {
  autoevaluacionMejoradaM3,
  politicaDeMetodoM3,
} from '../../../../autoevaluacion.config';

/**
 * PESTAÑA DE AUTOEVALUACIÓN de Lagrange.
 *
 * La tanda se elige de un banco de 24 ejercicios: tres numéricos y tres
 * de aplicación, con cuatro preguntas aleatorias por ejercicio. La tanda
 * y el progreso se conservan al cambiar de pestaña.
 */
@Component({
  selector: 'app-lagrange-autoevaluacion',
  standalone: true,
  imports: [BloqueEjercicioDatos],
  templateUrl: './lagrange-autoevaluacion.html',
  styleUrl: '../../../../shared/estilos/lista.scss',
})
export class LagrangeAutoevaluacion {
  private readonly servicio = inject(LagrangeService);
  private readonly practica = inject(PracticaM3Service);

  readonly banco = crearBanco(EJERCICIOS_LAGRANGE, 'lagrange');
  readonly ejercicios = this.practica.tanda('lagrange', this.banco);

  readonly columnas = COLUMNAS_LAGRANGE;

  readonly mejorada = autoevaluacionMejoradaM3('interpolacion', 'lagrange');
  readonly desbloqueoBase = politicaDeMetodoM3('interpolacion', 'lagrange');

  protected readonly calculos = computed<LagrangeEstado[]>(() =>
    this.ejercicios().map((e) => this.servicio.calcularEjemplo(e)),
  );

  private readonly funciones = computed(() =>
    this.ejercicios().map((e) => this.servicio.polinomioDe(e.calculo)),
  );

  private readonly rangos = computed(() =>
    this.ejercicios().map((e) => this.servicio.rangoPara(e.calculo)),
  );

  private readonly dibujos = computed(() =>
    this.ejercicios().map((e, i) =>
      crearDibujoLagrange({
        evaluarEn: e.calculo.evaluarEn,
        valor: this.calculos()[i].valor,
      }),
    ),
  );

  nuevaTanda(): void {
    this.practica.nuevaTanda('lagrange', this.banco);
  }

  protected calculoDe(indice: number): LagrangeEstado {
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
