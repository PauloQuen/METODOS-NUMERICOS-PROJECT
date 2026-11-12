import { Component, computed, inject, signal } from '@angular/core';
import { EJERCICIOS_SECANTE } from '../secante.contenido';
import { COLUMNAS_SECANTE } from '../secante.config';
import { SecanteService } from '../secante.service';
import { BloqueEjercicio } from '../../../../../../shared/domain/bloque-ejercicio/bloque-ejercicio';
import { autoevaluacionMejoradaM1, politicaDeMetodoM1 } from '../../../../autoevaluacion.config';
import { AUTOEVALUACION_SECANTE } from '../secante.autoevaluacion';
import { dibujarSecante } from '../secante.grafico';

@Component({
  selector: 'app-secante-autoevaluacion',
  standalone: true,
  imports: [BloqueEjercicio],
  templateUrl: './secante-autoevaluacion.html',
  styleUrl: './secante-autoevaluacion.scss',
})
export class SecanteAutoevaluacion {
  readonly ejercicios = EJERCICIOS_SECANTE.map((e) => ({
    ...e,
    ...(AUTOEVALUACION_SECANTE[e.id] ?? {}),
  }));

  readonly mejorada = autoevaluacionMejoradaM1('abiertos', 'secante');
  readonly desbloqueoBase = politicaDeMetodoM1('abiertos', 'secante');
  readonly columnas = COLUMNAS_SECANTE;
  readonly dibujar = dibujarSecante;

  private readonly servicio = inject(SecanteService);

  protected readonly estados = signal(
    this.ejercicios.map((e) => this.servicio.calcularEjemplo(e)),
  );

  protected readonly funciones = this.ejercicios.map((e) =>
    this.servicio.funcionDeEjemplo(e),
  );

  protected readonly rangos = computed(() =>
    this.ejercicios.map((e, i) =>
      this.servicio.rangoPara(e.calculo, this.estados()[i].raiz),
    ),
  );
}
