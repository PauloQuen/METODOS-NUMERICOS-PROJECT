import { Component, computed, inject, signal } from '@angular/core';
import { EJEMPLOS_REGLA_FALSA } from '../regla-falsa.contenido';
import { COLUMNAS_REGLA_FALSA } from '../regla-falsa.config';
import { ReglaFalsaService } from '../regla-falsa.service';
import { BloqueEjemplo } from '../../../../../../shared/domain/bloque-ejemplo/bloque-ejemplo';
import { dibujarReglaFalsa } from '../regla-falsa.grafico';

@Component({
  selector: 'app-regla-falsa-ejemplos',
  standalone: true,
  imports: [BloqueEjemplo],
  templateUrl: './regla-falsa-ejemplos.html',
  styleUrl: './regla-falsa-ejemplos.scss',
})
export class ReglaFalsaEjemplos {
  readonly ejemplos = EJEMPLOS_REGLA_FALSA;
  readonly columnas = COLUMNAS_REGLA_FALSA;
  readonly dibujar = dibujarReglaFalsa;

  private readonly servicio = inject(ReglaFalsaService);

  protected readonly estados = signal(
    this.ejemplos.map((e) => this.servicio.calcularEjemplo(e)),
  );

  protected readonly funciones = this.ejemplos.map((e) => this.servicio.funcionDeEjemplo(e));

  protected readonly rangos = computed(() =>
    this.ejemplos.map((e) => this.servicio.rangoPara(e.calculo)),
  );
}
