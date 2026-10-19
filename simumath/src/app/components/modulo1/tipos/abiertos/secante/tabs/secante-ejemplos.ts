import { Component, computed, inject, signal } from '@angular/core';
import { EJEMPLOS_SECANTE } from '../secante.contenido';
import { COLUMNAS_SECANTE } from '../secante.config';
import { SecanteService } from '../secante.service';
import { BloqueEjemplo } from '../../../../../../shared/domain/bloque-ejemplo/bloque-ejemplo';
import { dibujarSecante } from '../secante.grafico';

@Component({
  selector: 'app-secante-ejemplos',
  standalone: true,
  imports: [BloqueEjemplo],
  templateUrl: './secante-ejemplos.html',
  styleUrl: './secante-ejemplos.scss',
})
export class SecanteEjemplos {
  readonly ejemplos = EJEMPLOS_SECANTE;
  readonly columnas = COLUMNAS_SECANTE;
  readonly dibujar = dibujarSecante;

  private readonly servicio = inject(SecanteService);

  protected readonly estados = signal(
    this.ejemplos.map((e) => this.servicio.calcularEjemplo(e)),
  );

  protected readonly funciones = this.ejemplos.map((e) =>
    this.servicio.funcionDeEjemplo(e),
  );

  protected readonly rangos = computed(() =>
    this.ejemplos.map((e, i) =>
      this.servicio.rangoPara(e.calculo, this.estados()[i].raiz),
    ),
  );
}
