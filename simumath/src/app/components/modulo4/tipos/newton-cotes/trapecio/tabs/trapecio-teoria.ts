import { Component, inject } from '@angular/core';
import { TEORIA_TRAPECIO } from '../trapecio.contenido';
import { COLUMNAS_TRAPECIO } from '../trapecio.config';
import { TrapecioService } from '../trapecio.service';
import { crearDibujoTrapecio } from '../trapecio.grafico';
import { BloqueEjemploIntegracion } from '../../../../shared/bloque-ejemplo-integracion/bloque-ejemplo-integracion';
import { TeoriaContenido } from '../../../../../../shared/domain/teoria-contenido/teoria-contenido';

/**
 * PESTAÑA DE TEORÍA del trapecio.
 *
 * El marco (`app-teoria-contenido`) trae concepto, las tres ideas, los
 * recursos, la fórmula, los pasos, ventajas y límites. Acá se proyectan
 * los dos ejemplos, cada uno con su tabla, su área y su error calculados
 * por el mismo algoritmo que usa la calculadora.
 */
@Component({
  selector: 'app-trapecio-teoria',
  standalone: true,
  imports: [BloqueEjemploIntegracion, TeoriaContenido],
  templateUrl: './trapecio-teoria.html',
})
export class TrapecioTeoria {
  readonly teoria = TEORIA_TRAPECIO;
  readonly columnas = COLUMNAS_TRAPECIO;

  private readonly servicio = inject(TrapecioService);

  readonly estadoNormal = this.servicio.calcularEjemplo(TEORIA_TRAPECIO.ejemploNormal);
  readonly estadoCasuistica = this.servicio.calcularEjemplo(TEORIA_TRAPECIO.ejemploCasuistica);

  protected readonly funcionNormal = this.servicio.funcionDe(
    TEORIA_TRAPECIO.ejemploNormal.calculo,
  );
  protected readonly funcionCasuistica = this.servicio.funcionDe(
    TEORIA_TRAPECIO.ejemploCasuistica.calculo,
  );

  protected readonly rangoNormal = this.servicio.rangoPara(TEORIA_TRAPECIO.ejemploNormal.calculo);
  protected readonly rangoCasuistica = this.servicio.rangoPara(
    TEORIA_TRAPECIO.ejemploCasuistica.calculo,
  );

  protected readonly dibujoNormal = crearDibujoTrapecio();
  protected readonly dibujoCasuistica = crearDibujoTrapecio();
}
