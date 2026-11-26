import { Component, inject } from '@angular/core';
import { TEORIA_EULER } from '../euler.contenido';
import { COLUMNAS_EULER } from '../euler.config';
import { EulerService } from '../euler.service';
import { crearDibujoEdo } from '../../../../shared/edo.grafico';
import { rangoYDe } from '../../../../shared/edo';
import { BloqueEjemploEdo } from '../../../../shared/bloque-ejemplo-edo/bloque-ejemplo-edo';
import { TeoriaContenido } from '../../../../../../shared/domain/teoria-contenido/teoria-contenido';

/**
 * TEORÍA DE EULER. El marco compartido trae concepto, las tres ideas,
 * recursos, fórmula y tarjeta del método. Acá se proyectan los dos
 * ejemplos, calculados con el mismo motor que la calculadora.
 */
@Component({
  selector: 'app-euler-teoria',
  standalone: true,
  imports: [BloqueEjemploEdo, TeoriaContenido],
  templateUrl: './euler-teoria.html',
})
export class EulerTeoria {
  readonly teoria = TEORIA_EULER;
  readonly columnas = COLUMNAS_EULER;

  private readonly servicio = inject(EulerService);

  readonly estadoNormal = this.servicio.calcularEjemplo(TEORIA_EULER.ejemploNormal);
  readonly estadoCasuistica = this.servicio.calcularEjemplo(TEORIA_EULER.ejemploCasuistica);

  protected readonly exactaNormal = this.servicio.exactaDe(TEORIA_EULER.ejemploNormal.calculo);
  protected readonly exactaCasuistica = this.servicio.exactaDe(
    TEORIA_EULER.ejemploCasuistica.calculo,
  );

  protected readonly rangoNormal = this.servicio.rangoPara(TEORIA_EULER.ejemploNormal.calculo);
  protected readonly rangoCasuistica = this.servicio.rangoPara(TEORIA_EULER.ejemploCasuistica.calculo);

  protected readonly rangoYNormal = rangoYDe(this.estadoNormal.filas, this.exactaNormal);
  protected readonly rangoYCasuistica = rangoYDe(this.estadoCasuistica.filas, this.exactaCasuistica);

  protected readonly dibujo = crearDibujoEdo();
}
