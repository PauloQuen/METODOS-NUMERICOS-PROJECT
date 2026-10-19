import { Component, computed, inject, signal } from '@angular/core';
import { TEORIA_SECANTE } from '../secante.contenido';
import { COLUMNAS_SECANTE } from '../secante.config';
import { SecanteService } from '../secante.service';
import { UiCard } from '../../../../../../shared/ui/ui-card/ui-card';
import { BloqueEjemplo } from '../../../../../../shared/domain/bloque-ejemplo/bloque-ejemplo';
import { dibujarSecante } from '../secante.grafico';

@Component({
  selector: 'app-secante-teoria',
  standalone: true,
  imports: [UiCard, BloqueEjemplo],
  templateUrl: './secante-teoria.html',
  styleUrl: './secante-teoria.scss',
})
export class SecanteTeoria {
  readonly teoria = TEORIA_SECANTE;
  readonly columnas = COLUMNAS_SECANTE;
  readonly dibujar = dibujarSecante;

  private readonly servicio = inject(SecanteService);

  readonly ejemploNumerico = signal(
    this.servicio.calcularEjemplo(TEORIA_SECANTE.ejemploNormal),
  );

  readonly ejemploCasuistica = signal(
    this.servicio.calcularEjemplo(TEORIA_SECANTE.ejemploCasuistica),
  );

  protected readonly funcionNumerico = this.servicio.funcionDeEjemplo(
    TEORIA_SECANTE.ejemploNormal,
  );

  protected readonly funcionCasuistica = this.servicio.funcionDeEjemplo(
    TEORIA_SECANTE.ejemploCasuistica,
  );

  protected readonly rangoNumerico = computed(() =>
    this.servicio.rangoPara(
      TEORIA_SECANTE.ejemploNormal.calculo,
      this.ejemploNumerico().raiz,
    ),
  );

  protected readonly rangoCasuistica = computed(() =>
    this.servicio.rangoPara(
      TEORIA_SECANTE.ejemploCasuistica.calculo,
      this.ejemploCasuistica().raiz,
    ),
  );

  protected readonly abierta = signal<'fundamento' | 'falla' | 'orden' | null>(null);

  protected alternar(que: 'fundamento' | 'falla' | 'orden'): void {
    this.abierta.update((actual) => (actual === que ? null : que));
  }
}
