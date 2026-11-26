import { Component, inject } from '@angular/core';
import { EJEMPLOS_EULER } from '../euler.contenido';
import { COLUMNAS_EULER } from '../euler.config';
import { EulerService } from '../euler.service';
import { crearDibujoEdo } from '../../../../shared/edo.grafico';
import { rangoYDe } from '../../../../shared/edo';
import { BloqueEjemploEdo } from '../../../../shared/bloque-ejemplo-edo/bloque-ejemplo-edo';

/** EJEMPLOS DE EULER: dos numéricos y dos casuísticas, calculados al construir. */
@Component({
  selector: 'app-euler-ejemplos',
  standalone: true,
  imports: [BloqueEjemploEdo],
  templateUrl: './euler-ejemplos.html',
  styleUrl: '../../../../shared/estilos/lista.scss',
})
export class EulerEjemplos {
  private readonly servicio = inject(EulerService);

  readonly ejemplos = EJEMPLOS_EULER;
  readonly columnas = COLUMNAS_EULER;

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
