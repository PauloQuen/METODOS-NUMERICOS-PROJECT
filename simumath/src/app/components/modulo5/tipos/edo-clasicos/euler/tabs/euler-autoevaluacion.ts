import { Component, inject } from '@angular/core';
import { EJERCICIOS_EULER } from '../euler.contenido';
import { COLUMNAS_EULER } from '../euler.config';
import { EulerService } from '../euler.service';
import { crearDibujoEdo } from '../../../../shared/edo.grafico';
import { rangoYDe } from '../../../../shared/edo';
import { BloqueEjercicioEdo } from '../../../../shared/bloque-ejercicio-edo/bloque-ejercicio-edo';

/**
 * AUTOEVALUACIÓN DE EULER: seis ejercicios. El botón «Ver solución» queda
 * bloqueado hasta resolver bien el cuestionario.
 */
@Component({
  selector: 'app-euler-autoevaluacion',
  standalone: true,
  imports: [BloqueEjercicioEdo],
  templateUrl: './euler-autoevaluacion.html',
  styleUrl: '../../../../shared/estilos/lista.scss',
})
export class EulerAutoevaluacion {
  private readonly servicio = inject(EulerService);

  readonly ejercicios = EJERCICIOS_EULER;
  readonly columnas = COLUMNAS_EULER;

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
