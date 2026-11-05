import { Component, computed, inject, signal } from '@angular/core';
import { TEORIA_CARDANO } from '../cardano.contenido';
import { COLUMNAS_CARDANO } from '../cardano.config';
import { CardanoService } from '../cardano.service';
import { BloqueEjemplo } from '../../../../../../shared/domain/bloque-ejemplo/bloque-ejemplo';
import { TeoriaContenido } from '../../../../../../shared/domain/teoria-contenido/teoria-contenido';
import { dibujarCardano } from '../cardano.grafico';

@Component({
  selector: 'app-cardano-teoria',
  standalone: true,
  imports: [BloqueEjemplo, TeoriaContenido],
  templateUrl: './cardano-teoria.html',
  styleUrl: './cardano-teoria.scss',
})
export class CardanoTeoria {
  readonly teoria = TEORIA_CARDANO;
  readonly columnas = COLUMNAS_CARDANO;
  readonly dibujar = dibujarCardano;

  private readonly servicio = inject(CardanoService);

  readonly ejemploNumerico = signal(this.servicio.calcularEjemplo(TEORIA_CARDANO.ejemploNormal));

  readonly ejemploCasuistica = signal(
    this.servicio.calcularEjemplo(TEORIA_CARDANO.ejemploCasuistica),
  );

  protected readonly funcionNumerico = this.servicio.funcionDeEjemplo(TEORIA_CARDANO.ejemploNormal);

  protected readonly funcionCasuistica = this.servicio.funcionDeEjemplo(
    TEORIA_CARDANO.ejemploCasuistica,
  );

  protected readonly rangoNumerico = computed(() =>
    this.servicio.rangoPara(this.ejemploNumerico().raices),
  );

  protected readonly rangoCasuistica = computed(() =>
    this.servicio.rangoPara(this.ejemploCasuistica().raices),
  );

  protected readonly abierta = signal<'fundamento' | 'falla' | 'orden' | null>(null);

  protected alternar(que: 'fundamento' | 'falla' | 'orden'): void {
    this.abierta.update((actual) => (actual === que ? null : que));
  }
}
