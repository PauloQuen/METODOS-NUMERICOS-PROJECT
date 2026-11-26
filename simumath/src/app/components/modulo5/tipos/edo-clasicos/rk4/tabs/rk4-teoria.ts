import { Component, inject } from '@angular/core';
import { TEORIA_RK4 } from '../rk4.contenido';
import { COLUMNAS_RK4 } from '../rk4.config';
import { Rk4Service } from '../rk4.service';
import { crearDibujoEdo } from '../../../../shared/edo.grafico';
import { rangoYDe } from '../../../../shared/edo';
import { BloqueEjemploEdo } from '../../../../shared/bloque-ejemplo-edo/bloque-ejemplo-edo';
import { TeoriaContenido } from '../../../../../../shared/domain/teoria-contenido/teoria-contenido';

/** TEORÍA DE RK4 con los dos ejemplos calculados por el motor. */
@Component({
  selector: 'app-rk4-teoria',
  standalone: true,
  imports: [BloqueEjemploEdo, TeoriaContenido],
  templateUrl: './rk4-teoria.html',
})
export class Rk4Teoria {
  readonly teoria = TEORIA_RK4;
  readonly columnas = COLUMNAS_RK4;

  private readonly servicio = inject(Rk4Service);

  readonly estadoNormal = this.servicio.calcularEjemplo(TEORIA_RK4.ejemploNormal);
  readonly estadoCasuistica = this.servicio.calcularEjemplo(TEORIA_RK4.ejemploCasuistica);

  protected readonly exactaNormal = this.servicio.exactaDe(TEORIA_RK4.ejemploNormal.calculo);
  protected readonly exactaCasuistica = this.servicio.exactaDe(TEORIA_RK4.ejemploCasuistica.calculo);

  protected readonly rangoNormal = this.servicio.rangoPara(TEORIA_RK4.ejemploNormal.calculo);
  protected readonly rangoCasuistica = this.servicio.rangoPara(TEORIA_RK4.ejemploCasuistica.calculo);

  protected readonly rangoYNormal = rangoYDe(this.estadoNormal.filas, this.exactaNormal);
  protected readonly rangoYCasuistica = rangoYDe(this.estadoCasuistica.filas, this.exactaCasuistica);

  protected readonly dibujo = crearDibujoEdo();
}
