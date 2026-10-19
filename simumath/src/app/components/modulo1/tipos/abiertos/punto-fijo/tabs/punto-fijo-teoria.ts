import { Component, computed, inject, signal } from '@angular/core';
import { TEORIA_PUNTO_FIJO } from '../punto-fijo.contenido';
import { COLUMNAS_PUNTO_FIJO } from '../punto-fijo.config';
import { PuntoFijoService } from '../punto-fijo.service';
import { UiCard } from '../../../../../../shared/ui/ui-card/ui-card';
import { BloqueEjemplo } from '../../../../../../shared/domain/bloque-ejemplo/bloque-ejemplo';
import { dibujarPuntoFijo } from '../punto-fijo.grafico';

@Component({
  selector: 'app-punto-fijo-teoria',
  standalone: true,
  imports: [UiCard, BloqueEjemplo],
  templateUrl: './punto-fijo-teoria.html',
  styleUrl: './punto-fijo-teoria.scss',
})
export class PuntoFijoTeoria {
  readonly teoria = TEORIA_PUNTO_FIJO;
  readonly columnas = COLUMNAS_PUNTO_FIJO;
  readonly dibujar = dibujarPuntoFijo;

  private readonly servicio = inject(PuntoFijoService);

  readonly ejemploNumerico = signal(
    this.servicio.calcularEjemplo(TEORIA_PUNTO_FIJO.ejemploNormal),
  );

  readonly ejemploCasuistica = signal(
    this.servicio.calcularEjemplo(TEORIA_PUNTO_FIJO.ejemploCasuistica),
  );

  protected readonly funcionNumerico = this.servicio.funcionDeEjemplo(
    TEORIA_PUNTO_FIJO.ejemploNormal,
  );

  protected readonly funcionCasuistica = this.servicio.funcionDeEjemplo(
    TEORIA_PUNTO_FIJO.ejemploCasuistica,
  );

  protected readonly rangoNumerico = computed(() =>
    this.servicio.rangoPara(
      TEORIA_PUNTO_FIJO.ejemploNormal.calculo,
      this.ejemploNumerico().raiz,
    ),
  );

  protected readonly rangoCasuistica = computed(() =>
    this.servicio.rangoPara(
      TEORIA_PUNTO_FIJO.ejemploCasuistica.calculo,
      this.ejemploCasuistica().raiz,
    ),
  );

  protected readonly abierta = signal<'fundamento' | 'falla' | 'orden' | null>(null);

  protected alternar(que: 'fundamento' | 'falla' | 'orden'): void {
    this.abierta.update((actual) => (actual === que ? null : que));
  }
}