import { Component, computed, inject, signal } from '@angular/core';
import { EJEMPLOS_PUNTO_FIJO } from '../punto-fijo.contenido';
import { COLUMNAS_PUNTO_FIJO } from '../punto-fijo.config';
import { PuntoFijoService } from '../punto-fijo.service';
import { BloqueEjemplo } from '../../../../../../shared/domain/bloque-ejemplo/bloque-ejemplo';
import { dibujarPuntoFijo } from '../punto-fijo.grafico';

@Component({
  selector: 'app-punto-fijo-ejemplos',
  standalone: true,
  imports: [BloqueEjemplo],
  templateUrl: './punto-fijo-ejemplos.html',
  styleUrl: './punto-fijo-ejemplos.scss',
})
export class PuntoFijoEjemplos {
  readonly ejemplos = EJEMPLOS_PUNTO_FIJO;
  readonly columnas = COLUMNAS_PUNTO_FIJO;
  readonly dibujar = dibujarPuntoFijo;

  private readonly servicio = inject(PuntoFijoService);

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