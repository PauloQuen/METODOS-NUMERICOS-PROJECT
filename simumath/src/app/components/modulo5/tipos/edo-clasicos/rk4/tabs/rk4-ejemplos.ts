import { Component, inject } from '@angular/core';
import { EJEMPLOS_RK4 } from '../rk4.contenido';
import { COLUMNAS_RK4 } from '../rk4.config';
import { Rk4Service } from '../rk4.service';
import { crearDibujoEdo } from '../../../../shared/edo.grafico';
import { rangoYDe } from '../../../../shared/edo';
import { BloqueEjemploEdo } from '../../../../shared/bloque-ejemplo-edo/bloque-ejemplo-edo';

/** EJEMPLOS DE RK4. */
@Component({
  selector: 'app-rk4-ejemplos',
  standalone: true,
  imports: [BloqueEjemploEdo],
  templateUrl: './rk4-ejemplos.html',
  styleUrl: '../../../../shared/estilos/lista.scss',
})
export class Rk4Ejemplos {
  private readonly servicio = inject(Rk4Service);

  readonly ejemplos = EJEMPLOS_RK4;
  readonly columnas = COLUMNAS_RK4;

  private readonly estados = this.ejemplos.map((e) => this.servicio.calcularEjemplo(e));
  private readonly exactas = this.ejemplos.map((e) => this.servicio.exactaDe(e.calculo));
  private readonly rangos = this.ejemplos.map((e) => this.servicio.rangoPara(e.calculo));
  private readonly rangosY = this.estados.map((estado, i) => rangoYDe(estado.filas, this.exactas[i]));
  private readonly dibujos = this.ejemplos.map(() => crearDibujoEdo());

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
