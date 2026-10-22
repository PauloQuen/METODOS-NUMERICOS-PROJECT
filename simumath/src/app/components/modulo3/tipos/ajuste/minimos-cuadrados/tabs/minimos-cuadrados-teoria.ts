import { Component, inject, signal } from '@angular/core';
import { TEORIA_MINIMOS_CUADRADOS } from '../minimos-cuadrados.contenido';
import { COLUMNAS_MINIMOS_CUADRADOS } from '../minimos-cuadrados.config';
import { MinimosCuadradosService } from '../minimos-cuadrados.service';
import { crearDibujoMinimosCuadrados } from '../minimos-cuadrados.grafico';
import { UiCard } from '../../../../../../shared/ui/ui-card/ui-card';
import { BloqueEjemploDatos } from '../../../../shared/bloque-ejemplo-datos/bloque-ejemplo-datos';

/**
 * PESTAÑA DE TEORÍA de Mínimos Cuadrados.
 *
 * Misma estructura que la teoría de Lagrange, con lo propio de este
 * método: la deducción por mínimos (ecuaciones normales), las fórmulas
 * de a₀ y a₁, y los tres criterios de bondad (r, r², error estándar).
 */
@Component({
  selector: 'app-minimos-cuadrados-teoria',
  standalone: true,
  imports: [UiCard, BloqueEjemploDatos],
  templateUrl: './minimos-cuadrados-teoria.html',
  styleUrl: '../../../../shared/estilos/teoria.scss',
})
export class MinimosCuadradosTeoria {
  readonly teoria = TEORIA_MINIMOS_CUADRADOS;
  readonly columnas = COLUMNAS_MINIMOS_CUADRADOS;

  private readonly servicio = inject(MinimosCuadradosService);

  readonly estadoNormal = this.servicio.calcularEjemplo(TEORIA_MINIMOS_CUADRADOS.ejemploNormal);
  readonly estadoCasuistica = this.servicio.calcularEjemplo(
    TEORIA_MINIMOS_CUADRADOS.ejemploCasuistica,
  );

  protected readonly funcionNormal = this.servicio.rectaDe(
    TEORIA_MINIMOS_CUADRADOS.ejemploNormal.calculo,
  );
  protected readonly funcionCasuistica = this.servicio.rectaDe(
    TEORIA_MINIMOS_CUADRADOS.ejemploCasuistica.calculo,
  );

  protected readonly rangoNormal = this.servicio.rangoPara(
    TEORIA_MINIMOS_CUADRADOS.ejemploNormal.calculo,
  );
  protected readonly rangoCasuistica = this.servicio.rangoPara(
    TEORIA_MINIMOS_CUADRADOS.ejemploCasuistica.calculo,
  );

  protected readonly dibujoNormal = crearDibujoMinimosCuadrados({
    evaluarEn: TEORIA_MINIMOS_CUADRADOS.ejemploNormal.calculo.evaluarEn,
    prediccion: this.estadoNormal.prediccion,
  });
  protected readonly dibujoCasuistica = crearDibujoMinimosCuadrados({
    evaluarEn: TEORIA_MINIMOS_CUADRADOS.ejemploCasuistica.calculo.evaluarEn,
    prediccion: this.estadoCasuistica.prediccion,
  });

  protected readonly abierta = signal<'fundamento' | 'falla' | 'precision' | null>(null);

  protected alternar(que: 'fundamento' | 'falla' | 'precision'): void {
    this.abierta.update((actual) => (actual === que ? null : que));
  }

  protected iconoRecurso(tipo: string): string {
    switch (tipo) {
      case 'video':
        return 'play_circle';
      case 'interactivo':
        return 'touch_app';
      default:
        return 'article';
    }
  }
}
