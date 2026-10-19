import { Component, computed, inject, signal } from '@angular/core';
import { EJERCICIOS_REGLA_FALSA } from '../regla-falsa.contenido';
import { COLUMNAS_REGLA_FALSA } from '../regla-falsa.config';
import { ReglaFalsaService } from '../regla-falsa.service';
import { BloqueEjercicio } from '../../../../../../shared/domain/bloque-ejercicio/bloque-ejercicio';
import { dibujarReglaFalsa } from '../regla-falsa.grafico';

@Component({
  selector: 'app-regla-falsa-autoevaluacion',
  standalone: true,
  imports: [BloqueEjercicio],
  templateUrl: './regla-falsa-autoevaluacion.html',
  styleUrl: './regla-falsa-autoevaluacion.scss',
})
export class ReglaFalsaAutoevaluacion {
  readonly ejercicios = EJERCICIOS_REGLA_FALSA;
  readonly columnas = COLUMNAS_REGLA_FALSA;
  readonly dibujar = dibujarReglaFalsa;

  private readonly servicio = inject(ReglaFalsaService);

  protected readonly estados = signal(
    this.ejercicios.map((e) => this.servicio.calcularEjemplo(e)),
  );

  protected readonly funciones = this.ejercicios.map((e) => this.servicio.funcionDeEjemplo(e));

  protected readonly rangos = computed(() =>
    this.ejercicios.map((e) => this.servicio.rangoPara(e.calculo)),
  );
}
