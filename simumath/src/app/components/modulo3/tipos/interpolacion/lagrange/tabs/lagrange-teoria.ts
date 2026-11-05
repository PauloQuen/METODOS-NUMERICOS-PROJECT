import { Component, inject } from '@angular/core';
import { TEORIA_LAGRANGE } from '../lagrange.contenido';
import { COLUMNAS_LAGRANGE } from '../lagrange.config';
import { LagrangeService } from '../lagrange.service';
import { crearDibujoLagrange } from '../lagrange.grafico';
import { BloqueEjemploDatos } from '../../../../shared/bloque-ejemplo-datos/bloque-ejemplo-datos';
import { TeoriaContenido } from '../../../../../../shared/domain/teoria-contenido/teoria-contenido';

/**
 * PESTAÑA DE TEORÍA de Lagrange.
 *
 * La estructura es la del Módulo 1, adaptada a un método que no itera:
 *   1. Concepto
 *   2. Fundamento (por qué existe y es único el polinomio)
 *   3. Cuándo falla
 *   4. Precisión
 *   5. Recursos de internet (videos y lecturas) — la teoría no se repite
 *   6. La tarjeta del método: fórmula, pasos, criterios, ventajas, límites
 *   7. Un ejemplo numérico y uno de casuística, con tabla y gráfico
 *
 * El ejemplo se CALCULA con el algoritmo; no hay números copiados a mano.
 */
@Component({
  selector: 'app-lagrange-teoria',
  standalone: true,
  imports: [BloqueEjemploDatos, TeoriaContenido],
  templateUrl: './lagrange-teoria.html',
})
export class LagrangeTeoria {
  /** La teoría completa. */
  readonly teoria = TEORIA_LAGRANGE;

  /** Las columnas de la tabla de aportes. */
  readonly columnas = COLUMNAS_LAGRANGE;

  private readonly servicio = inject(LagrangeService);

  /** El ejemplo numérico, ya calculado. */
  readonly estadoNormal = this.servicio.calcularEjemplo(TEORIA_LAGRANGE.ejemploNormal);
  /** El ejemplo de casuística, ya calculado. */
  readonly estadoCasuistica = this.servicio.calcularEjemplo(TEORIA_LAGRANGE.ejemploCasuistica);

  /** Las curvas para el gráfico (el polinomio interpolante). */
  protected readonly funcionNormal = this.servicio.polinomioDe(TEORIA_LAGRANGE.ejemploNormal.calculo);
  protected readonly funcionCasuistica = this.servicio.polinomioDe(
    TEORIA_LAGRANGE.ejemploCasuistica.calculo,
  );

  /** Los rangos del eje x, ajustados a cada tabla. */
  protected readonly rangoNormal = this.servicio.rangoPara(TEORIA_LAGRANGE.ejemploNormal.calculo);
  protected readonly rangoCasuistica = this.servicio.rangoPara(
    TEORIA_LAGRANGE.ejemploCasuistica.calculo,
  );

  /** Los dibujos, con el punto de estimación capturado. */
  protected readonly dibujoNormal = crearDibujoLagrange({
    evaluarEn: TEORIA_LAGRANGE.ejemploNormal.calculo.evaluarEn,
    valor: this.estadoNormal.valor,
  });
  protected readonly dibujoCasuistica = crearDibujoLagrange({
    evaluarEn: TEORIA_LAGRANGE.ejemploCasuistica.calculo.evaluarEn,
    valor: this.estadoCasuistica.valor,
  });

}
