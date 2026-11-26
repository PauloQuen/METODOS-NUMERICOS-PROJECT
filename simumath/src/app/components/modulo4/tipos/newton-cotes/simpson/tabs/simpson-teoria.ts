import { Component, inject } from '@angular/core';
import { TEORIA_SIMPSON } from '../simpson.contenido';
import { COLUMNAS_SIMPSON } from '../simpson.config';
import { SimpsonService } from '../simpson.service';
import { crearDibujoSimpson } from '../simpson.grafico';
import { BloqueEjemploIntegracion } from '../../../../shared/bloque-ejemplo-integracion/bloque-ejemplo-integracion';
import { TeoriaContenido } from '../../../../../../shared/domain/teoria-contenido/teoria-contenido';

/**
 * PESTAÑA DE TEORÍA de Simpson.
 *
 * El marco común trae concepto, las tres ideas, recursos, fórmula,
 * pasos, ventajas y límites. Acá se proyectan los dos ejemplos, cada uno
 * con su tabla 1-4-2-…-1, sus parábolas y su error calculados por el
 * mismo algoritmo que usa la calculadora.
 */
@Component({
  selector: 'app-simpson-teoria',
  standalone: true,
  imports: [BloqueEjemploIntegracion, TeoriaContenido],
  templateUrl: './simpson-teoria.html',
})
export class SimpsonTeoria {
  readonly teoria = TEORIA_SIMPSON;
  readonly columnas = COLUMNAS_SIMPSON;

  private readonly servicio = inject(SimpsonService);

  readonly estadoNormal = this.servicio.calcularEjemplo(TEORIA_SIMPSON.ejemploNormal);
  readonly estadoCasuistica = this.servicio.calcularEjemplo(TEORIA_SIMPSON.ejemploCasuistica);

  protected readonly funcionNormal = this.servicio.funcionDe(TEORIA_SIMPSON.ejemploNormal.calculo);
  protected readonly funcionCasuistica = this.servicio.funcionDe(
    TEORIA_SIMPSON.ejemploCasuistica.calculo,
  );

  protected readonly rangoNormal = this.servicio.rangoPara(TEORIA_SIMPSON.ejemploNormal.calculo);
  protected readonly rangoCasuistica = this.servicio.rangoPara(
    TEORIA_SIMPSON.ejemploCasuistica.calculo,
  );

  protected readonly dibujoNormal = crearDibujoSimpson();
  protected readonly dibujoCasuistica = crearDibujoSimpson();
}
