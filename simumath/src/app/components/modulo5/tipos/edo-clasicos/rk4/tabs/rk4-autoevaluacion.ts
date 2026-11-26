import { Component, inject } from '@angular/core';
import { EJERCICIOS_RK4 } from '../rk4.contenido';
import { COLUMNAS_RK4 } from '../rk4.config';
import { Rk4Service } from '../rk4.service';
import { crearDibujoEdo } from '../../../../shared/edo.grafico';
import { rangoYDe } from '../../../../shared/edo';
import { BloqueEjercicioEdo } from '../../../../shared/bloque-ejercicio-edo/bloque-ejercicio-edo';

/** AUTOEVALUACIÓN DE RK4: seis ejercicios con solución bloqueada. */
@Component({
  selector: 'app-rk4-autoevaluacion',
  standalone: true,
  imports: [BloqueEjercicioEdo],
  templateUrl: './rk4-autoevaluacion.html',
  styleUrl: '../../../../shared/estilos/lista.scss',
})
export class Rk4Autoevaluacion {
  private readonly servicio = inject(Rk4Service);

  readonly ejercicios = EJERCICIOS_RK4;
  readonly columnas = COLUMNAS_RK4;

  private readonly estados = this.ejercicios.map((e) => this.servicio.calcularEjemplo(e));
  private readonly exactas = this.ejercicios.map((e) => this.servicio.exactaDe(e.calculo));
  private readonly rangos = this.ejercicios.map((e) => this.servicio.rangoPara(e.calculo));
  private readonly rangosY = this.estados.map((estado, i) => rangoYDe(estado.filas, this.exactas[i]));
  private readonly dibujos = this.ejercicios.map(() => crearDibujoEdo());

  protected estadoDe(i: number) {
    return this.estados[i];
  }
  protected exactaDe(i: number) {
    return this.exactas[i];
  }
  protected rangoDe(i: number) {
    return this.rangos[i];
  }
  protected rangoYDe(i: number) {
    return this.rangosY[i];
  }
  protected dibujoDe(i: number) {
    return this.dibujos[i];
  }
}
