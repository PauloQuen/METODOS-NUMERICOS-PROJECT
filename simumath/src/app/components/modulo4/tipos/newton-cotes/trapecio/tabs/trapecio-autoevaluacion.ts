import { Component, inject } from '@angular/core';
import { EJERCICIOS_TRAPECIO } from '../trapecio.contenido';
import { COLUMNAS_TRAPECIO } from '../trapecio.config';
import { TrapecioService, type TrapecioEstado } from '../trapecio.service';
import { crearDibujoTrapecio } from '../trapecio.grafico';
import { BloqueEjercicioIntegracion } from '../../../../shared/bloque-ejercicio-integracion/bloque-ejercicio-integracion';

/**
 * PESTAÑA DE AUTOEVALUACIÓN del trapecio.
 *
 * Cuatro ejercicios: dos numéricos y dos de casuística. Cada uno muestra
 * solo el planteamiento y una pista; el desarrollo completo (tabla, área
 * y conclusión) aparece recién al pedir la solución.
 */
@Component({
  selector: 'app-trapecio-autoevaluacion',
  standalone: true,
  imports: [BloqueEjercicioIntegracion],
  templateUrl: './trapecio-autoevaluacion.html',
  styleUrl: '../../../../shared/estilos/lista.scss',
})
export class TrapecioAutoevaluacion {
  private readonly servicio = inject(TrapecioService);

  readonly ejercicios = EJERCICIOS_TRAPECIO;
  readonly columnas = COLUMNAS_TRAPECIO;

  private readonly calculos: TrapecioEstado[] = this.ejercicios.map((e) =>
    this.servicio.calcularEjemplo(e),
  );

  private readonly funciones = this.ejercicios.map((e) => this.servicio.funcionDe(e.calculo));
  private readonly rangos = this.ejercicios.map((e) => this.servicio.rangoPara(e.calculo));
  private readonly dibujos = this.ejercicios.map(() => crearDibujoTrapecio());

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
