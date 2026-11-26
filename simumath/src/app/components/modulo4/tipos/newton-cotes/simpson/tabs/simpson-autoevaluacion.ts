import { Component, inject } from '@angular/core';
import { EJERCICIOS_SIMPSON } from '../simpson.contenido';
import { COLUMNAS_SIMPSON } from '../simpson.config';
import { SimpsonService, type SimpsonEstado } from '../simpson.service';
import { crearDibujoSimpson } from '../simpson.grafico';
import { BloqueEjercicioIntegracion } from '../../../../shared/bloque-ejercicio-integracion/bloque-ejercicio-integracion';

/**
 * PESTAÑA DE AUTOEVALUACIÓN de Simpson.
 *
 * Cuatro ejercicios: dos numéricos y dos de casuística. Cada uno muestra
 * solo el planteamiento y una pista; el desarrollo completo aparece al
 * pedir la solución.
 */
@Component({
  selector: 'app-simpson-autoevaluacion',
  standalone: true,
  imports: [BloqueEjercicioIntegracion],
  templateUrl: './simpson-autoevaluacion.html',
  styleUrl: '../../../../shared/estilos/lista.scss',
})
export class SimpsonAutoevaluacion {
  private readonly servicio = inject(SimpsonService);

  readonly ejercicios = EJERCICIOS_SIMPSON;
  readonly columnas = COLUMNAS_SIMPSON;

  private readonly calculos: SimpsonEstado[] = this.ejercicios.map((e) =>
    this.servicio.calcularEjemplo(e),
  );

  private readonly funciones = this.ejercicios.map((e) => this.servicio.funcionDe(e.calculo));
  private readonly rangos = this.ejercicios.map((e) => this.servicio.rangoPara(e.calculo));
  private readonly dibujos = this.ejercicios.map(() => crearDibujoSimpson());

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
