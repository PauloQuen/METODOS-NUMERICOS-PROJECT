import { Component, computed, inject, signal } from '@angular/core';
import { EJEMPLOS_CARDANO } from '../cardano.contenido';
import { COLUMNAS_CARDANO } from '../cardano.config';
import { CardanoService } from '../cardano.service';
import { BloqueEjemplo } from '../../../../../../shared/domain/bloque-ejemplo/bloque-ejemplo';
import { dibujarCardano } from '../cardano.grafico';

@Component({
  selector: 'app-cardano-ejemplos',
  standalone: true,
  imports: [BloqueEjemplo],
  templateUrl: './cardano-ejemplos.html',
  styleUrl: './cardano-ejemplos.scss',
})
export class CardanoEjemplos {
  readonly ejemplos = EJEMPLOS_CARDANO;
  readonly columnas = COLUMNAS_CARDANO;
  readonly dibujar = dibujarCardano;

  private readonly servicio = inject(CardanoService);

  protected readonly estados = signal(this.ejemplos.map((e) => this.servicio.calcularEjemplo(e)));

  protected readonly funciones = this.ejemplos.map((e) => this.servicio.funcionDeEjemplo(e));

  protected readonly rangos = computed(() =>
    this.ejemplos.map((e, i) => this.servicio.rangoPara(this.estados()[i].raices)),
  );
}
